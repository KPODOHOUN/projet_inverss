import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import useForceDarkMode from './hooks/useForceDarkMode';
import ScrollReveal from './components/effects/ScrollReveal';

const MARKETS = ['S&P 500', 'Nasdaq 100', 'Dow Jones 30', 'CAC 40', 'Euro Stoxx 50', 'FTSE 100', 'Nikkei 225', 'Russell 2000', 'Bund', 'T-Bonds', 'Bitcoin', 'Or', 'EUR/USDT'];

export default function LandingPage() {
  useForceDarkMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
      const sections = ['home', 'how-it-works', 'security', 'cta'];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.top <= 150 && rect.bottom >= 150;
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
    <div className="lux-page relative min-h-screen overflow-x-hidden">
      <Navigation
        scrolled={scrolled}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <HeroSection scrollToSection={scrollToSection} />
      <MarketStrip />
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

function Navigation({ scrolled, activeSection, scrollToSection, mobileMenuOpen, setMobileMenuOpen }) {
  const navItems = [
    { id: 'home', label: 'Accueil' },
    { id: 'how-it-works', label: 'Comment ça marche' },
    { id: 'security', label: 'Sécurité' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || mobileMenuOpen ? 'lux-header' : 'bg-transparent border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <button type="button" className="flex items-center bg-transparent border-none p-0 cursor-pointer" onClick={() => scrollToSection('home')}>
          <img src="/logo-on-dark.png" alt="IMC Corporation" className="h-9 sm:h-10 w-auto object-contain" />
        </button>

        <div className="hidden md:flex items-center gap-1 p-1 rounded-full border border-white/5 bg-white/[0.02]">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all bg-transparent border-none cursor-pointer ${
                activeSection === item.id ? 'text-[#17130a] !bg-white font-medium' : 'text-[#f4efe2]/60 hover:text-[#f4efe2]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="lux-btn-ghost !py-2 !px-4">Connexion</Link>
          <Link to="/register" className="lux-btn-gold !py-2 !px-4">Ouvrir un compte</Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-[#f3d58a] bg-transparent border-none cursor-pointer"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden px-5 pb-6 pt-2 space-y-1 border-t border-white/5">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={`lux-nav-item ${activeSection === item.id ? 'is-active' : ''}`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-4 grid grid-cols-2 gap-3">
            <Link to="/login" className="lux-btn-ghost">Connexion</Link>
            <Link to="/register" className="lux-btn-gold">Commencer</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function HeroSection({ scrollToSection }) {
  const { user } = useAuth();

  return (
    <section id="home" className="relative min-h-[100svh] flex items-center pt-24 pb-16 px-5 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <img src="/images/Gemini_Generated_Image_dm8veudm8veudm8v.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.10]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07070a]/40 via-[#07070a]/70 to-[#07070a]" />
        <div className="absolute left-1/2 top-[-20%] -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-[1.15fr_0.85fr] gap-14 items-center">
        <div className="animate-hero-in">
          <span className="lux-pill bg-yellow-400/10 text-[#f3d58a] ring-1 ring-inset ring-yellow-400/25 mb-7">Hub financier dédié aux décideurs</span>

          <h1 className="lux-serif text-5xl sm:text-6xl lg:text-7xl font-semibold text-[#f4efe2] leading-[0.98] tracking-tight mb-6">
            Faites fructifier<br />votre patrimoine<br /><span className="lux-gold-text italic">avec élégance.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#f4efe2]/60 max-w-xl leading-relaxed mb-9">
            Stratégies ETF signées IMC, packs d&apos;investissement, trading et formation — réunis dans un espace sécurisé, en USDT.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link to={user ? '/dashboard' : '/register'} className="lux-btn-gold !px-7 !py-3.5 !text-sm">
              {user ? 'Mon tableau de bord' : 'Ouvrir un compte'} <IconArrowRight size={16} />
            </Link>
            <button type="button" onClick={() => scrollToSection('how-it-works')} className="lux-btn-ghost !px-7 !py-3.5 !text-sm">
              Découvrir la plateforme
            </button>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#f4efe2]/50">
            {['Identité vérifiée (KYC)', 'Double authentification', 'Assistance 24/7'].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full flex items-center justify-center bg-yellow-500/10 text-[#d4af37]"><IconCheck size={12} /></span>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:flex justify-center animate-hero-in" style={{ animationDelay: '180ms', animationFillMode: 'backwards' }}>
          <div className="absolute inset-0 m-auto w-[380px] h-[380px] rounded-full blur-3xl" />
          <div className="absolute inset-0 m-auto w-[440px] h-[440px] rounded-full border border-yellow-500/10" />
          <div className="absolute inset-0 m-auto w-[540px] h-[540px] rounded-full border border-yellow-500/5" />
          <div className="relative w-full max-w-[400px] animate-float-slow">
            <div className="lux-card-gold p-7">
              <svg aria-hidden="true" viewBox="0 0 400 140" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[26%] w-full h-[30%] pointer-events-none">
                <defs>
                  <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,118 C40,112 70,96 110,100 C150,104 170,78 210,70 C250,62 270,80 310,50 C340,30 370,30 400,10 L400,140 L0,140 Z" fill="url(#heroArea)" />
                <path d="M0,118 C40,112 70,96 110,100 C150,104 170,78 210,70 C250,62 270,80 310,50 C340,30 370,30 400,10" fill="none" stroke="#f3d58a" strokeWidth="1.6" />
              </svg>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <img src="/logo-on-light.png" alt="" className="h-7 w-auto" />
                  <span className="lux-pill bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20">USDT</span>
                </div>
                <p className="lux-label !text-[#f3d58a]/70 mb-2">Solde disponible</p>
                <p className="lux-num text-4xl font-light text-[#f4efe2] mb-24">
                  <span className="text-[#f3d58a]/70 text-2xl align-top mr-1">$</span>12 480.00
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[['S&P 500', '25 j'], ['Nasdaq 100', '21 j'], ['Turbo 48H', '2 j']].map(([n, d]) => (
                    <div key={n} className="rounded-xl bg-black/[0.04] border border-black/5 px-3 py-2.5">
                      <p className="text-[11px] text-[#f4efe2]/80 truncate">{n}</p>
                      <p className="text-[10px] text-[#f4efe2]/40">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-center text-[10px] tracking-[0.25em] uppercase text-[#f4efe2]/25 mt-4">Aperçu de l&apos;interface</p>
          </div>

          <div className="!absolute -left-10 top-[50%] lux-card !bg-[#0d0c0a]/90 px-4 py-3 flex items-center gap-3 animate-float-slow" style={{ animationDelay: '0.8s' }}>
            <span className="lux-icon-chip !w-9 !h-9"><IconLock size={18} /></span>
            <span>
              <span className="block text-xs text-[#f4efe2]/45">Dépôts & retraits</span>
              <span className="block text-sm font-medium text-[#f4efe2]">100 % en USDT</span>
            </span>
          </div>
          <div className="!absolute -right-8 top-[18%] lux-card !bg-[#0d0c0a]/90 px-4 py-3 flex items-center gap-3 animate-float-slow" style={{ animationDelay: '1.6s' }}>
            <span className="lux-icon-chip !w-9 !h-9"><IconAudit size={18} /></span>
            <span>
              <span className="block text-xs text-[#f4efe2]/45">Packs dès</span>
              <span className="block text-sm font-medium lux-gold-text">25 $ · 2 à 60 jours</span>
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollToSection('how-it-works')}
        className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#f4efe2]/30 hover:text-[#f3d58a] bg-transparent border-none cursor-pointer transition-colors"
      >
        Défiler
        <span className="w-px h-8 bg-gradient-to-b from-[#d4af37] to-transparent" />
      </button>
    </section>
  );
}

function MarketStrip() {
  const items = [...MARKETS, ...MARKETS];
  return (
    <div className="relative z-10 border-y border-white/10 bg-white/[0.015] py-5 overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#07070a] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#07070a] to-transparent z-10 pointer-events-none" />
      <div className="lux-marquee flex gap-12 w-max">
        {items.map((m, i) => (
          <span key={i} className="flex items-center gap-12 whitespace-nowrap lux-serif text-xl text-[#f4efe2]/45">
            {m}<span className="w-1 h-1 rounded-full bg-[#d4af37]/60" />
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, accent, subtitle }) {
  return (
    <ScrollReveal className="max-w-2xl mb-14">
      <p className="lux-label !text-[#d4af37]/80 mb-3">{eyebrow}</p>
      <h2 className="lux-serif text-4xl sm:text-5xl font-semibold text-[#f4efe2] leading-[1.05] mb-4">
        {title} {accent && <span className="lux-gold-text italic">{accent}</span>}
      </h2>
      {subtitle && <p className="text-[#f4efe2]/55 leading-relaxed">{subtitle}</p>}
    </ScrollReveal>
  );
}

function HowItWorks() {
  const steps = [
    { title: 'Inscription', description: 'Créez votre compte en quelques minutes et validez votre identité en toute sécurité.' },
    { title: 'Choisir un pack', description: "Sélectionnez le pack d'investissement adapté à votre profil et à vos objectifs." },
    { title: 'Investir', description: 'Déposez vos fonds en USDT et commencez immédiatement à générer des rendements.' },
    { title: 'Percevoir', description: 'Suivez vos gains en temps réel et retirez à tout moment depuis votre espace.' },
  ];

  return (
    <section id="how-it-works" className="lux-light relative z-10 py-24 sm:py-32 px-5 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <SectionTitle eyebrow="Comment ça marche" title="Quatre étapes," accent="aucune complexité." subtitle="Un parcours pensé pour aller à l'essentiel, de l'inscription à vos premiers gains." />

        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="hidden lg:block absolute top-[54px] left-[12%] right-[12%] h-px bg-black/10" />
          {steps.map((step, i) => (
            <ScrollReveal key={step.title} delay={i * 110}>
              <div className="relative lux-card lux-card-hover p-7 h-full">
                <span className="relative z-10 inline-flex w-[52px] h-[52px] mb-6 rounded-full items-center justify-center lux-serif text-xl font-semibold text-white bg-[#0a0a0a]">
                  {i + 1}
                </span>
                <h3 className="lux-serif text-2xl font-semibold text-[#f4efe2] mb-2">{step.title}</h3>
                <p className="text-sm text-[#f4efe2]/55 leading-relaxed">{step.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  const features = [
    { Icon: IconLock, title: 'KYC & 2FA', description: "Vérification d'identité stricte et authentification à deux facteurs pour protéger votre compte." },
    { Icon: IconAudit, title: 'Traçabilité', description: 'Chaque mouvement de fonds est enregistré et consultable depuis votre historique.' },
    { Icon: IconDatabase, title: 'Données chiffrées', description: 'Vos données personnelles et vos transactions sont chiffrées selon les standards les plus élevés.' },
    { Icon: IconGuarantee, title: 'Retraits sécurisés', description: "Identité vérifiée et validation requises avant tout retrait de fonds." },
  ];

  return (
    <section id="security" className="relative z-10 py-24 sm:py-32 px-5 sm:px-6 border-t border-white/5">
      <div className="absolute right-0 top-1/3 w-[500px] h-[500px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-center">
          <div>
            <SectionTitle eyebrow="Sécurité" title="Votre capital," accent="sous haute protection." subtitle="Vérification d'identité, chiffrement et validations à chaque étape sensible : la sécurité n'est pas une option." />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map(({ Icon, title, description }, i) => (
              <ScrollReveal key={title} delay={i * 100}>
                <div className="lux-card lux-card-hover p-7 h-full">
                  <span className="lux-icon-chip !w-12 !h-12 mb-6"><Icon size={22} /></span>
                  <h3 className="lux-serif text-2xl font-semibold text-[#f4efe2] mb-2">{title}</h3>
                  <p className="text-sm text-[#f4efe2]/55 leading-relaxed">{description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="cta" className="relative z-10 py-20 sm:py-28 px-5 sm:px-6">
      <ScrollReveal direction="scale" className="max-w-5xl mx-auto">
        <div className="lux-card-gold px-7 py-14 sm:px-16 sm:py-20 text-center overflow-hidden">
          <div className="relative">
            <p className="lux-label !text-[#f3d58a]/70 mb-4">Rejoignez IMC</p>
            <h2 className="lux-serif text-4xl sm:text-6xl font-semibold text-[#f4efe2] leading-[1.02] mb-5">
              Prêt à faire travailler<br /><span className="lux-gold-text italic">votre argent ?</span>
            </h2>
            <p className="text-[#f4efe2]/55 max-w-lg mx-auto mb-9">Créez votre compte en quelques minutes. Aucun frais d&apos;ouverture.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register" className="lux-btn-gold !px-8 !py-3.5 !text-sm">Créer mon compte <IconArrowRight size={16} /></Link>
              <Link to="/login" className="lux-btn-ghost !px-8 !py-3.5 !text-sm">Se connecter</Link>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

function Footer({ scrollToSection }) {
  const currentYear = new Date().getFullYear();
  const contactItems = [
    { Icon: IconMail, text: 'support@imccorporation.site' },
    { Icon: IconPhone, text: 'Assistance 24/7' },
    { Icon: IconPin, text: "Afrique de l'Ouest" },
    { Icon: IconClock, text: 'Lun–Dim : 24/7' },
  ];
  const linkCls = 'text-sm text-[#f4efe2]/50 hover:text-[#f3d58a] transition-colors bg-transparent border-none cursor-pointer p-0';

  return (
    <footer className="relative z-10 pt-20 pb-10 px-5 sm:px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-12 mb-16">
          <div>
            <img src="/logo-on-dark.png" alt="IMC Corporation" className="h-10 w-auto object-contain mb-6" />
            <p className="lux-serif text-2xl text-[#f4efe2]/80 leading-snug max-w-xs">
              La plateforme d&apos;investissement intelligente et sociale en Afrique.
            </p>
          </div>

          <div>
            <p className="lux-label !text-[#d4af37]/80 mb-5">Navigation</p>
            <ul className="space-y-3">
              {[{ label: 'Accueil', id: 'home' }, { label: 'Comment ça marche', id: 'how-it-works' }, { label: 'Sécurité', id: 'security' }].map((l) => (
                <li key={l.id}><button type="button" onClick={() => scrollToSection(l.id)} className={linkCls}>{l.label}</button></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="lux-label !text-[#d4af37]/80 mb-5">Légal</p>
            <ul className="space-y-3">
              {[
                { label: "Conditions d'utilisation", to: '/terms' },
                { label: 'Confidentialité', to: '/privacy' },
                { label: 'Politique KYC', to: '/kyc-policy' },
                { label: 'Avertissement risques', to: '/risk-disclosure' },
              ].map((l) => (
                <li key={l.to}><Link to={l.to} className={linkCls}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="lux-label !text-[#d4af37]/80 mb-5">Contact</p>
            <ul className="space-y-3">
              {contactItems.map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-[#f4efe2]/50">
                  <span className="text-[#d4af37]/70"><Icon size={14} /></span>{text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-[#f4efe2]/35">
          <p>© {currentYear} IMC Corporation. Tous droits réservés.</p>
          <p className="max-w-xl leading-relaxed md:text-right">
            <span className="text-[#f3d58a]/80">Avertissement :</span> les investissements comportent des risques. Les performances passées ne garantissent pas les résultats futurs.
          </p>
        </div>
      </div>
    </footer>
  );
}
