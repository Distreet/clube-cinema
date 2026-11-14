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
  1422: {
    id: 1422,
    title: 'Os Infiltrados',
    original_title: 'The Departed',
    year: 2006,
    poster_path: '/nT97ifVT2J1yMQmeq20Qblg61T.jpg',
    backdrop_path: '/mDei0G08cW892uF6s9jM4sL8bX.jpg',
    overview:
      'A polícia de Boston trava uma verdadeira guerra contra o crime organizado. Billy Costigan, um jovem policial, recebe a missão de se infiltrar na máfia comandada por Frank Costello. Ao mesmo tempo, Colin Sullivan, um criminoso infiltrado na polícia, ascende na corporação.',
    runtime: 151,
    director: 'Martin Scorsese',
    cast_main: ['Leonardo DiCaprio', 'Matt Damon', 'Jack Nicholson', 'Mark Wahlberg'],
    genres: ['Drama', 'Crime', 'Suspense'],
    trailer_url: 'https://www.youtube.com/watch?v=iojhqm0JTW4',
    trailer_embed_url: 'https://www.youtube-nocookie.com/embed/iojhqm0JTW4',
    where_to_watch: {
      link: 'https://www.justwatch.com/br/filme/os-infiltrados',
      streaming: [{ id: 1899, name: 'Max', logo: null }],
      rent: [{ id: 2, name: 'Apple TV', logo: null }],
      buy: [{ id: 2, name: 'Apple TV', logo: null }],
    },
  },
  238: {
    id: 238,
    title: 'O Poderoso Chefão',
    original_title: 'The Godfather',
    year: 1972,
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdrop_path: '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
    overview:
      'Uma dinastia da máfia ítalo-americana transfere o controle de seu império clandestino de seu patriarca envelhecido para seu filho relutante.',
    runtime: 175,
    director: 'Francis Ford Coppola',
    cast_main: ['Marlon Brando', 'Al Pacino', 'James Caan', 'Robert Duvall'],
    genres: ['Drama', 'Crime'],
    trailer_url: 'https://www.youtube.com/watch?v=sY1S349gOnI',
    trailer_embed_url: 'https://www.youtube-nocookie.com/embed/sY1S349gOnI',
    where_to_watch: {
      link: 'https://www.justwatch.com/br/filme/o-poderoso-chefao',
      streaming: [{ id: 8, name: 'Netflix', logo: null }, { id: 119, name: 'Prime Video', logo: null }],
      rent: [{ id: 2, name: 'Apple TV', logo: null }],
      buy: [{ id: 2, name: 'Apple TV', logo: null }],
    },
  },
  1813: {
    id: 1813,
    title: 'O Advogado do Diabo',
    original_title: "The Devil's Advocate",
    year: 1997,
    poster_path: '/5ZzBGpxy55OQzHxKVY11IpY6a0o.jpg',
    backdrop_path: '/i9lR2jLV0dHVfVs1u6QqqbQAE9I.jpg',
    overview:
      'Kevin Lomax, um jovem advogado talentoso que nunca perdeu uma causa, é contratado por uma prestigiada firma em Nova York liderada pelo magnético John Milton.',
    runtime: 144,
    director: 'Taylor Hackford',
    cast_main: ['Keanu Reeves', 'Al Pacino', 'Charlize Theron', 'Jeffrey Jones'],
    genres: ['Drama', 'Mistério', 'Suspense'],
    trailer_url: 'https://www.youtube.com/watch?v=40hHA9n44gk',
    trailer_embed_url: 'https://www.youtube-nocookie.com/embed/40hHA9n44gk',
    where_to_watch: {
      link: 'https://www.justwatch.com/br/filme/o-advogado-do-diabo',
      streaming: [{ id: 1899, name: 'Max', logo: null }],
      rent: [{ id: 2, name: 'Apple TV', logo: null }],
      buy: [{ id: 2, name: 'Apple TV', logo: null }],
    },
  },
  38: {
    id: 38,
    title: 'Brilho Eterno de uma Mente sem Lembranças',
    original_title: 'Eternal Sunshine of the Spotless Mind',
    year: 2004,
    poster_path: '/5MwkWH9tYHv3mV9OdYTMR5q9IzL.jpg',
    backdrop_path: '/7vyFjL8tQvU5o1Nq6s9C2A4i4l.jpg',
    overview:
      'Depois de um término doloroso, um homem descobre que a ex contratou um procedimento para apagar as memórias do relacionamento e decide fazer o mesmo.',
    runtime: 108,
    director: 'Michel Gondry',
    cast_main: ['Jim Carrey', 'Kate Winslet', 'Kirsten Dunst', 'Mark Ruffalo'],
    genres: ['Romance', 'Ficção científica', 'Drama'],
    trailer_url: 'https://www.youtube.com/watch?v=yE-f1alkq9I',
    trailer_embed_url: 'https://www.youtube-nocookie.com/embed/yE-f1alkq9I',
    where_to_watch: {
      link: 'https://www.justwatch.com/br/filme/brilho-eterno-de-uma-mente-sem-lembrancas',
      streaming: [{ id: 8, name: 'Netflix', logo: null }, { id: 119, name: 'Prime Video', logo: null }],
      rent: [{ id: 2, name: 'Apple TV', logo: null }],
      buy: [{ id: 2, name: 'Apple TV', logo: null }],
    },
  },
  712: {
    id: 712,
    title: 'Quatro Casamentos e um Funeral',
    original_title: 'Four Weddings and a Funeral',
    year: 1994,
    poster_path: '/qa72G2VS0bpxms6yo0tI9vsHm2e.jpg',
    backdrop_path: '/7F0sLg4Cg2A7nO1T7T4Jq4K1z6U.jpg',
    overview:
      'Charles é um inglês solteirão que sempre foge de compromisso. Ao longo de quatro casamentos e um funeral, ele conhece e se apaixona por Carrie, uma charmosa americana.',
    runtime: 117,
    director: 'Mike Newell',
    cast_main: ['Hugh Grant', 'Andie MacDowell', 'James Fleet', 'Simon Callow'],
    genres: ['Comédia', 'Romance', 'Drama'],
    trailer_url: 'https://www.youtube.com/watch?v=jW8F81q1aeg',
    trailer_embed_url: 'https://www.youtube-nocookie.com/embed/jW8F81q1aeg',
    where_to_watch: {
      link: 'https://www.justwatch.com/br/filme/quatro-casamentos-e-um-funeral',
      streaming: [{ id: 119, name: 'Prime Video', logo: null }],
      rent: [{ id: 2, name: 'Apple TV', logo: null }],
      buy: [{ id: 2, name: 'Apple TV', logo: null }],
    },
  },
  508883: {
    id: 508883,
    title: 'O Menino e a Garça',
    original_title: '君たちはどう生きるか',
    year: 2023,
    poster_path: '/f4oZTcfGrVTXKTWg157AwikXqmP.jpg',
    backdrop_path: '/75aHgN1OGqWJm9r0T7a6Z2Z6h7X.jpg',
    overview:
      'Durante a Segunda Guerra Mundial, o jovem Mahito perde a mãe e se muda para o campo. Lá ele encontra uma garça cinzenta falante e é guiado a uma torre mágica que leva a um mundo fantástico.',
    runtime: 124,
    director: 'Hayao Miyazaki',
    cast_main: ['Soma Santoki', 'Masaki Suda', 'Aimyon', 'Yoshino Kimura'],
    genres: ['Animação', 'Aventura', 'Fantasia'],
    trailer_url: 'https://www.youtube.com/watch?v=f7EDFdA10pg',
    trailer_embed_url: 'https://www.youtube-nocookie.com/embed/f7EDFdA10pg',
    where_to_watch: {
      link: 'https://www.justwatch.com/br/filme/o-menino-e-a-garca',
      streaming: [{ id: 8, name: 'Netflix', logo: null }],
      rent: [],
      buy: [],
    },
  },
  787699: {
    id: 787699,
    title: 'O Devorador de Estrelas',
    original_title: 'Project Hail Mary',
    year: 2026,
    poster_path: '/39p6bK9gO2L8d1T6Q8u3n2b1a.jpg',
    backdrop_path: '/7O0Z7c4L5r8M2W6j4a3n1b2c.jpg',
    overview:
      'Um professor de ciências acorda sozinho numa nave, sem lembrar quem é nem por que está ali, e descobre que sua missão é salvar a Terra de uma catástrofe que está apagando o Sol.',
    runtime: 135,
    director: 'Phil Lord e Christopher Miller',
    cast_main: ['Ryan Gosling', 'Sandra Hüller', 'Milana Vayntrub'],
    genres: ['Ficção científica', 'Aventura'],
    trailer_url: 'https://www.youtube.com/watch?v=vVTaLp1vL8Y',
    trailer_embed_url: 'https://www.youtube-nocookie.com/embed/vVTaLp1vL8Y',
    where_to_watch: {
      link: 'https://www.justwatch.com/br/filme/project-hail-mary',
      streaming: [],
      rent: [],
      buy: [],
      note: 'Lançamento nos cinemas previsto para 2026.',
    },
  },
  12405: {
    id: 12405,
    title: 'Quem Quer Ser um Milionário?',
    original_title: 'Slumdog Millionaire',
    year: 2008,
    poster_path: '/5leCCi7ZF0CawAfM5Qo2ECKPprc.jpg',
    backdrop_path: '/p732e4dF6N6X0A6c0dE0A6e7T6.jpg',
    overview:
      'Jamal Malik, um jovem de 18 anos órfão das favelas de Mumbai, está a uma pergunta de ganhar 20 milhões de rúpias na versão indiana de "Quem Quer Ser um Milionário?".',
    runtime: 120,
    director: 'Danny Boyle',
    cast_main: ['Dev Patel', 'Freida Pinto', 'Anil Kapoor', 'Irrfan Khan'],
    genres: ['Drama', 'Romance'],
    trailer_url: 'https://www.youtube.com/watch?v=AIzbwKhEtsx',
    trailer_embed_url: 'https://www.youtube-nocookie.com/embed/AIzbwKhEtsx',
    where_to_watch: {
      link: 'https://www.justwatch.com/br/filme/quem-quer-ser-um-milionario',
      streaming: [{ id: 119, name: 'Prime Video', logo: null }],
      rent: [{ id: 2, name: 'Apple TV', logo: null }],
      buy: [{ id: 2, name: 'Apple TV', logo: null }],
    },
  },
  13459: {
    id: 13459,
    title: 'Barbie e a Magia de Aladus',
    original_title: 'Barbie and the Magic of Pegasus 3-D',
    year: 2005,
    poster_path: '/wqKNLSzGN9lqnmtFFwu40g2eWgQ.jpg',
    backdrop_path: '/lyBNJn16WIHIriX1bJVoOnv8U6Z.jpg',
    overview:
      'A princesa Annika foge das garras do malvado feiticeiro Wenlock e descobre as maravilhas do Reino das Nuvens ao lado de um magnífico cavalo alado, que na verdade é sua irmã encantada, a princesa Brietta.',
    runtime: 85,
    director: 'Greg Richardson',
    cast_main: ['Kelly Sheridan', 'Lalainia Lindbjerg', 'Colin Murdock', 'Mark Hildreth'],
    genres: ['Animação', 'Família', 'Fantasia'],
    trailer_url: 'https://www.youtube.com/watch?v=3iXj9yO6qK0',
    trailer_embed_url: 'https://www.youtube-nocookie.com/embed/3iXj9yO6qK0',
    where_to_watch: {
      link: 'https://www.justwatch.com/br/filme/barbie-e-a-magia-de-aladus',
      streaming: [{ id: 119, name: 'Prime Video', logo: null }],
      rent: [{ id: 2, name: 'Apple TV', logo: null }],
      buy: [{ id: 2, name: 'Apple TV', logo: null }],
    },
  },
  54186: {
    id: 54186,
    title: 'Kokuhaku (Confissões)',
    original_title: '告白',
    year: 2010,
    poster_path: '/xQcnx6jMuPRCeidotgVy6YIls6p.jpg',
    backdrop_path: '/sT7f721Zvb9Feo11sbhvkk2JLHi.jpg',
    overview:
      'Uma professora do ensino fundamental, após a morte trágica de sua filha de quatro anos na piscina da escola, anuncia em seu último dia de aula que a morte não foi um acidente, mas sim um assassinato cometido por dois alunos daquela mesma sala.',
    runtime: 106,
    director: 'Tetsuya Nakashima',
    cast_main: ['Takako Matsu', 'Yoshino Kimura', 'Masaki Okada', 'Yukito Nishii'],
    genres: ['Drama', 'Mistério', 'Suspense'],
    trailer_url: 'https://www.youtube.com/watch?v=mD_k-l6Y2aU',
    trailer_embed_url: 'https://www.youtube-nocookie.com/embed/mD_k-l6Y2aU',
    where_to_watch: {
      link: 'https://www.justwatch.com/br/filme/confissoes',
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
