import React, { useState, useEffect } from 'react';
import type { ActiveCycle, Member, Movie, Suggestion } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { MovieSearchAutocomplete } from '../components/MovieSearchAutocomplete';
import { getTMDBImageUrl, getMovieDetails, formatRuntime } from '../services/tmdb';
import { syncLetterboxdNow, fetchSyncLogs } from '../services/letterboxd';
import type { SyncLogEntry, SyncResult } from '../services/letterboxd';
import {
  fetchAllowedEmailsList,
  addAllowedEmail,
  removeAllowedEmail,
  saveClubNameSetting,
  addPastMovieToHistory,
} from '../services/admin';
import type { AllowedEmailEntry } from '../services/admin';

interface AdminPageProps {
  cycle: ActiveCycle | null;
  movies: Movie[];
  suggestions: Suggestion[];
  members: Member[];
  onStartCycle: (newCycle: ActiveCycle) => void;
  onFinishCycle: () => void;
  onUpdateSuggestionStatus: (suggestionId: string, status: Suggestion['status']) => void;
  onDeleteSuggestion: (suggestionId: string) => void;
  onSaveMemberReview: (movieId: string, memberName: string, rating: number, text: string) => void;
  onUpdateClubName: (name: string) => void;
  onAddPastMovie?: (movie: Movie) => void;
  clubName: string;
}

type AdminTab = 'cycles' | 'suggestions' | 'reviews' | 'members' | 'sync' | 'settings';

export const AdminPage: React.FC<AdminPageProps> = ({
  cycle,
  movies,
  suggestions,
  members,
  onStartCycle,
  onFinishCycle,
  onUpdateSuggestionStatus,
  onDeleteSuggestion,
  onSaveMemberReview,
  onUpdateClubName,
  onAddPastMovie,
  clubName,
}) => {
  const { isAdmin, signInWithOtp } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('cycles');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState<string | null>(null);

  // Estados da aba Ciclos
  const [selectedFilmSource, setSelectedFilmSource] = useState<'suggestion' | 'tmdb'>('suggestion');
  const [chosenSuggestionId, setChosenSuggestionId] = useState<string>(suggestions[0]?.id || '');
  const [selectedTmdbMovie, setSelectedTmdbMovie] = useState<any>(null);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [watchDeadline, setWatchDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().substring(0, 10);
  });
  const [discussionDate, setDiscussionDate] = useState('');
  const [cycleFeedback, setCycleFeedback] = useState<string | null>(null);

  // Estados para cadastrar filme do passado diretamente no histórico
  const [selectedPastTmdbMovie, setSelectedPastTmdbMovie] = useState<any>(null);
  const [pastSessionMonth, setPastSessionMonth] = useState('');
  const [pastFeedback, setPastFeedback] = useState<string | null>(null);
  const [isSubmittingPastMovie, setIsSubmittingPastMovie] = useState(false);

  // Estados da aba Notas Manuais
  const [reviewMovieId, setReviewMovieId] = useState<string>(movies[0]?.id || '');
  const [reviewMemberName, setReviewMemberName] = useState<string>(members[0]?.name || '');
  const [reviewRating, setReviewRating] = useState<number>(4.5);
  const [reviewText, setReviewText] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

  // Estados da aba Membros e Acesso
  const [allowedEmails, setAllowedEmails] = useState<AllowedEmailEntry[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [emailFeedback, setEmailFeedback] = useState<string | null>(null);

  // Estados da aba Letterboxd Sync
  const [logs, setLogs] = useState<SyncLogEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<SyncResult | null>(null);

  // Sincroniza a nota e o texto existentes ao selecionar filme/membro em Notas Manuais
  useEffect(() => {
    const movie = movies.find((m) => m.id === reviewMovieId);
    if (movie) {
      const existing = movie.reviews.find(
        (r) => r.memberName.toLowerCase() === reviewMemberName.toLowerCase()
      );
      if (existing) {
        if (existing.rating !== null && existing.rating !== undefined) {
          setReviewRating(existing.rating);
        }
        setReviewText(existing.reviewText || '');
      } else {
        setReviewRating(4.5);
        setReviewText('');
      }
    }
  }, [reviewMovieId, reviewMemberName, movies]);

  // Estados da aba Configurações
  const [tempClubName, setTempClubName] = useState(clubName);
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchAllowedEmailsList().then(setAllowedEmails);
      fetchSyncLogs().then(setLogs);
    }
  }, [isAdmin]);

  if (!isAdmin) {
    const handleUnlockAdmin = async (e: React.FormEvent) => {
      e.preventDefault();
      const { error } = await signInWithOtp('samuelnasc2805@gmail.com', adminPasswordInput);
      if (error) {
        setAdminPasswordError(error.message);
      } else {
        setAdminPasswordError(null);
      }
    };

    return (
      <section id="admin" style={{ maxWidth: 440, margin: '40px auto' }}>
        <h2 style={{ fontSize: 26, marginBottom: 8, textAlign: 'center' }}>Painel Administrativo</h2>
        <p className="lead" style={{ textAlign: 'center', marginBottom: 24, fontSize: 14 }}>
          Esta área é restrita ao administrador do clube. Digite a senha para desbloquear o acesso completo.
        </p>

        <div
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            padding: '24px',
          }}
        >
          <form onSubmit={handleUnlockAdmin}>
            <label
              htmlFor="admin-password-unlock"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--amber)',
                marginBottom: 8,
              }}
            >
              <span>Senha de Administrador:</span>
              <span style={{ fontSize: 11, color: 'var(--mut)', fontWeight: 400 }}>senha: 12345</span>
            </label>
            <input
              id="admin-password-unlock"
              type="password"
              value={adminPasswordInput}
              onChange={(e) => {
                setAdminPasswordInput(e.target.value);
                setAdminPasswordError(null);
              }}
              placeholder="Digite a senha (12345)"
              required
              style={{ width: '100%', marginBottom: 12 }}
              autoFocus
            />

            {adminPasswordError && (
              <div
                style={{
                  padding: 8,
                  borderRadius: 6,
                  background: '#c0392b22',
                  border: '1px solid #c0392b',
                  color: 'var(--rose)',
                  fontSize: 12,
                  marginBottom: 12,
                }}
              >
                {adminPasswordError}
              </div>
            )}

            <button className="btn" type="submit" style={{ width: '100%' }}>
              Desbloquear Painel
            </button>
          </form>
        </div>
      </section>
    );
  }

  // AÇÃO: Iniciar novo ciclo
  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    setCycleFeedback(null);

    let chosenTmdbId: number;
    let title: string;
    let director = 'Não informado';
    let year = 2026;
    let runtimeStr = '2h00';
    let genreStr = 'Drama';
    let overview = '';
    let posterUrl: string | undefined;
    let backdropUrl: string | undefined;
    let whereToWatchData: any = null;

    if (selectedFilmSource === 'suggestion') {
      const sug = suggestions.find((s) => s.id === chosenSuggestionId);
      if (!sug) {
        setCycleFeedback('Selecione uma sugestão válida.');
        return;
      }
      chosenTmdbId = sug.tmdbId;
      title = sug.title;
      director = sug.director || 'Não informado';
      year = sug.year || 2026;
      runtimeStr = sug.formattedRuntime || '2h00';
      genreStr = sug.genres || 'Drama';
      overview = sug.overview || '';
      posterUrl = sug.posterUrl;
      backdropUrl = sug.backdropUrl;
      whereToWatchData = sug.whereToWatch;
    } else {
      if (!selectedTmdbMovie) {
        setCycleFeedback('Busque e selecione um filme do TMDB.');
        return;
      }
      chosenTmdbId = selectedTmdbMovie.id;
      title = selectedTmdbMovie.title;
      year = selectedTmdbMovie.year || 2026;
      overview = selectedTmdbMovie.overview || '';
      posterUrl = getTMDBImageUrl(selectedTmdbMovie.poster_path, 'w500');
      backdropUrl = getTMDBImageUrl(selectedTmdbMovie.backdrop_path, 'w1280');

      const details = await getMovieDetails(chosenTmdbId);
      if (details?.movie) {
        director = details.movie.director || director;
        runtimeStr = formatRuntime(details.movie.runtime);
        genreStr = Array.isArray(details.movie.genres) ? details.movie.genres.join(', ') : genreStr;
        whereToWatchData = details.whereToWatch;
      }
    }

    const deadlineD = new Date(watchDeadline + 'T12:00:00Z');
    const day = deadlineD.getUTCDate();
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const month = months[deadlineD.getUTCMonth()] || '';

    const newCycleObj: ActiveCycle = {
      id: `cycle-${Date.now()}`,
      tmdbId: chosenTmdbId,
      movie: {
        title,
        director,
        year,
        runtime: runtimeStr,
        genre: genreStr,
        overview,
        suggestedBy: 'Escolhido pela moderação',
        tagText: 'Escolhido pelo grupo',
        posterUrl,
        backdropUrl,
        whereToWatch: whereToWatchData,
      },
      deadlineDay: day,
      deadlineMonth: month,
      discussionNote: discussionDate
        ? `depois, o papo em ${new Date(discussionDate + 'T12:00:00Z').toLocaleDateString('pt-BR')}`
        : 'depois, o papo',
      crew: members.map((m) => ({ memberName: m.name, watched: false })),
    };

    onStartCycle(newCycleObj);
    setCycleFeedback(`Novo ciclo iniciado com sucesso para o filme "${title}"!`);
  };

  // AÇÃO: Cadastrar filme anterior diretamente no histórico Já Vimos
  const handleAddPastMovieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPastFeedback(null);
    if (!selectedPastTmdbMovie) {
      setPastFeedback('Busque e selecione um filme do TMDB.');
      return;
    }
    if (!pastSessionMonth.trim()) {
      setPastFeedback('Informe o mês/ano da sessão (ex: outubro 2024).');
      return;
    }

    setIsSubmittingPastMovie(true);
    try {
      const chosenTmdbId = selectedPastTmdbMovie.id;
      let director = 'Não informado';
      let genreStr = 'Drama';
      let whereToWatchData: any = null;

      const details = await getMovieDetails(chosenTmdbId);
      if (details?.movie) {
        director = details.movie.director || director;
        genreStr = Array.isArray(details.movie.genres) ? details.movie.genres.join(', ') : genreStr;
        whereToWatchData = details.whereToWatch;
      }

      const newMovie: Movie = {
        id: `movie-${chosenTmdbId}`,
        tmdbId: chosenTmdbId,
        title: selectedPastTmdbMovie.title,
        originalTitle: selectedPastTmdbMovie.original_title || selectedPastTmdbMovie.title,
        year: selectedPastTmdbMovie.year || new Date().getFullYear(),
        director,
        genres: genreStr,
        castMain: 'Elenco oficial',
        sessionMonth: pastSessionMonth.trim(),
        overview: selectedPastTmdbMovie.overview || '',
        bgGradient: 'linear-gradient(160deg, #1c2333, #2a3b5c)',
        posterUrl: getTMDBImageUrl(selectedPastTmdbMovie.poster_path, 'w500'),
        backdropUrl: getTMDBImageUrl(selectedPastTmdbMovie.backdrop_path, 'w1280'),
        letterboxdSlug: selectedPastTmdbMovie.title.toLowerCase().replace(/\s+/g, '-'),
        whereToWatch: whereToWatchData,
        reviews: [],
      };

      await addPastMovieToHistory({
        tmdbId: chosenTmdbId,
        sessionMonth: pastSessionMonth.trim(),
      });

      if (onAddPastMovie) {
        onAddPastMovie(newMovie);
      }
      setSelectedPastTmdbMovie(null);
      setPastSessionMonth('');
      setPastFeedback(`Filme "${newMovie.title}" cadastrado com sucesso no histórico Já Vimos!`);
    } catch (err: any) {
      setPastFeedback(`Erro ao cadastrar filme: ${err.message}`);
    } finally {
      setIsSubmittingPastMovie(false);
    }
  };

  // AÇÃO: Salvar nota manual de um membro
  const handleSaveMemberReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewMovieId || !reviewMemberName) return;

    onSaveMemberReview(reviewMovieId, reviewMemberName, reviewRating, reviewText);
    setReviewFeedback(`Avaliação de ${reviewMemberName} salva com sucesso!`);
    setReviewText('');
  };

  // AÇÃO: Adicionar e-mail
  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const res = await addAllowedEmail(newEmail.trim());
    if (res.success) {
      setAllowedEmails((prev) => [
        ...prev,
        { email: newEmail.trim().toLowerCase(), createdAt: new Date().toISOString().substring(0, 10), role: 'member' },
      ]);
      setNewEmail('');
      setEmailFeedback('E-mail autorizado adicionado com sucesso!');
    } else {
      setEmailFeedback(res.error || 'Erro ao adicionar e-mail.');
    }
  };

  // AÇÃO: Remover e-mail
  const handleRemoveEmail = async (emailToRemove: string) => {
    if (!window.confirm(`Tem certeza que deseja remover ${emailToRemove} da lista de permitidos?`)) return;

    const res = await removeAllowedEmail(emailToRemove);
    if (res.success) {
      setAllowedEmails((prev) => prev.filter((e) => e.email !== emailToRemove));
      setEmailFeedback(`E-mail ${emailToRemove} removido com sucesso.`);
    }
  };

  // AÇÃO: Sincronizar Letterboxd
  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);

    const result = await syncLetterboxdNow();
    setIsSyncing(false);
    setSyncFeedback(result);

    const updatedLogs = await fetchSyncLogs();
    setLogs(updatedLogs);
  };

  // AÇÃO: Salvar nome do clube
  const handleSaveClubName = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tempClubName.trim();
    if (clean.length < 2) return;

    const res = await saveClubNameSetting(clean);
    if (res.success) {
      onUpdateClubName(clean);
      setSettingsFeedback('Nome do clube atualizado com sucesso!');
    } else {
      setSettingsFeedback(res.error || 'Erro ao salvar configuração.');
    }
  };

  return (
    <section id="admin" aria-label="Painel administrativo">
      <h2>Painel administrativo</h2>
      <p className="lead">
        Gerencie os ciclos do clube, modere o acervo de sugestões, controle permissões e sincronizações.
      </p>

      {/* Sub-navegação em pílulas do Admin */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 24, paddingBottom: 6 }}>
        <button
          type="button"
          className="chip"
          data-done={activeTab === 'cycles'}
          onClick={() => setActiveTab('cycles')}
          style={{ cursor: 'pointer' }}
        >
          Ciclos e Sessões
        </button>
        <button
          type="button"
          className="chip"
          data-done={activeTab === 'suggestions'}
          onClick={() => setActiveTab('suggestions')}
          style={{ cursor: 'pointer' }}
        >
          Acervo e Moderação
        </button>
        <button
          type="button"
          className="chip"
          data-done={activeTab === 'reviews'}
          onClick={() => setActiveTab('reviews')}
          style={{ cursor: 'pointer' }}
        >
          Notas Manuais
        </button>
        <button
          type="button"
          className="chip"
          data-done={activeTab === 'members'}
          onClick={() => setActiveTab('members')}
          style={{ cursor: 'pointer' }}
        >
          Membros e E-mails
        </button>
        <button
          type="button"
          className="chip"
          data-done={activeTab === 'sync'}
          onClick={() => setActiveTab('sync')}
          style={{ cursor: 'pointer' }}
        >
          Letterboxd e Logs
        </button>
        <button
          type="button"
          className="chip"
          data-done={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
          style={{ cursor: 'pointer' }}
        >
          Configurações
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: CICLOS E SESSÕES */}
      {/* ========================================================================= */}
      {activeTab === 'cycles' && (
        <div style={{ display: 'grid', gap: 24 }}>
          {/* Ciclo Ativo Atual */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 18, marginBottom: 12 }}>Ciclo ativo no momento</h3>
            {cycle ? (
              <div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  {cycle.movie.posterUrl && (
                    <img
                      src={cycle.movie.posterUrl}
                      alt=""
                      style={{ width: 60, height: 90, borderRadius: 6, objectFit: 'cover' }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <b style={{ fontSize: 18 }}>{cycle.movie.title}</b>
                    <div className="mut" style={{ fontSize: 13, marginTop: 2 }}>
                      {cycle.movie.director}, {cycle.movie.year} • Prazo: até {cycle.deadlineDay} de {cycle.deadlineMonth}
                    </div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>
                      Progresso: {cycle.crew.filter((c) => c.watched).length} de {cycle.crew.length} já assistiram
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      if (window.confirm('Deseja encerrar o ciclo ativo? O filme irá para o histórico Já vimos.')) {
                        onFinishCycle();
                        setCycleFeedback('Ciclo encerrado com sucesso!');
                      }
                    }}
                    style={{ background: 'var(--rose)', color: '#fff' }}
                  >
                    Encerrar ciclo ativo
                  </button>
                </div>
              </div>
            ) : (
              <p className="mut" style={{ margin: 0, fontSize: 14 }}>
                Nenhum ciclo ativo no momento. Utilize o formulário abaixo para iniciar uma nova rodada.
              </p>
            )}
          </div>

          {/* Iniciar Novo Ciclo */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 18, marginBottom: 12 }}>Iniciar novo ciclo</h3>
            <form onSubmit={handleCreateCycle}>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--mut)', display: 'block', marginBottom: 8 }}>
                  Origem do filme:
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="chip"
                    data-done={selectedFilmSource === 'suggestion'}
                    onClick={() => setSelectedFilmSource('suggestion')}
                    style={{ cursor: 'pointer' }}
                  >
                    Escolher das sugestões do acervo
                  </button>
                  <button
                    type="button"
                    className="chip"
                    data-done={selectedFilmSource === 'tmdb'}
                    onClick={() => setSelectedFilmSource('tmdb')}
                    style={{ cursor: 'pointer' }}
                  >
                    Buscar novo no TMDB
                  </button>
                </div>
              </div>

              {selectedFilmSource === 'suggestion' ? (
                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="selectSuggestion" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--mut)', marginBottom: 6 }}>
                    Filme do acervo:
                  </label>
                  <select
                    id="selectSuggestion"
                    value={chosenSuggestionId}
                    onChange={(e) => setChosenSuggestionId(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg)',
                      color: 'var(--tx)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      padding: 10,
                      font: 'inherit',
                    }}
                  >
                    {suggestions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.year}) — {s.votes} votos (indicado por {s.suggestedBy})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--mut)', marginBottom: 6 }}>
                    Buscar filme no TMDB:
                  </label>
                  <MovieSearchAutocomplete
                    onSelectMovie={(m) => setSelectedTmdbMovie(m)}
                    existingSuggestionsTmdbIds={[]}
                    seenMoviesTmdbIds={[]}
                  />
                  {selectedTmdbMovie && (
                    <div style={{ marginTop: 8, fontSize: 14, color: 'var(--amber)' }}>
                      ✓ Selecionado: <strong>{selectedTmdbMovie.title}</strong> ({selectedTmdbMovie.year})
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 16 }}>
                <div>
                  <label htmlFor="startDateInput" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--mut)', marginBottom: 6 }}>
                    Data de início *
                  </label>
                  <input
                    id="startDateInput"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label htmlFor="deadlineInput" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--mut)', marginBottom: 6 }}>
                    Assistir até (prazo) *
                  </label>
                  <input
                    id="deadlineInput"
                    type="date"
                    value={watchDeadline}
                    onChange={(e) => setWatchDeadline(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label htmlFor="discussionDateInput" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--mut)', marginBottom: 6 }}>
                    Data da conversa (opcional)
                  </label>
                  <input
                    id="discussionDateInput"
                    type="date"
                    value={discussionDate}
                    onChange={(e) => setDiscussionDate(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {cycleFeedback && (
                <div style={{ marginBottom: 14, color: 'var(--amber)', fontWeight: 600, fontSize: 14 }}>
                  {cycleFeedback}
                </div>
              )}

              <button className="btn" type="submit">
                Criar e ativar ciclo
              </button>
            </form>
          </div>

          {/* Cadastrar filme anterior no histórico */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>Cadastrar filme anterior no histórico (Já Vimos)</h3>
            <p className="mut" style={{ fontSize: 14, margin: '0 0 16px' }}>
              Utilize esta opção para cadastrar filmes que o grupo já assistiu no passado sem precisar criar um ciclo ativo. O pôster, banner oficial e detalhes são buscados no TMDB automaticamente.
            </p>

            <form onSubmit={handleAddPastMovieSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--mut)', marginBottom: 6 }}>
                  Buscar filme no TMDB *:
                </label>
                <MovieSearchAutocomplete
                  onSelectMovie={(m) => setSelectedPastTmdbMovie(m)}
                  existingSuggestionsTmdbIds={[]}
                  seenMoviesTmdbIds={movies.map((m) => m.tmdbId)}
                />
                {selectedPastTmdbMovie && (
                  <div style={{ marginTop: 8, fontSize: 14, color: 'var(--amber)' }}>
                    ✓ Selecionado: <strong>{selectedPastTmdbMovie.title}</strong> ({selectedPastTmdbMovie.year})
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label htmlFor="pastSessionMonthInput" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--mut)', marginBottom: 6 }}>
                  Mês e ano da sessão * (ex: "out 2024", "novembro de 2023")
                </label>
                <input
                  id="pastSessionMonthInput"
                  type="text"
                  placeholder="Ex: setembro 2024"
                  value={pastSessionMonth}
                  onChange={(e) => setPastSessionMonth(e.target.value)}
                  required
                  style={{ width: '100%', maxWidth: 360 }}
                />
              </div>

              {pastFeedback && (
                <div style={{ marginBottom: 14, color: 'var(--amber)', fontWeight: 600, fontSize: 14 }}>
                  {pastFeedback}
                </div>
              )}

              <button className="btn" type="submit" disabled={isSubmittingPastMovie}>
                {isSubmittingPastMovie ? 'Buscando dados e cadastrando...' : 'Cadastrar no histórico Já Vimos'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: ACERVO E MODERAÇÃO */}
      {/* ========================================================================= */}
      {activeTab === 'suggestions' && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 18, marginBottom: 12 }}>Gerenciar sugestões do acervo</h3>
          <p className="mut" style={{ fontSize: 14, margin: '0 0 16px' }}>
            Altere o status das sugestões ou remova itens indevidos.
          </p>

          <div style={{ display: 'grid', gap: 10 }}>
            {suggestions.map((sug) => (
              <div
                key={sug.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 220, flex: 1 }}>
                  {sug.posterUrl ? (
                    <img src={sug.posterUrl} alt="" style={{ width: 36, height: 54, borderRadius: 4, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 36, height: 54, borderRadius: 4, background: 'var(--line)' }} />
                  )}
                  <div>
                    <strong>{sug.title}</strong>
                    <div className="mut" style={{ fontSize: 13 }}>
                      {sug.year} • Indicado por {sug.suggestedBy} • {sug.votes} votos
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <select
                    value={sug.status}
                    onChange={(e) => onUpdateSuggestionStatus(sug.id, e.target.value as Suggestion['status'])}
                    style={{
                      background: 'var(--bg2)',
                      color: 'var(--tx)',
                      border: '1px solid var(--line)',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: 13,
                    }}
                  >
                    <option value="pending">Pendente (Ainda não vimos)</option>
                    <option value="chosen">Escolhido para sessão</option>
                    <option value="seen">Já vimos (Encerrado)</option>
                    <option value="archived">Arquivado</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Tem certeza que deseja remover "${sug.title}" do acervo?`)) {
                        onDeleteSuggestion(sug.id);
                      }
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid var(--rose)',
                      color: 'var(--rose)',
                      borderRadius: 6,
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                    title="Remover sugestão indevida"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: NOTAS MANUAIS DE MEMBROS */}
      {/* ========================================================================= */}
      {activeTab === 'reviews' && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Lançar nota manual para membro</h3>
          <p className="mut" style={{ fontSize: 14, margin: '0 0 16px' }}>
            Útil para cadastrar notas e críticas de membros que não utilizam o Letterboxd ou possuem perfil privado.
          </p>

          <form onSubmit={handleSaveMemberReviewSubmit} style={{ maxWidth: 500 }}>
            <div style={{ marginBottom: 14 }}>
              <label htmlFor="reviewMovieSelect" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--mut)', marginBottom: 6 }}>
                Filme:
              </label>
              <select
                id="reviewMovieSelect"
                value={reviewMovieId}
                onChange={(e) => setReviewMovieId(e.target.value)}
                style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', border: '1px solid var(--line)', borderRadius: 8, padding: 10, font: 'inherit' }}
              >
                {movies.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.sessionMonth})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label htmlFor="reviewMemberSelect" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--mut)', marginBottom: 6 }}>
                Membro:
              </label>
              <select
                id="reviewMemberSelect"
                value={reviewMemberName}
                onChange={(e) => setReviewMemberName(e.target.value)}
                style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', border: '1px solid var(--line)', borderRadius: 8, padding: 10, font: 'inherit' }}
              >
                {members.map((mem) => (
                  <option key={mem.id} value={mem.name}>
                    {mem.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label htmlFor="reviewRatingSelect" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--mut)', marginBottom: 6 }}>
                Nota em estrelas:
              </label>
              <select
                id="reviewRatingSelect"
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', border: '1px solid var(--line)', borderRadius: 8, padding: 10, font: 'inherit' }}
              >
                {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map((v) => (
                  <option key={v} value={v}>
                    {v.toFixed(1).replace('.', ',')} estrelas (nota {(v * 2).toFixed(1).replace('.', ',')} no grupo)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="reviewTextInputAdmin" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--mut)', marginBottom: 6 }}>
                Texto da crítica (opcional):
              </label>
              <textarea
                id="reviewTextInputAdmin"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                placeholder="Comentário sobre o filme..."
                style={{ width: '100%', background: 'var(--bg)', color: 'var(--tx)', border: '1px solid var(--line)', borderRadius: 8, padding: 10, font: 'inherit' }}
              />
            </div>

            {reviewFeedback && (
              <div style={{ marginBottom: 14, color: 'var(--amber)', fontWeight: 600, fontSize: 14 }}>
                {reviewFeedback}
              </div>
            )}

            <button className="btn" type="submit">
              Salvar avaliação
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: MEMBROS E E-MAILS (allowed_emails) */}
      {/* ========================================================================= */}
      {activeTab === 'members' && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Lista de e-mails permitidos (allowed_emails)</h3>
          <p className="mut" style={{ fontSize: 14, margin: '0 0 16px' }}>
            Apenas pessoas com e-mails cadastrados nesta lista conseguem criar conta ou receber link mágico.
          </p>

          <form onSubmit={handleAddEmail} style={{ display: 'flex', gap: 10, marginBottom: 20, maxWidth: 500 }}>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="novo.membro@exemplo.com"
              required
              style={{ flex: 1 }}
            />
            <button className="btn" type="submit">
              Adicionar e-mail
            </button>
          </form>

          {emailFeedback && (
            <div style={{ marginBottom: 14, color: 'var(--amber)', fontWeight: 600, fontSize: 14 }}>
              {emailFeedback}
            </div>
          )}

          <div style={{ display: 'grid', gap: 8 }}>
            {allowedEmails.map((entry) => (
              <div
                key={entry.email}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  fontSize: 14,
                }}
              >
                <div>
                  <strong>{entry.email}</strong>
                  {entry.profileName && (
                    <span className="mut" style={{ marginLeft: 8, fontSize: 13 }}>
                      ({entry.profileName})
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: 99,
                      background: entry.role === 'admin' ? 'var(--amber)' : 'var(--line)',
                      color: entry.role === 'admin' ? 'var(--amber-ink)' : 'inherit',
                    }}
                  >
                    {entry.role === 'admin' ? 'Admin' : 'Membro'}
                  </span>

                  {entry.email !== 'samuel@example.com' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(entry.email)}
                      style={{
                        background: 'none',
                        border: 0,
                        color: 'var(--rose)',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 5: LETTERBOXD E LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'sync' && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 18, margin: 0 }}>Sincronização com Letterboxd</h3>
              <p className="mut" style={{ fontSize: 14, margin: '4px 0 0' }}>
                Rotina agendada para rodar a cada 6 horas. Você também pode acionar manualmente.
              </p>
            </div>
            <button
              type="button"
              className="btn"
              onClick={handleSyncNow}
              disabled={isSyncing}
            >
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Letterboxd agora'}
            </button>
          </div>

          {syncFeedback && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 8,
                background: syncFeedback.success ? '#2f8f6b22' : '#c0392b22',
                border: `1px solid ${syncFeedback.success ? '#2f8f6b' : '#c0392b'}`,
                color: 'var(--tx)',
                fontSize: 14,
              }}
            >
              <strong>{syncFeedback.success ? '✓' : '✕'}</strong> {syncFeedback.message || syncFeedback.error}
            </div>
          )}

          <h4 style={{ fontSize: 15, marginBottom: 10 }}>Logs de execução (sync_log)</h4>
          <div style={{ display: 'grid', gap: 8 }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 13,
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: 99,
                      background: log.status === 'success' ? '#2f8f6b33' : '#c0392b33',
                      color: log.status === 'success' ? '#2f8f6b' : 'var(--rose)',
                      marginRight: 8,
                    }}
                  >
                    {log.status === 'success' ? 'Sucesso' : 'Erro'}
                  </span>
                  <strong>{log.userName}:</strong> {log.message}
                </div>
                <span className="mut" style={{ fontSize: 12 }}>
                  {new Date(log.ranAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 6: CONFIGURAÇÕES */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: 12, padding: 20, maxWidth: 500 }}>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Configurações do clube</h3>
          <p className="mut" style={{ fontSize: 14, margin: '0 0 16px' }}>
            Personalize o nome exibido no topo e nas comunicações do clube.
          </p>

          <form onSubmit={handleSaveClubName}>
            <div style={{ marginBottom: 14 }}>
              <label htmlFor="clubNameInput" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--mut)', marginBottom: 6 }}>
                Nome do clube:
              </label>
              <input
                id="clubNameInput"
                type="text"
                value={tempClubName}
                onChange={(e) => setTempClubName(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            {settingsFeedback && (
              <div style={{ marginBottom: 14, color: 'var(--amber)', fontWeight: 600, fontSize: 14 }}>
                {settingsFeedback}
              </div>
            )}

            <button className="btn" type="submit">
              Salvar nome do clube
            </button>
          </form>
        </div>
      )}
    </section>
  );
};
