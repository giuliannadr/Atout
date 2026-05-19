import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, RefreshCw, WifiOff, Megaphone, BarChart2,
  Calendar, Users, TrendingUp, Plus, ChevronRight,
  Globe, Sparkles, Zap, Kanban,
} from 'lucide-react';

import Topbar from '../components/layout/Topbar';
import Modal from '../components/ui/Modal';
import NewCMAccountForm from '../components/cm/NewCMAccountForm';
import UpgradeModal from '../components/layout/UpgradeModal';
import ContentCalendar from '../components/cm/ContentCalendar';
import KanbanBoard from '../components/cm/KanbanBoard';
import BookingWidget from '../components/dashboard/BookingWidget';
import TeamHubWidget from '../components/dashboard/TeamHubWidget';
import { ProjectCardSkeleton } from '../components/ui/Skeleton';

import { useProjectStore } from '../store/projectStore';
import { useSettingsStore } from '../store/settingsStore';
import { canAddProjectForPlan, effectivePlan } from '../types';
import type { Project, ContentPost } from '../types';

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: 'bg-pink-100 text-pink-700',
  TikTok: 'bg-gray-900 text-white',
  Facebook: 'bg-blue-100 text-blue-700',
  Twitter: 'bg-sky-100 text-sky-700',
  LinkedIn: 'bg-blue-700 text-white',
  YouTube: 'bg-red-100 text-red-700',
  Pinterest: 'bg-rose-100 text-rose-700',
  default: 'bg-gray-100 text-gray-600',
};

const STATUS_CONFIG = {
  active:    { label: 'Activa',    className: 'bg-emerald-100 text-emerald-700' },
  review:    { label: 'Revisión',  className: 'bg-amber-100 text-amber-700' },
  paused:    { label: 'Pausada',   className: 'bg-gray-100 text-gray-500' },
  delivered: { label: 'Finalizada',className: 'bg-blue-100 text-blue-700' },
};

interface CMAccountCardProps {
  account: Project;
  onClick: () => void;
}

const CMAccountCard: React.FC<CMAccountCardProps> = ({ account, onClick }) => {
  const platforms = account.stack
    ? account.stack.split(/[·,·]/).map(s => s.trim()).filter(Boolean)
    : [];
  const statusCfg = STATUS_CONFIG[account.status] ?? STATUS_CONFIG.active;
  const posts = account.contentPosts ?? [];
  const config = account.cmBrandConfig;

  // Posts this week
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const postsThisWeek = posts.filter(p => {
    const d = new Date(p.date);
    return d >= startOfWeek && d < endOfWeek;
  }).length;

  const weeklyGoal = config
    ? Object.values(config.postingGoals).reduce((s, v) => s + v, 0)
    : 0;

  const goalPct = weeklyGoal > 0 ? Math.min(Math.round((postsThisWeek / weeklyGoal) * 100), 100) : null;

  const upcomingPosts = posts.filter(
    p => p.status !== 'published' && new Date(p.date) >= now
  ).length;

  const urgentPosts = posts.filter(p => p.priority === 'urgent' && p.status !== 'published').length;

  // Content gap: any active platform has 0 posts scheduled this week
  const hasGap = platforms.length > 0 && platforms.some(pl => {
    return !posts.some(p => {
      const d = new Date(p.date);
      const plats = p.platforms ?? [p.platform];
      return d >= startOfWeek && d < endOfWeek && plats.includes(pl) && p.status !== 'published';
    });
  });

  return (
    <button
      onClick={onClick}
      className="group card p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-l-4 w-full"
      style={{ borderLeftColor: account.themeColor ?? '#8B5CF6' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.className}`}>
              {statusCfg.label}
            </span>
            {urgentPosts > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                🔴 {urgentPosts} urgente{urgentPosts > 1 ? 's' : ''}
              </span>
            )}
            {hasGap && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                ⚠ Gap esta semana
              </span>
            )}
          </div>
          <h3 className="font-bold text-dark text-base truncate group-hover:text-violet-600 transition-colors">
            {account.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{account.client}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-400 shrink-0 mt-1 transition-colors" />
      </div>

      {/* Platforms */}
      {platforms.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {platforms.slice(0, 4).map(p => (
            <span
              key={p}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PLATFORM_COLORS[p] ?? PLATFORM_COLORS.default}`}
            >
              {p}
            </span>
          ))}
          {platforms.length > 4 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              +{platforms.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Weekly goal bar */}
      {goalPct !== null && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
            <span>Objetivo semanal</span>
            <span className="font-bold">{postsThisWeek}/{weeklyGoal} posts</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                goalPct >= 100 ? 'bg-emerald-500' : goalPct >= 60 ? 'bg-violet-500' : 'bg-amber-400'
              }`}
              style={{ width: `${goalPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Mini stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="w-3.5 h-3.5" />
          {upcomingPosts > 0 ? (
            <span className="text-violet-600 font-semibold">{upcomingPosts} programado{upcomingPosts !== 1 ? 's' : ''}</span>
          ) : (
            <span>Sin posts programados</span>
          )}
        </div>
        {config?.contentPillars && config.contentPillars.length > 0 && (
          <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
            {config.contentPillars[0]}{config.contentPillars.length > 1 ? ` +${config.contentPillars.length - 1}` : ''}
          </span>
        )}
      </div>
    </button>
  );
};

type DashboardTab = 'accounts' | 'calendar' | 'pipeline';

const CMDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { projects, isLoading, error, fetchProjects, addProject, updateProject } = useProjectStore();
  const { settings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<DashboardTab>('accounts');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activePlan = effectivePlan(settings.plan ?? 'free', settings.planExpiresAt);

  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.client.toLowerCase().includes(q) ||
      p.stack.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  const handleNewAccount = () => {
    const ok = canAddProjectForPlan(
      projects.length,
      settings.plan ?? 'free',
      'community_manager',
      settings.planExpiresAt
    );
    if (ok) setIsModalOpen(true);
    else setUpgradeOpen(true);
  };

  const handleCreateAccount = (project: Project) => {
    addProject(project);
    setIsModalOpen(false);
    navigate(`/account/${project.id}`);
  };

  // Global post helpers (update the owning project)
  const allPosts = useMemo(() =>
    projects.flatMap(p => (p.contentPosts ?? []).map(post => ({ ...post, _accountId: p.id, _accountName: p.name }))),
    [projects]
  );

  const updateGlobalPost = (post: ContentPost & { _accountId?: string; _accountName?: string }) => {
    const accountId = (post as any)._accountId;
    if (!accountId) return;
    const project = projects.find(p => p.id === accountId);
    if (!project) return;
    const updatedPosts = (project.contentPosts ?? []).map(p => p.id === post.id ? post : p);
    updateProject(accountId, { contentPosts: updatedPosts });
  };

  const deleteGlobalPost = (postId: string) => {
    projects.forEach(p => {
      if ((p.contentPosts ?? []).some(post => post.id === postId)) {
        updateProject(p.id, { contentPosts: (p.contentPosts ?? []).filter(post => post.id !== postId) });
      }
    });
  };

  // Aggregate stats across all accounts
  const totalUpcomingPosts = projects.reduce((acc, p) => {
    const upcoming = (p.contentPosts ?? []).filter(
      post => post.status !== 'published' && new Date(post.date) >= new Date()
    ).length;
    return acc + upcoming;
  }, 0);

  const activeAccounts = projects.filter(p => p.status === 'active').length;
  const totalPlatforms = new Set(
    projects.flatMap(p => p.stack ? p.stack.split(/[·,·]/).map(s => s.trim()).filter(Boolean) : [])
  ).size;

  const firstName = (settings.name || '').split(' ')[0] || 'allá';

  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-x-hidden">

      {/* ── Blob background (muy sutil) ── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div style={{ position: 'absolute', left: '-8%',  top: '5%',   width: '45%', height: '50%', background: '#FCA5A5', opacity: 0.16, borderRadius: '50%', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', right: '-8%', top: '15%',  width: '40%', height: '45%', background: '#C4B5FD', opacity: 0.16, borderRadius: '50%', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', left: '20%',  bottom: '0%',width: '45%', height: '50%', background: '#FED7AA', opacity: 0.14, borderRadius: '50%', filter: 'blur(100px)' }} />
      </div>

      <Topbar onNewProject={handleNewAccount} />

      <main className="flex-1 p-6 md:p-8 max-w-screen-xl mx-auto w-full relative z-10">
       <div className="flex gap-8 items-start">
        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-pink-500 mb-2">CM Dashboard</p>
            <h1 className="text-3xl font-black leading-tight mb-1">
              Hola,{' '}
              <span style={{
                background: 'linear-gradient(135deg, #DB2777 0%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {firstName}
              </span>{' '}
              👋
            </h1>
            <p className="text-gray-400 text-sm">Gestioná tus marcas, contenido y métricas desde un solo lugar.</p>
          </div>
          {activePlan === 'free' && (
            <button
              onClick={() => setUpgradeOpen(true)}
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:from-violet-600 hover:to-violet-700 transition-all"
            >
              <Zap className="w-4 h-4" />
              Desbloquear CM Pro
            </button>
          )}
        </header>

        {/* Global tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {[
            { key: 'accounts' as DashboardTab, label: 'Mis Cuentas', icon: Users },
            { key: 'calendar' as DashboardTab, label: 'Calendario Global', icon: Calendar },
            { key: 'pipeline' as DashboardTab, label: 'Pipeline Global', icon: Kanban },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
                  activeTab === tab.key
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && !isLoading && (
          <div className="mb-6 p-4 bg-danger-light border border-danger-mid rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-danger shrink-0" />
              <div>
                <p className="text-sm font-semibold text-danger">Sin conexión con la base de datos</p>
                <p className="text-xs text-danger opacity-70 mt-0.5">Verificá tu conexión e intentá de nuevo.</p>
              </div>
            </div>
            <button
              onClick={() => fetchProjects()}
              className="flex items-center gap-1.5 text-xs font-bold text-danger hover:text-red-700 transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reintentar
            </button>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <ContentCalendar
              posts={allPosts}
              onAddPost={() => {}}
              onUpdatePost={updateGlobalPost}
              onDeletePost={deleteGlobalPost}
            />
            <p className="text-xs text-gray-400 mt-4 text-center">
              Vista global de todas tus cuentas. Para agregar posts, entrá a cada cuenta.
            </p>
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <KanbanBoard
              posts={allPosts}
              onAddPost={() => {}}
              onUpdatePost={updateGlobalPost}
              onDeletePost={deleteGlobalPost}
            />
            <p className="text-xs text-gray-400 mt-4 text-center">
              Vista global de todas tus cuentas. Para agregar posts, entrá a cada cuenta.
            </p>
          </div>
        )}

        {activeTab === 'accounts' && !isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Users className="w-4 h-4 text-violet-600" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Cuentas</span>
              </div>
              <p className="text-2xl font-black text-dark">{projects.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">{activeAccounts} activas</p>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-pink-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-pink-600" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Posts</span>
              </div>
              <p className="text-2xl font-black text-dark">{totalUpcomingPosts}</p>
              <p className="text-xs text-gray-400 mt-0.5">programados</p>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Plataformas</span>
              </div>
              <p className="text-2xl font-black text-dark">{totalPlatforms}</p>
              <p className="text-xs text-gray-400 mt-0.5">gestionadas</p>
            </div>

            <div
              className={`card p-5 cursor-pointer hover:shadow-md transition-shadow ${
                activePlan !== 'free' ? '' : 'relative overflow-hidden'
              }`}
              onClick={activePlan === 'free' ? () => setUpgradeOpen(true) : undefined}
            >
              {activePlan === 'free' && (
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-violet-100 flex flex-col items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <span className="text-xs font-bold text-violet-600">Métricas en Pro</span>
                </div>
              )}
              <div className={activePlan === 'free' ? 'invisible' : ''}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Métricas</span>
                </div>
                <p className="text-2xl font-black text-dark">—</p>
                <p className="text-xs text-gray-400 mt-0.5">este mes</p>
              </div>
            </div>
          </div>
        )}

        {/* Content calendar teaser (Pro only) */}
        {activeTab === 'accounts' && activePlan === 'free' && !isLoading && projects.length > 0 && (
          <div className="mb-8 rounded-2xl border-2 border-dashed border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-violet-500" />
              </div>
              <div>
                <h3 className="font-bold text-dark">Calendario de Contenido</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Planificá posts por plataforma, programá publicaciones y visualizá tu semana de contenido.
                </p>
              </div>
            </div>
            <button
              onClick={() => setUpgradeOpen(true)}
              className="flex items-center gap-2 bg-violet-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-violet-600 transition-colors shrink-0"
            >
              <Zap className="w-4 h-4" /> Activar con CM Pro
            </button>
          </div>
        )}

        {/* Metrics teaser (Pro only) */}
        {activeTab === 'accounts' && activePlan === 'free' && !isLoading && projects.length > 0 && (
          <div className="mb-8 rounded-2xl border-2 border-dashed border-pink-200 bg-gradient-to-br from-pink-50 to-white p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center shrink-0">
                <BarChart2 className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="font-bold text-dark">Dashboard de Métricas</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Seguidores, engagement y alcance por plataforma. Generá un reporte mensual PDF para cada marca.
                </p>
              </div>
            </div>
            <button
              onClick={() => setUpgradeOpen(true)}
              className="flex items-center gap-2 bg-pink-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-pink-600 transition-colors shrink-0"
            >
              <Zap className="w-4 h-4" /> Activar con CM Pro
            </button>
          </div>
        )}

        {/* Search */}
        {activeTab === 'accounts' && !isLoading && projects.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por marca, cliente o plataforma..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <span className="text-sm text-gray-400 font-medium">
              {projects.length} cuenta{projects.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Accounts grid */}
        {activeTab === 'accounts' && (
          isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-violet-100 rounded-3xl flex items-center justify-center mb-5">
                <Megaphone className="w-10 h-10 text-violet-500" />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">Agregá tu primera cuenta</h3>
              <p className="text-sm text-gray-400 max-w-xs mb-6">
                Gestioná las redes sociales de tus marcas con calendario de contenido y métricas.
              </p>
              <button
                onClick={handleNewAccount}
                className="flex items-center gap-2 bg-violet-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-violet-600 transition-colors shadow-lg shadow-violet-200"
              >
                <Plus className="w-4 h-4" /> Nueva cuenta
              </button>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg font-medium">Sin resultados</p>
              <button onClick={() => setSearchQuery('')} className="btn-secondary mt-4 text-sm">
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAccounts.map(account => (
                <CMAccountCard
                  key={account.id}
                  account={account}
                  onClick={() => navigate(`/account/${account.id}`)}
                />
              ))}
            </div>
          )
        )}
        </div>{/* end main content */}

        {/* ── Right sidebar ── */}
        <aside className="hidden xl:block w-80 shrink-0 sticky top-24 space-y-4">
          <BookingWidget />
          <TeamHubWidget />
        </aside>
       </div>{/* end flex row */}
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva cuenta"
      >
        <NewCMAccountForm
          onSubmit={handleCreateAccount}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        triggeredByLimit
      />
    </div>
  );
};

export default CMDashboard;
