import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { ActiveCycle, CycleMark } from '../types';
import { initialActiveCycle } from '../data/mockData';
import { getMovieDetails, getTMDBImageUrl, formatRuntime } from './tmdb';

export async function fetchActiveCycle(): Promise<ActiveCycle | null> {
  if (isSupabaseConfigured) {
    try {
      // 1. Busca ciclo com status 'active'
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select(`
          id,
          tmdb_id,
          start_date,
          watch_deadline,
          discussion_date,
          status,
          notes,
          movies (*)
        `)
        .eq('status', 'active')
        .maybeSingle();

      if (cycleError) {
        console.error('Erro ao buscar ciclo ativo no Supabase:', cycleError);
        return null;
      }

      if (!cycleData) return null;

      // 2. Busca todos os membros permitidos
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name');

      // 3. Busca marcações de quem assistiu
      const { data: marks } = await supabase
        .from('watched_marks')
        .select('user_id')
        .eq('cycle_id', cycleData.id);

      const watchedUserIds = new Set((marks || []).map((m) => m.user_id));

      const crew: CycleMark[] = (profiles || []).map((p) => ({
        memberName: p.display_name,
        watched: watchedUserIds.has(p.id),
      }));

      // Parse da data limite (watch_deadline: 'YYYY-MM-DD')
      const deadlineDate = new Date(cycleData.watch_deadline + 'T12:00:00Z');
      const day = deadlineDate.getUTCDate();
      const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
      ];
      const month = months[deadlineDate.getUTCMonth()] || '';

      const rawMovie: any = cycleData.movies;
      const movie = Array.isArray(rawMovie) ? rawMovie[0] : rawMovie;
      const details = await getMovieDetails(cycleData.tmdb_id);

      return {
        id: cycleData.id,
        tmdbId: cycleData.tmdb_id,
        movie: {
          title: movie?.title || 'Filme do ciclo',
          originalTitle: movie?.original_title,
          director: movie?.director || details?.movie?.director || 'Não informado',
          year: movie?.year || details?.movie?.year || 2026,
          runtime: formatRuntime(movie?.runtime || details?.movie?.runtime),
          genre: Array.isArray(movie?.genres) ? movie.genres.join(', ') : movie?.genres || 'Drama',
          overview: movie?.overview || details?.movie?.overview || '',
          suggestedBy: cycleData.notes || 'Escolhido pelo grupo',
          tagText: 'Escolhido pelo grupo',
          posterUrl: getTMDBImageUrl(movie?.poster_path || details?.movie?.poster_path, 'w500'),
          backdropUrl: getTMDBImageUrl(movie?.backdrop_path || details?.movie?.backdrop_path, 'w1280'),
          whereToWatch: details?.whereToWatch,
        },
        deadlineDay: day,
        deadlineMonth: month,
        discussionNote: cycleData.discussion_date
          ? `depois, o papo em ${new Date(cycleData.discussion_date + 'T12:00:00Z').toLocaleDateString('pt-BR')}`
          : 'depois, o papo',
        crew: crew.length > 0 ? crew : initialActiveCycle.crew,
      };
    } catch (err) {
      console.warn('Falha na busca do ciclo ativo, usando dados locais:', err);
    }
  }

  // Fallback local caso Supabase não esteja conectado
  return initialActiveCycle;
}

/**
 * Marca ou desmarca que o usuário logado assistiu ao filme do ciclo
 */
export async function toggleWatched(
  cycleId: string,
  userId: string,
  currentWatched: boolean
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      if (currentWatched) {
        // Desmarcar
        const { error } = await supabase
          .from('watched_marks')
          .delete()
          .match({ cycle_id: cycleId, user_id: userId });

        if (error) return { success: false, error: error.message };
      } else {
        // Marcar
        const { error } = await supabase
          .from('watched_marks')
          .insert({ cycle_id: cycleId, user_id: userId });

        if (error) return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return { success: true };
}
