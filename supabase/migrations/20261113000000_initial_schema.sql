-- ==============================================================================
-- Clube do Livro - Migração Inicial
-- Schema, Triggers, RLS e Funções de Segurança
-- ==============================================================================

-- Habilita UUID caso não esteja disponível
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 1. TABELA: allowed_emails
-- E-mails que têm permissão de cadastro/login no clube
-- ==============================================================================
create table if not exists public.allowed_emails (
  email text primary key check (email = lower(trim(email)) and position('@' in email) > 1),
  created_at timestamptz not null default now()
);

comment on table public.allowed_emails is 'Lista de e-mails permitidos para cadastro e acesso ao clube.';

-- ==============================================================================
-- 2. TABELA: profiles
-- Perfis de usuários ligados a auth.users
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) >= 2 and char_length(display_name) <= 50),
  letterboxd_username text null check (
    letterboxd_username is null or (
      char_length(trim(letterboxd_username)) >= 2 and
      char_length(letterboxd_username) <= 40 and
      letterboxd_username ~* '^[a-zA-Z0-9_-]+$'
    )
  ),
  role text not null check (role in ('member', 'admin')) default 'member',
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);

-- ==============================================================================
-- 3. FUNÇÕES DE SUPORTE À SEGURANÇA (SECURITY DEFINER)
-- ==============================================================================

-- Verifica se o usuário atual é admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer stable;

-- Verifica se o usuário autenticado atual possui perfil válido
create or replace function public.is_allowed_user()
returns boolean as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = auth.uid()
  );
end;
$$ language plpgsql security definer stable;

-- ==============================================================================
-- 4. TABELA: movies (Cache local TMDB)
-- ==============================================================================
create table if not exists public.movies (
  tmdb_id integer primary key,
  title text not null check (char_length(trim(title)) > 0),
  original_title text not null,
  year integer not null check (year >= 1888 and year <= 2100),
  poster_path text null,
  backdrop_path text null,
  overview text null,
  runtime integer null check (runtime is null or runtime > 0),
  genres jsonb not null default '[]'::jsonb,
  director text null,
  cast_main jsonb not null default '[]'::jsonb,
  cached_at timestamptz not null default now()
);

create index if not exists idx_movies_year on public.movies(year);

-- ==============================================================================
-- 5. TABELA: suggestions (Acervo)
-- ==============================================================================
create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  tmdb_id integer not null references public.movies(tmdb_id) on delete cascade,
  suggested_by uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('pending', 'chosen', 'seen', 'archived')) default 'pending',
  created_at timestamptz not null default now(),
  constraint uq_suggestions_tmdb_id unique (tmdb_id)
);

create index if not exists idx_suggestions_status on public.suggestions(status);
create index if not exists idx_suggestions_suggested_by on public.suggestions(suggested_by);

-- ==============================================================================
-- 6. TABELA: votes
-- ==============================================================================
create table if not exists public.votes (
  suggestion_id uuid not null references public.suggestions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (suggestion_id, user_id)
);

-- ==============================================================================
-- 7. TABELA: cycles
-- ==============================================================================
create table if not exists public.cycles (
  id uuid primary key default gen_random_uuid(),
  tmdb_id integer not null references public.movies(tmdb_id) on delete restrict,
  start_date date not null,
  watch_deadline date not null check (watch_deadline >= start_date),
  discussion_date date null check (discussion_date is null or discussion_date >= start_date),
  status text not null check (status in ('active', 'done')) default 'active',
  notes text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_cycles_status on public.cycles(status);

-- ==============================================================================
-- 8. TABELA: watched_marks
-- ==============================================================================
create table if not exists public.watched_marks (
  cycle_id uuid not null references public.cycles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  watched_at timestamptz not null default now(),
  primary key (cycle_id, user_id)
);

-- ==============================================================================
-- 9. TABELA: reviews
-- Notas e críticas de membros
-- ==============================================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  tmdb_id integer not null references public.movies(tmdb_id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating numeric(2,1) check (rating is null or (rating >= 0.5 and rating <= 5.0 and mod((rating * 10)::numeric, 5) = 0)),
  review_text text null check (review_text is null or char_length(review_text) <= 5000),
  letterboxd_url text null check (letterboxd_url is null or letterboxd_url ~* '^https?://letterboxd\.com/'),
  watched_date date null,
  source text not null check (source in ('rss', 'manual')) default 'manual',
  updated_at timestamptz not null default now(),
  constraint uq_reviews_user_movie unique (user_id, tmdb_id)
);

create index if not exists idx_reviews_movie on public.reviews(tmdb_id);
create index if not exists idx_reviews_user on public.reviews(user_id);

-- ==============================================================================
-- 10. TABELA: sync_log
-- ==============================================================================
create table if not exists public.sync_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references public.profiles(id) on delete set null,
  ran_at timestamptz not null default now(),
  status text not null check (status in ('success', 'partial', 'error')),
  message text not null check (char_length(message) <= 2000)
);

create index if not exists idx_sync_log_ran_at on public.sync_log(ran_at desc);

-- ==============================================================================
-- 11. TABELA: settings
-- Configurações gerais (nome do clube etc.)
-- ==============================================================================
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Insere nome inicial do clube
insert into public.settings (key, value)
values ('club_name', '"Clube do Livro"'::jsonb)
on conflict (key) do nothing;

-- ==============================================================================
-- 12. TRIGGERS DE SEGURANÇA E INTEGRIDADE
-- ==============================================================================

-- 12.1 Validação de e-mail permitido antes de cadastrar no auth.users
create or replace function public.check_allowed_email()
returns trigger as $$
begin
  if not exists (
    select 1
    from public.allowed_emails
    where email = lower(trim(new.email))
  ) then
    raise exception 'Este e-mail (%) não está na lista de membros permitidos.', new.email;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger em auth.users para barrar cadastro não autorizado
drop trigger if exists trg_check_allowed_email on auth.users;
create trigger trg_check_allowed_email
  before insert on auth.users
  for each row
  execute function public.check_allowed_email();

-- 12.2 Criação automática de profile após auth.users
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_display_name text;
  v_letterboxd text;
  v_role text := 'member';
  v_count integer;
begin
  -- Se for o primeiro usuário cadastrado no sistema inteiro, concede admin automaticamente
  select count(*) into v_count from public.profiles;
  if v_count = 0 then
    v_role := 'admin';
  end if;

  v_display_name := coalesce(
    trim(new.raw_user_meta_data->>'display_name'),
    split_part(new.email, '@', 1)
  );
  if char_length(v_display_name) < 2 then
    v_display_name := 'Membro';
  end if;

  v_letterboxd := trim(new.raw_user_meta_data->>'letterboxd_username');
  if v_letterboxd = '' then
    v_letterboxd := null;
  end if;

  insert into public.profiles (id, display_name, letterboxd_username, role)
  values (new.id, v_display_name, v_letterboxd, v_role)
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_handle_new_user on auth.users;
create trigger trg_handle_new_user
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 12.3 Proteção contra alteração indevida de role em profiles
create or replace function public.protect_profile_role()
returns trigger as $$
begin
  if new.role is distinct from old.role then
    if not public.is_admin() then
      raise exception 'Apenas administradores podem alterar funções de usuários.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_protect_profile_role on public.profiles;
create trigger trg_protect_profile_role
  before update on public.profiles
  for each row
  execute function public.protect_profile_role();

-- 12.4 Proteção de reviews manuais contra sobreescrita por RSS
create or replace function public.protect_manual_review()
returns trigger as $$
begin
  -- Se o registro anterior era manual e a atualização vem como RSS, preserva a crítica manual
  if old.source = 'manual' and new.source = 'rss' then
    new.rating := coalesce(old.rating, new.rating);
    new.review_text := coalesce(old.review_text, new.review_text);
    new.source := 'manual';
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_protect_manual_review on public.reviews;
create trigger trg_protect_manual_review
  before update on public.reviews
  for each row
  execute function public.protect_manual_review();

-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) - ATIVADO EM TODAS AS TABELAS
-- ==============================================================================

alter table public.allowed_emails enable row level security;
alter table public.profiles enable row level security;
alter table public.movies enable row level security;
alter table public.suggestions enable row level security;
alter table public.votes enable row level security;
alter table public.cycles enable row level security;
alter table public.watched_marks enable row level security;
alter table public.reviews enable row level security;
alter table public.sync_log enable row level security;
alter table public.settings enable row level security;

-- ------------------------------------------------------------------------------
-- 13.1 Políticas para allowed_emails
-- ------------------------------------------------------------------------------
create policy "allowed_emails_select"
  on public.allowed_emails for select
  to authenticated
  using (public.is_allowed_user() or public.is_admin());

create policy "allowed_emails_admin_write"
  on public.allowed_emails for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------------------------
-- 13.2 Políticas para profiles
-- ------------------------------------------------------------------------------
create policy "profiles_select"
  on public.profiles for select
  to authenticated
  using (public.is_allowed_user() or auth.uid() = id);

create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (
    (auth.uid() = id and (role = (select role from public.profiles where id = auth.uid()) or public.is_admin()))
    or public.is_admin()
  );

create policy "profiles_admin_all"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------------------------
-- 13.3 Políticas para movies
-- ------------------------------------------------------------------------------
create policy "movies_select"
  on public.movies for select
  to authenticated
  using (public.is_allowed_user());

create policy "movies_admin_write"
  on public.movies for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------------------------
-- 13.4 Políticas para suggestions
-- ------------------------------------------------------------------------------
create policy "suggestions_select"
  on public.suggestions for select
  to authenticated
  using (public.is_allowed_user());

create policy "suggestions_insert_member"
  on public.suggestions for insert
  to authenticated
  with check (
    public.is_allowed_user() and
    suggested_by = auth.uid() and
    status = 'pending'
  );

create policy "suggestions_update_member"
  on public.suggestions for update
  to authenticated
  using (
    (suggested_by = auth.uid() and status = 'pending') or public.is_admin()
  )
  with check (
    (suggested_by = auth.uid() and status = 'pending') or public.is_admin()
  );

create policy "suggestions_delete_member_or_admin"
  on public.suggestions for delete
  to authenticated
  using (
    (suggested_by = auth.uid() and status = 'pending') or public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- 13.5 Políticas para votes
-- ------------------------------------------------------------------------------
create policy "votes_select"
  on public.votes for select
  to authenticated
  using (public.is_allowed_user());

create policy "votes_insert_self"
  on public.votes for insert
  to authenticated
  with check (public.is_allowed_user() and user_id = auth.uid());

create policy "votes_delete_self"
  on public.votes for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ------------------------------------------------------------------------------
-- 13.6 Políticas para cycles
-- ------------------------------------------------------------------------------
create policy "cycles_select"
  on public.cycles for select
  to authenticated
  using (public.is_allowed_user());

create policy "cycles_admin_write"
  on public.cycles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------------------------
-- 13.7 Políticas para watched_marks
-- ------------------------------------------------------------------------------
create policy "watched_marks_select"
  on public.watched_marks for select
  to authenticated
  using (public.is_allowed_user());

create policy "watched_marks_insert_self"
  on public.watched_marks for insert
  to authenticated
  with check (public.is_allowed_user() and user_id = auth.uid());

create policy "watched_marks_delete_self"
  on public.watched_marks for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ------------------------------------------------------------------------------
-- 13.8 Políticas para reviews
-- ------------------------------------------------------------------------------
create policy "reviews_select"
  on public.reviews for select
  to authenticated
  using (public.is_allowed_user());

create policy "reviews_insert_member_or_admin"
  on public.reviews for insert
  to authenticated
  with check (
    public.is_allowed_user() and (
      user_id = auth.uid() or public.is_admin()
    )
  );

create policy "reviews_update_member_or_admin"
  on public.reviews for update
  to authenticated
  using (
    public.is_allowed_user() and (
      user_id = auth.uid() or public.is_admin()
    )
  )
  with check (
    public.is_allowed_user() and (
      user_id = auth.uid() or public.is_admin()
    )
  );

create policy "reviews_delete_member_or_admin"
  on public.reviews for delete
  to authenticated
  using (
    user_id = auth.uid() or public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- 13.9 Políticas para sync_log
-- ------------------------------------------------------------------------------
create policy "sync_log_admin_read"
  on public.sync_log for select
  to authenticated
  using (public.is_admin());

create policy "sync_log_admin_insert"
  on public.sync_log for insert
  to authenticated
  with check (public.is_admin());

-- ------------------------------------------------------------------------------
-- 13.10 Políticas para settings
-- ------------------------------------------------------------------------------
create policy "settings_select"
  on public.settings for select
  to authenticated
  using (public.is_allowed_user());

create policy "settings_admin_write"
  on public.settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ==============================================================================
-- 14. SUPABASE INACTIVITY PREVENT (pg_cron)
-- ==============================================================================
-- Opcional: caso a extensão pg_cron esteja habilitada no projeto Supabase,
-- este agendamento roda uma query leve a cada 5 dias para manter o banco ativo.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'keep-alive-club-ping',
      '0 4 */5 * *',
      'select count(*) from public.settings;'
    );
  end if;
exception
  when others then
    -- Ignora silenciosamente se o ambiente não possuir suporte ou privilégio para pg_cron
    null;
end;
$$;
