import React, { useState } from 'react';
import { format, addMonths } from 'date-fns';
import {
  Globe, Music2, Link2, ShoppingBag, User, FileText,
  ArrowRight, Check, X, Plus,
} from 'lucide-react';
import type { Project, CMBrandConfig } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';

const PLATFORMS_ALL = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'YouTube', 'Pinterest', 'Twitter/X'];

interface CMTemplate {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  platforms: string[];
  contentPillars: string[];
  postingGoals: Record<string, number>;
  brandVoice: string;
}

const TEMPLATES: CMTemplate[] = [
  {
    id: 'meta',
    label: 'Meta (Instagram + Facebook)',
    description: 'Feed, stories, reels y campañas integradas',
    icon: <Globe className="w-5 h-5" />,
    color: '#E1306C',
    platforms: ['Instagram', 'Facebook'],
    contentPillars: ['Entretenimiento', 'Educación', 'Ventas', 'Behind the scenes'],
    postingGoals: { Instagram: 5, Facebook: 3 },
    brandVoice: 'Cercana y auténtica',
  },
  {
    id: 'shortvideo',
    label: 'Short Video (TikTok + Instagram)',
    description: 'Contenido corto, reels y tendencias virales',
    icon: <Music2 className="w-5 h-5" />,
    color: '#111827',
    platforms: ['TikTok', 'Instagram'],
    contentPillars: ['Entretenimiento', 'Trends', 'Tutoriales', 'Humor'],
    postingGoals: { TikTok: 6, Instagram: 4 },
    brandVoice: 'Dinámica y divertida',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn B2B / Marca Personal',
    description: 'Posicionamiento profesional y thought leadership',
    icon: <Link2 className="w-5 h-5" />,
    color: '#0A66C2',
    platforms: ['LinkedIn'],
    contentPillars: ['Thought leadership', 'Casos de éxito', 'Cultura', 'Industria'],
    postingGoals: { LinkedIn: 3 },
    brandVoice: 'Profesional y confiable',
  },
  {
    id: 'ecommerce',
    label: 'E-commerce / Tienda',
    description: 'Productos, promos y testimonios para ventas',
    icon: <ShoppingBag className="w-5 h-5" />,
    color: '#059669',
    platforms: ['Instagram', 'Facebook', 'Pinterest'],
    contentPillars: ['Productos', 'Promociones', 'Testimonios', 'Lifestyle'],
    postingGoals: { Instagram: 6, Facebook: 4, Pinterest: 5 },
    brandVoice: 'Inspiradora y persuasiva',
  },
  {
    id: 'personal',
    label: 'Marca Personal',
    description: 'Presencia digital del cliente como individuo',
    icon: <User className="w-5 h-5" />,
    color: '#7C3AED',
    platforms: ['Instagram', 'LinkedIn', 'TikTok'],
    contentPillars: ['Expertise', 'Día a día', 'Valores', 'Educación'],
    postingGoals: { Instagram: 4, LinkedIn: 2, TikTok: 3 },
    brandVoice: 'Personal y empática',
  },
  {
    id: 'blank',
    label: 'En blanco',
    description: 'Configurar todo desde cero sin plantilla',
    icon: <FileText className="w-5 h-5" />,
    color: '#6B7280',
    platforms: [],
    contentPillars: [],
    postingGoals: {},
    brandVoice: '',
  },
];

const COLORS = [
  '#E1306C', '#7C3AED', '#059669', '#0A66C2', '#EA580C',
  '#111827', '#DC2626', '#0891B2', '#D97706', '#6B7280',
];

interface NewCMAccountFormProps {
  onSubmit: (project: Project) => void;
  onCancel: () => void;
}

const NewCMAccountForm: React.FC<NewCMAccountFormProps> = ({ onSubmit, onCancel }) => {
  const { settings } = useSettingsStore();
  const [step, setStep] = useState(0);
  const [template, setTemplate] = useState<CMTemplate | null>(null);
  const [newPillar, setNewPillar] = useState('');

  const [form, setForm] = useState({
    name: '',
    client: '',
    description: '',
    color: '#7C3AED',
    platforms: [] as string[],
    startDate: format(new Date(), 'yyyy-MM-dd'),
    monthlyFee: '' as string | number,
    currency: settings.defaultCurrency as 'USD' | 'ARS' | 'MXN' | 'CLP',
    brandVoice: '',
    contentPillars: [] as string[],
    postingGoals: {} as Record<string, number>,
    bioLink: '',
    brandNotes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const pick = (tpl: CMTemplate) => {
    setTemplate(tpl);
    setForm(prev => ({
      ...prev,
      color: tpl.color,
      platforms: [...tpl.platforms],
      contentPillars: [...tpl.contentPillars],
      postingGoals: { ...tpl.postingGoals },
      brandVoice: tpl.brandVoice,
    }));
    setStep(1);
  };

  const togglePlatform = (p: string) => {
    setForm(prev => {
      const next = prev.platforms.includes(p)
        ? prev.platforms.filter(x => x !== p)
        : [...prev.platforms, p];
      // Clear posting goals for removed platforms
      const goals = { ...prev.postingGoals };
      if (prev.platforms.includes(p) && !next.includes(p)) delete goals[p];
      return { ...prev, platforms: next, postingGoals: goals };
    });
  };

  const addPillar = () => {
    if (!newPillar.trim()) return;
    setForm(prev => ({ ...prev, contentPillars: [...prev.contentPillars, newPillar.trim()] }));
    setNewPillar('');
  };

  const removePillar = (p: string) => {
    setForm(prev => ({ ...prev, contentPillars: prev.contentPillars.filter(x => x !== p) }));
  };

  const validate1 = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'El nombre es obligatorio';
    if (!form.client.trim()) errs.client = 'El nombre del cliente es obligatorio';
    if (form.platforms.length === 0) errs.platforms = 'Seleccioná al menos una plataforma';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    const brandConfig: CMBrandConfig = {
      brandVoice: form.brandVoice,
      contentPillars: form.contentPillars,
      postingGoals: form.postingGoals,
      bioLink: form.bioLink || undefined,
      brandNotes: form.brandNotes,
    };

    const fee = Number(form.monthlyFee);

    const newAccount: Project = {
      id: crypto.randomUUID(),
      name: form.name,
      client: form.client,
      description: form.description,
      stack: form.platforms.join(' · '), // platforms stored in stack
      hosting: '',
      domain: '',
      startDate: new Date(form.startDate).toISOString(),
      deliveryDate: addMonths(new Date(form.startDate), 3).toISOString(),
      status: 'active',
      progress: 0,
      currentStage: 'Gestión activa',
      notice: '',
      currency: form.currency,
      totalAmount: fee || 0,
      adelantoStatus: 'pending',
      saldoStatus: 'pending',
      phases: [],
      deliverables: [],
      revisions: [],
      documents: [],
      accesses: [],
      updates: [{
        id: crypto.randomUUID(),
        message: `Cuenta creada${template && template.id !== 'blank' ? ` desde plantilla "${template.label}"` : ''}.`,
        type: 'info',
        date: new Date().toISOString(),
        author: settings.name,
      }],
      themeColor: form.color,
      devName: settings.name,
      devEmail: settings.email,
      devWhatsApp: settings.whatsApp,
      devPortfolio: settings.portfolio,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contentPosts: [],
      cmMetrics: [],
      cmCampaigns: [],
      cmEvents: [],
      cmHashtagGroups: [],
      cmBrandConfig: brandConfig,
      cmMonthlyFees: fee > 0 ? [{
        id: crypto.randomUUID(),
        month: format(new Date(), 'yyyy-MM'),
        amount: fee,
        currency: form.currency,
        status: 'pending',
        notes: 'Honorario inicial',
      }] : [],
    };

    onSubmit(newAccount);
  };

  const TOTAL_STEPS = 3;

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      {step > 0 && (
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                i < step - 1 ? 'bg-violet-500' : i === step - 1 ? 'bg-violet-300' : 'bg-gray-100'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── STEP 0: Template ── */}
      {step === 0 && (
        <div className="space-y-3 animate-in slide-in-from-right-4 duration-200">
          <div className="mb-2">
            <h3 className="font-bold text-dark">¿Qué tipo de cuenta vas a gestionar?</h3>
            <p className="text-sm text-gray-400 mt-0.5">Elegí una plantilla para pre-cargar plataformas y pilares.</p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => pick(tpl)}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all text-left group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                  style={{ backgroundColor: tpl.color }}
                >
                  {tpl.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-dark">{tpl.label}</p>
                  <p className="text-xs text-gray-400 truncate">{tpl.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-violet-400 shrink-0 transition-colors" />
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button type="button" onClick={onCancel} className="btn-secondary text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {/* ── STEP 1: Essentials ── */}
      {step === 1 && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
          {template && template.id !== 'blank' && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl text-white text-xs font-bold" style={{ backgroundColor: template.color }}>
              {template.icon}
              Plantilla: {template.label}
              <Check className="w-3.5 h-3.5 ml-auto" />
            </div>
          )}

          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Paso 1 — Información de la marca</h3>

          <div>
            <label className="label">Nombre de la marca / cuenta *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }}
              className={`input ${errors.name ? 'border-danger' : ''}`}
              placeholder="Ej: Café Bonito, @laradentista, TechFlow SRL"
              autoFocus
            />
            {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="label">Nombre del cliente / contacto *</label>
            <input
              type="text"
              value={form.client}
              onChange={e => { setForm(p => ({ ...p, client: e.target.value })); setErrors(p => ({ ...p, client: '' })); }}
              className={`input ${errors.client ? 'border-danger' : ''}`}
              placeholder="Ej: María González"
            />
            {errors.client && <p className="text-xs text-danger mt-1">{errors.client}</p>}
          </div>

          <div>
            <label className="label">Descripción del negocio</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={2}
              className="input resize-none"
              placeholder="Qué hace el negocio, quién es su público..."
            />
          </div>

          {/* Platforms */}
          <div>
            <label className="label">Plataformas *</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS_ALL.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { togglePlatform(p); setErrors(pr => ({ ...pr, platforms: '' })); }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all ${
                    form.platforms.includes(p)
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            {errors.platforms && <p className="text-xs text-danger mt-1">{errors.platforms}</p>}
          </div>

          {/* Color picker */}
          <div>
            <label className="label">Color de la cuenta</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, color: c }))}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    form.color === c ? 'border-dark scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Fee + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Inicio del servicio</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Honorario mensual</label>
              <div className="flex gap-2">
                <select
                  value={form.currency}
                  onChange={e => setForm(p => ({ ...p, currency: e.target.value as typeof form.currency }))}
                  className="input w-20 shrink-0 px-2"
                >
                  {['USD', 'ARS', 'MXN', 'CLP'].map(c => <option key={c}>{c}</option>)}
                </select>
                <input
                  type="number"
                  min={0}
                  value={form.monthlyFee}
                  onChange={e => setForm(p => ({ ...p, monthlyFee: e.target.value }))}
                  className="input flex-1"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setStep(0)} className="btn-secondary text-sm">Anterior</button>
            <button
              type="button"
              onClick={() => { if (validate1()) setStep(2); }}
              className="btn-primary text-sm flex items-center gap-2"
              style={{ background: form.color }}
            >
              Siguiente <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Content setup ── */}
      {step === 2 && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Paso 2 — Estrategia de contenido</h3>

          {/* Brand voice */}
          <div>
            <label className="label">Tono / Voz de la marca</label>
            <input
              type="text"
              value={form.brandVoice}
              onChange={e => setForm(p => ({ ...p, brandVoice: e.target.value }))}
              className="input"
              placeholder="Ej: Cercana, profesional, con humor"
            />
          </div>

          {/* Content pillars */}
          <div>
            <label className="label">Pilares de contenido</label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
              {form.contentPillars.map(p => (
                <span key={p} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-violet-50 text-violet-700 rounded-full">
                  {p}
                  <button type="button" onClick={() => removePillar(p)} className="hover:text-danger">
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
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPillar())}
                className="input flex-1"
                placeholder="Ej: Educación, Ventas, Lifestyle..."
              />
              <button type="button" onClick={addPillar} className="btn-secondary text-sm shrink-0 px-3">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Posting goals */}
          {form.platforms.length > 0 && (
            <div>
              <label className="label">Frecuencia de posteo (posts/semana)</label>
              <div className="space-y-2">
                {form.platforms.map(pl => (
                  <div key={pl} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-dark w-28 shrink-0">{pl}</span>
                    <input
                      type="range"
                      min={0}
                      max={14}
                      value={form.postingGoals[pl] ?? 3}
                      onChange={e => setForm(prev => ({ ...prev, postingGoals: { ...prev.postingGoals, [pl]: Number(e.target.value) } }))}
                      className="flex-1 accent-violet-500"
                    />
                    <span className="text-sm font-bold text-violet-600 w-16 text-right">
                      {form.postingGoals[pl] ?? 3} post{(form.postingGoals[pl] ?? 3) !== 1 ? 's' : ''}/sem
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bio link */}
          <div>
            <label className="label">Link en bio</label>
            <input
              type="url"
              value={form.bioLink}
              onChange={e => setForm(p => ({ ...p, bioLink: e.target.value }))}
              className="input"
              placeholder="https://..."
            />
          </div>

          {/* Brand notes */}
          <div>
            <label className="label">Notas iniciales</label>
            <textarea
              value={form.brandNotes}
              onChange={e => setForm(p => ({ ...p, brandNotes: e.target.value }))}
              rows={2}
              className="input resize-none"
              placeholder="Referencias, instrucciones del cliente, info importante..."
            />
          </div>

          {/* Preview card */}
          <div className="rounded-xl border-l-4 border border-gray-100 p-4 bg-gray-50" style={{ borderLeftColor: form.color }}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Resumen de la cuenta</p>
            <p className="font-bold text-dark">{form.name || 'Sin nombre'}</p>
            <p className="text-xs text-gray-500">{form.client}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.platforms.map(p => (
                <span key={p} className="text-[10px] font-bold px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600">{p}</span>
              ))}
            </div>
            {form.contentPillars.length > 0 && (
              <p className="text-xs text-gray-400 mt-1.5">{form.contentPillars.join(' · ')}</p>
            )}
          </div>

          <div className="flex justify-between pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary text-sm">Anterior</button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary text-sm flex items-center gap-2"
              style={{ background: form.color }}
            >
              <Check className="w-4 h-4" /> Crear cuenta
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewCMAccountForm;
