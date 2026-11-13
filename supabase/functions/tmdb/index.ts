// ==============================================================================
// Supabase Edge Function: tmdb
// Integração segura com a API do TMDB (The Movie Database)
// A chave TMDB_API_KEY fica exclusivamente nos secrets do servidor Supabase.
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface TMDBProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

interface TMDBWatchProviders {
  link?: string;
  flatrate?: TMDBProvider[];
  rent?: TMDBProvider[];
  buy?: TMDBProvider[];
}

serve(async (req: Request) => {
  // Trata preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "search";
    const query = url.searchParams.get("query") || "";
    const tmdbIdStr = url.searchParams.get("id");

    const tmdbApiKey = Deno.env.get("TMDB_API_KEY");
    if (!tmdbApiKey) {
      return new Response(
        JSON.stringify({
          error: "TMDB_API_KEY não configurada nos secrets do Supabase.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Inicializa cliente Supabase interno com Service Role se disponível, ou anon
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // --------------------------------------------------------------------------
    // AÇÃO 1: BUSCA DE FILMES (SEARCH)
    // --------------------------------------------------------------------------
    if (action === "search") {
      if (!query.trim()) {
        return new Response(JSON.stringify({ results: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&language=pt-BR&query=${encodeURIComponent(
        query.trim()
      )}&include_adult=false&page=1`;

      const res = await fetch(tmdbUrl);
      if (!res.ok) {
        throw new Error(`Erro do TMDB: status ${res.status}`);
      }

      const data = await res.json();
      const results = (data.results || []).slice(0, 10).map((m: any) => ({
        id: m.id,
        title: m.title,
        original_title: m.original_title,
        year: m.release_date ? parseInt(m.release_date.substring(0, 4), 10) : null,
        poster_path: m.poster_path,
        backdrop_path: m.backdrop_path,
        overview: m.overview,
      }));

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --------------------------------------------------------------------------
    // AÇÃO 2: DETALHES COMPLETOS DO FILME (DETAILS)
    // --------------------------------------------------------------------------
    if (action === "details") {
      const tmdbId = parseInt(tmdbIdStr || "", 10);
      if (!tmdbId || isNaN(tmdbId)) {
        return new Response(JSON.stringify({ error: "ID TMDB inválido." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 1. Verifica se já existe em cache no banco
      const { data: cachedMovie } = await supabase
        .from("movies")
        .select("*")
        .eq("tmdb_id", tmdbId)
        .maybeSingle();

      const now = Date.now();
      const isFresh =
        cachedMovie &&
        now - new Date(cachedMovie.cached_at).getTime() < 24 * 60 * 60 * 1000;

      // Se o cache tiver menos de 24 horas, podemos retornar os dados existentes
      if (isFresh && url.searchParams.get("force") !== "true") {
        return new Response(
          JSON.stringify({ movie: cachedMovie, source: "cache" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // 2. Busca dados completos na API do TMDB
      const detailUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${tmdbApiKey}&language=pt-BR&append_to_response=credits,videos,watch/providers`;
      const res = await fetch(detailUrl);

      if (!res.ok) {
        if (cachedMovie) {
          // Se o TMDB falhar mas temos cache, retorna o cache
          return new Response(
            JSON.stringify({ movie: cachedMovie, source: "stale-cache" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        throw new Error(`Filme não encontrado no TMDB (status ${res.status})`);
      }

      const raw = await res.json();

      // Extrai diretor
      const director =
        raw.credits?.crew?.find((c: any) => c.job === "Director")?.name ||
        "Não informado";

      // Extrai elenco principal (top 5 atores)
      const castMain = (raw.credits?.cast || [])
        .slice(0, 5)
        .map((a: any) => a.name);

      // Extrai gêneros
      const genres = (raw.genres || []).map((g: any) => g.name);

      // Extrai ano
      const year = raw.release_date
        ? parseInt(raw.release_date.substring(0, 4), 10)
        : 0;

      // Extrai provedores de onde assistir no Brasil (results.BR)
      const brProviders: TMDBWatchProviders =
        raw["watch/providers"]?.results?.BR || {};

      const whereToWatch = {
        link: brProviders.link || null,
        streaming: (brProviders.flatrate || []).map((p) => ({
          id: p.provider_id,
          name: p.provider_name,
          logo: p.logo_path
            ? `https://image.tmdb.org/t/p/w92${p.logo_path}`
            : null,
        })),
        rent: (brProviders.rent || []).map((p) => ({
          id: p.provider_id,
          name: p.provider_name,
          logo: p.logo_path
            ? `https://image.tmdb.org/t/p/w92${p.logo_path}`
            : null,
        })),
        buy: (brProviders.buy || []).map((p) => ({
          id: p.provider_id,
          name: p.provider_name,
          logo: p.logo_path
            ? `https://image.tmdb.org/t/p/w92${p.logo_path}`
            : null,
        })),
      };

      const moviePayload = {
        tmdb_id: tmdbId,
        title: raw.title || raw.original_title,
        original_title: raw.original_title,
        year,
        poster_path: raw.poster_path,
        backdrop_path: raw.backdrop_path,
        overview: raw.overview || "Sem sinopse disponível em português.",
        runtime: raw.runtime || null,
        genres,
        director,
        cast_main: castMain,
        cached_at: new Date().toISOString(),
      };

      // 3. Upsert no banco Postgres do Supabase (atualiza cache)
      const { data: savedMovie, error: upsertError } = await supabase
        .from("movies")
        .upsert(moviePayload)
        .select()
        .single();

      if (upsertError) {
        console.error("Erro ao salvar cache de filme no banco:", upsertError);
      }

      return new Response(
        JSON.stringify({
          movie: savedMovie || moviePayload,
          where_to_watch: whereToWatch,
          source: "tmdb-live",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Ação não reconhecida." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Erro na Edge Function tmdb:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Erro interno do servidor." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
