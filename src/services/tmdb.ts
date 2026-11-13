import { isSupabaseConfigured } from '../lib/supabase';
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

// Catálogo de referência offline para desenvolvimento rápido e testes
const MOCK_TMDB_CATALOG: Record<
  number,
  {
    id: number;
    title: string;
    original_title: string;
    year: number;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    runtime: number;
    director: string;
    cast_main: string[];
    genres: string[];
    trailer_url: string;
    trailer_embed_url: string;
    where_to_watch: WhereToWatchData;
  }
> = {
  598: {
    id: 598,
    title: 'Cidade de Deus',
    original_title: 'Cidade de Deus',
    year: 2002,
    poster_path: '/kU6jQfFpGqLq11Z0FfA8T9cWbL8.jpg',
    backdrop_path: '/mDei0G08cW892uF6s9jM4sL8bX.jpg',
    overview:
      'Nas favelas do Rio de Janeiro nos anos 1970, dois rapazes seguem caminhos diferentes: um se torna fotógrafo e o outro um perigoso traficante de drogas.',
    runtime: 130,
    director: 'Fernando Meirelles e Kátia Lund',
    cast_main: ['Alexandre Rodrigues', 'Leandro Firmino', 'Phellipe Haagensen', 'Seu Jorge'],
    genres: ['Crime', 'Drama'],
    trailer_url: 'https://www.youtube.com/watch?v=dcUOO4Itgmw',
    trailer_embed_url: 'https://www.youtube-nocookie.com/embed/dcUOO4Itgmw',
    where_to_watch: {
      link: 'https://www.justwatch.com/br/filme/cidade-de-deus',
      streaming: [
        { id: 8, name: 'Netflix', logo: null },
        { id: 11, name: 'Globoplay', logo: null },
        { id: 307, name: 'Telecine', logo: null },
      ],
      rent: [{ id: 2, name: 'Apple TV', logo: null }],
      buy: [{ id: 2, name: 'Apple TV', logo: null }],
    },
  },
  244786: {
    id: 244786,
    title: 'Whiplash: Em Busca da Perfeição',
    original_title: 'Whiplash',
    year: 2014,
    poster_path: '/9bT9k6R5vU1c4g3uB0hP1e2Q4.jpg',
    backdrop_path: '/6q1M1B9xZ7c4vU5o1Nq6s9C2A4.jpg',
    overview:
      'Um jovem baterista ambicioso se matricula em um conceituado conservatório de música, onde é orientado por um instrutor impiedoso que não mede esforços para atingir a perfeição.',
    runtime: 107,
    director: 'Damien Chazelle',
    cast_main: ['Miles Teller', 'J.K. Simmons', 'Paul Reiser', 'Melissa Benoist'],
    genres: ['Drama', 'Música'],
    trailer_url: 'https://www.youtube.com/watch?v=7d_jQycdQGo',
    trailer_embed_url: 'https://www.youtube-nocookie.com/embed/7d_jQycdQGo',
    where_to_watch: {
      link: 'https://www.justwatch.com/br/filme/whiplash-em-busca-da-perfeicao',
      streaming: [
        { id: 8, name: 'Netflix', logo: null },
        { id: 1899, name: 'Max', logo: null },
      ],
      rent: [
        { id: 2, name: 'Apple TV', logo: null },
        { id: 10, name: 'Amazon Video', logo: null },
      ],
      buy: [
        { id: 2, name: 'Apple TV', logo: null },
        { id: 10, name: 'Amazon Video', logo: null },
      ],
    },
  },
  157336: {
    id: 157336,
    title: 'Interestelar',
    original_title: 'Interstellar',
    year: 2014,
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    overview:
      'As reservas naturais da Terra estão chegando ao fim e um grupo de astronautas recebe a missão de verificar possíveis planetas para receberem a população mundial, possibilitando a continuação da espécie.',
    runtime: 169,
    director: 'Christopher Nolan',
    cast_main: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    genres: ['Ficção científica', 'Drama', 'Aventura'],
    trailer_url: 'https://www.youtube.com/watch?v=frD_IiY_A3E',
    trailer_embed_url: 'https://www.youtube-nocookie.com/embed/frD_IiY_A3E',
    where_to_watch: {
      link: 'https://www.justwatch.com/br/filme/interestelar',
      streaming: [
        { id: 1899, name: 'Max', logo: null },
        { id: 119, name: 'Prime Video', logo: null },
      ],
      rent: [{ id: 2, name: 'Apple TV', logo: null }],
      buy: [{ id: 2, name: 'Apple TV', logo: null }],
    },
  },
  933260: {
    id: 933260,
    title: 'A Substância',
    original_title: 'The Substance',
    year: 2024,
    poster_path: '/lPq7Y8C3w8p8X4T5R5iS8E9o2hM.jpg',
    backdrop_path: '/yR4B5vU1c4g3uB0hP1e2Q4.jpg',
    overview:
      'Uma celebridade decadente decide usar uma droga do mercado clandestino, uma substância que replica células e cria temporariamente uma versão mais jovem e melhor de si mesma.',
    runtime: 141,
    director: 'Coralie Fargeat',
    cast_main: ['Demi Moore', 'Margaret Qualley', 'Dennis Quaid', 'Edward Hamilton Clark'],
    genres: ['Terror', 'Ficção científica', 'Drama'],
    trailer_url: 'https://www.youtube.com/watch?v=LNlrGhP6ph0',
    trailer_embed_url: 'https://www.youtube-nocookie.com/embed/LNlrGhP6ph0',
    where_to_watch: {
      link: 'https://www.justwatch.com/br/filme/a-substancia',
      streaming: [{ id: 11, name: 'MUBI', logo: null }],
      rent: [{ id: 2, name: 'Apple TV', logo: null }],
      buy: [{ id: 2, name: 'Apple TV', logo: null }],
    },
  },
  10774: {
    id: 10774,
    title: 'Rede de Intrigas',
    original_title: 'Network',
    year: 1976,
    poster_path: '/mDei0G08cW892uF6s9jM4sL8bX.jpg',
    backdrop_path: '/kU6jQfFpGqLq11Z0FfA8T9cWbL8.jpg',
    overview:
      'Quando um veterano âncora de telejornal é demitido por baixa audiência, ele anuncia ao vivo que vai cometer suicídio na sua última transmissão.',
    runtime: 121,
    director: 'Sidney Lumet',
    cast_main: ['Faye Dunaway', 'William Holden', 'Peter Finch', 'Robert Duvall'],
    genres: ['Drama'],
    trailer_url: 'https://www.youtube.com/watch?v=1cSC3pA1dUI',
    trailer_embed_url: 'https://www.youtube-nocookie.com/embed/1cSC3pA1dUI',
    where_to_watch: {
      link: 'https://www.justwatch.com/br/filme/rede-de-intrigas',
      streaming: [],
      rent: [{ id: 2, name: 'Apple TV', logo: null }],
      buy: [{ id: 2, name: 'Apple TV', logo: null }],
      note: 'Disponível para aluguel digital na Apple TV.',
    },
  },
};

/**
 * Busca filmes no TMDB com debounce através da Edge Function do Supabase
 */
export async function searchMovies(query: string): Promise<TMDBMovieSearchResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  if (isSupabaseConfigured) {
    try {
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
    } catch (err) {
      console.warn('Erro ao chamar Edge Function do TMDB, usando catálogo local:', err);
    }
  }

  // Busca no catálogo mock local
  const localResults = Object.values(MOCK_TMDB_CATALOG).map((m) => ({
    id: m.id,
    title: m.title,
    original_title: m.original_title,
    year: m.year,
    poster_path: m.poster_path,
    backdrop_path: m.backdrop_path,
    overview: m.overview,
  }));

  // Adiciona filmes adicionais para permitir busca variada
  const additionalMock: TMDBMovieSearchResult[] = [
    {
      id: 1038263,
      title: 'Ainda Estou Aqui',
      original_title: 'Ainda Estou Aqui',
      year: 2024,
      poster_path: '/8d8H05f42L2XwT5R5iS8E9o2hM.jpg',
      backdrop_path: '/9l1dTaZ8jD1jA13Lp6j9n0fM5u.jpg',
      overview: 'Anos 1970, Rio de Janeiro. A rotina de uma família muda quando o pai é levado para depor.',
    },
    {
      id: 787699,
      title: 'O Devorador de Estrelas',
      original_title: 'Project Hail Mary',
      year: 2026,
      poster_path: '/39p6bK9gO2L8d1T6Q8u3n2b1a.jpg',
      backdrop_path: '/7O0Z7c4L5r8M2W6j4a3n1b2c.jpg',
      overview: 'Um professor acorda sozinho numa nave para salvar a Terra de uma catástrofe.',
    },
    {
      id: 238,
      title: 'O Poderoso Chefão',
      original_title: 'The Godfather',
      year: 1972,
      poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      backdrop_path: '/tmU7GeKVybMWF92PQopvyG6KyP8.jpg',
      overview: 'O patriarca de uma dinastia do crime organizado transfere o controle para seu filho relutante.',
    },
    {
      id: 550,
      title: 'Clube da Luta',
      original_title: 'Fight Club',
      year: 1999,
      poster_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
      backdrop_path: '/rr7E0NoGKxvbSuETEcAhRURV211.jpg',
      overview: 'Um homem deprimido que sofre de insônia conhece um estranho vendedor e cria um clube clandestino.',
    },
    {
      id: 680,
      title: 'Pulp Fiction: Tempo de Violência',
      original_title: 'Pulp Fiction',
      year: 1994,
      poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      backdrop_path: '/suaEOtk1916guXlVTdcV9So5Am.jpg',
      overview: 'As vidas de dois assassinos da máfia, um boxeador e um casal de assaltantes se entrelaçam.',
    },
  ];

  const pool = [...localResults, ...additionalMock];
  const queryLower = cleanQuery.toLowerCase();

  return pool.filter(
    (m) =>
      m.title.toLowerCase().includes(queryLower) ||
      m.original_title.toLowerCase().includes(queryLower)
  );
}

/**
 * Busca detalhes completos e onde assistir no Brasil
 */
export async function getMovieDetails(tmdbId: number): Promise<{
  movie: any;
  whereToWatch?: WhereToWatchData;
  trailerUrl?: string | null;
  trailerEmbedUrl?: string | null;
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
          trailerUrl: json.trailer_url,
          trailerEmbedUrl: json.trailer_embed_url,
        };
      }
    } catch (err) {
      console.warn('Falha na requisição de detalhes TMDB:', err);
    }
  }

  // Retorna do catálogo mock se disponível
  const mockItem = MOCK_TMDB_CATALOG[tmdbId];
  if (mockItem) {
    return {
      movie: {
        tmdb_id: mockItem.id,
        title: mockItem.title,
        original_title: mockItem.original_title,
        year: mockItem.year,
        poster_path: mockItem.poster_path,
        backdrop_path: mockItem.backdrop_path,
        overview: mockItem.overview,
        runtime: mockItem.runtime,
        genres: mockItem.genres,
        director: mockItem.director,
        cast_main: mockItem.cast_main,
      },
      whereToWatch: mockItem.where_to_watch,
      trailerUrl: mockItem.trailer_url,
      trailerEmbedUrl: mockItem.trailer_embed_url,
    };
  }

  return null;
}
