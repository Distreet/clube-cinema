import React from 'react';
import type { WhereToWatchData } from '../types';

interface WhereToWatchProps {
  data?: WhereToWatchData;
  compact?: boolean; // For ticket or card preview
}

export const WhereToWatch: React.FC<WhereToWatchProps> = ({ data, compact = false }) => {
  if (!data) {
    return (
      <div style={{ marginTop: 12 }}>
        <p className="mut" style={{ fontSize: 13, margin: 0 }}>
          Onde assistir: informações em atualização pelo TMDB (Brasil).
        </p>
      </div>
    );
  }

  const { streaming = [], rent = [], buy = [], link, note } = data;
  const hasAnyProvider = streaming.length > 0 || rent.length > 0 || buy.length > 0;

  if (compact) {
    if (!hasAnyProvider) {
      return (
        <div style={{ marginTop: 10, fontSize: 13, color: '#6a3a46' }}>
          <strong>Onde assistir:</strong> {note || 'Disponível nos cinemas / em breve no streaming.'}
        </div>
      );
    }

    return (
      <div style={{ marginTop: 10, fontSize: 13, color: '#6a3a46' }}>
        <strong>Onde assistir:</strong>{' '}
        {streaming.length > 0
          ? streaming.map((p) => p.name).join(', ')
          : rent.length > 0
          ? `Aluguel: ${rent.map((p) => p.name).join(', ')}`
          : `Compra: ${buy.map((p) => p.name).join(', ')}`}
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 24,
        padding: '16px 18px',
        background: 'var(--bg2)',
        border: '1px solid var(--line)',
        borderRadius: 12,
      }}
      aria-label="Onde assistir no Brasil"
    >
      <h4 style={{ fontSize: 16, marginBottom: 10, letterSpacing: 0 }}>
        Onde assistir (Brasil)
      </h4>

      {!hasAnyProvider ? (
        <p className="mut" style={{ fontSize: 14, margin: '6px 0 0' }}>
          {note ||
            'Não encontramos este título disponível para streaming no Brasil no momento. Ele pode estar em exibição nos cinemas ou aguardando lançamento digital.'}
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {streaming.length > 0 && (
            <div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--amber)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Streaming (incluso na assinatura)
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {streaming.map((provider) => (
                  <span
                    key={provider.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: 99,
                      padding: '4px 10px',
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {provider.logo && (
                      <img
                        src={provider.logo}
                        alt=""
                        style={{ width: 16, height: 16, borderRadius: 4 }}
                      />
                    )}
                    {provider.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {rent.length > 0 && (
            <div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--mut)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Para alugar
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {rent.map((provider) => (
                  <span
                    key={provider.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: 99,
                      padding: '4px 10px',
                      fontSize: 13,
                      color: 'var(--mut)',
                    }}
                  >
                    {provider.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {buy.length > 0 && rent.length === 0 && (
            <div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--mut)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Para comprar
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {buy.map((provider) => (
                  <span
                    key={provider.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: 99,
                      padding: '4px 10px',
                      fontSize: 13,
                      color: 'var(--mut)',
                    }}
                  >
                    {provider.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginTop: 10,
            fontSize: 12,
            color: 'var(--amber)',
            textDecoration: 'none',
          }}
        >
          Ver lista completa no JustWatch →
        </a>
      )}
    </div>
  );
};
