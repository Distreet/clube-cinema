import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstAccess?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  isFirstAccess = false,
}) => {
  const { profile, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [letterboxdUsername, setLetterboxdUsername] = useState(
    profile?.letterboxdUsername || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setLoading(true);
    setError(null);

    const res = await updateProfile({
      displayName: displayName.trim(),
      letterboxdUsername: letterboxdUsername.trim() || undefined,
    });
    setLoading(false);

    if (res.error) {
      setError(res.error.message);
    } else {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000000b0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          padding: '28px 24px',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 20px 40px #000a',
          position: 'relative',
        }}
      >
        {!isFirstAccess && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'none',
              border: 0,
              color: 'var(--mut)',
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        )}

        <h3 id="profile-modal-title" style={{ fontSize: 24, marginBottom: 8 }}>
          {isFirstAccess ? 'Bem-vindo ao Clube!' : 'Editar perfil'}
        </h3>
        <p className="lead" style={{ fontSize: 14, marginBottom: 20 }}>
          {isFirstAccess
            ? 'Complete seus dados para participar das discussões e votos do grupo.'
            : 'Atualize seu nome de exibição e usuário do Letterboxd.'}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label
              htmlFor="displayName"
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--mut)',
                marginBottom: 6,
              }}
            >
              Nome de exibição *
            </label>
            <input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ex: Samuel"
              required
              minLength={2}
              maxLength={50}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label
              htmlFor="letterboxdUsername"
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--mut)',
                marginBottom: 6,
              }}
            >
              Usuário do Letterboxd (opcional)
            </label>
            <input
              id="letterboxdUsername"
              value={letterboxdUsername}
              onChange={(e) => setLetterboxdUsername(e.target.value)}
              placeholder="Ex: samuel (sem @)"
              maxLength={40}
              style={{ width: '100%' }}
            />
            <small style={{ color: 'var(--mut)', fontSize: 12, marginTop: 4, display: 'block' }}>
              Usado para sincronizar suas notas e críticas automaticamente via RSS.
            </small>
          </div>

          {error && (
            <div
              style={{
                padding: 10,
                borderRadius: 8,
                background: '#c0392b22',
                border: '1px solid #c0392b',
                color: 'var(--rose)',
                marginBottom: 14,
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <button
            className="btn"
            type="submit"
            disabled={loading || displayName.trim().length < 2}
            style={{ width: '100%' }}
          >
            {loading ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </form>
      </div>
    </div>
  );
};
