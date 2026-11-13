import React, { useState } from 'react';
import type { ActiveCycle } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Ticket } from '../components/Ticket';
import { WatchProgress } from '../components/WatchProgress';
import { LoginModal } from '../components/LoginModal';

interface ProximaSessaoPageProps {
  cycle: ActiveCycle | null;
  onToggleWatch: (memberName: string) => void;
}

export const ProximaSessaoPage: React.FC<ProximaSessaoPageProps> = ({
  cycle,
  onToggleWatch,
}) => {
  const { profile } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <section id="proxima" aria-label="Próxima sessão">
      <Ticket cycle={cycle} />
      {cycle && (
        <WatchProgress
          crew={cycle.crew}
          currentUserName={profile?.displayName}
          onToggleWatch={onToggleWatch}
          onRequestLogin={() => setIsLoginModalOpen(true)}
        />
      )}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </section>
  );
};
