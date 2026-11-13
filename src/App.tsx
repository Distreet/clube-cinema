import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  initialActiveCycle,
  mockMembers,
  mockMovies,
  initialSuggestions,
} from './data/mockData';
import type { ActiveCycle, CycleMark, Movie, Review, Suggestion } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProximaSessaoPage } from './pages/ProximaSessaoPage';
import { JaVimosPage } from './pages/JaVimosPage';
import { DetalheFilmePage } from './pages/DetalheFilmePage';
import { AcervoPage } from './pages/AcervoPage';
import { MembrosPage } from './pages/MembrosPage';
import { AdminPage } from './pages/AdminPage';

const AppContent: React.FC = () => {
  const { profile } = useAuth();
  const [cycle, setCycle] = useState<ActiveCycle | null>(initialActiveCycle);
  const [movies, setMovies] = useState<Movie[]>(mockMovies);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [members] = useState(mockMembers);

  // Toggle user watch mark in active cycle
  const handleToggleWatch = (memberName: string) => {
    if (!cycle) return;
    setCycle((prev) => {
      if (!prev) return null;
      const exists = prev.crew.some(
        (c) => c.memberName.toLowerCase() === memberName.toLowerCase()
      );
      let updatedCrew: CycleMark[];
      if (exists) {
        updatedCrew = prev.crew.map((item) =>
          item.memberName.toLowerCase() === memberName.toLowerCase()
            ? { ...item, watched: !item.watched }
            : item
        );
      } else {
        updatedCrew = [...prev.crew, { memberName, watched: true }];
      }
      return { ...prev, crew: updatedCrew };
    });
  };

  // Add a new suggestion
  const handleAddSuggestion = (newSuggestion: Suggestion) => {
    setSuggestions((prev) => [newSuggestion, ...prev]);
  };

  // Toggle vote for a suggestion
  const handleToggleVote = (id: string) => {
    setSuggestions((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const willVote = !item.hasVoted;
        return {
          ...item,
          hasVoted: willVote,
          votes: willVote ? item.votes + 1 : item.votes - 1,
        };
      })
    );
  };

  // Salva ou edita a avaliação manual do filme pelo usuário logado
  const handleSaveReview = (movieId: string, rating: number, reviewText: string) => {
    const userName = profile?.displayName || 'Samuel';

    setMovies((prev) =>
      prev.map((m) => {
        if (m.id !== movieId && String(m.tmdbId) !== movieId) return m;

        const existingIdx = m.reviews.findIndex(
          (r) => r.memberName.toLowerCase() === userName.toLowerCase()
        );

        let updatedReviews: Review[];
        if (existingIdx >= 0) {
          updatedReviews = m.reviews.map((r, i) =>
            i === existingIdx
              ? {
                  ...r,
                  rating,
                  reviewText: reviewText || null,
                }
              : r
          );
        } else {
          const newRev: Review = {
            id: `rev-${Date.now()}`,
            memberName: userName,
            rating,
            reviewText: reviewText || null,
            letterboxdUrl: profile?.letterboxdUsername
              ? `https://letterboxd.com/${profile.letterboxdUsername}/`
              : null,
          };
          updatedReviews = [...m.reviews, newRev];
        }

        return { ...m, reviews: updatedReviews };
      })
    );
  };

  return (
    <BrowserRouter>
      <div className="wrap">
        <Header />
        <Navbar />

        <main id="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <ProximaSessaoPage
                  cycle={cycle}
                  onToggleWatch={handleToggleWatch}
                />
              }
            />
            <Route
              path="/proxima"
              element={
                <ProximaSessaoPage
                  cycle={cycle}
                  onToggleWatch={handleToggleWatch}
                />
              }
            />
            <Route
              path="/ja-vimos"
              element={<JaVimosPage movies={movies} />}
            />
            <Route
              path="/historico"
              element={<JaVimosPage movies={movies} />}
            />
            <Route
              path="/filmes/:id"
              element={
                <DetalheFilmePage
                  movies={movies}
                  members={members}
                  onSaveReview={handleSaveReview}
                />
              }
            />
            <Route
              path="/acervo"
              element={
                <AcervoPage
                  suggestions={suggestions}
                  seenTmdbIds={movies.map((m) => m.tmdbId)}
                  onAddSuggestion={handleAddSuggestion}
                  onToggleVote={handleToggleVote}
                />
              }
            />
            <Route
              path="/membros"
              element={<MembrosPage members={members} />}
            />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
