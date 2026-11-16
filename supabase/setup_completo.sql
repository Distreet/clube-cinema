-- ==============================================================================
-- Clube do Filme - Setup Completo do Banco de Dados Supabase
-- ==============================================================================

-- 1. Limpa tabelas existentes para recriação limpa e sem conflitos de chave
drop table if exists public.reviews cascade;
drop table if exists public.watched_marks cascade;
drop table if exists public.votes cascade;
drop table if exists public.suggestions cascade;
drop table if exists public.cycles cascade;
drop table if exists public.movies cascade;
drop table if exists public.profiles cascade;
drop table if exists public.allowed_emails cascade;
drop table if exists public.settings cascade;

-- ==============================================================================
-- 2. TABELA: profiles (Perfis dos Integrantes)
-- ==============================================================================
create table public.profiles (
  id text primary key,
  display_name text not null,
  email text null,
  letterboxd_username text null,
  avatar_url text null,
  role text not null check (role in ('member', 'admin')) default 'member',
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 3. TABELA: settings (Configurações Gerais do Clube)
-- ==============================================================================
create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 4. TABELA: allowed_emails (Lista de E-mails Autorizados)
-- ==============================================================================
create table public.allowed_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 5. TABELA: movies (Filmes em Cache TMDB)
-- ==============================================================================
create table public.movies (
  tmdb_id integer primary key,
  title text not null,
  original_title text not null,
  year integer not null,
  poster_path text null,
  backdrop_path text null,
  overview text null,
  runtime integer null,
  genres jsonb not null default '[]'::jsonb,
  director text null,
  cast_main jsonb not null default '[]'::jsonb,
  cached_at timestamptz not null default now()
);

-- ==============================================================================
-- 6. TABELA: suggestions (Acervo de Sugestões)
-- ==============================================================================
create table public.suggestions (
  id text primary key,
  tmdb_id integer not null references public.movies(tmdb_id) on delete cascade,
  suggested_by text not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('pending', 'chosen', 'seen', 'archived')) default 'pending',
  created_at timestamptz not null default now(),
  constraint uq_suggestions_tmdb_id unique (tmdb_id)
);

-- ==============================================================================
-- 7. TABELA: votes (Votos do Acervo)
-- ==============================================================================
create table public.votes (
  suggestion_id text not null references public.suggestions(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (suggestion_id, user_id)
);

-- ==============================================================================
-- 8. TABELA: cycles (Sessões / Ciclos Mensais)
-- ==============================================================================
create table public.cycles (
  id text primary key,
  tmdb_id integer not null references public.movies(tmdb_id) on delete restrict,
  start_date date not null,
  watch_deadline date not null,
  discussion_date date null,
  status text not null check (status in ('active', 'done')) default 'active',
  notes text null,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 9. TABELA: watched_marks (Quem já assistiu na sessão ativa)
-- ==============================================================================
create table public.watched_marks (
  cycle_id text not null references public.cycles(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  watched_at timestamptz not null default now(),
  primary key (cycle_id, user_id)
);

-- ==============================================================================
-- 10. TABELA: reviews (Notas e Críticas dos Membros)
-- ==============================================================================
create table public.reviews (
  id text primary key,
  tmdb_id integer not null references public.movies(tmdb_id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  rating numeric(2,1) check (rating is null or (rating >= 0.5 and rating <= 5.0)),
  review_text text null,
  letterboxd_url text null,
  watched_date date null,
  source text not null check (source in ('rss', 'manual')) default 'manual',
  updated_at timestamptz not null default now(),
  constraint uq_reviews_user_movie unique (user_id, tmdb_id)
);

-- ==============================================================================
-- 11. HABILITAR ROW LEVEL SECURITY (RLS) COM POLÍTICAS DE ACESSO
-- Permite leitura e escrita direta pela chave anon pública da aplicação
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.allowed_emails enable row level security;
alter table public.movies enable row level security;
alter table public.suggestions enable row level security;
alter table public.votes enable row level security;
alter table public.cycles enable row level security;
alter table public.watched_marks enable row level security;
alter table public.reviews enable row level security;

create policy "profiles_anon_all" on public.profiles for all to anon, authenticated using (true) with check (true);
create policy "settings_anon_all" on public.settings for all to anon, authenticated using (true) with check (true);
create policy "allowed_emails_anon_all" on public.allowed_emails for all to anon, authenticated using (true) with check (true);
create policy "movies_anon_all" on public.movies for all to anon, authenticated using (true) with check (true);
create policy "suggestions_anon_all" on public.suggestions for all to anon, authenticated using (true) with check (true);
create policy "votes_anon_all" on public.votes for all to anon, authenticated using (true) with check (true);
create policy "cycles_anon_all" on public.cycles for all to anon, authenticated using (true) with check (true);
create policy "watched_marks_anon_all" on public.watched_marks for all to anon, authenticated using (true) with check (true);
create policy "reviews_anon_all" on public.reviews for all to anon, authenticated using (true) with check (true);

-- ==============================================================================
-- 12. SEED: 1. Perfis Oficiais dos 4 Integrantes
-- ==============================================================================
insert into public.profiles (id, display_name, email, letterboxd_username, avatar_url, role)
values
  ('member-samuel', 'Samuel', 'samuelnasc2805@gmail.com', 'Distreett', '/avatars/samuel.jpg', 'admin'),
  ('member-luara', 'Luara', 'luara@example.com', 'luarasousa', '/avatars/luara.jpg', 'member'),
  ('member-filipe', 'Filipe', 'filipe@example.com', 'philipassoz', '/avatars/filipe.jpg', 'member'),
  ('member-tamires', 'Tamires', 'tamires@example.com', 'tamintf', '/avatars/tamires.jpg', 'member')
on conflict (id) do update set
  display_name = excluded.display_name,
  avatar_url = excluded.avatar_url,
  letterboxd_username = excluded.letterboxd_username;

-- 2. Configurações
insert into public.settings (key, value)
values ('club_name', '"Clube do Filme"'::jsonb)
on conflict (key) do update set value = excluded.value;

-- 3. E-mails permitidos
insert into public.allowed_emails (email)
values
  ('samuelnasc2805@gmail.com'),
  ('samuel@example.com'),
  ('luara@example.com'),
  ('filipe@example.com'),
  ('tamires@example.com')
on conflict (email) do nothing;

-- ==============================================================================
-- 13. SEED: Filmes de 2026 (Histórico + Sessão Ativa) + Sugestões do Acervo
-- ==============================================================================
insert into public.movies (tmdb_id, title, original_title, year, poster_path, backdrop_path, overview, runtime, genres, director, cast_main)
values
  (1422, 'Os Infiltrados', 'The Departed', 2006, '/nT97ifVT2J1yMQmeq20Qblg61T.jpg', '/6WRrGYalXXveItfpnipYdayFkQB.jpg', 'A polícia de Boston trava uma verdadeira guerra contra o crime organizado. Billy Costigan, um jovem policial, recebe a missão de se infiltrar na máfia comandada por Frank Costello. Indicado por Luara.', 151, '["Drama", "Crime", "Suspense"]'::jsonb, 'Martin Scorsese', '["Leonardo DiCaprio", "Matt Damon", "Jack Nicholson", "Mark Wahlberg"]'::jsonb),
  (238, 'O Poderoso Chefão', 'The Godfather', 1972, '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg', 'Uma dinastia da máfia ítalo-americana transfere o controle de seu império clandestino de seu patriarca envelhecido para seu filho relutante. Indicado por Samuel.', 175, '["Drama", "Crime"]'::jsonb, 'Francis Ford Coppola', '["Marlon Brando", "Al Pacino", "James Caan", "Robert Duvall"]'::jsonb),
  (1813, 'O Advogado do Diabo', 'The Devil''s Advocate', 1997, '/5ZzBGpxy55OQzHxKVY11IpY6a0o.jpg', '/i9lR2jLV0dHVfVs1u6QqqbQAE9I.jpg', 'Kevin Lomax, um jovem advogado talentoso que nunca perdeu uma causa, é contratado por uma prestigiada firma em Nova York liderada pelo magnético John Milton. Indicado por Luara.', 144, '["Drama", "Mistério", "Suspense"]'::jsonb, 'Taylor Hackford', '["Keanu Reeves", "Al Pacino", "Charlize Theron", "Jeffrey Jones"]'::jsonb),
  (38, 'Brilho Eterno de uma Mente sem Lembranças', 'Eternal Sunshine of the Spotless Mind', 2004, '/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg', '/8AE7M2lMsyvowfT36porzGtmOtI.jpg', 'Depois de um término doloroso, um homem descobre que a ex contratou um procedimento para apagar as memórias do relacionamento e decide fazer o mesmo. Indicado por Samuel.', 108, '["Romance", "Ficção científica", "Drama"]'::jsonb, 'Michel Gondry', '["Jim Carrey", "Kate Winslet", "Kirsten Dunst", "Mark Ruffalo"]'::jsonb),
  (712, 'Quatro Casamentos e um Funeral', 'Four Weddings and a Funeral', 1994, '/qa72G2VS0bpxms6yo0tI9vsHm2e.jpg', '/xO7khpMXKK1boeAHG13N6mmwQ1Y.jpg', 'Charles é um inglês solteirão que sempre foge de compromisso. Ao longo de quatro casamentos e um funeral, ele conhece e se apaixona por Carrie, uma charmosa americana. Indicado por Luara.', 117, '["Comédia", "Romance", "Drama"]'::jsonb, 'Mike Newell', '["Hugh Grant", "Andie MacDowell", "James Fleet", "Simon Callow"]'::jsonb),
  (508883, 'O Menino e a Garça', '君たちはどう生きるか', 2023, '/f4oZTcfGrVTXKTWg157AwikXqmP.jpg', '/f4oZTcfGrVTXKTWg157AwikXqmP.jpg', 'Durante a Segunda Guerra Mundial, o jovem Mahito perde a mãe e se muda para o campo. Lá ele encontra uma garça cinzenta falante e é guiado a uma torre mágica que leva a um mundo fantástico. Indicado por Samuel.', 124, '["Animação", "Aventura", "Fantasia"]'::jsonb, 'Hayao Miyazaki', '["Soma Santoki", "Masaki Suda", "Aimyon", "Yoshino Kimura"]'::jsonb),
  (687163, 'O Devorador de Estrelas', 'Project Hail Mary', 2026, '/yihdXomYb5kTeSivtFndMy5iDmf.jpg', '/ezbrL1dMymKQZw7mDEWa2ZTzN7d.jpg', 'Um professor de ciências acorda sozinho numa nave, sem lembrar quem é nem por que está ali, e descobre que sua missão é salvar a Terra de uma ameaça que está apagando o Sol. Indicado por Luara.', 135, '["Ficção científica", "Aventura"]'::jsonb, 'Phil Lord e Christopher Miller', '["Ryan Gosling", "Sandra Hüller", "Milana Vayntrub"]'::jsonb),
  (12405, 'Quem Quer Ser um Milionário?', 'Slumdog Millionaire', 2008, '/5leCCi7ZF0CawAfM5Qo2ECKPprc.jpg', '/tXjkwbJEq9NxzRPiokjsi3CPNjI.jpg', 'Jamal Malik, um jovem de 18 anos órfão das favelas de Mumbai, está a uma pergunta de ganhar 20 milhões de rúpias na versão indiana de "Quem Quer Ser um Milionário?". Indicado por Samuel.', 120, '["Drama", "Romance"]'::jsonb, 'Danny Boyle', '["Dev Patel", "Freida Pinto", "Anil Kapoor", "Irrfan Khan"]'::jsonb),
  (13459, 'Barbie e a Magia de Aladus', 'Barbie and the Magic of Pegasus 3-D', 2005, '/wqKNLSzGN9lqnmtFFwu40g2eWgQ.jpg', '/lyBNJn16WIHIriX1bJVoOnv8U6Z.jpg', 'A princesa Annika foge das garras do malvado feiticeiro Wenlock e descobre as maravilhas do Reino das Nuvens ao lado de um magnífico cavalo alado. Indicado por Tamires.', 85, '["Animação", "Família", "Fantasia"]'::jsonb, 'Greg Richardson', '["Kelly Sheridan", "Lalainia Lindbjerg", "Colin Murdock", "Mark Hildreth"]'::jsonb),
  (54186, 'Kokuhaku (Confissões)', '告白', 2010, '/xQcnx6jMuPRCeidotgVy6YIls6p.jpg', '/sT7f721Zvb9Feo11sbhvkk2JLHi.jpg', 'Uma professora do ensino fundamental anuncia em seu último dia de aula que a morte da sua filha foi um assassinato cometido por alunos daquela sala. Indicado por Filipe.', 106, '["Drama", "Mistério", "Suspense"]'::jsonb, 'Tetsuya Nakashima', '["Takako Matsu", "Yoshino Kimura", "Masaki Okada", "Yukito Nishii"]'::jsonb),
  -- Filmes sugeridos no Acervo Inicial
  (915935, 'Anatomia de uma Queda', 'Anatomie d''une chute', 2023, '/zIxTPoS6zd3txeLP5FUdo3CSfbo.jpg', '/kszooR7v1TLFM4pzx6IkKq2jDAN.jpg', 'Uma mulher é suspeita do assassinato do marido após ele cair da janela do chalé isolado onde moravam nos Alpes franceses.', 151, '["Drama", "Mistério", "Crime"]'::jsonb, 'Justine Triet', '["Sandra Hüller", "Swann Arlaud", "Milo Machado Graner"]'::jsonb),
  (965150, 'Aftersun', 'Aftersun', 2022, '/4jdduww9j5RyzO4ITRcuBFhqNN1.jpg', '/5X9AAdtXFZIvbShkIqKvWqfwb3P.jpg', 'Sophie reflete sobre a alegria compartilhada e a melancolia privada de umas férias que passou com seu pai vinte anos antes.', 102, '["Drama"]'::jsonb, 'Charlotte Wells', '["Paul Mescal", "Frankie Corio", "Celia Rowlson-Hall"]'::jsonb),
  (157336, 'Interestelar', 'Interstellar', 2014, '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', '/xJHokMbljvjADYdit5fK5VQsXEG.jpg', 'Um grupo de cientistas embarca em uma viagem através de um buraco de minhoca em busca de um novo lar para a humanidade.', 169, '["Aventura", "Drama", "Ficção científica"]'::jsonb, 'Christopher Nolan', '["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"]'::jsonb),
  (933260, 'A Substância', 'The Substance', 2024, '/7bBCq3xQ2sOsu47mJ9ZdrGzTf1y.jpg', '/7x30i6RdfXgN3i64uQ0rY2rG0J8.jpg', 'Uma celebridade em declínio decide usar uma droga do mercado clandestino que gera uma versão mais jovem e perfeita de si mesma.', 141, '["Terror", "Ficção científica"]'::jsonb, 'Coralie Fargeat', '["Demi Moore", "Margaret Qualley", "Dennis Quaid"]'::jsonb),
  (10774, 'Rede de Intrigas', 'Network', 1976, '/9CqK6fS2m4LhW22pM7PZqFq6Yx.jpg', '/zK1x1tL8rB7fB8s7eB5l8k1e3p.jpg', 'Um apresentador veterano de telejornal tem um colapso nervoso no ar e a emissora aproveita o aumento de audiência para transformá-lo num espetáculo.', 121, '["Drama"]'::jsonb, 'Sidney Lumet', '["Faye Dunaway", "William Holden", "Peter Finch"]'::jsonb)
on conflict (tmdb_id) do update set
  title = excluded.title,
  poster_path = excluded.poster_path,
  backdrop_path = excluded.backdrop_path;

-- ==============================================================================
-- 14. SEED: Ciclos das Sessões de 2026
-- ==============================================================================
insert into public.cycles (id, tmdb_id, start_date, watch_deadline, status, notes)
values
  ('cycle-jan-2026', 1422, '2026-01-01', '2026-01-31', 'done', 'Janeiro 2026 • Escolhido por Luara'),
  ('cycle-fev-2026', 238, '2026-02-01', '2026-02-28', 'done', 'Fevereiro 2026 • Escolhido por Samuel'),
  ('cycle-mar-2026', 1813, '2026-03-01', '2026-03-31', 'done', 'Março 2026 • Escolhido por Luara'),
  ('cycle-abr-2026', 38, '2026-04-01', '2026-04-30', 'done', 'Abril 2026 • Escolhido por Samuel'),
  ('cycle-mai-2026', 712, '2026-05-01', '2026-05-31', 'done', 'Maio 2026 • Escolhido por Luara'),
  ('cycle-jun-2026', 508883, '2026-06-01', '2026-06-30', 'done', 'Junho 2026 • Escolhido por Samuel'),
  ('cycle-jul-2026', 687163, '2026-07-01', '2026-07-31', 'done', 'Julho 2026 • Escolhido por Luara'),
  ('cycle-ago-2026', 12405, '2026-08-01', '2026-08-31', 'done', 'Agosto 2026 • Escolhido por Samuel'),
  ('cycle-set-2026', 13459, '2026-09-01', '2026-09-30', 'done', 'Setembro 2026 • Escolhido por Tamires'),
  ('cycle-out-2026', 54186, '2026-10-01', '2026-10-31', 'active', 'Outubro 2026 • Escolhido por Filipe (Atrasado)')
on conflict (id) do nothing;

-- ==============================================================================
-- 15. SEED: Avaliações Oficiais dos Integrantes (Janeiro a Setembro 2026)
-- ==============================================================================
insert into public.reviews (id, tmdb_id, user_id, rating, review_text, letterboxd_url)
values
  -- Janeiro: Os Infiltrados (Luara 4.0, Samuel 4.0)
  ('rev-inf-luara', 1422, 'member-luara', 4.0, 'Scorsese no seu auge moderno. Tensão do início ao fim e um elenco espetacular.', 'https://letterboxd.com/luarasousa/film/the-departed/'),
  ('rev-inf-samuel', 1422, 'member-samuel', 4.0, 'Um dos melhores finais de filme policial de todos os tempos. Que abertura de ano!', 'https://letterboxd.com/Distreett/film/the-departed/'),

  -- Fevereiro: O Poderoso Chefão (Samuel 5.0, Luara 5.0)
  ('rev-god-samuel', 238, 'member-samuel', 5.0, 'Perfeição cinematográfica. Não há um único segundo desperdiçado.', 'https://letterboxd.com/Distreett/film/the-godfather/'),
  ('rev-god-luara', 238, 'member-luara', 5.0, 'Absolutamente atemporal. A transformação de Michael Corleone é impecável.', 'https://letterboxd.com/luarasousa/film/the-godfather/'),

  -- Março: O Advogado do Diabo (Samuel 2.5, Luara 3.0)
  ('rev-adv-samuel', 1813, 'member-samuel', 2.5, 'Al Pacino rouba a cena, mas o filme tem seus exageros característicos dos anos 90.', 'https://letterboxd.com/Distreett/film/the-devils-advocate/'),
  ('rev-adv-luara', 1813, 'member-luara', 3.0, 'Narrativa envolvente com um final bem marcante.', 'https://letterboxd.com/luarasousa/film/the-devils-advocate/'),

  -- Abril: Brilho Eterno de uma Mente sem Lembranças (Samuel 4.0, Luara 4.0)
  ('rev-bri-samuel', 38, 'member-samuel', 4.0, 'Roteiro brilhante do Charlie Kaufman. Jim Carrey e Kate Winslet perfeitos.', 'https://letterboxd.com/Distreett/film/eternal-sunshine-of-the-spotless-mind/'),
  ('rev-bri-luara', 38, 'member-luara', 4.0, 'Doloroso e belo na mesma medida. Uma das melhores histórias de amor já filmadas.', 'https://letterboxd.com/luarasousa/film/eternal-sunshine-of-the-spotless-mind/'),

  -- Maio: Quatro Casamentos e um Funeral (Samuel 2.0, Luara 3.0)
  ('rev-cas-samuel', 712, 'member-samuel', 2.0, 'Hugh Grant no seu melhor momento nos anos 90. Divertido e comovente.', 'https://letterboxd.com/Distreett/film/four-weddings-and-a-funeral/'),
  ('rev-cas-luara', 712, 'member-luara', 3.0, 'O humor britânico no seu ápice. Um clássico aconchegante que sempre faz bem assistir.', 'https://letterboxd.com/luarasousa/film/four-weddings-and-a-funeral/'),

  -- Junho: O Menino e a Garça (Luara 4.0, Samuel 3.5)
  ('rev-gar-luara', 508883, 'member-luara', 4.0, 'Mais uma obra-prima visual do Studio Ghibli. Poético e profundo sobre o luto.', 'https://letterboxd.com/luarasousa/film/the-boy-and-the-heron/'),
  ('rev-gar-samuel', 508883, 'member-samuel', 3.5, 'Visualmente deslumbrante como sempre, embora um pouco mais enigmático no roteiro.', 'https://letterboxd.com/Distreett/film/the-boy-and-the-heron/'),

  -- Julho: O Devorador de Estrelas (Samuel 4.0, Luara 3.5)
  ('rev-dev-samuel', 687163, 'member-samuel', 4.0, 'Adaptação espetacular! A ciência combinada com o coração da história funcionou perfeitamente.', 'https://letterboxd.com/Distreett/film/project-hail-mary/'),
  ('rev-dev-luara', 687163, 'member-luara', 3.5, 'Tensão espacial de alto nível. Ryan Gosling carrega o filme com muito carisma.', 'https://letterboxd.com/luarasousa/film/project-hail-mary/'),

  -- Agosto: Quem Quer Ser um Milionário? (Samuel 3.0, Luara 3.0)
  ('rev-mil-samuel', 12405, 'member-samuel', 3.0, 'Ritmo frenético do Danny Boyle e uma trilha sonora memorável. Grande sessão.', 'https://letterboxd.com/Distreett/film/slumdog-millionaire/'),
  ('rev-mil-luara', 12405, 'member-luara', 3.0, 'História emocionante com uma energia incrível do início ao fim.', 'https://letterboxd.com/luarasousa/film/slumdog-millionaire/'),

  -- Setembro: Barbie e a Magia de Aladus (Samuel 2.5, Luara 3.5, Filipe 3.0, Tamires 4.0)
  ('rev-bar-tamires', 13459, 'member-tamires', 4.0, 'Nostalgia pura! Minha infância todinha nessa história e na trilha sonora.', 'https://letterboxd.com/tamintf/film/barbie-and-the-magic-of-pegasus/'),
  ('rev-bar-luara', 13459, 'member-luara', 3.5, 'Rendeu as melhores risadas e memórias da nossa sessão.', 'https://letterboxd.com/luarasousa/film/barbie-and-the-magic-of-pegasus/'),
  ('rev-bar-filipe', 13459, 'member-filipe', 3.0, 'Surpreendentemente épico para um filme da Barbie.', 'https://letterboxd.com/philipassoz/film/barbie-and-the-magic-of-pegasus/'),
  ('rev-bar-samuel', 13459, 'member-samuel', 2.5, 'Foi muito divertido ver com o grupo. Uma viagem aos anos 2000.', 'https://letterboxd.com/Distreett/film/barbie-and-the-magic-of-pegasus/')
on conflict (user_id, tmdb_id) do update set
  rating = excluded.rating,
  review_text = excluded.review_text;

-- ==============================================================================
-- 16. SEED: Sugestões Iniciais do Acervo e Votos
-- ==============================================================================
insert into public.suggestions (id, tmdb_id, suggested_by, status)
values
  ('sug-1', 915935, 'member-samuel', 'pending'),
  ('sug-2', 965150, 'member-luara', 'pending'),
  ('sug-3', 157336, 'member-samuel', 'pending'),
  ('sug-4', 933260, 'member-tamires', 'pending'),
  ('sug-5', 10774, 'member-filipe', 'pending')
on conflict (tmdb_id) do nothing;

insert into public.votes (suggestion_id, user_id)
values
  -- Anatomia de uma Queda (3 votos)
  ('sug-1', 'member-samuel'),
  ('sug-1', 'member-luara'),
  ('sug-1', 'member-filipe'),
  -- Aftersun (2 votos)
  ('sug-2', 'member-luara'),
  ('sug-2', 'member-samuel'),
  -- Interestelar (3 votos)
  ('sug-3', 'member-samuel'),
  ('sug-3', 'member-filipe'),
  ('sug-3', 'member-tamires'),
  -- A Substância (2 votos)
  ('sug-4', 'member-tamires'),
  ('sug-4', 'member-luara'),
  -- Rede de Intrigas (1 voto)
  ('sug-5', 'member-filipe')
on conflict (suggestion_id, user_id) do nothing;
