import React, { useState } from 'react';
import {
  X, Check, Zap, Building2, Sparkles, Tag, Loader2,
  Code2, Megaphone, ArrowRight,
} from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import type { ProfileType } from '../../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggeredByLimit?: boolean;
}

interface PlanFeature {
  text: string;
  highlight?: boolean;
}

interface PlanDef {
  id: string;
  name: string;
  price: string;
  period: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  ctaStyle: string;
  popular?: boolean;
}

const DEVELOPER_PLANS: PlanDef[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/mes',
    description: 'Para empezar a organizarte',
    features: [
      { text: 'Hasta 5 proyectos' },
      { text: 'Portal de cliente básico' },
      { text: 'Plantillas de proyecto' },
      { text: 'Dashboard de estadísticas' },
    ],
    cta: 'Plan actual',
    ctaStyle: 'btn bg-gray-100 text-gray-400 cursor-not-allowed w-full justify-center',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$12',
    period: '/mes',
    badge: 'Más popular',
    badgeColor: 'bg-primary text-white',
    description: 'Para freelancers serios',
    popular: true,
    features: [
      { text: 'Proyectos ilimitados', highlight: true },
      { text: 'Generador de facturas PDF', highlight: true },
      { text: 'Portal de cliente avanzado' },
      { text: 'Exportar reportes' },
      { text: 'Soporte prioritario' },
      { text: 'Comprar pack → 1 año gratis', highlight: true },
    ],
    cta: 'Próximamente',
    ctaStyle: 'btn-primary w-full justify-center opacity-70 cursor-not-allowed',
  },
  {
    id: 'agency',
    name: 'Agencia',
    price: '$29',
    period: '/mes',
    badge: 'IA incluida',
    badgeColor: 'bg-amber-500 text-white',
    description: 'Para agencias y equipos',
    features: [
      { text: 'Todo en Pro' },
      { text: 'Gestión de equipos', highlight: true },
      { text: 'Sub-cuentas de colaboradores', highlight: true },
      { text: 'Asistente IA para proyectos', highlight: true },
      { text: 'White-label para clientes' },
      { text: 'API access' },
    ],
    cta: 'Próximamente',
    ctaStyle: 'btn bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 w-full justify-center opacity-70 cursor-not-allowed',
  },
];

const CM_PLANS: PlanDef[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/mes',
    description: 'Para empezar a organizarte',
    features: [
      { text: 'Hasta 3 cuentas de clientes' },
      { text: 'Panel de cuentas básico' },
      { text: 'Registro de plataformas' },
    ],
    cta: 'Plan actual',
    ctaStyle: 'btn bg-gray-100 text-gray-400 cursor-not-allowed w-full justify-center',
  },
  {
    id: 'pro',
    name: 'CM Pro',
    price: '$12',
    period: '/mes',
    badge: 'Más popular',
    badgeColor: 'bg-violet-500 text-white',
    description: 'Para CMs freelance serios',
    popular: true,
    features: [
      { text: 'Cuentas ilimitadas', highlight: true },
      { text: 'Calendario de contenido', highlight: true },
      { text: 'Métricas mensuales por plataforma', highlight: true },
      { text: 'Reporte PDF para clientes', highlight: true },
      { text: 'Templates de caption' },
      { text: 'Comprar pack → 1 año gratis', highlight: true },
    ],
    cta: 'Próximamente',
    ctaStyle: 'btn bg-violet-500 text-white hover:bg-violet-600 w-full justify-center opacity-70 cursor-not-allowed',
  },
  {
    id: 'agency',
    name: 'CM Agencia',
    price: '$29',
    period: '/mes',
    badge: 'IA incluida',
    badgeColor: 'bg-amber-500 text-white',
    description: 'Para agencias de social media',
    features: [
      { text: 'Todo en CM Pro' },
      { text: 'Múltiples usuarios', highlight: true },
      { text: 'Gestión de equipo por cuenta', highlight: true },
      { text: 'Generador de ideas IA', highlight: true },
      { text: 'Análisis de tendencias' },
      { text: 'White-label para marcas' },
    ],
    cta: 'Próximamente',
    ctaStyle: 'btn bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 w-full justify-center opacity-70 cursor-not-allowed',
  },
];

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, triggeredByLimit }) => {
  const { settings, redeemCoupon, couponLoading, couponError, couponSuccess } = useSettingsStore();
  const [activeProfile, setActiveProfile] = useState<ProfileType>(settings.profile ?? 'developer');
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  if (!isOpen) return null;

  const plans = activeProfile === 'community_manager' ? CM_PLANS : DEVELOPER_PLANS;

  const handleRedeem = async () => {
    if (!couponCode.trim()) return;
    await redeemCoupon(couponCode);
    if (couponSuccess) {
      setTimeout(onClose, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-dark/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary-dark to-primary px-8 py-7 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {triggeredByLimit && (
            <div className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/30 text-amber-200 text-xs font-bold px-3 py-1 rounded-full mb-3">
              <Zap className="w-3 h-3" /> Límite del plan Free alcanzado
            </div>
          )}

          <h2 className="text-2xl font-bold mb-1">Elegí tu plan</h2>
          <p className="text-primary-mid text-sm">
            Comprá el pack de productos digitales y obtené 1 año gratis con tu código.
          </p>

          {/* Profile toggle */}
          <div className="flex mt-5 bg-white/10 rounded-xl p-1 w-fit">
            <button
              onClick={() => setActiveProfile('developer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeProfile === 'developer' ? 'bg-white text-primary-dark' : 'text-white/70 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" /> Developer Web
            </button>
            <button
              onClick={() => setActiveProfile('community_manager')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeProfile === 'community_manager' ? 'bg-white text-violet-700' : 'text-white/70 hover:text-white'
              }`}
            >
              <Megaphone className="w-4 h-4" /> Community Manager
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-xl border-2 p-5 flex flex-col ${
                  plan.popular
                    ? activeProfile === 'community_manager'
                      ? 'border-violet-400 shadow-lg shadow-violet-100'
                      : 'border-primary shadow-lg shadow-primary/10'
                    : 'border-gray-100'
                }`}
              >
                {plan.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${plan.badgeColor}`}>
                    {plan.badge}
                  </span>
                )}

                <div className="mb-4">
                  <p className="font-bold text-dark text-base">{plan.name}</p>
                  <div className="flex items-baseline gap-1 my-1">
                    <span className="text-3xl font-black text-dark">{plan.price}</span>
                    <span className="text-sm text-gray-400">{plan.period}</span>
                  </div>
                  <p className="text-xs text-gray-400">{plan.description}</p>
                </div>

                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        f.highlight
                          ? activeProfile === 'community_manager' ? 'text-violet-500' : 'text-primary'
                          : 'text-gray-300'
                      }`} />
                      <span className={`text-xs ${f.highlight ? 'text-dark font-semibold' : 'text-gray-500'}`}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`btn flex items-center gap-1.5 text-sm font-semibold ${plan.ctaStyle}`}
                  disabled
                >
                  {plan.id === 'free' ? (
                    plan.cta
                  ) : (
                    <>
                      {plan.cta} <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Coupon section */}
          <div className="border-t border-gray-100 pt-5">
            <button
              onClick={() => setShowCoupon(v => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
            >
              <Tag className="w-4 h-4" />
              {showCoupon ? 'Ocultar código' : '¿Tenés un código de descuento de tu pack?'}
            </button>

            {showCoupon && (
              <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
                {couponSuccess ? (
                  <div className="bg-success-light border border-success/30 rounded-xl p-4 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-success shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-success">¡Código aplicado!</p>
                      <p className="text-xs text-success/80 mt-0.5">{couponSuccess}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Ej: DEVPACK2025"
                        className="input flex-1 font-mono uppercase"
                        onKeyDown={e => e.key === 'Enter' && handleRedeem()}
                      />
                      <button
                        onClick={handleRedeem}
                        disabled={!couponCode.trim() || couponLoading}
                        className="btn-primary flex items-center gap-2 shrink-0"
                      >
                        {couponLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Aplicar'
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-danger flex items-center gap-1">
                        <X className="w-3 h-3" /> {couponError}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Al comprar el pack de productos digitales recibís un código que activa{' '}
                      <strong>1 año de plan Pro gratis</strong>.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-5 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Building2 className="w-3.5 h-3.5" /> Sin tarjeta requerida en Free
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Check className="w-3.5 h-3.5" /> Cancelás cuando quieras
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Sparkles className="w-3.5 h-3.5" /> Pack de productos = 1 año gratis
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
