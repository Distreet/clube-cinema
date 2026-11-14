import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { ActiveCycle, Member, Movie, Review, Suggestion } from '../types';
import { initialActiveCycle, mockMembers, mockMovies, initialSuggestions } from '../data/mockData';
import { fetchActiveCycle } from './cycles';
import { getTMDBImageUrl, formatRuntime } from './tmdb';

export interface ClubInitialData {
  clubName: string;
  cycle: ActiveCycle | null;
  movies: Movie[];
  suggestions: Suggestion[];
  members: Member[];
}

/**
 * Carrega todos os dados iniciais do clube (do Supabase ou mock local)
 */
export async function loadClubData(currentUserId?: string): Promise<ClubInitialData> {
  if (!isSupabaseConfigured) {
    return {
      clubName: 'Clube do Livro',
      cycle: initialActiveCycle,
      movies: mockMovies,
      suggestions: initialSuggestions,
      members: mockMembers,
    };
  }

  try {
    // 1. Nome do clube
    let clubName = 'Clube do Livro';
    const { data: settingData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'club_name')
      .maybeSingle();

    if (settingData?.value) {
      clubName = typeof settingData.value === 'string'
        ? settingData.value.replace(/^"|"$/g, '')
        : String(settingData.value);
    }

    // 2. Ciclo ativo
    const liveCycle = await fetchActiveCycle();

    // 3. Membros cadastrados
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, display_name, letterboxd_username, role')
      .order('created_at', { ascending: true });

    const memberPalette = [
      '#c0392b', '#2e6f8e', '#7d5ba6', '#d98a2b',
      '#2f8f6b', '#b8456b', '#5b6ee1'
    ];

    const members: Member[] = (profilesData && profilesData.length > 0)
      ? profilesData.map((p, idx) => ({
          id: p.id,
          name: p.display_name,
          letterboxdUsername: p.letterboxd_username || p.display_name.toLowerCase(),
          color: memberPalette[idx % memberPalette.length] || '#c0392b',
        }))
      : mockMembers;

    // 4. Filmes do histórico e suas avaliações
    const { data: moviesData } = await supabase
      .from('movies')
      .select(`
        *,
        reviews (
          id,
          rating,
          review_text,
          letterboxd_url,
          source,
          profiles ( display_name )
        ),
        cycles (
          id,
          start_date,
          watch_deadline,
          status
        )
      `);

    let movies: Movie[] = [];
    if (moviesData && moviesData.length > 0) {
      movies = moviesData.map((m: any) => {
        const cycleInfo = Array.isArray(m.cycles) ? m.cycles[0] : m.cycles;
        let sessionMonth = 'Histórico';
        if (cycleInfo?.watch_deadline) {
          const d = new Date(cycleInfo.watch_deadline + 'T12:00:00Z');
          const months = [
            'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
            'jul', 'ago', 'set', 'out', 'nov', 'dez'
          ];
          sessionMonth = `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
        }

        const revs: Review[] = (m.reviews || []).map((r: any) => ({
          id: r.id,
          memberName: r.profiles?.display_name || 'Membro',
          rating: r.rating !== null ? Number(r.rating) : null,
          reviewText: r.review_text,
          letterboxdUrl: r.letterboxd_url,
        }));

        return {
          id: String(m.tmdb_id),
          tmdbId: m.tmdb_id,
          title: m.title,
          originalTitle: m.original_title,
          year: m.year,
          director: m.director || 'Não informado',
          genres: Array.isArray(m.genres) ? m.genres.join(', ') : m.genres || '',
          castMain: Array.isArray(m.cast_main) ? m.cast_main.join(', ') : m.cast_main || '',
          sessionMonth,
          overview: m.overview || '',
          runtime: m.runtime,
          formattedRuntime: formatRuntime(m.runtime),
          bgGradient: 'linear-gradient(160deg, #2a0f17, #3a1722)',
          posterUrl: getTMDBImageUrl(m.poster_path, 'w500'),
          backdropUrl: getTMDBImageUrl(m.backdrop_path, 'w1280'),
          letterboxdSlug: m.title.toLowerCase().replace(/\s+/g, '-'),
          reviews: revs,
        };
      });
    }

    if (movies.length === 0) {
      movies = mockMovies;
    }

    // 5. Sugestões do acervo com contagem de votos
    const { data: suggestionsData } = await supabase
      .from('suggestions')
      .select(`
        id,
        tmdb_id,
        status,
        created_at,
        profiles ( id, display_name ),
        movies (*),
        votes ( user_id )
      `);

    let suggestions: Suggestion[] = [];
    if (suggestionsData && suggestionsData.length > 0) {
      suggestions = suggestionsData.map((s: any) => {
        const votesArr = Array.isArray(s.votes) ? s.votes : [];
        const hasVoted = currentUserId ? votesArr.some((v: any) => v.user_id === currentUserId) : false;
        const mov = s.movies;

        return {
          id: s.id,
          tmdbId: s.tmdb_id,
          title: mov?.title || 'Filme sugerido',
          originalTitle: mov?.original_title,
          year: mov?.year || 2026,
          suggestedBy: s.profiles?.display_name || 'Membro',
          suggestedByUserId: s.profiles?.id,
          status: s.status,
          votes: votesArr.length,
          hasVoted,
          posterUrl: getTMDBImageUrl(mov?.poster_path, 'w500'),
          backdropUrl: getTMDBImageUrl(mov?.backdrop_path, 'w1280'),
          overview: mov?.overview || '',
          director: mov?.director || 'Não informado',
          castMain: Array.isArray(mov?.cast_main) ? mov.cast_main.join(', ') : mov?.cast_main || '',
          genres: Array.isArray(mov?.genres) ? mov.genres.join(', ') : mov?.genres || '',
          runtime: mov?.runtime,
          formattedRuntime: formatRuntime(mov?.runtime),
          createdAt: s.created_at,
        };
      });
    }

    if (suggestions.length === 0) {
      suggestions = initialSuggestions;
    }

    return {
      clubName,
      cycle: liveCycle || initialActiveCycle,
      movies,
      suggestions,
      members,
    };
  } catch (err) {
    console.warn('Erro ao carregar dados do Supabase, usando fallback local:', err);
    return {
      clubName: 'Clube do Livro',
      cycle: initialActiveCycle,
      movies: mockMovies,
      suggestions: initialSuggestions,
      members: mockMembers,
    };
  }
}

/**
 * Persiste voto no Supabase
 */
export async function persistToggleVote(
  suggestionId: string,
  userId: string,
  willVote: boolean
): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    if (willVote) {
      await supabase.from('votes').insert({ suggestion_id: suggestionId, user_id: userId });
    } else {
      await supabase.from('votes').delete().match({ suggestion_id: suggestionId, user_id: userId });
    }
  } catch (err) {
    console.error('Erro ao persistir voto:', err);
  }
}

/**
 * Persiste nova sugestão no Supabase
 */
export async function persistNewSuggestion(
  suggestion: Suggestion,
  userId: string
): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    // 1. Garante que o filme existe na tabela movies
    await supabase.from('movies').upsert({
      tmdb_id: suggestion.tmdbId,
      title: suggestion.title,
      original_title: suggestion.originalTitle || suggestion.title,
      year: suggestion.year || 2026,
      overview: suggestion.overview || '',
      runtime: suggestion.runtime || null,
      director: suggestion.director || null,
      cached_at: new Date().toISOString(),
    });

    // 2. Insere a sugestão
    const { data: sugData, error } = await supabase
      .from('suggestions')
      .insert({
        tmdb_id: suggestion.tmdbId,
        suggested_by: userId,
        status: 'pending',
      })
      .select()
      .single();

    if (!error && sugData) {
      // 3. Insere voto de quem indicou
      await supabase.from('votes').insert({
        suggestion_id: sugData.id,
        user_id: userId,
      });
    }
  } catch (err) {
    console.error('Erro ao persistir nova sugestão:', err);
  }
}

/**
 * Persiste alteração de status da sugestão
 */
export async function persistUpdateSuggestionStatus(
  suggestionId: string,
  status: Suggestion['status']
): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    await supabase.from('suggestions').update({ status }).eq('id', suggestionId);
  } catch (err) {
    console.error('Erro ao atualizar status da sugestão:', err);
  }
}

/**
 * Persiste exclusão de sugestão
 */
export async function persistDeleteSuggestion(suggestionId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    await supabase.from('suggestions').delete().eq('id', suggestionId);
  } catch (err) {
    console.error('Erro ao excluir sugestão:', err);
  }
}
