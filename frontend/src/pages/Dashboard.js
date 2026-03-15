import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TwoFactorAuth from '../components/auth/TwoFactorAuth';
import KYC from './KYC';
import Invest from './Invest';
import Mining from './Mining';
import Referral from './Referral';
import WatchToEarn from './WatchToEarn';
import Academy from './Academy';
import WeeklyPayment from './WeeklyPayment';
import VIPExpeditions from './VIPExpeditions';
import Transparency from './Transparency';

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
  Mining: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M14.5 2.5l7 7-10 10-7-7 10-10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M2 22l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12.5 6.5l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Academy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L1 9l11 6 9-4.91V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 13.18v4L12 21l7-3.82v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Watch: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <polygon points="10 8 16 12 10 16 10 8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  Referral: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Expedition: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Transparency: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab]       = useState('overview');
  const [investments, setInvestments]   = useState([]);
  const [stats, setStats]               = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [investRes, txRes] = await Promise.all([
        api.get('/investments/my-investments'),
        api.get('/transactions/history'),
      ]);
      if (investRes.data.success) {
        setInvestments(investRes.data.data.investments);
        setStats(investRes.data.data.stats);
      }
      if (txRes.data.success) {
        setTransactions(txRes.data.data.transactions);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const navItems = [
    { id: 'overview',     Icon: IC.Overview,     label: "Vue d'ensemble" },
    { id: 'invest',       Icon: IC.Invest,       label: 'Investir' },
    { id: 'investments',  Icon: IC.Portfolio,    label: 'Mes Investissements' },
    { id: 'wallet',       Icon: IC.Wallet,       label: 'Mes Gains' },
    { id: 'mining',       Icon: IC.Mining,       label: 'Mining NLX' },
    { id: 'academy',      Icon: IC.Academy,      label: 'Académie' },
    { id: 'watch',        Icon: IC.Watch,        label: 'Watch-to-Earn' },
    { id: 'referral',     Icon: IC.Referral,     label: 'Parrainage' },
    { id: 'expeditions',  Icon: IC.Expedition,   label: 'VIP Expeditions' },
    { id: 'transparency', Icon: IC.Transparency, label: 'Transparence' },
    { id: 'transactions', Icon: IC.Transactions, label: 'Transactions' },
    { id: 'kyc',          Icon: IC.KYC,          label: 'KYC' },
    { id: 'security',     Icon: IC.Security,     label: 'Sécurité' },
    { id: 'profile',      Icon: IC.Profile,      label: 'Profil' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">

      {}
      <header className="bg-black/95 border-b border-yellow-900/25 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-yellow-500 hover:bg-yellow-900/20 transition-colors bg-transparent border-none cursor-pointer"
              aria-label="Menu"
            >
              {sidebarOpen ? <IC.Close /> : <IC.Menu />}
            </button>
            <div className="w-8 h-8 bg-yellow-500 flex items-center justify-center font-black text-base text-black">
              N
            </div>
            <span className="font-black text-lg text-yellow-500 tracking-wide hidden sm:block">NELIAXA</span>
          </div>

          {}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-sm text-white leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-yellow-500/50 font-semibold text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all text-xs sm:text-sm tracking-wide bg-transparent cursor-pointer"
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
            pt-16 lg:pt-0
            overflow-y-auto lg:overflow-visible
          `}>
            <div className="bg-black lg:bg-transparent h-full lg:h-auto">

              {}
              <nav className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/25 p-2">
                {navItems.map(({ id, Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 bg-transparent border-none cursor-pointer text-left ${
                      activeTab === id
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                        : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-900/15'
                    }`}
                  >
                    <span className={activeTab === id ? 'text-black' : 'text-current'}>
                      <Icon />
                    </span>
                    {label}
                  </button>
                ))}
              </nav>

              {}
              <div className="mt-3 bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/25 p-4">
                <h3 className="font-bold text-xs tracking-widest uppercase text-yellow-500 mb-3">
                  Statut du compte
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Type</span>
                    <span className="font-semibold uppercase text-white">{user?.accountType}</span>
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
            {activeTab === 'overview'     && <OverviewTab user={user} investments={investments} stats={stats} loading={loading} onRefresh={fetchDashboardData} onNavigate={setActiveTab} />}
            {activeTab === 'invest'       && <Invest />}
            {activeTab === 'investments'  && <InvestmentsTab investments={investments} loading={loading} onRefresh={fetchDashboardData} onNavigate={setActiveTab} />}
            {activeTab === 'wallet'       && <WeeklyPayment />}
            {activeTab === 'mining'       && <Mining />}
            {activeTab === 'academy'      && <Academy />}
            {activeTab === 'watch'        && <WatchToEarn />}
            {activeTab === 'referral'     && <Referral />}
            {activeTab === 'expeditions'  && <VIPExpeditions />}
            {activeTab === 'transparency' && <Transparency />}
            {activeTab === 'transactions' && <TransactionsTab transactions={transactions} loading={loading} />}
            {activeTab === 'kyc'          && <KYC />}
            {activeTab === 'security'     && <SecurityTab />}
            {activeTab === 'profile'      && <ProfileTab user={user} />}
          </main>
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
      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{title}</h2>
      {children}
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/25 ${className}`}>
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
    deposit:     { label: 'Dépôt',      cls: 'bg-green-900/50 text-green-400' },
    withdrawal:  { label: 'Retrait',    cls: 'bg-red-900/50 text-red-400'     },
    investment:  { label: 'Investissement', cls: 'bg-blue-900/50 text-blue-400' },
  };
  const { label, cls } = map[status] || { label: status, cls: 'bg-gray-800 text-gray-400' };
  return (
    <span className={`px-2.5 py-1 text-xs font-bold tracking-wide ${cls}`}>{label.toUpperCase()}</span>
  );
}

function OverviewTab({ user, investments, stats, loading, onRefresh, onNavigate }) {
  if (loading) return <Spinner />;

  const quickLinks = [
    { id: 'mining',   Icon: IC.Mining,   title: 'Mining NLX',    desc: 'Générez des tokens NLX' },
    { id: 'watch',    Icon: IC.Watch,    title: 'Watch-to-Earn', desc: 'Regardez des publicités' },
    { id: 'referral', Icon: IC.Referral, title: 'Parrainage',    desc: 'Invitez vos contacts' },
  ];

  return (
    <div className="space-y-6">

      {}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
          Bonjour, {user?.firstName}
        </h2>
        <p className="text-gray-500 text-sm">Voici un aperçu de votre compte NELIAXA</p>
      </div>

      {}
      <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 sm:p-8 shadow-2xl shadow-yellow-500/20 relative overflow-hidden">
        {}
        <div className="absolute top-0 right-0 w-32 h-32 bg-black/10 rounded-bl-full pointer-events-none" />
        <p className="text-xs font-bold tracking-widest uppercase text-black/50 mb-2">Solde disponible</p>
        <h3 className="text-4xl sm:text-5xl font-black text-black mb-6 tracking-tight">
          {user?.balance?.toFixed(2) || '0.00'} €
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('invest')}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-yellow-500 font-bold text-sm hover:bg-gray-900 transition-colors tracking-wide cursor-pointer border-none"
          >
            Investir <IC.ArrowRight />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-black/40 font-bold text-sm hover:bg-black/10 transition-colors tracking-wide text-black cursor-pointer bg-transparent">
            Retirer
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard Icon={IC.Briefcase} title="Investissements actifs" value={stats?.activeInvestments || 0}   accent="yellow" />
        <StatCard Icon={IC.TrendUp}   title="ROI total"              value={`${stats?.totalROI?.toFixed(2) || 0} %`}  accent="green" />
        <StatCard Icon={IC.Coin}      title="Gains totaux"           value={`€ ${stats?.totalEarnings?.toFixed(2) || 0}`} accent="blue" />
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickLinks.map(({ id, Icon, title, desc }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className="w-full text-left p-5 bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/20 hover:border-yellow-500/40 transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer"
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
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-base text-yellow-500 tracking-wide uppercase">Investissements récents</h3>
          <button
            onClick={() => onNavigate('investments')}
            className="text-xs text-gray-500 hover:text-yellow-500 transition-colors flex items-center gap-1 bg-transparent border-none cursor-pointer"
          >
            Voir tout <IC.ArrowRight />
          </button>
        </div>
        {investments.length > 0 ? (
          <div className="space-y-2">
            {investments.slice(0, 3).map((inv, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-black/50 border border-yellow-900/15 hover:border-yellow-900/35 transition-colors">
                <div>
                  <p className="font-semibold text-white text-sm">{inv.plan}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-500 text-sm">€ {inv.amount}</p>
                  <p className="text-xs text-green-400 mt-0.5">+{inv.currentROI} %</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600 text-sm mb-4">Aucun investissement actif</p>
            <button
              onClick={() => onNavigate('invest')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-colors tracking-wide cursor-pointer border-none"
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
    <div className={`bg-gradient-to-br from-gray-900 to-black border-2 ${border[accent]} p-5`}>
      <div className={`${text[accent]} mb-3`}><Icon /></div>
      <p className="text-gray-500 text-xs mb-1 font-medium">{title}</p>
      <p className="text-2xl font-black text-white tracking-tight">{value}</p>
    </div>
  );
}

function InvestmentsTab({ investments, loading, onRefresh, onNavigate }) {
  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Mes Investissements">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 border border-yellow-500/50 text-yellow-500 font-semibold hover:bg-yellow-500 hover:text-black transition-all text-xs tracking-wide bg-transparent cursor-pointer"
        >
          <IC.Refresh /> Actualiser
        </button>
      </PageHeader>

      {investments.length > 0 ? (
        <div className="space-y-4">
          {investments.map((inv, i) => (
            <Card key={i} className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-yellow-500 tracking-wide">{inv.plan}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Créé le {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Badge status={inv.status} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Montant',    value: `€ ${inv.amount}`,     cls: 'text-white' },
                  { label: 'ROI actuel', value: `+${inv.currentROI} %`, cls: 'text-green-400' },
                  { label: 'Gains',      value: `€ ${inv.earnings}`,   cls: 'text-yellow-500' },
                  { label: 'Échéance',   value: new Date(inv.endDate).toLocaleDateString('fr-FR'), cls: 'text-white' },
                ].map(({ label, value, cls }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className={`font-bold text-sm ${cls}`}>{value}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-5">Aucun investissement pour le moment</p>
          <button
            onClick={() => onNavigate('invest')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-colors tracking-wide cursor-pointer border-none"
          >
            Commencer à investir <IC.ArrowRight />
          </button>
        </Card>
      )}
    </div>
  );
}

function TransactionsTab({ transactions, loading }) {
  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Historique des transactions" />

      {transactions.length > 0 ? (
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
                {transactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-yellow-900/8 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-5 py-4"><Badge status={tx.type} /></td>
                    <td className="px-5 py-4 text-sm font-bold text-white">€ {tx.amount}</td>
                    <td className="px-5 py-4"><Badge status={tx.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-sm">Aucune transaction pour le moment</p>
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
        <div className="flex items-center justify-between p-4 bg-black/50 border border-yellow-900/15">
          <div>
            <p className="font-semibold text-white text-sm">Session actuelle</p>
            <p className="text-xs text-gray-500 mt-0.5">Dernière activité : maintenant</p>
          </div>
          <span className="px-2.5 py-1 bg-green-900/50 text-green-400 text-xs font-bold tracking-wide">
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
      {success && <div className="mb-4 p-3 bg-green-900/40 border border-green-500/50 text-green-300 text-sm">{success}</div>}
      {error   && <div className="mb-4 p-3 bg-red-900/40 border border-red-500/50 text-red-300 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ label, key }) => (
          <div key={key}>
            <label className="block text-xs font-bold text-yellow-500 tracking-widest uppercase mb-2">{label}</label>
            <input
              type="password"
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="w-full px-4 py-3 bg-black border-2 border-yellow-900/30 text-white text-sm focus:border-yellow-500 focus:outline-none transition-colors"
              required
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-colors disabled:opacity-50 tracking-wide cursor-pointer border-none"
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
        {success && <div className="mb-4 p-3 bg-green-900/40 border border-green-500/50 text-green-300 text-sm">{success}</div>}
        {error   && <div className="mb-4 p-3 bg-red-900/40 border border-red-500/50 text-red-300 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[{ label: 'Prénom', key: 'firstName' }, { label: 'Nom', key: 'lastName' }].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-yellow-500 tracking-widest uppercase mb-2">{label}</label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-3 bg-black border-2 border-yellow-900/30 text-white text-sm focus:border-yellow-500 focus:outline-none transition-colors"
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
              className="w-full px-4 py-3 bg-gray-900/50 border-2 border-yellow-900/15 text-gray-500 text-sm cursor-not-allowed"
            />
            <p className="mt-1.5 text-xs text-gray-600">L'adresse email ne peut pas être modifiée</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-yellow-500 tracking-widest uppercase mb-2">Téléphone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 bg-black border-2 border-yellow-900/30 text-white text-sm focus:border-yellow-500 focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-colors disabled:opacity-50 tracking-wide cursor-pointer border-none"
          >
            {loading ? 'Mise à jour…' : 'Mettre à jour le profil'}
          </button>
        </form>
      </Card>
    </div>
  );
}