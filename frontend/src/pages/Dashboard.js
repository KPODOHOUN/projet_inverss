import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useForceDarkMode from '../hooks/useForceDarkMode';
import { packDisplayName } from '../utils/packNames';
import NotificationBell from '../components/NotificationBell';
import TwoFactorAuth from '../components/auth/TwoFactorAuth';
import KYC from './KYC';
import Invest from './Invest';
import Referral from './Referral';
import Academy from './Academy';
import WeeklyPayment from './WeeklyPayment';
import Trading from './Trading';

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

export default function Dashboard() {
  useForceDarkMode();
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab]       = useState('trading');
  const [tradingPrefillCode, setTradingPrefillCode] = useState(null);
  const handleNotificationNavigate = (tab, opts) => {
    setActiveTab(tab);
    if (opts?.prefillCode) setTradingPrefillCode(opts.prefillCode);
  };
  const [investments, setInvestments]   = useState([]);
  const [stats, setStats]               = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance]           = useState(user?.balance || 0);
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

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const navItems = [
    { id: 'overview',     Icon: IC.Overview,     label: "Vue d'ensemble" },
    { id: 'invest',       Icon: IC.Invest,       label: 'Investir' },
    { id: 'investments',  Icon: IC.Portfolio,    label: 'Mes Investissements' },
    { id: 'wallet',       Icon: IC.Wallet,       label: 'Mes Gains' },
    { id: 'trading',      Icon: IC.TrendUp,      label: 'Trading' },
    { id: 'academy',      Icon: IC.Academy,      label: 'Académie' },
    { id: 'referral',     Icon: IC.Referral,     label: 'Parrainage' },
    { id: 'transactions', Icon: IC.Transactions, label: 'Transactions' },
    { id: 'kyc',          Icon: IC.KYC,          label: 'KYC' },
    { id: 'security',     Icon: IC.Security,     label: 'Sécurité' },
    { id: 'profile',      Icon: IC.Profile,      label: 'Profil' },
  ];

  return (
    <div className="dash-scope min-h-screen bg-black relative">
      <div className="relative z-10">

      {}
      <header className="imc-glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-12 sm:h-16 flex items-center justify-between">

          {}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-yellow-400 hover:bg-yellow-500/10 transition-colors bg-transparent border-none cursor-pointer"
              aria-label="Menu"
            >
              {sidebarOpen ? <IC.Close /> : <IC.Menu />}
            </button>
            <img src="/logo-on-dark.png" alt="IMC Corporation" className="h-8 w-auto object-contain hidden sm:block" />
          </div>

          {}
          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationBell onNavigate={handleNotificationNavigate} />
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-sm text-white leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 border border-yellow-600/50 rounded text-yellow-400 hover:bg-yellow-600 hover:text-white text-xs sm:text-sm bg-transparent cursor-pointer"
            >
              <IC.Logout />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">

          {}
          <aside className={`
            lg:col-span-1
            fixed lg:static top-0 left-0 h-full lg:h-auto w-72 lg:w-auto
            z-50 lg:z-auto
            transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            transition-transform duration-300 ease-in-out
            pt-12 sm:pt-16 lg:pt-0
            overflow-y-auto lg:overflow-visible
          `}>
            <div className="bg-black lg:bg-transparent h-full lg:h-auto">

              {}
              <nav className="bg-gray-900 border border-white/10 rounded-lg p-2">
                {navItems.map(({ id, Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium bg-transparent border-none cursor-pointer text-left ${
                      activeTab === id
                        ? 'bg-yellow-600 text-white'
                        : 'text-gray-400 hover:text-yellow-400 hover:bg-white/5'
                    }`}
                  >
                    <span className={activeTab === id ? 'text-white' : 'text-current'}>
                      <Icon />
                    </span>
                    {label}
                  </button>
                ))}
              </nav>

              {}
              <div className="mt-3 bg-gray-900 border border-white/10 rounded-lg p-4">
                <h3 className="font-semibold text-xs text-yellow-500 mb-3">
                  Statut du compte
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Type</span>
                    <span className="font-semibold uppercase text-white">{user?.role}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">KYC</span>
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
                    <span className="text-gray-500">2FA</span>
                    <span className={`flex items-center gap-1 font-semibold ${user?.twoFactorEnabled ? 'text-green-400' : 'text-gray-500'}`}>
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
            {activeTab === 'overview'     && <OverviewTab user={user} balance={balance} investments={investments} stats={stats} loading={loading} onRefresh={fetchDashboardData} onNavigate={setActiveTab} />}
            {activeTab === 'invest'       && <Invest onNavigate={setActiveTab} />}
            {activeTab === 'investments'  && <InvestmentsTab investments={investments} loading={loading} onRefresh={fetchDashboardData} onNavigate={setActiveTab} />}
            {activeTab === 'wallet'       && <WeeklyPayment onNavigate={setActiveTab} />}
            {activeTab === 'trading'      && <Trading onNavigate={setActiveTab} prefillCode={tradingPrefillCode} onPrefillConsumed={() => setTradingPrefillCode(null)} />}
            {activeTab === 'academy'      && <Academy />}
            {activeTab === 'referral'     && <Referral />}
            {activeTab === 'transactions' && <TransactionsTab transactions={transactions} loading={loading} />}
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
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm tracking-wide">Chargement…</p>
      </div>
    </div>
  );
}

function PageHeader({ title, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">{title}</h2>
      {children}
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/25 rounded-lg ${className}`}>
      {children}
    </div>
  );
}

function Badge({ status }) {
  const map = {
    active:      { label: 'Actif',      cls: 'bg-green-900/50 text-green-400' },
    completed:   { label: 'Terminé',    cls: 'bg-blue-900/50 text-blue-400'   },
    pending:     { label: 'En attente', cls: 'bg-yellow-900/50 text-yellow-400' },
    failed:      { label: 'Échoué',     cls: 'bg-red-900/50 text-red-400'     },
    deposit:      { label: 'Dépôt',           cls: 'bg-green-900/50 text-green-400'  },
    withdrawal:   { label: 'Retrait',         cls: 'bg-red-900/50 text-red-400'      },
    investment:   { label: 'Investissement',  cls: 'bg-blue-900/50 text-blue-400'    },
    earning:      { label: 'Gain',            cls: 'bg-green-900/50 text-green-400'  },
    reinvestment: { label: 'Réinvestissement',cls: 'bg-blue-900/50 text-blue-400'    },
    commission:   { label: 'Commission',      cls: 'bg-purple-900/50 text-purple-400'},
    refund:       { label: 'Remboursement',   cls: 'bg-gray-800 text-gray-300'       },
    trading:      { label: 'Trading',         cls: 'bg-purple-900/50 text-purple-400'},
    rejected:     { label: 'Rejeté',          cls: 'bg-red-900/50 text-red-400'      },
    approved:     { label: 'Approuvé',        cls: 'bg-blue-900/50 text-blue-400'    },
    processing:   { label: 'En traitement',   cls: 'bg-purple-900/50 text-purple-400'},
    cancelled:    { label: 'Annulé',          cls: 'bg-gray-800 text-gray-400'       },
  };
  const { label, cls } = map[status] || { label: status, cls: 'bg-gray-800 text-gray-400' };
  return (
    <span className={`px-2.5 py-1 text-xs font-bold tracking-wide rounded-full ${cls}`}>{label.toUpperCase()}</span>
  );
}

function OverviewTab({ user, balance, investments, stats, loading, onRefresh, onNavigate }) {
  const [overviewPeriod, setOverviewPeriod] = useState('all');
  if (loading) return <Spinner />;

  const quickLinks = [
    { id: 'academy',  Icon: IC.Academy,  title: 'Académie',   desc: 'Formez-vous à l\'investissement' },
    { id: 'trading',  Icon: IC.TrendUp,  title: 'Trading',    desc: 'Suivez les marchés en direct' },
    { id: 'referral', Icon: IC.Referral, title: 'Parrainage', desc: 'Invitez vos contacts' },
  ];

  const recentInvestments = investments.filter(inv => withinPeriod(inv.createdAt, overviewPeriod));

  return (
    <div className="space-y-6">

      {}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mb-1">
          Bonjour, {user?.firstName}
        </h2>
        <p className="text-gray-500 text-sm">Voici un aperçu de votre compte IMC</p>
      </div>

      {}
      <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 sm:p-6 shadow-2xl shadow-yellow-500/20 relative overflow-hidden">
        {}
        <div className="absolute top-0 right-0 w-32 h-32 bg-black/10 rounded-bl-full pointer-events-none" />
        <p className="text-xs font-bold tracking-widest uppercase text-black/50 mb-2">Solde disponible</p>
        <h3 className="text-xl sm:text-2xl font-bold text-black mb-5 tracking-tight">
          $ {balance.toFixed(2)}
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('wallet')}
            className="flex items-center gap-2 px-5 py-2.5 rounded bg-black text-yellow-500 font-bold text-sm hover:bg-gray-900 transition-colors tracking-wide cursor-pointer border-none"
          >
            Déposer <IC.ArrowRight />
          </button>
          <button
            onClick={() => onNavigate('invest')}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-black/40 rounded font-bold text-sm hover:bg-black/10 transition-colors tracking-wide text-black cursor-pointer bg-transparent"
          >
            Investir
          </button>
          <button
            onClick={() => onNavigate('wallet')}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-black/40 rounded font-bold text-sm hover:bg-black/10 transition-colors tracking-wide text-black cursor-pointer bg-transparent"
          >
            Retirer
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard Icon={IC.Briefcase} title="Investissements actifs" value={stats?.activeInvestments || 0}   accent="yellow" />
        <StatCard Icon={IC.TrendUp}   title="ROI total"              value={`${stats?.totalROI?.toFixed(2) || 0} %`}  accent="green" />
        <StatCard Icon={IC.Coin}      title="Gains totaux"           value={`$ ${stats?.totalEarnings?.toFixed(2) || 0}`} accent="blue" />
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickLinks.map(({ id, Icon, title, desc }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className="w-full text-left p-5 bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/20 rounded-lg hover:border-yellow-500/40 transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer"
          >
            <div className="text-yellow-500/70 group-hover:text-yellow-500 transition-colors mb-3">
              <Icon />
            </div>
            <p className="font-bold text-white text-sm group-hover:text-yellow-400 transition-colors mb-1">{title}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </button>
        ))}
      </div>

      {}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h3 className="font-black text-base text-yellow-500 tracking-wide uppercase">Investissements récents</h3>
          <button
            onClick={() => onNavigate('investments')}
            className="text-xs text-gray-500 hover:text-yellow-500 transition-colors flex items-center gap-1 bg-transparent border-none cursor-pointer"
          >
            Voir tout <IC.ArrowRight />
          </button>
        </div>
        {investments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {PERIOD_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setOverviewPeriod(value)}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${overviewPeriod === value ? 'bg-yellow-500 text-black' : 'bg-black/40 text-gray-400 border border-yellow-900/20 hover:border-yellow-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {recentInvestments.length > 0 ? (
          <div className="space-y-2">
            {recentInvestments.slice(0, 3).map((inv, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-black/50 border border-yellow-900/15 rounded hover:border-yellow-900/35 transition-colors">
                <div>
                  <p className="font-semibold text-white text-sm">{packDisplayName(inv.pack)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-500 text-sm">$ {inv.amount}</p>
                  <p className="text-xs text-green-400 mt-0.5">+{inv.roi} %</p>
                </div>
              </div>
            ))}
          </div>
        ) : investments.length > 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 text-sm">Aucun investissement sur cette période</p>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600 text-sm mb-4">Aucun investissement actif</p>
            <button
              onClick={() => onNavigate('invest')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-colors tracking-wide cursor-pointer border-none"
            >
              Commencer à investir <IC.ArrowRight />
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({ Icon, title, value, accent }) {
  const border = { yellow: 'border-yellow-500/30', green: 'border-green-500/30', blue: 'border-blue-500/30' };
  const text   = { yellow: 'text-yellow-500',       green: 'text-green-400',      blue: 'text-blue-400'      };
  return (
    <div className={`bg-gradient-to-br from-gray-900 to-black border-2 ${border[accent]} rounded-lg p-5`}>
      <div className={`${text[accent]} mb-3`}><Icon /></div>
      <p className="text-gray-500 text-xs mb-1 font-medium">{title}</p>
      <p className="text-lg sm:text-xl font-bold text-white tracking-tight">{value}</p>
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
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${periodFilter === value ? 'bg-yellow-500 text-black' : 'bg-black/40 text-gray-400 border border-yellow-900/20 hover:border-yellow-700'}`}
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
                  <h3 className="text-lg font-bold text-yellow-500 tracking-wide">{packDisplayName(inv.pack)}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Créé le {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Badge status={inv.status} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Montant',    value: `$ ${inv.amount}`,     cls: 'text-white' },
                  { label: 'ROI actuel', value: `+${inv.roi} %`, cls: 'text-green-400' },
                  { label: 'Gains',      value: `$ ${inv.earnings}`,   cls: 'text-yellow-500' },
                  { label: 'Échéance',   value: inv.endDate ? new Date(inv.endDate).toLocaleDateString('fr-FR') : '—', cls: 'text-white' },
                ].map(({ label, value, cls }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className={`font-bold text-sm ${cls}`}>{value}</p>
                  </div>
                ))}
              </div>

              {inv.status === 'active' && (
                <div className="mt-5 pt-5 border-t border-yellow-900/20">
                  {confirmingId === inv._id ? (
                    <div className="bg-yellow-900/10 border border-yellow-700/30 rounded p-4">
                      <p className="text-sm text-gray-300 mb-1">
                        Clôturer maintenant vous rendra <span className="text-yellow-500 font-bold">$ {(Number(inv.amount) + Number(inv.earnings)).toFixed(2)}</span> sur
                        votre solde (capital $ {inv.amount} + gains accumulés à ce jour $ {inv.earnings}).
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Vous ne recevrez pas le reste du rendement prévu jusqu'à l'échéance. Cette action est définitive.
                      </p>
                      {closeError && <p className="text-xs text-red-400 mb-3">{closeError}</p>}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleClose(inv._id)}
                          disabled={closingId === inv._id}
                          className="px-4 py-2 rounded bg-yellow-500 text-black font-bold text-xs hover:bg-yellow-400 transition-colors disabled:opacity-50 cursor-pointer border-none"
                        >
                          {closingId === inv._id ? 'Traitement...' : 'Confirmer la clôture'}
                        </button>
                        <button
                          onClick={() => { setConfirmingId(null); setCloseError(''); }}
                          disabled={closingId === inv._id}
                          className="px-4 py-2 rounded border border-gray-700 text-gray-400 font-bold text-xs hover:border-gray-500 transition-colors cursor-pointer bg-transparent"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setConfirmingId(inv._id); setCloseError(''); }}
                      className="text-xs text-gray-500 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer underline"
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
          <p className="text-gray-500">Aucun investissement sur cette période</p>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-gray-500 mb-5">Aucun investissement pour le moment</p>
          <button
            onClick={() => onNavigate('invest')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-colors tracking-wide cursor-pointer border-none"
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

function TransactionsTab({ transactions, loading }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('today');
  if (loading) return <Spinner />;

  const types = ['all', ...new Set(transactions.map(t => t.type))];
  const typeLabelMap = { all: 'Tous types', deposit: 'Dépôts', investment: 'Investissements', withdrawal: 'Retraits', earning: 'Gains', trading: 'Trading', commission: 'Commissions', refund: 'Remboursements', reinvestment: 'Réinvestissements' };
  const filtered = transactions
    .filter(t => typeFilter === 'all' || t.type === typeFilter)
    .filter(t => withinPeriod(t.createdAt, periodFilter));

  return (
    <div className="space-y-6">
      <PageHeader title="Historique des transactions" />

      <div className="flex flex-wrap gap-2">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${typeFilter === t ? 'bg-yellow-500 text-black' : 'bg-black/40 text-gray-400 border border-yellow-900/20 hover:border-yellow-700'}`}
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
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${periodFilter === value ? 'bg-yellow-500 text-black' : 'bg-black/40 text-gray-400 border border-yellow-900/20 hover:border-yellow-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/60">
                <tr>
                  {['Date', 'Type', 'Montant', 'Statut'].map(col => (
                    <th key={col} className="px-5 py-3 text-left text-xs font-bold text-yellow-500 tracking-widest uppercase">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-900/15">
                {filtered.map((tx, i) => (
                  <tr key={i} className="hover:bg-yellow-900/8 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-5 py-4"><Badge status={tx.type} /></td>
                    <td className="px-5 py-4 text-sm font-bold text-white">$ {tx.amount}</td>
                    <td className="px-5 py-4"><Badge status={tx.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-gray-500 text-sm">
            {transactions.length === 0 ? 'Aucune transaction pour le moment' : 'Aucune transaction ne correspond à ces filtres'}
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
        <h3 className="font-bold text-sm tracking-widest uppercase text-yellow-500 mb-4">Sessions actives</h3>
        <div className="flex items-center justify-between p-4 bg-black/50 border border-yellow-900/15 rounded">
          <div>
            <p className="font-semibold text-white text-sm">Session actuelle</p>
            <p className="text-xs text-gray-500 mt-0.5">Dernière activité : maintenant</p>
          </div>
          <span className="px-2.5 py-1 bg-green-900/50 text-green-400 text-xs font-bold tracking-wide rounded-full">
            ACTIVE
          </span>
        </div>
      </Card>
    </div>
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
      <h3 className="font-bold text-sm tracking-widest uppercase text-yellow-500 mb-5">
        Changer le mot de passe
      </h3>
      {success && <div className="mb-4 p-3 bg-green-900/40 border border-green-500/50 rounded text-green-300 text-sm">{success}</div>}
      {error   && <div className="mb-4 p-3 bg-red-900/40 border border-red-500/50 rounded text-red-300 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ label, key }) => (
          <div key={key}>
            <label className="block text-xs font-bold text-yellow-500 tracking-widest uppercase mb-2">{label}</label>
            <input
              type="password"
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="w-full px-4 py-3 bg-black border-2 border-yellow-900/30 rounded text-white text-sm focus:border-yellow-500 focus:outline-none transition-colors"
              required
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-colors disabled:opacity-50 tracking-wide cursor-pointer border-none"
        >
          {loading ? 'Modification…' : 'Modifier le mot de passe'}
        </button>
      </form>
    </Card>
  );
}

function ProfileTab({ user }) {
  const { updateProfile } = useAuth();
  const [form, setForm]       = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const res = await updateProfile(form);
    if (res.success) {
      setSuccess('Profil mis à jour avec succès.');
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Mon profil" />
      <Card className="p-6">
        {success && <div className="mb-4 p-3 bg-green-900/40 border border-green-500/50 rounded text-green-300 text-sm">{success}</div>}
        {error   && <div className="mb-4 p-3 bg-red-900/40 border border-red-500/50 rounded text-red-300 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[{ label: 'Prénom', key: 'firstName' }, { label: 'Nom', key: 'lastName' }].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-yellow-500 tracking-widest uppercase mb-2">{label}</label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-3 bg-black border-2 border-yellow-900/30 rounded text-white text-sm focus:border-yellow-500 focus:outline-none transition-colors"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-bold text-yellow-500 tracking-widest uppercase mb-2">Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="w-full px-4 py-3 bg-gray-900/50 border-2 border-yellow-900/15 rounded text-gray-500 text-sm cursor-not-allowed"
            />
            <p className="mt-1.5 text-xs text-gray-600">L'adresse email ne peut pas être modifiée</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-yellow-500 tracking-widest uppercase mb-2">Téléphone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 bg-black border-2 border-yellow-900/30 rounded text-white text-sm focus:border-yellow-500 focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-colors disabled:opacity-50 tracking-wide cursor-pointer border-none"
          >
            {loading ? 'Mise à jour…' : 'Mettre à jour le profil'}
          </button>
        </form>
      </Card>
    </div>
  );
}