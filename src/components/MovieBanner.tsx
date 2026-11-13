import React, { useState } from 'react';

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
  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = Boolean(backdropUrl && !imgFailed);

  const style: React.CSSProperties = {
    background: hasImage
      ? `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%), url(${backdropUrl}) center/cover no-repeat`
      : bgGradient,
  };

  return (
    <div className="banner" style={style} role="img" aria-label={`Banner de ${title}`}>
      {backdropUrl && !imgFailed && (
        <img
          src={backdropUrl}
          alt=""
          style={{ display: 'none' }}
          onError={() => setImgFailed(true)}
        />
      )}
      <span style={{ position: 'relative', zIndex: 1 }}>{title}</span>
    </div>
  );
};
