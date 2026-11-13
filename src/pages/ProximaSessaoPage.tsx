import React from 'react';
import type { ActiveCycle } from '../types';
import { Ticket } from '../components/Ticket';
import { WatchProgress } from '../components/WatchProgress';

interface ProximaSessaoPageProps {
  cycle: ActiveCycle | null;
  onToggleUserWatch: (memberIndex: number) => void;
}

export const ProximaSessaoPage: React.FC<ProximaSessaoPageProps> = ({
  cycle,
  onToggleUserWatch,
}) => {
  return (
    <section id="proxima" aria-label="Próxima sessão">
      <Ticket cycle={cycle} />
      {cycle && (
        <WatchProgress
          crew={cycle.crew}
          currentUserIndex={0}
          onToggleUserWatch={onToggleUserWatch}
        />
      )}
    </section>
  );
};
