import React from 'react';
import type { CycleMark } from '../types';
import { Chip } from './Chip';
import { ProgressBar } from './ProgressBar';

interface WatchProgressProps {
  crew: CycleMark[];
  currentUserName?: string;
  onToggleWatch: (memberName: string) => void;
  onRequestLogin?: () => void;
}

export const WatchProgress: React.FC<WatchProgressProps> = ({
  crew,
  currentUserName,
  onToggleWatch,
  onRequestLogin,
}) => {
  const watchedCount = crew.filter((c) => c.watched).length;
  const totalCount = crew.length;

  // Localiza o status do membro atual
  const currentUserMark = currentUserName
    ? crew.find((c) => c.memberName.toLowerCase() === currentUserName.toLowerCase())
    : null;

  const isCurrentUserWatched = currentUserMark?.watched ?? false;

  const handleClick = () => {
    if (!currentUserName) {
      if (onRequestLogin) onRequestLogin();
      return;
    }

    if (currentUserMark) {
      onToggleWatch(currentUserMark.memberName);
    } else {
      // Se for um novo membro ainda não listado no mock inicial, adiciona e marca
      onToggleWatch(currentUserName);
    }
  };

  return (
    <section className="poll" aria-labelledby="poll-heading">
      <h3 id="poll-heading">Quem já assistiu</h3>
      <p className="lead" style={{ marginBottom: 12 }}>
        Cada um assiste no seu tempo, até o prazo. Depois a gente se reúne pra conversar.
      </p>

      <div className="watch">
        {crew.map((member) => (
          <Chip
            key={member.memberName}
            label={member.memberName}
            isDone={member.watched}
          />
        ))}

        <ProgressBar current={watchedCount} total={totalCount} />

        <span className="mut">
          {watchedCount} de {totalCount} já assistiram
        </span>

        <button
          className="btn"
          type="button"
          onClick={handleClick}
          title={
            !currentUserName
              ? 'Faça login para registrar que assistiu'
              : isCurrentUserWatched
              ? 'Clique para desmarcar'
              : 'Clique para marcar que assistiu'
          }
        >
          {!currentUserName
            ? 'Entrar para marcar que viu'
            : isCurrentUserWatched
            ? 'Desmarcar que eu vi'
            : 'Marcar que eu já vi'}
        </button>
      </div>
    </section>
  );
};
