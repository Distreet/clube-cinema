import React from 'react';
import type { Member } from '../types';

interface MembrosPageProps {
  members: Member[];
}

export const MembrosPage: React.FC<MembrosPageProps> = ({ members }) => {
  return (
    <section id="membros" aria-label="Membros do clube">
      <div className="members">
        {members.map((member) => (
          <article key={member.id} className="m">
            <div className="av" style={{ background: member.color, overflow: 'hidden' }}>
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                member.name.charAt(0)
              )}
            </div>
            <h3 style={{ fontSize: 19 }}>{member.name}</h3>
            <a
              href={`https://letterboxd.com/${member.letterboxdUsername}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver no Letterboxd
            </a>
          </article>
        ))}
      </div>
    </section>
  );
};
