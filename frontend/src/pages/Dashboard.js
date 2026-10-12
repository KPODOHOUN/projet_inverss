import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useForceDarkMode from '../hooks/useForceDarkMode';
import { packDisplayName } from '../utils/packNames';
import AnimatedNumber from '../components/AnimatedNumber';
import { toast } from '../utils/toast';
import NotificationBell from '../components/NotificationBell';
import TwoFactorAuth from '../components/auth/TwoFactorAuth';
import KYC from './KYC';
import Invest from './Invest';
import Referral from './Referral';
import Academy from './Academy';
import WeeklyPayment from './WeeklyPayment';
import Trading from './Trading';
import PhoneInput from '../components/PhoneInput';
import CityAutocomplete from '../components/CityAutocomplete';
import COUNTRIES from '../data/countries';

const IC = {
  Overview: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  Invest: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Portfolio: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Wallet: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M21 4H3C1.9 4 1 4.9 1 6v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16 14c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z" fill="currentColor"/>
      <path d="M1 10h22" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  Academy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L1 9l11 6 9-4.91V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 13.18v4L12 21l7-3.82v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Ambassador: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  Referral: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Transactions: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  KYC: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Security: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Help: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9.5 9a2.5 2.5 0 014.9.8c0 1.7-2.4 1.8-2.4 3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="0.9" fill="currentColor"/>
    </svg>
  ),
  Profile: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Refresh: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  TrendUp: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="17 6 23 6 23 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Briefcase: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Coin: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 6v12M9 8h4.5a2.5 2.5 0 010 5H9m0 3h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Check: ({ color = 'currentColor' }) => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M3 8l3.5 3.5L13 4.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  X: ({ color = 'currentColor' }) => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M4 4l8 8M12 4l-8 8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Clock: () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 4v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

const TAB_IDS = ['overview', 'invest', 'investments', 'wallet', 'trading', 'academy', 'referral', 'transactions', 'faq', 'kyc', 'security', 'profile'];
const ROLE_LABEL = { standard: 'Standard', vip: 'VIP', ambassador: 'Ambassadeur', moderator: 'Modérateur', admin: 'Admin', superadmin: 'Super admin' };
const readTabFromHash = () => {
  const id = window.location.hash.replace('#', '');
  return TAB_IDS.includes(id) ? id : 'trading';
};

export default function Dashboard() {
  useForceDarkMode();
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTabState] = useState(readTabFromHash);
  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    window.history.replaceState(null, '', `#${tab}`);
  };
  useEffect(() => {
    const onHashChange = () => setActiveTabState(readTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const [tradingPrefillCode, setTradingPrefillCode] = useState(null);
  const handleNotificationNavigate = (tab, opts) => {
    setActiveTab(tab);
    if (opts?.prefillCode) setTradingPrefillCode(opts.prefillCode);
  };
  const [investments, setInvestments]   = useState([]);
  const [stats, setStats]               = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance]           = useState(user?.balance || 0);
  const [summary, setSummary]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [investRes, txRes, balRes] = await Promise.all([
        api.get('/investments/my-investments'),
        api.get('/transactions/history'),
        api.get('/wallet/balances'),
      ]);
      if (investRes.data.success) {
        const { investments: invs, activeInvestments, totalROI, totalEarnings } = investRes.data.data;
        setInvestments(invs);
        setStats({ activeInvestments, totalROI: Number(totalROI), totalEarnings: Number(totalEarnings) });
      }
      if (txRes.data.success) {
        setTransactions(txRes.data.data.transactions);
      }
      if (balRes.data.success) {
        setBalance(balRes.data.data.summary.available);
        setSummary(balRes.data.data.summary);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Money can change from other tabs (deposit/invest/withdraw each live on
  // their own tab) — refetch whenever the user comes back to the Overview
  // Fetched once on mount so Investments/Transactions have data even if the
  // user lands on Trading (the default tab) and never visits Overview —
  // then refetched every time Overview is (re)opened, since money can
  // change from other tabs (deposit/invest/withdraw each live on their own
  // tab) and the top balance card must never show a stale figure.
  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);
  useEffect(() => {
    if (activeTab === 'overview') fetchDashboardData();
  }, [activeTab, fetchDashboardData]);

  // Guards a stale #referral bookmark/hash for an Ambassador — that tab is
  // intentionally gone from their nav (see navItems below).
  useEffect(() => {
    if (activeTab === 'referral' && user.role === 'ambassador') setActiveTab('overview');
  }, [activeTab, user.role]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const navItems = [
    { id: 'overview',     Icon: IC.Overview,     label: "Vue d'ensemble" },
    { id: 'invest',       Icon: IC.Invest,       label: 'Investir' },
    { id: 'investments',  Icon: IC.Portfolio,    label: 'Mes Investissements' },
    { id: 'wallet',       Icon: IC.Wallet,       label: 'Mes Gains' },
    { id: 'trading',      Icon: IC.TrendUp,      label: 'Trading' },
    { id: 'academy',      Icon: IC.Academy,      label: 'Académie' },
    // An Ambassador's referral tracking lives in their dedicated Espace
    // Ambassadeur (boosted commission rate, own stats) — the standard
    // Parrainage tab would just be a redundant, lower-rate duplicate.
    ...(user.role === 'ambassador' ? [] : [{ id: 'referral', Icon: IC.Referral, label: 'Parrainage' }]),
    { id: 'transactions', Icon: IC.Transactions, label: 'Transactions' },
    { id: 'faq',          Icon: IC.Help,         label: "Centre d'aide" },
    { id: 'kyc',          Icon: IC.KYC,          label: 'KYC' },
    { id: 'security',     Icon: IC.Security,     label: 'Sécurité' },
    { id: 'profile',      Icon: IC.Profile,      label: 'Profil' },
    // Ambassadors use the platform like any standard account now — this is
    // just a shortcut to their commission stats page, not their only view.
    ...(user.role === 'ambassador' ? [{ id: 'ambassador-space', Icon: IC.Ambassador, label: 'Espace Ambassadeur', external: '/ambassador' }] : []),
  ];

  return (
    <div className="dash-scope lux-page min-h-screen relative">
      <div className="relative z-10">

      <header className="lux-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-[68px] flex items-center justify-between">

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-yellow-300 hover:bg-yellow-500/10 transition-colors bg-transparent border-none cursor-pointer"
              aria-label="Menu"
            >
              {sidebarOpen ? <IC.Close /> : <IC.Menu />}
            </button>
            <img src="/logo-on-dark.png" alt="IMC Corporation" className="h-8 w-auto object-contain hidden sm:block" />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationBell onNavigate={handleNotificationNavigate} />
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-yellow-900/30">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-[#17130a] bg-gradient-to-br from-[#f3d58a] via-[#d4af37] to-[#a8832a] overflow-hidden shrink-0">
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="font-medium text-sm text-[#f4efe2]">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-[#f4efe2]/40">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="lux-btn-ghost !px-3 sm:!px-4 !py-2" aria-label="Déconnexion">
              <IC.Logout />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-10">

          <aside className={`
            lg:col-span-1
            fixed lg:static top-0 left-0 h-full lg:h-auto w-72 lg:w-auto
            z-50 lg:z-auto
            transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            transition-transform duration-300 ease-in-out
            pt-14 sm:pt-[68px] lg:pt-0
            overflow-y-auto lg:overflow-visible
          `}>
            <div className="bg-[#07070a] lg:bg-transparent h-full lg:h-auto p-3 lg:p-0 lg:sticky lg:top-24">

              <nav className="lux-card p-2 space-y-0.5">
                {navItems.map(({ id, Icon, label, external }) => (
                  <button
                    key={id}
                    onClick={() => { if (external) navigate(external); else setActiveTab(id); setSidebarOpen(false); }}
                    className={`lux-nav-item ${activeTab === id ? 'is-active' : ''}`}
                  >
                    <span className={activeTab === id ? 'text-[#f3d58a]' : 'text-current opacity-80'}>
                      <Icon />
                    </span>
                    {label}
                  </button>
                ))}
              </nav>

              <div className="mt-4 lux-card p-5">
                <p className="lux-label mb-4">Statut du compte</p>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#f4efe2]/50">Type</span>
                    <span className="font-semibold lux-gold-text uppercase tracking-wider">{ROLE_LABEL[user?.role] || user?.role}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#f4efe2]/50">KYC</span>
                    <span className={`flex items-center gap-1 font-semibold ${
                      user?.kycStatus === 'verified' ? 'text-green-400' :
                      user?.kycStatus === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {user?.kycStatus === 'verified'  && <><IC.Check color="#4ade80" /> Vérifié</>}
                      {user?.kycStatus === 'rejected'  && <><IC.X color="#f87171" /> Rejeté</>}
                      {user?.kycStatus !== 'verified' && user?.kycStatus !== 'rejected' && <><IC.Clock /> En attente</>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#f4efe2]/50">2FA</span>
                    <span className={`flex items-center gap-1 font-semibold ${user?.twoFactorEnabled ? 'text-green-400' : 'text-[#f4efe2]/50'}`}>
                      {user?.twoFactorEnabled
                        ? <><IC.Check color="#4ade80" /> Activé</>
                        : <><IC.X color="#6b7280" /> Désactivé</>
                      }
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </aside>

          {}
          <main className="lg:col-span-3 min-w-0">
            {activeTab === 'overview'     && <OverviewTab user={user} balance={balance} summary={summary} investments={investments} transactions={transactions} stats={stats} loading={loading} onRefresh={fetchDashboardData} onNavigate={setActiveTab} />}
            {activeTab === 'invest'       && <Invest onNavigate={setActiveTab} />}
            {activeTab === 'investments'  && <InvestmentsTab investments={investments} loading={loading} onRefresh={fetchDashboardData} onNavigate={setActiveTab} />}
            {activeTab === 'wallet'       && <WeeklyPayment onNavigate={setActiveTab} />}
            {activeTab === 'trading'      && <Trading onNavigate={setActiveTab} prefillCode={tradingPrefillCode} onPrefillConsumed={() => setTradingPrefillCode(null)} />}
            {activeTab === 'academy'      && <Academy />}
            {activeTab === 'referral' && user.role !== 'ambassador' && <Referral onNavigate={setActiveTab} />}
            {activeTab === 'transactions' && <TransactionsTab transactions={transactions} loading={loading} onRefresh={fetchDashboardData} />}
            {activeTab === 'faq'          && <FAQTab />}
            {activeTab === 'kyc'          && <KYC />}
            {activeTab === 'security'     && <SecurityTab />}
            {activeTab === 'profile'      && <ProfileTab user={user} />}
          </main>
        </div>
      </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-11 h-11">
          <div className="absolute inset-0 rounded-full border border-yellow-900/40" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#d4af37] animate-spin" />
        </div>
        <p className="lux-label">Chargement</p>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
      <div>
        <h2 className="lux-serif text-3xl sm:text-4xl font-semibold text-[#f4efe2] leading-none">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-[#f4efe2]/50">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`lux-card ${className}`}>
      {children}
    </div>
  );
}

const TONE = {
  green:  'bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20',
  red:    'bg-rose-400/10 text-rose-300 ring-1 ring-inset ring-rose-400/20',
  gold:   'bg-yellow-400/10 text-[#f3d58a] ring-1 ring-inset ring-yellow-400/25',
  blue:   'bg-sky-400/10 text-sky-300 ring-1 ring-inset ring-sky-400/20',
  violet: 'bg-violet-400/10 text-violet-300 ring-1 ring-inset ring-violet-400/20',
  gray:   'bg-white/5 text-[#f4efe2]/60 ring-1 ring-inset ring-white/10',
};

function Badge({ status }) {
  const map = {
    active:       { label: 'Actif',            tone: 'green'  },
    completed:    { label: 'Terminé',          tone: 'blue'   },
    pending:      { label: 'En attente',       tone: 'gold'   },
    failed:       { label: 'Échoué',           tone: 'red'    },
    deposit:      { label: 'Dépôt',            tone: 'green'  },
    withdrawal:   { label: 'Retrait',          tone: 'red'    },
    investment:   { label: 'Investissement',   tone: 'blue'   },
    earning:      { label: 'Gain',             tone: 'green'  },
    reinvestment: { label: 'Réinvestissement', tone: 'blue'   },
    commission:   { label: 'Commission',       tone: 'violet' },
    refund:       { label: 'Remboursement',    tone: 'gray'   },
    trading:      { label: 'Trading',          tone: 'violet' },
    rejected:     { label: 'Rejeté',           tone: 'red'    },
    approved:     { label: 'Approuvé',         tone: 'blue'   },
    processing:   { label: 'En traitement',    tone: 'violet' },
    cancelled:    { label: 'Annulé',           tone: 'gray'   },
  };
  const { label, tone } = map[status] || { label: status, tone: 'gray' };
  return <span className={`lux-pill ${TONE[tone]}`}>{label}</span>;
}

function OverviewTab({ user, balance, summary, investments, transactions, stats, loading, onRefresh, onNavigate }) {
  if (loading) return <Spinner />;

  const quickLinks = [
    { id: 'academy',  Icon: IC.Academy,  title: 'Académie',   desc: 'Formez-vous à l\'investissement' },
    { id: 'trading',  Icon: IC.TrendUp,  title: 'Trading',    desc: 'Suivez les marchés en direct' },
    user?.role === 'ambassador'
      ? { id: 'faq',      Icon: IC.Help,     title: "Centre d'aide", desc: 'Questions fréquentes' }
      : { id: 'referral', Icon: IC.Referral, title: 'Parrainage',    desc: 'Invitez vos contacts' },
  ];

  const recentActivity = [...(transactions || [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 18 ? 'Bonjour' : 'Bonsoir';
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6 sm:space-y-8">

      <div className="animate-cardIn">
        <p className="lux-label mb-2 capitalize">{today}</p>
        <h2 className="lux-serif text-4xl sm:text-5xl font-semibold text-[#f4efe2] leading-[1.05]">
          {greeting}, <span className="lux-gold-text italic">{user?.firstName}</span>
        </h2>
        <p className="mt-2 text-sm text-[#f4efe2]/50">Voici l'état de votre patrimoine aujourd'hui.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        <div className="lux-card-gold lg:col-span-3 p-6 sm:p-8 animate-cardIn overflow-hidden">
          <svg aria-hidden="true" viewBox="0 0 400 140" preserveAspectRatio="none" className="absolute right-0 top-[22%] w-[55%] h-[48%] pointer-events-none opacity-60 hidden sm:block">
            <defs>
              <linearGradient id="luxArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4af37" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="luxLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#d4af37" stopOpacity="0" />
                <stop offset="60%" stopColor="#f3d58a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f3d58a" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path d="M0,120 C40,115 70,95 110,100 C150,105 170,80 210,70 C250,60 270,78 310,50 C340,30 370,32 400,12 L400,140 L0,140 Z" fill="url(#luxArea)" />
            <path d="M0,120 C40,115 70,95 110,100 C150,105 170,80 210,70 C250,60 270,78 310,50 C340,30 370,32 400,12" fill="none" stroke="url(#luxLine)" strokeWidth="1.5" />
          </svg>
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <p className="lux-label !text-[#f3d58a]/70">Solde disponible</p>
              <span className="lux-pill bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20">USDT</span>
            </div>
            <p className="lux-num text-4xl sm:text-5xl font-light text-[#f4efe2] mb-1">
              <span className="text-[#f3d58a]/70 text-2xl sm:text-3xl align-top mr-1">$</span><AnimatedNumber value={balance} />
            </p>
            <p className="text-xs text-[#f4efe2]/40 mb-8">Disponible pour investir ou retirer</p>
            <div className="mt-auto flex flex-wrap gap-2.5">
              <button onClick={() => onNavigate('wallet')} className="lux-btn-gold">
                Déposer <IC.ArrowRight />
              </button>
              <button onClick={() => onNavigate('invest')} className="lux-btn-ghost !bg-black/40 backdrop-blur-sm">Investir</button>
              <button onClick={() => onNavigate('wallet')} className="lux-btn-ghost !bg-black/40 backdrop-blur-sm">Retirer</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5">
          <button
            onClick={() => onNavigate('investments')}
            style={{ animationDelay: '80ms' }}
            className="lux-card lux-card-hover animate-cardIn text-left p-6 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="lux-label">Capital investi</p>
              <span className="lux-icon-chip !w-8 !h-8"><IC.Briefcase /></span>
            </div>
            <p className="lux-num text-2xl sm:text-3xl font-light text-[#f4efe2]">
              <span className="text-[#f4efe2]/40 text-lg mr-1">$</span><AnimatedNumber value={summary?.invested ?? 0} />
            </p>
            <span className="mt-3 text-xs text-[#d4af37] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              Mes investissements <IC.ArrowRight />
            </span>
          </button>

          <div style={{ animationDelay: '160ms' }} className="lux-card animate-cardIn p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="lux-label">Valeur du portefeuille</p>
              <span className="lux-icon-chip !w-8 !h-8"><IC.TrendUp /></span>
            </div>
            <p className="lux-num text-2xl sm:text-3xl font-light text-[#f4efe2]">
              <span className="text-[#f4efe2]/40 text-lg mr-1">$</span><AnimatedNumber value={summary?.currentValue ?? 0} />
            </p>
            <p className="mt-3 text-xs text-[#f4efe2]/40">Capital + gains accumulés</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard Icon={IC.Wallet}    title="Déposé total"           value={<>$ <AnimatedNumber value={summary?.deposited ?? 0} /></>} delay={0} />
        <StatCard Icon={IC.Coin}      title="Gains totaux"           value={<>$ <AnimatedNumber value={stats?.totalEarnings ?? 0} /></>} delay={60} positive />
        <StatCard Icon={IC.Briefcase} title="Investissements actifs" value={<AnimatedNumber value={stats?.activeInvestments ?? 0} decimals={0} />} delay={120} />
        <StatCard Icon={IC.TrendUp}   title="ROI total"              value={<><AnimatedNumber value={stats?.totalROI ?? 0} /> %</>} delay={180} positive />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        <Card className="lg:col-span-3 p-6 sm:p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="lux-label mb-1">6 derniers mois</p>
              <h3 className="lux-serif text-2xl font-semibold text-[#f4efe2]">Flux de trésorerie</h3>
            </div>
          </div>
          <CashFlowChart transactions={transactions || []} />
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 gap-3">
          {quickLinks.map(({ id, Icon, title, desc }, i) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{ animationDelay: `${i * 80}ms` }}
              className="lux-card lux-card-hover animate-cardIn w-full text-left p-4 sm:p-5 flex items-center gap-4 group cursor-pointer"
            >
              <span className="lux-icon-chip shrink-0"><Icon /></span>
              <span className="flex-1 min-w-0">
                <span className="block font-medium text-[#f4efe2] text-sm group-hover:text-[#f3d58a] transition-colors">{title}</span>
                <span className="block text-xs text-[#f4efe2]/45 mt-0.5">{desc}</span>
              </span>
              <span className="text-[#f4efe2]/30 group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-all"><IC.ArrowRight /></span>
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-3 px-6 sm:px-7 pt-6 sm:pt-7">
          <div>
            <p className="lux-label mb-1">Historique</p>
            <h3 className="lux-serif text-2xl font-semibold text-[#f4efe2]">Activités récentes</h3>
          </div>
          <button onClick={() => onNavigate('transactions')} className="lux-btn-ghost !py-1.5 !px-3 !text-xs">
            Voir tout <IC.ArrowRight />
          </button>
        </div>
        {recentActivity.length > 0 ? (
          <div className="overflow-x-auto mt-5">
            <table className="w-full lux-table">
              <thead>
                <tr>
                  {['Activité', 'Référence', 'Date', 'Montant', 'Statut'].map(col => <th key={col}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((tx, i) => (
                  <tr key={i}>
                    <td><Badge status={tx.type} /></td>
                    <td className="text-xs text-[#f4efe2]/40 font-mono">#{String(tx._id).slice(-6).toUpperCase()}</td>
                    <td className="text-sm text-[#f4efe2]/60">{new Date(tx.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className={`text-sm font-medium lux-num ${tx.amount < 0 ? 'text-rose-300' : 'text-[#f4efe2]'}`}>
                      {tx.amount < 0 ? '−' : ''}$ {Math.abs(tx.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td><Badge status={tx.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-14 px-6">
            <span className="lux-icon-chip !w-12 !h-12 mb-4"><IC.Transactions /></span>
            <p className="text-[#f4efe2]/50 text-sm mb-5">Aucune activité pour l'instant</p>
            <button onClick={() => onNavigate('invest')} className="lux-btn-gold">
              Commencer à investir <IC.ArrowRight />
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({ Icon, title, value, delay = 0, positive = false }) {
  return (
    <div style={{ animationDelay: `${delay}ms` }} className="lux-card lux-card-hover animate-cardIn p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="lux-icon-chip !w-8 !h-8"><Icon /></span>
        {positive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
      </div>
      <p className="text-[11px] text-[#f4efe2]/45 mb-1.5 font-medium">{title}</p>
      <p className="lux-num text-lg sm:text-xl font-medium text-[#f4efe2]">{value}</p>
    </div>
  );
}

// Net cash in/out (completed deposits minus withdrawals) per month, last 6
// months — hand-rolled bars rather than pulling in a chart library, same
// approach as Trading's SimulatedChart.
function CashFlowChart({ transactions }) {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('fr-FR', { month: 'short' }), net: 0 });
  }
  transactions
    .filter(t => t.status === 'completed' && (t.type === 'deposit' || t.type === 'withdrawal'))
    .forEach(t => {
      const d = new Date(t.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const m = months.find(m => m.key === key);
      if (m) m.net += t.amount;
    });
  const maxAbs = Math.max(1, ...months.map(m => Math.abs(m.net)));
  const hasData = months.some(m => m.net !== 0);

  if (!hasData) {
    return (
      <div className="h-[180px] flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-yellow-900/30">
        <p className="text-[#f4efe2]/45 text-sm">Pas encore de mouvements à afficher</p>
        <p className="text-[#f4efe2]/25 text-xs">Vos dépôts et retraits apparaîtront ici</p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative flex items-end justify-between gap-3 h-[170px] mb-3">
        <div className="absolute inset-x-0 top-[20%] border-t border-dashed border-white/5 pointer-events-none" />
        <div className="absolute inset-x-0 top-[55%] border-t border-dashed border-white/5 pointer-events-none" />
        {months.map((m, i) => {
          const h = m.net === 0 ? 3 : Math.max(8, (Math.abs(m.net) / maxAbs) * 140);
          const isUp = m.net >= 0;
          return (
            <div key={m.key} className="relative flex-1 flex flex-col items-center justify-end h-full">
              <span className={`lux-num text-[10px] font-semibold mb-1.5 whitespace-nowrap ${m.net === 0 ? 'text-transparent' : isUp ? 'text-[#f3d58a]' : 'text-rose-300'}`}>
                {m.net !== 0 ? `${isUp ? '+' : '−'}$${Math.abs(m.net) >= 1000 ? (Math.abs(m.net) / 1000).toFixed(1) + 'k' : Math.abs(m.net).toFixed(0)}` : '·'}
              </span>
              <div
                className={`animate-drawCandle w-full max-w-[42px] rounded-t-lg ${m.net === 0 ? 'bg-white/5' : isUp ? 'bg-gradient-to-t from-[#a8832a]/60 via-[#d4af37] to-[#f3d58a] shadow-[0_0_18px_-4px_rgba(212,175,55,0.6)]' : 'bg-gradient-to-t from-rose-900/60 to-rose-400'}`}
                style={{ height: `${h}px`, animationDelay: `${i * 70}ms` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-3 border-t border-white/5 pt-3">
        {months.map(m => (
          <span key={m.key} className="flex-1 text-center text-[11px] text-[#f4efe2]/40 capitalize">{m.label.replace('.', '')}</span>
        ))}
      </div>
    </div>
  );
}

function InvestmentsTab({ investments, loading, onRefresh, onNavigate }) {
  const { api } = useAuth();
  const [confirmingId, setConfirmingId] = useState(null);
  const [closingId, setClosingId] = useState(null);
  const [closeError, setCloseError] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');

  if (loading) return <Spinner />;

  const filteredInvestments = investments.filter(inv => withinPeriod(inv.createdAt, periodFilter));

  const handleClose = async (invId) => {
    setClosingId(invId);
    setCloseError('');
    try {
      const res = await api.post(`/investments/${invId}/close`);
      if (res.data.success) {
        setConfirmingId(null);
        onRefresh();
      } else {
        setCloseError(res.data.message || "Impossible de clôturer l'investissement");
      }
    } catch (err) {
      setCloseError(err.response?.data?.message || "Impossible de clôturer l'investissement");
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Mes Investissements">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 border border-yellow-500/50 rounded text-yellow-500 font-semibold hover:bg-yellow-500 hover:text-black transition-all text-xs tracking-wide bg-transparent cursor-pointer"
        >
          <IC.Refresh /> Actualiser
        </button>
      </PageHeader>

      {investments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriodFilter(value)}
              className={`lux-chip ${periodFilter === value ? 'is-active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {filteredInvestments.length > 0 ? (
        <div className="space-y-4">
          {filteredInvestments.map((inv, i) => (
            <Card key={i} className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div>
                  <h3 className="lux-serif text-2xl font-semibold lux-gold-text">{packDisplayName(inv.pack)}</h3>
                  <p className="text-xs text-[#f4efe2]/50 mt-0.5">
                    Créé le {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Badge status={inv.status} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Montant',    value: `$ ${inv.amount}`,     cls: 'text-[#f4efe2]' },
                  { label: 'ROI actuel', value: `+${inv.roi} %`, cls: 'text-emerald-300' },
                  { label: 'Gains',      value: `$ ${inv.earnings}`,   cls: 'text-[#f3d58a]' },
                  { label: 'Échéance',   value: inv.endDate ? new Date(inv.endDate).toLocaleDateString('fr-FR') : '—', cls: 'text-[#f4efe2]' },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="rounded-xl bg-white/[0.02] border border-white/5 px-3.5 py-3">
                    <p className="lux-label !text-[10px] mb-1.5">{label}</p>
                    <p className={`lux-num font-medium text-base ${cls}`}>{value}</p>
                  </div>
                ))}
              </div>

              {inv.status === 'active' && (
                <div className="mt-5 pt-5 border-t border-yellow-900/20">
                  {confirmingId === inv._id ? (
                    <div className="bg-yellow-900/10 border border-yellow-700/30 rounded p-4">
                      <p className="text-sm text-[#f4efe2]/80 mb-1">
                        Clôturer maintenant vous rendra <span className="text-yellow-500 font-bold">$ {(Number(inv.amount) + Number(inv.earnings)).toFixed(2)}</span> sur
                        votre solde (capital $ {inv.amount} + gains accumulés à ce jour $ {inv.earnings}).
                      </p>
                      <p className="text-xs text-[#f4efe2]/50 mb-4">
                        Vous ne recevrez pas le reste du rendement prévu jusqu'à l'échéance. Cette action est définitive.
                      </p>
                      {closeError && <p className="text-xs text-red-400 mb-3">{closeError}</p>}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleClose(inv._id)}
                          disabled={closingId === inv._id}
                          className="lux-btn-gold !px-4 !py-2 !text-xs"
                        >
                          {closingId === inv._id ? 'Traitement...' : 'Confirmer la clôture'}
                        </button>
                        <button
                          onClick={() => { setConfirmingId(null); setCloseError(''); }}
                          disabled={closingId === inv._id}
                          className="lux-btn-ghost !px-4 !py-2 !text-xs"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setConfirmingId(inv._id); setCloseError(''); }}
                      className="text-xs text-[#f4efe2]/50 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer underline"
                    >
                      Couper cet investissement et récupérer mon capital + gains
                    </button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : investments.length > 0 ? (
        <Card className="p-6 text-center">
          <p className="text-[#f4efe2]/50">Aucun investissement sur cette période</p>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-[#f4efe2]/50 mb-5">Aucun investissement pour le moment</p>
          <button
            onClick={() => onNavigate('invest')}
            className="lux-btn-gold !px-6 !py-3"
          >
            Commencer à investir <IC.ArrowRight />
          </button>
        </Card>
      )}
    </div>
  );
}

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Tout' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
];
const PERIOD_MS = { today: 24 * 60 * 60 * 1000, week: 7 * 24 * 60 * 60 * 1000, month: 30 * 24 * 60 * 60 * 1000 };
const withinPeriod = (dateStr, period) => {
  if (period === 'all') return true;
  return Date.now() - new Date(dateStr).getTime() <= PERIOD_MS[period];
};

function TransactionsTab({ transactions, loading, onRefresh }) {
  const { api } = useAuth();
  const [typeFilter, setTypeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('today');
  const [showHidden, setShowHidden] = useState(false);
  const [hiddenList, setHiddenList] = useState([]);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!showHidden) return;
    api.get('/transactions/history?includeHidden=true').then(res => {
      if (res.data.success) setHiddenList(res.data.data.transactions.filter(t => t.hiddenForUser));
    }).catch(() => {});
  }, [showHidden, api]);

  if (loading) return <Spinner />;

  const toggleHide = async (tx) => {
    setBusyId(tx._id);
    try {
      await api.put(`/transactions/${tx._id}/hide`, { hidden: !tx.hiddenForUser });
      if (showHidden) setHiddenList(list => list.filter(t => t._id !== tx._id));
      onRefresh?.();
    } catch (e) { /* leave as-is, user can retry */ }
    setBusyId(null);
  };

  const source = showHidden ? [...transactions, ...hiddenList] : transactions;
  const types = ['all', ...new Set(source.map(t => t.type))];
  const typeLabelMap = { all: 'Tous types', deposit: 'Dépôts', investment: 'Investissements', withdrawal: 'Retraits', earning: 'Gains', trading: 'Trading', commission: 'Commissions', refund: 'Remboursements', reinvestment: 'Réinvestissements' };
  const filtered = source
    .filter(t => typeFilter === 'all' || t.type === typeFilter)
    .filter(t => withinPeriod(t.createdAt, periodFilter));

  return (
    <div className="space-y-6">
      <PageHeader title="Historique des transactions">
        <label className="flex items-center gap-2 text-xs text-[#f4efe2]/60 cursor-pointer select-none">
          <input type="checkbox" checked={showHidden} onChange={e => setShowHidden(e.target.checked)} className="accent-yellow-500" />
          Afficher les transactions masquées
        </label>
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`lux-chip ${typeFilter === t ? 'is-active' : ''}`}
          >
            {typeLabelMap[t] || t}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {PERIOD_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPeriodFilter(value)}
            className={`lux-chip ${periodFilter === value ? 'is-active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full lux-table">
              <thead>
                <tr>
                  {['Date', 'Type', 'Montant', 'Statut', ''].map(col => <th key={col}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, i) => (
                  <tr key={i} className={tx.hiddenForUser ? 'opacity-50' : ''}>
                    <td className="text-sm text-[#f4efe2]/60">
                      {new Date(tx.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td><Badge status={tx.type} /></td>
                    <td className={`text-sm font-medium lux-num ${tx.amount < 0 ? 'text-rose-300' : 'text-[#f4efe2]'}`}>
                      {tx.amount < 0 ? '−' : ''}$ {Math.abs(tx.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td><Badge status={tx.status} /></td>
                    <td className="text-right">
                      <button
                        onClick={() => toggleHide(tx)}
                        disabled={busyId === tx._id}
                        className="text-xs text-[#f4efe2]/50 hover:text-yellow-500 bg-transparent border-none cursor-pointer disabled:opacity-40"
                      >
                        {tx.hiddenForUser ? 'Réafficher' : 'Masquer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-[#f4efe2]/50 text-sm">
            {transactions.length === 0 ? 'Aucune transaction pour le moment' : 'Aucune transaction ne correspond à ces filtres'}
          </p>
        </Card>
      )}
    </div>
  );
}

const FAQ_CATEGORY_LABELS = {
  compte: 'Compte', depots: 'Dépôts', retraits: 'Retraits', investissement: 'Investissement',
  trading: 'Trading', parrainage: 'Parrainage', securite: 'Sécurité', verification: 'Vérification', academie: 'Académie'
};

function FAQTab() {
  const { api } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    api.get('/faq').then(res => {
      if (res.data.success) setFaqs(res.data.data.faqs);
    }).finally(() => setLoading(false));
  }, [api]);

  if (loading) return <Spinner />;

  const categories = ['all', ...new Set(faqs.map(f => f.category))];
  const q = search.trim().toLowerCase();
  const filtered = faqs
    .filter(f => category === 'all' || f.category === category)
    .filter(f => !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));

  return (
    <div className="space-y-6">
      <PageHeader title="Centre d'aide" />

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Rechercher une question…"
        className="lux-input"
      />

      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`lux-chip ${category === c ? 'is-active' : ''}`}
          >
            {c === 'all' ? 'Toutes' : (FAQ_CATEGORY_LABELS[c] || c)}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map(f => (
            <Card key={f._id} className="overflow-hidden">
              <button
                onClick={() => setOpenId(openId === f._id ? null : f._id)}
                className="w-full flex items-center justify-between gap-3 p-5 text-left bg-transparent border-none cursor-pointer group"
              >
                <span className="font-medium text-[#f4efe2] text-sm group-hover:text-[#f3d58a] transition-colors">{f.question}</span>
                <span className={`lux-icon-chip !w-7 !h-7 shrink-0 transition-transform duration-300 ${openId === f._id ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openId === f._id && (
                <div className="px-5 pb-5 text-sm leading-relaxed text-[#f4efe2]/60 whitespace-pre-wrap border-t border-white/5 pt-4">{f.answer}</div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-[#f4efe2]/50 text-sm">
            {faqs.length === 0 ? "Aucune question pour l'instant" : 'Aucun résultat pour cette recherche'}
          </p>
        </Card>
      )}
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-6">
      <PageHeader title="Sécurité" />
      <TwoFactorAuth />
      <PasswordChange />
      <Card className="p-6">
        <h3 className="lux-serif text-2xl font-semibold text-[#f4efe2] mb-4">Sessions actives</h3>
        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
          <div>
            <p className="font-semibold text-white text-sm">Session actuelle</p>
            <p className="text-xs text-[#f4efe2]/50 mt-0.5">Dernière activité : maintenant</p>
          </div>
          <span className="lux-pill bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20">Active</span>
        </div>
      </Card>
      <DeleteAccountSection />
    </div>
  );
}

function DeleteAccountSection() {
  const { api } = useAuth();
  const [pendingRequest, setPendingRequest] = useState(null);
  const [checking, setChecking] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await api.get('/user/deletion-status');
      if (res.data.success) setPendingRequest(res.data.data.pending ? res.data.data.request : null);
    } catch { /* keep last known state */ }
    finally { setChecking(false); }
  };
  useEffect(() => { fetchStatus(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRequest = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!password) { setError('Entrez votre mot de passe pour confirmer.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/user/request-deletion', { password, reason });
      setPendingRequest(res.data.data.request);
      setSuccess('Demande envoyée.');
      setConfirming(false);
      setPassword('');
      setReason('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la demande');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/user/cancel-deletion-request');
      setPendingRequest(null);
      setSuccess('Demande annulée.');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'annulation");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  return (
    <Card className="p-6">
      <h3 className="lux-serif text-2xl font-semibold text-rose-300 mb-2">Supprimer mon compte</h3>

      {success && <div className="mb-4 p-3 bg-green-900/40 border border-green-500/50 rounded text-green-300 text-sm">{success}</div>}
      {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-500/50 rounded text-red-300 text-sm">{error}</div>}

      {pendingRequest ? (
        <div className="space-y-3">
          <p className="text-sm text-[#f4efe2]/60">
            Votre demande de suppression a été envoyée le {new Date(pendingRequest.requestedAt).toLocaleDateString('fr-FR')} et attend la validation d'un administrateur.
          </p>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 border border-yellow-900/30 text-[#f4efe2]/60 hover:border-yellow-600/50 hover:text-yellow-400 text-sm rounded bg-transparent cursor-pointer disabled:opacity-50"
          >
            Annuler ma demande
          </button>
        </div>
      ) : !confirming ? (
        <div>
          <p className="text-sm text-[#f4efe2]/50 mb-4">
            Cette action est irréversible une fois validée par un administrateur : votre profil, vos données personnelles et votre accès au compte seront définitivement supprimés.
          </p>
          <button
            onClick={() => setConfirming(true)}
            className="px-4 py-2 border border-red-700/50 text-red-400 hover:bg-red-700 hover:text-white text-sm rounded bg-transparent cursor-pointer transition-colors"
          >
            Demander la suppression de mon compte
          </button>
        </div>
      ) : (
        <form onSubmit={handleRequest} className="space-y-4">
          <p className="text-sm text-red-300">
            Confirmez votre mot de passe pour envoyer la demande de suppression. Un administrateur devra la valider avant que le compte ne soit effectivement supprimé.
          </p>
          <div>
            <label className="block lux-label mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="lux-input"
              required
            />
          </div>
          <div>
            <label className="block lux-label mb-2">Motif <span className="text-[#f4efe2]/35 font-normal normal-case">(optionnel)</span></label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={2}
              className="lux-input"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setConfirming(false); setPassword(''); setError(''); }}
              className="px-4 py-2 border border-yellow-900/30 text-[#f4efe2]/60 hover:border-yellow-600/50 hover:text-yellow-400 text-sm rounded bg-transparent cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-red-700/50 text-red-400 hover:bg-red-700 hover:text-white text-sm rounded bg-transparent cursor-pointer transition-colors disabled:opacity-50"
            >
              {loading ? 'Envoi…' : 'CONFIRMER LA DEMANDE DE SUPPRESSION'}
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}

function PasswordChange() {
  const { changePassword } = useAuth();
  const [form, setForm]       = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const fields = [
    { label: 'Mot de passe actuel',           key: 'currentPassword' },
    { label: 'Nouveau mot de passe',           key: 'newPassword' },
    { label: 'Confirmer le nouveau mot de passe', key: 'confirmPassword' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.newPassword !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    const res = await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
    if (res.success) {
      setSuccess('Mot de passe modifié avec succès.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <Card className="p-6">
      <h3 className="lux-serif text-2xl font-semibold text-[#f4efe2] mb-5">
        Changer le mot de passe
      </h3>
      {success && <div className="mb-4 p-3 bg-green-900/40 border border-green-500/50 rounded text-green-300 text-sm">{success}</div>}
      {error   && <div className="mb-4 p-3 bg-red-900/40 border border-red-500/50 rounded text-red-300 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ label, key }) => (
          <div key={key}>
            <label className="block lux-label mb-2">{label}</label>
            <input
              type="password"
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="lux-input"
              required
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="lux-btn-gold !px-6 !py-3"
        >
          {loading ? 'Modification…' : 'Modifier le mot de passe'}
        </button>
      </form>
    </Card>
  );
}

function ProfileTab({ user }) {
  const { updateProfile, uploadAvatar } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '',
    country: user?.country || '', city: user?.city || '', address: user?.address || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied]   = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const res = await updateProfile(form);
    if (res.success) {
      setSuccess('Profil mis à jour avec succès.');
      toast('Profil mis à jour !');
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  const copyUserId = () => {
    if (!user?.userId) return;
    navigator.clipboard.writeText(user.userId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    await uploadAvatar(file);
    setAvatarUploading(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Mon profil" />

      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-br from-[#f3d58a] via-[#d4af37] to-[#a8832a] shadow-[0_10px_30px_-10px_rgba(212,175,55,0.6)]"><div className="w-full h-full rounded-full bg-[#0b0a08] overflow-hidden flex items-center justify-center">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="lux-serif text-3xl font-semibold lux-gold-text">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
              )}
            </div></div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer bg-[#f3d58a] hover:brightness-110 ring-2 ring-[#07070a] transition">
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" disabled={avatarUploading} />
              <span className="text-black text-xs font-black">{avatarUploading ? '…' : '✎'}</span>
            </label>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="lux-label">ID utilisateur</span>
              <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                user?.kycStatus === 'verified' ? 'text-green-400' : user?.kycStatus === 'rejected' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {user?.kycStatus === 'verified' && <><IC.Check color="#4ade80" /> Vérifié</>}
                {user?.kycStatus === 'rejected' && <><IC.X color="#f87171" /> Rejeté</>}
                {(user?.kycStatus === 'pending' || !user?.kycStatus || user?.kycStatus === 'none') && <>En attente</>}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-yellow-400 font-bold text-sm">{user?.userId || '—'}</code>
              {user?.userId && (
                <button type="button" onClick={copyUserId} className="text-xs text-[#f4efe2]/50 hover:text-yellow-500 bg-transparent border-none cursor-pointer">
                  {copied ? '✓ Copié' : 'Copier'}
                </button>
              )}
            </div>
            <p className="text-xs text-[#f4efe2]/35 mt-1">
              Membre depuis {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        {success && <div className="mb-4 p-3 bg-green-900/40 border border-green-500/50 rounded text-green-300 text-sm">{success}</div>}
        {error   && <div className="mb-4 p-3 bg-red-900/40 border border-red-500/50 rounded text-red-300 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[{ label: 'Prénom', key: 'firstName' }, { label: 'Nom', key: 'lastName' }].map(({ label, key }) => (
              <div key={key}>
                <label className="block lux-label mb-2">{label}</label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="lux-input"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block lux-label mb-2">Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="lux-input opacity-60 cursor-not-allowed"
            />
            <p className="mt-1.5 text-xs text-[#f4efe2]/35">L'adresse email ne peut pas être modifiée</p>
          </div>
          <div>
            <label className="block lux-label mb-2">Téléphone</label>
            <PhoneInput value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block lux-label mb-2">Pays</label>
              <select
                value={form.country}
                onChange={e => setForm({ ...form, country: e.target.value, city: '' })}
                className="lux-input"
              >
                <option value="">Sélectionner…</option>
                {COUNTRIES.map(c => <option key={c.iso2} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block lux-label mb-2">Ville</label>
              <CityAutocomplete
                value={form.city}
                onChange={v => setForm({ ...form, city: v })}
                countryIso2={COUNTRIES.find(c => c.name === form.country)?.iso2}
              />
            </div>
          </div>
          <div>
            <label className="block lux-label mb-2">Adresse</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="lux-input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="lux-btn-gold !px-6 !py-3"
          >
            {loading ? 'Mise à jour…' : 'Mettre à jour le profil'}
          </button>
        </form>
      </Card>
    </div>
  );
}