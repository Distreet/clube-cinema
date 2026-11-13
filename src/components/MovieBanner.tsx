import React from 'react';

interface MovieBannerProps {
  title: string;
  bgGradient: string;
  backdropUrl?: string;
}

export const MovieBanner: React.FC<MovieBannerProps> = ({
  title,
  bgGradient,
  backdropUrl,
}) => {
  const style: React.CSSProperties = {
    background: backdropUrl
      ? `url(${backdropUrl}) center/cover no-repeat`
      : bgGradient,
  };

  return (
    <div className="banner" style={style} role="img" aria-label={`Banner de ${title}`}>
      <span>{title}</span>
    </div>
  );
};
