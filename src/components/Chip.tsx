import React from 'react';

interface ChipProps {
  label: string;
  isDone: boolean;
}

export const Chip: React.FC<ChipProps> = ({ label, isDone }) => {
  return (
    <span className="chip" data-done={isDone}>
      {label}
      {isDone ? ' já viu' : ''}
    </span>
  );
};
