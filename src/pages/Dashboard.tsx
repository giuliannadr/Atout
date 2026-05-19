import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, RefreshCw, WifiOff } from 'lucide-react';

import Topbar from '../components/layout/Topbar';
import ProjectCard from '../components/dashboard/ProjectCard';
import EmptyState from '../components/dashboard/EmptyState';
import Modal from '../components/ui/Modal';
import NewProjectForm from '../components/dashboard/NewProjectForm';
import UpgradeModal from '../components/layout/UpgradeModal';
import BookingWidget from '../components/dashboard/BookingWidget';
import TeamHubWidget from '../components/dashboard/TeamHubWidget';
import QuickStatsWidget from '../components/dashboard/QuickStatsWidget';
import { ProjectCardSkeleton } from '../components/ui/Skeleton';

import { useProjectStore } from '../store/projectStore';
import { useSettingsStore } from '../store/settingsStore';
import { canAddProjectForPlan } from '../types';
import type { Project } from '../types';

type StatusFilter = 'all' | 'active' | 'review' | 'paused' | 'delivered';

const filterTabs: { key: StatusFilter; label: string }[] = [
  { key: 'all',       label: 'Todos' },
  { key: 'active',    label: 'Activos' },
  { key: 'review',    label: 'En revisión' },
  { key: 'paused',    label: 'Pausados' },
  { key: 'delivered', label: 'Entregados' },
];

const statusOrder: Record<string, number> = { active: 0, review: 1, paused: 2, delivered: 3 };

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { projects, isLoading, error, fetchProjects, addProject } = useProjectStore();
  const { settings } = useSettingsStore();
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [upgradeOpen, setUpgradeOpen]   = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');

  const firstName = (settings.name || '').split(' ')[0] || 'allá';

  const handleNewProject = () => {
    const ok = canAddProjectForPlan(
      projects.length,
      settings.plan ?? 'free',
      settings.profile ?? 'developer',
      settings.planExpiresAt
    );
    if (ok) setIsModalOpen(true);
    else setUpgradeOpen(true);
  };

  const handleCreateProject = (project: Project) => {
    addProject(project);
    setIsModalOpen(false);
    navigate(`/project/${project.id}`);
  };

  const filteredProjects = useMemo(() => {
    let list = [...projects];
    if (activeFilter !== 'all') list = list.filter(p => p.status === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.stack.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [projects, activeFilter, searchQuery]);

  const countFor = (key: StatusFilter) =>
    key === 'all' ? projects.length : projects.filter(p => p.status === key).length;

  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-x-hidden">

      {/* ── Blob background (very subtle) ── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div style={{ position: 'absolute', left: '-8%', top: '5%',   width: '45%', height: '50%', background: '#C4B5FD', opacity: 0.18, borderRadius: '50%', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', right: '-8%', top: '20%', width: '40%', height: '45%', background: '#67E8F9', opacity: 0.14, borderRadius: '50%', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', left: '25%', bottom: '0%',width: '45%', height: '50%', background: '#FED7AA', opacity: 0.16, borderRadius: '50%', filter: 'blur(100px)' }} />
      </div>

      <Topbar onNewProject={handleNewProject} />

      <main className="flex-1 p-6 md:p-8 max-w-screen-xl mx-auto w-full relative z-10">
        <div className="flex gap-8 items-start">

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {/* Header */}
            <header className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-2">Dashboard</p>
              <h1 className="text-3xl font-black leading-tight mb-1">
                Hola,{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {firstName}
                </span>{' '}
                👋
              </h1>
              <p className="text-gray-400 text-sm">
                {projects.length > 0
                  ? `Tenés ${projects.filter(p => p.status === 'active' || p.status === 'review').length} proyectos activos. Acá está tu resumen.`
                  : 'Gestioná tus clientes y entregables desde un solo lugar.'}
              </p>
            </header>

            {/* Error state */}
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
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reintentar
                </button>
              </div>
            )}

            {/* Stats */}
            {!isLoading && <QuickStatsWidget />}

            {/* Loading skeleton for stats */}
            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 h-20 animate-pulse" />
                ))}
              </div>
            )}

            {/* Search + Filters */}
            {!isLoading && projects.length > 0 && (
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar por proyecto, cliente o stack..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input pl-9 pr-9 bg-white/80 backdrop-blur-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex gap-1 bg-white/70 backdrop-blur-sm border border-gray-200 p-1 rounded-xl overflow-x-auto shrink-0 shadow-sm">
                  {filterTabs.map(tab => {
                    const count = countFor(tab.key);
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveFilter(tab.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          activeFilter === tab.key
                            ? 'bg-white text-dark shadow-sm'
                            : 'text-gray-500 hover:text-dark'
                        }`}
                      >
                        {tab.label}
                        {count > 0 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            activeFilter === tab.key ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Project grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ProjectCardSkeleton key={i} />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <EmptyState onAction={() => setIsModalOpen(true)} />
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg font-medium">Sin resultados</p>
                <p className="text-gray-300 text-sm mt-1">
                  {searchQuery
                    ? `No hay proyectos que coincidan con "${searchQuery}"`
                    : 'No hay proyectos con este estado.'}
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                  className="btn-secondary mt-4 text-sm"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <aside className="hidden xl:block w-80 shrink-0 sticky top-24 space-y-4">
            <BookingWidget />
            <TeamHubWidget />
          </aside>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear nuevo proyecto"
      >
        <NewProjectForm
          onSubmit={handleCreateProject}
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

export default Dashboard;
