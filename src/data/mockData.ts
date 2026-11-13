import type { ActiveCycle, Member, Movie, Suggestion } from '../types';

export const mockMembers: Member[] = [
  { id: '1', name: 'Samuel', letterboxdUsername: 'samuel', color: '#c0392b' },
  { id: '2', name: 'Luara', letterboxdUsername: 'luara', color: '#2e6f8e' },
  { id: '3', name: 'Filipe', letterboxdUsername: 'filipe', color: '#7d5ba6' },
  { id: '4', name: 'Tamires', letterboxdUsername: 'tamires', color: '#d98a2b' },
];

export const initialActiveCycle: ActiveCycle = {
  id: 'cycle-1',
  tmdbId: 1038263,
  movie: {
    title: 'Ainda Estou Aqui',
    originalTitle: 'Ainda Estou Aqui',
    director: 'Walter Salles',
    year: 2024,
    runtime: '2h15',
    genre: 'Drama',
    overview:
      'Anos 1970, Rio de Janeiro. A rotina de uma família muda quando o pai é levado para depor e não volta. Indicado por Luara.',
    suggestedBy: 'Luara',
    tagText: 'Escolhido pelo grupo',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8d8H05f42L2XwT5R5iS8E9o2hM.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/9l1dTaZ8jD1jA13Lp6j9n0fM5u.jpg',
    whereToWatch: {
      link: 'https://www.justwatch.com/br/filme/ainda-estou-aqui',
      streaming: [],
      rent: [],
      buy: [],
      note: 'Em exibição nos cinemas e em breve no streaming (Globoplay).',
    },
  },
  deadlineDay: 26,
  deadlineMonth: 'novembro',
  discussionNote: 'depois, o papo',
  crew: [
    { memberName: 'Samuel', watched: false },
    { memberName: 'Luara', watched: true },
    { memberName: 'Filipe', watched: true },
    { memberName: 'Tamires', watched: false },
  ],
};

export const mockMovies: Movie[] = [
  {
    id: 'devorador',
    tmdbId: 787699,
    title: 'O Devorador de Estrelas',
    originalTitle: 'Project Hail Mary',
    year: 2026,
    director: 'Phil Lord e Christopher Miller',
    genres: 'Ficção científica, Aventura',
    castMain: 'Ryan Gosling, Sandra Hüller, Milana Vayntrub',
    sessionMonth: 'set 2026',
    letterboxdSlug: 'project-hail-mary',
    bgGradient:
      'radial-gradient(circle at 72% 24%,#ffb347 0,#e8590c 13%,#16213e 14%,#0b1026 100%)',
    posterUrl: 'https://image.tmdb.org/t/p/w500/39p6bK9gO2L8d1T6Q8u3n2b1a.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/7O0Z7c4L5r8M2W6j4a3n1b2c.jpg',
    overview:
      'Um professor de ciências acorda sozinho numa nave, sem lembrar quem é nem por que está ali, e aos poucos descobre que sua missão é salvar a Terra de uma ameaça que está apagando o Sol.',
    whereToWatch: {
      link: 'https://www.justwatch.com/br/filme/project-hail-mary',
      streaming: [],
      rent: [],
      buy: [],
      note: 'Lançamento mundial nos cinemas previsto para 2026.',
    },
    reviews: [
      {
        id: 'rev-1-1',
        memberName: 'Samuel',
        rating: 4.5,
        reviewText:
          'Ciência de verdade virando aventura. Dei risada, me emocionei e saí querendo ler o livro.',
        letterboxdUrl: 'https://letterboxd.com/film/project-hail-mary/',
      },
      {
        id: 'rev-1-2',
        memberName: 'Luara',
        rating: 4.0,
        reviewText:
          'Muito bonito de ver e com um humor que eu não esperava. O começo é confuso de propósito, vale a paciência.',
        letterboxdUrl: 'https://letterboxd.com/film/project-hail-mary/',
      },
      {
        id: 'rev-1-3',
        memberName: 'Filipe',
        rating: 5.0,
        reviewText:
          'Curti demais a parte científica. Achei a segunda metade ainda melhor que a primeira.',
        letterboxdUrl: 'https://letterboxd.com/film/project-hail-mary/',
      },
      {
        id: 'rev-1-4',
        memberName: 'Tamires',
        rating: 3.5,
        reviewText:
          'Gostei, mas esperava mais emoção no final. Mesmo assim, valeu o ingresso.',
        letterboxdUrl: 'https://letterboxd.com/film/project-hail-mary/',
      },
    ],
  },
  {
    id: 'brilho',
    tmdbId: 38,
    title: 'Brilho Eterno de uma Mente sem Lembranças',
    originalTitle: 'Eternal Sunshine of the Spotless Mind',
    year: 2004,
    director: 'Michel Gondry',
    genres: 'Romance, Ficção científica, Drama',
    castMain: 'Jim Carrey, Kate Winslet, Kirsten Dunst, Mark Ruffalo',
    sessionMonth: 'jul 2026',
    letterboxdSlug: 'eternal-sunshine-of-the-spotless-mind',
    bgGradient:
      'linear-gradient(160deg,#7fb2e0,#1d3557 62%,#e07a3f 135%)',
    posterUrl: 'https://image.tmdb.org/t/p/w500/5MwkWH9tYHv3mV9OdYTMR5q9IzL.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/7vyFjL8tQvU5o1Nq6s9C2A4i4l.jpg',
    overview:
      'Depois de um término doloroso, um homem descobre que a ex contratou um procedimento para apagar as memórias do relacionamento e decide fazer o mesmo.',
    whereToWatch: {
      link: 'https://www.justwatch.com/br/filme/brilho-eterno-de-uma-mente-sem-lembrancas',
      streaming: [
        { id: 8, name: 'Netflix', logo: null },
        { id: 167, name: 'Claro Video', logo: null },
      ],
      rent: [
        { id: 2, name: 'Apple TV', logo: null },
        { id: 10, name: 'Amazon Video', logo: null },
        { id: 3, name: 'Google Play Filmes', logo: null },
      ],
      buy: [
        { id: 2, name: 'Apple TV', logo: null },
        { id: 10, name: 'Amazon Video', logo: null },
      ],
    },
    reviews: [
      {
        id: 'rev-2-1',
        memberName: 'Samuel',
        rating: 4.5,
        reviewText:
          'Filme pra ver quando o coração tá fraco. Doeu e curou ao mesmo tempo.',
        letterboxdUrl:
          'https://letterboxd.com/film/eternal-sunshine-of-the-spotless-mind/',
      },
      {
        id: 'rev-2-2',
        memberName: 'Luara',
        rating: 5.0,
        reviewText:
          'O melhor filme sobre relacionamento que existe, na minha opinião. A trilha é linda.',
        letterboxdUrl:
          'https://letterboxd.com/film/eternal-sunshine-of-the-spotless-mind/',
      },
      {
        id: 'rev-2-3',
        memberName: 'Filipe',
        rating: 4.0,
        reviewText:
          'A edição é genial, mas me perdi um pouco no meio. Valeu a revisão.',
        letterboxdUrl:
          'https://letterboxd.com/film/eternal-sunshine-of-the-spotless-mind/',
      },
      {
        id: 'rev-2-4',
        memberName: 'Tamires',
        rating: 4.5,
        reviewText:
          'Jim Carrey no modo sério é outro nível. Choro garantido.',
        letterboxdUrl:
          'https://letterboxd.com/film/eternal-sunshine-of-the-spotless-mind/',
      },
    ],
  },
  {
    id: 'infiltrados',
    tmdbId: 1422,
    title: 'Os Infiltrados',
    originalTitle: 'The Departed',
    year: 2006,
    director: 'Martin Scorsese',
    genres: 'Crime, Suspense, Drama',
    castMain: 'Leonardo DiCaprio, Matt Damon, Jack Nicholson, Mark Wahlberg',
    sessionMonth: 'abr 2026',
    letterboxdSlug: 'the-departed',
    bgGradient:
      'linear-gradient(160deg,#8a97a3,#2b3640 58%,#7a1f24)',
    posterUrl: 'https://image.tmdb.org/t/p/w500/nW5yZkS9JqC5eJ5C5e7u1A3k9l.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/8Z8G5o2Z9Xk5j9b2N3A1e6u7o.jpg',
    overview:
      'Em Boston, um policial novato se infiltra na máfia irlandesa enquanto um criminoso infiltrado na polícia faz o mesmo. Cada lado corre para descobrir o espião do outro.',
    whereToWatch: {
      link: 'https://www.justwatch.com/br/filme/os-infiltrados',
      streaming: [
        { id: 1899, name: 'Max', logo: null },
        { id: 119, name: 'Prime Video', logo: null },
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
    reviews: [
      {
        id: 'rev-3-1',
        memberName: 'Samuel',
        rating: 4.0,
        reviewText:
          'Elenco inacreditável e tensão do início ao fim. Jack Nicholson rouba qualquer cena.',
        letterboxdUrl: 'https://letterboxd.com/film/the-departed/',
      },
      {
        id: 'rev-3-2',
        memberName: 'Luara',
        rating: 4.5,
        reviewText:
          'Prende demais, com umas viradas bem cruéis. Recomendo ver sem ler nada antes.',
        letterboxdUrl: 'https://letterboxd.com/film/the-departed/',
      },
      {
        id: 'rev-3-3',
        memberName: 'Filipe',
        rating: 3.5,
        reviewText:
          'Bom, mas acho que o original de Hong Kong ainda é superior.',
        letterboxdUrl: 'https://letterboxd.com/film/the-departed/',
      },
      {
        id: 'rev-3-4',
        memberName: 'Tamires',
        rating: 4.0,
        reviewText:
          'Divertido e violento na medida. O final é daqueles que ficam na cabeça.',
        letterboxdUrl: 'https://letterboxd.com/film/the-departed/',
      },
    ],
  },
  {
    id: 'chefao',
    tmdbId: 238,
    title: 'O Poderoso Chefão',
    originalTitle: 'The Godfather',
    year: 1972,
    director: 'Francis Ford Coppola',
    genres: 'Drama, Crime',
    castMain: 'Marlon Brando, Al Pacino, James Caan, Robert Duvall',
    sessionMonth: 'fev 2026',
    letterboxdSlug: 'the-godfather',
    bgGradient:
      'linear-gradient(170deg,#5a3d12,#120b06 70%)',
    posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/tmU7GeKVybMWF92PQopvyG6KyP8.jpg',
    overview:
      'A família Corleone, poderosa na máfia de Nova York, vê o patriarca sofrer um atentado e o filho caçula, que queria ficar longe dos negócios, ser puxado para o centro da guerra.',
    whereToWatch: {
      link: 'https://www.justwatch.com/br/filme/o-poderoso-chefao',
      streaming: [
        { id: 8, name: 'Netflix', logo: null },
        { id: 531, name: 'Paramount+', logo: null },
        { id: 307, name: 'Telecine', logo: null },
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
    reviews: [
      {
        id: 'rev-4-1',
        memberName: 'Samuel',
        rating: 5.0,
        reviewText:
          'Cada cena parece pensada no milímetro. Não tem como não respeitar.',
        letterboxdUrl: 'https://letterboxd.com/film/the-godfather/',
      },
      {
        id: 'rev-4-2',
        memberName: 'Luara',
        rating: 4.5,
        reviewText:
          'Lento em alguns momentos, mas o Pacino segura tudo. Final perfeito.',
        letterboxdUrl: 'https://letterboxd.com/film/the-godfather/',
      },
      {
        id: 'rev-4-3',
        memberName: 'Filipe',
        rating: 5.0,
        reviewText:
          'Vi pela terceira vez e ainda descubro coisa nova. Clássico não é exagero.',
        letterboxdUrl: 'https://letterboxd.com/film/the-godfather/',
      },
      {
        id: 'rev-4-4',
        memberName: 'Tamires',
        rating: 4.0,
        reviewText:
          'Demorei pra ver e me arrependi de ter demorado. A fotografia é um absurdo.',
        letterboxdUrl: 'https://letterboxd.com/film/the-godfather/',
      },
    ],
  },
];

export const initialSuggestions: Suggestion[] = [
  {
    id: 'sug-1',
    tmdbId: 598,
    title: 'Cidade de Deus',
    originalTitle: 'Cidade de Deus',
    year: 2002,
    suggestedBy: 'Samuel',
    status: 'pending',
    votes: 4,
    hasVoted: false,
    posterUrl: 'https://image.tmdb.org/t/p/w500/kU6jQfFpGqLq11Z0FfA8T9cWbL8.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/mDei0G08cW892uF6s9jM4sL8bX.jpg',
    director: 'Fernando Meirelles e Kátia Lund',
    castMain: 'Alexandre Rodrigues, Leandro Firmino, Phellipe Haagensen, Seu Jorge',
    genres: 'Crime, Drama',
    runtime: 130,
    formattedRuntime: '2h10',
    overview:
      'Nas favelas do Rio de Janeiro nos anos 1970, dois rapazes seguem caminhos diferentes: um se torna fotógrafo e o outro um perigoso traficante de drogas.',
    trailerEmbedUrl: 'https://www.youtube-nocookie.com/embed/dcUOO4Itgmw',
    trailerUrl: 'https://www.youtube.com/watch?v=dcUOO4Itgmw',
    whereToWatch: {
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
  {
    id: 'sug-2',
    tmdbId: 244786,
    title: 'Whiplash: Em Busca da Perfeição',
    originalTitle: 'Whiplash',
    year: 2014,
    suggestedBy: 'Luara',
    status: 'pending',
    votes: 3,
    hasVoted: false,
    posterUrl: 'https://image.tmdb.org/t/p/w500/9bT9k6R5vU1c4g3uB0hP1e2Q4.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/6q1M1B9xZ7c4vU5o1Nq6s9C2A4.jpg',
    director: 'Damien Chazelle',
    castMain: 'Miles Teller, J.K. Simmons, Paul Reiser, Melissa Benoist',
    genres: 'Drama, Música',
    runtime: 107,
    formattedRuntime: '1h47',
    overview:
      'Um jovem baterista ambicioso se matricula em um conceituado conservatório de música sob a tutela de um instrutor impiedoso.',
    trailerEmbedUrl: 'https://www.youtube-nocookie.com/embed/7d_jQycdQGo',
    trailerUrl: 'https://www.youtube.com/watch?v=7d_jQycdQGo',
    whereToWatch: {
      link: 'https://www.justwatch.com/br/filme/whiplash-em-busca-da-perfeicao',
      streaming: [
        { id: 8, name: 'Netflix', logo: null },
        { id: 1899, name: 'Max', logo: null },
      ],
      rent: [
        { id: 2, name: 'Apple TV', logo: null },
        { id: 10, name: 'Amazon Video', logo: null },
      ],
      buy: [{ id: 2, name: 'Apple TV', logo: null }],
    },
  },
  {
    id: 'sug-3',
    tmdbId: 157336,
    title: 'Interestelar',
    originalTitle: 'Interstellar',
    year: 2014,
    suggestedBy: 'Filipe',
    status: 'pending',
    votes: 2,
    hasVoted: false,
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    director: 'Christopher Nolan',
    castMain: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain',
    genres: 'Ficção científica, Drama, Aventura',
    runtime: 169,
    formattedRuntime: '2h49',
    overview:
      'Com o fim dos recursos da Terra, um grupo de exploradores assume a missão mais importante da história da humanidade em busca de um novo lar.',
    trailerEmbedUrl: 'https://www.youtube-nocookie.com/embed/frD_IiY_A3E',
    trailerUrl: 'https://www.youtube.com/watch?v=frD_IiY_A3E',
    whereToWatch: {
      link: 'https://www.justwatch.com/br/filme/interestelar',
      streaming: [
        { id: 1899, name: 'Max', logo: null },
        { id: 119, name: 'Prime Video', logo: null },
      ],
      rent: [{ id: 2, name: 'Apple TV', logo: null }],
      buy: [{ id: 2, name: 'Apple TV', logo: null }],
    },
  },
  {
    id: 'sug-4',
    tmdbId: 933260,
    title: 'A Substância',
    originalTitle: 'The Substance',
    year: 2024,
    suggestedBy: 'Tamires',
    status: 'pending',
    votes: 2,
    hasVoted: false,
    posterUrl: 'https://image.tmdb.org/t/p/w500/lPq7Y8C3w8p8X4T5R5iS8E9o2hM.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/yR4B5vU1c4g3uB0hP1e2Q4.jpg',
    director: 'Coralie Fargeat',
    castMain: 'Demi Moore, Margaret Qualley, Dennis Quaid',
    genres: 'Terror, Ficção científica, Drama',
    runtime: 141,
    formattedRuntime: '2h21',
    overview:
      'Uma celebridade decadente decide usar uma droga do mercado clandestino que gera temporariamente uma versão mais jovem e perfeita de si mesma.',
    trailerEmbedUrl: 'https://www.youtube-nocookie.com/embed/LNlrGhP6ph0',
    trailerUrl: 'https://www.youtube.com/watch?v=LNlrGhP6ph0',
    whereToWatch: {
      link: 'https://www.justwatch.com/br/filme/a-substancia',
      streaming: [{ id: 11, name: 'MUBI', logo: null }],
      rent: [{ id: 2, name: 'Apple TV', logo: null }],
      buy: [{ id: 2, name: 'Apple TV', logo: null }],
    },
  },
  {
    id: 'sug-5',
    tmdbId: 10774,
    title: 'Rede de Intrigas',
    originalTitle: 'Network',
    year: 1976,
    suggestedBy: 'Luara',
    status: 'pending',
    votes: 1,
    hasVoted: false,
    posterUrl: 'https://image.tmdb.org/t/p/w500/mDei0G08cW892uF6s9jM4sL8bX.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/kU6jQfFpGqLq11Z0FfA8T9cWbL8.jpg',
    director: 'Sidney Lumet',
    castMain: 'Faye Dunaway, William Holden, Peter Finch, Robert Duvall',
    genres: 'Drama',
    runtime: 121,
    formattedRuntime: '2h01',
    overview:
      'Quando um veterano âncora de telejornal é demitido por baixa audiência, ele anuncia ao vivo que vai cometer suicídio na sua última transmissão.',
    trailerEmbedUrl: 'https://www.youtube-nocookie.com/embed/1cSC3pA1dUI',
    trailerUrl: 'https://www.youtube.com/watch?v=1cSC3pA1dUI',
    whereToWatch: {
      link: 'https://www.justwatch.com/br/filme/rede-de-intrigas',
      streaming: [],
      rent: [{ id: 2, name: 'Apple TV', logo: null }],
      buy: [{ id: 2, name: 'Apple TV', logo: null }],
      note: 'Disponível para aluguel digital na Apple TV.',
    },
  },
  {
    id: 'sug-6',
    tmdbId: 238,
    title: 'O Poderoso Chefão',
    originalTitle: 'The Godfather',
    year: 1972,
    suggestedBy: 'Samuel',
    status: 'seen',
    votes: 4,
    hasVoted: false,
    posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/tmU7GeKVybMWF92PQopvyG6KyP8.jpg',
    director: 'Francis Ford Coppola',
    castMain: 'Marlon Brando, Al Pacino, James Caan, Robert Duvall',
    genres: 'Drama, Crime',
    runtime: 175,
    formattedRuntime: '2h55',
    overview:
      'A família Corleone vê o patriarca sofrer um atentado e o filho caçula ser puxado para o centro da guerra da máfia.',
    whereToWatch: {
      link: 'https://www.justwatch.com/br/filme/o-poderoso-chefao',
      streaming: [
        { id: 8, name: 'Netflix', logo: null },
        { id: 531, name: 'Paramount+', logo: null },
      ],
      rent: [{ id: 2, name: 'Apple TV', logo: null }],
      buy: [{ id: 2, name: 'Apple TV', logo: null }],
    },
  },
];
