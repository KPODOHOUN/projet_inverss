import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
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
        { id: 'referrals',     icon: '🔗', label: 'Réseau MLM' },
      ]
    },
    {
      label: 'FINANCE',
      items: [
        { id: 'investments',   icon: '💼', label: 'Investissements' },
        { id: 'transactions',  icon: '💳', label: 'Dépôts & Retraits' },
        { id: 'nlx',           icon: '🪙', label: 'Token NLX' },
      ]
    },
    {
      label: 'MODULES',
      items: [
        { id: 'mining',        icon: '⛏️', label: 'Mining' },
        { id: 'watchearn',     icon: '📺', label: 'Watch-to-Earn' },
        { id: 'academy',       icon: '🎓', label: 'Académie' },
        { id: 'vip',           icon: '✈️', label: 'VIP Expeditions' },
      ]
    },
    {
      label: 'OUTILS',
      items: [
        { id: 'communications',icon: '📢', label: 'Communications' },
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
      case 'investments':   return <InvestmentsTab api={api} />;
      case 'transactions':  return <TransactionsTab api={api} />;
      case 'nlx':           return <NLXTab api={api} />;
      case 'mining':        return <MiningTab api={api} />;
      case 'watchearn':     return <WatchEarnTab api={api} />;
      case 'academy':       return <AcademyTab api={api} />;
      case 'vip':           return <VIPTab api={api} />;
      case 'communications':return <CommunicationsTab api={api} />;
      case 'config':        return <ConfigTab api={api} />;
      case 'logs':          return <LogsTab api={api} />;
      case 'reports':       return <ReportsTab api={api} />;
      default:              return <OverviewTab api={api} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Courier New', monospace" }}>
      
      {}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b-2 border-yellow-500 h-14 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-yellow-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-yellow-500 flex items-center justify-center font-black text-black text-sm">N</div>
            <span className="font-black text-yellow-500 tracking-widest text-sm">NELIAXA</span>
            <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs font-black tracking-widest">ADMIN</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
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
            className="px-3 py-1.5 border border-yellow-500 text-yellow-500 text-xs font-bold hover:bg-yellow-500 hover:text-black transition-all tracking-widest"
          >
            SORTIR
          </button>
        </div>
      </header>

      {}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex pt-14">
        {}
        <aside className={`
          fixed lg:static top-14 left-0 h-[calc(100vh-3.5rem)] w-60 z-40 lg:z-auto
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
        <h1 className="text-2xl font-black tracking-wider text-white">{title}</h1>
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
    <div className={`bg-black border ${colors[color]} p-4 relative overflow-hidden`}>
      <div className="absolute top-2 right-3 text-2xl opacity-20">{icon}</div>
      <p className="text-xs text-gray-500 tracking-widest uppercase mb-1">{label}</p>
      <p className={`text-3xl font-black tracking-tight ${colors[color]}`}>{value}</p>
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
      <div className="border border-yellow-900/30 p-12 text-center">
        <p className="text-gray-600 text-sm tracking-wide">{emptyMsg}</p>
      </div>
    );
  }
  return (
    <div className="border border-yellow-900/30 overflow-x-auto">
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
    <span className={`px-2 py-0.5 border text-xs font-black tracking-widest uppercase ${c[color]}`}>
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
      className={`border font-black tracking-widest transition-all ${c[color]} ${s[size]} disabled:opacity-40 disabled:cursor-not-allowed`}
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
        className="relative bg-black border-2 border-yellow-500 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
        className="w-full px-3 py-2 bg-black border border-yellow-900/40 text-white text-sm focus:border-yellow-500 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
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
        className="w-full px-3 py-2 bg-black border border-yellow-900/40 text-white text-sm focus:border-yellow-500 focus:outline-none"
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
        className="w-full px-3 py-2 bg-black border border-yellow-900/40 text-white text-sm focus:border-yellow-500 focus:outline-none resize-none"
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
    <div className={`border p-3 text-xs ${c[type]}`}>{children}</div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="border-2 border-yellow-500 border-t-transparent w-8 h-8 rounded-full animate-spin" />
    </div>
  );
}

function SectionBox({ title, children, action }) {
  return (
    <div className="border border-yellow-900/30 mb-6">
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, alertsRes, activityRes] = await Promise.allSettled([
        api.get('/admin/stats/overview'),
        api.get('/admin/alerts'),
        api.get('/admin/activity/recent'),
      ]);
      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        setStats(statsRes.value.data.data);
      }
      if (alertsRes.status === 'fulfilled' && alertsRes.value.data.success) {
        setAlerts(alertsRes.value.data.data || []);
      }
      if (activityRes.status === 'fulfilled' && activityRes.value.data.success) {
        setRecentActivity(activityRes.value.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const mockStats = {
    totalUsers: stats?.totalUsers ?? 1248,
    newUsersToday: stats?.newUsersToday ?? 14,
    totalInvested: stats?.totalInvested ?? 487320,
    totalInvestedChange: stats?.totalInvestedChange ?? 8.2,
    totalNLX: stats?.totalNLX ?? 2840000,
    revenue: stats?.revenue ?? 34210,
    revenueChange: stats?.revenueChange ?? 12.4,
    pendingKYC: stats?.pendingKYC ?? 7,
    pendingWithdrawals: stats?.pendingWithdrawals ?? 3,
    activeInvestments: stats?.activeInvestments ?? 342,
  };

  const mockAlerts = alerts.length > 0 ? alerts : [
    { type: 'warning', msg: `${mockStats.pendingKYC} vérifications KYC en attente`, tab: 'kyc' },
    { type: 'warning', msg: `${mockStats.pendingWithdrawals} retraits en attente d'approbation`, tab: 'transactions' },
  ];

  const mockActivity = recentActivity.length > 0 ? recentActivity : [
    { time: 'Il y a 2 min', action: 'Nouvel utilisateur inscrit', user: 'Jean Dupont', type: 'register' },
    { time: 'Il y a 5 min', action: 'Dépôt €500 soumis', user: 'Marie C.', type: 'deposit' },
    { time: 'Il y a 12 min', action: 'KYC soumis', user: 'Ahmed K.', type: 'kyc' },
    { time: 'Il y a 18 min', action: 'Retrait €1200 demandé', user: 'Laura M.', type: 'withdrawal' },
    { time: 'Il y a 25 min', action: 'Pack Diamond acheté', user: 'Pierre L.', type: 'invest' },
  ];

  const activityColors = { register: 'green', deposit: 'blue', kyc: 'yellow', withdrawal: 'red', invest: 'purple' };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="VUE D'ENSEMBLE"
        subtitle="Tableau de bord administrateur NELIAXA"
        actions={<AdminBtn onClick={fetchData}>↻ ACTUALISER</AdminBtn>}
      />

      {}
      {mockAlerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {mockAlerts.map((a, i) => (
            <div key={i} className="flex items-center justify-between border border-yellow-800 bg-yellow-900/10 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-sm">⚠</span>
                <span className="text-xs text-yellow-300">{a.msg}</span>
              </div>
              {a.tab && (
                <button onClick={() => onNavigate(a.tab)} className="text-xs text-yellow-500 hover:text-white font-bold tracking-widest">
                  VOIR →
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <KPICard label="Utilisateurs" value={mockStats.totalUsers.toLocaleString()} sub={`+${mockStats.newUsersToday} aujourd'hui`} color="yellow" icon="👥" trend={5.3} />
        <KPICard label="Total Investi" value={`€${(mockStats.totalInvested / 1000).toFixed(0)}k`} sub="Tous les packs" color="green" icon="💰" trend={mockStats.totalInvestedChange} />
        <KPICard label="NLX Émis" value={(mockStats.totalNLX / 1000).toFixed(0) + 'k'} sub="Tokens en circulation" color="blue" icon="🪙" />
        <KPICard label="Revenus Mois" value={`€${mockStats.revenue.toLocaleString()}`} sub="Commissions plateforme" color="purple" icon="📈" trend={mockStats.revenueChange} />
        <KPICard label="Investissements" value={mockStats.activeInvestments} sub="Packs actifs" color="yellow" icon="💼" />
      </div>

      {}
      <div className="grid lg:grid-cols-3 gap-4">
        {}
        <SectionBox title="Inscriptions — 7 jours">
          <BarChart data={[
            { label: 'Lun', value: 8 },
            { label: 'Mar', value: 12 },
            { label: 'Mer', value: 6 },
            { label: 'Jeu', value: 15 },
            { label: 'Ven', value: 11 },
            { label: 'Sam', value: 9 },
            { label: 'Dim', value: mockStats.newUsersToday },
          ]} />
        </SectionBox>

        {}
        <SectionBox title="Répartition des Packs">
          <div className="space-y-2">
            {[
              { name: 'Starter (50€+)', pct: 38, color: 'bg-yellow-900' },
              { name: 'Booster (500€+)', pct: 28, color: 'bg-yellow-700' },
              { name: 'Pro (2000€+)', pct: 19, color: 'bg-yellow-500' },
              { name: 'Elite (10k€+)', pct: 11, color: 'bg-yellow-400' },
              { name: 'Diamond (50k€+)', pct: 4, color: 'bg-yellow-300' },
            ].map(p => (
              <div key={p.name}>
                <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                  <span>{p.name}</span><span className="text-yellow-500 font-bold">{p.pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-900">
                  <div className={`h-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionBox>

        {}
        <SectionBox title="Activité Récente">
          <div className="space-y-2">
            {mockActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <Badge label={a.type.slice(0,3).toUpperCase()} color={activityColors[a.type] || 'gray'} />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 truncate">{a.action}</p>
                  <p className="text-gray-600">{a.user} · {a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionBox>
      </div>

      {}
      <SectionBox title="Actions Rapides" >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'VÉRIFIER KYC', tab: 'kyc', color: 'yellow', badge: mockStats.pendingKYC },
            { label: 'RETRAITS', tab: 'transactions', color: 'green', badge: mockStats.pendingWithdrawals },
            { label: 'AJOUTER UTILISATEUR', tab: 'users', color: 'blue' },
            { label: 'RAPPORT', tab: 'reports', color: 'gray' },
          ].map(a => (
            <button
              key={a.tab}
              onClick={() => onNavigate(a.tab)}
              className={`relative border border-${a.color}-500/50 hover:border-${a.color}-500 p-3 text-xs font-black tracking-widest text-${a.color}-400 hover:bg-${a.color}-900/20 transition-all text-left`}
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
  const [period, setPeriod] = useState('30d');

  const revenueData = [
    { label: '1', value: 1200 }, { label: '5', value: 1800 }, { label: '10', value: 1500 },
    { label: '15', value: 2200 }, { label: '20', value: 1900 }, { label: '25', value: 2800 },
    { label: '30', value: 3100 },
  ];
  const depositData = [
    { label: '1', value: 3000 }, { label: '5', value: 5000 }, { label: '10', value: 4200 },
    { label: '15', value: 7800 }, { label: '20', value: 6100 }, { label: '25', value: 9200 },
    { label: '30', value: 8400 },
  ];

  return (
    <div>
      <PageHeader
        title="ANALYTICS"
        subtitle="Performance et métriques de la plateforme"
        actions={
          <Select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            options={[
              { value: '7d', label: '7 jours' },
              { value: '30d', label: '30 jours' },
              { value: '90d', label: '3 mois' },
              { value: '1y', label: '1 an' },
            ]}
          />
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KPICard label="Revenus Totaux" value="€34.2k" sub="Ce mois" color="yellow" trend={12.4} />
        <KPICard label="Volume Dépôts" value="€487k" sub="Ce mois" color="green" trend={8.7} />
        <KPICard label="Volume Retraits" value="€124k" sub="Ce mois" color="blue" trend={-3.2} />
        <KPICard label="Taux Conversion" value="24%" sub="Inscrits → Investisseurs" color="purple" trend={2.1} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <SectionBox title="Revenus Plateforme (€)">
          <BarChart data={revenueData} height={150} />
        </SectionBox>
        <SectionBox title="Volume Dépôts (€)">
          <BarChart data={depositData} height={150} />
        </SectionBox>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <SectionBox title="Sources de Revenus">
          <div className="space-y-3">
            {[
              { label: 'Frais packs investissement', val: '€18,400', pct: 54 },
              { label: 'Frais de retrait', val: '€8,200', pct: 24 },
              { label: 'Conversions NLX', val: '€4,810', pct: 14 },
              { label: 'Watch-to-Earn (pub)', val: '€2,800', pct: 8 },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{s.label}</span>
                  <span className="text-yellow-400 font-bold">{s.val}</span>
                </div>
                <div className="h-1 bg-gray-900">
                  <div className="h-full bg-yellow-500" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionBox>

        <SectionBox title="Top Pays Utilisateurs">
          <div className="space-y-2">
            {[
              { flag: '🇫🇷', pays: 'France', nb: 412, pct: 33 },
              { flag: '🇸🇳', pays: 'Sénégal', nb: 287, pct: 23 },
              { flag: '🇧🇯', pays: 'Bénin', nb: 198, pct: 16 },
              { flag: '🇨🇮', pays: 'Côte d\'Ivoire', nb: 156, pct: 12 },
              { flag: '🇲🇦', pays: 'Maroc', nb: 112, pct: 9 },
              { flag: '🌍', pays: 'Autres', nb: 83, pct: 7 },
            ].map(p => (
              <div key={p.pays} className="flex items-center gap-2 text-xs">
                <span>{p.flag}</span>
                <span className="flex-1 text-gray-400">{p.pays}</span>
                <span className="text-gray-500">{p.nb}</span>
                <div className="w-16 h-1 bg-gray-900">
                  <div className="h-full bg-yellow-600" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionBox>

        <SectionBox title="Métriques Utilisateurs">
          <div className="space-y-3">
            {[
              { label: 'Taux de rétention 30j', val: '78%', good: true },
              { label: 'Utilisateurs actifs/jour', val: '284', good: true },
              { label: 'Taux de churn mensuel', val: '4.2%', good: false },
              { label: 'Durée session moy.', val: '12 min', good: true },
              { label: 'Utilisateurs KYC vérifié', val: '892 (71%)', good: true },
              { label: 'Utilisateurs avec 2FA', val: '634 (51%)', good: true },
            ].map(m => (
              <div key={m.label} className="flex justify-between text-xs border-b border-yellow-900/10 pb-2">
                <span className="text-gray-500">{m.label}</span>
                <span className={`font-bold ${m.good ? 'text-green-400' : 'text-red-400'}`}>{m.val}</span>
              </div>
            ))}
          </div>
        </SectionBox>
      </div>
    </div>
  );
}

function UsersTab({ api }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKYC, setFilterKYC] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) setUsers(res.data.data.users || []);
    } catch (e) {
      
      setUsers(Array.from({ length: 32 }, (_, i) => ({
        id: `user_${i}`,
        firstName: ['Jean', 'Marie', 'Ahmed', 'Laura', 'Pierre'][i % 5],
        lastName: ['Dupont', 'Curie', 'Konaté', 'Martin', 'Leclerc'][i % 5],
        email: `user${i}@example.com`,
        kycStatus: ['none', 'pending', 'verified', 'rejected'][i % 4],
        accountType: ['standard', 'vip', 'admin'][i % 3],
        status: i % 8 === 0 ? 'suspended' : 'active',
        balance: Math.floor(Math.random() * 5000),
        nlxBalance: Math.floor(Math.random() * 10000),
        createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
        twoFactorEnabled: i % 3 === 0,
        activeInvestments: Math.floor(Math.random() * 4),
      })));
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !search || u.firstName?.toLowerCase().includes(q) || u.lastName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchKYC = filterKYC === 'all' || u.kycStatus === filterKYC;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchKYC && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const handleAction = async (action, userId) => {
    try {
      await api.post(`/admin/users/${userId}/${action}`);
      fetchUsers();
    } catch (e) {
      fetchUsers();
    }
    setConfirmAction(null);
  };

  const kycColors = { verified: 'green', pending: 'yellow', rejected: 'red', none: 'gray' };
  const kycLabels = { verified: 'VÉRIFIÉ', pending: 'EN ATTENTE', rejected: 'REJETÉ', none: 'AUCUN' };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="GESTION UTILISATEURS"
        subtitle={`${users.length} utilisateurs enregistrés`}
        actions={<AdminBtn color="yellow" onClick={() => setShowAddModal(true)}>+ AJOUTER</AdminBtn>}
      />

      {}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Input placeholder="Rechercher..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <Select value={filterKYC} onChange={e => setFilterKYC(e.target.value)} options={[
          { value: 'all', label: 'KYC: Tous' },
          { value: 'none', label: 'KYC: Aucun' },
          { value: 'pending', label: 'KYC: En attente' },
          { value: 'verified', label: 'KYC: Vérifié' },
          { value: 'rejected', label: 'KYC: Rejeté' },
        ]} />
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} options={[
          { value: 'all', label: 'Statut: Tous' },
          { value: 'active', label: 'Actif' },
          { value: 'suspended', label: 'Suspendu' },
        ]} />
        <div className="text-xs text-gray-500 flex items-center">{filtered.length} résultat(s)</div>
      </div>

      <AdminTable
        columns={[
          { key: 'name', label: 'Utilisateur', render: (_, r) => (
            <div>
              <p className="font-bold text-white">{r.firstName} {r.lastName}</p>
              <p className="text-gray-600">{r.email}</p>
            </div>
          )},
          { key: 'kycStatus', label: 'KYC', render: v => <Badge label={kycLabels[v] || v} color={kycColors[v] || 'gray'} /> },
          { key: 'accountType', label: 'Type', render: v => <Badge label={v?.toUpperCase()} color={v === 'admin' ? 'red' : v === 'vip' ? 'purple' : 'gray'} /> },
          { key: 'balance', label: 'Solde €', render: (_, r) => <span className="text-yellow-400 font-bold">€{r.balance?.toFixed(2)}</span> },
          { key: 'nlxBalance', label: 'NLX', render: (_, r) => <span className="text-blue-400">{r.nlxBalance?.toFixed(0)}</span> },
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
        data={paginated}
        emptyMsg="Aucun utilisateur trouvé"
      />

      {}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-4">
          <AdminBtn size="sm" color="gray" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</AdminBtn>
          <span className="text-xs text-gray-500">{page} / {totalPages}</span>
          <AdminBtn size="sm" color="gray" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>→</AdminBtn>
        </div>
      )}

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
  const [newRole, setNewRole] = useState(user.accountType);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const adjustBalance = async () => {
    if (!balanceAdj || !balanceNote) return;
    setLoading(true);
    try {
      await api.post(`/admin/users/${user.id}/adjust-balance`, {
        amount: parseFloat(balanceAdj),
        note: balanceNote
      });
      setMsg('Solde ajusté !');
      onRefresh();
    } catch (e) {
      setMsg('Erreur lors de l\'ajustement');
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async () => {
    setLoading(true);
    try {
      await api.put(`/admin/users/${user.id}/role`, { role: newRole });
      setMsg('Rôle mis à jour !');
      onRefresh();
    } catch (e) {
      setMsg('Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {msg && <Alert type="success">{msg}</Alert>}

      <div className="grid grid-cols-2 gap-3 text-xs">
        {[
          ['Email', user.email],
          ['Membre depuis', new Date(user.createdAt).toLocaleDateString('fr-FR')],
          ['Solde €', `€${user.balance?.toFixed(2)}`],
          ['Solde NLX', user.nlxBalance?.toFixed(0)],
          ['KYC', user.kycStatus],
          ['2FA', user.twoFactorEnabled ? 'Activé' : 'Désactivé'],
          ['Investissements actifs', user.activeInvestments],
          ['Statut', user.status],
        ].map(([k, v]) => (
          <div key={k} className="border border-yellow-900/20 p-2">
            <p className="text-gray-600">{k}</p>
            <p className="text-white font-bold">{v}</p>
          </div>
        ))}
      </div>

      <SectionBox title="Ajuster le Solde €">
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
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', accountType: 'standard' });
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
      <Select label="Type de compte" value={form.accountType} onChange={e => setForm({ ...form, accountType: e.target.value })} options={[
        { value: 'standard', label: 'Standard' },
        { value: 'vip', label: 'VIP' },
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
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchKYC(); }, [filter]);

  const fetchKYC = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/kyc?status=${filter}`);
      if (res.data.success) setItems(res.data.data || []);
    } catch {
      setItems(Array.from({ length: 7 }, (_, i) => ({
        id: `kyc_${i}`,
        userId: `user_${i}`,
        userName: ['Jean Dupont', 'Marie C.', 'Ahmed K.', 'Laura M.', 'Pierre L.'][i % 5],
        userEmail: `user${i}@ex.com`,
        submittedAt: new Date(Date.now() - i * 3600000 * 4).toISOString(),
        status: filter,
        idDocumentUrl: null,
        selfieUrl: null,
      })));
    } finally {
      setLoading(false);
    }
  };

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
          <Select value={filter} onChange={e => setFilter(e.target.value)} options={[
            { value: 'pending', label: 'En attente' },
            { value: 'verified', label: 'Approuvés' },
            { value: 'rejected', label: 'Rejetés' },
          ]} />
        }
      />

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
                  <p className="font-bold text-white text-sm">{item.userName}</p>
                  <p className="text-xs text-gray-500">{item.userEmail}</p>
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
            <SectionBox title={`KYC — ${selected.userName}`}>
              <div className="space-y-4">
                {}
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-yellow-900/30 p-3 text-center">
                    {selected.idDocumentUrl ? (
                      <img src={selected.idDocumentUrl} alt="ID Doc" className="max-h-32 mx-auto" />
                    ) : (
                      <div className="h-24 flex items-center justify-center bg-gray-900">
                        <p className="text-gray-600 text-xs">Pièce d'identité</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">PIÈCE D'IDENTITÉ</p>
                    {selected.idDocumentUrl && (
                      <a href={selected.idDocumentUrl} target="_blank" rel="noreferrer" className="text-xs text-yellow-500 hover:underline">Ouvrir</a>
                    )}
                  </div>
                  <div className="border border-yellow-900/30 p-3 text-center">
                    {selected.selfieUrl ? (
                      <img src={selected.selfieUrl} alt="Selfie" className="max-h-32 mx-auto" />
                    ) : (
                      <div className="h-24 flex items-center justify-center bg-gray-900">
                        <p className="text-gray-600 text-xs">Selfie</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">SELFIE</p>
                    {selected.selfieUrl && (
                      <a href={selected.selfieUrl} target="_blank" rel="noreferrer" className="text-xs text-yellow-500 hover:underline">Ouvrir</a>
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
            <div className="border border-yellow-900/20 p-8 text-center">
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
  const [commissions, setCommissions] = useState([
    { level: 1, label: 'Niveau 1 (Directs)', rate: 10, rateBooster: 15 },
    { level: 2, label: 'Niveau 2', rate: 3, rateBooster: 3 },
    { level: 3, label: 'Niveau 3', rate: 1, rateBooster: 1 },
  ]);
  const [suspiciousUsers, setSuspiciousUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/referrals/stats');
      if (res.data.success) setStats(res.data.data);
    } catch {
      setStats({
        totalReferrals: 487,
        activeNetworks: 124,
        totalCommissionsPaid: 28400,
        biggestNetwork: { user: 'Pierre L.', size: 48 },
        suspiciousAccounts: 3,
      });
      setSuspiciousUsers([
        { name: 'Compte X', ip: '192.168.1.1', referrals: 12, flag: 'Même IP' },
        { name: 'Compte Y', ip: '192.168.1.1', referrals: 9, flag: 'Même IP' },
        { name: 'Compte Z', ip: '10.0.0.5', referrals: 6, flag: 'Inscriptions massives' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const saveCommissions = async () => {
    try {
      await api.put('/admin/referrals/commissions', { commissions });
      alert('Commissions mises à jour !');
    } catch (e) { console.error(e); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="RÉSEAU MLM & PARRAINAGE" subtitle="Gestion des commissions et surveillance" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KPICard label="Total Parrainages" value={stats?.totalReferrals} color="yellow" icon="🔗" />
        <KPICard label="Réseaux Actifs" value={stats?.activeNetworks} color="green" icon="🌐" />
        <KPICard label="Commissions Versées" value={`${stats?.totalCommissionsPaid} NLX`} color="blue" icon="💰" />
        <KPICard label="Plus Grand Réseau" value={`${stats?.biggestNetwork?.size} membres`} sub={stats?.biggestNetwork?.user} color="purple" icon="🏆" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {}
        <SectionBox title="Configuration des Commissions" action={<AdminBtn size="sm" color="green" onClick={saveCommissions}>SAUVER</AdminBtn>}>
          <div className="space-y-4">
            {commissions.map((c, i) => (
              <div key={c.level} className="border border-yellow-900/20 p-3">
                <p className="text-xs font-bold text-yellow-500 mb-2">{c.label}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Taux standard (%)"
                    type="number"
                    value={c.rate}
                    onChange={e => {
                      const updated = [...commissions];
                      updated[i].rate = parseFloat(e.target.value);
                      setCommissions(updated);
                    }}
                  />
                  <Input
                    label="Taux Booster+ (%)"
                    type="number"
                    value={c.rateBooster}
                    onChange={e => {
                      const updated = [...commissions];
                      updated[i].rateBooster = parseFloat(e.target.value);
                      setCommissions(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionBox>

        {}
        <SectionBox title="Comptes Suspects / Anti-fraude">
          {suspiciousUsers.length === 0 ? (
            <Alert type="success">Aucun compte suspect détecté</Alert>
          ) : (
            <div className="space-y-2">
              {suspiciousUsers.map((u, i) => (
                <div key={i} className="border border-red-900/40 bg-red-900/10 p-3 flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-sm">{u.name}</p>
                    <p className="text-xs text-gray-500">IP: {u.ip} · {u.referrals} parrainages</p>
                    <Badge label={u.flag} color="red" />
                  </div>
                  <AdminBtn color="red" size="sm">BANNIR</AdminBtn>
                </div>
              ))}
            </div>
          )}
        </SectionBox>
      </div>

      {}
      <SectionBox title="Top Affiliés">
        <AdminTable
          columns={[
            { key: 'rank', label: '#', render: (_, __, i) => <span className="text-yellow-500 font-black">#{i + 1}</span> },
            { key: 'name', label: 'Utilisateur' },
            { key: 'referrals', label: 'Filleuls' },
            { key: 'active', label: 'Actifs', render: v => <span className="text-green-400 font-bold">{v}</span> },
            { key: 'commissions', label: 'Commissions NLX', render: v => <span className="text-yellow-400 font-bold">{v}</span> },
          ]}
          data={[
            { rank: 1, name: 'Pierre Leclerc', referrals: 48, active: 32, commissions: '4,820 NLX' },
            { rank: 2, name: 'Marie Curie', referrals: 36, active: 24, commissions: '3,240 NLX' },
            { rank: 3, name: 'Ahmed Konaté', referrals: 29, active: 18, commissions: '2,610 NLX' },
            { rank: 4, name: 'Jean Dupont', referrals: 22, active: 15, commissions: '1,980 NLX' },
            { rank: 5, name: 'Laura Martin', referrals: 18, active: 12, commissions: '1,620 NLX' },
          ]}
        />
      </SectionBox>
    </div>
  );
}

function InvestmentsTab({ api }) {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [filterPack, setFilterPack] = useState('all');
  const [selected, setSelected] = useState(null);
  const [packConfig, setPackConfig] = useState([
    { id: 'starter', name: 'Starter', min: 50, max: 499, roi: '4-6', duration: 12 },
    { id: 'booster', name: 'Booster', min: 500, max: 1999, roi: '5-8', duration: 10 },
    { id: 'pro', name: 'Pro', min: 2000, max: 9999, roi: '6-10', duration: 8 },
    { id: 'elite', name: 'Elite', min: 10000, max: 49999, roi: '7-12', duration: 6 },
    { id: 'diamond', name: 'Diamond', min: 50000, max: null, roi: '8-15', duration: 4 },
  ]);
  const [showPackConfig, setShowPackConfig] = useState(false);

  useEffect(() => { fetchInvestments(); }, [filter]);

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/investments?status=${filter}`);
      if (res.data.success) setInvestments(res.data.data || []);
    } catch {
      setInvestments(Array.from({ length: 15 }, (_, i) => ({
        id: `inv_${i}`,
        userId: `user_${i}`,
        userName: ['Jean Dupont', 'Marie C.', 'Ahmed K.', 'Laura M.', 'Pierre L.'][i % 5],
        pack: ['starter', 'booster', 'pro', 'elite', 'diamond'][i % 5],
        amount: [50, 500, 2000, 10000, 50000][i % 5],
        roi: [4.5, 6.2, 8.1, 10.5, 13.2][i % 5],
        earnings: [9, 124, 648, 3675, 21780][i % 5],
        status: filter,
        createdAt: new Date(Date.now() - i * 86400000 * 10).toISOString(),
        endDate: new Date(Date.now() + i * 86400000 * 30).toISOString(),
      })));
    } finally {
      setLoading(false);
    }
  };

  const packColors = { starter: 'gray', booster: 'blue', pro: 'yellow', elite: 'purple', diamond: 'green' };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="GESTION INVESTISSEMENTS"
        subtitle={`${investments.length} investissement(s)`}
        actions={<AdminBtn onClick={() => setShowPackConfig(!showPackConfig)}>⚙ PACKS CONFIG</AdminBtn>}
      />

      {}
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
        {['starter', 'booster', 'pro', 'elite', 'diamond'].map(p => (
          <div key={p} className={`border border-${packColors[p]}-500/30 p-3 text-center`}>
            <p className="text-xs text-gray-500 uppercase tracking-widest">{p}</p>
            <p className="text-xl font-black text-yellow-400">{investments.filter(i => i.pack === p).length}</p>
          </div>
        ))}
      </div>

      {}
      {showPackConfig && (
        <SectionBox title="Configuration des Packs" action={
          <AdminBtn color="green" size="sm" onClick={async () => {
            try { await api.put('/admin/investments/packs-config', { packs: packConfig }); alert('Packs mis à jour !'); } catch (e) { }
          }}>SAUVER</AdminBtn>
        }>
          <div className="grid lg:grid-cols-3 gap-3">
            {packConfig.map((pack, i) => (
              <div key={pack.id} className="border border-yellow-900/20 p-3 space-y-2">
                <p className="text-xs font-black text-yellow-500 tracking-widest">{pack.name.toUpperCase()}</p>
                <Input label="Min €" type="number" value={pack.min} onChange={e => {
                  const u = [...packConfig]; u[i].min = parseFloat(e.target.value); setPackConfig(u);
                }} />
                <Input label="ROI (%)" value={pack.roi} onChange={e => {
                  const u = [...packConfig]; u[i].roi = e.target.value; setPackConfig(u);
                }} />
                <Input label="Durée (semaines)" type="number" value={pack.duration} onChange={e => {
                  const u = [...packConfig]; u[i].duration = parseInt(e.target.value); setPackConfig(u);
                }} />
              </div>
            ))}
          </div>
        </SectionBox>
      )}

      {}
      <div className="flex gap-3 mb-4">
        <Select value={filter} onChange={e => setFilter(e.target.value)} options={[
          { value: 'active', label: 'Actifs' },
          { value: 'completed', label: 'Terminés' },
          { value: 'pending', label: 'En attente' },
          { value: 'cancelled', label: 'Annulés' },
        ]} />
        <Select value={filterPack} onChange={e => setFilterPack(e.target.value)} options={[
          { value: 'all', label: 'Tous les packs' },
          { value: 'starter', label: 'Starter' },
          { value: 'booster', label: 'Booster' },
          { value: 'pro', label: 'Pro' },
          { value: 'elite', label: 'Elite' },
          { value: 'diamond', label: 'Diamond' },
        ]} />
      </div>

      <AdminTable
        columns={[
          { key: 'userName', label: 'Utilisateur' },
          { key: 'pack', label: 'Pack', render: v => <Badge label={v?.toUpperCase()} color={packColors[v] || 'gray'} /> },
          { key: 'amount', label: 'Montant', render: v => <span className="text-yellow-400 font-bold">€{v?.toLocaleString()}</span> },
          { key: 'roi', label: 'ROI', render: v => <span className="text-green-400 font-bold">+{v}%</span> },
          { key: 'earnings', label: 'Gains', render: v => <span className="text-blue-400">€{v?.toFixed(2)}</span> },
          { key: 'endDate', label: 'Fin', render: v => <span className="text-gray-400">{new Date(v).toLocaleDateString('fr-FR')}</span> },
          { key: 'actions', label: '', render: (_, r) => (
            <div className="flex gap-1">
              <AdminBtn size="sm" onClick={() => setSelected(r)}>VOIR</AdminBtn>
              {r.status === 'active' && <AdminBtn size="sm" color="red" onClick={async () => {
                await api.post(`/admin/investments/${r.id}/close`);
                fetchInvestments();
              }}>CLORE</AdminBtn>}
            </div>
          )},
        ]}
        data={filterPack === 'all' ? investments : investments.filter(i => i.pack === filterPack)}
        emptyMsg="Aucun investissement"
      />

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Investissement — ${selected?.userName}`}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                ['Pack', selected.pack], ['Montant', `€${selected.amount}`],
                ['ROI actuel', `${selected.roi}%`], ['Gains', `€${selected.earnings}`],
                ['Créé le', new Date(selected.createdAt).toLocaleDateString('fr-FR')],
                ['Fin le', new Date(selected.endDate).toLocaleDateString('fr-FR')],
              ].map(([k, v]) => (
                <div key={k} className="border border-yellow-900/20 p-2">
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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchTransactions(); }, [filter, typeFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/transactions?status=${filter}&type=${typeFilter}`);
      if (res.data.success) setTransactions(res.data.data || []);
    } catch {
      setTransactions(Array.from({ length: 20 }, (_, i) => ({
        id: `tx_${i}`,
        userId: `user_${i}`,
        userName: ['Jean Dupont', 'Marie C.', 'Ahmed K.', 'Laura M.', 'Pierre L.'][i % 5],
        type: ['deposit', 'withdrawal', 'investment'][i % 3],
        method: ['Virement', 'Crypto BTC', 'Carte', 'PayPal'][i % 4],
        amount: [200, 1500, 500, 3000, 750][i % 5],
        status: filter,
        createdAt: new Date(Date.now() - i * 3600000 * 6).toISOString(),
        reference: `TXN-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        proof: null,
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (txId) => {
    setProcessing(true);
    try {
      await api.post(`/admin/transactions/${txId}/approve`);
      fetchTransactions();
      setSelected(null);
    } catch (e) { console.error(e); } finally { setProcessing(false); }
  };

  const handleReject = async (txId) => {
    if (!rejectReason) return;
    setProcessing(true);
    try {
      await api.post(`/admin/transactions/${txId}/reject`, { reason: rejectReason });
      fetchTransactions();
      setSelected(null);
      setRejectReason('');
    } catch (e) { console.error(e); } finally { setProcessing(false); }
  };

  const typeColors = { deposit: 'green', withdrawal: 'red', investment: 'blue' };
  const typeLabels = { deposit: 'DÉPÔT', withdrawal: 'RETRAIT', investment: 'INVESTISSEMENT' };

  if (loading) return <LoadingSpinner />;

  const pending = transactions.filter(t => t.status === 'pending');

  return (
    <div>
      <PageHeader
        title="DÉPÔTS & RETRAITS"
        subtitle={`${pending.length} en attente d'approbation`}
      />

      {pending.length > 0 && filter === 'pending' && (
        <Alert type="warning" className="mb-4">
          {pending.length} transaction(s) en attente de traitement
        </Alert>
      )}

      <div className="flex gap-3 mb-4 flex-wrap">
        <Select value={filter} onChange={e => setFilter(e.target.value)} options={[
          { value: 'pending', label: 'En attente' },
          { value: 'completed', label: 'Complétées' },
          { value: 'rejected', label: 'Rejetées' },
          { value: 'all', label: 'Toutes' },
        ]} />
        <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} options={[
          { value: 'all', label: 'Tous types' },
          { value: 'deposit', label: 'Dépôts uniquement' },
          { value: 'withdrawal', label: 'Retraits uniquement' },
        ]} />
        <AdminBtn color="gray" onClick={() => {
          const csv = transactions.map(t => `${t.id},${t.userName},${t.type},${t.amount},${t.status},${t.createdAt}`).join('\n');
          const blob = new Blob([`ID,Nom,Type,Montant,Statut,Date\n${csv}`], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
        }}>⬇ EXPORT CSV</AdminBtn>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <AdminTable
            columns={[
              { key: 'userName', label: 'Utilisateur' },
              { key: 'type', label: 'Type', render: v => <Badge label={typeLabels[v] || v} color={typeColors[v] || 'gray'} /> },
              { key: 'amount', label: 'Montant', render: v => <span className="text-yellow-400 font-bold">€{v?.toLocaleString()}</span> },
              { key: 'method', label: 'Méthode' },
              { key: 'actions', label: '', render: (_, r) => <AdminBtn size="sm" onClick={() => setSelected(r)}>VOIR</AdminBtn> },
            ]}
            data={transactions}
            emptyMsg="Aucune transaction"
          />
        </div>

        <div>
          {selected ? (
            <SectionBox title={`Transaction — ${selected.reference}`}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ['Utilisateur', selected.userName],
                    ['Type', typeLabels[selected.type] || selected.type],
                    ['Montant', `€${selected.amount?.toLocaleString()}`],
                    ['Méthode', selected.method],
                    ['Référence', selected.reference],
                    ['Date', new Date(selected.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })],
                  ].map(([k, v]) => (
                    <div key={k} className="border border-yellow-900/20 p-2">
                      <p className="text-gray-600">{k}</p>
                      <p className="text-white font-bold">{v}</p>
                    </div>
                  ))}
                </div>

                {selected.proof && (
                  <div className="border border-yellow-900/30 p-3 text-center">
                    <img src={selected.proof} alt="Preuve de paiement" className="max-h-40 mx-auto" />
                    <p className="text-xs text-gray-500 mt-2">Preuve de paiement</p>
                  </div>
                )}

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

                {selected.status !== 'pending' && (
                  <Badge label={selected.status === 'completed' ? 'APPROUVÉE' : 'REJETÉE'} color={selected.status === 'completed' ? 'green' : 'red'} />
                )}
              </div>
            </SectionBox>
          ) : (
            <div className="border border-yellow-900/20 p-8 text-center">
              <p className="text-gray-600 text-sm">Sélectionnez une transaction</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NLXTab({ api }) {
  const [stats, setStats] = useState(null);
  const [rate, setRate] = useState('0.05');
  const [adjustUserId, setAdjustUserId] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/admin/nlx/stats').then(r => {
      if (r.data.success) setStats(r.data.data);
    }).catch(() => {
      setStats({
        totalEmitted: 2840000,
        totalCirculating: 1920000,
        totalBurned: 120000,
        fromMining: 840000,
        fromWatchEarn: 380000,
        fromReferral: 490000,
        fromBonus: 210000,
        rate: 0.05,
      });
    });
  }, []);

  const saveRate = async () => {
    setLoading(true);
    try {
      await api.put('/admin/nlx/rate', { rate: parseFloat(rate) });
      setMsg('Taux NLX/EUR mis à jour !');
    } catch (e) { setMsg('Erreur'); } finally { setLoading(false); }
  };

  const adjustNLX = async () => {
    setLoading(true);
    try {
      await api.post('/admin/nlx/adjust', { userId: adjustUserId, amount: parseFloat(adjustAmount), note: adjustNote });
      setMsg('NLX ajusté !');
      setAdjustUserId(''); setAdjustAmount(''); setAdjustNote('');
    } catch (e) { setMsg('Erreur'); } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title="TOKEN NLX" subtitle="Gestion de l'économie du token NLX" />

      {msg && <Alert type="success">{msg}</Alert>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KPICard label="Total Émis" value={`${((stats?.totalEmitted || 0) / 1000).toFixed(0)}k`} color="yellow" icon="🪙" />
        <KPICard label="En Circulation" value={`${((stats?.totalCirculating || 0) / 1000).toFixed(0)}k`} color="green" icon="🔄" />
        <KPICard label="Brûlés" value={`${((stats?.totalBurned || 0) / 1000).toFixed(0)}k`} color="red" icon="🔥" />
        <KPICard label="Taux NLX/EUR" value={`€${stats?.rate || 0.05}`} color="blue" icon="💱" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {}
        <SectionBox title="Distribution par Source">
          <div className="space-y-3">
            {[
              { src: 'Mining', val: stats?.fromMining || 840000, color: 'yellow' },
              { src: 'Parrainage', val: stats?.fromReferral || 490000, color: 'green' },
              { src: 'Watch-to-Earn', val: stats?.fromWatchEarn || 380000, color: 'blue' },
              { src: 'Bonus', val: stats?.fromBonus || 210000, color: 'purple' },
            ].map(s => {
              const total = stats?.totalEmitted || 1920000;
              const pct = Math.round((s.val / total) * 100);
              return (
                <div key={s.src}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{s.src}</span>
                    <span className={`text-${s.color}-400 font-bold`}>{(s.val / 1000).toFixed(0)}k NLX</span>
                  </div>
                  <div className="h-1.5 bg-gray-900">
                    <div className={`h-full bg-${s.color}-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionBox>

        {}
        <SectionBox title="Taux de Change NLX/EUR">
          <div className="space-y-3">
            <Input
              label="1 NLX = X EUR"
              type="number"
              value={rate}
              onChange={e => setRate(e.target.value)}
              hint="Taux affiché aux utilisateurs pour la conversion"
            />
            <div className="text-xs text-gray-600 border border-yellow-900/20 p-2">
              <p>Taux actuel: <span className="text-yellow-400 font-bold">1 NLX = €{stats?.rate || 0.05}</span></p>
              <p>Nouveau: <span className="text-green-400 font-bold">1 NLX = €{rate}</span></p>
            </div>
            <AdminBtn color="yellow" onClick={saveRate} disabled={loading}>METTRE À JOUR</AdminBtn>
          </div>
        </SectionBox>

        {}
        <SectionBox title="Ajustement Manuel NLX">
          <div className="space-y-2">
            <Input label="ID ou Email Utilisateur" value={adjustUserId} onChange={e => setAdjustUserId(e.target.value)} placeholder="user@example.com" />
            <Input label="Montant NLX (+ ou -)" type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} placeholder="Ex: 500 ou -100" />
            <Input label="Raison" value={adjustNote} onChange={e => setAdjustNote(e.target.value)} placeholder="Motif obligatoire" />
            <AdminBtn color="yellow" onClick={adjustNLX} disabled={loading || !adjustUserId || !adjustAmount || !adjustNote}>
              APPLIQUER
            </AdminBtn>
          </div>
        </SectionBox>
      </div>
    </div>
  );
}

function MiningTab({ api }) {
  const [miners, setMiners] = useState([]);
  const [config, setConfig] = useState({
    enabled: true, rewardPerBlock: 10, difficulty: 'medium', maxHashratePerPack: {
      starter: 100, booster: 500, pro: 2000, elite: 8000, diamond: 30000
    }
  });
  const [stats, setStats] = useState({ totalMiners: 0, totalHashrate: 0, dailyNLX: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.get('/admin/mining/stats'),
      api.get('/admin/mining/config'),
      api.get('/admin/mining/active'),
    ]).then(([statsRes, cfgRes, minersRes]) => {
      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) setStats(statsRes.value.data.data);
      if (cfgRes.status === 'fulfilled' && cfgRes.value.data.success) setConfig(cfgRes.value.data.data);
      if (minersRes.status === 'fulfilled' && minersRes.value.data.success) setMiners(minersRes.value.data.data || []);
    }).catch(() => {
      setStats({ totalMiners: 248, totalHashrate: 1240000, dailyNLX: 4800 });
      setMiners(Array.from({ length: 10 }, (_, i) => ({
        userName: ['Jean', 'Marie', 'Ahmed', 'Laura', 'Pierre'][i % 5],
        pack: ['starter', 'booster', 'pro', 'elite', 'diamond'][i % 5],
        hashrate: [100, 500, 2000, 8000, 30000][i % 5],
        dailyNLX: [0.5, 2.5, 10, 40, 150][i % 5],
        startedAt: new Date(Date.now() - i * 3600000 * 24).toISOString(),
      })));
    }).finally(() => setLoading(false));
  }, []);

  const saveConfig = async () => {
    try {
      await api.put('/admin/mining/config', config);
      alert('Configuration mining mise à jour !');
    } catch (e) { console.error(e); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="GESTION MINING NLX" subtitle="Paramètres et surveillance du mining" />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <KPICard label="Miners Actifs" value={stats.totalMiners || 248} color="yellow" icon="⛏️" />
        <KPICard label="Hashrate Total" value={`${((stats.totalHashrate || 1240000) / 1000).toFixed(0)}k H/s`} color="blue" icon="⚡" />
        <KPICard label="NLX Minés/Jour" value={stats.dailyNLX || 4800} color="green" icon="🪙" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {}
        <SectionBox title="Configuration Mining" action={<AdminBtn color="green" size="sm" onClick={saveConfig}>SAUVER</AdminBtn>}>
          <div className="space-y-3">
            <div className="flex items-center justify-between border border-yellow-900/20 p-3">
              <span className="text-sm text-gray-300">Module Mining</span>
              <button
                onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                className={`px-4 py-1 text-xs font-black transition-all ${config.enabled ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400'}`}
              >
                {config.enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}
              </button>
            </div>
            <Input label="Récompense par bloc (NLX)" type="number" value={config.rewardPerBlock} onChange={e => setConfig({ ...config, rewardPerBlock: parseFloat(e.target.value) })} />
            <Select label="Difficulté" value={config.difficulty} onChange={e => setConfig({ ...config, difficulty: e.target.value })} options={[
              { value: 'easy', label: 'Facile' },
              { value: 'medium', label: 'Moyen' },
              { value: 'hard', label: 'Difficile' },
            ]} />
            <div>
              <p className="text-xs font-black text-yellow-500 tracking-widest mb-2">HASHRATE MAX PAR PACK (H/s)</p>
              <div className="space-y-2">
                {Object.entries(config.maxHashratePerPack).map(([pack, val]) => (
                  <div key={pack} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-16">{pack}</span>
                    <input
                      type="number"
                      value={val}
                      onChange={e => setConfig({ ...config, maxHashratePerPack: { ...config.maxHashratePerPack, [pack]: parseInt(e.target.value) } })}
                      className="flex-1 px-2 py-1 bg-black border border-yellow-900/30 text-white text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionBox>

        {}
        <SectionBox title="Top Miners Actifs">
          <AdminTable
            columns={[
              { key: 'userName', label: 'Miner' },
              { key: 'pack', label: 'Pack', render: v => <Badge label={v?.toUpperCase()} color="gray" /> },
              { key: 'hashrate', label: 'H/s', render: v => <span className="text-blue-400 font-bold">{v?.toLocaleString()}</span> },
              { key: 'dailyNLX', label: 'NLX/Jour', render: v => <span className="text-yellow-400 font-bold">{v}</span> },
            ]}
            data={miners}
            emptyMsg="Aucun miner actif"
          />
        </SectionBox>
      </div>
    </div>
  );
}

function WatchEarnTab({ api }) {
  const [ads, setAds] = useState([]);
  const [stats, setStats] = useState(null);
  const [showAddAd, setShowAddAd] = useState(false);
  const [newAd, setNewAd] = useState({ title: '', description: '', duration: 30, reward: 1, type: 'partner', active: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.get('/admin/ads'),
      api.get('/admin/ads/stats'),
    ]).then(([adsRes, statsRes]) => {
      if (adsRes.status === 'fulfilled' && adsRes.value.data.success) setAds(adsRes.value.data.data || []);
      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) setStats(statsRes.value.data.data);
    }).catch(() => {
      setStats({ totalViews: 8420, dailyViews: 284, nlxDistributed: 12630, activeAds: 8 });
      setAds([
        { id: 'ad1', title: 'Présentation NELIAXA', description: 'Découvrez notre plateforme', duration: 30, reward: 0.5, type: 'internal', active: true, views: 1240 },
        { id: 'ad2', title: 'Pack Booster Promo', description: 'Doublez vos gains avec le pack Booster', duration: 45, reward: 1.5, type: 'internal', active: true, views: 890 },
        { id: 'ad3', title: 'Crypto News #12', description: 'Actualités crypto de la semaine', duration: 60, reward: 2, type: 'partner', active: false, views: 342 },
      ]);
    }).finally(() => setLoading(false));
  }, []);

  const toggleAd = async (adId, active) => {
    try {
      await api.put(`/admin/ads/${adId}`, { active: !active });
      setAds(ads.map(a => a.id === adId ? { ...a, active: !active } : a));
    } catch (e) { console.error(e); }
  };

  const deleteAd = async (adId) => {
    try {
      await api.delete(`/admin/ads/${adId}`);
      setAds(ads.filter(a => a.id !== adId));
    } catch (e) { console.error(e); }
  };

  const createAd = async () => {
    try {
      const res = await api.post('/admin/ads', newAd);
      if (res.data.success) {
        setAds([...ads, res.data.data]);
        setShowAddAd(false);
        setNewAd({ title: '', description: '', duration: 30, reward: 1, type: 'partner', active: true });
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="WATCH-TO-EARN"
        subtitle="Gestion des publicités rémunérées"
        actions={<AdminBtn onClick={() => setShowAddAd(true)}>+ AJOUTER UNE PUB</AdminBtn>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KPICard label="Vues Total" value={(stats?.totalViews || 0).toLocaleString()} color="yellow" icon="👁" />
        <KPICard label="Vues Aujourd'hui" value={stats?.dailyViews || 0} color="green" icon="📺" />
        <KPICard label="NLX Distribués" value={`${stats?.nlxDistributed || 0}`} color="blue" icon="🪙" />
        <KPICard label="Pubs Actives" value={stats?.activeAds || 0} color="purple" icon="✅" />
      </div>

      <div className="space-y-3">
        {ads.map(ad => (
          <div key={ad.id} className={`border p-4 flex items-center justify-between gap-4 ${ad.active ? 'border-yellow-900/40' : 'border-gray-800 opacity-60'}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-white text-sm">{ad.title}</p>
                <Badge label={ad.type === 'internal' ? 'NELIAXA' : 'PARTENAIRE'} color={ad.type === 'internal' ? 'yellow' : 'blue'} />
                {ad.active ? <Badge label="ACTIVE" color="green" /> : <Badge label="INACTIVE" color="gray" />}
              </div>
              <p className="text-xs text-gray-500">{ad.description}</p>
              <p className="text-xs text-gray-600 mt-1">⏱ {ad.duration}s · 🪙 {ad.reward} NLX · 👁 {ad.views?.toLocaleString() || 0} vues</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <AdminBtn size="sm" color={ad.active ? 'gray' : 'green'} onClick={() => toggleAd(ad.id, ad.active)}>
                {ad.active ? 'DÉSACTIVER' : 'ACTIVER'}
              </AdminBtn>
              <AdminBtn size="sm" color="red" onClick={() => deleteAd(ad.id)}>SUP</AdminBtn>
            </div>
          </div>
        ))}
        {ads.length === 0 && <Alert type="info">Aucune publicité configurée</Alert>}
      </div>

      {}
      <SectionBox title="Configuration Récompenses par Niveau">
        <AdminTable
          columns={[
            { key: 'level', label: 'Niveau' },
            { key: 'pack', label: 'Pack Requis' },
            { key: 'limit', label: 'Pubs/Jour', render: v => <span className="text-white font-bold">{v}</span> },
            { key: 'reward', label: 'NLX/Vue', render: v => <span className="text-yellow-400 font-bold">{v}</span> },
          ]}
          data={[
            { level: 'Bronze', pack: 'Starter (50€+)', limit: 1, reward: '0.5' },
            { level: 'Argent', pack: 'Booster (500€+)', limit: 3, reward: '1-2' },
            { level: 'Or', pack: 'Pro (2000€+)', limit: 5, reward: '2-3' },
            { level: 'Platine', pack: 'Elite (10k€+)', limit: 10, reward: '3-5' },
            { level: 'Diamond', pack: 'Diamond (50k€+)', limit: 20, reward: '5-10' },
          ]}
        />
      </SectionBox>

      {}
      <Modal open={showAddAd} onClose={() => setShowAddAd(false)} title="AJOUTER UNE PUBLICITÉ">
        <div className="space-y-3">
          <Input label="Titre" value={newAd.title} onChange={e => setNewAd({ ...newAd, title: e.target.value })} />
          <Textarea label="Description" value={newAd.description} onChange={e => setNewAd({ ...newAd, description: e.target.value })} rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Durée (secondes)" type="number" value={newAd.duration} onChange={e => setNewAd({ ...newAd, duration: parseInt(e.target.value) })} />
            <Input label="Récompense (NLX)" type="number" value={newAd.reward} onChange={e => setNewAd({ ...newAd, reward: parseFloat(e.target.value) })} />
          </div>
          <Select label="Type" value={newAd.type} onChange={e => setNewAd({ ...newAd, type: e.target.value })} options={[
            { value: 'internal', label: 'Publicité NELIAXA' },
            { value: 'partner', label: 'Partenaire externe' },
          ]} />
          <div className="flex gap-2 pt-2">
            <AdminBtn size="md" color="yellow" onClick={createAd}>CRÉER</AdminBtn>
            <AdminBtn size="md" color="gray" onClick={() => setShowAddAd(false)}>ANNULER</AdminBtn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AcademyTab({ api }) {
  const [courses, setCourses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', category: 'crypto', level: 'beginner', rewardNLX: 10 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/academy/courses').then(r => {
      if (r.data.success) setCourses(r.data.data || []);
    }).catch(() => {
      setCourses([
        { id: 'c1', title: 'Introduction au Crypto', category: 'crypto', level: 'beginner', rewardNLX: 10, completions: 487, active: true },
        { id: 'c2', title: 'Comment investir intelligemment', category: 'investment', level: 'intermediate', rewardNLX: 25, completions: 312, active: true },
        { id: 'c3', title: 'Comprendre NELIAXA', category: 'platform', level: 'beginner', rewardNLX: 15, completions: 891, active: true },
        { id: 'c4', title: 'Analyse Technique Avancée', category: 'trading', level: 'advanced', rewardNLX: 50, completions: 124, active: false },
      ]);
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
        setCourses([...courses, res.data.data]);
        setShowAdd(false);
      }
    } catch (e) { console.error(e); }
  };

  const levelColors = { beginner: 'green', intermediate: 'yellow', advanced: 'red' };
  const categoryIcons = { crypto: '₿', investment: '📈', platform: '🏛', trading: '📊' };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="ACADÉMIE NELIAXA"
        subtitle={`${courses.length} cours disponibles`}
        actions={<AdminBtn onClick={() => setShowAdd(true)}>+ NOUVEAU COURS</AdminBtn>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KPICard label="Cours Actifs" value={courses.filter(c => c.active).length} color="yellow" icon="🎓" />
        <KPICard label="Complétions Total" value={courses.reduce((s, c) => s + (c.completions || 0), 0)} color="green" icon="✅" />
        <KPICard label="NLX Distribués" value={courses.reduce((s, c) => s + (c.completions || 0) * c.rewardNLX, 0)} color="blue" icon="🪙" />
        <KPICard label="Cours Inactifs" value={courses.filter(c => !c.active).length} color="gray" icon="⏸" />
      </div>

      <div className="space-y-3">
        {courses.map(course => (
          <div key={course.id} className={`border p-4 flex items-center justify-between gap-4 ${course.active ? 'border-yellow-900/30' : 'border-gray-800 opacity-60'}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl">{categoryIcons[course.category] || '📚'}</span>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm">{course.title}</p>
                <div className="flex gap-2 mt-1">
                  <Badge label={course.category?.toUpperCase()} color="gray" />
                  <Badge label={course.level?.toUpperCase()} color={levelColors[course.level] || 'gray'} />
                  <span className="text-xs text-yellow-500 font-bold">+{course.rewardNLX} NLX</span>
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
          <div className="grid grid-cols-3 gap-3">
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
            <Input label="Récompense NLX" type="number" value={newCourse.rewardNLX} onChange={e => setNewCourse({ ...newCourse, rewardNLX: parseInt(e.target.value) })} />
          </div>
          <div className="flex gap-2 pt-2">
            <AdminBtn size="md" color="yellow" onClick={createCourse}>CRÉER</AdminBtn>
            <AdminBtn size="md" color="gray" onClick={() => setShowAdd(false)}>ANNULER</AdminBtn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function VIPTab({ api }) {
  const [expeditions, setExpeditions] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newExp, setNewExp] = useState({ title: '', destination: '', date: '', description: '', maxParticipants: 10, minPack: 'diamond' });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/admin/vip-expeditions').then(r => {
      if (r.data.success) setExpeditions(r.data.data || []);
    }).catch(() => {
      setExpeditions([
        { id: 'e1', title: 'Dubai VIP 2025', destination: 'Dubai 🇦🇪', date: '2025-12-15', description: 'Voyage de luxe à Dubai pour nos top investisseurs', maxParticipants: 8, registered: 3, status: 'open' },
        { id: 'e2', title: 'Paris Luxury Weekend', destination: 'Paris 🇫🇷', date: '2026-03-20', description: 'Weekend exclusif à Paris', maxParticipants: 12, registered: 7, status: 'open' },
      ]);
    }).finally(() => setLoading(false));
  }, []);

  const createExpedition = async () => {
    try {
      const res = await api.post('/admin/vip-expeditions', newExp);
      if (res.data.success) { setExpeditions([...expeditions, res.data.data]); setShowAdd(false); }
    } catch (e) { console.error(e); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="VIP EXPEDITIONS"
        subtitle="Gestion des voyages exclusifs"
        actions={<AdminBtn onClick={() => setShowAdd(true)}>+ NOUVELLE EXPÉDITION</AdminBtn>}
      />

      <div className="grid lg:grid-cols-2 gap-4">
        {expeditions.map(exp => (
          <div key={exp.id} className="border border-yellow-900/40 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-black text-white text-base">{exp.title}</h3>
                <p className="text-xs text-yellow-500">{exp.destination}</p>
              </div>
              <Badge label={exp.status === 'open' ? 'OUVERT' : 'COMPLET'} color={exp.status === 'open' ? 'green' : 'red'} />
            </div>
            <p className="text-xs text-gray-500 mb-3">{exp.description}</p>
            <div className="flex justify-between text-xs mb-4">
              <span className="text-gray-400">📅 {new Date(exp.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="text-gray-400">👥 {exp.registered}/{exp.maxParticipants} participants</span>
            </div>
            <div className="h-1 bg-gray-900 mb-3">
              <div className="h-full bg-yellow-500" style={{ width: `${(exp.registered / exp.maxParticipants) * 100}%` }} />
            </div>
            <div className="flex gap-2">
              <AdminBtn size="sm" onClick={() => setSelected(exp)}>VOIR INSCRITS</AdminBtn>
              <AdminBtn size="sm" color="red">CLORE</AdminBtn>
            </div>
          </div>
        ))}
        {expeditions.length === 0 && <Alert type="info">Aucune expédition créée</Alert>}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="NOUVELLE EXPÉDITION VIP">
        <div className="space-y-3">
          <Input label="Titre" value={newExp.title} onChange={e => setNewExp({ ...newExp, title: e.target.value })} />
          <Input label="Destination" value={newExp.destination} onChange={e => setNewExp({ ...newExp, destination: e.target.value })} placeholder="Ex: Dubai 🇦🇪" />
          <Input label="Date" type="date" value={newExp.date} onChange={e => setNewExp({ ...newExp, date: e.target.value })} />
          <Textarea label="Description" value={newExp.description} onChange={e => setNewExp({ ...newExp, description: e.target.value })} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Max Participants" type="number" value={newExp.maxParticipants} onChange={e => setNewExp({ ...newExp, maxParticipants: parseInt(e.target.value) })} />
            <Select label="Pack Minimum Requis" value={newExp.minPack} onChange={e => setNewExp({ ...newExp, minPack: e.target.value })} options={[
              { value: 'elite', label: 'Elite' },
              { value: 'diamond', label: 'Diamond' },
            ]} />
          </div>
          <div className="flex gap-2 pt-2">
            <AdminBtn size="md" color="yellow" onClick={createExpedition}>CRÉER</AdminBtn>
            <AdminBtn size="md" color="gray" onClick={() => setShowAdd(false)}>ANNULER</AdminBtn>
          </div>
        </div>
      </Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Inscrits — ${selected?.title}`}>
        {selected && (
          <div>
            <p className="text-xs text-gray-500 mb-4">{selected.registered}/{selected.maxParticipants} participants</p>
            <Alert type="info">Aucun inscrit pour l'instant ou récupérer depuis l'API /admin/vip-expeditions/{selected.id}/participants</Alert>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CommunicationsTab({ api }) {
  const [tab, setTab] = useState('notification');
  const [notifForm, setNotifForm] = useState({ title: '', message: '', target: 'all', type: 'info' });
  const [emailForm, setEmailForm] = useState({ subject: '', body: '', target: 'all' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [history, setHistory] = useState([
    { type: 'notification', title: 'Bienvenue sur NELIAXA !', target: 'all', sentAt: new Date(Date.now() - 86400000 * 2).toISOString(), count: 1248 },
    { type: 'email', title: 'Rapport mensuel Janvier 2025', target: 'investors', sentAt: new Date(Date.now() - 86400000 * 7).toISOString(), count: 342 },
    { type: 'notification', title: 'Nouveau pack Diamond disponible', target: 'vip', sentAt: new Date(Date.now() - 86400000 * 14).toISOString(), count: 89 },
  ]);

  const sendNotification = async () => {
    setSending(true);
    try {
      await api.post('/admin/communications/notification', notifForm);
      setSent(true);
      setHistory([{ type: 'notification', title: notifForm.title, target: notifForm.target, sentAt: new Date().toISOString(), count: '?' }, ...history]);
      setNotifForm({ title: '', message: '', target: 'all', type: 'info' });
      setTimeout(() => setSent(false), 3000);
    } catch (e) { console.error(e); } finally { setSending(false); }
  };

  const sendEmail = async () => {
    setSending(true);
    try {
      await api.post('/admin/communications/email', emailForm);
      setSent(true);
      setHistory([{ type: 'email', title: emailForm.subject, target: emailForm.target, sentAt: new Date().toISOString(), count: '?' }, ...history]);
      setEmailForm({ subject: '', body: '', target: 'all' });
      setTimeout(() => setSent(false), 3000);
    } catch (e) { console.error(e); } finally { setSending(false); }
  };

  const targetOptions = [
    { value: 'all', label: 'Tous les utilisateurs' },
    { value: 'investors', label: 'Investisseurs uniquement' },
    { value: 'kyc_verified', label: 'KYC vérifié' },
    { value: 'vip', label: 'Comptes VIP/Diamond' },
    { value: 'no_investment', label: 'Sans investissement actif' },
  ];

  return (
    <div>
      <PageHeader title="COMMUNICATIONS" subtitle="Notifications et emails groupés" />

      {sent && <Alert type="success">Message envoyé avec succès !</Alert>}

      <div className="flex gap-2 mb-6">
        {['notification', 'email'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-xs font-black tracking-widest border transition-all ${tab === t ? 'bg-yellow-500 text-black border-yellow-500' : 'border-yellow-900/40 text-gray-400 hover:border-yellow-700'}`}>
            {t === 'notification' ? '🔔 NOTIFICATION' : '📧 EMAIL'}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          {tab === 'notification' ? (
            <SectionBox title="Envoyer une Notification Push">
              <div className="space-y-3">
                <Input label="Titre" value={notifForm.title} onChange={e => setNotifForm({ ...notifForm, title: e.target.value })} placeholder="Ex: Nouveau pack disponible !" />
                <Textarea label="Message" value={notifForm.message} onChange={e => setNotifForm({ ...notifForm, message: e.target.value })} rows={4} placeholder="Contenu de la notification..." />
                <Select label="Destinataires" value={notifForm.target} onChange={e => setNotifForm({ ...notifForm, target: e.target.value })} options={targetOptions} />
                <Select label="Type" value={notifForm.type} onChange={e => setNotifForm({ ...notifForm, type: e.target.value })} options={[
                  { value: 'info', label: 'Information' },
                  { value: 'success', label: 'Succès' },
                  { value: 'warning', label: 'Avertissement' },
                  { value: 'promo', label: 'Promotion' },
                ]} />
                <AdminBtn color="yellow" size="md" onClick={sendNotification} disabled={sending || !notifForm.title || !notifForm.message}>
                  {sending ? 'ENVOI...' : '→ ENVOYER LA NOTIFICATION'}
                </AdminBtn>
              </div>
            </SectionBox>
          ) : (
            <SectionBox title="Envoyer un Email Groupé">
              <div className="space-y-3">
                <Input label="Objet" value={emailForm.subject} onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })} placeholder="Objet de l'email..." />
                <Textarea label="Corps de l'email" value={emailForm.body} onChange={e => setEmailForm({ ...emailForm, body: e.target.value })} rows={8} placeholder="Rédigez votre email ici..." />
                <Select label="Destinataires" value={emailForm.target} onChange={e => setEmailForm({ ...emailForm, target: e.target.value })} options={targetOptions} />
                <AdminBtn color="yellow" size="md" onClick={sendEmail} disabled={sending || !emailForm.subject || !emailForm.body}>
                  {sending ? 'ENVOI...' : '→ ENVOYER L\'EMAIL'}
                </AdminBtn>
              </div>
            </SectionBox>
          )}
        </div>

        {}
        <SectionBox title="Historique des Envois">
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="border border-yellow-900/20 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white text-sm font-bold">{h.title}</p>
                    <p className="text-xs text-gray-500">{new Date(h.sentAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-right">
                    <Badge label={h.type === 'notification' ? 'PUSH' : 'EMAIL'} color={h.type === 'notification' ? 'blue' : 'green'} />
                    <p className="text-xs text-gray-500 mt-1">{h.count} destinataires</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionBox>
      </div>
    </div>
  );
}

function ConfigTab({ api }) {
  const [config, setConfig] = useState({
    platformName: 'NELIAXA',
    supportEmail: 'support@neliaxa.com',
    maintenanceMode: false,
    maintenanceMsg: '',
    withdrawalFee: 2.5,
    minWithdrawal: 50,
    maxWithdrawal: 10000,
    modules: {
      mining: true,
      watchToEarn: true,
      academy: true,
      referral: true,
      vipExpeditions: true,
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/admin/config').then(r => {
      if (r.data.success) setConfig({ ...config, ...r.data.data });
    }).catch(() => {}).finally(() => setLoading(false));
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
        subtitle="Paramètres généraux de NELIAXA"
        actions={<AdminBtn color="green" size="md" onClick={save} disabled={saving}>{saving ? 'SAUVEGARDE...' : '💾 SAUVEGARDER'}</AdminBtn>}
      />

      {msg && <Alert type="success">{msg}</Alert>}

      {config.maintenanceMode && (
        <Alert type="warning">⚠ MODE MAINTENANCE ACTIVÉ — La plateforme est inaccessible aux utilisateurs</Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {}
        <SectionBox title="Informations Générales">
          <div className="space-y-3">
            <Input label="Nom de la plateforme" value={config.platformName} onChange={e => setConfig({ ...config, platformName: e.target.value })} />
            <Input label="Email support" type="email" value={config.supportEmail} onChange={e => setConfig({ ...config, supportEmail: e.target.value })} />
          </div>
        </SectionBox>

        {}
        <SectionBox title="Mode Maintenance">
          <div className="space-y-3">
            <div className="flex items-center justify-between border border-yellow-900/20 p-3">
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
            <Input label="Retrait minimum (€)" type="number" value={config.minWithdrawal} onChange={e => setConfig({ ...config, minWithdrawal: parseFloat(e.target.value) })} />
            <Input label="Retrait maximum (€)" type="number" value={config.maxWithdrawal} onChange={e => setConfig({ ...config, maxWithdrawal: parseFloat(e.target.value) })} />
          </div>
        </SectionBox>

        {}
        <SectionBox title="Activer / Désactiver les Modules">
          <div className="space-y-2">
            {Object.entries(config.modules).map(([key, val]) => {
              const labels = { mining: '⛏️ Mining NLX', watchToEarn: '📺 Watch-to-Earn', academy: '🎓 Académie', referral: '👥 Parrainage', vipExpeditions: '✈️ VIP Expeditions' };
              return (
                <div key={key} className="flex items-center justify-between border border-yellow-900/20 p-3">
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
  const [loading, setLoading] = useState(true);
  const [logFilter, setLogFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.get('/admin/logs/activity'),
      api.get('/admin/security/blocked-ips'),
      api.get('/admin/users?role=admin'),
    ]).then(([logsRes, ipsRes, adminsRes]) => {
      if (logsRes.status === 'fulfilled' && logsRes.value.data.success) setLogs(logsRes.value.data.data || []);
      if (ipsRes.status === 'fulfilled' && ipsRes.value.data.success) setBlockedIPs(ipsRes.value.data.data || []);
      if (adminsRes.status === 'fulfilled' && adminsRes.value.data.success) setAdmins(adminsRes.value.data.data.users || []);
    }).catch(() => {
      setLogs(Array.from({ length: 25 }, (_, i) => ({
        id: `log_${i}`,
        admin: ['SuperAdmin', 'Mod1', 'Admin2'][i % 3],
        action: ['KYC approuvé', 'Retrait validé', 'Utilisateur suspendu', 'Config mise à jour', 'NLX ajusté'][i % 5],
        target: `user_${i}`,
        ip: `192.168.1.${i % 10 + 1}`,
        createdAt: new Date(Date.now() - i * 900000).toISOString(),
        level: ['info', 'warning', 'critical'][i % 3],
      })));
      setBlockedIPs([{ ip: '185.220.101.5', reason: 'Tentatives connexion suspectes', blockedAt: new Date().toISOString() }]);
      setAdmins([{ firstName: 'Super', lastName: 'Admin', email: 'admin@neliaxa.com', role: 'superadmin', lastSeen: new Date().toISOString() }]);
    }).finally(() => setLoading(false));
  }, []);

  const blockIP = async () => {
    if (!newIP) return;
    try {
      await api.post('/admin/security/block-ip', { ip: newIP });
      setBlockedIPs([...blockedIPs, { ip: newIP, reason: 'Bloqué manuellement', blockedAt: new Date().toISOString() }]);
      setNewIP('');
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

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {}
        <SectionBox title="Administrateurs">
          <div className="space-y-2">
            {admins.map((a, i) => (
              <div key={i} className="flex items-center justify-between border border-yellow-900/20 p-2">
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
              <div key={i} className="border border-red-900/30 bg-red-900/10 p-2 flex items-center justify-between">
                <div>
                  <p className="text-red-400 font-bold text-xs font-mono">{b.ip}</p>
                  <p className="text-gray-600 text-xs">{b.reason}</p>
                </div>
                <AdminBtn size="sm" color="gray" onClick={() => unblockIP(b.ip)}>DÉBLOQUER</AdminBtn>
              </div>
            ))}
            {blockedIPs.length === 0 && <p className="text-gray-600 text-xs">Aucune IP bloquée</p>}
          </div>
          <div className="flex gap-2">
            <input
              value={newIP}
              onChange={e => setNewIP(e.target.value)}
              placeholder="Nouvelle IP..."
              className="flex-1 px-2 py-1 bg-black border border-yellow-900/30 text-white text-xs focus:border-yellow-500 focus:outline-none font-mono"
            />
            <AdminBtn size="sm" color="red" onClick={blockIP}>BLOQUER</AdminBtn>
          </div>
        </SectionBox>

        {}
        <SectionBox title="Sécurité">
          <div className="space-y-2">
            {[
              { label: 'Connexions échouées (24h)', val: 47, bad: true },
              { label: 'Comptes avec 2FA', val: '634 (51%)', bad: false },
              { label: 'IPs bloquées', val: blockedIPs.length, bad: blockedIPs.length > 0 },
              { label: 'Sessions actives', val: 284, bad: false },
              { label: 'Alertes critiques', val: 2, bad: true },
            ].map(s => (
              <div key={s.label} className="flex justify-between text-xs border-b border-yellow-900/10 pb-2">
                <span className="text-gray-500">{s.label}</span>
                <span className={`font-bold ${s.bad ? 'text-red-400' : 'text-green-400'}`}>{s.val}</span>
              </div>
            ))}
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
            { key: 'createdAt', label: 'Heure', render: v => <span className="text-gray-500 font-mono text-xs">{new Date(v).toLocaleTimeString('fr-FR')}</span> },
            { key: 'admin', label: 'Admin', render: v => <span className="text-yellow-400 font-bold">{v}</span> },
            { key: 'action', label: 'Action' },
            { key: 'target', label: 'Cible', render: v => <span className="font-mono text-gray-500">{v}</span> },
            { key: 'ip', label: 'IP', render: v => <span className="font-mono text-gray-500 text-xs">{v}</span> },
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

  const generateReport = async (type) => {
    setGenerating(type);
    try {
      const res = await api.get(`/admin/reports/${type}?period=${period}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `neliaxa_${type}_${period}.pdf`;
      a.click();
    } catch (e) {
      
      const data = `Rapport ${type} - Période: ${period}\nGénéré le: ${new Date().toLocaleDateString('fr-FR')}\n\nCet export sera disponible une fois l'API connectée.`;
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `rapport_${type}.txt`; a.click();
    } finally {
      setGenerating(null);
    }
  };

  const reports = [
    { id: 'financial', icon: '💰', title: 'Rapport Financier', desc: 'Revenus, dépôts, retraits, profits nets de la période', color: 'yellow' },
    { id: 'users', icon: '👥', title: 'Rapport Utilisateurs', desc: 'Croissance, rétention, churn, taux de conversion', color: 'green' },
    { id: 'investments', icon: '📈', title: 'Rapport Investissements', desc: 'Performance par pack, ROI distribués, packs actifs', color: 'blue' },
    { id: 'nlx', icon: '🪙', title: 'Rapport Token NLX', desc: 'Émission, distribution, conversions, burning', color: 'purple' },
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

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {reports.map(r => (
          <div key={r.id} className={`border border-${r.color}-900/40 p-5 flex items-center justify-between gap-4`}>
            <div className="flex items-start gap-3">
              <span className="text-3xl">{r.icon}</span>
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
                {generating === r.id ? '...' : '⬇ PDF'}
              </AdminBtn>
            </div>
          </div>
        ))}
      </div>

      {}
      <SectionBox title={`Résumé — ${period === 'month' ? 'Ce Mois' : period === 'week' ? 'Cette Semaine' : period === 'quarter' ? 'Ce Trimestre' : 'Cette Année'}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard label="Nouveaux Utilisateurs" value="127" color="green" trend={12.4} />
          <KPICard label="Dépôts Totaux" value="€87,400" color="yellow" trend={8.2} />
          <KPICard label="Retraits Totaux" value="€23,100" color="blue" trend={-2.1} />
          <KPICard label="Bénéfice Net" value="€11,300" color="purple" trend={15.6} />
        </div>
        <div className="mt-4">
          <BarChart data={[
            { label: 'S1', value: 18400 }, { label: 'S2', value: 22100 }, { label: 'S3', value: 19800 }, { label: 'S4', value: 27100 },
          ]} height={120} />
          <p className="text-xs text-gray-600 text-center mt-2">Dépôts hebdomadaires (€)</p>
        </div>
      </SectionBox>
    </div>
  );
}