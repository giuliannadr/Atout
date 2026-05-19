import React, { useState } from 'react';
import {
  Briefcase, User, Mail, Phone, Globe, MapPin,
  ChevronRight, Check, Sparkles, Code2, Megaphone,
} from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import type { ProfileType } from '../../types';

interface OnboardingModalProps {
  onComplete?: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const { updateSettings } = useSettingsStore();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ProfileType>('developer');
  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsApp: '',
    portfolio: '',
    city: '',
    defaultCurrency: 'USD' as 'USD' | 'ARS' | 'MXN' | 'CLP',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFinish = () => {
    updateSettings({ ...form, profile, plan: 'free', hasCompletedOnboarding: true });
    onComplete?.();
  };

  const totalSteps = 4; // 0..3

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-primary-dark text-white px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/10 p-2 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-primary-mid text-[10px] font-bold uppercase tracking-widest">Atout</p>
              <h2 className="text-lg font-bold">¡Bienvenido!</h2>
            </div>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 flex-1 ${
                  i <= step ? 'bg-white' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="p-8">
          {/* Step 0: Profile type selection */}
          {step === 0 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-xl font-bold text-dark mb-1">¿Cuál es tu perfil?</h3>
                <p className="text-sm text-gray-400">Esto personaliza tu dashboard y herramientas.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setProfile('developer')}
                  className={`group relative p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                    profile === 'developer'
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                      : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  {profile === 'developer' && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
                    profile === 'developer' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Code2 className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-dark text-sm">Developer Web</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Gestión de proyectos, clientes, entregables y facturación freelance.
                  </p>
                </button>

                <button
                  onClick={() => setProfile('community_manager')}
                  className={`group relative p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                    profile === 'community_manager'
                      ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-500/10'
                      : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  {profile === 'community_manager' && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
                    profile === 'community_manager' ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-dark text-sm">Community Manager</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Gestión de cuentas, calendario de contenido y métricas por marca.
                  </p>
                </button>
              </div>

              {profile === 'community_manager' && (
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-violet-700 leading-relaxed">
                    Dashboard especializado con calendario de contenido, métricas por plataforma y reportes mensuales para tus marcas.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Personal info */}
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-xl font-bold text-dark mb-1">Configurá tu perfil</h3>
                <p className="text-sm text-gray-400">Estos datos aparecerán en todos tus proyectos y en la vista del cliente.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Nombre completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ej: María González"
                  className="input"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="hola@tudominio.com"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> WhatsApp
                  </label>
                  <input
                    type="text"
                    name="whatsApp"
                    value={form.whatsApp}
                    onChange={handleChange}
                    placeholder="5491112345678"
                    className="input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Online presence */}
          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-xl font-bold text-dark mb-1">Presencia online</h3>
                <p className="text-sm text-gray-400">Tu portfolio y ubicación para darle contexto a tus clientes.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Portfolio / Sitio web
                </label>
                <input
                  type="text"
                  name="portfolio"
                  value={form.portfolio}
                  onChange={handleChange}
                  placeholder="tuportfolio.dev"
                  className="input"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Ciudad / País
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Buenos Aires, Argentina"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                  Moneda por defecto
                </label>
                <select
                  name="defaultCurrency"
                  value={form.defaultCurrency}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="USD">USD — Dólares</option>
                  <option value="ARS">ARS — Pesos Argentinos</option>
                  <option value="MXN">MXN — Pesos Mexicanos</option>
                  <option value="CLP">CLP — Pesos Chilenos</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div className="text-center space-y-4 animate-in zoom-in-90 duration-300">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                profile === 'community_manager' ? 'bg-violet-100' : 'bg-success-light'
              }`}>
                <Sparkles className={`w-8 h-8 ${profile === 'community_manager' ? 'text-violet-500' : 'text-success'}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark mb-2">¡Todo listo, {form.name.split(' ')[0] || 'crack'}!</h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  Tu perfil está configurado como{' '}
                  <strong>{profile === 'community_manager' ? 'Community Manager' : 'Developer Web'}</strong>.
                  Podés editar esto desde <strong>Configuración</strong>.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Resumen</p>
                {form.name && <p className="text-sm text-dark font-medium">{form.name}</p>}
                {form.email && <p className="text-xs text-gray-500">{form.email}</p>}
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    profile === 'community_manager'
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {profile === 'community_manager' ? 'Community Manager' : 'Developer Web'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Plan Free</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex justify-between items-center">
          {step > 0 && step < 3 ? (
            <button onClick={() => setStep(s => s - 1)} className="btn-secondary text-sm">
              Atrás
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && !form.name.trim()}
              className="btn-primary flex items-center gap-2"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleFinish} className="btn-primary flex items-center gap-2">
              <Check className="w-4 h-4" /> Empezar a usar Atout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
