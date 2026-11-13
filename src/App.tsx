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
  const [clubName, setClubName] = useState<string>('Clube do Livro');
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

  // Iniciar novo ciclo
  const handleStartCycle = (newCycle: ActiveCycle) => {
    setCycle(newCycle);
    setSuggestions((prev) =>
      prev.map((s) => (s.tmdbId === newCycle.tmdbId ? { ...s, status: 'chosen' } : s))
    );
  };

  // Encerrar ciclo ativo
  const handleFinishCycle = () => {
    if (!cycle) return;
    const existingMovie = movies.find((m) => m.tmdbId === cycle.tmdbId);
    if (!existingMovie) {
      const finishedMovie: Movie = {
        id: `movie-${cycle.tmdbId}`,
        tmdbId: cycle.tmdbId,
        title: cycle.movie.title,
        originalTitle: cycle.movie.originalTitle || cycle.movie.title,
        year: cycle.movie.year,
        director: cycle.movie.director,
        genres: cycle.movie.genre,
        castMain: 'Elenco oficial',
        sessionMonth: `${cycle.deadlineMonth} ${new Date().getFullYear()}`,
        overview: cycle.movie.overview,
        bgGradient: 'linear-gradient(160deg, #2a0f17, #3a1722)',
        posterUrl: cycle.movie.posterUrl,
        backdropUrl: cycle.movie.backdropUrl,
        letterboxdSlug: cycle.movie.title.toLowerCase().replace(/\s+/g, '-'),
        whereToWatch: cycle.movie.whereToWatch,
        reviews: [],
      };
      setMovies((prev) => [finishedMovie, ...prev]);
    }
    setSuggestions((prev) =>
      prev.map((s) => (s.tmdbId === cycle.tmdbId ? { ...s, status: 'seen' } : s))
    );
    setCycle(null);
  };

  // Moderação de status do acervo
  const handleUpdateSuggestionStatus = (suggestionId: string, status: Suggestion['status']) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, status } : s))
    );
  };

  // Remoção de sugestão indevida
  const handleDeleteSuggestion = (suggestionId: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
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
    handleSaveReviewForMember(movieId, userName, rating, reviewText);
  };

  // Salva ou edita a avaliação manual de qualquer membro (usado pelo Admin)
  const handleSaveReviewForMember = (
    movieId: string,
    memberName: string,
    rating: number,
    reviewText: string
  ) => {
    setMovies((prev) =>
      prev.map((m) => {
        if (m.id !== movieId && String(m.tmdbId) !== movieId) return m;

        const existingIdx = m.reviews.findIndex(
          (r) => r.memberName.toLowerCase() === memberName.toLowerCase()
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
          const memObj = members.find((x) => x.name.toLowerCase() === memberName.toLowerCase());
          const newRev: Review = {
            id: `rev-${Date.now()}`,
            memberName,
            rating,
            reviewText: reviewText || null,
            letterboxdUrl: memObj?.letterboxdUsername
              ? `https://letterboxd.com/${memObj.letterboxdUsername}/`
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
        <Header clubName={clubName} />
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
            <Route
              path="/admin"
              element={
                <AdminPage
                  cycle={cycle}
                  movies={movies}
                  suggestions={suggestions}
                  members={members}
                  onStartCycle={handleStartCycle}
                  onFinishCycle={handleFinishCycle}
                  onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
                  onDeleteSuggestion={handleDeleteSuggestion}
                  onSaveMemberReview={handleSaveReviewForMember}
                  onUpdateClubName={(name) => setClubName(name)}
                  clubName={clubName}
                />
              }
            />
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
