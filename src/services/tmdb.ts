import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { TMDBMovieSearchResult, WhereToWatchData } from '../types';

export function getTMDBImageUrl(
  path?: string | null,
  size: 'w92' | 'w154' | 'w500' | 'w1280' | 'original' = 'w500'
): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function formatRuntime(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return 'Duração não informada';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return mins > 0 ? `${hours}h${mins < 10 ? '0' : ''}${mins}` : `${hours}h`;
}

/**
 * Busca filmes no TMDB através da Edge Function do Supabase
 */
export async function searchMovies(query: string): Promise<TMDBMovieSearchResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke('tmdb', {
        method: 'GET',
        headers: {},
      });
      // Fallback para fetch direto na URL da função caso o client invoke use POST
      if (error || !data) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/tmdb?action=search&query=${encodeURIComponent(cleanQuery)}`,
          {
            headers: {
              apikey: anonKey,
              Authorization: `Bearer ${anonKey}`,
            },
          }
        );
        if (res.ok) {
          const json = await res.json();
          return json.results || [];
        }
      } else {
        return data.results || [];
      }
    } catch (err) {
      console.warn('Erro ao chamar Edge Function do TMDB, usando fallback:', err);
    }
  }

  // Fallback simulado para desenvolvimento local
  return [
    {
      id: 1038263,
      title: 'Ainda Estou Aqui',
      original_title: 'Ainda Estou Aqui',
      year: 2024,
      poster_path: '/8d8H05f42L2XwT5R5iS8E9o2hM.jpg',
      backdrop_path: '/9l1dTaZ8jD1jA13Lp6j9n0fM5u.jpg',
      overview:
        'Anos 1970, Rio de Janeiro. A rotina de uma família muda quando o pai é levado para depor e não volta.',
    },
    {
      id: 787699,
      title: 'O Devorador de Estrelas',
      original_title: 'Project Hail Mary',
      year: 2026,
      poster_path: '/39p6bK9gO2L8d1T6Q8u3n2b1a.jpg',
      backdrop_path: '/7O0Z7c4L5r8M2W6j4a3n1b2c.jpg',
      overview:
        'Um professor de ciências acorda sozinho numa nave para salvar a Terra.',
    },
    {
      id: 38,
      title: 'Brilho Eterno de uma Mente sem Lembranças',
      original_title: 'Eternal Sunshine of the Spotless Mind',
      year: 2004,
      poster_path: '/5MwkWH9tYHv3mV9OdYTMR5q9IzL.jpg',
      backdrop_path: '/7vyFjL8tQvU5o1Nq6s9C2A4i4l.jpg',
      overview:
        'Depois de um término doloroso, um homem decide apagar as memórias do relacionamento.',
    },
  ].filter(
    (m) =>
      m.title.toLowerCase().includes(cleanQuery.toLowerCase()) ||
      m.original_title.toLowerCase().includes(cleanQuery.toLowerCase())
  );
}

/**
 * Busca detalhes completos e onde assistir no Brasil
 */
export async function getMovieDetails(tmdbId: number): Promise<{
  movie: any;
  whereToWatch?: WhereToWatchData;
} | null> {
  if (isSupabaseConfigured) {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(
        `${supabaseUrl}/functions/v1/tmdb?action=details&id=${tmdbId}`,
        {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
        }
      );
      if (res.ok) {
        const json = await res.json();
        return {
          movie: json.movie,
          whereToWatch: json.where_to_watch,
        };
      }
    } catch (err) {
      console.warn('Falha na requisição de detalhes TMDB:', err);
    }
  }

  return null;
}
