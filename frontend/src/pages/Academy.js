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
          <p className="mt-4 text-gray-400 font-semibold">Chargement de l'Académie...</p>
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
          <h2 className={`text-xl font-black mb-4 ${passed ? 'text-green-400' : 'text-red-400'}`}>
            {passed ? 'Félicitations !' : 'Réessayez !'}
          </h2>
          <p className="text-3xl font-black text-white mb-4">{quizScore}%</p>
          <p className="text-gray-400 mb-6">
            {passed
              ? `Vous avez validé "${activeVideo.title}" !`
              : `Score insuffisant (70% requis). Revoyez la vidéo et réessayez.`}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => { setPhase('browse'); setActiveVideo(null); }}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black hover:from-yellow-600 hover:to-yellow-700 transition-all"
            >
              RETOUR AUX VIDÉOS
            </button>
            {!passed && (
              <button
                onClick={() => startVideo(activeVideo)}
                className="px-8 py-3 rounded border-2 border-yellow-500 text-yellow-500 font-black hover:bg-yellow-900/20 transition-all"
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
          <h2 className="text-xl font-black text-yellow-500 mb-2">QUIZ DE VALIDATION</h2>
          <p className="text-gray-400">{activeVideo.title} — Score minimum requis : 70%</p>
        </div>

        <div className="space-y-6">
          {activeVideo.quiz.map((question, qi) => (
            <div key={qi} className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 rounded-lg p-6">
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
                        : 'border-yellow-900/20 text-gray-300 hover:border-yellow-700 hover:bg-yellow-900/10'
                    }`}
                  >
                    <span className="text-yellow-600 font-black mr-3">{String.fromCharCode(65 + oi)}.</span>
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
            className="flex-1 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black text-lg hover:from-yellow-600 hover:to-yellow-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'CORRECTION...' : 'VALIDER MES RÉPONSES'}
          </button>
          <button onClick={stopVideo} className="px-6 py-4 rounded border-2 border-gray-600 text-gray-400 font-bold hover:border-gray-400 transition-all">
            ANNULER
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">
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
              <h2 className="text-2xl font-black text-yellow-500">{activeVideo.title}</h2>
              <p className="text-gray-400 text-sm">{activeVideo.description}</p>
            </div>
            <button onClick={stopVideo} className="text-gray-500 hover:text-white text-2xl transition-colors">✕</button>
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
            <div className="flex justify-between text-xs text-gray-400 mb-2">
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
              <p className="text-gray-300 text-sm">
                {canTakeQuiz
                  ? '✓ Visionnage validé — Passez le quiz pour valider cette vidéo !'
                  : 'Regardez au moins 80% de la vidéo avant de passer le quiz'}
              </p>
            </div>
            <button
              onClick={goToQuiz}
              disabled={!canTakeQuiz}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black hover:from-yellow-600 hover:to-yellow-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap ml-4"
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
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          ACADÉMIE IMC
        </h1>
        <p className="text-xl text-gray-400">
          Formez-vous à l'investissement, niveau par niveau
        </p>
      </div>

      {/* Stats globales */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 text-black shadow-2xl shadow-yellow-500/30">
          <p className="text-sm font-semibold mb-2">VIDÉOS COMPLÉTÉES</p>
          <h3 className="text-2xl font-black">{completedCount} <span className="text-lg opacity-70">/ {totalVideos}</span></h3>
          <div className="h-1 bg-black/20 mt-3">
            <div className="h-full bg-black" style={{ width: `${totalVideos ? (completedCount / totalVideos) * 100 : 0}%` }} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-blue-900/30 rounded-lg p-6 text-white">
          <p className="text-sm font-semibold mb-2 text-blue-500">NIVEAU D'ACCÈS</p>
          <h3 className="text-2xl font-black">
            {accessLevel === 0 ? 'Aucun pack' : accessLevel === 1 ? 'Débutant' : accessLevel === 2 ? 'Intermédiaire' : 'Avancé'}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {accessLevel === 0 ? 'Achetez un pack pour accéder' : `Niveau ${accessLevel} débloqué`}
          </p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-green-900/30 rounded-lg p-6 text-white">
          <p className="text-sm font-semibold mb-2 text-green-500">PROGRESSION</p>
          <h3 className="text-2xl font-black text-green-400">
            {totalVideos ? Math.round((completedCount / totalVideos) * 100) : 0}%
          </h3>
          <p className="text-sm text-gray-400">du contenu disponible</p>
        </div>
      </div>

      {}
      {accessLevel === 0 && (
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500 rounded-lg p-6 text-center mb-12">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-black text-yellow-500 mb-3">Pack d'investissement requis</h2>
          <p className="text-gray-400 mb-6">Achetez au minimum le Pack Starter pour accéder aux vidéos de niveau 1.</p>
          <a href="/dashboard/invest" className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black hover:from-yellow-600 hover:to-yellow-700 transition-all">
            VOIR LES PACKS →
          </a>
        </div>
      )}

      {/* Vidéos par niveau */}
      {levelConfig.map(({ level, label, minPack, color, requiredLevel }) => {
        const videos = videosByLevel(level);
        const isLocked = accessLevel < requiredLevel;
        const completedInLevel = videos.filter(v => completedVideos.includes(v.id)).length;

        return (
          <div key={level} className="mb-12">
            {/* En-tête niveau */}
            <div className={`flex items-center justify-between mb-6 pb-3 border-b-2 border-${color}-500/30`}>
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 bg-${color}-500/20 border border-${color}-500/50 rounded-full`}>
                  <span className={`text-${color}-400 font-black text-sm tracking-widest`}>{label.toUpperCase()}</span>
                </div>
                {isLocked && (
                  <span className="text-gray-500 text-sm">🔒 Requiert pack {minPack}+</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-400">{completedInLevel}/{videos.length} complétées</span>
                <div className="h-1 w-32 bg-gray-800 mt-1">
                  <div className={`h-full bg-${color}-500`} style={{ width: `${(completedInLevel / videos.length) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Grille vidéos */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map(video => {
                const isCompleted = completedVideos.includes(video.id);
                const isAccessible = !isLocked;

                return (
                  <div
                    key={video.id}
                    className={`bg-gradient-to-br from-gray-900 to-black border-2 rounded-lg p-6 transition-all relative ${
                      isCompleted
                        ? 'border-green-500/60 opacity-80'
                        : isLocked
                          ? 'border-gray-700 opacity-50'
                          : 'border-yellow-900/30 hover:border-yellow-500'
                    }`}
                  >
                    {/* Badge complété */}
                    {isCompleted && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 flex items-center justify-center font-black text-black text-sm">
                        ✓
                      </div>
                    )}
                    {isLocked && (
                      <div className="absolute top-3 right-3 text-gray-500 text-xl">🔒</div>
                    )}

                    {/* Contenu */}
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-xl">{CATEGORY_ICON[video.category] || '📚'}</span>
                      <div>
                        <span className={`px-2 py-0.5 text-xs font-bold border rounded-full ${
                          video.category === 'crypto' ? 'border-orange-500/50 text-orange-400' :
                          video.category === 'investment' ? 'border-green-500/50 text-green-400' :
                          video.category === 'trading' ? 'border-blue-500/50 text-blue-400' :
                          'border-purple-500/50 text-purple-400'
                        }`}>
                          {video.category.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-white mb-2">{video.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{video.description}</p>

                    <div className="mb-4">
                      <span className="text-gray-500 text-xs">⏱ {Math.floor(video.duration / 60)} min</span>
                    </div>

                    <button
                      onClick={() => isAccessible && !isCompleted && startVideo(video)}
                      disabled={isLocked || isCompleted}
                      className={`w-full py-3 font-black transition-all text-sm ${
                        isCompleted
                          ? 'bg-green-900/30 text-green-400 border border-green-500/30 rounded-full cursor-default'
                          : isLocked
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-600 hover:to-yellow-700'
                      }`}
                    >
                      {isCompleted ? '✓ COMPLÉTÉE' : isLocked ? '🔒 VERROUILLÉE' : '▶ REGARDER →'}
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
