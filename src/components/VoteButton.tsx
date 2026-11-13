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
  return (
    <button
      type="button"
      className="vote"
      aria-pressed={hasVoted}
      onClick={onToggle}
      aria-label={`${hasVoted ? 'Remover voto de' : 'Votar em'} ${title}`}
    >
      {votes} {hasVoted ? 'votado' : 'votar'}
    </button>
  );
};
