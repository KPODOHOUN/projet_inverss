import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const VIDEO_CATALOG = [
  
  {
    id: 'v1', level: 1, title: 'La Blockchain expliquée', duration: 300,
    reward: 0.50, category: 'crypto', icon: '₿',
    description: 'Comprendre le fonctionnement de la blockchain en 5 minutes.',
    youtubeId: 'SSo_EIwHSd4',
    quiz: [
      { q: 'Qu\'est-ce qu\'un bloc dans une blockchain ?', options: ['Un fichier chiffré', 'Un ensemble de transactions validées', 'Un serveur centralisé', 'Un type de cryptomonnaie'], correct: 1 },
      { q: 'Quelle propriété principale garantit la sécurité de la blockchain ?', options: ['La centralisation', 'La vitesse', 'L\'immuabilité', 'La gratuité'], correct: 2 },
      { q: 'Qu\'est-ce qu\'un nœud dans un réseau blockchain ?', options: ['Un bug informatique', 'Un participant qui valide les transactions', 'Un type de monnaie', 'Un centre de données'], correct: 1 },
    ]
  },
  {
    id: 'v2', level: 1, title: 'Comprendre les Stablecoins', duration: 480,
    reward: 0.75, category: 'crypto', icon: '💵',
    description: 'USDT, USDC : pourquoi ces cryptos restent stables ?',
    youtubeId: 'pGzfexGmuVw',
    quiz: [
      { q: 'Sur quoi repose la valeur d\'un stablecoin comme l\'USDT ?', options: ['L\'or', 'Le dollar américain', 'L\'euro', 'L\'offre et la demande'], correct: 1 },
      { q: 'Quel est l\'avantage principal d\'un stablecoin ?', options: ['Gains spéculatifs élevés', 'Stabilité du prix', 'Anonymat total', 'Aucune réglementation'], correct: 1 },
      { q: 'USDC signifie…', options: ['Universal Secure Coin Dollar', 'USD Coin', 'US Crypto Dollar', 'Unified Stable Currency Dollar'], correct: 1 },
    ]
  },
  {
    id: 'v3', level: 1, title: 'Sécurité des investissements', duration: 600,
    reward: 1.00, category: 'investment', icon: '🔐',
    description: 'Comment protéger votre capital et éviter les arnaques.',
    youtubeId: 'YFb1_stOXCM',
    quiz: [
      { q: 'Quelle est la première règle de sécurité en investissement ?', options: ['Tout miser sur une seule opportunité', 'Diversifier son portefeuille', 'Investir uniquement en crypto', 'Ignorer les risques'], correct: 1 },
      { q: 'Qu\'est-ce qu\'un schéma de Ponzi ?', options: ['Un investissement légitime', 'Rembourser les anciens avec l\'argent des nouveaux', 'Un type de blockchain', 'Une stratégie de trading'], correct: 1 },
      { q: 'Que signifie KYC ?', options: ['Keep Your Crypto', 'Know Your Customer', 'Key Your Capital', 'Keep Your Capital'], correct: 1 },
    ]
  },
  {
    id: 'v4', level: 1, title: 'Introduction au ROI', duration: 360,
    reward: 0.50, category: 'investment', icon: '📈',
    description: 'Calculer et comprendre le retour sur investissement.',
    youtubeId: 'N2pUa6r_8xQ',
    quiz: [
      { q: 'ROI signifie…', options: ['Rate Of Income', 'Return On Investment', 'Risk Of Investing', 'Revenue Of Interest'], correct: 1 },
      { q: 'Un ROI de 5% sur 100€ donne…', options: ['5€', '50€', '500€', '0,5€'], correct: 0 },
      { q: 'Plus le ROI est élevé, que peut-on généralement dire du risque ?', options: ['Il diminue', 'Il est nul', 'Il augmente', 'Il reste identique'], correct: 2 },
    ]
  },
  {
    id: 'v5', level: 1, title: 'NELIAXA : comment ça marche ?', duration: 420,
    reward: 0.75, category: 'platform', icon: '🏛',
    description: 'Présentation complète de la plateforme NELIAXA.',
    youtubeId: 'SSo_EIwHSd4',
    quiz: [
      { q: 'Quel est le ROI minimum proposé par NELIAXA ?', options: ['2%', '4%', '10%', '1%'], correct: 1 },
      { q: 'Quelle vérification est obligatoire avant d\'investir ?', options: ['2FA', 'KYC', 'Email', 'Téléphone'], correct: 1 },
      { q: 'Quand sont versés les paiements hebdomadaires ?', options: ['Lundi', 'Mercredi', 'Vendredi', 'Dimanche'], correct: 2 },
    ]
  },
  
  {
    id: 'v6', level: 2, title: 'La Finance Décentralisée (DeFi)', duration: 600,
    reward: 1.00, category: 'crypto', icon: '⚡',
    description: 'Protocoles DeFi, yield farming et liquidité.',
    youtubeId: 'k9HYC0EJU6E',
    quiz: [
      { q: 'DeFi signifie…', options: ['Digital Finance', 'Decentralized Finance', 'Direct Finance', 'Dual Finance'], correct: 1 },
      { q: 'Qu\'est-ce qu\'un smart contract ?', options: ['Un contrat papier numérisé', 'Un programme auto-exécutable sur la blockchain', 'Un accord entre deux banques', 'Un type de token'], correct: 1 },
      { q: 'Le yield farming consiste à…', options: ['Miner du Bitcoin', 'Fournir des liquidités en échange de récompenses', 'Acheter des NFT', 'Staker des stablecoins uniquement'], correct: 1 },
    ]
  },
  {
    id: 'v7', level: 2, title: 'Analyse Technique — Bases', duration: 720,
    reward: 1.50, category: 'trading', icon: '📊',
    description: 'Lire un graphique, supports, résistances et tendances.',
    youtubeId: 'eynxyoKgpng',
    quiz: [
      { q: 'Qu\'est-ce qu\'un support en trading ?', options: ['Un niveau de prix où le marché monte', 'Un niveau de prix où le marché rebondit à la hausse', 'Un outil de trading automatique', 'Un type de graphique'], correct: 1 },
      { q: 'Une bougie verte sur un graphique indique…', options: ['Que le prix a baissé', 'Que le prix a augmenté', 'Que le marché est fermé', 'Un volume nul'], correct: 1 },
      { q: 'RSI signifie…', options: ['Relative Strength Index', 'Real Stock Income', 'Risk Stability Indicator', 'Rate Stability Index'], correct: 0 },
    ]
  },
  {
    id: 'v8', level: 2, title: 'Diversifier son portefeuille', duration: 540,
    reward: 2.00, category: 'investment', icon: '💼',
    description: 'Stratégies de diversification pour réduire le risque.',
    youtubeId: 'N2pUa6r_8xQ',
    quiz: [
      { q: 'La diversification vise principalement à…', options: ['Maximiser les gains', 'Réduire le risque global', 'Augmenter la liquidité', 'Éviter les impôts'], correct: 1 },
      { q: 'Combien de classes d\'actifs différentes recommande-t-on au minimum ?', options: ['1', '2', '3 à 5', '10 et plus'], correct: 2 },
      { q: 'Qu\'est-ce que la corrélation entre actifs ?', options: ['La somme des actifs', 'La mesure de leur évolution commune', 'Le rendement total', 'La liquidité'], correct: 1 },
    ]
  },
  
  {
    id: 'v9', level: 3, title: 'Tokenomics avancée', duration: 900,
    reward: 2.50, category: 'crypto', icon: '🪙',
    description: 'Comprendre l\'économie des tokens, inflation, burning.',
    youtubeId: 'SSo_EIwHSd4',
    quiz: [
      { q: 'Le "token burning" consiste à…', options: ['Créer de nouveaux tokens', 'Détruire définitivement des tokens', 'Transférer des tokens', 'Bloquer des tokens'], correct: 1 },
      { q: 'Qu\'est-ce que la market cap d\'un token ?', options: ['Le prix maximum atteint', 'Prix × Offre en circulation', 'Le volume journalier', 'Le nombre de détenteurs'], correct: 1 },
      { q: 'Un mécanisme déflationniste vise à…', options: ['Augmenter l\'offre de tokens', 'Réduire l\'offre pour augmenter la valeur', 'Stabiliser le prix', 'Distribuer des dividendes'], correct: 1 },
    ]
  },
];

const getAccessLevel = (user) => {
  const investments = user?.activeInvestments || [];
  if (!investments.length) return 0;
  const packLevels = { starter: 1, booster: 2, pro: 3, elite: 3, diamond: 3 };
  const highest = investments.reduce((max, inv) => {
    const lvl = packLevels[inv.pack] || 0;
    return lvl > max ? lvl : max;
  }, 0);
  return highest;
};

export default function Academy() {
  const { user, api } = useAuth();
  const [completedVideos, setCompletedVideos] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [phase, setPhase] = useState('browse'); 
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [canTakeQuiz, setCanTakeQuiz] = useState(false);
  const timerRef = useRef(null);

  const accessLevel = getAccessLevel(user);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await api.get('/academy/progress');
      if (res.data.success) {
        setCompletedVideos(res.data.data.completedVideos || []);
        setTotalEarned(res.data.data.totalEarned || 0);
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
    setPhase('quiz');
  };

  const submitQuiz = async () => {
    if (Object.keys(quizAnswers).length < activeVideo.quiz.length) return;
    setSubmitting(true);

    const correct = activeVideo.quiz.filter((q, i) => quizAnswers[i] === q.correct).length;
    const score = Math.round((correct / activeVideo.quiz.length) * 100);
    setQuizScore(score);

    if (score >= 70) {
      try {
        const res = await api.post('/academy/complete', { videoId: activeVideo.id, score });
        if (res.data.success) {
          setCompletedVideos(prev => [...prev, activeVideo.id]);
          setTotalEarned(prev => prev + res.data.data.reward);
        }
      } catch (e) {
        console.error('Erreur validation:', e);
      }
    }

    setPhase('result');
    setSubmitting(false);
  };

  const levelConfig = [
    { level: 1, label: 'Niveau 1 — Débutant', minPack: 'Starter', color: 'yellow', requiredLevel: 1 },
    { level: 2, label: 'Niveau 2 — Intermédiaire', minPack: 'Booster', color: 'blue', requiredLevel: 2 },
    { level: 3, label: 'Niveau 3 — Avancé', minPack: 'Pro', color: 'purple', requiredLevel: 3 },
  ];

  const videosByLevel = (level) => VIDEO_CATALOG.filter(v => v.level === level);
  const completedCount = completedVideos.length;
  const totalVideos = VIDEO_CATALOG.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
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
        <div className={`border-2 p-10 text-center ${passed ? 'border-green-500 bg-green-900/10' : 'border-red-500 bg-red-900/10'}`}>
          <div className="text-7xl mb-6">{passed ? '🎉' : '😔'}</div>
          <h2 className={`text-3xl font-black mb-4 ${passed ? 'text-green-400' : 'text-red-400'}`}>
            {passed ? 'Félicitations !' : 'Réessayez !'}
          </h2>
          <p className="text-5xl font-black text-white mb-4">{quizScore}%</p>
          <p className="text-gray-400 mb-6">
            {passed
              ? `Vous avez validé "${activeVideo.title}" et gagné ${activeVideo.reward} USDT !`
              : `Score insuffisant (70% requis). Revoyez la vidéo et réessayez.`}
          </p>
          {passed && (
            <div className="bg-yellow-900/30 border border-yellow-500 p-4 mb-6">
              <p className="text-yellow-400 font-black text-xl">+{activeVideo.reward} USDT crédités !</p>
            </div>
          )}
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
                className="px-8 py-3 border-2 border-yellow-500 text-yellow-500 font-black hover:bg-yellow-900/20 transition-all"
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
          <h2 className="text-3xl font-black text-yellow-500 mb-2">QUIZ DE VALIDATION</h2>
          <p className="text-gray-400">{activeVideo.title} — Score minimum requis : 70%</p>
        </div>

        <div className="space-y-6">
          {activeVideo.quiz.map((question, qi) => (
            <div key={qi} className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-6">
              <p className="text-white font-bold mb-4 text-lg">
                {qi + 1}. {question.q}
              </p>
              <div className="space-y-3">
                {question.options.map((option, oi) => (
                  <button
                    key={oi}
                    onClick={() => setQuizAnswers(prev => ({ ...prev, [qi]: oi }))}
                    className={`w-full text-left px-5 py-3 border-2 font-semibold transition-all ${
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
          <button onClick={stopVideo} className="px-6 py-4 border-2 border-gray-600 text-gray-400 font-bold hover:border-gray-400 transition-all">
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
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500 p-6">
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

          {/* Récompense + bouton quiz */}
          <div className="flex items-center justify-between bg-yellow-900/20 border border-yellow-500/30 p-4">
            <div>
              <p className="text-yellow-400 font-black">🎁 Récompense : +{activeVideo.reward} USDT</p>
              <p className="text-gray-500 text-sm mt-1">
                {canTakeQuiz
                  ? '✓ Visionnage validé — Passez le quiz pour gagner votre récompense !'
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
        <h1 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          ACADÉMIE NELIAXA
        </h1>
        <p className="text-xl text-gray-400">
          Formez-vous et gagnez des USDT à chaque vidéo validée
        </p>
      </div>

      {/* Stats globales */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 text-black shadow-2xl shadow-yellow-500/30">
          <p className="text-sm font-semibold mb-2">USDT GAGNÉS</p>
          <h3 className="text-4xl font-black">{totalEarned.toFixed(2)}</h3>
          <p className="text-sm opacity-80">Total cumulé</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-6 text-white">
          <p className="text-sm font-semibold mb-2 text-yellow-500">VIDÉOS COMPLÉTÉES</p>
          <h3 className="text-4xl font-black">{completedCount} <span className="text-xl text-gray-500">/ {totalVideos}</span></h3>
          <div className="h-1 bg-gray-800 mt-3">
            <div className="h-full bg-yellow-500" style={{ width: `${(completedCount / totalVideos) * 100}%` }} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-blue-900/30 p-6 text-white">
          <p className="text-sm font-semibold mb-2 text-blue-500">NIVEAU D'ACCÈS</p>
          <h3 className="text-2xl font-black">
            {accessLevel === 0 ? 'Aucun pack' : accessLevel === 1 ? 'Débutant' : accessLevel === 2 ? 'Intermédiaire' : 'Avancé'}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {accessLevel === 0 ? 'Achetez un pack pour accéder' : `Niveau ${accessLevel} débloqué`}
          </p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-green-900/30 p-6 text-white">
          <p className="text-sm font-semibold mb-2 text-green-500">POTENTIEL RESTANT</p>
          <h3 className="text-4xl font-black text-green-400">
            {VIDEO_CATALOG.filter(v => !completedVideos.includes(v.id) && v.level <= Math.max(accessLevel, 1))
              .reduce((sum, v) => sum + v.reward, 0).toFixed(2)}
          </h3>
          <p className="text-sm text-gray-400">USDT disponibles</p>
        </div>
      </div>

      {}
      {accessLevel === 0 && (
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500 p-10 text-center mb-12">
          <div className="text-6xl mb-4">🔒</div>
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
                <div className={`px-4 py-2 bg-${color}-500/20 border border-${color}-500/50`}>
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
                    className={`bg-gradient-to-br from-gray-900 to-black border-2 p-6 transition-all relative ${
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
                      <span className="text-3xl">{video.icon}</span>
                      <div>
                        <span className={`px-2 py-0.5 text-xs font-bold border ${
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

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-500 text-xs">⏱ {Math.floor(video.duration / 60)} min</span>
                      <span className="text-yellow-500 font-black">+{video.reward} USDT</span>
                    </div>

                    <button
                      onClick={() => isAccessible && !isCompleted && startVideo(video)}
                      disabled={isLocked || isCompleted}
                      className={`w-full py-3 font-black transition-all text-sm ${
                        isCompleted
                          ? 'bg-green-900/30 text-green-400 border border-green-500/30 cursor-default'
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

      {/* Tableau des récompenses */}
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-8 mt-8">
        <h3 className="text-2xl font-black text-yellow-500 mb-6">TABLEAU DES RÉCOMPENSES</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-black text-yellow-500 uppercase tracking-widest">Niveau</th>
                <th className="px-4 py-3 text-left text-xs font-black text-yellow-500 uppercase tracking-widest">Pack Requis</th>
                <th className="px-4 py-3 text-left text-xs font-black text-yellow-500 uppercase tracking-widest">Vidéos</th>
                <th className="px-4 py-3 text-left text-xs font-black text-yellow-500 uppercase tracking-widest">Récompense / vidéo</th>
                <th className="px-4 py-3 text-left text-xs font-black text-yellow-500 uppercase tracking-widest">Max total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-900/20">
              {[
                { lvl: 'Débutant', pack: 'Starter (50€+)', nb: 5, range: '0.50 – 1.00', max: '3.50' },
                { lvl: 'Intermédiaire', pack: 'Booster (500€+)', nb: 3, range: '1.00 – 2.00', max: '4.50' },
                { lvl: 'Avancé', pack: 'Pro (2000€+)', nb: 1, range: '2.50', max: '2.50' },
              ].map(row => (
                <tr key={row.lvl} className="hover:bg-yellow-900/10">
                  <td className="px-4 py-4 font-bold text-white">{row.lvl}</td>
                  <td className="px-4 py-4 text-gray-400">{row.pack}</td>
                  <td className="px-4 py-4 text-white">{row.nb} vidéos</td>
                  <td className="px-4 py-4 text-yellow-500 font-bold">{row.range} USDT</td>
                  <td className="px-4 py-4 text-green-500 font-black">{row.max} USDT</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-yellow-900/10 border border-yellow-900/30">
          <p className="text-yellow-500 text-sm font-bold">
            💡 Votre parrain reçoit automatiquement 10% de chaque USDT que vous gagnez en académie.
          </p>
        </div>
      </div>
    </div>
  );
}