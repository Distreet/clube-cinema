import React from 'react';
import type { ActiveCycle } from '../types';

interface TicketProps {
  cycle: ActiveCycle | null;
}

export const Ticket: React.FC<TicketProps> = ({ cycle }) => {
  if (!cycle) {
    return (
      <div className="ticket" style={{ gridTemplateColumns: '1fr', padding: '32px' }}>
        <div className="main" style={{ padding: 0 }}>
          <span className="tag">Nenhum ciclo ativo</span>
          <h2>Aguardando próxima escolha</h2>
          <p className="lead" style={{ margin: '12px 0 0' }}>
            Nenhum filme selecionado para a próxima sessão no momento. Visite o Acervo para votar ou sugerir novos títulos!
          </p>
        </div>
      </div>
    );
  }

  const { movie, deadlineDay, deadlineMonth, discussionNote } = cycle;

  return (
    <article className="ticket" aria-label={`Ingresso da próxima sessão: ${movie.title}`}>
      <div className="main">
        {movie.tagText && <span className="tag">{movie.tagText}</span>}
        <h2>{movie.title}</h2>
        <div className="meta">
          {movie.director}, {movie.year}, {movie.runtime}, {movie.genre}
        </div>
        <p>{movie.overview}</p>
      </div>

      <div className="stub">
        <div>
          <div className="hr">assistir até</div>
          <div className="day">{deadlineDay}</div>
          <div className="mon">{deadlineMonth}</div>
        </div>
        <div className="hr">{discussionNote}</div>
      </div>
    </article>
  );
};
