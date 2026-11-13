import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const AdminPage: React.FC = () => {
  const { isAdmin, profile } = useAuth();

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

  return (
    <section id="admin" aria-label="Painel administrativo">
      <h2>Painel administrativo</h2>
      <p className="lead">
        Gerencie ciclos, filmes do acervo, membros permitidos e configurações do clube.
      </p>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <article className="m">
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Ciclos e sessões</h3>
          <p className="mut" style={{ fontSize: 14 }}>
            Criar novos ciclos, definir prazos e datas de discussão, e encerrar ciclos ativos.
          </p>
        </article>

        <article className="m">
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Membros e permissões</h3>
          <p className="mut" style={{ fontSize: 14 }}>
            Gerenciar tabela <code>allowed_emails</code> e papéis (roles) dos membros.
          </p>
        </article>

        <article className="m">
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Sincronização Letterboxd</h3>
          <p className="mut" style={{ fontSize: 14 }}>
            Disparar sincronização manual de RSS e visualizar logs de <code>sync_log</code>.
          </p>
        </article>

        <article className="m">
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Configurações</h3>
          <p className="mut" style={{ fontSize: 14 }}>
            Editar nome oficial do clube e parâmetros gerais.
          </p>
        </article>
      </div>
    </section>
  );
};
