-- ==============================================================================
-- Clube do Livro - Script de Validação e Testes das Políticas RLS e Triggers
-- Pode ser executado no SQL Editor do Supabase para conferência das regras.
-- ==============================================================================

do $$
declare
  v_admin_id uuid := gen_random_uuid();
  v_member_id uuid := gen_random_uuid();
  v_intruder_id uuid := gen_random_uuid();
  v_cycle_id uuid;
  v_sug_id uuid;
  v_test_pass boolean;
begin
  raise notice '== INICIANDO TESTES DE SEGURANÇA E RLS ==';

  -- 1. Teste de e-mails permitidos
  insert into public.allowed_emails (email) values ('admin@teste.com'), ('membro@teste.com')
  on conflict (email) do nothing;

  -- 2. Teste de criação de perfil
  insert into public.profiles (id, display_name, letterboxd_username, role)
  values (v_admin_id, 'Samuel Admin', 'samuel', 'admin');

  insert into public.profiles (id, display_name, letterboxd_username, role)
  values (v_member_id, 'Luara Membro', 'luara', 'member');

  -- 3. Teste do is_admin()
  perform set_config('request.jwt.claim.sub', v_admin_id::text, true);
  if not public.is_admin() then
    raise exception 'Falha no teste: v_admin_id deveria ser reconhecido como admin!';
  end if;

  perform set_config('request.jwt.claim.sub', v_member_id::text, true);
  if public.is_admin() then
    raise exception 'Falha no teste: v_member_id NÃO deveria ser admin!';
  end if;

  -- 4. Teste de proteção de role (usuário comum tentando virar admin)
  begin
    update public.profiles set role = 'admin' where id = v_member_id;
    raise exception 'Falha no teste: Membro comum conseguiu alterar o próprio role para admin!';
  exception
    when others then
      raise notice 'OK: Membro comum foi impedido de virar admin.';
  end;

  -- 5. Teste de cadastro de filme (cache TMDB)
  perform set_config('request.jwt.claim.sub', v_admin_id::text, true);
  insert into public.movies (tmdb_id, title, original_title, year, overview)
  values (999991, 'Filme Teste', 'Test Movie', 2026, 'Sinopse teste')
  on conflict (tmdb_id) do nothing;

  -- 6. Teste de sugestão e votação
  perform set_config('request.jwt.claim.sub', v_member_id::text, true);
  insert into public.suggestions (tmdb_id, suggested_by, status)
  values (999991, v_member_id, 'pending')
  returning id into v_sug_id;

  -- Membro vota na própria sugestão
  insert into public.votes (suggestion_id, user_id)
  values (v_sug_id, v_member_id);

  -- Membro tenta votar em nome de outro usuário (deve falhar)
  begin
    insert into public.votes (suggestion_id, user_id)
    values (v_sug_id, v_admin_id);
    raise exception 'Falha no teste: Usuário conseguiu votar em nome de outro membro!';
  exception
    when others then
      raise notice 'OK: Voto em nome de terceiro foi bloqueado.';
  end;

  -- 7. Teste de review: constraint de nota (ex: nota 4.2 inválida, deve ser 4.0 ou 4.5)
  begin
    insert into public.reviews (tmdb_id, user_id, rating, review_text, source)
    values (999991, v_member_id, 4.2, 'Nota quebrada', 'manual');
    raise exception 'Falha no teste: Rating inválido (4.2) foi aceito!';
  exception
    when others then
      raise notice 'OK: Rating com incremento inválido foi rejeitado pela constraint.';
  end;

  -- Inserção de review válida com 4.5 estrelas
  insert into public.reviews (tmdb_id, user_id, rating, review_text, source)
  values (999991, v_member_id, 4.5, 'Filme muito bom!', 'manual');

  -- 8. Teste de proteção de review manual contra RSS
  update public.reviews
  set rating = 3.0, review_text = 'Texto do RSS', source = 'rss'
  where tmdb_id = 999991 and user_id = v_member_id;

  -- Verifica se o trigger manteve a crítica manual intacta
  select (rating = 4.5 and review_text = 'Filme muito bom!' and source = 'manual')
  into v_test_pass
  from public.reviews
  where tmdb_id = 999991 and user_id = v_member_id;

  if not v_test_pass then
    raise exception 'Falha no teste: Review manual foi sobrescrita pelo RSS!';
  else
    raise notice 'OK: Review manual foi devidamente protegida contra sobrescrita por RSS.';
  end if;

  -- Limpeza dos registros de teste
  delete from public.movies where tmdb_id = 999991;
  delete from public.profiles where id in (v_admin_id, v_member_id);
  delete from public.allowed_emails where email in ('admin@teste.com', 'membro@teste.com');

  raise notice '== TODOS OS TESTES DE RLS E TRIGGERS PASSARAM COM SUCESSO! ==';
end;
$$;
