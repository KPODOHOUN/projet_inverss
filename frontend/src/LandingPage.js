import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = ['home', 'plans', 'how-it-works', 'security', 'cta'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 150 && rect.bottom >= 150;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(218, 165, 32, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(184, 134, 11, 0.15) 0%, transparent 50%)',
          animation: 'pulse 8s ease-in-out infinite'
        }}></div>
      </div>

      <Navigation
        scrolled={scrolled}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <HeroSection scrollToSection={scrollToSection} />
      <StatsBar />
      <InvestmentPlans />
      <HowItWorks />
      <SecuritySection />
      <FinalCTA />
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
}

const IconCheck = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
    <path d="M3 8l3.5 3.5L13 4.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconArrowRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconUsers = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconTrendUp = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="17 6 23 6 23 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconShield = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCoins = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M18.09 10.37A6 6 0 1110.34 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 6h1a2 2 0 010 4H7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconLock = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1" fill="currentColor"/>
  </svg>
);

const IconAudit = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconDatabase = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const IconGuarantee = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconClose = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M4 4l14 14M18 4L4 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconMail = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5"/>
    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconPhone = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.17 2 2 0 012 .01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconPin = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const IconClock = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
    <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconTelegram = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconWhatsApp = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function Navigation({ scrolled, activeSection, scrollToSection, mobileMenuOpen, setMobileMenuOpen }) {
  const navItems = [
    { id: 'home',         label: 'Accueil' },
    { id: 'plans',        label: 'Plans' },
    { id: 'how-it-works', label: 'Comment ça marche' },
    { id: 'security',     label: 'Sécurité' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/95 backdrop-blur-sm shadow-lg shadow-yellow-900/20' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">

          {}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
            <img
              src="/images/logo-neliaxa.png"
              alt="NELIAXA Logo"
              className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]"
            />
            <span className="font-black text-2xl hidden sm:block text-yellow-500 tracking-wide">
              NELIAXA
            </span>
          </div>

          {}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`font-semibold text-sm tracking-wide hover:text-yellow-500 transition-colors bg-transparent border-none cursor-pointer ${
                  activeSection === item.id
                    ? 'text-yellow-500 border-b-2 border-yellow-500'
                    : 'text-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="px-6 py-2 border-2 border-yellow-500 font-bold text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all text-sm tracking-wide"
            >
              CONNEXION
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg shadow-yellow-500/50 text-sm tracking-wide"
            >
              COMMENCER
            </Link>
          </div>

          {}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-yellow-500 bg-transparent border-none cursor-pointer p-1"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>

        {}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-yellow-900/30 pt-4 space-y-3">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`block w-full text-left font-semibold py-2 text-sm tracking-wide bg-transparent border-none cursor-pointer ${
                  activeSection === item.id ? 'text-yellow-500' : 'text-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 flex flex-col gap-3">
              <Link
                to="/login"
                className="block w-full text-center px-6 py-2.5 border-2 border-yellow-500 font-bold text-yellow-500 text-sm tracking-wide"
              >
                CONNEXION
              </Link>
              <Link
                to="/register"
                className="block w-full text-center px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold text-sm tracking-wide"
              >
                COMMENCER
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function HeroSection({ scrollToSection }) {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 px-6">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {}
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-6 py-2 border-2 border-yellow-500 mb-8 bg-yellow-500/10 backdrop-blur-sm">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span className="font-bold text-yellow-500 text-xs tracking-widest uppercase">
                Plateforme d'investissement · Nouvelle génération
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight">
              INVESTISSEZ<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                INTELLIGEMMENT
              </span><br />
              EN AFRIQUE
            </h1>

            <p className="text-xl text-gray-300 mb-10 max-w-xl leading-relaxed">
              Rendements de{' '}
              <strong className="text-yellow-500">4–10 % ROI</strong>{' '}
              avec transparence blockchain, éducation financière et gamification sociale.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold text-base hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-105 shadow-2xl shadow-yellow-500/50 tracking-wide"
              >
                COMMENCER MAINTENANT
                <IconArrowRight size={18} />
              </Link>
              <button
                onClick={() => scrollToSection('plans')}
                className="inline-flex items-center justify-center px-10 py-4 border-2 border-yellow-500 font-bold text-base text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all bg-transparent cursor-pointer tracking-wide"
              >
                VOIR LES PLANS
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              {['KYC Vérifié', 'Sécurité Blockchain', 'Support 24/7'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <IconCheck color="#22c55e" size={15} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full scale-75 pointer-events-none" />
              <img
                src="/images/hero-phone.png"
                alt="Application NELIAXA"
                className="relative z-10 w-full max-w-lg object-contain drop-shadow-[0_0_40px_rgba(234,179,8,0.3)]"
                style={{ animation: 'float 6s ease-in-out infinite' }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}

/* ─── STATS BAR ──────────────────────────────────────────────────────────── */

function StatsBar() {
  const stats = [
    { value: '10K+',  label: 'Investisseurs actifs', Icon: IconUsers },
    { value: '5 M€+', label: 'Volume investi',        Icon: IconCoins },
    { value: '8,5 %', label: 'ROI moyen',             Icon: IconTrendUp },
    { value: '24/7',  label: 'Support client',        Icon: IconShield },
  ];

  return (
    <section className="relative z-10 py-14 px-6 border-y border-yellow-900/30 bg-gradient-to-r from-yellow-900/20 to-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label, Icon }, i) => (
            <div key={i} className="text-center flex flex-col items-center gap-2">
              <div className="text-yellow-500/60">
                <Icon size={26} />
              </div>
              <div className="text-3xl md:text-4xl font-black text-yellow-500 tracking-tight">{value}</div>
              <div className="text-sm text-gray-400 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── INVESTMENT PLANS ───────────────────────────────────────────────────── */

function InvestmentPlans() {
  const plans = [
    {
      name: 'STARTER',
      roi: '4–6 %',
      minInvest: '100 €',
      duration: '30 jours',
      features: ['Rendement garanti', 'Retrait à maturité', 'Support par email', 'Tableau de bord'],
      popular: false,
      gradient: 'from-gray-800 to-gray-900',
      borderColor: 'border-gray-700',
    },
    {
      name: 'PRO',
      roi: '7–9 %',
      minInvest: '500 €',
      duration: '60 jours',
      features: ['Rendement optimisé', 'Retraits prioritaires', 'Support prioritaire 24/7', 'Analyses de marché', 'Formations gratuites', 'Cashback 1 %'],
      popular: true,
      gradient: 'from-yellow-600 to-yellow-700',
      borderColor: 'border-yellow-500',
    },
    {
      name: 'ELITE',
      roi: '9–10 %',
      minInvest: '2 000 €',
      duration: '90 jours',
      features: ['ROI maximum', 'Gestionnaire dédié', 'Support VIP', 'Accès anticipé', 'Formations premium', 'Cashback 2 %', 'Événements exclusifs'],
      popular: false,
      gradient: 'from-yellow-500 to-yellow-600',
      borderColor: 'border-yellow-400',
    },
  ];

  return (
    <section id="plans" className="relative z-10 py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
            PLANS D'INVESTISSEMENT
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Trois niveaux conçus pour s'adapter à votre profil et à vos objectifs financiers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative flex flex-col bg-gradient-to-br ${plan.gradient} border-2 ${plan.borderColor} p-8 transition-all duration-300 hover:-translate-y-1 ${
                plan.popular ? 'shadow-2xl shadow-yellow-500/40' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1 bg-black text-yellow-500 font-black text-xs tracking-widest uppercase">
                  PLUS POPULAIRE
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-black mb-1 text-white tracking-wide">{plan.name}</h3>
                <p className="text-white/50 text-sm">Min. {plan.minInvest} · {plan.duration}</p>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-black text-white tracking-tight">{plan.roi}</span>
                <span className="text-white/60 text-sm ml-2">ROI</span>
              </div>

              <div className={`w-full h-px mb-6 ${plan.popular ? 'bg-black/20' : 'bg-yellow-900/30'}`} />

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-white/90 text-sm">
                    <IconCheck
                      color={plan.popular ? 'rgba(0,0,0,0.55)' : '#eab308'}
                      size={14}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`block w-full py-3.5 text-center font-bold text-sm tracking-wide transition-all ${
                  plan.popular
                    ? 'bg-black text-yellow-500 hover:bg-gray-900'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                COMMENCER
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ───────────────────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'INSCRIPTION',
      description: 'Créez votre compte en quelques minutes avec vérification KYC sécurisée.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      number: '02',
      title: 'CHOISIR UN PLAN',
      description: 'Sélectionnez le plan d\'investissement adapté à votre profil et vos objectifs.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      number: '03',
      title: 'INVESTIR',
      description: 'Déposez vos fonds et commencez immédiatement à générer des rendements.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      number: '04',
      title: 'PERCEVOIR',
      description: 'Suivez vos gains en temps réel et retirez à tout moment depuis votre tableau de bord.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="17 6 23 6 23 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="relative z-10 py-32 px-6 bg-gradient-to-br from-yellow-900/10 to-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              COMMENT<br />ÇA MARCHE ?
            </h2>
            <p className="text-xl text-gray-400 max-w-md leading-relaxed">
              Commencez à investir en 4 étapes simples et regardez vos tokens NLX se multiplier.
            </p>
          </div>
          <div className="hidden md:flex justify-center items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/10 blur-3xl rounded-full pointer-events-none" />
              <img
                src="/images/nlx-coins.png"
                alt="Token NLX"
                className="relative z-10 w-full max-w-sm object-contain drop-shadow-[0_0_30px_rgba(234,179,8,0.4)]"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-1/2 w-full h-px bg-gradient-to-r from-yellow-500/50 to-transparent z-0" />
              )}
              <div className="relative z-10 bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-7 hover:border-yellow-500/60 transition-all duration-300">
                <div className="text-yellow-500 mb-4 opacity-80">{step.icon}</div>
                <div className="text-yellow-500 font-black text-3xl mb-3 font-mono">{step.number}</div>
                <h3 className="text-lg font-black mb-3 text-white tracking-wide">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  const features = [
    {
      Icon: IconLock,
      title: 'KYC & 2FA',
      description: 'Vérification d\'identité stricte et authentification à deux facteurs pour protéger votre compte.',
    },
    {
      Icon: IconAudit,
      title: 'Audit Blockchain',
      description: 'Transparence totale sur les fonds avec audits réguliers et traçabilité complète.',
    },
    {
      Icon: IconDatabase,
      title: 'Données Cryptées',
      description: 'Toutes vos données personnelles et transactions sont chiffrées avec les standards les plus élevés.',
    },
    {
      Icon: IconGuarantee,
      title: 'Garantie Partielle',
      description: 'Fonds de sécurité pour protéger jusqu\'à 20 % de votre investissement initial.',
    },
  ];

  return (
    <section id="security" className="relative z-10 py-32 px-6 bg-gradient-to-r from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/10 blur-2xl rounded-full scale-75 pointer-events-none" />
              <img
                src="/images/security.png"
                alt="Sécurité NELIAXA"
                className="relative z-10 w-full max-w-sm object-contain"
              />
            </div>
          </div>
          <div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              SÉCURITÉ<br />MAXIMALE
            </h2>
            <p className="text-xl text-gray-400 leading-relaxed max-w-md">
              Votre sécurité est notre priorité absolue. Nous utilisons les technologies
              les plus avancées pour protéger vos investissements.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ Icon, title, description }, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-7 hover:border-yellow-500/60 transition-all duration-300 group"
            >
              <div className="text-yellow-500 mb-5 group-hover:scale-110 transition-transform duration-300 w-fit">
                <Icon size={38} />
              </div>
              <h3 className="text-lg font-black mb-3 text-white tracking-wide">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-yellow-600 to-yellow-700 p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black mb-2 text-black tracking-tight">CERTIFIÉ ET RÉGULÉ</h3>
            <p className="text-black/70 max-w-lg leading-relaxed text-sm">
              NELIAXA respecte toutes les réglementations financières en vigueur et travaille
              avec des partenaires certifiés pour garantir la sécurité de vos fonds.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            {['ISO 27001', 'PCI DSS', 'SOC 2'].map(c => (
              <div key={c} className="px-6 py-2.5 bg-black text-yellow-500 font-bold text-sm tracking-wide">
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="cta" className="relative z-10 py-32 px-6 bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 text-black">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
          PRÊT À INVESTIR<br />INTELLIGEMMENT ?
        </h2>
        <p className="text-xl mb-12 opacity-80 max-w-2xl mx-auto leading-relaxed">
          Rejoignez des milliers d'investisseurs qui font confiance à NELIAXA
          pour faire croître leur patrimoine.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-12 py-4 bg-black text-yellow-500 font-bold text-base hover:bg-gray-900 transition-all transform hover:scale-105 shadow-2xl tracking-wide"
          >
            CRÉER MON COMPTE
            <IconArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-12 py-4 border-2 border-black font-bold text-base hover:bg-black hover:text-yellow-500 transition-all tracking-wide"
          >
            SE CONNECTER
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm opacity-70 font-medium">
          {['Aucun frais d\'inscription', 'Support 24/7', 'Retraits rapides'].map(item => (
            <div key={item} className="flex items-center gap-2">
              <IconCheck size={14} color="rgba(0,0,0,0.6)" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer({ scrollToSection }) {
  const currentYear = new Date().getFullYear();

  const contactItems = [
    { Icon: IconMail,  text: 'support@neliaxa.com' },
    { Icon: IconPhone, text: '+229 XX XX XX XX' },
    { Icon: IconPin,   text: 'Cotonou, Bénin' },
    { Icon: IconClock, text: 'Lun–Dim : 24/7' },
  ];

  const socialLinks = [
    { Icon: IconTelegram,  label: 'Telegram' },
    { Icon: IconWhatsApp,  label: 'WhatsApp' },
    { Icon: IconMail,      label: 'Email' },
  ];

  return (
    <footer className="relative z-10 bg-black text-white pt-16 pb-8 px-6 border-t border-yellow-900/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/images/logo-neliaxa.png"
                alt="NELIAXA Logo"
                className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
              />
              <span className="font-black text-xl text-yellow-500 tracking-wide">NELIAXA</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              La première plateforme d'investissement intelligente et sociale en Afrique.
            </p>
            <div className="flex gap-2">
              {socialLinks.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 border border-yellow-900/30 flex items-center justify-center text-gray-500 hover:border-yellow-500/60 hover:text-yellow-500 transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-black text-xs tracking-widest uppercase text-yellow-500 mb-5">Liens rapides</h3>
            <ul className="space-y-3">
              {[
                { label: 'Accueil',             id: 'home' },
                { label: "Plans d'investissement", id: 'plans' },
                { label: 'Comment ça marche',   id: 'how-it-works' },
                { label: 'Sécurité',            id: 'security' },
              ].map(l => (
                <li key={l.id}>
                  <button
                    onClick={() => scrollToSection(l.id)}
                    className="text-sm text-gray-500 hover:text-gray-200 transition-colors bg-transparent border-none cursor-pointer p-0 font-normal"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-black text-xs tracking-widest uppercase text-yellow-500 mb-5">Légal</h3>
            <ul className="space-y-3">
              {[
                { label: "Conditions d'utilisation", to: '/terms' },
                { label: 'Politique de confidentialité', to: '/privacy' },
                { label: 'Politique KYC',          to: '/kyc-policy' },
                { label: 'Avertissement risques',  to: '/risk-disclosure' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-gray-500 hover:text-gray-200 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-black text-xs tracking-widest uppercase text-yellow-500 mb-5">Contact</h3>
            <ul className="space-y-3">
              {contactItems.map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-sm text-gray-500">
                  <Icon size={14} />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-yellow-900/15 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gray-600">
          <p>© {currentYear} NELIAXA. Tous droits réservés.</p>
          <p className="max-w-md leading-relaxed">
            <strong className="text-yellow-600">Avertissement :</strong>{' '}
            Les investissements comportent des risques. Les performances passées ne garantissent pas les résultats futurs.
          </p>
        </div>
      </div>
    </footer>
  );
}