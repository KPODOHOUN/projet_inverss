import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { tierOf } from '../utils/packTiers';

const CATEGORY_ICON = { crypto: '₿', investment: '📈', trading: '📊', platform: '🏛' };
const TIER_ACADEMY_LEVEL = { bronze: 1, silver: 2, gold: 3, platinum: 3, diamond: 3 };

export default function Academy() {
  const { api } = useAuth();
  const [videos, setVideos] = useState([]);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [accessLevel, setAccessLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [phase, setPhase] = useState('browse');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [canTakeQuiz, setCanTakeQuiz] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchProgress();
    fetchAccessLevel();
  }, []);

  const fetchAccessLevel = async () => {
    try {
      const res = await api.get('/investments/my-investments');
      if (res.data.success) {
        const active = res.data.data.investments.filter(i => i.status === 'active');
        const highest = active.reduce((max, inv) => Math.max(max, TIER_ACADEMY_LEVEL[tierOf(inv.pack)] || 0), 0);
        setAccessLevel(highest);
      }
    } catch (e) { /* stays at 0 (no access) on failure, safe default */ }
  };

  const fetchProgress = async () => {
    try {
      const res = await api.get('/academy/progress');
      if (res.data.success) {
        setCompletedVideos((res.data.data.completedVideos || []).map(String));
        setVideos(res.data.data.videos || []);
      }
    } catch (e) {
      console.error('Erreur chargement progression:', e);
    } finally {
      setLoading(false);
    }
  };

  const startVideo = (video) => {
    setActiveVideo(video);
    setPhase('watch');
    setWatchProgress(0);
    setCanTakeQuiz(false);
    setQuizAnswers({});
    setQuizScore(null);

    let progress = 0;
    timerRef.current = setInterval(() => {
      progress += 100 / (video.duration * 0.8);
      setWatchProgress(Math.min(Math.round(progress), 100));
      if (progress >= 100) {
        clearInterval(timerRef.current);
        setCanTakeQuiz(true);
      }
    }, 1000);
  };

  const stopVideo = () => {
    clearInterval(timerRef.current);
    setPhase('browse');
    setActiveVideo(null);
    setWatchProgress(0);
    setCanTakeQuiz(false);
  };

  const goToQuiz = () => {
    clearInterval(timerRef.current);
    // Not every video has quiz questions configured — skip straight to
    // completion rather than showing an empty quiz screen.
    if (!activeVideo.quiz || activeVideo.quiz.length === 0) {
      submitQuiz(100);
      return;
    }
    setPhase('quiz');
  };

  const submitQuiz = async (forcedScore) => {
    const hasQuiz = activeVideo.quiz && activeVideo.quiz.length > 0;
    if (hasQuiz && Object.keys(quizAnswers).length < activeVideo.quiz.length) return;
    setSubmitting(true);

    const score = forcedScore ?? Math.round(
      (activeVideo.quiz.filter((q, i) => quizAnswers[i] === q.correctAnswer).length / activeVideo.quiz.length) * 100
    );
    setQuizScore(score);

    if (score >= 70) {
      try {
        const res = await api.post('/academy/complete', { videoId: activeVideo.id, score });
        if (res.data.success) {
          setCompletedVideos(prev => [...prev, String(activeVideo.id)]);
        }
      } catch (e) {
        console.error('Erreur validation:', e);
      }
    }

    setPhase('result');
    setSubmitting(false);
  };

  const LEVEL_META = {
    1: { label: 'Niveau 1 — Débutant', minPack: 'Starter', color: 'yellow' },
    2: { label: 'Niveau 2 — Intermédiaire', minPack: 'Booster', color: 'blue' },
    3: { label: 'Niveau 3 — Avancé', minPack: 'Pro', color: 'purple' },
  };
  const presentLevels = [...new Set(videos.map(v => v.level))].sort((a, b) => a - b);
  const levelConfig = presentLevels.map(level => ({
    level, requiredLevel: level,
    ...(LEVEL_META[level] || { label: `Niveau ${level}`, minPack: '—', color: 'gray' })
  }));

  const videosByLevel = (level) => videos.filter(v => v.level === level);
  const completedCount = completedVideos.length;
  const totalVideos = videos.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
          <p className="mt-4 text-[#e7ebf2]/60 font-semibold">Chargement de l'Académie...</p>
        </div>
      </div>
    );
  }

  // ── Phase : Résultat quiz ──
  if (phase === 'result' && activeVideo) {
    const passed = quizScore >= 70;
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className={`border-2 rounded-lg p-6 text-center ${passed ? 'border-green-500 bg-green-900/10' : 'border-red-500 bg-red-900/10'}`}>
          <div className="text-5xl mb-6">{passed ? '🎉' : '😔'}</div>
          <h2 className={`text-xl font-semibold mb-4 ${passed ? 'text-green-400' : 'text-red-400'}`}>
            {passed ? 'Félicitations !' : 'Réessayez !'}
          </h2>
          <p className="text-3xl font-semibold text-white mb-4">{quizScore}%</p>
          <p className="text-[#e7ebf2]/60 mb-6">
            {passed
              ? `Vous avez validé "${activeVideo.title}" !`
              : `Score insuffisant (70% requis). Revoyez la vidéo et réessayez.`}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => { setPhase('browse'); setActiveVideo(null); }}
              className="lux-btn-gold !px-8 !py-3"
            >
              RETOUR AUX VIDÉOS
            </button>
            {!passed && (
              <button
                onClick={() => startVideo(activeVideo)}
                className="px-8 py-3 rounded border-2 border-yellow-500 text-yellow-500 font-semibold hover:bg-yellow-900/20 transition-all"
              >
                REVOIR LA VIDÉO
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Phase : Quiz ──
  if (phase === 'quiz' && activeVideo) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="lux-serif text-2xl font-bold text-[#e7ebf2] mb-2">QUIZ DE VALIDATION</h2>
          <p className="text-[#e7ebf2]/60">{activeVideo.title} — Score minimum requis : 70%</p>
        </div>

        <div className="space-y-6">
          {activeVideo.quiz.map((question, qi) => (
            <div key={qi} className="lux-card p-6">
              <p className="text-white font-bold mb-4 text-lg">
                {qi + 1}. {question.question}
              </p>
              <div className="space-y-3">
                {question.options.map((option, oi) => (
                  <button
                    key={oi}
                    onClick={() => setQuizAnswers(prev => ({ ...prev, [qi]: oi }))}
                    className={`w-full text-left px-5 py-3 border-2 rounded font-semibold transition-all ${
                      quizAnswers[qi] === oi
                        ? 'border-yellow-500 bg-yellow-900/30 text-yellow-400'
                        : 'border-white/10 text-[#e7ebf2]/80 hover:border-yellow-700 hover:bg-yellow-900/10'
                    }`}
                  >
                    <span className="text-yellow-600 font-semibold mr-3">{String.fromCharCode(65 + oi)}.</span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={submitQuiz}
            disabled={submitting || Object.keys(quizAnswers).length < activeVideo.quiz.length}
            className="lux-btn-gold flex-1 !py-4 !text-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'CORRECTION...' : 'VALIDER MES RÉPONSES'}
          </button>
          <button onClick={stopVideo} className="px-6 py-4 rounded border-2 border-gray-600 text-[#e7ebf2]/60 font-bold hover:border-gray-400 transition-all">
            ANNULER
          </button>
        </div>

        <p className="text-center text-[#e7ebf2]/50 text-sm mt-4">
          {Object.keys(quizAnswers).length} / {activeVideo.quiz.length} questions répondues
        </p>
      </div>
    );
  }

  // ── Phase : Visionnage ──
  if (phase === 'watch' && activeVideo) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="lux-serif text-3xl font-bold text-[#e7ebf2]">{activeVideo.title}</h2>
              <p className="text-[#e7ebf2]/60 text-sm">{activeVideo.description}</p>
            </div>
            <button onClick={stopVideo} className="text-[#e7ebf2]/50 hover:text-white text-2xl transition-colors">✕</button>
          </div>

          {/* Lecteur YouTube embarqué */}
          <div className="aspect-video bg-black mb-6 relative">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Barre de progression */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[#e7ebf2]/60 mb-2">
              <span>Progression du visionnage (80% minimum requis)</span>
              <span className={watchProgress >= 100 ? 'text-green-400 font-bold' : 'text-yellow-500'}>{watchProgress}%</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${watchProgress >= 100 ? 'bg-green-500' : 'bg-yellow-500'}`}
                style={{ width: `${watchProgress}%` }}
              />
            </div>
          </div>

          {/* Bouton quiz */}
          <div className="flex items-center justify-between bg-yellow-900/20 border border-yellow-500/30 rounded p-4">
            <div>
              <p className="text-[#e7ebf2]/80 text-sm">
                {canTakeQuiz
                  ? '✓ Visionnage validé — Passez le quiz pour valider cette vidéo !'
                  : 'Regardez au moins 80% de la vidéo avant de passer le quiz'}
              </p>
            </div>
            <button
              onClick={goToQuiz}
              disabled={!canTakeQuiz}
              className="lux-btn-gold !px-8 !py-3 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap ml-4"
            >
              PASSER LE QUIZ →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase : Browse (vue principale) ──
  return (
    <div className="space-y-10">
      <div className="animate-cardIn">
        <p className="lux-label mb-2">Académie IMC</p>
        <h1 className="lux-serif text-2xl sm:text-3xl font-bold text-[#e7ebf2] leading-none">
          Apprendre à <span className="lux-gold-text italic">investir</span>
        </h1>
        <p className="mt-2 text-sm text-[#e7ebf2]/50">Formez-vous à l'investissement, niveau par niveau.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="lux-card p-6">
          <p className="lux-label mb-3">Vidéos complétées</p>
          <p className="lux-num text-3xl font-light text-[#e7ebf2]">{completedCount} <span className="text-lg text-[#e7ebf2]/40">/ {totalVideos}</span></p>
          <div className="h-1.5 rounded-full bg-white/5 mt-4 overflow-hidden">
            <div className="h-full rounded-full bg-[#f59e0b]" style={{ width: `${totalVideos ? (completedCount / totalVideos) * 100 : 0}%` }} />
          </div>
        </div>
        <div className="lux-card p-6">
          <p className="lux-label mb-3">Niveau d'accès</p>
          <p className="lux-serif text-3xl font-bold text-[#e7ebf2] leading-none">
            {accessLevel === 0 ? 'Aucun pack' : accessLevel === 1 ? 'Débutant' : accessLevel === 2 ? 'Intermédiaire' : 'Avancé'}
          </p>
          <p className="text-xs text-[#e7ebf2]/40 mt-2">
            {accessLevel === 0 ? 'Achetez un pack pour accéder' : `Niveau ${accessLevel} débloqué`}
          </p>
        </div>
        <div className="lux-card p-6">
          <p className="lux-label mb-3">Progression</p>
          <p className="lux-num text-3xl font-light lux-gold-text">
            {totalVideos ? Math.round((completedCount / totalVideos) * 100) : 0}%
          </p>
          <p className="text-xs text-[#e7ebf2]/40 mt-2">du contenu disponible</p>
        </div>
      </div>

      {accessLevel === 0 && (
        <div className="lux-card-gold p-7 sm:p-8 flex flex-wrap items-center justify-between gap-5">
          <div className="relative">
            <p className="lux-label !text-[#fbbf24]/70 mb-1">Contenu verrouillé</p>
            <h2 className="lux-serif text-3xl font-bold text-[#e7ebf2] mb-1">Pack d'investissement requis</h2>
            <p className="text-sm text-[#e7ebf2]/55">Souscrivez au minimum le Pack Starter pour accéder aux vidéos de niveau 1.</p>
          </div>
          <a href="/dashboard#invest" className="relative lux-btn-gold !px-7 !py-3">
            Voir les packs →
          </a>
        </div>
      )}

      {/* Vidéos par niveau */}
      {levelConfig.map(({ level, label, minPack, color, requiredLevel }) => {
        const videos = videosByLevel(level);
        const isLocked = accessLevel < requiredLevel;
        const completedInLevel = videos.filter(v => completedVideos.includes(v.id)).length;

        return (
          <div key={level}>
            {/* En-tête niveau */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-white/5">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="lux-serif text-2xl sm:text-3xl font-bold text-[#e7ebf2]">{label}</h2>
                {isLocked && (
                  <span className="lux-pill bg-white/5 text-[#e7ebf2]/50 ring-1 ring-inset ring-white/10">Requiert pack {minPack}+</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs sm:text-sm text-[#e7ebf2]/60">{completedInLevel}/{videos.length} complétées</span>
                <div className="h-1 w-28 sm:w-32 rounded-full bg-white/5 mt-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-[#f59e0b]" style={{ width: `${(completedInLevel / videos.length) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Grille vidéos */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {videos.map(video => {
                const isCompleted = completedVideos.includes(video.id);
                const isAccessible = !isLocked;

                return (
                  <div
                    key={video.id}
                    className={`lux-card p-6 flex flex-col relative ${
                      isCompleted ? '!border-emerald-400/30' : isLocked ? 'opacity-55' : 'lux-card-hover'
                    }`}
                  >
                    {/* Badge complété */}
                    {isCompleted && (
                      <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30 flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}
                    {isLocked && (
                      <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-[11px]">🔒</div>
                    )}

                    {/* Contenu */}
                    <div className="flex items-start gap-3 mb-3">
                      <span className="lux-icon-chip !w-9 !h-9 text-base">{CATEGORY_ICON[video.category] || '📚'}</span>
                      <div>
                        <span className="lux-pill mt-1.5 bg-yellow-400/10 text-[#fbbf24] ring-1 ring-inset ring-yellow-400/20 capitalize">
                          {video.category}
                        </span>
                      </div>
                    </div>

                    <h3 className="lux-serif text-xl font-semibold text-[#e7ebf2] mb-1.5 leading-snug">{video.title}</h3>
                    <p className="text-[#e7ebf2]/50 text-sm mb-4 leading-relaxed">{video.description}</p>

                    <div className="mb-5 mt-auto">
                      <span className="text-[#e7ebf2]/40 text-xs">{Math.floor(video.duration / 60)} min</span>
                    </div>

                    <button
                      onClick={() => isAccessible && !isCompleted && startVideo(video)}
                      disabled={isLocked || isCompleted}
                      className={`w-full !py-2.5 ${
                        isCompleted
                          ? 'lux-btn-ghost !text-emerald-300 !border-emerald-400/25 cursor-default'
                          : isLocked
                            ? 'lux-btn-ghost opacity-60 cursor-not-allowed'
                            : 'lux-btn-gold'
                      }`}
                    >
                      {isCompleted ? '✓ Complétée' : isLocked ? 'Verrouillée' : '▶ Regarder'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
