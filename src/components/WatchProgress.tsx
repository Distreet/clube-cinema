import React from 'react';
import type { CycleMark } from '../types';
import { Chip } from './Chip';
import { ProgressBar } from './ProgressBar';

interface WatchProgressProps {
  crew: CycleMark[];
  currentUserIndex?: number;
  onToggleUserWatch: (index: number) => void;
}

export const WatchProgress: React.FC<WatchProgressProps> = ({
  crew,
  currentUserIndex = 0,
  onToggleUserWatch,
}) => {
  const watchedCount = crew.filter((c) => c.watched).length;
  const totalCount = crew.length;
  const isCurrentUserWatched = crew[currentUserIndex]?.watched ?? false;

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
          onClick={() => onToggleUserWatch(currentUserIndex)}
        >
          {isCurrentUserWatched ? 'Desmarcar que eu vi' : 'Marcar que eu já vi'}
        </button>
      </div>
    </section>
  );
};
