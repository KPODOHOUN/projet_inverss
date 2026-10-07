import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import useForceDarkMode from '../hooks/useForceDarkMode';
import { packDisplayName, PACK_NAMES } from '../utils/packNames';
import { tierOf } from '../utils/packTiers';

const INVESTMENT_PACK_KEYS = Object.keys(PACK_NAMES).filter(k => k !== 'turbo48h');
const TIER_COLOR = { bronze: 'gray', silver: 'blue', gold: 'yellow', platinum: 'purple', diamond: 'green' };

export default function AdminDashboard() {
  useForceDarkMode();
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'superadmin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navSections = [
    {
      label: 'PRINCIPAL',
      items: [
        { id: 'overview',      icon: '⬛', label: 'Vue d\'ensemble' },
        { id: 'analytics',     icon: '📊', label: 'Analytics' },
      ]
    },
    {
      label: 'UTILISATEURS',
      items: [
        { id: 'users',         icon: '👥', label: 'Utilisateurs' },
        { id: 'kyc',           icon: '🆔', label: 'Vérification KYC' },
        { id: 'referrals',     icon: '🔗', label: 'Parrainage' },
        { id: 'ambassadors',   icon: '🌟', label: 'Ambassadeurs' },
      ]
    },
    {
      label: 'FINANCE',
      items: [
        { id: 'investments',   icon: '💼', label: 'Investissements' },
        { id: 'transactions',  icon: '💳', label: 'Dépôts & Retraits' },
      ]
    },
    {
      label: 'MODULES',
      items: [
        { id: 'academy',       icon: '🎓', label: 'Académie' },
        { id: 'trading',       icon: '📈', label: 'Trading' },
        { id: 'faq',           icon: '❓', label: "Centre d'aide" },
      ]
    },
    {
      label: 'OUTILS',
      items: [
        { id: 'config',        icon: '⚙️', label: 'Configuration' },
        { id: 'logs',          icon: '🔒', label: 'Sécurité & Logs' },
        { id: 'reports',       icon: '📋', label: 'Rapports' },
      ]
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':      return <OverviewTab api={api} onNavigate={setActiveTab} />;
      case 'analytics':     return <AnalyticsTab api={api} />;
      case 'users':         return <UsersTab api={api} />;
      case 'kyc':           return <KYCTab api={api} />;
      case 'referrals':     return <ReferralsTab api={api} />;
      case 'ambassadors':   return <AmbassadorsTab api={api} />;
      case 'investments':   return <InvestmentsTab api={api} />;
      case 'transactions':  return <TransactionsTab api={api} />;
      case 'academy':       return <AcademyTab api={api} />;
      case 'faq':           return <FAQAdminTab api={api} />;
      case 'trading':       return <TradingTab api={api} />;
      case 'config':        return <ConfigTab api={api} />;
      case 'logs':          return <LogsTab api={api} />;
      case 'reports':       return <ReportsTab api={api} />;
      default:              return <OverviewTab api={api} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="dash-scope min-h-screen bg-black text-white" style={{ fontFamily: "'Courier New', monospace" }}>
      
      {}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b-2 border-yellow-500 h-12 sm:h-14 flex items-center px-3 sm:px-4 justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-yellow-500 hover:text-white transition-colors">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <img src="/logo-on-dark.png" alt="IMC Corporation" className="h-5 sm:h-7 w-auto object-contain" />
            <span className="px-1.5 sm:px-2 py-0.5 bg-yellow-500 text-black text-[10px] sm:text-xs font-black tracking-widest rounded-full">ADMIN</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Système opérationnel</span>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-yellow-500 uppercase tracking-widest">{user?.role || 'Admin'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 border border-yellow-500 rounded text-yellow-500 text-[10px] sm:text-xs font-bold hover:bg-yellow-500 hover:text-black transition-all tracking-widest"
          >
            SORTIR
          </button>
        </div>
      </header>

      {}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex pt-12 sm:pt-14">
        {}
        <aside className={`
          fixed lg:static top-12 sm:top-14 left-0 h-[calc(100vh-3rem)] sm:h-[calc(100vh-3.5rem)] w-60 z-40 lg:z-auto
          bg-black border-r border-yellow-900/40
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          transition-transform duration-200
          overflow-y-auto flex-shrink-0
        `}>
          <nav className="p-3 space-y-4">
            {navSections.map(section => (
              <div key={section.label}>
                <p className="text-xs text-yellow-900 font-black tracking-widest mb-1 px-2">{section.label}</p>
                {section.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold tracking-wide transition-all flex items-center gap-2 ${
                      activeTab === item.id
                        ? 'bg-yellow-500 text-black'
                        : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-900/10'
                    }`}
                  >
                    <span className="text-sm">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {}
        <main className="flex-1 min-w-0 p-4 sm:p-6 overflow-auto min-h-[calc(100vh-3.5rem)]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-lg sm:text-2xl font-black tracking-wider text-white">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-1 tracking-wide">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

function KPICard({ label, value, sub, color = 'yellow', icon, trend }) {
  const colors = {
    yellow: 'border-yellow-500 text-yellow-400',
    green:  'border-green-500 text-green-400',
    blue:   'border-blue-500 text-blue-400',
    red:    'border-red-500 text-red-400',
    purple: 'border-purple-500 text-purple-400',
  };
  return (
    <div className={`bg-black border ${colors[color]} rounded-lg p-4 relative overflow-hidden`}>
      <div className="absolute top-2 right-3 text-2xl opacity-20">{icon}</div>
      <p className="text-xs text-gray-500 tracking-widest uppercase mb-1">{label}</p>
      <p className={`text-xl font-black tracking-tight ${colors[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
      {trend !== undefined && (
        <p className={`text-xs font-bold mt-2 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs mois dernier
        </p>
      )}
    </div>
  );
}

function AdminTable({ columns, data, onAction, emptyMsg = 'Aucune donnée' }) {
  if (!data || data.length === 0) {
    return (
      <div className="border border-yellow-900/30 rounded-lg p-6 text-center">
        <p className="text-gray-600 text-sm tracking-wide">{emptyMsg}</p>
      </div>
    );
  }
  return (
    <div className="border border-yellow-900/30 rounded-lg overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-yellow-500/10 border-b border-yellow-900/30">
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 text-left text-yellow-500 font-black tracking-widest uppercase">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-yellow-900/10 hover:bg-yellow-900/5 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-gray-300">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ label, color = 'yellow' }) {
  const c = {
    yellow: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
    green:  'bg-green-900/40 text-green-400 border-green-800',
    red:    'bg-red-900/40 text-red-400 border-red-800',
    blue:   'bg-blue-900/40 text-blue-400 border-blue-800',
    gray:   'bg-gray-800 text-gray-400 border-gray-700',
    purple: 'bg-purple-900/40 text-purple-400 border-purple-800',
  };
  return (
    <span className={`px-2 py-0.5 border rounded-full text-xs font-black tracking-widest uppercase ${c[color]}`}>
      {label}
    </span>
  );
}

function AdminBtn({ children, onClick, color = 'yellow', size = 'sm', disabled }) {
  const c = {
    yellow: 'border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black',
    green:  'border-green-500 text-green-500 hover:bg-green-500 hover:text-black',
    red:    'border-red-500 text-red-500 hover:bg-red-500 hover:text-white',
    gray:   'border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white',
    blue:   'border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white',
  };
  const s = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-sm' };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`border rounded font-black tracking-widest transition-all ${c[color]} ${s[size]} disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/90" />
      <div
        className="relative bg-black border-2 border-yellow-500 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black tracking-wider text-yellow-500">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ open, onClose, onConfirm, title, message, danger }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-gray-400 text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <AdminBtn color={danger ? 'red' : 'yellow'} size="md" onClick={onConfirm}>CONFIRMER</AdminBtn>
        <AdminBtn color="gray" size="md" onClick={onClose}>ANNULER</AdminBtn>
      </div>
    </Modal>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder, disabled, hint }) {
  return (
    <div>
      {label && <label className="block text-xs font-black text-yellow-500 tracking-widest mb-1">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 bg-black border border-yellow-900/40 rounded text-white text-sm focus:border-yellow-500 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
      />
      {hint && <p className="text-xs text-gray-600 mt-1">{hint}</p>}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      {label && <label className="block text-xs font-black text-yellow-500 tracking-widest mb-1">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-black border border-yellow-900/40 rounded text-white text-sm focus:border-yellow-500 focus:outline-none"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 4, placeholder }) {
  return (
    <div>
      {label && <label className="block text-xs font-black text-yellow-500 tracking-widest mb-1">{label}</label>}
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-black border border-yellow-900/40 rounded text-white text-sm focus:border-yellow-500 focus:outline-none resize-none"
      />
    </div>
  );
}

function Alert({ type = 'info', children }) {
  const c = {
    info:    'border-blue-800 bg-blue-900/20 text-blue-300',
    success: 'border-green-800 bg-green-900/20 text-green-300',
    warning: 'border-yellow-800 bg-yellow-900/20 text-yellow-300',
    error:   'border-red-800 bg-red-900/20 text-red-300',
  };
  return (
    <div className={`border rounded p-3 text-xs ${c[type]}`}>{children}</div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="border-2 border-yellow-500 border-t-transparent w-8 h-8 rounded-full animate-spin" />
    </div>
  );
}

function PaginationBar({ page, pages, total, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
      <span>{total.toLocaleString('fr-FR')} résultat{total > 1 ? 's' : ''} — page {page}/{pages}</span>
      <div className="flex gap-2">
        <AdminBtn size="sm" color="gray" disabled={page <= 1} onClick={() => onPage(page - 1)}>← Précédent</AdminBtn>
        <AdminBtn size="sm" color="gray" disabled={page >= pages} onClick={() => onPage(page + 1)}>Suivant →</AdminBtn>
      </div>
    </div>
  );
}

function SectionBox({ title, children, action }) {
  return (
    <div className="border border-yellow-900/30 rounded-lg mb-6">
      <div className="flex items-center justify-between px-4 py-3 border-b border-yellow-900/30 bg-yellow-500/5">
        <h3 className="text-xs font-black text-yellow-500 tracking-widest uppercase">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function BarChart({ data, height = 120 }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-yellow-500/60 hover:bg-yellow-500 transition-all"
            style={{ height: `${(d.value / max) * (height - 20)}px` }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="text-xs text-gray-600 truncate w-full text-center" style={{ fontSize: '9px' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function OverviewTab({ api, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setError('');
    try {
      const [statsRes, alertsRes, activityRes] = await Promise.allSettled([
        api.get('/admin/stats/overview'),
        api.get('/admin/alerts'),
        api.get('/admin/activity/recent'),
      ]);
      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        setStats(statsRes.value.data.data);
      } else {
        setStats(null);
        setError('Impossible de charger les statistiques');
      }
      if (alertsRes.status === 'fulfilled' && alertsRes.value.data.success) {
        setAlerts(alertsRes.value.data.data.alerts || []);
      } else {
        setAlerts([]);
      }
      if (activityRes.status === 'fulfilled' && activityRes.value.data.success) {
        setRecentActivity(activityRes.value.data.data.activities || []);
      } else {
        setRecentActivity([]);
      }
    } catch (e) {
      console.error(e);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    totalUsers: stats?.totalUsers ?? 0,
    newUsersToday: stats?.newUsersToday ?? 0,
    totalInvested: stats?.totalInvested ?? 0,
    totalInvestedChange: stats?.totalInvestedChange ?? 0,
    totalUserBalances: stats?.totalUserBalances ?? 0,
    revenue: stats?.revenue ?? 0,
    revenueChange: stats?.revenueChange ?? 0,
    totalDeposits: stats?.totalDeposits ?? 0,
    totalWithdrawals: stats?.totalWithdrawals ?? 0,
    pendingKyc: stats?.pendingKyc ?? 0,
    pendingTransactions: stats?.pendingTransactions ?? 0,
    pendingWithdrawals: stats?.pendingWithdrawals ?? 0,
    activeInvestments: stats?.activeInvestments ?? 0,
    trading: stats?.trading ?? { totalPositions: 0, openPositions: 0, totalVolume: 0, totalPayout: 0 },
    signups7d: stats?.signups7d ?? [],
    packDistribution: stats?.packDistribution ?? [],
  };

  const levelColors = { info: 'blue', warning: 'yellow', critical: 'red' };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="VUE D'ENSEMBLE"
        subtitle="Tableau de bord administrateur IMC"
        actions={<AdminBtn onClick={fetchData}>↻ ACTUALISER</AdminBtn>}
      />

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

      {}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center justify-between border border-yellow-800 bg-yellow-900/10 rounded px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-sm">⚠</span>
                <span className="text-xs text-yellow-300">{a.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <KPICard label="Utilisateurs" value={s.totalUsers.toLocaleString()} sub={`+${s.newUsersToday} aujourd'hui`} color="yellow" icon="👥" />
        <KPICard label="Total Investi" value={`$${(s.totalInvested / 1000).toFixed(0)}k`} sub="Tous les packs" color="green" icon="💰" trend={s.totalInvestedChange} />
        <KPICard label="Revenus" value={`$${s.revenue.toLocaleString()}`} sub="Frais plateforme" color="purple" icon="📈" trend={s.revenueChange} />
        <KPICard label="Investissements" value={s.activeInvestments} sub="Packs actifs" color="yellow" icon="💼" />
      </div>

      {}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <KPICard label="Solde global plateforme" value={`$${s.totalUserBalances.toLocaleString()}`} sub="Argent détenu — tous comptes" color="green" icon="🏦" />
        <KPICard label="Total Dépôts" value={`$${s.totalDeposits.toLocaleString()}`} sub="Approuvés, cumulés" color="green" icon="⬇️" />
        <KPICard label="Total Retraits" value={`$${s.totalWithdrawals.toLocaleString()}`} sub="Terminés, cumulés" color="red" icon="⬆️" />
        <KPICard label="En attente" value={s.pendingTransactions} sub={`dont ${s.pendingWithdrawals} retrait(s)`} color="yellow" icon="⏳" />
        <KPICard label="Trading" value={s.trading.openPositions} sub={`${s.trading.totalPositions} position(s) au total`} color="purple" icon="📈" />
      </div>

      {}
      <div className="grid lg:grid-cols-3 gap-4">
        {}
        <SectionBox title="Inscriptions — 7 jours">
          {s.signups7d.length > 0 ? (
            <BarChart data={s.signups7d} />
          ) : (
            <p className="text-gray-600 text-xs text-center py-8">Aucune donnée</p>
          )}
        </SectionBox>

        {}
        <SectionBox title="Répartition des Packs">
          {s.packDistribution.length > 0 ? (
            <div className="space-y-2">
              {s.packDistribution.map(p => (
                <div key={p.pack}>
                  <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                    <span>{packDisplayName(p.pack)}</span><span className="text-yellow-500 font-bold">{p.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-900">
                    <div className="h-full bg-yellow-500" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-xs text-center py-8">Aucune donnée</p>
          )}
        </SectionBox>

        {}
        <SectionBox title="Activité Récente">
          {recentActivity.length === 0 ? (
            <p className="text-gray-600 text-xs text-center py-8">Aucune activité récente</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.slice(0, 10).map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Badge label={(a.level || 'info').toUpperCase()} color={levelColors[a.level] || 'gray'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 truncate">{a.action}</p>
                    <p className="text-gray-600">{a.target} · {a.createdAt ? new Date(a.createdAt).toLocaleString('fr-FR') : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionBox>
      </div>

      {}
      <SectionBox title="Actions Rapides" >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'VÉRIFIER KYC', tab: 'kyc', color: 'yellow', badge: s.pendingKyc },
            { label: 'RETRAITS', tab: 'transactions', color: 'green', badge: s.pendingWithdrawals },
            { label: 'AJOUTER UTILISATEUR', tab: 'users', color: 'blue' },
            { label: 'RAPPORT', tab: 'reports', color: 'gray' },
          ].map(a => (
            <button
              key={a.tab}
              onClick={() => onNavigate(a.tab)}
              className={`relative border border-${a.color}-500/50 hover:border-${a.color}-500 rounded p-3 text-xs font-black tracking-widest text-${a.color}-400 hover:bg-${a.color}-900/20 transition-all text-left`}
            >
              {a.label}
              {a.badge > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center font-black rounded-full">
                  {a.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </SectionBox>
    </div>
  );
}

function AnalyticsTab({ api }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/admin/stats/overview').then(r => {
      if (r.data.success) setStats(r.data.data);
      else { setStats(null); setError('Impossible de charger les statistiques'); }
    }).catch(() => { setStats(null); setError('Impossible de charger les statistiques'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const s = stats || {};
  const conversionRate = s.totalUsers ? ((s.activeInvestments || 0) / s.totalUsers * 100) : 0;

  return (
    <div>
      <PageHeader
        title="ANALYTICS"
        subtitle="Performance et métriques de la plateforme (données réelles)"
      />

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KPICard label="Total Investi" value={`$${((s.totalInvested || 0) / 1000).toFixed(0)}k`} color="yellow" trend={s.totalInvestedChange} />
        <KPICard label="Volume Dépôts" value={`$${((s.totalDeposits || 0) / 1000).toFixed(0)}k`} color="green" />
        <KPICard label="Volume Retraits" value={`$${((s.totalWithdrawals || 0) / 1000).toFixed(0)}k`} color="blue" />
        <KPICard label="Taux Conversion" value={`${conversionRate.toFixed(1)}%`} sub="Investissements actifs / inscrits" color="purple" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <SectionBox title="Inscriptions — 7 jours">
          {(s.signups7d || []).length > 0 ? (
            <BarChart data={s.signups7d} height={150} />
          ) : <p className="text-gray-600 text-xs text-center py-8">Aucune donnée</p>}
        </SectionBox>
        <SectionBox title="Répartition des Packs">
          {(s.packDistribution || []).length > 0 ? (
            <div className="space-y-3">
              {s.packDistribution.map(p => (
                <div key={p.pack}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{packDisplayName(p.pack)}</span>
                    <span className="text-yellow-400 font-bold">{p.count} ({p.pct}%)</span>
                  </div>
                  <div className="h-1 bg-gray-900">
                    <div className="h-full bg-yellow-500" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-600 text-xs text-center py-8">Aucune donnée</p>}
        </SectionBox>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <SectionBox title="Revenus">
          <div className="space-y-3">
            <div className="flex justify-between text-xs border-b border-yellow-900/10 pb-2">
              <span className="text-gray-500">Revenus (frais collectés)</span>
              <span className="font-bold text-green-400">${(s.revenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs border-b border-yellow-900/10 pb-2">
              <span className="text-gray-500">Variation vs mois dernier</span>
              <span className={`font-bold ${(s.revenueChange || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{s.revenueChange || 0}%</span>
            </div>
          </div>
        </SectionBox>

        <SectionBox title="Analytics Avancées">
          {/* TODO backend: comptes KYC vérifiés (User.countDocuments({kycStatus:'verified'})) et comptes 2FA (User.countDocuments({twoFactorEnabled:true})) nécessiteraient un petit ajout côté backend */}
          <p className="text-gray-600 text-xs">Analytics avancées (rétention, géographie, session) à venir — non trackées actuellement côté plateforme.</p>
        </SectionBox>
      </div>
    </div>
  );
}

function UsersTab({ api }) {
  const [users, setUsers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKYC, setFilterKYC] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const PER_PAGE = 20;

  // Filtering and pagination happen server-side — with up to a million
  // users, fetching the whole collection to filter it in the browser isn't
  // an option. The search box is debounced so it doesn't fire a request per
  // keystroke.
  useEffect(() => {
    const t = setTimeout(fetchUsers, search ? 350 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, filterKYC, filterStatus, filterPeriod]);

  const fetchUsers = async () => {
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE), kycStatus: filterKYC, status: filterStatus, period: filterPeriod });
      if (search.trim()) params.set('search', search.trim());
      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.data.users || []);
        setTotal(res.data.data.total || 0);
        setPages(res.data.data.pages || 1);
      } else {
        setUsers([]);
        setError('Impossible de charger les utilisateurs');
      }
    } catch (e) {
      setUsers([]);
      setError('Impossible de charger les utilisateurs');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAction = async (action, userId) => {
    setActionError('');
    try {
      await api.post(`/admin/users/${userId}/${action}`);
      fetchUsers();
    } catch (e) {
      setActionError(e.response?.data?.message || 'Erreur lors de l\'action');
    }
    setConfirmAction(null);
  };

  const kycColors = { verified: 'green', pending: 'yellow', rejected: 'red', none: 'gray' };
  const kycLabels = { verified: 'VÉRIFIÉ', pending: 'EN ATTENTE', rejected: 'REJETÉ', none: 'AUCUN' };

  if (initialLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="GESTION UTILISATEURS"
        subtitle={`${total.toLocaleString('fr-FR')} utilisateurs enregistrés`}
        actions={<AdminBtn color="yellow" onClick={() => setShowAddModal(true)}>+ AJOUTER</AdminBtn>}
      />

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}
      {actionError && <div className="mb-4"><Alert type="error">{actionError}</Alert></div>}

      {}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        <Input placeholder="Rechercher (nom, email, ID utilisateur)..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <Select value={filterKYC} onChange={e => { setFilterKYC(e.target.value); setPage(1); }} options={[
          { value: 'all', label: 'KYC: Tous' },
          { value: 'none', label: 'KYC: Aucun' },
          { value: 'pending', label: 'KYC: En attente' },
          { value: 'verified', label: 'KYC: Vérifié' },
          { value: 'rejected', label: 'KYC: Rejeté' },
        ]} />
        <Select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} options={[
          { value: 'all', label: 'Statut: Tous' },
          { value: 'active', label: 'Actif' },
          { value: 'suspended', label: 'Suspendu' },
        ]} />
        <Select value={filterPeriod} onChange={e => { setFilterPeriod(e.target.value); setPage(1); }} options={[
          { value: 'all', label: 'Inscription: Toute période' },
          { value: 'today', label: "Aujourd'hui" },
          { value: 'week', label: 'Cette semaine' },
          { value: 'month', label: 'Ce mois' },
        ]} />
        <div className="text-xs text-gray-500 flex items-center">{total.toLocaleString('fr-FR')} résultat(s)</div>
      </div>

      <AdminTable
        columns={[
          { key: 'name', label: 'Utilisateur', render: (_, r) => (
            <div>
              <p className="font-bold text-white">{r.firstName} {r.lastName}</p>
              <p className="text-gray-600">{r.email}</p>
              {r.userId && <p className="text-gray-700 font-mono text-[11px] mt-0.5">{r.userId}</p>}
            </div>
          )},
          { key: 'kycStatus', label: 'KYC', render: v => <Badge label={kycLabels[v] || v} color={kycColors[v] || 'gray'} /> },
          { key: 'role', label: 'Rôle', render: v => <Badge label={v?.toUpperCase()} color={(v === 'admin' || v === 'superadmin') ? 'red' : v === 'moderator' ? 'blue' : v === 'vip' ? 'purple' : 'gray'} /> },
          { key: 'balance', label: 'Solde $', render: (_, r) => <span className="text-yellow-400 font-bold">${r.balance?.toFixed(2)}</span> },
          { key: 'status', label: 'Statut', render: v => <Badge label={v === 'active' ? 'ACTIF' : 'SUSPENDU'} color={v === 'active' ? 'green' : 'red'} /> },
          { key: 'actions', label: 'Actions', render: (_, r) => (
            <div className="flex gap-1 flex-wrap">
              <AdminBtn size="sm" onClick={() => { setSelectedUser(r); setShowUserModal(true); }}>VOIR</AdminBtn>
              {r.status === 'active'
                ? <AdminBtn size="sm" color="red" onClick={() => setConfirmAction({ action: 'suspend', userId: r.id, label: `Suspendre ${r.firstName}?` })}>SUSPENDRE</AdminBtn>
                : <AdminBtn size="sm" color="green" onClick={() => handleAction('activate', r.id)}>ACTIVER</AdminBtn>
              }
            </div>
          )},
        ]}
        data={users}
        emptyMsg="Aucun utilisateur trouvé"
      />

      <PaginationBar page={page} pages={pages} total={total} onPage={setPage} />

      {}
      <Modal open={showUserModal} onClose={() => setShowUserModal(false)} title={`${selectedUser?.firstName} ${selectedUser?.lastName}`}>
        {selectedUser && <UserDetailPanel user={selectedUser} api={api} onClose={() => setShowUserModal(false)} onRefresh={fetchUsers} />}
      </Modal>

      {}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="AJOUTER UN UTILISATEUR">
        <AddUserForm api={api} onClose={() => setShowAddModal(false)} onSuccess={fetchUsers} />
      </Modal>

      {}
      <ConfirmModal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleAction(confirmAction?.action, confirmAction?.userId)}
        title="CONFIRMER L'ACTION"
        message={confirmAction?.label}
        danger
      />
    </div>
  );
}

function UserDetailPanel({ user, api, onClose, onRefresh }) {
  const [balanceAdj, setBalanceAdj] = useState('');
  const [balanceNote, setBalanceNote] = useState('');
  const [newRole, setNewRole] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  const adjustBalance = async () => {
    if (!balanceAdj || !balanceNote) return;
    setLoading(true);
    try {
      await api.post(`/admin/users/${user.id}/adjust-balance`, {
        amount: parseFloat(balanceAdj),
        note: balanceNote
      });
      setMsg('Solde ajusté !');
      setMsgType('success');
      onRefresh();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Erreur lors de l\'ajustement');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async () => {
    setLoading(true);
    try {
      await api.put(`/admin/users/${user.id}/role`, { role: newRole });
      setMsg('Rôle mis à jour !');
      setMsgType('success');
      onRefresh();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Erreur lors du changement de rôle');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {msg && <Alert type={msgType}>{msg}</Alert>}

      <div className="grid grid-cols-2 gap-3 text-xs">
        {[
          ['ID utilisateur', user.userId || '—'],
          ['Email', user.email],
          ['Membre depuis', new Date(user.createdAt).toLocaleDateString('fr-FR')],
          ['Solde $', `$${user.balance?.toFixed(2)}`],
          ['KYC', user.kycStatus],
          ['2FA', user.twoFactorEnabled ? 'Activé' : 'Désactivé'],
          ['Investissements actifs', user.activeInvestments],
          ['Statut', user.status],
        ].map(([k, v]) => (
          <div key={k} className="border border-yellow-900/20 rounded p-2">
            <p className="text-gray-600">{k}</p>
            <p className="text-white font-bold">{v}</p>
          </div>
        ))}
      </div>

      <SectionBox title="Ajuster le Solde $">
        <div className="space-y-2">
          <Input label="Montant (+ ou -)" value={balanceAdj} onChange={e => setBalanceAdj(e.target.value)} type="number" placeholder="Ex: 100 ou -50" />
          <Input label="Raison (obligatoire)" value={balanceNote} onChange={e => setBalanceNote(e.target.value)} placeholder="Ex: Remboursement erreur" />
          <AdminBtn onClick={adjustBalance} disabled={loading || !balanceAdj || !balanceNote}>APPLIQUER</AdminBtn>
        </div>
      </SectionBox>

      <SectionBox title="Changer le Rôle">
        <div className="flex gap-2">
          <Select value={newRole} onChange={e => setNewRole(e.target.value)} options={[
            { value: 'standard', label: 'Standard' },
            { value: 'vip', label: 'VIP' },
            { value: 'moderator', label: 'Modérateur' },
            { value: 'admin', label: 'Admin' },
          ]} />
          <AdminBtn onClick={changeRole} disabled={loading}>SAUVER</AdminBtn>
        </div>
      </SectionBox>
    </div>
  );
}

function AddUserForm({ api, onClose, onSuccess }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'standard' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/admin/users/create', form);
      onSuccess();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && <Alert type="error">{error}</Alert>}
      <div className="grid grid-cols-2 gap-3">
        <Input label="Prénom" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
        <Input label="Nom" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
      </div>
      <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <Input label="Mot de passe" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
      <Input label="Téléphone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
      <Select label="Rôle" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} options={[
        { value: 'standard', label: 'Standard' },
        { value: 'vip', label: 'VIP' },
        { value: 'moderator', label: 'Modérateur' },
        { value: 'admin', label: 'Admin' },
      ]} />
      <div className="flex gap-2 pt-2">
        <AdminBtn size="md" onClick={handleSubmit} disabled={loading}>{loading ? 'CRÉATION...' : 'CRÉER'}</AdminBtn>
        <AdminBtn size="md" color="gray" onClick={onClose}>ANNULER</AdminBtn>
      </div>
    </div>
  );
}

function KYCTab({ api }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filter, setFilter] = useState('pending');
  const [period, setPeriod] = useState('all');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [idDocSrc, setIdDocSrc] = useState(null);
  const [selfieSrc, setSelfieSrc] = useState(null);

  useEffect(() => { fetchKYC(); }, [filter, period]);

  const fetchKYC = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/admin/kyc?status=${filter}&period=${period}`);
      if (res.data.success) setItems(res.data.data.kycs || []);
      else { setItems([]); setError('Impossible de charger les KYC'); }
    } catch {
      setItems([]);
      setError('Impossible de charger les KYC');
    } finally {
      setLoading(false);
    }
  };

  const userName = (item) => item ? `${item.userId?.firstName || ''} ${item.userId?.lastName || ''}`.trim() : '';

  useEffect(() => {
    let idUrl = null;
    let selfieUrl = null;
    setIdDocSrc(null);
    setSelfieSrc(null);
    if (!selected) return;
    const load = async () => {
      if (selected.idDocumentUrl) {
        try {
          const res = await api.get(`/kyc/document/${selected.id}/idDocument`, { responseType: 'blob' });
          idUrl = URL.createObjectURL(res.data);
          setIdDocSrc(idUrl);
        } catch { setIdDocSrc(null); }
      }
      if (selected.selfieUrl) {
        try {
          const res = await api.get(`/kyc/document/${selected.id}/selfie`, { responseType: 'blob' });
          selfieUrl = URL.createObjectURL(res.data);
          setSelfieSrc(selfieUrl);
        } catch { setSelfieSrc(null); }
      }
    };
    load();
    return () => {
      if (idUrl) URL.revokeObjectURL(idUrl);
      if (selfieUrl) URL.revokeObjectURL(selfieUrl);
    };
  }, [selected]);

  const handleApprove = async (kycId) => {
    setProcessing(true);
    try {
      await api.post(`/admin/kyc/${kycId}/approve`);
      fetchKYC();
      setSelected(null);
    } catch (e) { console.error(e); }
    finally { setProcessing(false); }
  };

  const handleReject = async (kycId) => {
    if (!rejectReason) return;
    setProcessing(true);
    try {
      await api.post(`/admin/kyc/${kycId}/reject`, { reason: rejectReason });
      fetchKYC();
      setSelected(null);
      setRejectReason('');
    } catch (e) { console.error(e); }
    finally { setProcessing(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="VÉRIFICATION KYC"
        subtitle={`${items.filter(i => i.status === 'pending').length} en attente`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Select value={filter} onChange={e => setFilter(e.target.value)} options={[
              { value: 'pending', label: 'En attente' },
              { value: 'verified', label: 'Approuvés' },
              { value: 'rejected', label: 'Rejetés' },
            ]} />
            <Select value={period} onChange={e => setPeriod(e.target.value)} options={[
              { value: 'all', label: 'Toute période' },
              { value: 'today', label: "Aujourd'hui" },
              { value: 'week', label: 'Cette semaine' },
              { value: 'month', label: 'Ce mois' },
            ]} />
          </div>
        }
      />

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

      <div className="grid lg:grid-cols-2 gap-4">
        {}
        <div className="space-y-2">
          {items.length === 0 && <Alert type="info">Aucune vérification KYC {filter === 'pending' ? 'en attente' : filter === 'verified' ? 'approuvée' : 'rejetée'}</Alert>}
          {items.map(item => (
            <div
              key={item.id}
              onClick={() => setSelected(item)}
              className={`border p-4 cursor-pointer transition-all ${
                selected?.id === item.id
                  ? 'border-yellow-500 bg-yellow-900/10'
                  : 'border-yellow-900/30 hover:border-yellow-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-sm">{userName(item)}</p>
                  <p className="text-xs text-gray-500">{item.userId?.email}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Soumis le {new Date(item.submittedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    label={item.status === 'pending' ? 'EN ATTENTE' : item.status === 'verified' ? 'APPROUVÉ' : 'REJETÉ'}
                    color={item.status === 'pending' ? 'yellow' : item.status === 'verified' ? 'green' : 'red'}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {}
        <div>
          {selected ? (
            <SectionBox title={`KYC — ${userName(selected)}`}>
              <div className="space-y-4">
                {}
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-yellow-900/30 rounded p-3 text-center">
                    {idDocSrc ? (
                      <img src={idDocSrc} alt="ID Doc" className="max-h-32 mx-auto" />
                    ) : (
                      <div className="h-24 flex items-center justify-center bg-gray-900">
                        <p className="text-gray-600 text-xs">Pièce d'identité</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">PIÈCE D'IDENTITÉ</p>
                    {idDocSrc && (
                      <a href={idDocSrc} target="_blank" rel="noreferrer" className="text-xs text-yellow-500 hover:underline">Ouvrir</a>
                    )}
                  </div>
                  <div className="border border-yellow-900/30 rounded p-3 text-center">
                    {selfieSrc ? (
                      <img src={selfieSrc} alt="Selfie" className="max-h-32 mx-auto" />
                    ) : (
                      <div className="h-24 flex items-center justify-center bg-gray-900">
                        <p className="text-gray-600 text-xs">Selfie</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">SELFIE</p>
                    {selfieSrc && (
                      <a href={selfieSrc} target="_blank" rel="noreferrer" className="text-xs text-yellow-500 hover:underline">Ouvrir</a>
                    )}
                  </div>
                </div>

                {selected.status === 'pending' && (
                  <>
                    <div className="flex gap-2">
                      <AdminBtn color="green" size="md" onClick={() => handleApprove(selected.id)} disabled={processing}>
                        ✓ APPROUVER
                      </AdminBtn>
                    </div>

                    <div className="border-t border-yellow-900/20 pt-4">
                      <Textarea
                        label="Motif de rejet"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        rows={3}
                        placeholder="Ex: Document illisible, photo floue..."
                      />
                      <div className="mt-2">
                        <AdminBtn color="red" size="md" onClick={() => handleReject(selected.id)} disabled={processing || !rejectReason}>
                          ✗ REJETER
                        </AdminBtn>
                      </div>
                    </div>
                  </>
                )}

                {selected.status !== 'pending' && (
                  <Alert type={selected.status === 'verified' ? 'success' : 'error'}>
                    KYC {selected.status === 'verified' ? 'approuvé' : 'rejeté'} — aucune action disponible
                  </Alert>
                )}
              </div>
            </SectionBox>
          ) : (
            <div className="border border-yellow-900/20 rounded-lg p-6 text-center">
              <p className="text-gray-600 text-sm">Sélectionnez une vérification KYC</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReferralsTab({ api }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rate, setRate] = useState(0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/referrals/stats');
      if (res.data.success) {
        setStats(res.data.data);
        setRate(res.data.data.commissionRate ?? 0);
      } else {
        setStats(null);
        setError('Impossible de charger les statistiques de parrainage');
      }
    } catch {
      setStats(null);
      setError('Impossible de charger les statistiques de parrainage');
    } finally {
      setLoading(false);
    }
  };

  const saveCommissionRate = async () => {
    setSaving(true);
    setMsg('');
    try {
      await api.put('/admin/referrals/commissions', { rate: parseFloat(rate) });
      setMsg('Taux de commission mis à jour !');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="RÉSEAU MLM & PARRAINAGE" subtitle="Gestion des commissions et surveillance" />

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <KPICard label="Total Parrainages" value={stats?.totalReferrals ?? 0} color="yellow" icon="🔗" />
        <KPICard label="Commissions Versées" value={`$${stats?.totalCommissions ?? 0}`} color="blue" icon="💰" />
        <KPICard label="Taux de Commission" value={`${stats?.commissionRate ?? 0}%`} color="green" icon="📊" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {}
        <SectionBox title="Configuration de la Commission" action={<AdminBtn size="sm" color="green" onClick={saveCommissionRate} disabled={saving}>SAUVER</AdminBtn>}>
          {msg && <div className="mb-3"><Alert type={msg.includes('Erreur') ? 'error' : 'success'}>{msg}</Alert></div>}
          <div className="border border-yellow-900/20 rounded p-3">
            <p className="text-xs font-bold text-yellow-500 mb-2">Commission Niveau 1 (Directs)</p>
            <Input
              label="Taux (%)"
              type="number"
              value={rate}
              onChange={e => setRate(e.target.value)}
              hint="Seule la commission de niveau 1 est réellement versée par la plateforme aujourd'hui."
            />
          </div>
        </SectionBox>

        {}
        <SectionBox title="Top Affiliés">
          <AdminTable
            columns={[
              { key: 'rank', label: '#', render: (_, __, i) => <span className="text-yellow-500 font-black">#{i + 1}</span> },
              { key: 'name', label: 'Utilisateur' },
              { key: 'referrals', label: 'Filleuls' },
              { key: 'commissions', label: 'Commissions', render: v => <span className="text-yellow-400 font-bold">${v?.toFixed(2)}</span> },
            ]}
            data={stats?.topAffiliates || []}
            emptyMsg="Aucun affilié"
          />
        </SectionBox>
      </div>
    </div>
  );
}

function AmbassadorsTab({ api }) {
  const [ambassadors, setAmbassadors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [createErr, setCreateErr] = useState('');
  const [creating, setCreating] = useState(false);

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetErr, setResetErr] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/ambassadors');
      if (res.data.success) setAmbassadors(res.data.data.ambassadors);
      else setError('Impossible de charger les ambassadeurs');
    } catch {
      setError('Impossible de charger les ambassadeurs');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id) => {
    setDetailLoading(true);
    setDetail({ id }); // opens the modal immediately with a loading state
    try {
      const res = await api.get(`/admin/ambassadors/${id}`);
      if (res.data.success) setDetail(res.data.data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const submitCreate = async () => {
    setCreateErr('');
    setCreating(true);
    try {
      const res = await api.post('/admin/ambassadors', createForm);
      if (res.data.success) {
        setCreateOpen(false);
        setCreateForm({ firstName: '', lastName: '', email: '', phone: '', password: '' });
        fetchData();
      } else {
        setCreateErr(res.data.message || 'Erreur lors de la création');
      }
    } catch (e) {
      setCreateErr(e.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (a) => {
    try {
      const action = a.status === 'suspended' ? 'activate' : 'suspend';
      await api.post(`/admin/users/${a._id}/${action}`);
      fetchData();
    } catch {
      setError('Action impossible');
    }
  };

  const submitResetPassword = async () => {
    setResetErr('');
    setResetting(true);
    try {
      const res = await api.post(`/admin/ambassadors/${resetTarget._id}/reset-password`, { password: resetPassword });
      if (res.data.success) {
        setResetTarget(null);
        setResetPassword('');
      } else {
        setResetErr(res.data.message || 'Erreur');
      }
    } catch (e) {
      setResetErr(e.response?.data?.message || 'Erreur');
    } finally {
      setResetting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="AMBASSADEURS"
        subtitle="Comptes créés par le Super Admin — parrainage dédié, commission sur les gains des filleuls"
        actions={<AdminBtn color="green" size="md" onClick={() => setCreateOpen(true)}>+ NOUVEL AMBASSADEUR</AdminBtn>}
      />

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

      <SectionBox title={`${ambassadors.length} Ambassadeur${ambassadors.length !== 1 ? 's' : ''}`}>
        <AdminTable
          columns={[
            { key: 'name', label: 'Nom', render: (_, row) => `${row.firstName} ${row.lastName}` },
            { key: 'email', label: 'Email' },
            { key: 'status', label: 'Statut', render: v => <Badge label={v === 'suspended' ? 'SUSPENDU' : 'ACTIF'} color={v === 'suspended' ? 'red' : 'green'} /> },
            { key: 'totalReferred', label: 'Filleuls' },
            { key: 'totalCommissions', label: 'Commissions', render: v => <span className="text-yellow-400 font-bold">${v?.toFixed(2)}</span> },
            {
              key: 'actions', label: 'Actions', render: (_, row) => (
                <div className="flex flex-wrap gap-2">
                  <AdminBtn size="sm" color="blue" onClick={() => openDetail(row._id)}>VOIR</AdminBtn>
                  <AdminBtn size="sm" color={row.status === 'suspended' ? 'green' : 'red'} onClick={() => toggleStatus(row)}>
                    {row.status === 'suspended' ? 'RÉACTIVER' : 'SUSPENDRE'}
                  </AdminBtn>
                  <AdminBtn size="sm" color="gray" onClick={() => { setResetTarget(row); setResetPassword(''); setResetErr(''); }}>MOT DE PASSE</AdminBtn>
                </div>
              )
            },
          ]}
          data={ambassadors}
          emptyMsg="Aucun ambassadeur pour le moment"
        />
      </SectionBox>

      {}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouvel Ambassadeur">
        {createErr && <div className="mb-4"><Alert type="error">{createErr}</Alert></div>}
        <div className="space-y-3">
          <Input label="Prénom" value={createForm.firstName} onChange={e => setCreateForm({ ...createForm, firstName: e.target.value })} />
          <Input label="Nom" value={createForm.lastName} onChange={e => setCreateForm({ ...createForm, lastName: e.target.value })} />
          <Input label="Email" type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} />
          <Input label="Téléphone" value={createForm.phone} onChange={e => setCreateForm({ ...createForm, phone: e.target.value })} />
          <Input
            label="Mot de passe temporaire" type="text"
            value={createForm.password}
            onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
            hint="Au moins 8 caractères, majuscule, minuscule et chiffre — à transmettre à l'ambassadeur."
          />
          <AdminBtn color="green" size="md" onClick={submitCreate} disabled={creating}>
            {creating ? 'CRÉATION...' : 'CRÉER LE COMPTE'}
          </AdminBtn>
        </div>
      </Modal>

      {}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.ambassador ? `${detail.ambassador.firstName} ${detail.ambassador.lastName}` : 'Détail ambassadeur'}>
        {detailLoading || !detail?.ambassador ? <LoadingSpinner /> : (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <KPICard label="Filleuls" value={detail.totalReferred} color="yellow" icon="👥" />
              <KPICard label="Commissions" value={`$${detail.totalCommissions?.toFixed(2)}`} color="green" icon="💰" />
            </div>
            <h3 className="text-xs font-black text-yellow-500 tracking-widest mb-2">FILLEULS</h3>
            <AdminTable
              columns={[
                { key: 'name', label: 'Nom' },
                { key: 'email', label: 'Email' },
                { key: 'joinedAt', label: 'Inscrit le', render: v => new Date(v).toLocaleDateString('fr-FR') },
                { key: 'commissionsEarned', label: 'Commissions', render: v => `$${v?.toFixed(2)}` },
              ]}
              data={detail.referrals}
              emptyMsg="Aucun filleul"
            />
            <h3 className="text-xs font-black text-yellow-500 tracking-widest mb-2 mt-6">HISTORIQUE DES COMMISSIONS</h3>
            <AdminTable
              columns={[
                { key: 'createdAt', label: 'Date', render: v => new Date(v).toLocaleDateString('fr-FR') },
                { key: 'sourceEarnings', label: 'Gains filleul', render: v => `$${v?.toFixed(2)}` },
                { key: 'rate', label: 'Taux', render: v => `${v}%` },
                { key: 'commissionAmount', label: 'Commission', render: v => <span className="text-yellow-400 font-bold">${v?.toFixed(2)}</span> },
              ]}
              data={detail.commissionHistory}
              emptyMsg="Aucune commission versée pour le moment"
            />
          </div>
        )}
      </Modal>

      {}
      <Modal open={!!resetTarget} onClose={() => setResetTarget(null)} title={`Réinitialiser le mot de passe — ${resetTarget?.firstName || ''}`}>
        {resetErr && <div className="mb-4"><Alert type="error">{resetErr}</Alert></div>}
        <div className="space-y-3">
          <Input
            label="Nouveau mot de passe" type="text"
            value={resetPassword} onChange={e => setResetPassword(e.target.value)}
            hint="À transmettre à l'ambassadeur par un canal sécurisé."
          />
          <AdminBtn color="green" size="md" onClick={submitResetPassword} disabled={resetting}>
            {resetting ? 'ENVOI...' : 'RÉINITIALISER'}
          </AdminBtn>
        </div>
      </Modal>
    </div>
  );
}

function InvestmentsTab({ api }) {
  const [investments, setInvestments] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [filterPack, setFilterPack] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selected, setSelected] = useState(null);
  const [packConfig, setPackConfig] = useState([]);
  const [showPackConfig, setShowPackConfig] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const PER_PAGE = 50;

  // Filtering by status/pack and pagination all happen server-side — at
  // scale, fetching every investment to filter it client-side isn't viable.
  useEffect(() => { fetchInvestments(); }, [filter, filterPack, filterPeriod, page]);
  useEffect(() => { fetchPackConfig(); }, []);

  const fetchPackConfig = async () => {
    try {
      const res = await api.get('/investments/packs');
      if (res.data.success) setPackConfig(res.data.data.packs || []);
    } catch {
      setMsg('Impossible de charger la configuration des packs');
    }
  };

  const fetchInvestments = async () => {
    setError('');
    try {
      const params = new URLSearchParams({ status: filter, pack: filterPack, period: filterPeriod, page: String(page), limit: String(PER_PAGE) });
      const res = await api.get(`/admin/investments?${params.toString()}`);
      if (res.data.success) {
        setInvestments(res.data.data.investments || []);
        setTotal(res.data.data.total || 0);
        setPages(res.data.data.pages || 1);
      } else {
        setInvestments([]);
        setError('Impossible de charger les investissements');
      }
    } catch {
      setInvestments([]);
      setError('Impossible de charger les investissements');
    } finally {
      setInitialLoading(false);
    }
  };

  const userName = (r) => r.userId ? `${r.userId.firstName || ''} ${r.userId.lastName || ''}`.trim() : '';

  const packColors = { ...Object.fromEntries(INVESTMENT_PACK_KEYS.map(k => [k, TIER_COLOR[tierOf(k)]])), turbo48h: 'red' };

  if (initialLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="GESTION INVESTISSEMENTS"
        subtitle={`${total.toLocaleString('fr-FR')} investissement(s)`}
        actions={<AdminBtn onClick={() => setShowPackConfig(!showPackConfig)}>⚙ PACKS CONFIG</AdminBtn>}
      />

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}
      {msg && <div className="mb-4"><Alert type={msg.includes('Erreur') ? 'error' : 'success'}>{msg}</Alert></div>}

      {}
      <p className="text-xs text-gray-600 mb-1">Répartition par pack — page actuelle uniquement</p>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        {INVESTMENT_PACK_KEYS.map(p => (
          <div key={p} className={`border border-${packColors[p]}-500/30 rounded p-3 text-center`}>
            <p className="text-xs text-gray-500 uppercase tracking-widest">{packDisplayName(p)}</p>
            <p className="text-xl font-black text-yellow-400">{investments.filter(i => i.pack === p).length}</p>
          </div>
        ))}
      </div>

      {}
      {showPackConfig && (
        <SectionBox title="Configuration des Packs" action={
          <AdminBtn color="green" size="sm" onClick={async () => {
            try {
              const payload = packConfig.map(({ key, name, minAmount, maxAmount, roi, duration, durationUnit, description, active }) =>
                ({ key, name, minAmount, maxAmount, roi, duration, durationUnit, description, active }));
              await api.put('/admin/investments/packs-config', { packs: payload });
              setMsg('Packs mis à jour !');
            } catch (e) { setMsg(e.response?.data?.message || 'Erreur lors de la mise à jour'); }
          }}>SAUVER</AdminBtn>
        }>
          <div className="grid lg:grid-cols-3 gap-3">
            {packConfig.map((pack, i) => (
              <div key={pack.key} className="border border-yellow-900/20 rounded p-3 space-y-2">
                <p className="text-xs font-black text-yellow-500 tracking-widest">{pack.name.toUpperCase()}</p>
                <Input label="Min $" type="number" value={pack.minAmount} onChange={e => {
                  const u = [...packConfig]; u[i] = { ...u[i], minAmount: parseFloat(e.target.value) }; setPackConfig(u);
                }} />
                <Input label="ROI (%)" value={pack.roi} onChange={e => {
                  const u = [...packConfig]; u[i] = { ...u[i], roi: e.target.value }; setPackConfig(u);
                }} />
                <Input label={`Durée (${pack.durationUnit === 'hours' ? 'heures' : 'jours'})`} type="number" value={pack.duration} onChange={e => {
                  const u = [...packConfig]; u[i] = { ...u[i], duration: parseInt(e.target.value) }; setPackConfig(u);
                }} />
              </div>
            ))}
          </div>
        </SectionBox>
      )}

      {}
      <div className="flex flex-wrap gap-3 mb-4">
        <Select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} options={[
          { value: 'active', label: 'Actifs' },
          { value: 'completed', label: 'Terminés' },
          { value: 'pending', label: 'En attente' },
          { value: 'cancelled', label: 'Annulés' },
        ]} />
        <Select value={filterPack} onChange={e => { setFilterPack(e.target.value); setPage(1); }} options={[
          { value: 'all', label: 'Tous les packs' },
          ...Object.keys(PACK_NAMES).map(k => ({ value: k, label: packDisplayName(k) })),
        ]} />
        <Select value={filterPeriod} onChange={e => { setFilterPeriod(e.target.value); setPage(1); }} options={[
          { value: 'all', label: 'Toute période' },
          { value: 'today', label: "Aujourd'hui" },
          { value: 'week', label: 'Cette semaine' },
          { value: 'month', label: 'Ce mois' },
        ]} />
      </div>

      <AdminTable
        columns={[
          { key: 'userName', label: 'Utilisateur', render: (_, r) => userName(r) },
          { key: 'pack', label: 'Pack', render: v => <Badge label={packDisplayName(v).toUpperCase()} color={packColors[v] || 'gray'} /> },
          { key: 'amount', label: 'Montant', render: v => <span className="text-yellow-400 font-bold">${v?.toLocaleString()}</span> },
          { key: 'roi', label: 'ROI', render: v => <span className="text-green-400 font-bold">+{v}%</span> },
          { key: 'earnings', label: 'Gains', render: v => <span className="text-blue-400">${v?.toFixed(2)}</span> },
          { key: 'endDate', label: 'Fin', render: v => <span className="text-gray-400">{new Date(v).toLocaleDateString('fr-FR')}</span> },
          { key: 'actions', label: '', render: (_, r) => (
            <div className="flex gap-1">
              <AdminBtn size="sm" onClick={() => setSelected(r)}>VOIR</AdminBtn>
              {r.status === 'active' && <AdminBtn size="sm" color="red" onClick={async () => {
                try {
                  const res = await api.post(`/admin/investments/${r.id}/close`);
                  const payout = res.data?.data?.payout;
                  setMsg(payout ? `Investissement clôturé — payout: $${payout}` : 'Investissement clôturé');
                } catch (e) {
                  setMsg(e.response?.data?.message || 'Erreur lors de la clôture');
                }
                fetchInvestments();
              }}>CLORE</AdminBtn>}
            </div>
          )},
        ]}
        data={investments}
        emptyMsg="Aucun investissement"
      />

      <PaginationBar page={page} pages={pages} total={total} onPage={setPage} />

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Investissement — ${selected ? userName(selected) : ''}`}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                ['Pack', packDisplayName(selected.pack)], ['Montant', `$${selected.amount}`],
                ['ROI actuel', `${selected.roi}%`], ['Gains', `$${selected.earnings}`],
                ['Créé le', new Date(selected.createdAt).toLocaleDateString('fr-FR')],
                ['Fin le', new Date(selected.endDate).toLocaleDateString('fr-FR')],
              ].map(([k, v]) => (
                <div key={k} className="border border-yellow-900/20 rounded p-2">
                  <p className="text-gray-600">{k}</p>
                  <p className="text-white font-bold">{v}</p>
                </div>
              ))}
            </div>
            {selected.status === 'active' && (
              <SectionBox title="Modification Manuelle">
                <div className="space-y-2">
                  <Input label="Nouveau ROI (%)" type="number" placeholder="Ex: 7.5" />
                  <AdminBtn color="yellow">METTRE À JOUR LE ROI</AdminBtn>
                </div>
              </SectionBox>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function TransactionsTab({ api }) {
  const [transactions, setTransactions] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('today');
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [payoutCode, setPayoutCode] = useState('');
  const [payoutMessage, setPayoutMessage] = useState('');
  const PER_PAGE = 50;

  useEffect(() => { fetchTransactions(); }, [filter, typeFilter, periodFilter, page]);

  const fetchTransactions = async () => {
    setError('');
    try {
      const params = new URLSearchParams({ status: filter, type: typeFilter, period: periodFilter, page: String(page), limit: String(PER_PAGE) });
      const res = await api.get(`/admin/transactions?${params.toString()}`);
      if (res.data.success) {
        setTransactions(res.data.data.transactions || []);
        setTotal(res.data.data.total || 0);
        setPages(res.data.data.pages || 1);
      } else {
        setTransactions([]);
        setError('Impossible de charger les transactions');
      }
    } catch {
      setTransactions([]);
      setError('Impossible de charger les transactions');
    } finally {
      setInitialLoading(false);
    }
  };

  const userName = (r) => r.userId ? `${r.userId.firstName || ''} ${r.userId.lastName || ''}`.trim() : '';

  const runAction = async (action, txId, body) => {
    setProcessing(true);
    try {
      await api.post(`/admin/transactions/${txId}/${action}`, body);
      fetchTransactions();
      setSelected(null);
      setRejectReason('');
    } catch (e) { console.error(e); } finally { setProcessing(false); }
  };
  const handleApprove = (txId) => runAction('approve', txId);
  const handleProcess = (txId) => runAction('process', txId);
  const handleComplete = (txId) => runAction('complete', txId);
  const handleReject = (txId) => rejectReason && runAction('reject', txId, { reason: rejectReason });
  const handleCancel = (txId) => runAction('cancel', txId, { reason: rejectReason });

  // Separate from runAction: these keep the transaction selected afterward
  // (the admin needs to stay on it to enter a 2FA code next) and surface the
  // real NOWPayments response instead of silently swallowing errors — this
  // moves real money, so a failed call needs to be visible, not just logged.
  const runPayoutAction = async (action, txId, body) => {
    setProcessing(true);
    setPayoutMessage('');
    try {
      const res = await api.post(`/admin/transactions/${txId}/${action}`, body);
      if (res.data.success) {
        setSelected(res.data.data.transaction);
        setPayoutMessage(res.data.data.message || (res.data.data.rawStatus ? `Statut NOWPayments : ${res.data.data.rawStatus}` : 'OK'));
        setPayoutCode('');
        fetchTransactions();
      }
    } catch (e) {
      setPayoutMessage(e.response?.data?.message || "Erreur lors de l'opération NOWPayments");
    } finally {
      setProcessing(false);
    }
  };
  const handleExecutePayout = (txId) => runPayoutAction('execute-payout', txId);
  const handleVerifyPayout = (txId) => payoutCode.trim() && runPayoutAction('verify-payout', txId, { code: payoutCode.trim() });
  const handleCheckPayoutStatus = (txId) => runPayoutAction('payout-status', txId);

  const typeColors = { deposit: 'green', withdrawal: 'red', investment: 'blue', earning: 'green', reinvestment: 'blue', commission: 'purple', refund: 'gray' };
  const typeLabels = { deposit: 'DÉPÔT', withdrawal: 'RETRAIT', investment: 'INVESTISSEMENT', earning: 'GAIN', reinvestment: 'RÉINVESTISSEMENT', commission: 'COMMISSION', refund: 'REMBOURSEMENT' };
  const statusColors = { pending: 'yellow', approved: 'blue', processing: 'purple', completed: 'green', rejected: 'red', cancelled: 'gray', failed: 'red' };
  const statusLabels = { pending: 'EN ATTENTE', approved: 'APPROUVÉ', processing: 'EN TRAITEMENT', completed: 'TERMINÉ', rejected: 'REFUSÉ', cancelled: 'ANNULÉ', failed: 'ÉCHOUÉ' };

  if (initialLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="DÉPÔTS & RETRAITS"
        subtitle={`${total.toLocaleString('fr-FR')} ${filter === 'pending' ? 'en attente d\'approbation' : 'résultat(s)'}`}
      />

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

      {total > 0 && filter === 'pending' && (
        <Alert type="warning" className="mb-4">
          {total} transaction(s) en attente de traitement
        </Alert>
      )}

      <div className="flex gap-3 mb-4 flex-wrap">
        <Select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} options={[
          { value: 'pending', label: 'En attente' },
          { value: 'approved', label: 'Approuvées' },
          { value: 'processing', label: 'En traitement' },
          { value: 'completed', label: 'Terminées' },
          { value: 'rejected', label: 'Refusées' },
          { value: 'cancelled', label: 'Annulées' },
          { value: 'all', label: 'Toutes' },
        ]} />
        <Select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} options={[
          { value: 'all', label: 'Tous types' },
          { value: 'deposit', label: 'Dépôts uniquement' },
          { value: 'withdrawal', label: 'Retraits uniquement' },
        ]} />
        <Select value={periodFilter} onChange={e => { setPeriodFilter(e.target.value); setPage(1); }} options={[
          { value: 'all', label: 'Toute période' },
          { value: 'today', label: "Aujourd'hui" },
          { value: 'week', label: 'Cette semaine' },
          { value: 'month', label: 'Ce mois' },
        ]} />
        <AdminBtn color="gray" onClick={() => {
          const csv = transactions.map(t => `${t.id},${userName(t)},${t.type},${t.amount},${t.status},${t.createdAt}`).join('\n');
          const blob = new Blob([`ID,Nom,Type,Montant,Statut,Date\n${csv}`], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
        }}>⬇ EXPORT CSV (page actuelle)</AdminBtn>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <AdminTable
            columns={[
              { key: 'userName', label: 'Utilisateur', render: (_, r) => userName(r) },
              { key: 'type', label: 'Type', render: v => <Badge label={typeLabels[v] || v?.toUpperCase()} color={typeColors[v] || 'gray'} /> },
              { key: 'amount', label: 'Montant', render: v => <span className="text-yellow-400 font-bold">${v?.toLocaleString()}</span> },
              { key: 'status', label: 'Statut', render: v => <Badge label={statusLabels[v] || v?.toUpperCase()} color={statusColors[v] || 'gray'} /> },
              { key: 'actions', label: '', render: (_, r) => <AdminBtn size="sm" onClick={() => { setSelected(r); setPayoutMessage(''); setPayoutCode(''); }}>VOIR</AdminBtn> },
            ]}
            data={transactions}
            emptyMsg="Aucune transaction"
          />
          <PaginationBar page={page} pages={pages} total={total} onPage={setPage} />
        </div>

        <div>
          {selected ? (
            <SectionBox title={`Transaction — ${selected.reference}`}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ['Utilisateur', userName(selected)],
                    ['Type', typeLabels[selected.type] || selected.type],
                    ['Montant', `$${selected.amount?.toLocaleString()}`],
                    ['Méthode', selected.method],
                    ['Référence', selected.reference],
                    ['Date', new Date(selected.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })],
                  ].map(([k, v]) => (
                    <div key={k} className="border border-yellow-900/20 rounded p-2">
                      <p className="text-gray-600">{k}</p>
                      <p className="text-white font-bold">{v}</p>
                    </div>
                  ))}
                </div>

                {selected.proof && (
                  /^https?:\/\/.*\.(png|jpe?g|gif|webp)$/i.test(selected.proof) ? (
                    <div className="border border-yellow-900/30 rounded p-3 text-center">
                      <img src={selected.proof} alt="Preuve de paiement" className="max-h-40 mx-auto" />
                      <p className="text-xs text-gray-500 mt-2">Preuve de paiement</p>
                    </div>
                  ) : (
                    <div className="border border-yellow-900/30 rounded p-3">
                      <p className="text-xs text-gray-600 mb-1">
                        {selected.type === 'withdrawal' ? 'Adresse USDT de destination' : 'ID de transaction USDT'}
                      </p>
                      <code className="block text-yellow-300 text-xs break-all">{selected.proof}</code>
                    </div>
                  )
                )}

                <Badge label={statusLabels[selected.status] || selected.status?.toUpperCase()} color={statusColors[selected.status] || 'gray'} />

                {selected.status === 'pending' && (
                  <>
                    <AdminBtn color="green" size="md" onClick={() => handleApprove(selected.id)} disabled={processing}>
                      ✓ APPROUVER
                    </AdminBtn>
                    <div className="space-y-2 border-t border-yellow-900/20 pt-4">
                      <Textarea label="Motif de rejet" value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={2} placeholder="Raison du rejet..." />
                      <AdminBtn color="red" size="md" onClick={() => handleReject(selected.id)} disabled={processing || !rejectReason}>
                        ✗ REJETER
                      </AdminBtn>
                    </div>
                  </>
                )}

                {payoutMessage && (
                  <div className="p-3 bg-blue-950/30 border border-blue-800/40 text-blue-300 text-xs rounded">{payoutMessage}</div>
                )}

                {selected.type === 'withdrawal' && selected.status === 'approved' && (
                  <>
                    <AdminBtn color="green" size="md" onClick={() => handleExecutePayout(selected.id)} disabled={processing}>
                      ⚡ PAYER AUTOMATIQUEMENT (NOWPayments)
                    </AdminBtn>
                    <AdminBtn color="yellow" size="md" onClick={() => handleProcess(selected.id)} disabled={processing}>
                      ⏳ METTRE EN TRAITEMENT (manuel)
                    </AdminBtn>
                    <AdminBtn color="green" size="md" onClick={() => handleComplete(selected.id)} disabled={processing}>
                      ✓ MARQUER TERMINÉ (manuel)
                    </AdminBtn>
                    <div className="space-y-2 border-t border-yellow-900/20 pt-4">
                      <Textarea label="Motif d'annulation" value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={2} placeholder="Raison de l'annulation..." />
                      <AdminBtn color="red" size="md" onClick={() => handleCancel(selected.id)} disabled={processing || !rejectReason}>
                        ✗ ANNULER
                      </AdminBtn>
                    </div>
                  </>
                )}

                {selected.type === 'withdrawal' && selected.status === 'processing' && (
                  <>
                    {selected.nowpaymentsWithdrawalId && selected.nowpaymentsStatus !== 'verified' && (
                      <div className="space-y-2 border border-yellow-900/20 rounded p-3">
                        <Input label="Code de vérification NOWPayments (2FA)" value={payoutCode} onChange={e => setPayoutCode(e.target.value)} placeholder="Code reçu par email / Authenticator" />
                        <AdminBtn color="green" size="md" onClick={() => handleVerifyPayout(selected.id)} disabled={processing || !payoutCode.trim()}>
                          ✓ VALIDER LE CODE
                        </AdminBtn>
                      </div>
                    )}
                    {selected.nowpaymentsPayoutId && (
                      <AdminBtn color="blue" size="md" onClick={() => handleCheckPayoutStatus(selected.id)} disabled={processing}>
                        ↻ VÉRIFIER LE STATUT NOWPAYMENTS
                      </AdminBtn>
                    )}
                    <AdminBtn color="green" size="md" onClick={() => handleComplete(selected.id)} disabled={processing}>
                      ✓ MARQUER TERMINÉ (manuel)
                    </AdminBtn>
                  </>
                )}
              </div>
            </SectionBox>
          ) : (
            <div className="border border-yellow-900/20 rounded-lg p-6 text-center">
              <p className="text-gray-600 text-sm">Sélectionnez une transaction</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AcademyTab({ api }) {
  const [courses, setCourses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', category: 'crypto', level: 'beginner', youtubeId: '', duration: 300 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/admin/academy/courses').then(r => {
      if (r.data.success) setCourses(r.data.data.courses || []);
      else { setCourses([]); setError('Impossible de charger les cours'); }
    }).catch(() => {
      setCourses([]);
      setError('Impossible de charger les cours');
    }).finally(() => setLoading(false));
  }, []);

  const toggleCourse = async (id, active) => {
    try {
      await api.put(`/admin/academy/courses/${id}`, { active: !active });
      setCourses(courses.map(c => c.id === id ? { ...c, active: !active } : c));
    } catch (e) { console.error(e); }
  };

  const createCourse = async () => {
    try {
      const res = await api.post('/admin/academy/courses', newCourse);
      if (res.data.success) {
        setCourses([...courses, res.data.data.course]);
        setShowAdd(false);
      }
    } catch (e) { setError(e.response?.data?.message || 'Erreur lors de la création du cours'); }
  };

  const levelColors = { beginner: 'green', intermediate: 'yellow', advanced: 'red' };
  const categoryIcons = { crypto: '₿', investment: '📈', platform: '🏛', trading: '📊' };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="ACADÉMIE IMC"
        subtitle={`${courses.length} cours disponibles`}
        actions={<AdminBtn onClick={() => setShowAdd(true)}>+ NOUVEAU COURS</AdminBtn>}
      />

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <KPICard label="Cours Actifs" value={courses.filter(c => c.active).length} color="yellow" icon="🎓" />
        <KPICard label="Complétions Total" value={courses.reduce((s, c) => s + (c.completions || 0), 0)} color="green" icon="✅" />
        <KPICard label="Cours Inactifs" value={courses.filter(c => !c.active).length} color="gray" icon="⏸" />
      </div>

      <div className="space-y-3">
        {courses.map(course => (
          <div key={course.id} className={`border rounded p-4 flex items-center justify-between gap-4 ${course.active ? 'border-yellow-900/30' : 'border-gray-800 opacity-60'}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl">{categoryIcons[course.category] || '📚'}</span>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm">{course.title}</p>
                <div className="flex gap-2 mt-1">
                  <Badge label={course.category?.toUpperCase()} color="gray" />
                  <Badge label={course.level?.toUpperCase()} color={levelColors[course.level] || 'gray'} />
                  <span className="text-xs text-gray-500">{course.completions?.toLocaleString()} complétion(s)</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <AdminBtn size="sm" color={course.active ? 'gray' : 'green'} onClick={() => toggleCourse(course.id, course.active)}>
                {course.active ? 'DÉSACTIVER' : 'ACTIVER'}
              </AdminBtn>
              <AdminBtn size="sm" color="yellow">ÉDITER</AdminBtn>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="NOUVEAU COURS">
        <div className="space-y-3">
          <Input label="Titre du cours" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} />
          <Textarea label="Description" value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Catégorie" value={newCourse.category} onChange={e => setNewCourse({ ...newCourse, category: e.target.value })} options={[
              { value: 'crypto', label: 'Crypto' },
              { value: 'investment', label: 'Investissement' },
              { value: 'platform', label: 'Plateforme' },
              { value: 'trading', label: 'Trading' },
            ]} />
            <Select label="Niveau" value={newCourse.level} onChange={e => setNewCourse({ ...newCourse, level: e.target.value })} options={[
              { value: 'beginner', label: 'Débutant' },
              { value: 'intermediate', label: 'Intermédiaire' },
              { value: 'advanced', label: 'Avancé' },
            ]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="ID YouTube" value={newCourse.youtubeId} onChange={e => setNewCourse({ ...newCourse, youtubeId: e.target.value })} placeholder="Ex: dQw4w9WgXcQ" />
            <Input label="Durée (secondes)" type="number" value={newCourse.duration} onChange={e => setNewCourse({ ...newCourse, duration: parseInt(e.target.value) })} />
          </div>
          <div className="flex gap-2 pt-2">
            <AdminBtn size="md" color="yellow" onClick={createCourse} disabled={!newCourse.title || !newCourse.youtubeId}>CRÉER</AdminBtn>
            <AdminBtn size="md" color="gray" onClick={() => setShowAdd(false)}>ANNULER</AdminBtn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const FAQ_CATEGORIES = [
  { value: 'compte', label: 'Compte' },
  { value: 'depots', label: 'Dépôts' },
  { value: 'retraits', label: 'Retraits' },
  { value: 'investissement', label: 'Investissement' },
  { value: 'trading', label: 'Trading' },
  { value: 'parrainage', label: 'Parrainage' },
  { value: 'securite', label: 'Sécurité' },
  { value: 'verification', label: 'Vérification' },
  { value: 'academie', label: 'Académie' },
];

function FAQAdminTab({ api }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'compte', order: 0 });

  const fetchFaqs = () => {
    setLoading(true);
    api.get('/admin/faq').then(r => {
      if (r.data.success) setFaqs(r.data.data.faqs || []);
    }).catch(() => setError('Impossible de charger la FAQ')).finally(() => setLoading(false));
  };

  useEffect(fetchFaqs, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ question: '', answer: '', category: 'compte', order: 0 });
    setShowModal(true);
  };

  const openEdit = (f) => {
    setEditing(f);
    setForm({ question: f.question, answer: f.answer, category: f.category, order: f.order });
    setShowModal(true);
  };

  const save = async () => {
    try {
      if (editing) await api.put(`/admin/faq/${editing._id}`, form);
      else await api.post('/admin/faq', form);
      setShowModal(false);
      fetchFaqs();
    } catch (e) { setError(e.response?.data?.message || 'Erreur lors de l\'enregistrement'); }
  };

  const toggleActive = async (f) => {
    try { await api.put(`/admin/faq/${f._id}`, { active: !f.active }); fetchFaqs(); } catch (e) { /* ignore */ }
  };

  const remove = async (f) => {
    if (!window.confirm(`Supprimer "${f.question}" ?`)) return;
    try { await api.delete(`/admin/faq/${f._id}`); fetchFaqs(); } catch (e) { setError('Erreur lors de la suppression'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="CENTRE D'AIDE"
        subtitle={`${faqs.length} question(s)`}
        actions={<AdminBtn onClick={openCreate}>+ NOUVELLE QUESTION</AdminBtn>}
      />
      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

      <div className="space-y-3">
        {faqs.map(f => (
          <div key={f._id} className={`border rounded p-4 flex items-center justify-between gap-4 ${f.active ? 'border-yellow-900/30' : 'border-gray-800 opacity-60'}`}>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm">{f.question}</p>
              <div className="flex gap-2 mt-1 items-center">
                <Badge label={(FAQ_CATEGORIES.find(c => c.value === f.category)?.label || f.category).toUpperCase()} color="gray" />
                <span className="text-xs text-gray-600">ordre: {f.order}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <AdminBtn size="sm" color={f.active ? 'gray' : 'green'} onClick={() => toggleActive(f)}>
                {f.active ? 'DÉSACTIVER' : 'ACTIVER'}
              </AdminBtn>
              <AdminBtn size="sm" color="yellow" onClick={() => openEdit(f)}>ÉDITER</AdminBtn>
              <AdminBtn size="sm" color="red" onClick={() => remove(f)}>SUPPRIMER</AdminBtn>
            </div>
          </div>
        ))}
        {faqs.length === 0 && <p className="text-gray-500 text-sm text-center py-8">Aucune question pour l'instant</p>}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'MODIFIER LA QUESTION' : 'NOUVELLE QUESTION'}>
        <div className="space-y-3">
          <Input label="Question" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} />
          <Textarea label="Réponse" value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} rows={4} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Catégorie" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} options={FAQ_CATEGORIES} />
            <Input label="Ordre d'affichage" type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="flex gap-2 pt-2">
            <AdminBtn size="md" color="yellow" onClick={save} disabled={!form.question || !form.answer}>{editing ? 'ENREGISTRER' : 'CRÉER'}</AdminBtn>
            <AdminBtn size="md" color="gray" onClick={() => setShowModal(false)}>ANNULER</AdminBtn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TradingTab({ api }) {
  const [tab, setTab] = useState('codes');
  const [assets, setAssets] = useState([]);
  const [codes, setCodes] = useState([]);
  const [positions, setPositions] = useState([]);
  const [positionMode, setPositionMode] = useState('');
  const [positionPeriod, setPositionPeriod] = useState('today');
  const [settings, setSettings] = useState({ payoutPercent: 85, durationsMinutes: [1, 5, 15, 60] });
  const [durationsInput, setDurationsInput] = useState('1, 5, 15, 60');
  const [savingSettings, setSavingSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAddCode, setShowAddCode] = useState(false);
  const [newAsset, setNewAsset] = useState({ key: '', name: '', category: 'crypto', symbol: '', basePrice: '', priceSource: 'simulated', externalProvider: 'coingecko', externalId: '' });
  const [newCode, setNewCode] = useState({ asset: '', durationHours: 24, variationPercent: 1, startDate: '', endDate: '', maxUses: 1 });

  // Guards against React 18 StrictMode firing this effect twice in dev (and
  // against a slow stale request resolving after a newer one): only the
  // most recently started fetchAll is allowed to write to state.
  const fetchSeq = useRef(0);

  const fetchAll = async () => {
    const seq = ++fetchSeq.current;
    setLoading(true);
    setMsg('');
    try {
      const [aRes, cRes, pRes, sRes] = await Promise.all([
        api.get('/admin/trading/assets'),
        api.get('/admin/trading/codes'),
        api.get(`/admin/trading/positions?limit=50${positionMode ? `&mode=${positionMode}` : ''}${positionPeriod !== 'all' ? `&period=${positionPeriod}` : ''}`),
        api.get('/admin/trading/settings'),
      ]);
      if (seq !== fetchSeq.current) return;
      if (aRes.data.success) setAssets(aRes.data.data.assets);
      if (cRes.data.success) setCodes(cRes.data.data.codes);
      if (pRes.data.success) setPositions(pRes.data.data.positions);
      if (sRes.data.success) {
        setSettings(sRes.data.data.config);
        setDurationsInput(sRes.data.data.config.durationsMinutes.join(', '));
      }
    } catch (e) {
      if (seq === fetchSeq.current) setMsg('Impossible de charger les données de trading');
    } finally {
      if (seq === fetchSeq.current) setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [positionMode, positionPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveSettings = async () => {
    const durationsMinutes = durationsInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n) && n > 0);
    if (durationsMinutes.length === 0) return setMsg('Indiquez au moins une durée valide');
    setSavingSettings(true);
    try {
      await api.put('/admin/trading/settings', { payoutPercent: parseFloat(settings.payoutPercent), durationsMinutes });
      setMsg('Réglages du trading libre sauvegardés');
      fetchAll();
    } catch (e) { setMsg(e.response?.data?.message || 'Erreur lors de la sauvegarde'); }
    finally { setSavingSettings(false); }
  };

  const createAsset = async () => {
    try {
      await api.post('/admin/trading/assets', { ...newAsset, basePrice: parseFloat(newAsset.basePrice) });
      setShowAddAsset(false);
      setNewAsset({ key: '', name: '', category: 'crypto', symbol: '', basePrice: '', priceSource: 'simulated', externalProvider: 'coingecko', externalId: '' });
      fetchAll();
    } catch (e) { setMsg(e.response?.data?.message || 'Erreur lors de la création de l\'actif'); }
  };

  const createCode = async () => {
    try {
      const res = await api.post('/admin/trading/codes', newCode);
      setMsg(`Code créé : ${res.data.data.code.code}`);
      setShowAddCode(false);
      setNewCode({ asset: '', durationHours: 24, variationPercent: 1, startDate: '', endDate: '', maxUses: 1 });
      fetchAll();
    } catch (e) { setMsg(e.response?.data?.message || 'Erreur lors de la création du code'); }
  };

  const toggleCodeStatus = async (id, status) => {
    try {
      await api.put(`/admin/trading/codes/${id}/status`, { status });
      fetchAll();
    } catch (e) { setMsg(e.response?.data?.message || 'Impossible de modifier ce code'); }
  };

  const codeStatusColor = { draft: 'gray', active: 'green', disabled: 'red', expired: 'gray' };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="TRADING " subtitle="Actifs, codes de scénario et positions" />

      {msg && <div className="mb-4"><Alert type={msg.includes('Erreur') || msg.includes('Impossible') ? 'error' : 'success'}>{msg}</Alert></div>}

      <div className="flex gap-2 mb-4 flex-wrap">
        {[['codes', 'Codes de scénario'], ['assets', 'Actifs'], ['positions', 'Positions'], ['settings', 'Trading libre']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 text-xs font-black tracking-widest border rounded transition-all ${tab === id ? 'bg-yellow-500 text-black border-yellow-500' : 'border-yellow-900/40 text-gray-400 hover:border-yellow-700'}`}>
            {label.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === 'codes' && (
        <SectionBox title="Codes de scénario" action={<AdminBtn size="sm" onClick={() => setShowAddCode(true)}>+ NOUVEAU CODE</AdminBtn>}>
          <AdminTable
            columns={[
              { key: 'code', label: 'Code' },
              { key: 'asset', label: 'Actif' },
              { key: 'variationPercent', label: 'Variation', render: v => <span className={v >= 0 ? 'text-green-400' : 'text-red-400'}>{v >= 0 ? '+' : ''}{v}%</span> },
              { key: 'durationHours', label: 'Durée', render: v => `${v}h` },
              { key: 'redemptions', label: 'Utilisations', render: (v, r) => `${v.length}/${r.maxUses}` },
              { key: 'status', label: 'Statut', render: v => <Badge label={v.toUpperCase()} color={codeStatusColor[v] || 'gray'} /> },
              { key: 'actions', label: '', render: (_, r) => (
                r.redemptions.length === 0 && r.status !== 'expired' ? (
                  r.status === 'active'
                    ? <AdminBtn size="sm" color="red" onClick={() => toggleCodeStatus(r.id, 'disabled')}>DÉSACTIVER</AdminBtn>
                    : <AdminBtn size="sm" color="green" onClick={() => toggleCodeStatus(r.id, 'active')}>ACTIVER</AdminBtn>
                ) : <span className="text-gray-600 text-xs">Verrouillé</span>
              )},
            ]}
            data={codes}
            emptyMsg="Aucun code créé"
          />
        </SectionBox>
      )}

      {tab === 'assets' && (
        <SectionBox title="Actifs de trading" action={<AdminBtn size="sm" onClick={() => setShowAddAsset(true)}>+ NOUVEL ACTIF</AdminBtn>}>
          <AdminTable
            columns={[
              { key: 'name', label: 'Nom' },
              { key: 'key', label: 'Clé' },
              { key: 'category', label: 'Catégorie' },
              { key: 'symbol', label: 'Symbole' },
              { key: 'basePrice', label: 'Prix de référence', render: v => `$${v.toLocaleString('fr-FR')}` },
              { key: 'priceSource', label: 'Source', render: v => <Badge label={v === 'live' ? 'DONNÉES RÉELLES' : 'SIMULATION'} color={v === 'live' ? 'green' : 'yellow'} /> },
              { key: 'active', label: 'Statut', render: v => <Badge label={v ? 'ACTIF' : 'INACTIF'} color={v ? 'green' : 'gray'} /> },
            ]}
            data={assets}
            emptyMsg="Aucun actif configuré"
          />
        </SectionBox>
      )}

      {tab === 'positions' && (
        <SectionBox
          title="Positions des utilisateurs"
          action={
            <div className="flex flex-wrap gap-2">
              <Select
                value={positionMode}
                onChange={e => setPositionMode(e.target.value)}
                options={[
                  { value: '', label: 'Tous les modes' },
                  { value: 'code', label: 'Codes uniquement' },
                  { value: 'self', label: 'Trading libre uniquement' },
                ]}
              />
              <Select
                value={positionPeriod}
                onChange={e => setPositionPeriod(e.target.value)}
                options={[
                  { value: 'all', label: 'Toute période' },
                  { value: 'today', label: "Aujourd'hui" },
                  { value: 'week', label: 'Cette semaine' },
                  { value: 'month', label: 'Ce mois' },
                ]}
              />
            </div>
          }
        >
          <AdminTable
            columns={[
              { key: 'userId', label: 'Utilisateur', render: (_, r) => r.userId ? `${r.userId.firstName || ''} ${r.userId.lastName || ''}`.trim() : '' },
              { key: 'mode', label: 'Mode', render: v => <Badge label={v === 'code' ? 'CODE' : 'LIBRE'} color={v === 'code' ? 'blue' : 'purple'} /> },
              { key: 'asset', label: 'Actif' },
              { key: 'type', label: 'Type', render: (v, r) => r.mode === 'code' ? <span className="text-gray-500">{r.code}</span> : <Badge label={v} color={v === 'BUY' ? 'green' : 'red'} /> },
              { key: 'amount', label: 'Montant', render: v => `$${v.toFixed(2)}` },
              { key: 'status', label: 'Statut', render: v => <Badge label={v === 'open' ? 'EN COURS' : 'TERMINÉE'} color={v === 'open' ? 'yellow' : 'gray'} /> },
              { key: 'outcome', label: 'Issue', render: (v, r) => r.status === 'closed' ? <Badge label={v === 'win' ? 'GAGNÉE' : v === 'loss' ? 'PERDUE' : 'NEUTRE'} color={v === 'win' ? 'green' : v === 'loss' ? 'red' : 'gray'} /> : '—' },
              { key: 'resultAmount', label: 'Résultat', render: (v, r) => r.status === 'closed' ? <span className={v >= 0 ? 'text-green-400' : 'text-red-400'}>{v >= 0 ? '+' : ''}${v.toFixed(2)}</span> : '—' },
            ]}
            data={positions}
            emptyMsg="Aucune position"
          />
        </SectionBox>
      )}

      {tab === 'settings' && (
        <SectionBox title="Réglages du trading libre (BUY/SELL)" action={<AdminBtn size="sm" color="green" onClick={saveSettings} disabled={savingSettings}>{savingSettings ? 'SAUVEGARDE...' : '💾 SAUVEGARDER'}</AdminBtn>}>
          <div className="space-y-3 max-w-md">
            <p className="text-xs text-gray-500">
              S'applique uniquement aux positions ouvertes directement sur le graphe (BUY/SELL). Les codes de scénario gardent leur propre pourcentage et durée, définis par code.
            </p>
            <Input
              label="Pourcentage de gain (%)"
              type="number" step="0.1"
              value={settings.payoutPercent}
              onChange={e => setSettings({ ...settings, payoutPercent: e.target.value })}
              hint="Payé en plus de la mise lorsqu'une position gagnante se clôture"
            />
            <Input
              label="Durées disponibles (minutes, séparées par des virgules)"
              value={durationsInput}
              onChange={e => setDurationsInput(e.target.value)}
              placeholder="1, 5, 15, 60"
            />
          </div>
        </SectionBox>
      )}

      <Modal open={showAddAsset} onClose={() => setShowAddAsset(false)} title="NOUVEL ACTIF">
        <div className="space-y-3">
          <Input label="Clé (unique)" value={newAsset.key} onChange={e => setNewAsset({ ...newAsset, key: e.target.value.toLowerCase() })} placeholder="Ex: silver" />
          <Input label="Nom affiché" value={newAsset.name} onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} placeholder="Ex: Argent" />
          <Select label="Catégorie" value={newAsset.category} onChange={e => setNewAsset({ ...newAsset, category: e.target.value })} options={[
            { value: 'crypto', label: 'Crypto' },
            { value: 'commodity', label: 'Matière première' },
            { value: 'index', label: 'Indice' },
            { value: 'forex', label: 'Devise' },
          ]} />
          <Input label="Symbole" value={newAsset.symbol} onChange={e => setNewAsset({ ...newAsset, symbol: e.target.value })} placeholder="Ex: XAG" />
          <Input label="Prix de référence ($)" type="number" value={newAsset.basePrice} onChange={e => setNewAsset({ ...newAsset, basePrice: e.target.value })} hint="Utilisé comme repli si la source réelle échoue, ou comme seule base en simulation" />
          <Select label="Source des données" value={newAsset.priceSource} onChange={e => setNewAsset({ ...newAsset, priceSource: e.target.value })} options={[
            { value: 'simulated', label: 'Simulation interne' },
            { value: 'live', label: 'Données réelles (API publique)' },
          ]} />
          {newAsset.priceSource === 'live' && (
            <>
              <Select label="Fournisseur" value={newAsset.externalProvider} onChange={e => setNewAsset({ ...newAsset, externalProvider: e.target.value })} options={[
                { value: 'coingecko', label: 'CoinGecko (crypto)' },
                { value: 'frankfurter', label: 'Frankfurter (devises)' },
              ]} />
              <Input
                label="Identifiant externe"
                value={newAsset.externalId}
                onChange={e => setNewAsset({ ...newAsset, externalId: e.target.value })}
                placeholder={newAsset.externalProvider === 'frankfurter' ? 'Ex: EUR:USD' : 'Ex: bitcoin'}
                hint={newAsset.externalProvider === 'frankfurter' ? 'Format DEVISE_BASE:DEVISE_CIBLE' : 'Identifiant CoinGecko de la cryptomonnaie'}
              />
            </>
          )}
          <div className="flex gap-2 pt-2">
            <AdminBtn size="md" color="yellow" onClick={createAsset} disabled={!newAsset.key || !newAsset.name || !newAsset.basePrice}>CRÉER</AdminBtn>
            <AdminBtn size="md" color="gray" onClick={() => setShowAddAsset(false)}>ANNULER</AdminBtn>
          </div>
        </div>
      </Modal>

      <Modal open={showAddCode} onClose={() => setShowAddCode(false)} title="NOUVEAU CODE DE SCÉNARIO">
        <div className="space-y-3">
          <Select label="Actif" value={newCode.asset} onChange={e => setNewCode({ ...newCode, asset: e.target.value })} options={[
            { value: '', label: 'Choisir un actif...' },
            ...assets.map(a => ({ value: a.key, label: a.name })),
          ]} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Durée (heures)" type="number" value={newCode.durationHours} onChange={e => setNewCode({ ...newCode, durationHours: parseInt(e.target.value) })} />
            <Input label="Variation (%)" type="number" step="0.1" value={newCode.variationPercent} onChange={e => setNewCode({ ...newCode, variationPercent: parseFloat(e.target.value) })} hint="Négatif pour une baisse" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Début de validité" type="datetime-local" value={newCode.startDate} onChange={e => setNewCode({ ...newCode, startDate: e.target.value })} />
            <Input label="Fin de validité" type="datetime-local" value={newCode.endDate} onChange={e => setNewCode({ ...newCode, endDate: e.target.value })} />
          </div>
          <Input label="Nombre d'utilisations max" type="number" value={newCode.maxUses} onChange={e => setNewCode({ ...newCode, maxUses: parseInt(e.target.value) })} />
          <div className="flex gap-2 pt-2">
            <AdminBtn size="md" color="yellow" onClick={createCode} disabled={!newCode.asset || !newCode.startDate || !newCode.endDate}>CRÉER</AdminBtn>
            <AdminBtn size="md" color="gray" onClick={() => setShowAddCode(false)}>ANNULER</AdminBtn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ConfigTab({ api }) {
  const [config, setConfig] = useState({
    platformName: 'IMC',
    supportEmail: 'support@imc.com',
    supportContactUrl: '',
    maintenanceMode: false,
    maintenanceMsg: '',
    withdrawalFee: 2.5,
    minWithdrawal: 50,
    maxWithdrawal: 10000,
    usdtWallets: [],
    modules: {
      academy: true,
      referral: true,
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newWalletNetwork, setNewWalletNetwork] = useState('TRC20');
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [msg, setMsg] = useState('');

  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    api.get('/admin/config').then(r => {
      if (r.data.success) setConfig(prev => ({ ...prev, ...r.data.data.config }));
      else setLoadError('Impossible de charger la configuration');
    }).catch(() => setLoadError('Impossible de charger la configuration')).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/admin/config', config);
      setMsg('Configuration sauvegardée !');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('Erreur lors de la sauvegarde'); } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="CONFIGURATION PLATEFORME"
        subtitle="Paramètres généraux de IMC"
        actions={<AdminBtn color="green" size="md" onClick={save} disabled={saving}>{saving ? 'SAUVEGARDE...' : '💾 SAUVEGARDER'}</AdminBtn>}
      />

      {loadError && <Alert type="error">{loadError}</Alert>}
      {msg && <Alert type={msg.includes('Erreur') ? 'error' : 'success'}>{msg}</Alert>}

      {config.maintenanceMode && (
        <Alert type="warning">⚠ MODE MAINTENANCE ACTIVÉ — La plateforme est inaccessible aux utilisateurs</Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {}
        <SectionBox title="Informations Générales">
          <div className="space-y-3">
            <Input label="Nom de la plateforme" value={config.platformName} onChange={e => setConfig({ ...config, platformName: e.target.value })} />
            <Input label="Email support" type="email" value={config.supportEmail} onChange={e => setConfig({ ...config, supportEmail: e.target.value })} />
            <Input label="Lien de contact support (Telegram, WhatsApp…)" value={config.supportContactUrl} onChange={e => setConfig({ ...config, supportContactUrl: e.target.value })} placeholder="https://t.me/votrecompte" />
          </div>
        </SectionBox>

        {}
        <SectionBox title="Mode Maintenance">
          <div className="space-y-3">
            <div className="flex items-center justify-between border border-yellow-900/20 rounded p-3">
              <span className="text-sm text-gray-300">Mode Maintenance</span>
              <button
                onClick={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })}
                className={`px-4 py-1 text-xs font-black transition-all ${config.maintenanceMode ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400'}`}
              >
                {config.maintenanceMode ? 'ACTIVÉ' : 'DÉSACTIVÉ'}
              </button>
            </div>
            {config.maintenanceMode && (
              <Textarea
                label="Message affiché aux utilisateurs"
                value={config.maintenanceMsg}
                onChange={e => setConfig({ ...config, maintenanceMsg: e.target.value })}
                rows={3}
                placeholder="La plateforme est en maintenance, retour prévu dans 2h..."
              />
            )}
          </div>
        </SectionBox>

        {}
        <SectionBox title="Paramètres Financiers">
          <div className="space-y-3">
            <Input label="Frais de retrait (%)" type="number" value={config.withdrawalFee} onChange={e => setConfig({ ...config, withdrawalFee: parseFloat(e.target.value) })} hint="Appliqués sur chaque retrait" />
            <Input label="Retrait minimum ($)" type="number" value={config.minWithdrawal} onChange={e => setConfig({ ...config, minWithdrawal: parseFloat(e.target.value) })} />
            <Input label="Retrait maximum ($)" type="number" value={config.maxWithdrawal} onChange={e => setConfig({ ...config, maxWithdrawal: parseFloat(e.target.value) })} />
          </div>
        </SectionBox>

        {}
        <SectionBox title="Portefeuilles USDT (dépôts)">
          <div className="space-y-3">
            {config.usdtWallets.length === 0 && (
              <Alert type="warning">Aucune adresse configurée — les utilisateurs ne peuvent pas encore déposer en USDT.</Alert>
            )}

            {config.usdtWallets.map((w, i) => (
              <div key={i} className="flex items-center gap-3 border border-yellow-900/20 rounded p-3">
                <Badge label={w.network} color="yellow" />
                <code className="flex-1 text-xs text-gray-300 break-all">{w.address}</code>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, usdtWallets: config.usdtWallets.filter((_, idx) => idx !== i) })}
                  className="text-red-500 hover:text-red-400 text-xs font-bold bg-transparent border-none cursor-pointer"
                >
                  SUPPRIMER
                </button>
              </div>
            ))}

            <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-yellow-900/20">
              <div className="w-40">
                <Select
                  label="Réseau"
                  value={newWalletNetwork}
                  onChange={e => setNewWalletNetwork(e.target.value)}
                  options={[
                    { value: 'TRC20', label: 'TRC20 (Tron)' },
                    { value: 'ERC20', label: 'ERC20 (Ethereum)' },
                    { value: 'BEP20', label: 'BEP20 (BNB Chain)' },
                    { value: 'POLYGON', label: 'Polygon' },
                  ]}
                />
              </div>
              <div className="flex-1 min-w-[220px]">
                <Input
                  label="Adresse de dépôt"
                  value={newWalletAddress}
                  onChange={e => setNewWalletAddress(e.target.value)}
                  placeholder="Adresse affichée aux utilisateurs pour ce réseau"
                />
              </div>
              <AdminBtn
                color="green"
                size="md"
                disabled={!newWalletAddress.trim() || config.usdtWallets.some(w => w.network === newWalletNetwork)}
                onClick={() => {
                  setConfig({ ...config, usdtWallets: [...config.usdtWallets, { network: newWalletNetwork, address: newWalletAddress.trim() }] });
                  setNewWalletAddress('');
                }}
              >
                + AJOUTER
              </AdminBtn>
            </div>
            {config.usdtWallets.some(w => w.network === newWalletNetwork) && (
              <p className="text-xs text-gray-600">Ce réseau a déjà une adresse configurée — supprimez-la d'abord pour la remplacer.</p>
            )}
          </div>
        </SectionBox>

        {}
        <SectionBox title="Activer / Désactiver les Modules">
          <div className="space-y-2">
            {Object.entries(config.modules).map(([key, val]) => {
              const labels = { academy: '🎓 Académie', referral: '👥 Parrainage' };
              return (
                <div key={key} className="flex items-center justify-between border border-yellow-900/20 rounded p-3">
                  <span className="text-sm text-gray-300">{labels[key] || key}</span>
                  <button
                    onClick={() => setConfig({ ...config, modules: { ...config.modules, [key]: !val } })}
                    className={`px-4 py-1 text-xs font-black transition-all ${val ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400'}`}
                  >
                    {val ? 'ACTIVÉ' : 'DÉSACTIVÉ'}
                  </button>
                </div>
              );
            })}
          </div>
        </SectionBox>
      </div>
    </div>
  );
}

function LogsTab({ api }) {
  const [logs, setLogs] = useState([]);
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [newIP, setNewIP] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [logFilter, setLogFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.allSettled([
      api.get('/admin/logs/activity'),
      api.get('/admin/security/blocked-ips'),
      api.get('/admin/users?role=admin'),
    ]).then(([logsRes, ipsRes, adminsRes]) => {
      if (logsRes.status === 'fulfilled' && logsRes.value.data.success) setLogs(logsRes.value.data.data.activities || []);
      else { setLogs([]); setError('Impossible de charger les logs'); }
      if (ipsRes.status === 'fulfilled' && ipsRes.value.data.success) setBlockedIPs(ipsRes.value.data.data.blockedIps || []);
      else setBlockedIPs([]);
      if (adminsRes.status === 'fulfilled' && adminsRes.value.data.success) setAdmins(adminsRes.value.data.data.users || []);
      else setAdmins([]);
    }).finally(() => setLoading(false));
  }, []);

  const blockIP = async () => {
    if (!newIP) return;
    try {
      const res = await api.post('/admin/security/block-ip', { ip: newIP, reason: blockReason });
      const blocked = res.data?.data?.blockedIp || { ip: newIP, reason: blockReason, blockedAt: new Date().toISOString() };
      setBlockedIPs([...blockedIPs, blocked]);
      setNewIP('');
      setBlockReason('');
    } catch (e) { console.error(e); }
  };

  const unblockIP = async (ip) => {
    try {
      await api.delete(`/admin/security/blocked-ips/${ip}`);
      setBlockedIPs(blockedIPs.filter(b => b.ip !== ip));
    } catch (e) { console.error(e); }
  };

  const levelColors = { info: 'gray', warning: 'yellow', critical: 'red' };
  const filteredLogs = logFilter === 'all' ? logs : logs.filter(l => l.level === logFilter);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="SÉCURITÉ & LOGS" subtitle="Journal d'activité et gestion des accès" />

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {}
        <SectionBox title="Administrateurs">
          <div className="space-y-2">
            {admins.map((a, i) => (
              <div key={i} className="flex items-center justify-between border border-yellow-900/20 rounded p-2">
                <div>
                  <p className="text-white text-xs font-bold">{a.firstName} {a.lastName}</p>
                  <p className="text-gray-600 text-xs">{a.email}</p>
                </div>
                <Badge label={a.role?.toUpperCase() || 'ADMIN'} color={a.role === 'superadmin' ? 'red' : 'yellow'} />
              </div>
            ))}
          </div>
        </SectionBox>

        {}
        <SectionBox title="IPs Bloquées">
          <div className="space-y-2 mb-3">
            {blockedIPs.map((b, i) => (
              <div key={i} className="border border-red-900/30 bg-red-900/10 rounded p-2 flex items-center justify-between">
                <div>
                  <p className="text-red-400 font-bold text-xs font-mono">{b.ip}</p>
                  <p className="text-gray-600 text-xs">{b.reason}</p>
                </div>
                <AdminBtn size="sm" color="gray" onClick={() => unblockIP(b.ip)}>DÉBLOQUER</AdminBtn>
              </div>
            ))}
            {blockedIPs.length === 0 && <p className="text-gray-600 text-xs">Aucune IP bloquée</p>}
          </div>
          <div className="space-y-2">
            <input
              value={newIP}
              onChange={e => setNewIP(e.target.value)}
              placeholder="Nouvelle IP..."
              className="w-full px-2 py-1 bg-black border border-yellow-900/30 rounded text-white text-xs focus:border-yellow-500 focus:outline-none font-mono"
            />
            <div className="flex gap-2">
              <input
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
                placeholder="Raison..."
                className="flex-1 px-2 py-1 bg-black border border-yellow-900/30 rounded text-white text-xs focus:border-yellow-500 focus:outline-none"
              />
              <AdminBtn size="sm" color="red" onClick={blockIP}>BLOQUER</AdminBtn>
            </div>
          </div>
        </SectionBox>

        {}
        <SectionBox title="Sécurité">
          <div className="space-y-2">
            <div className="flex justify-between text-xs border-b border-yellow-900/10 pb-2">
              <span className="text-gray-500">IPs bloquées</span>
              <span className={`font-bold ${blockedIPs.length > 0 ? 'text-red-400' : 'text-green-400'}`}>{blockedIPs.length}</span>
            </div>
          </div>
        </SectionBox>
      </div>

      {}
      <SectionBox title="Journal d'Activité Admin" action={
        <Select value={logFilter} onChange={e => setLogFilter(e.target.value)} options={[
          { value: 'all', label: 'Tous les niveaux' },
          { value: 'critical', label: 'Critiques' },
          { value: 'warning', label: 'Avertissements' },
          { value: 'info', label: 'Informations' },
        ]} />
      }>
        <AdminTable
          columns={[
            { key: 'createdAt', label: 'Heure', render: v => <span className="text-gray-500 font-mono text-xs">{v ? new Date(v).toLocaleString('fr-FR') : '—'}</span> },
            { key: 'admin', label: 'Admin', render: v => <span className="text-yellow-400 font-bold">{v ? `${v.firstName} ${v.lastName}` : 'Système'}</span> },
            { key: 'action', label: 'Action' },
            { key: 'target', label: 'Cible', render: v => <span className="font-mono text-gray-500">{v || '—'}</span> },
            { key: 'level', label: 'Niveau', render: v => <Badge label={v?.toUpperCase()} color={levelColors[v] || 'gray'} /> },
          ]}
          data={filteredLogs.slice(0, 20)}
          emptyMsg="Aucun log"
        />
      </SectionBox>
    </div>
  );
}

function ReportsTab({ api }) {
  const [period, setPeriod] = useState('month');
  const [generating, setGenerating] = useState(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats/overview').then(r => {
      if (r.data.success) setStats(r.data.data);
    }).catch(() => {});
  }, []);

  const generateReport = async (type) => {
    setGenerating(type);
    setError('');
    try {
      const res = await api.get(`/admin/reports/${type}?period=${period}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `imc_${type}_${period}.csv`;
      a.click();
    } catch (e) {
      setError(e.response?.data?.message || 'Impossible de générer le rapport');
    } finally {
      setGenerating(null);
    }
  };

  const reports = [
    { id: 'financial', icon: '💰', title: 'Rapport Financier', desc: 'Revenus, dépôts, retraits, profits nets de la période', color: 'yellow' },
    { id: 'users', icon: '👥', title: 'Rapport Utilisateurs', desc: 'Croissance, rétention, churn, taux de conversion', color: 'green' },
    { id: 'investments', icon: '📈', title: 'Rapport Investissements', desc: 'Performance par pack, ROI distribués, packs actifs', color: 'blue' },
    { id: 'kyc', icon: '🆔', title: 'Rapport KYC', desc: 'Taux de vérification, rejets, délais de traitement', color: 'red' },
    { id: 'referrals', icon: '🔗', title: 'Rapport MLM', desc: 'Performance réseau, commissions versées, top affiliés', color: 'blue' },
  ];

  return (
    <div>
      <PageHeader
        title="RAPPORTS & EXPORTS"
        subtitle="Génération de rapports de la plateforme"
        actions={
          <Select value={period} onChange={e => setPeriod(e.target.value)} options={[
            { value: 'week', label: 'Cette semaine' },
            { value: 'month', label: 'Ce mois' },
            { value: 'quarter', label: 'Ce trimestre' },
            { value: 'year', label: 'Cette année' },
          ]} />
        }
      />

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {reports.map(r => (
          <div key={r.id} className={`border border-${r.color}-900/40 rounded-lg p-5 flex items-center justify-between gap-4`}>
            <div className="flex items-start gap-3">
              <span className="text-xl">{r.icon}</span>
              <div>
                <h3 className={`font-black text-${r.color}-400 text-sm`}>{r.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{r.desc}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <AdminBtn
                size="sm"
                color={r.color === 'yellow' ? 'yellow' : 'gray'}
                onClick={() => generateReport(r.id)}
                disabled={generating === r.id}
              >
                {generating === r.id ? '...' : '⬇ CSV'}
              </AdminBtn>
            </div>
          </div>
        ))}
      </div>

      {}
      {stats && (
        <SectionBox title="Aperçu Rapide (données actuelles)">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <KPICard label="Total Investi" value={`$${(stats.totalInvested || 0).toLocaleString()}`} color="yellow" />
            <KPICard label="Retraits en Attente" value={stats.pendingWithdrawals || 0} color="blue" />
            <KPICard label="KYC en Attente" value={stats.pendingKyc || 0} color="red" />
          </div>
        </SectionBox>
      )}
    </div>
  );
}