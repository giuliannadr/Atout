import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, Code2, Megaphone,
  BarChart2, Users, Shield, Zap,
  Globe, ArrowRight, ChevronDown, Star, Layout,
  CreditCard, GitPullRequest,
  TrendingUp, CheckCircle2, Sparkles,
} from 'lucide-react';
import AtoutLogo, { AtoutMark } from '../components/brand/AtoutLogo';

// ── Blob background ────────────────────────────────────────────────────────────
const BlobBg: React.FC<{ className?: string; variant?: 'hero' | 'cta' | 'subtle' }> = ({
  className = '',
  variant = 'hero',
}) => {
  const blobs = {
    hero: [
      { cx: '-5%',  cy: '-10%', w: '50%', h: '55%', color: '#C4B5FD', op: 0.55 },
      { cx: '65%',  cy: '-5%',  w: '40%', h: '45%', color: '#67E8F9', op: 0.45 },
      { cx: '30%',  cy: '50%',  w: '45%', h: '50%', color: '#FED7AA', op: 0.50 },
      { cx: '80%',  cy: '60%',  w: '35%', h: '40%', color: '#FCA5A5', op: 0.40 },
    ],
    cta: [
      { cx: '-5%',  cy: '-20%', w: '55%', h: '70%', color: '#C4B5FD', op: 0.5 },
      { cx: '60%',  cy: '30%',  w: '50%', h: '60%', color: '#67E8F9', op: 0.4 },
      { cx: '20%',  cy: '60%',  w: '40%', h: '50%', color: '#FCA5A5', op: 0.4 },
    ],
    subtle: [
      { cx: '-10%', cy: '-5%',  w: '40%', h: '50%', color: '#DDD6FE', op: 0.4 },
      { cx: '70%',  cy: '40%',  w: '35%', h: '45%', color: '#BAE6FD', op: 0.3 },
    ],
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {blobs[variant].map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.cx, top: b.cy,
            width: b.w, height: b.h,
            background: b.color,
            opacity: b.op,
            borderRadius: '50%',
            filter: 'blur(80px)',
          }}
        />
      ))}
    </div>
  );
};

// ── App Mockup (light theme) ───────────────────────────────────────────────────
const AppMockup: React.FC = () => (
  <div className="relative w-full max-w-[620px] mx-auto select-none">
    {/* Floating badge — top left */}
    <div className="absolute -left-6 top-12 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-3 animate-none">
      <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      </div>
      <div>
        <p className="text-xs font-black text-gray-800">Portal enviado</p>
        <p className="text-[10px] text-gray-400">Cliente vió el avance</p>
      </div>
    </div>

    {/* Floating badge — bottom right */}
    <div className="absolute -right-6 bottom-20 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
        <TrendingUp className="w-4 h-4 text-violet-600" />
      </div>
      <div>
        <p className="text-xs font-black text-gray-800">Pago recibido</p>
        <p className="text-[10px] text-gray-400 font-semibold text-emerald-600">+ U$D 1.200</p>
      </div>
    </div>

    {/* Browser window */}
    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200/80 bg-white">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 mx-4">
          <div className="h-5 bg-white rounded-md border border-gray-200 flex items-center px-3 gap-2 max-w-xs mx-auto">
            <div className="w-3 h-3 rounded-full bg-gray-200" />
            <div className="h-2 w-32 rounded bg-gray-200" />
          </div>
        </div>
        <div className="w-16 h-5 rounded bg-gray-200" />
      </div>

      {/* App UI */}
      <div className="flex bg-white" style={{ height: 360 }}>
        {/* Sidebar */}
        <div className="w-52 border-r border-gray-100 flex flex-col bg-white py-4 px-3 shrink-0">
          {/* Logo in sidebar */}
          <div className="flex items-center gap-2 px-2 mb-5">
            <div className="w-6 h-6 rounded-lg bg-primary" />
            <div className="h-3 w-16 rounded bg-gray-200" />
          </div>

          {/* Nav items */}
          <div className="space-y-1">
            {[
              { label: 'Dashboard', active: true },
              { label: 'Proyectos', active: false },
              { label: 'Clientes', active: false },
              { label: 'Finanzas', active: false },
              { label: 'Configuración', active: false },
            ].map(item => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg`}
                style={{ background: item.active ? '#EEE9FF' : 'transparent' }}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-primary' : 'bg-gray-300'}`} />
                <div className={`h-2 rounded ${item.active ? 'w-20' : 'w-16'}`}
                  style={{ background: item.active ? '#2D1B69' : '#D1D5DB' }} />
              </div>
            ))}
          </div>

          {/* Team members */}
          <div className="mt-auto px-2">
            <div className="h-2 w-10 rounded bg-gray-200 mb-2" />
            <div className="flex -space-x-1">
              {['#C4B5FD', '#67E8F9', '#FCA5A5'].map((c, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white" style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 p-5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="h-3.5 w-32 rounded bg-gray-800 mb-1.5" />
              <div className="h-2 w-44 rounded bg-gray-300" />
            </div>
            <div className="h-8 w-28 rounded-xl bg-primary" />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { val: '$4.8k', label: 'Facturado', color: '#10b981', bg: '#f0fdf4' },
              { val: '12 activos', label: 'Proyectos', color: '#2D1B69', bg: '#EEE9FF' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-2.5 border border-gray-100"
                style={{ background: s.bg }}>
                <p className="text-xs font-black" style={{ color: s.color }}>{s.val}</p>
                <p className="text-[9px] text-gray-400 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Project cards */}
          <div className="space-y-2">
            {[
              { name: 'E-commerce Moderno', client: 'Tienda Bonita', progress: 72, color: '#2D1B69', status: 'Activo', statusBg: '#EEE9FF' },
              { name: 'App SaaS B2B',       client: 'TechCorp SA',   progress: 45, color: '#0891B2', status: 'Revisión', statusBg: '#E0F7FA' },
              { name: 'Landing Minimalista', client: 'Studio Flux',  progress: 90, color: '#059669', status: 'Entrega', statusBg: '#ECFDF5' },
            ].map(p => (
              <div key={p.name} className="rounded-xl p-3 border border-gray-100 bg-white flex items-center gap-3 hover:border-gray-200">
                <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: p.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="h-2.5 rounded font-bold" style={{ background: '#1f2937', width: `${p.name.length * 4}px`, maxWidth: '120px' }} />
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: p.statusBg, color: p.color }}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                      <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: p.color }} />
                    </div>
                    <span className="text-[9px] font-bold" style={{ color: p.color }}>{p.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini sidebar widgets */}
        <div className="w-44 border-l border-gray-100 p-3 flex flex-col gap-2 shrink-0 overflow-hidden">
          <div className="rounded-xl border border-gray-100 p-2.5">
            <div className="h-2 w-16 rounded bg-gray-200 mb-2" />
            <div className="h-6 rounded bg-amber-50 border border-amber-100 flex items-center px-2 gap-1.5 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <div className="h-1.5 flex-1 rounded bg-amber-200" />
            </div>
            <div className="h-6 rounded bg-emerald-50 border border-emerald-100 flex items-center px-2 gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <div className="h-1.5 flex-1 rounded bg-emerald-200" />
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 p-2.5 flex-1">
            <div className="h-2 w-12 rounded bg-gray-200 mb-2" />
            {[1,2].map(i => (
              <div key={i} className="flex items-center gap-1.5 mb-2">
                <div className="w-5 h-5 rounded-lg bg-violet-100 shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-1.5 rounded bg-gray-200 w-full" />
                  <div className="h-1.5 rounded bg-gray-100 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ── CM Mockup ──────────────────────────────────────────────────────────────────
const CMMockup: React.FC = () => (
  <div className="relative w-full max-w-[560px] mx-auto select-none">
    <div className="absolute -left-5 top-10 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-pink-50 flex items-center justify-center">
          <BarChart2 className="w-3.5 h-3.5 text-pink-500" />
        </div>
        <div>
          <p className="text-xs font-black text-gray-800">+1.2k seguidores</p>
          <p className="text-[10px] text-gray-400">Esta semana · IG</p>
        </div>
      </div>
    </div>
    <div className="absolute -right-5 bottom-16 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-violet-50 flex items-center justify-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-violet-500" />
        </div>
        <div>
          <p className="text-xs font-black text-gray-800">Post aprobado</p>
          <p className="text-[10px] text-gray-400">Nike Argentina</p>
        </div>
      </div>
    </div>

    <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
      {/* Chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 mx-4">
          <div className="h-5 bg-white rounded-md border border-gray-200 max-w-xs mx-auto" />
        </div>
      </div>

      {/* Content calendar */}
      <div className="p-5" style={{ minHeight: 300 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-3 w-36 rounded bg-gray-800 mb-1.5" />
            <div className="h-2 w-24 rounded bg-gray-200" />
          </div>
          <div className="flex gap-2">
            {['#E0E7FF','#FCE7F3','#ECFDF5'].map((c,i) => (
              <div key={i} className="h-6 w-16 rounded-lg border border-gray-200" style={{ background: c }} />
            ))}
          </div>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {['L','M','X','J','V','S','D'].map((d, i) => (
            <div key={i} className="text-center text-[9px] font-bold text-gray-400 pb-1">{d}</div>
          ))}
          {Array.from({ length: 21 }).map((_, i) => {
            const colors = ['#EEE9FF','#FCE7F3','#ECFDF5','','','#FEF3C7',''];
            const c = colors[i % 7];
            return (
              <div key={i} className={`aspect-square rounded-lg flex items-center justify-center ${c ? 'border' : ''}`}
                style={{ background: c || '#F9FAFB', borderColor: c ? c : 'transparent' }}>
                <span className="text-[8px] font-bold text-gray-500">{i + 1}</span>
              </div>
            );
          })}
        </div>

        {/* Account pills */}
        <div className="flex gap-2 flex-wrap mt-3">
          {[
            { name: 'Nike AR', color: '#1f2937' },
            { name: 'CaféLindo', color: '#9333ea' },
            { name: 'FitLife', color: '#0891B2' },
          ].map(a => (
            <div key={a.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 bg-white">
              <div className="w-2 h-2 rounded-full" style={{ background: a.color }} />
              <span className="text-[10px] font-bold text-gray-700">{a.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Data ───────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Layout,        title: 'Dashboard en tiempo real',        desc: 'Proyectos, ingresos y vencimientos en un vistazo. Sin hojas de cálculo.' },
  { icon: Globe,         title: 'Portal profesional para clientes', desc: 'Link único por proyecto. Tu cliente ve el avance sin necesitar una cuenta.' },
  { icon: GitPullRequest,title: 'Control de cambios',              desc: 'Registrá cada pedido del cliente. Aprobá o rechazá con impacto estimado.' },
  { icon: CreditCard,    title: 'Control de cobros',               desc: 'Adelantos, saldos y estado de pago por proyecto. Nada se pierde.' },
  { icon: Users,         title: 'Team Hub',                        desc: 'Recursos compartidos, notas para el equipo y roles visibles para todos.' },
  { icon: Shield,        title: 'Siempre seguro',                  desc: 'Sincronización en la nube con Supabase. Accedé desde cualquier dispositivo.' },
];

const DEV_FEATURES = [
  'Gestión de proyectos web',
  'Portal de cliente con link único',
  'Timeline y fases del proyecto',
  'Control de pagos (adelanto + saldo)',
  'Solicitudes de cambio (scope creep)',
  'Gestión de accesos y repos',
  'Log de actualizaciones al cliente',
  'Team Hub compartido',
];

const CM_FEATURES = [
  'Gestión de cuentas de marcas',
  'Calendario de contenido',
  'Métricas por plataforma',
  'Alcance, engagement y seguidores',
  'Reporte mensual PDF para marcas',
  'Multi-plataforma (IG, TikTok, FB...)',
  'Gestión de equipo de contenido',
  'Templates de caption',
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/mes',
    desc: 'Para arrancar a organizarte',
    features: ['Hasta 5 proyectos', 'Portal de cliente', 'Dashboard básico', 'Plantillas de proyecto'],
    cta: 'Empezar gratis',
    ctaLink: '/auth',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/mes',
    desc: 'Para freelancers serios',
    features: ['Proyectos ilimitados', 'Facturas PDF', 'Reportes y exports', 'Soporte prioritario', '1 año gratis con tu pack'],
    cta: 'Empezar con Pro',
    ctaLink: '/auth',
    highlight: true,
    badge: 'Más popular',
  },
  {
    name: 'Agencia',
    price: '$29',
    period: '/mes',
    desc: 'Para agencias y equipos',
    features: ['Todo en Pro', 'Gestión de equipo', 'Sub-cuentas', 'Asistente IA', 'White-label'],
    cta: 'Próximamente',
    ctaLink: '#',
    highlight: false,
    badge: 'Con IA',
  },
];

const FAQS = [
  {
    q: '¿Es realmente gratis el plan Free?',
    a: 'Sí, el plan Free no requiere tarjeta de crédito. Podés gestionar hasta 5 proyectos sin costo.',
  },
  {
    q: '¿Cómo funciona el código de descuento del pack?',
    a: 'Al comprar el pack de productos digitales, recibís un código único. Ingresalo en la app para activar 1 año de Pro completamente gratis.',
  },
  {
    q: '¿Puedo usar tanto el perfil Developer como Community Manager?',
    a: 'Cada cuenta tiene un perfil asignado. El plan Agencia permitirá gestionar ambos perfiles.',
  },
  {
    q: '¿Funciona offline?',
    a: 'La versión web requiere conexión. La app de escritorio (próximamente) guardará una copia local.',
  },
];

// ── Main ───────────────────────────────────────────────────────────────────────
const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [activeProfile, setActiveProfile] = useState<'developer' | 'cm'>('developer');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white" style={{ fontFamily: 'inherit' }}>

      {/* ── Navbar ───────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white/60 backdrop-blur-sm'
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/landing">
            <AtoutLogo size="sm" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['Características', 'Perfiles', 'Precios'].map((item, i) => (
              <a
                key={item}
                href={['/landing#features', '/landing#profiles', '/landing#pricing'][i]}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth" className="hidden md:block text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
              Iniciar sesión
            </Link>
            <Link to="/auth" className="btn-primary text-sm py-2 px-5">
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-20 overflow-hidden bg-white">
        <BlobBg variant="hero" />

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          {/* Pill badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-bold text-gray-700">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              Para developers web y community managers
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-6">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-6">
              Tu estudio freelance,
              <br />
              <span className="relative inline-block">
                <span style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 50%, #0891B2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  organizado.
                </span>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Proyectos, clientes, cobros y equipo en un solo lugar.
              Dejá de improvisar y empezá a construir tu negocio con criterio.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              to="/auth"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all hover:-translate-y-0.5 shadow-lg shadow-violet-200"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}
            >
              Empezar gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="/landing#features"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-gray-700 font-bold text-base bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              Ver características
            </a>
          </div>

          {/* Mockup */}
          <AppMockup />
        </div>
      </section>

      {/* ── Social proof strip ───────────────────────────────────────────────── */}
      <div className="border-y border-gray-100 bg-gray-50/70 py-5 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400 font-semibold">
          {[
            { icon: Star,          label: '500+ freelancers' },
            { icon: Zap,          label: 'Gratis para empezar' },
            { icon: Globe,        label: 'Web + desktop' },
            { icon: Shield,       label: 'Datos seguros en la nube' },
            { icon: TrendingUp,   label: 'Latam-first' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-violet-400" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section id="features" className="relative py-28 px-6 overflow-hidden bg-white">
        <BlobBg variant="subtle" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-3">Características</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
              Todo lo que necesitás
              <br />para profesionalizarte
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              De la propuesta al cobro, Atout te acompaña en cada etapa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="group p-7 rounded-3xl bg-white border border-gray-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-colors"
                  style={{ background: ['#EEE9FF','#E0F2FE','#ECFDF5','#FEF3C7','#FCE7F3','#F3F4F6'][i % 6] }}>
                  <Icon className="w-5 h-5"
                    style={{ color: ['#7C3AED','#0284C7','#059669','#D97706','#DB2777','#6b7280'][i % 6] }} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Profiles ─────────────────────────────────────────────────────────── */}
      <section id="profiles" className="relative py-28 px-6 overflow-hidden" style={{ background: '#FAFBFF' }}>
        <BlobBg variant="subtle" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-3">Dos perfiles</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
              Diseñado para tu tipo de trabajo
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              El dashboard, la terminología y las herramientas se adaptan a tu perfil.
            </p>

            {/* Toggle */}
            <div className="inline-flex mt-8 p-1.5 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <button
                onClick={() => setActiveProfile('developer')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeProfile === 'developer'
                    ? 'text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={activeProfile === 'developer' ? { background: 'linear-gradient(135deg,#7C3AED,#2563EB)' } : {}}
              >
                <Code2 className="w-4 h-4" /> Developer Web
              </button>
              <button
                onClick={() => setActiveProfile('cm')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeProfile === 'cm'
                    ? 'text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={activeProfile === 'cm' ? { background: 'linear-gradient(135deg,#DB2777,#7C3AED)' } : {}}
              >
                <Megaphone className="w-4 h-4" /> Community Manager
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Feature list */}
            <div className="rounded-3xl p-8 text-white"
              style={{
                background: activeProfile === 'developer'
                  ? 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)'
                  : 'linear-gradient(135deg, #DB2777 0%, #7C3AED 100%)',
              }}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
                  {activeProfile === 'developer'
                    ? <Code2 className="w-7 h-7 text-white" />
                    : <Megaphone className="w-7 h-7 text-white" />}
                </div>
                <div>
                  <h3 className="text-2xl font-black">
                    {activeProfile === 'developer' ? 'Developer Web' : 'Community Manager'}
                  </h3>
                  <p className="text-white/70 text-sm mt-0.5">
                    {activeProfile === 'developer' ? 'Proyectos, clientes y cobros' : 'Cuentas, contenido y métricas'}
                  </p>
                </div>
              </div>

              <ul className="space-y-3">
                {(activeProfile === 'developer' ? DEV_FEATURES : CM_FEATURES).map(f => (
                  <li key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white/90">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/auth"
                className="mt-8 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-white font-bold text-sm transition-all hover:bg-white/90"
                style={{ color: activeProfile === 'developer' ? '#7C3AED' : '#DB2777' }}
              >
                Empezar como {activeProfile === 'developer' ? 'Developer' : 'CM'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mockup for each profile */}
            <div className="flex justify-center">
              {activeProfile === 'developer' ? <AppMockup /> : <CMMockup />}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="relative py-28 px-6 overflow-hidden bg-white">
        <BlobBg variant="subtle" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-3">Precios</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
              Simple y transparente
            </h2>
            <p className="text-gray-500 text-lg">
              Comprá el pack de productos digitales y activá{' '}
              <strong className="text-gray-800">1 año de Pro gratis</strong> con tu código.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 flex flex-col transition-all ${
                  plan.highlight
                    ? 'border-2 shadow-2xl shadow-violet-100'
                    : 'border border-gray-200 bg-white hover:shadow-lg'
                }`}
                style={plan.highlight ? {
                  borderColor: '#7C3AED',
                  background: 'linear-gradient(160deg, #FAFBFF 0%, #F5F0FF 100%)',
                } : {}}
              >
                {plan.highlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[11px] font-bold px-4 py-1.5 rounded-full text-white whitespace-nowrap"
                    style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                    ✦ Más popular
                  </span>
                )}
                {'badge' in plan && plan.badge && !plan.highlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[11px] font-bold px-4 py-1.5 rounded-full bg-amber-400 text-white whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="font-black text-gray-900 text-xl mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 my-3">
                    <span className="text-5xl font-black text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-500">{plan.desc}</p>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3">
                      <Check className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-violet-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${f.includes('gratis') ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.ctaLink === '#' ? '/auth' : plan.ctaLink}
                  className={`py-3.5 px-5 rounded-xl font-bold text-sm text-center transition-all ${
                    plan.highlight
                      ? 'text-white hover:opacity-90 shadow-lg shadow-violet-200'
                      : plan.ctaLink === '#'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={plan.highlight ? { background: 'linear-gradient(135deg,#7C3AED,#2563EB)' } : {}}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            ¿Ya compraste el pack? Registrate e ingresá tu código en Configuración → Plan & Perfil.
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: '#FAFBFF' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Preguntas frecuentes</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 ml-4 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="relative py-28 px-6 overflow-hidden bg-white">
        <BlobBg variant="cta" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <AtoutMark size={56} className="mx-auto mb-8" />
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-5 leading-tight">
            Empezá gratis hoy.
            <br />
            <span style={{
              background: 'linear-gradient(135deg,#7C3AED,#2563EB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Sin excusas.
            </span>
          </h2>
          <p className="text-gray-500 mb-10 text-lg">
            Sin tarjeta de crédito. Sin compromisos. Cancelás cuando querés.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/auth"
              className="flex items-center gap-2 px-10 py-4 rounded-2xl text-white font-bold text-base transition-all hover:-translate-y-0.5 shadow-xl shadow-violet-200"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}
            >
              Crear cuenta gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/auth"
              className="flex items-center gap-2 px-10 py-4 rounded-2xl text-gray-700 font-bold text-base bg-white border border-gray-200 hover:border-gray-300 transition-all"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/landing">
            <AtoutLogo size="xs" />
          </Link>

          <nav className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            {[
              ['Características', '/landing#features'],
              ['Perfiles', '/landing#profiles'],
              ['Precios', '/landing#pricing'],
            ].map(([label, href]) => (
              <a key={label} href={href} className="hover:text-gray-900 transition-colors">{label}</a>
            ))}
            <Link to="/auth" className="hover:text-gray-900 transition-colors">Iniciar sesión</Link>
          </nav>

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Atout · Hecho para freelancers latinoamericanos.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
