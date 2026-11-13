import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ marginTop: 40 }}>
      <div className="note">
        Protótipo com dados de exemplo (Fase 0). Pôsteres e banners aqui são ilustrações, e as notas e críticas foram configuradas como mock. Na versão final, pôsteres, sinopses e onde assistir vêm do TMDB, as críticas vêm do Letterboxd de cada um, e tudo fica salvo no Supabase pro grupo todo.
      </div>
      <div className="footer-credits">
        Dados de filmes: TMDB. Dados de onde assistir: JustWatch. Este produto usa a API do TMDB mas não é endossado nem certificado pelo TMDB.
      </div>
    </footer>
  );
};
