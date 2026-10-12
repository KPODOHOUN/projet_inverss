import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
import BrandLogo from '../components/BrandLogo';
import ThemeToggle from '../components/ThemeToggle';

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
  ArrowDownLeft: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 7L7 17M7 17h8M7 17V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  ArrowUpRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  Chart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M7 15l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  Layers: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l10 5-10 5L2 7l10-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M2 12l10 5 10-5M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
  ),
  Percent: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 5L5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.8"/><circle cx="17" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.8"/></svg>
  ),
  More: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>
  ),
  Verified: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 22l-2.4-1.8-3 .2-.9-2.9-2.5-1.7 1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2L12 2z" fill="#f59e0b" fillOpacity="0.18" stroke="#f59e0b" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8.5 12.2l2.3 2.3 4.7-4.8" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

  const currentLabel = navItems.find(n => n.id === activeTab)?.label || "Vue d'ensemble";
  const bottomNav = [
    { id: 'overview', Icon: IC.Overview, label: 'Aperçu' },
    { id: 'invest', Icon: IC.Invest, label: 'Investir' },
    { id: 'wallet', Icon: IC.Wallet, label: 'Fonds' },
    { id: 'transactions', Icon: IC.Transactions, label: 'Historique' },
  ];

  return (
    <div className="dash-scope lux-page min-h-screen relative">
      <header className="lux-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo className="h-8 w-auto object-contain shrink-0" />
            <div className="pl-3 border-l border-white/10 min-w-0 leading-tight">
              <p className="text-sm font-semibold text-[#e7ebf2]">IMC Corp</p>
              <p className="text-xs text-[#9aa6b8] truncate">{currentLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <NotificationBell onNavigate={handleNotificationNavigate} />
            <button
              onClick={() => setActiveTab('profile')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white bg-[#2563eb] overflow-hidden shrink-0 border-2 border-[#253043] cursor-pointer"
              aria-label="Profil"
            >
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                : `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase()}
            </button>
            <span className="hidden lg:block">
              <button onClick={handleLogout} className="lux-btn-ghost !px-3 !py-2" aria-label="Déconnexion">
                <IC.Logout />
                <span className="hidden xl:inline">Déconnexion</span>
              </button>
            </span>
          </div>
        </div>
        <TickerStrip />
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-28 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 lg:gap-8">

          <aside className={`
            fixed lg:static bottom-0 lg:bottom-auto left-0 right-0 lg:right-auto z-[70] lg:z-auto
            max-h-[80vh] lg:max-h-none overflow-y-auto lg:overflow-visible
            transform ${sidebarOpen ? 'translate-y-0' : 'translate-y-full'} lg:translate-y-0
            transition-transform duration-300 ease-out
          `}>
            <div className="bg-[#141b26] lg:bg-transparent rounded-t-2xl lg:rounded-none border-t border-white/10 lg:border-0 p-4 lg:p-0 lg:sticky lg:top-[120px]">
              <div className="lg:hidden w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
              <nav className="lux-card p-2 space-y-0.5">
                {navItems.map(({ id, Icon, label, external }) => (
                  <button
                    key={id}
                    onClick={() => { if (external) navigate(external); else setActiveTab(id); setSidebarOpen(false); }}
                    className={`lux-nav-item ${activeTab === id ? 'is-active' : ''}`}
                  >
                    <span className="opacity-80"><Icon /></span>
                    {label}
                  </button>
                ))}
                <button onClick={handleLogout} className="lux-nav-item lg:hidden !text-rose-300">
                  <span><IC.Logout /></span>
                  Déconnexion
                </button>
              </nav>

              <div className="mt-4 lux-card p-4 hidden lg:block">
                <p className="text-xs font-semibold text-[#9aa6b8] mb-3">Statut du compte</p>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6f7c90]">Type</span>
                    <span className="font-semibold text-[#e7ebf2]">{ROLE_LABEL[user?.role] || user?.role}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6f7c90]">KYC</span>
                    <span className={`flex items-center gap-1 font-semibold ${
                      user?.kycStatus === 'verified' ? 'text-emerald-400' :
                      user?.kycStatus === 'rejected' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {user?.kycStatus === 'verified'  && <><IC.Check /> Vérifié</>}
                      {user?.kycStatus === 'rejected'  && <><IC.X /> Rejeté</>}
                      {user?.kycStatus !== 'verified' && user?.kycStatus !== 'rejected' && <><IC.Clock /> En attente</>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6f7c90]">2FA</span>
                    <span className={`flex items-center gap-1 font-semibold ${user?.twoFactorEnabled ? 'text-emerald-400' : 'text-[#6f7c90]'}`}>
                      {user?.twoFactorEnabled ? <><IC.Check /> Activé</> : <><IC.X /> Désactivé</>}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main key={activeTab} className="min-w-0 animate-tabIn">
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

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0f151f]/95 backdrop-blur border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {bottomNav.map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium bg-transparent border-none cursor-pointer ${activeTab === id ? 'text-[#5b8cff]' : 'text-[#9aa6b8]'}`}
            >
              <span className="scale-125"><Icon /></span>
              {label}
            </button>
          ))}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium bg-transparent border-none cursor-pointer ${sidebarOpen || !['overview','invest','wallet','transactions'].includes(activeTab) ? 'text-[#5b8cff]' : 'text-[#9aa6b8]'}`}
          >
            <IC.More />
            Plus
          </button>
        </div>
      </nav>
    </div>
  );
}

// Live prices of the platform's tradable assets, scrolling under the header
// — the same /trading/assets feed the Trading tab uses, not decorative data.
function TickerStrip() {
  const { api } = useAuth();
  const [assets, setAssets] = useState([]);
  useEffect(() => {
    api.get('/trading/assets').then(res => {
      if (res.data.success) setAssets(res.data.data.assets || []);
    }).catch(() => {});
  }, [api]);
  if (assets.length === 0) return null;
  const items = [...assets, ...assets];
  return (
    <div className="border-t border-white/5 overflow-hidden">
      <div className="lux-marquee flex w-max">
        {items.map((a, i) => (
          <span key={i} className="flex items-center gap-2 px-5 py-2 text-xs whitespace-nowrap">
            <span className={`w-1.5 h-1.5 rounded-full ${a.source === 'live' ? 'bg-emerald-400' : 'bg-[#6f7c90]'}`} />
            <span className="font-semibold text-[#e7ebf2]">{a.name}</span>
            <span className="lux-num text-[#9aa6b8]">${Number(a.price).toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-11 h-11">
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#f59e0b] animate-spin" />
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
        <h2 className="lux-serif text-2xl sm:text-3xl font-bold text-[#e7ebf2] leading-none">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-[#e7ebf2]/50">{subtitle}</p>}
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
  gold:   'bg-yellow-400/10 text-[#fbbf24] ring-1 ring-inset ring-yellow-400/25',
  blue:   'bg-sky-400/10 text-sky-300 ring-1 ring-inset ring-sky-400/20',
  violet: 'bg-violet-400/10 text-violet-300 ring-1 ring-inset ring-violet-400/20',
  gray:   'bg-white/5 text-[#e7ebf2]/60 ring-1 ring-inset ring-white/10',
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

const fmtUsd = (n, d = 2) => Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });

const OP_META = {
  deposit:      { label: 'Dépôt USDT',        cls: 'bg-emerald-500/15 text-emerald-300', Icon: IC.ArrowDownLeft },
  withdrawal:   { label: 'Retrait USDT',      cls: 'bg-slate-500/20 text-slate-300',     Icon: IC.ArrowUpRight },
  investment:   { label: 'Investissement',    cls: 'bg-amber-500/15 text-amber-300',     Icon: IC.Layers },
  earning:      { label: 'Gain crédité',      cls: 'bg-blue-500/15 text-blue-300',       Icon: IC.Coin },
  reinvestment: { label: 'Réinvestissement',  cls: 'bg-amber-500/15 text-amber-300',     Icon: IC.Layers },
  commission:   { label: 'Commission',        cls: 'bg-violet-500/15 text-violet-300',   Icon: IC.Referral },
  refund:       { label: 'Remboursement',     cls: 'bg-slate-500/20 text-slate-300',     Icon: IC.Refresh },
  trading:      { label: 'Trading',           cls: 'bg-blue-500/15 text-blue-300',       Icon: IC.Chart },
};
const OP_STATUS = { pending: ['En attente', 'text-amber-400'], approved: ['Approuvé', 'text-blue-300'], processing: ['En traitement', 'text-blue-300'], completed: ['Réussi', 'text-emerald-400'], rejected: ['Refusé', 'text-rose-400'], cancelled: ['Annulé', 'text-[#6f7c90]'], failed: ['Échoué', 'text-rose-400'] };

function SectionTitle({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#e7ebf2]">{title}</h2>
      {action && (
        <button onClick={onAction} className="text-sm font-medium text-[#7aa2ff] hover:text-[#a5c0ff] bg-transparent border-none cursor-pointer flex items-center gap-1">
          {action} <span aria-hidden="true">›</span>
        </button>
      )}
    </div>
  );
}

function OverviewTab({ user, balance, summary, investments, transactions, stats, loading, onNavigate }) {
  if (loading) return <Spinner />;

  const kycOk = user?.kycStatus === 'verified';
  const activeInvs = (investments || []).filter(i => i.status === 'active');
  const recent = [...(transactions || [])].sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt)).slice(0, 5);
  const earned = stats?.totalEarnings ?? 0;

  const actions = [
    { id: 'wallet', label: 'Déposer', Icon: IC.ArrowDownLeft, cls: 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white', chip: 'bg-white/15' },
    { id: 'wallet', label: 'Retirer', Icon: IC.ArrowUpRight, cls: 'bg-[#2a3446] hover:bg-[#334058] text-[#e7ebf2]', chip: 'bg-white/10' },
    { id: 'invest', label: 'Investir', Icon: IC.Chart, cls: 'bg-[#f59e0b] hover:bg-[#fbb024] text-[#1a1204]', chip: 'bg-black/10' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#e7ebf2] flex items-center gap-2">
            Bonjour, {user?.firstName} {kycOk && <IC.Verified />}
          </h1>
          <p className="text-sm text-[#9aa6b8] mt-1">Voici l'état de votre portefeuille aujourd'hui.</p>
        </div>
        <button
          onClick={() => !kycOk && onNavigate('kyc')}
          className={`lux-pill !py-1.5 !px-3 border-none ${kycOk ? 'bg-emerald-500/10 text-emerald-300 cursor-default' : 'bg-amber-500/10 text-amber-300 cursor-pointer'}`}
        >
          {kycOk ? 'KYC vérifié' : 'KYC à compléter'}
        </button>
      </div>

      <div className="lux-card-gold p-5 sm:p-7 animate-cardIn" style={{ animationDelay: '60ms' }}>
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-[#9aa6b8]">
            <span className="text-amber-400"><IC.Wallet /></span> Solde disponible
          </p>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#2563eb] text-white">USDT</span>
        </div>
        <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
          <span className="lux-num text-3xl sm:text-4xl font-bold text-white"><AnimatedNumber value={balance} /></span>
          <span className="text-lg font-semibold text-[#7aa2ff]">USDT</span>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 font-semibold lux-num">
            <IC.ArrowUpRight /> +{fmtUsd(earned)} USDT
          </span>
          <span className="text-[#9aa6b8]">de gains cumulés</span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3">
          {actions.map(({ id, label, Icon, cls, chip }) => (
            <button
              key={label}
              onClick={() => onNavigate(id)}
              className={`lux-lift flex flex-col items-center justify-center gap-2 py-4 sm:py-5 rounded-2xl font-semibold text-sm border-none cursor-pointer ${cls}`}
            >
              <span className={`w-9 h-9 rounded-full flex items-center justify-center ${chip}`}><Icon /></span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard delay={120} Icon={IC.Layers}    tone="blue"   title="Capital engagé"   value={fmtUsd(summary?.invested, 0)} unit="USDT" sub={`Valeur : ${fmtUsd(summary?.currentValue, 0)} USDT`} />
        <StatCard delay={180} Icon={IC.Coin}      tone="green"  title="Gains réalisés"   value={`+${fmtUsd(earned)}`} unit="USDT" sub="Cumulés depuis l'ouverture" valueCls="text-emerald-400" />
        <StatCard delay={240} Icon={IC.Briefcase} tone="violet" title="Investissements"  value={stats?.activeInvestments ?? 0} unit={(stats?.activeInvestments ?? 0) > 1 ? 'packs' : 'pack'} sub="Actifs en ce moment" />
        <StatCard delay={300} Icon={IC.Percent}   tone="amber"  title="Rendement moyen"  value={fmtUsd(stats?.totalROI)} unit="%" sub="Sur le capital investi" />
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#e7ebf2]">Flux de trésorerie</h2>
            <p className="text-xs text-[#6f7c90] mt-0.5">Dépôts moins retraits, 6 derniers mois</p>
          </div>
        </div>
        <CashFlowChart transactions={transactions || []} />
      </Card>

      <div>
        <SectionTitle title="Investissements actifs" action="Tout voir" onAction={() => onNavigate('investments')} />
        {activeInvs.length === 0 ? (
          <Card className="p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-[#e7ebf2]">Aucun investissement en cours</p>
              <p className="text-sm text-[#9aa6b8] mt-0.5">Choisissez un pack pour faire travailler votre solde.</p>
            </div>
            <button onClick={() => onNavigate('invest')} className="lux-btn-amber">Voir les packs</button>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-3 sm:gap-4">
            {activeInvs.slice(0, 4).map(inv => {
              const start = new Date(inv.startDate || inv.createdAt).getTime();
              const end = inv.endDate ? new Date(inv.endDate).getTime() : start;
              const pct = end > start ? Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100)) : 100;
              const daysLeft = Math.max(0, Math.ceil((end - Date.now()) / 86400000));
              return (
                <Card key={inv._id} className="p-5 lux-card-hover">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-500/15 text-blue-300 shrink-0"><IC.TrendUp /></span>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#e7ebf2] truncate">{packDisplayName(inv.pack)}</p>
                        <p className="text-xs text-[#6f7c90]">Démarré le {new Date(inv.startDate || inv.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                    <span className="lux-pill bg-emerald-500/10 text-emerald-300 shrink-0">Actif</span>
                  </div>
                  <div className="flex justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs text-[#6f7c90]">Montant alloué</p>
                      <p className="lux-num font-semibold text-[#e7ebf2]">{fmtUsd(inv.amount)} USDT</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#6f7c90]">Échéance</p>
                      <p className="font-semibold text-[#e7ebf2]">{daysLeft === 0 ? "Aujourd'hui" : `Dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#9aa6b8]">Maturité</span>
                    <span className="text-emerald-400 font-medium">{Math.round(pct)} %</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#34d399] animate-growX" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-3 text-xs text-[#9aa6b8]">Gains à date : <span className="lux-num text-emerald-400 font-medium">+{fmtUsd(inv.earnings)} USDT</span></p>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <SectionTitle title="Opérations récentes" action="Historique" onAction={() => onNavigate('transactions')} />
        <Card className="divide-y divide-white/5">
          {recent.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-[#9aa6b8] mb-4">Aucune opération pour l'instant</p>
              <button onClick={() => onNavigate('wallet')} className="lux-btn-gold">Faire un premier dépôt</button>
            </div>
          ) : recent.map(tx => {
            const meta = OP_META[tx.type] || { label: tx.type, cls: 'bg-slate-500/20 text-slate-300', Icon: IC.Transactions };
            const [statusLabel, statusCls] = OP_STATUS[tx.status] || [tx.status, 'text-[#6f7c90]'];
            const network = tx.method?.startsWith('usdt-') ? ` (${tx.method.slice(5).toUpperCase()})` : '';
            const isOut = tx.amount < 0 || tx.type === 'investment' || tx.type === 'withdrawal';
            return (
              <div key={tx._id} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 transition-colors hover:bg-white/[0.02]">
                <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${meta.cls}`}><meta.Icon /></span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#e7ebf2] truncate">{meta.label}{network}</p>
                  <p className="text-xs text-[#6f7c90]">{new Date(tx.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {new Date(tx.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`lux-num font-semibold text-sm ${isOut ? 'text-[#e7ebf2]' : 'text-emerald-400'}`}>
                    {isOut ? '−' : '+'}{fmtUsd(Math.abs(tx.amount))} USDT
                  </p>
                  <p className={`text-xs font-medium ${statusCls}`}>{statusLabel}</p>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

function StatCard({ Icon, title, value, unit, sub, tone = 'blue', valueCls = 'text-[#e7ebf2]', delay = 0 }) {
  const chip = { blue: 'bg-blue-500/15 text-blue-300', green: 'bg-emerald-500/15 text-emerald-300', violet: 'bg-violet-500/15 text-violet-300', amber: 'bg-amber-500/15 text-amber-300' };
  return (
    <div style={{ animationDelay: `${delay}ms` }} className="lux-card lux-card-hover animate-cardIn p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs sm:text-sm font-medium text-[#9aa6b8]">{title}</p>
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${chip[tone]}`}><Icon /></span>
      </div>
      <p className="flex items-baseline gap-1.5 flex-wrap">
        <span className={`lux-num text-xl sm:text-2xl font-bold ${valueCls}`}>{value}</span>
        <span className="text-xs font-semibold text-[#9aa6b8]">{unit}</span>
      </p>
      {sub && <p className="text-xs text-[#6f7c90] mt-1.5">{sub}</p>}
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
      <div className="h-[180px] flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10">
        <p className="text-[#e7ebf2]/45 text-sm">Pas encore de mouvements à afficher</p>
        <p className="text-[#e7ebf2]/25 text-xs">Vos dépôts et retraits apparaîtront ici</p>
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
              <span className={`lux-num text-[10px] font-semibold mb-1.5 whitespace-nowrap ${m.net === 0 ? 'text-transparent' : isUp ? 'text-[#7aa2ff]' : 'text-rose-300'}`}>
                {m.net !== 0 ? `${isUp ? '+' : '−'}$${Math.abs(m.net) >= 1000 ? (Math.abs(m.net) / 1000).toFixed(1) + 'k' : Math.abs(m.net).toFixed(0)}` : '·'}
              </span>
              <div
                className={`animate-drawCandle w-full max-w-[42px] rounded-t-lg ${m.net === 0 ? 'bg-white/5' : isUp ? 'bg-gradient-to-t from-[#1d4ed8] to-[#60a5fa]' : 'bg-gradient-to-t from-rose-900/60 to-rose-400'}`}
                style={{ height: `${h}px`, animationDelay: `${i * 70}ms` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-3 border-t border-white/5 pt-3">
        {months.map(m => (
          <span key={m.key} className="flex-1 text-center text-[11px] text-[#e7ebf2]/40 capitalize">{m.label.replace('.', '')}</span>
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
                  <h3 className="lux-serif text-2xl font-bold lux-gold-text">{packDisplayName(inv.pack)}</h3>
                  <p className="text-xs text-[#e7ebf2]/50 mt-0.5">
                    Créé le {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Badge status={inv.status} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Montant',    value: `$ ${inv.amount}`,     cls: 'text-[#e7ebf2]' },
                  { label: 'ROI actuel', value: `+${inv.roi} %`, cls: 'text-emerald-300' },
                  { label: 'Gains',      value: `$ ${inv.earnings}`,   cls: 'text-[#fbbf24]' },
                  { label: 'Échéance',   value: inv.endDate ? new Date(inv.endDate).toLocaleDateString('fr-FR') : '—', cls: 'text-[#e7ebf2]' },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="rounded-xl bg-white/[0.02] border border-white/5 px-3.5 py-3">
                    <p className="lux-label !text-[10px] mb-1.5">{label}</p>
                    <p className={`lux-num font-medium text-base ${cls}`}>{value}</p>
                  </div>
                ))}
              </div>

              {inv.status === 'active' && (
                <div className="mt-5 pt-5 border-t border-white/10">
                  {confirmingId === inv._id ? (
                    <div className="bg-yellow-900/10 border border-yellow-700/30 rounded p-4">
                      <p className="text-sm text-[#e7ebf2]/80 mb-1">
                        Clôturer maintenant vous rendra <span className="text-yellow-500 font-bold">$ {(Number(inv.amount) + Number(inv.earnings)).toFixed(2)}</span> sur
                        votre solde (capital $ {inv.amount} + gains accumulés à ce jour $ {inv.earnings}).
                      </p>
                      <p className="text-xs text-[#e7ebf2]/50 mb-4">
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
                      className="text-xs text-[#e7ebf2]/50 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer underline"
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
          <p className="text-[#e7ebf2]/50">Aucun investissement sur cette période</p>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-[#e7ebf2]/50 mb-5">Aucun investissement pour le moment</p>
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
        <label className="flex items-center gap-2 text-xs text-[#e7ebf2]/60 cursor-pointer select-none">
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
                    <td className="text-sm text-[#e7ebf2]/60">
                      {new Date(tx.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td><Badge status={tx.type} /></td>
                    <td className={`text-sm font-medium lux-num ${tx.amount < 0 ? 'text-rose-300' : 'text-[#e7ebf2]'}`}>
                      {tx.amount < 0 ? '−' : ''}$ {Math.abs(tx.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td><Badge status={tx.status} /></td>
                    <td className="text-right">
                      <button
                        onClick={() => toggleHide(tx)}
                        disabled={busyId === tx._id}
                        className="text-xs text-[#e7ebf2]/50 hover:text-yellow-500 bg-transparent border-none cursor-pointer disabled:opacity-40"
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
          <p className="text-[#e7ebf2]/50 text-sm">
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
                <span className="font-medium text-[#e7ebf2] text-sm group-hover:text-[#fbbf24] transition-colors">{f.question}</span>
                <span className={`lux-icon-chip !w-7 !h-7 shrink-0 transition-transform duration-300 ${openId === f._id ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openId === f._id && (
                <div className="px-5 pb-5 text-sm leading-relaxed text-[#e7ebf2]/60 whitespace-pre-wrap border-t border-white/5 pt-4">{f.answer}</div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-[#e7ebf2]/50 text-sm">
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
        <h3 className="lux-serif text-2xl font-bold text-[#e7ebf2] mb-4">Sessions actives</h3>
        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
          <div>
            <p className="font-semibold text-white text-sm">Session actuelle</p>
            <p className="text-xs text-[#e7ebf2]/50 mt-0.5">Dernière activité : maintenant</p>
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
      <h3 className="lux-serif text-2xl font-bold text-rose-300 mb-2">Supprimer mon compte</h3>

      {success && <div className="mb-4 p-3 bg-green-900/40 border border-green-500/50 rounded text-green-300 text-sm">{success}</div>}
      {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-500/50 rounded text-red-300 text-sm">{error}</div>}

      {pendingRequest ? (
        <div className="space-y-3">
          <p className="text-sm text-[#e7ebf2]/60">
            Votre demande de suppression a été envoyée le {new Date(pendingRequest.requestedAt).toLocaleDateString('fr-FR')} et attend la validation d'un administrateur.
          </p>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 border border-white/10 text-[#e7ebf2]/60 hover:border-yellow-600/50 hover:text-yellow-400 text-sm rounded bg-transparent cursor-pointer disabled:opacity-50"
          >
            Annuler ma demande
          </button>
        </div>
      ) : !confirming ? (
        <div>
          <p className="text-sm text-[#e7ebf2]/50 mb-4">
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
            <label className="block lux-label mb-2">Motif <span className="text-[#e7ebf2]/35 font-normal normal-case">(optionnel)</span></label>
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
              className="px-4 py-2 border border-white/10 text-[#e7ebf2]/60 hover:border-yellow-600/50 hover:text-yellow-400 text-sm rounded bg-transparent cursor-pointer"
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
      <h3 className="lux-serif text-2xl font-bold text-[#e7ebf2] mb-5">
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
            <div className="w-20 h-20 rounded-full p-[2px] bg-white"><div className="w-full h-full rounded-full bg-[#141b26] overflow-hidden flex items-center justify-center">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="lux-serif text-3xl font-bold lux-gold-text">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
              )}
            </div></div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer bg-[#fbbf24] hover:brightness-110 ring-2 ring-[#0b1018] transition">
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
                <button type="button" onClick={copyUserId} className="text-xs text-[#e7ebf2]/50 hover:text-yellow-500 bg-transparent border-none cursor-pointer">
                  {copied ? '✓ Copié' : 'Copier'}
                </button>
              )}
            </div>
            <p className="text-xs text-[#e7ebf2]/35 mt-1">
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
            <p className="mt-1.5 text-xs text-[#e7ebf2]/35">L'adresse email ne peut pas être modifiée</p>
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