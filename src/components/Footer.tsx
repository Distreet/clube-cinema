import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ marginTop: 48, paddingBottom: 24, textAlign: 'center' }}>
      <div style={{ color: 'var(--mut)', fontSize: 13, marginBottom: 6 }}>
        Clube do Filme • Encontros de Cinema 2026
      </div>
      <div className="footer-credits" style={{ fontSize: 11, color: 'var(--mut)', opacity: 0.8 }}>
        Dados de filmes via TMDB • Onde assistir via JustWatch
      </div>
    </footer>
  );
};
