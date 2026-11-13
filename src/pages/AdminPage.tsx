import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { syncLetterboxdNow, fetchSyncLogs } from '../services/letterboxd';
import type { SyncLogEntry, SyncResult } from '../services/letterboxd';

export const AdminPage: React.FC = () => {
  const { isAdmin, profile } = useAuth();
  const [logs, setLogs] = useState<SyncLogEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<SyncResult | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchSyncLogs().then(setLogs);
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <section id="admin">
        <h2>Acesso restrito</h2>
        <p className="lead">
          Esta área é restrita a administradores do clube. Seu usuário atual (
          {profile?.displayName || 'Visitante'}) não possui permissão de administrador.
        </p>
      </section>
    );
  }

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);

    const result = await syncLetterboxdNow();
    setIsSyncing(false);
    setSyncFeedback(result);

    // Atualiza a lista de logs
    const updatedLogs = await fetchSyncLogs();
    setLogs(updatedLogs);
  };

  return (
    <section id="admin" aria-label="Painel administrativo">
      <h2>Painel administrativo</h2>
      <p className="lead">
        Gerencie sincronizações do Letterboxd, ciclos, sugestões e membros do clube.
      </p>

      {/* Seção Letterboxd Sync */}
      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          padding: 22,
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 20, margin: 0 }}>Sincronização com o Letterboxd</h3>
            <p className="mut" style={{ fontSize: 14, margin: '4px 0 0' }}>
              Os feeds RSS são lidos automaticamente a cada 6 horas. Você também pode forçar uma sincronização manual a qualquer momento.
            </p>
          </div>

          <button
            type="button"
            className="btn"
            onClick={handleSyncNow}
            disabled={isSyncing}
            style={{ padding: '10px 18px', fontSize: 14 }}
          >
            {isSyncing ? 'Sincronizando feeds...' : 'Sincronizar Letterboxd agora'}
          </button>
        </div>

        {/* Feedback da sincronização */}
        {syncFeedback && (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 8,
              background: syncFeedback.success ? '#2f8f6b22' : '#c0392b22',
              border: `1px solid ${syncFeedback.success ? '#2f8f6b' : '#c0392b'}`,
              color: 'var(--tx)',
              fontSize: 14,
            }}
          >
            <strong>{syncFeedback.success ? '✓ Sucesso:' : '✕ Erro:'}</strong>{' '}
            {syncFeedback.message || syncFeedback.error}

            {syncFeedback.summary && syncFeedback.summary.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 13 }}>
                {syncFeedback.summary.map((s, i) => (
                  <div key={i} style={{ color: s.error ? 'var(--rose)' : 'var(--mut)' }}>
                    • <strong>{s.user}:</strong> {s.error ? `Falha (${s.error})` : `${s.synced} notas importadas`}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tabela de logs do sync_log */}
        <div style={{ marginTop: 22 }}>
          <h4 style={{ fontSize: 15, marginBottom: 10 }}>Histórico de sincronizações recentes (sync_log)</h4>
          {logs.length === 0 ? (
            <p className="mut" style={{ fontSize: 13 }}>Nenhum log registrado ainda.</p>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {logs.map((log) => {
                const date = new Date(log.ranAt);
                const formattedDate = date.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const isSuccess = log.status === 'success';

                return (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      gap: 12,
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      padding: '10px 14px',
                      fontSize: 13,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: 99,
                          background: isSuccess ? '#2f8f6b33' : '#c0392b33',
                          color: isSuccess ? '#2f8f6b' : 'var(--rose)',
                        }}
                      >
                        {isSuccess ? 'Sucesso' : 'Erro'}
                      </span>
                      <strong style={{ color: 'var(--tx)' }}>{log.userName}:</strong>
                      <span>{log.message}</span>
                    </div>

                    <span className="mut" style={{ fontSize: 12 }}>
                      {formattedDate}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Outras áreas administrativas (preview das próximas fases) */}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <article className="m">
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Ciclos e sessões</h3>
          <p className="mut" style={{ fontSize: 14 }}>
            Criar novos ciclos a partir das sugestões mais votadas, definir prazos e encerrar ciclos ativos.
          </p>
        </article>

        <article className="m">
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Membros e permissões</h3>
          <p className="mut" style={{ fontSize: 14 }}>
            Gerenciar tabela <code>allowed_emails</code> e papéis (roles) dos membros.
          </p>
        </article>

        <article className="m">
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Configurações do clube</h3>
          <p className="mut" style={{ fontSize: 14 }}>
            Editar nome oficial do clube e configurações gerais salvas na tabela <code>settings</code>.
          </p>
        </article>
      </div>
    </section>
  );
};
