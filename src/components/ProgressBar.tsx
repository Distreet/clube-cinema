import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div
      className="prog"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${current} de ${total} membros assistiram`}
    >
      <i style={{ width: `${percent}%` }} />
    </div>
  );
};
