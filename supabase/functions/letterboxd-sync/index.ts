// ==============================================================================
// Supabase Edge Function: letterboxd-sync
// Sincronização periódica do RSS do Letterboxd de cada membro do clube.
// Busca https://letterboxd.com/{usuario}/rss/ sem scraping de HTML.
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

/**
 * Remove tags HTML e extrai o texto da crítica limpo.
 * Se o texto for apenas "Watched on ...", considera como sem crítica.
 */
function cleanDescription(html: string): string | null {
  if (!html) return null;

  // Remove blocos de CDATA se houver
  let text = html.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");

  // Remove parágrafos com imagem de pôster do Letterboxd
  text = text.replace(/<p>\s*<img[^>]*>\s*<\/p>/gi, "");

  // Converte quebras e parágrafos em quebras de linha
  text = text.replace(/<\/p>/gi, "\n").replace(/<br\s*\/?>/gi, "\n");

  // Remove todas as demais tags HTML
  text = text.replace(/<[^>]+>/g, "");

  // Decodifica entidades HTML básicas
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Separa linhas e remove a assinatura padrão "Watched on [Date]"
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^Watched on\s+/i.test(l));

  const cleaned = lines.join("\n\n").trim();
  if (!cleaned) return null;

  // Limite de segurança do banco (5000 caracteres)
  return cleaned.length > 5000 ? cleaned.substring(0, 5000) : cleaned;
}

/**
 * Extrai o conteúdo de uma tag XML simples
 */
function getXmlTag(xml: string, tag: string): string | null {
  // Suporta tags normais e com namespace (ex: tmdb:movieId ou letterboxd:filmTitle)
  const escapedTag = tag.replace(":", "\\:");
  const regex = new RegExp(
    `<(?:${escapedTag})>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/(?:${escapedTag})>`,
    "i"
  );
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: "Credenciais internas do Supabase não configuradas." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Busca todos os membros com usuário do Letterboxd cadastrado
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name, letterboxd_username")
      .not("letterboxd_username", "is", null);

    if (profilesError) {
      throw new Error(`Erro ao buscar perfis: ${profilesError.message}`);
    }

    // 2. Busca lista de tmdb_ids autorizados (apenas filmes presentes em cycles ou suggestions)
    const { data: cycleMovies } = await supabase.from("cycles").select("tmdb_id");
    const { data: suggestionMovies } = await supabase.from("suggestions").select("tmdb_id");

    const allowedTmdbIds = new Set<number>();
    (cycleMovies || []).forEach((c) => allowedTmdbIds.add(c.tmdb_id));
    (suggestionMovies || []).forEach((s) => allowedTmdbIds.add(s.tmdb_id));

    let totalSynced = 0;
    const summary: Array<{ user: string; synced: number; error?: string }> = [];

    // 3. Itera sobre cada perfil e consome o feed RSS oficial
    for (const profile of profiles || []) {
      const username = profile.letterboxd_username?.trim();
      if (!username) continue;

      const rssUrl = `https://letterboxd.com/${encodeURIComponent(username)}/rss/`;
      let userSyncedCount = 0;

      try {
        const res = await fetch(rssUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; ClubeDoLivroBot/1.0; +https://clubedolivro.local)",
            Accept: "application/rss+xml, application/xml, text/xml",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: perfil privado ou inexistente no Letterboxd.`);
        }

        const xmlText = await res.text();

        // Extrai todos os blocos <item>
        const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/gi) || [];

        for (const itemXml of itemMatches) {
          // Extrai tmdb:movieId
          const tmdbIdStr =
            getXmlTag(itemXml, "tmdb:movieId") || getXmlTag(itemXml, "tmdb\\:movieId");
          if (!tmdbIdStr) continue;

          const tmdbId = parseInt(tmdbIdStr, 10);
          if (isNaN(tmdbId)) continue;

          // REGRA DE OURO: só grava filmes que existam em cycles ou suggestions
          if (!allowedTmdbIds.has(tmdbId)) {
            continue;
          }

          // Extrai nota (letterboxd:memberRating: 0.5 a 5.0)
          const ratingStr =
            getXmlTag(itemXml, "letterboxd:memberRating") ||
            getXmlTag(itemXml, "letterboxd\\:memberRating");
          const rating = ratingStr ? parseFloat(ratingStr) : null;

          // Extrai data assistida (letterboxd:watchedDate: YYYY-MM-DD)
          const watchedDate =
            getXmlTag(itemXml, "letterboxd:watchedDate") ||
            getXmlTag(itemXml, "letterboxd\\:watchedDate") ||
            null;

          // Extrai link da crítica individual
          const letterboxdUrl = getXmlTag(itemXml, "link");

          // Extrai e sanitiza o texto da crítica
          const rawDescription = getXmlTag(itemXml, "description") || "";
          const reviewText = cleanDescription(rawDescription);

          // Verifica se já existe crítica manual para este usuário e filme
          const { data: existingReview } = await supabase
            .from("reviews")
            .select("id, source")
            .eq("user_id", profile.id)
            .eq("tmdb_id", tmdbId)
            .maybeSingle();

          // Se já existir e foi criada manualmente, NUNCA sobrescreve
          if (existingReview?.source === "manual") {
            continue;
          }

          // Salva ou atualiza a review como source='rss'
          const { error: upsertErr } = await supabase.from("reviews").upsert(
            {
              tmdb_id: tmdbId,
              user_id: profile.id,
              rating: rating,
              review_text: reviewText,
              letterboxd_url: letterboxdUrl,
              watched_date: watchedDate,
              source: "rss",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,tmdb_id" }
          );

          if (!upsertErr) {
            userSyncedCount++;
            totalSynced++;
          }
        }

        // Registra log de sucesso no sync_log
        await supabase.from("sync_log").insert({
          user_id: profile.id,
          status: "success",
          message: `Sincronização concluída para ${profile.display_name} (@${username}): ${userSyncedCount} avaliações sincronizadas.`,
        });

        summary.push({ user: profile.display_name, synced: userSyncedCount });
      } catch (err: any) {
        console.error(`Erro ao sincronizar Letterboxd para ${profile.display_name}:`, err);

        // Registra log de falha individual sem interromper os demais membros
        await supabase.from("sync_log").insert({
          user_id: profile.id,
          status: "error",
          message: `Falha ao sincronizar @${username}: ${err.message}`,
        });

        summary.push({ user: profile.display_name, synced: 0, error: err.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        ran_at: new Date().toISOString(),
        total_synced: totalSynced,
        summary,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (globalErr: any) {
    console.error("Erro global na Edge Function letterboxd-sync:", globalErr);

    await supabase.from("sync_log").insert({
      user_id: null,
      status: "error",
      message: `Erro fatal no processo de sincronização: ${globalErr.message}`,
    });

    return new Response(
      JSON.stringify({ error: globalErr.message || "Erro interno de sincronização." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
