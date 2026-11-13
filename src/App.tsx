import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  initialActiveCycle,
  mockMembers,
  mockMovies,
  initialSuggestions,
} from './data/mockData';
import type { ActiveCycle, Movie, Suggestion } from './types';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProximaSessaoPage } from './pages/ProximaSessaoPage';
import { JaVimosPage } from './pages/JaVimosPage';
import { DetalheFilmePage } from './pages/DetalheFilmePage';
import { AcervoPage } from './pages/AcervoPage';
import { MembrosPage } from './pages/MembrosPage';

export const App: React.FC = () => {
  const [cycle, setCycle] = useState<ActiveCycle | null>(initialActiveCycle);
  const [movies] = useState<Movie[]>(mockMovies);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [members] = useState(mockMembers);

  // Toggle user watch mark in active cycle
  const handleToggleUserWatch = (memberIndex: number) => {
    if (!cycle) return;
    setCycle((prev) => {
      if (!prev) return null;
      const updatedCrew = prev.crew.map((item, idx) =>
        idx === memberIndex ? { ...item, watched: !item.watched } : item
      );
      return { ...prev, crew: updatedCrew };
    });
  };

  // Add a new suggestion
  const handleAddSuggestion = (title: string, suggestedBy: string) => {
    const newSug: Suggestion = {
      id: `sug-${Date.now()}`,
      title,
      suggestedBy,
      votes: 0,
      hasVoted: false,
    };
    setSuggestions((prev) => [newSug, ...prev]);
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
                  onToggleUserWatch={handleToggleUserWatch}
                />
              }
            />
            <Route
              path="/proxima"
              element={
                <ProximaSessaoPage
                  cycle={cycle}
                  onToggleUserWatch={handleToggleUserWatch}
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
              element={<DetalheFilmePage movies={movies} />}
            />
            <Route
              path="/acervo"
              element={
                <AcervoPage
                  suggestions={suggestions}
                  onAddSuggestion={handleAddSuggestion}
                  onToggleVote={handleToggleVote}
                />
              }
            />
            <Route
              path="/membros"
              element={<MembrosPage members={members} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
