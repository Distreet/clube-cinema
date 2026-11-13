-- ==============================================================================
-- Clube do Livro - Agendamento da Sincronização Letterboxd (a cada 6 horas)
-- ==============================================================================

-- Habilita pg_net e pg_cron se suportados no projeto Supabase
create extension if not exists pg_net;
create extension if not exists pg_cron;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- Remove agendamento anterior caso exista
    perform cron.unschedule('sync-letterboxd-feed-job');

    -- Agenda para rodar a cada 6 horas (00:00, 06:00, 12:00, 18:00 UTC)
    -- Dispara chamada interna para a Edge Function letterboxd-sync
    perform cron.schedule(
      'sync-letterboxd-feed-job',
      '0 */6 * * *',
      $$
      select
        net.http_post(
          url := coalesce(
            current_setting('app.settings.supabase_url', true),
            'http://localhost:54321'
          ) || '/functions/v1/letterboxd-sync',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || coalesce(
              current_setting('app.settings.service_role_key', true),
              ''
            )
          ),
          body := '{}'::jsonb
        ) as request_id;
      $$
    );
  end if;
exception
  when others then
    -- Não interrompe caso o banco local ou plano não tenha pg_cron ativo
    null;
end;
$$;
