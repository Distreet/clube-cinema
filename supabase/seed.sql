-- ==============================================================================
-- Clube do Livro - Seed de Dados Oficiais
-- ==============================================================================

-- 1. E-mails permitidos dos membros
insert into public.allowed_emails (email)
values
  ('samuel@example.com'),
  ('luara@example.com'),
  ('filipe@example.com'),
  ('tamires@example.com')
on conflict (email) do nothing;

-- 2. Configurações iniciais
insert into public.settings (key, value)
values ('club_name', '"Clube do Livro"'::jsonb)
on conflict (key) do nothing;

-- 3. Cache de Filmes do Clube (Histórico 2026 + Filme Atual)
insert into public.movies (tmdb_id, title, original_title, year, poster_path, backdrop_path, overview, runtime, genres, director, cast_main)
values
  (
    1422,
    'Os Infiltrados',
    'The Departed',
    2006,
    '/nT97ifVT2J1yMQmeq20Qblg61T.jpg',
    '/6WRrGYalXXveItfpnipYdayFkQB.jpg',
    'A polícia de Boston trava uma verdadeira guerra contra o crime organizado. Billy Costigan, um jovem policial, recebe a missão de se infiltrar na máfia comandada por Frank Costello.',
    151,
    '["Drama", "Crime", "Suspense"]'::jsonb,
    'Martin Scorsese',
    '["Leonardo DiCaprio", "Matt Damon", "Jack Nicholson", "Mark Wahlberg"]'::jsonb
  ),
  (
    238,
    'O Poderoso Chefão',
    'The Godfather',
    1972,
    '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
    'Uma dinastia da máfia ítalo-americana transfere o controle de seu império clandestino de seu patriarca envelhecido para seu filho relutante.',
    175,
    '["Drama", "Crime"]'::jsonb,
    'Francis Ford Coppola',
    '["Marlon Brando", "Al Pacino", "James Caan", "Robert Duvall"]'::jsonb
  ),
  (
    1813,
    'O Advogado do Diabo',
    'The Devil''s Advocate',
    1997,
    '/5ZzBGpxy55OQzHxKVY11IpY6a0o.jpg',
    '/i9lR2jLV0dHVfVs1u6QqqbQAE9I.jpg',
    'Kevin Lomax, um jovem advogado talentoso que nunca perdeu uma causa, é contratado por uma prestigiada firma em Nova York liderada pelo magnético John Milton.',
    144,
    '["Drama", "Mistério", "Suspense"]'::jsonb,
    'Taylor Hackford',
    '["Keanu Reeves", "Al Pacino", "Charlize Theron", "Jeffrey Jones"]'::jsonb
  ),
  (
    38,
    'Brilho Eterno de uma Mente sem Lembranças',
    'Eternal Sunshine of the Spotless Mind',
    2004,
    '/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg',
    '/8AE7M2lMsyvowfT36porzGtmOtI.jpg',
    'Depois de um término doloroso, um homem descobre que a ex contratou um procedimento para apagar as memórias do relacionamento e decide fazer o mesmo.',
    108,
    '["Romance", "Ficção científica", "Drama"]'::jsonb,
    'Michel Gondry',
    '["Jim Carrey", "Kate Winslet", "Kirsten Dunst", "Mark Ruffalo"]'::jsonb
  ),
  (
    712,
    'Quatro Casamentos e um Funeral',
    'Four Weddings and a Funeral',
    1994,
    '/qa72G2VS0bpxms6yo0tI9vsHm2e.jpg',
    '/xO7khpMXKK1boeAHG13N6mmwQ1Y.jpg',
    'Charles é um inglês solteirão que sempre foge de compromisso. Ao longo de quatro casamentos e um funeral, ele conhece e se apaixona por Carrie, uma charmosa americana.',
    117,
    '["Comédia", "Romance", "Drama"]'::jsonb,
    'Mike Newell',
    '["Hugh Grant", "Andie MacDowell", "James Fleet", "Simon Callow"]'::jsonb
  ),
  (
    508883,
    'O Menino e a Garça',
    '君たちはどう生きるか',
    2023,
    '/f4oZTcfGrVTXKTWg157AwikXqmP.jpg',
    '/f4oZTcfGrVTXKTWg157AwikXqmP.jpg',
    'Durante a Segunda Guerra Mundial, o jovem Mahito perde a mãe e se muda para o campo. Lá ele encontra uma garça cinzenta falante e é guiado a uma torre mágica que leva a um mundo fantástico.',
    124,
    '["Animação", "Aventura", "Fantasia"]'::jsonb,
    'Hayao Miyazaki',
    '["Soma Santoki", "Masaki Suda", "Aimyon", "Yoshino Kimura"]'::jsonb
  ),
  (
    687163,
    'O Devorador de Estrelas',
    'Project Hail Mary',
    2026,
    '/yihdXomYb5kTeSivtFndMy5iDmf.jpg',
    '/ezbrL1dMymKQZw7mDEWa2ZTzN7d.jpg',
    'Um professor de ciências acorda sozinho numa nave, sem lembrar quem é nem por que está ali, e descobre que sua missão é salvar a Terra de uma ameaça que está apagando o Sol.',
    135,
    '["Ficção científica", "Aventura"]'::jsonb,
    'Phil Lord e Christopher Miller',
    '["Ryan Gosling", "Sandra Hüller", "Milana Vayntrub"]'::jsonb
  ),
  (
    12405,
    'Quem Quer Ser um Milionário?',
    'Slumdog Millionaire',
    2008,
    '/5leCCi7ZF0CawAfM5Qo2ECKPprc.jpg',
    '/tXjkwbJEq9NxzRPiokjsi3CPNjI.jpg',
    'Jamal Malik, um jovem de 18 anos órfão das favelas de Mumbai, está a uma pergunta de ganhar 20 milhões de rúpias na versão indiana de "Quem Quer Ser um Milionário?".',
    120,
    '["Drama", "Romance"]'::jsonb,
    'Danny Boyle',
    '["Dev Patel", "Freida Pinto", "Anil Kapoor", "Irrfan Khan"]'::jsonb
  ),
  (
    13459,
    'Barbie e a Magia de Aladus',
    'Barbie and the Magic of Pegasus 3-D',
    2005,
    '/wqKNLSzGN9lqnmtFFwu40g2eWgQ.jpg',
    '/lyBNJn16WIHIriX1bJVoOnv8U6Z.jpg',
    'A princesa Annika foge das garras do malvado feiticeiro Wenlock e descobre as maravilhas do Reino das Nuvens ao lado de um magnífico cavalo alado.',
    85,
    '["Animação", "Família", "Fantasia"]'::jsonb,
    'Greg Richardson',
    '["Kelly Sheridan", "Lalainia Lindbjerg", "Colin Murdock", "Mark Hildreth"]'::jsonb
  ),
  (
    54186,
    'Kokuhaku (Confissões)',
    '告白',
    2010,
    '/xQcnx6jMuPRCeidotgVy6YIls6p.jpg',
    '/sT7f721Zvb9Feo11sbhvkk2JLHi.jpg',
    'Uma professora do ensino fundamental, após a morte de sua filha na piscina da escola, anuncia em seu último dia de aula que a morte foi um assassinato cometido por dois alunos daquela mesma sala.',
    106,
    '["Drama", "Mistério", "Suspense"]'::jsonb,
    'Tetsuya Nakashima',
    '["Takako Matsu", "Yoshino Kimura", "Masaki Okada", "Yukito Nishii"]'::jsonb
  )
on conflict (tmdb_id) do update set
  title = excluded.title,
  poster_path = excluded.poster_path,
  backdrop_path = excluded.backdrop_path;

-- 4. Ciclos de 2026 (Janeiro a Setembro concluídos, Outubro ativo)
insert into public.cycles (tmdb_id, start_date, watch_deadline, status, notes)
values
  (1422, '2026-01-01', '2026-01-31', 'done', 'Janeiro 2026 • Escolhido por Luara'),
  (238, '2026-02-01', '2026-02-28', 'done', 'Fevereiro 2026 • Escolhido por Samuel'),
  (1813, '2026-03-01', '2026-03-31', 'done', 'Março 2026 • Escolhido por Luara'),
  (38, '2026-04-01', '2026-04-30', 'done', 'Abril 2026 • Escolhido por Samuel'),
  (712, '2026-05-01', '2026-05-31', 'done', 'Maio 2026 • Escolhido por Luara'),
  (508883, '2026-06-01', '2026-06-30', 'done', 'Junho 2026 • Escolhido por Samuel'),
  (687163, '2026-07-01', '2026-07-31', 'done', 'Julho 2026 • Escolhido por Luara'),
  (12405, '2026-08-01', '2026-08-31', 'done', 'Agosto 2026 • Escolhido por Samuel'),
  (13459, '2026-09-01', '2026-09-30', 'done', 'Setembro 2026 • Escolhido por Tamires'),
  (54186, '2026-10-01', '2026-10-31', 'active', 'Outubro 2026 • Escolhido por Filipe (Atrasado)')
on conflict do nothing;
