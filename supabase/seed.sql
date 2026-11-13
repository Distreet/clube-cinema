-- ==============================================================================
-- Clube do Livro - Seed de Desenvolvimento
-- ==============================================================================

-- 1. E-mails permitidos dos membros iniciais
-- Substitua pelos e-mails reais de Samuel, Luara, Filipe e Tamires antes de rodar em produção
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
