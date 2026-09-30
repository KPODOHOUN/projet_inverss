import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import ScrollReveal from './components/effects/ScrollReveal';

export default function LandingPage() {
  const { isLight } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = ['home', 'how-it-works', 'security', 'cta'];
      const current = sections.find((section) => {
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

  const pageBg = isLight ? 'bg-gray-50 text-gray-900' : 'bg-black text-gray-100';

  return (
    <div className={`relative min-h-screen overflow-x-hidden ${pageBg}`}>
      <Navigation
        scrolled={scrolled}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <HeroSection scrollToSection={scrollToSection} />
      <StatsBar />
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

function Navigation({ scrolled, activeSection, scrollToSection, mobileMenuOpen, setMobileMenuOpen }) {
  const { isLight } = useTheme();
  const navItems = [
    { id: 'home', label: 'Accueil' },
    { id: 'how-it-works', label: 'Comment ça marche' },
    { id: 'security', label: 'Sécurité' },
  ];

  const navBg = scrolled
    ? (isLight ? 'imc-glass-nav' : 'imc-glass-nav')
    : 'bg-transparent';

  const linkClass = (id) => {
    const active = activeSection === id;
    if (isLight) return active ? 'text-yellow-600 border-b-2 border-yellow-500' : 'text-gray-600 hover:text-gray-900';
    return active ? 'text-yellow-400 border-b-2 border-yellow-500' : 'text-gray-400 hover:text-yellow-400';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button type="button" className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0" onClick={() => scrollToSection('home')}>
            <img
              src={isLight ? '/logo-on-light.png' : '/logo-on-dark.png'}
              alt="IMC Corporation"
              className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]"
            />
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`font-semibold text-sm tracking-wide transition-colors bg-transparent border-none cursor-pointer pb-1 ${linkClass(item.id)}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login" className="imc-btn-outline !py-2 !px-4 !text-xs">
              Connexion
            </Link>
            <Link to="/register" className="imc-btn-primary !py-2 !px-4 !text-xs">
              Commencer
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`bg-transparent border-none cursor-pointer p-1 ${isLight ? 'text-yellow-700' : 'text-yellow-400'}`}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className={`md:hidden mt-4 pb-4 border-t pt-4 space-y-3 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`block w-full text-left font-semibold py-2 text-sm tracking-wide bg-transparent border-none cursor-pointer ${linkClass(item.id)}`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 flex flex-col gap-3">
              <Link to="/login" className="imc-btn-outline block w-full text-center !text-xs">
                CONNEXION
              </Link>
              <Link to="/register" className="imc-btn-primary block w-full text-center !text-xs">
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
  const { isLight } = useTheme();
  const { user } = useAuth();

  return (
    <section id="home" className="relative min-h-[85vh] flex items-center pt-20 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <img
          src="/images/Gemini_Generated_Image_dm8veudm8veudm8v.png"
          alt=""
          className={`absolute inset-0 w-full h-full object-cover ${isLight ? 'opacity-30' : 'opacity-[0.15]'}`}
        />
        <div className={`absolute inset-0 bg-gradient-to-b ${isLight ? 'from-transparent via-white/40 to-white' : 'from-transparent via-black/50 to-black'}`} />
      </div>
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="text-left animate-hero-in">
            <p className="imc-badge mb-4">Plateforme d&apos;investissement</p>

            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight max-w-xl ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Investissez intelligemment avec IMC
            </h1>

            <p className={`text-base mb-6 max-w-xl leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              Trading, packs d&apos;investissement et formation dans un espace sécurisé.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 mb-8">
              <Link to={user ? '/dashboard' : '/register'} className="imc-btn-primary">
                {user ? 'Tableau de bord' : 'Commencer'}
                <IconArrowRight size={16} />
              </Link>
              <button type="button" onClick={() => scrollToSection('how-it-works')} className="imc-btn-outline">
                En savoir plus
              </button>
            </div>

            <div className={`flex flex-wrap gap-4 text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              {['KYC vérifié', 'Sécurisé', 'Support 24/7'].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <IconCheck color="#22c55e" size={14} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:flex justify-center animate-hero-in" style={{ animationDelay: '150ms', animationFillMode: 'backwards' }}>
            <img
              src="/images/hero-phone.png"
              alt="Application IMC Corporation"
              className="w-full max-w-sm object-contain animate-float-phone"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const { isLight } = useTheme();
  const { api } = useAuth();
  const [audit, setAudit] = useState(null);

  useEffect(() => {
    api.get('/transparency/audit').then((res) => {
      if (res.data.success) setAudit(res.data.data);
    }).catch(() => {});
  }, [api]);

  const stats = [
    { value: audit ? audit.totalUsers.toLocaleString('fr-FR') : '—', label: 'Investisseurs actifs', Icon: IconUsers },
    { value: audit ? `$${(audit.totalFundsManaged / 1000).toFixed(0)}k+` : '—', label: 'Volume investi', Icon: IconCoins },
    { value: audit ? `${audit.averageRoi} %` : '—', label: 'ROI moyen', Icon: IconTrendUp },
    { value: '24/7', label: 'Support client', Icon: IconShield },
  ];

  return (
    <section className={`relative z-10 py-12 px-6 border-y ${isLight ? 'border-gray-200 bg-white' : 'border-white/10 bg-gray-900/50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ value, label, Icon }, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div className="imc-stat-card text-center flex flex-col items-center gap-2">
                <div className="text-yellow-500">
                  <Icon size={22} />
                </div>
                <div className="text-xl font-bold text-yellow-500">{value}</div>
                <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { isLight } = useTheme();

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
      description: 'Sélectionnez le pack d\'investissement adapté à votre profil et vos objectifs.',
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
    <section id="how-it-works" className={`relative z-10 py-16 px-6 ${isLight ? 'bg-white' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <h2 className={`text-2xl font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Comment ça marche
          </h2>
          <p className={`text-sm mb-10 max-w-md ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            Quatre étapes pour commencer.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="imc-glass-card">
                <p className="text-yellow-500 font-semibold text-sm mb-2">{step.number}</p>
                <h3 className={`font-semibold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>{step.title}</h3>
                <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{step.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  const { isLight } = useTheme();

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
      title: 'Retraits Sécurisés',
      description: 'Identité vérifiée obligatoire avant tout retrait de fonds depuis votre espace.',
    },
  ];

  return (
    <section id="security" className={`relative z-10 py-16 px-6 border-t ${isLight ? 'border-gray-200 bg-gray-50' : 'border-white/10'}`}>
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <h2 className={`text-2xl font-bold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>Sécurité</h2>
          <p className={`text-sm mb-10 max-w-lg ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            Vos investissements protégés par KYC, chiffrement et audits.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ Icon, title, description }, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="imc-glass-card">
                <div className="mb-3 text-yellow-500">
                  <Icon size={28} />
                </div>
                <h3 className={`font-semibold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>{title}</h3>
                <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="cta" className="relative z-10 py-16 px-6 bg-yellow-600">
      <ScrollReveal direction="scale" className="max-w-3xl mx-auto text-center text-white">
        <h2 className="text-2xl font-bold mb-3">Prêt à commencer ?</h2>
        <p className="text-sm mb-6 opacity-90">
          Créez votre compte en quelques minutes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register" className="imc-btn-primary bg-white text-yellow-700 hover:bg-gray-100">
            Créer un compte
          </Link>
          <Link to="/login" className="imc-btn-outline border-white/40 text-white hover:text-white hover:border-white">
            Se connecter
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}

function Footer({ scrollToSection }) {
  const { isLight } = useTheme();
  const currentYear = new Date().getFullYear();

  const contactItems = [
    { Icon: IconMail, text: 'support@imc.com' },
    { Icon: IconPhone, text: 'Support 24/7' },
    { Icon: IconPin, text: 'Afrique de l\'Ouest' },
    { Icon: IconClock, text: 'Lun–Dim : 24/7' },
  ];

  const footerBg = isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-black border-white/10 text-white';
  const mutedText = isLight ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-gray-200';
  const sectionTitle = 'text-yellow-500';

  return (
    <footer className={`relative z-10 pt-16 pb-8 px-6 border-t ${footerBg}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img
                src={isLight ? '/logo-on-light.png' : '/logo-on-dark.png'}
                alt="IMC Corporation"
                className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]"
              />
            </div>
            <p className={`text-sm leading-relaxed mb-5 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
              La première plateforme d&apos;investissement intelligente et sociale en Afrique.
            </p>
          </div>

          <div>
            <h3 className={`font-bold text-xs tracking-widest uppercase mb-5 ${sectionTitle}`}>Liens rapides</h3>
            <ul className="space-y-3">
              {[
                { label: 'Accueil', id: 'home' },
                { label: 'Comment ça marche', id: 'how-it-works' },
                { label: 'Sécurité', id: 'security' },
              ].map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(l.id)}
                    className={`text-sm transition-colors bg-transparent border-none cursor-pointer p-0 font-normal ${mutedText}`}
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`font-bold text-xs tracking-widest uppercase mb-5 ${sectionTitle}`}>Légal</h3>
            <ul className="space-y-3">
              {[
                { label: "Conditions d'utilisation", to: '/terms' },
                { label: 'Politique de confidentialité', to: '/privacy' },
                { label: 'Politique KYC', to: '/kyc-policy' },
                { label: 'Avertissement risques', to: '/risk-disclosure' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={`text-sm transition-colors ${mutedText}`}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`font-bold text-xs tracking-widest uppercase mb-5 ${sectionTitle}`}>Contact</h3>
            <ul className="space-y-3">
              {contactItems.map(({ Icon, text }) => (
                <li key={text} className={`flex items-center gap-2.5 text-sm ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                  <Icon size={14} />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`border-t pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs ${isLight ? 'border-gray-100 text-gray-400' : 'border-white/5 text-gray-500'}`}>
          <p>© {currentYear} IMC Corporation. Tous droits réservés.</p>
          <p className="max-w-md leading-relaxed">
            <strong className={isLight ? 'text-yellow-700' : 'text-yellow-400'}>Avertissement :</strong>{' '}
            Les investissements comportent des risques. Les performances passées ne garantissent pas les résultats futurs.
          </p>
        </div>
      </div>
    </footer>
  );
}
