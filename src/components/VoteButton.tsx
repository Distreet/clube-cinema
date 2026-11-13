import React from 'react';

interface VoteButtonProps {
  votes: number;
  hasVoted: boolean;
  onToggle: () => void;
  title: string;
}

export const VoteButton: React.FC<VoteButtonProps> = ({
  votes,
  hasVoted,
  onToggle,
  title,
}) => {
  let label = '';
  if (votes === 0) {
    label = 'Votar';
  } else if (votes === 1) {
    label = '1 votou';
  } else {
    label = `${votes} votaram`;
  }

  return (
    <button
      type="button"
      className="vote"
      aria-pressed={hasVoted}
      onClick={onToggle}
      aria-label={`${hasVoted ? 'Remover seu voto de' : 'Votar em'} ${title}. Total: ${label}`}
      title={hasVoted ? 'Você já votou neste filme. Clique para remover seu voto.' : 'Clique para votar neste filme.'}
    >
      {hasVoted ? `✓ ${label}` : label}
    </button>
  );
};
