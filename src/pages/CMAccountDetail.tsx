import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Kanban, BarChart2,
  Target, Hash, DollarSign, Settings2, Megaphone,
  Globe, Phone, Edit2, Check, X, ExternalLink,
  Wifi, WifiOff, RefreshCw, Eye, EyeOff, AlertCircle, CheckSquare,
} from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import ContentCalendar from '../components/cm/ContentCalendar';
import KanbanBoard from '../components/cm/KanbanBoard';
import MetricsPanel from '../components/cm/MetricsPanel';
import CampaignTracker from '../components/cm/CampaignTracker';
import HashtagBank from '../components/cm/HashtagBank';
import CMFinancePanel from '../components/cm/CMFinancePanel';
import TaskBoard from '../components/tasks/TaskBoard';
import { useProjectStore } from '../store/projectStore';
import { useSettingsStore } from '../store/settingsStore';
import {
  syncInstagramMetrics,
  fetchLinkedIGAccounts,
  validateToken,
  type MetaIGAccount,
} from '../services/metaApi';
import type {
  ContentPost, CMMetrics, CMCampaign, CMHashtagGroup, CMMonthlyFee, CMBrandConfig, CMMetaConnection, Task,
} from '../types';

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: 'bg-pink-100 text-pink-700',
  TikTok: 'bg-gray-900 text-white',
  Facebook: 'bg-blue-100 text-blue-700',
  LinkedIn: 'bg-blue-700 text-white',
  YouTube: 'bg-red-100 text-red-700',
  Pinterest: 'bg-rose-100 text-rose-700',
  'Twitter/X': 'bg-sky-100 text-sky-700',
  default: 'bg-gray-100 text-gray-600',
};

const STATUS_CFG = {
  active:    { label: 'Activa',    className: 'bg-emerald-100 text-emerald-700' },
  review:    { label: 'Revisión',  className: 'bg-amber-100 text-amber-700' },
  paused:    { label: 'Pausada',   className: 'bg-gray-100 text-gray-500' },
  delivered: { label: 'Finalizada',className: 'bg-blue-100 text-blue-700' },
};

const TABS = [
  { key: 'calendar', label: 'Calendario', icon: Calendar },
  { key: 'pipeline', label: 'Pipeline', icon: Kanban },
  { key: 'tasks',    label: 'Tareas',    icon: CheckSquare },
  { key: 'metrics',  label: 'Métricas',  icon: BarChart2 },
  { key: 'campaigns',label: 'Campañas',  icon: Target },
  { key: 'hashtags', label: 'Hashtags',  icon: Hash },
  { key: 'finance',  label: 'Finanzas',  icon: DollarSign },
  { key: 'config',   label: 'Config',    icon: Settings2 },
] as const;

type TabKey = typeof TABS[number]['key'];

const DEFAULT_BRAND_CONFIG: CMBrandConfig = {
  brandVoice: '',
  contentPillars: [],
  postingGoals: {},
  bioLink: '',
  brandNotes: '',
};

const PLATFORMS_LIST = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'YouTube', 'Pinterest', 'Twitter/X'];

const CMAccountDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, updateProject } = useProjectStore();
  const { settings } = useSettingsStore();
  const account = id ? getProject(id) : undefined;
  const [activeTab, setActiveTab] = useState<TabKey>('calendar');
  const [editingConfig, setEditingConfig] = useState(false);
  const [configForm, setConfigForm] = useState<CMBrandConfig>(account?.cmBrandConfig ?? DEFAULT_BRAND_CONFIG);
  const [newPillar, setNewPillar] = useState('');

  // Meta connection state
  const [showMetaForm, setShowMetaForm] = useState(false);
  const [metaTokenInput, setMetaTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [metaAccounts, setMetaAccounts] = useState<MetaIGAccount[]>([]);
  const [selectedMetaAccount, setSelectedMetaAccount] = useState<MetaIGAccount | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [metaSuccess, setMetaSuccess] = useState<string | null>(null);

  if (!account) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Topbar onNewProject={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Megaphone className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">Cuenta no encontrada.</p>
            <button onClick={() => navigate('/')} className="btn-secondary mt-4 text-sm">Volver</button>
          </div>
        </div>
      </div>
    );
  }

  const metaConnection = account.cmMetaConnection;
  const isMetaConnected = !!(metaConnection?.accessToken && metaConnection?.instagramAccountId);

  /** Step 1: validate token and auto-detect linked IG accounts */
  const handleDetectAccounts = async () => {
    if (!metaTokenInput.trim()) return;
    setMetaLoading(true);
    setMetaError(null);
    setMetaAccounts([]);
    try {
      await validateToken(metaTokenInput.trim());
      const accounts = await fetchLinkedIGAccounts(metaTokenInput.trim());
      if (accounts.length === 0) {
        setMetaError('No se encontraron cuentas de Instagram Business conectadas a este token. Asegurate de tener una Página de Facebook con una cuenta de Instagram Business vinculada.');
      } else {
        setMetaAccounts(accounts);
        setSelectedMetaAccount(accounts[0]);
      }
    } catch (e) {
      setMetaError(e instanceof Error ? e.message : 'Token inválido o sin permisos suficientes');
    } finally {
      setMetaLoading(false);
    }
  };

  /** Step 2: save the selected account and token */
  const handleSaveMetaConnection = () => {
    if (!selectedMetaAccount || !metaTokenInput.trim()) return;
    const conn: CMMetaConnection = {
      accessToken: metaTokenInput.trim(),
      instagramAccountId: selectedMetaAccount.id,
      pageId: selectedMetaAccount.pageId,
      username: selectedMetaAccount.username,
    };
    updateProject(id!, { cmMetaConnection: conn });
    setShowMetaForm(false);
    setMetaAccounts([]);
    setMetaTokenInput('');
    setMetaSuccess(`✓ Conectado como @${selectedMetaAccount.username}`);
    setTimeout(() => setMetaSuccess(null), 4000);
  };

  /** Disconnect Meta */
  const handleDisconnectMeta = () => {
    updateProject(id!, { cmMetaConnection: undefined });
    setMetaSuccess(null);
  };

  /** Sync: fetch real metrics from Meta API and add/update current month's entry */
  const handleSyncMeta = async () => {
    if (!metaConnection?.accessToken || !metaConnection?.instagramAccountId) return;
    const metrics = account.cmMetrics ?? [];
    const currentMonth = new Date().toISOString().slice(0, 7);
    const existing = metrics.find(m => m.platform === 'Instagram' && m.month === currentMonth);
    const previousFollowers = existing?.followers ?? 0;

    const result = await syncInstagramMetrics(
      metaConnection.accessToken,
      metaConnection.instagramAccountId,
      previousFollowers
    );

    const newEntry: CMMetrics = {
      id: existing?.id ?? crypto.randomUUID(),
      month: result.month,
      platform: result.platform,
      followers: result.followers,
      followersGrowth: result.followersGrowth,
      reach: result.reach,
      impressions: result.impressions,
      engagementRate: result.engagementRate,
    };

    const updatedMetrics = existing
      ? metrics.map(m => m.id === existing.id ? newEntry : m)
      : [...metrics, newEntry];

    updateProject(id!, {
      cmMetrics: updatedMetrics,
      cmMetaConnection: { ...metaConnection, lastSyncedAt: new Date().toISOString() },
    });
  };

  const platforms = account.stack
    ? account.stack.split(/[·,·]/).map(s => s.trim()).filter(Boolean)
    : [];
  const statusCfg = STATUS_CFG[account.status] ?? STATUS_CFG.active;
  const brandConfig = account.cmBrandConfig ?? DEFAULT_BRAND_CONFIG;

  const posts = account.contentPosts ?? [];
  const metrics = account.cmMetrics ?? [];
  const campaigns = account.cmCampaigns ?? [];
  const hashtagGroups = account.cmHashtagGroups ?? [];
  const fees = account.cmMonthlyFees ?? [];

  // Upcoming posts count
  const upcomingPosts = posts.filter(p => p.status === 'scheduled' && new Date(p.date) >= new Date()).length;
  const publishedThisMonth = posts.filter(p => {
    const now = new Date();
    const d = new Date(p.date);
    return p.status === 'published' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Post helpers
  const addPost = (post: ContentPost) => updateProject(id!, { contentPosts: [...posts, post] });
  const updatePost = (post: ContentPost) => updateProject(id!, { contentPosts: posts.map(p => p.id === post.id ? post : p) });
  const deletePost = (postId: string) => updateProject(id!, { contentPosts: posts.filter(p => p.id !== postId) });

  // Metrics helpers
  const addMetric = (m: CMMetrics) => updateProject(id!, { cmMetrics: [...metrics, m] });
  const updateMetric = (m: CMMetrics) => updateProject(id!, { cmMetrics: metrics.map(x => x.id === m.id ? m : x) });
  const deleteMetric = (mid: string) => updateProject(id!, { cmMetrics: metrics.filter(x => x.id !== mid) });

  // Campaign helpers
  const addCampaign = (c: CMCampaign) => updateProject(id!, { cmCampaigns: [...campaigns, c] });
  const updateCampaign = (c: CMCampaign) => updateProject(id!, { cmCampaigns: campaigns.map(x => x.id === c.id ? c : x) });
  const deleteCampaign = (cid: string) => updateProject(id!, { cmCampaigns: campaigns.filter(x => x.id !== cid) });

  // Hashtag helpers
  const addGroup = (g: CMHashtagGroup) => updateProject(id!, { cmHashtagGroups: [...hashtagGroups, g] });
  const updateGroup = (g: CMHashtagGroup) => updateProject(id!, { cmHashtagGroups: hashtagGroups.map(x => x.id === g.id ? g : x) });
  const deleteGroup = (gid: string) => updateProject(id!, { cmHashtagGroups: hashtagGroups.filter(x => x.id !== gid) });

  // Fee helpers
  const addFee = (f: CMMonthlyFee) => updateProject(id!, { cmMonthlyFees: [...fees, f] });
  const updateFee = (f: CMMonthlyFee) => updateProject(id!, { cmMonthlyFees: fees.map(x => x.id === f.id ? f : x) });
  const deleteFee = (fid: string) => updateProject(id!, { cmMonthlyFees: fees.filter(x => x.id !== fid) });

  // Task helpers
  const tasks = account.tasks ?? [];
  const addTask = (t: Task) => updateProject(id!, { tasks: [...tasks, t] });
  const updateTask = (t: Task) => updateProject(id!, { tasks: tasks.map(x => x.id === t.id ? t : x) });
  const deleteTask = (tid: string) => updateProject(id!, { tasks: tasks.filter(x => x.id !== tid) });

  // Brand config save
  const saveConfig = () => {
    updateProject(id!, { cmBrandConfig: configForm });
    setEditingConfig(false);
  };

  const addPillar = () => {
    if (!newPillar.trim()) return;
    setConfigForm(p => ({ ...p, contentPillars: [...p.contentPillars, newPillar.trim()] }));
    setNewPillar('');
  };
  const removePillar = (pillar: string) => {
    setConfigForm(p => ({ ...p, contentPillars: p.contentPillars.filter(x => x !== pillar) }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Topbar onNewProject={() => {}} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-6">
        {/* Back + header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Mis cuentas
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusCfg.className}`}>
                  {statusCfg.label}
                </span>
                {platforms.map(p => (
                  <span key={p} className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${PLATFORM_COLORS[p] ?? PLATFORM_COLORS.default}`}>
                    {p}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl font-black text-dark">{account.name}</h1>
              <p className="text-gray-400 text-sm mt-0.5">{account.client}</p>
              {account.description && <p className="text-sm text-gray-500 mt-1 max-w-xl">{account.description}</p>}
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 shrink-0">
              <div className="text-center">
                <p className="text-2xl font-black text-violet-600">{upcomingPosts}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Programados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-600">{publishedThisMonth}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Publicados/mes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-blue-600">{campaigns.filter(c => c.status === 'active').length}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Campañas activas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-gray-200 mb-6 pb-0">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
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

        {/* Tab content */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {activeTab === 'calendar' && (
            <ContentCalendar
              posts={posts}
              hashtagGroups={hashtagGroups}
              contentPillars={brandConfig.contentPillars}
              accountName={account.name}
              onAddPost={addPost}
              onUpdatePost={updatePost}
              onDeletePost={deletePost}
            />
          )}

          {activeTab === 'pipeline' && (
            <KanbanBoard
              posts={posts}
              hashtagGroups={hashtagGroups}
              contentPillars={brandConfig.contentPillars}
              onAddPost={addPost}
              onUpdatePost={updatePost}
              onDeletePost={deletePost}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskBoard
              tasks={tasks}
              teamMembers={settings.teamMembers ?? []}
              onAdd={addTask}
              onUpdate={updateTask}
              onDelete={deleteTask}
            />
          )}

          {activeTab === 'metrics' && (
            <MetricsPanel
              metrics={metrics}
              metaConnection={metaConnection}
              onAdd={addMetric}
              onUpdate={updateMetric}
              onDelete={deleteMetric}
              onSyncMeta={isMetaConnected ? handleSyncMeta : undefined}
            />
          )}

          {activeTab === 'campaigns' && (
            <CampaignTracker
              campaigns={campaigns}
              defaultCurrency={account.currency ?? settings.defaultCurrency}
              onAdd={addCampaign}
              onUpdate={updateCampaign}
              onDelete={deleteCampaign}
            />
          )}

          {activeTab === 'hashtags' && (
            <HashtagBank
              groups={hashtagGroups}
              onAdd={addGroup}
              onUpdate={updateGroup}
              onDelete={deleteGroup}
            />
          )}

          {activeTab === 'finance' && (
            <CMFinancePanel
              fees={fees}
              defaultCurrency={account.currency ?? settings.defaultCurrency}
              clientName={account.client}
              onAdd={addFee}
              onUpdate={updateFee}
              onDelete={deleteFee}
            />
          )}

          {activeTab === 'config' && (
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-dark">Configuración de la marca</h3>
                {!editingConfig ? (
                  <button
                    onClick={() => { setConfigForm(brandConfig); setEditingConfig(true); }}
                    className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Editar
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingConfig(false)} className="btn-secondary text-sm">Cancelar</button>
                    <button onClick={saveConfig} className="btn-primary text-sm bg-violet-600 hover:bg-violet-700 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Guardar
                    </button>
                  </div>
                )}
              </div>

              {/* Brand voice */}
              <div>
                <label className="label">Tono / Voz de la marca</label>
                {editingConfig ? (
                  <input
                    type="text"
                    value={configForm.brandVoice}
                    onChange={e => setConfigForm(p => ({ ...p, brandVoice: e.target.value }))}
                    className="input"
                    placeholder="Ej: Cercana, profesional, con humor sutil"
                  />
                ) : (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 min-h-[44px]">
                    {brandConfig.brandVoice || <span className="text-gray-300 italic">Sin definir</span>}
                  </p>
                )}
              </div>

              {/* Content pillars */}
              <div>
                <label className="label">Pilares de contenido</label>
                {editingConfig ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {configForm.contentPillars.map(p => (
                        <span key={p} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full">
                          {p}
                          <button onClick={() => removePillar(p)} className="hover:text-danger">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPillar}
                        onChange={e => setNewPillar(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addPillar()}
                        className="input flex-1"
                        placeholder="Ej: Educación, Entretenimiento, Ventas..."
                      />
                      <button onClick={addPillar} className="btn-secondary text-sm">Agregar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {brandConfig.contentPillars.length > 0
                      ? brandConfig.contentPillars.map(p => (
                          <span key={p} className="text-xs font-bold px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full">{p}</span>
                        ))
                      : <span className="text-sm text-gray-300 italic">Sin pilares definidos</span>
                    }
                  </div>
                )}
              </div>

              {/* Posting goals */}
              <div>
                <label className="label">Frecuencia de posteo (posts/semana por plataforma)</label>
                {editingConfig ? (
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS_LIST.map(pl => (
                      <div key={pl} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-24 shrink-0">{pl}</span>
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={configForm.postingGoals[pl] ?? 0}
                          onChange={e => setConfigForm(p => ({ ...p, postingGoals: { ...p.postingGoals, [pl]: Number(e.target.value) } }))}
                          className="input py-1 text-xs flex-1"
                        />
                        <span className="text-[10px] text-gray-400">posts/sem</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(brandConfig.postingGoals)
                      .filter(([, v]) => v > 0)
                      .map(([pl, v]) => (
                        <div key={pl} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-xs text-gray-600">{pl}</span>
                          <span className="text-xs font-bold text-dark">{v} posts/sem</span>
                        </div>
                      ))}
                    {Object.values(brandConfig.postingGoals).every(v => !v) && (
                      <span className="text-sm text-gray-300 italic col-span-2">Sin objetivos definidos</span>
                    )}
                  </div>
                )}
              </div>

              {/* Bio link */}
              <div>
                <label className="label flex items-center gap-1"><Globe className="w-3 h-3" /> Link en bio</label>
                {editingConfig ? (
                  <input
                    type="url"
                    value={configForm.bioLink ?? ''}
                    onChange={e => setConfigForm(p => ({ ...p, bioLink: e.target.value }))}
                    className="input"
                    placeholder="https://..."
                  />
                ) : brandConfig.bioLink ? (
                  <a href={brandConfig.bioLink} target="_blank" rel="noreferrer"
                    className="text-sm text-violet-600 hover:underline flex items-center gap-1">
                    {brandConfig.bioLink} <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-sm text-gray-300 italic">Sin definir</span>
                )}
              </div>

              {/* Brand notes */}
              <div>
                <label className="label">Notas de la marca</label>
                {editingConfig ? (
                  <textarea
                    value={configForm.brandNotes}
                    onChange={e => setConfigForm(p => ({ ...p, brandNotes: e.target.value }))}
                    rows={3}
                    className="input resize-none"
                    placeholder="Guidelines, información importante, instrucciones del cliente..."
                  />
                ) : (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 min-h-[44px] whitespace-pre-wrap">
                    {brandConfig.brandNotes || <span className="text-gray-300 italic">Sin notas</span>}
                  </p>
                )}
              </div>

              {/* ── Meta Integration ── */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-dark flex items-center gap-2">
                      <span className="text-lg">📘</span> Conexión con Meta
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Sincronizá métricas reales de Instagram automáticamente
                    </p>
                  </div>
                  {isMetaConnected ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                      <Wifi className="w-3 h-3" /> Conectado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                      <WifiOff className="w-3 h-3" /> Sin conectar
                    </span>
                  )}
                </div>

                {metaSuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" /> {metaSuccess}
                  </div>
                )}

                {isMetaConnected && !showMetaForm ? (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-dark">@{metaConnection!.username}</p>
                        <p className="text-xs text-gray-400">ID: {metaConnection!.instagramAccountId}</p>
                        {metaConnection!.lastSyncedAt && (
                          <p className="text-[11px] text-gray-400 mt-1">
                            Última sync: {new Date(metaConnection!.lastSyncedAt).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSyncMeta}
                        className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Sincronizar ahora
                      </button>
                      <button
                        onClick={() => { setShowMetaForm(true); setMetaTokenInput(''); setMetaAccounts([]); }}
                        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Cambiar cuenta
                      </button>
                      <button
                        onClick={handleDisconnectMeta}
                        className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Desconectar
                      </button>
                    </div>
                  </div>
                ) : !isMetaConnected && !showMetaForm ? (
                  <button
                    onClick={() => setShowMetaForm(true)}
                    className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#1877F2] hover:bg-[#1565D8] py-2.5 rounded-xl transition-colors"
                  >
                    <Wifi className="w-4 h-4" /> Conectar con Meta
                  </button>
                ) : null}

                {showMetaForm && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-dark text-sm">Conectar cuenta de Instagram</h4>
                      <button onClick={() => { setShowMetaForm(false); setMetaError(null); setMetaAccounts([]); }}
                        className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 space-y-1">
                      <p className="font-bold">¿Cómo obtener tu token?</p>
                      <ol className="list-decimal list-inside space-y-0.5 text-blue-600">
                        <li>Ir a <a href="https://developers.facebook.com/tools/explorer" target="_blank" rel="noreferrer" className="underline font-bold">Graph API Explorer ↗</a></li>
                        <li>Seleccioná tu app de Meta (o creá una gratis)</li>
                        <li>Agregá permisos: <code className="bg-blue-100 px-1 rounded">instagram_basic</code>, <code className="bg-blue-100 px-1 rounded">instagram_manage_insights</code>, <code className="bg-blue-100 px-1 rounded">pages_show_list</code>, <code className="bg-blue-100 px-1 rounded">pages_read_engagement</code></li>
                        <li>Generá el token y pegalo acá abajo</li>
                      </ol>
                    </div>

                    {/* Token input */}
                    <div>
                      <label className="label">Access Token *</label>
                      <div className="relative">
                        <input
                          type={showToken ? 'text' : 'password'}
                          value={metaTokenInput}
                          onChange={e => { setMetaTokenInput(e.target.value); setMetaAccounts([]); setMetaError(null); }}
                          className="input pr-10"
                          placeholder="EAAxxxxxxxxxxxxx..."
                        />
                        <button
                          type="button"
                          onClick={() => setShowToken(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {metaError && (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-600">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{metaError}</span>
                      </div>
                    )}

                    {/* Account selector after detection */}
                    {metaAccounts.length > 0 && (
                      <div>
                        <label className="label">Cuenta de Instagram detectada</label>
                        <div className="space-y-2">
                          {metaAccounts.map(acc => (
                            <label key={acc.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedMetaAccount?.id === acc.id ? 'border-violet-400 bg-violet-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                              <input
                                type="radio"
                                name="metaAccount"
                                checked={selectedMetaAccount?.id === acc.id}
                                onChange={() => setSelectedMetaAccount(acc)}
                                className="accent-violet-600"
                              />
                              <div>
                                <p className="text-sm font-bold text-dark">@{acc.username}</p>
                                <p className="text-[11px] text-gray-400">Página: {acc.pageName} · ID: {acc.id}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 justify-end">
                      {metaAccounts.length === 0 ? (
                        <button
                          onClick={handleDetectAccounts}
                          disabled={!metaTokenInput.trim() || metaLoading}
                          className="btn-primary text-sm bg-[#1877F2] hover:bg-[#1565D8] disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {metaLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
                          {metaLoading ? 'Detectando…' : 'Detectar cuentas'}
                        </button>
                      ) : (
                        <button
                          onClick={handleSaveMetaConnection}
                          disabled={!selectedMetaAccount}
                          className="btn-primary text-sm bg-violet-600 hover:bg-violet-700 disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" /> Guardar conexión
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact info */}
              {(account.devWhatsApp || account.devEmail) && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Contacto del cliente</p>
                  <div className="space-y-1">
                    {account.devEmail && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="text-gray-400">Email:</span> {account.devEmail}
                      </p>
                    )}
                    {account.devWhatsApp && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {account.devWhatsApp}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CMAccountDetail;
