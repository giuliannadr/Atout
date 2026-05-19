import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Save, User, Globe, Download, Upload, Trash2,
  Mail, Phone, MapPin, DollarSign, Tag, Loader2, Zap, Check, X,
  Code2, Megaphone, Users, CalendarClock, RefreshCw,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSettingsStore } from '../store/settingsStore';
import { useProjectStore } from '../store/projectStore';
import { useNotificationStore } from '../store/notificationStore';
import ConfirmModal from '../components/layout/ConfirmModal';
import UpgradeModal from '../components/layout/UpgradeModal';
import TeamPanel from '../components/team/TeamPanel';
import AvailabilityManager from '../components/availability/AvailabilityManager';
import { effectivePlan } from '../types';

type SettingsTab = 'profile' | 'team' | 'availability' | 'danger';

const TABS: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { key: 'profile',       label: 'Perfil',          icon: <User className="w-4 h-4" /> },
  { key: 'team',          label: 'Equipo',           icon: <Users className="w-4 h-4" /> },
  { key: 'availability',  label: 'Disponibilidad',   icon: <CalendarClock className="w-4 h-4" /> },
  { key: 'danger',        label: 'Datos',            icon: <Trash2 className="w-4 h-4" /> },
];

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const {
    settings, updateSettings, redeemCoupon,
    couponLoading, couponError, couponSuccess,
    addTeamMember, updateTeamMember, removeTeamMember,
    addSlot, removeSlot, updateSlot,
  } = useSettingsStore();
  const { projects, addProject } = useProjectStore();
  const { addNotification } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [formData, setFormData] = useState(settings);
  const [showResetModal, setShowResetModal] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  const activePlan = effectivePlan(settings.plan ?? 'free', settings.planExpiresAt);
  const planLabel = activePlan === 'agency' ? 'Agencia' : activePlan === 'pro' ? 'Pro' : 'Free';
  const profileLabel = settings.profile === 'community_manager' ? 'Community Manager' : 'Developer Web';

  const handleSave = () => {
    updateSettings(formData);
    addNotification('Configuración guardada correctamente.');
    setTimeout(() => navigate('/'), 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = () => {
    const data = { settings, projects };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fdos_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    addNotification('Backup exportado con éxito.');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.settings) updateSettings(data.settings);
        if (data.projects && Array.isArray(data.projects)) {
          data.projects.forEach((p: any) => addProject(p));
        }
        addNotification('Datos importados correctamente.');
      } catch {
        addNotification('Error al importar el archivo JSON.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetConfirm = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const initials = formData.name
    .split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-gray-400 hover:text-dark transition-colors rounded-lg hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-dark text-lg">Configuración</h1>
        </div>
        {activeTab === 'profile' && (
          <div className="flex items-center gap-3">
            <button onClick={() => setFormData(settings)} className="text-sm text-gray-500 hover:text-dark font-medium px-3 py-2 transition-colors">
              Descartar
            </button>
            <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-sm">
              <Save className="w-4 h-4" /> Guardar cambios
            </button>
          </div>
        )}
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 px-6">
        <div className="max-w-4xl mx-auto flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">

        {/* ── Profile tab ── */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-1">
              <h2 className="text-xl font-bold text-dark mb-2">Tu Perfil</h2>
              <p className="text-sm text-gray-500 mb-6">Estos datos se usan por defecto en todos tus proyectos nuevos y se muestran a tus clientes.</p>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-primary-dark rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-xl shadow-primary/20 ring-8 ring-gray-50">
                  {initials}
                </div>
                <h3 className="font-bold text-dark">{formData.name || 'Tu Nombre'}</h3>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">{profileLabel}</p>
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="card p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Nombre completo
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="input text-lg font-semibold py-3" placeholder="Ej: Giuliana Rossi" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> Email corporativo
                    </label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="input font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" /> WhatsApp (con prefijo)
                    </label>
                    <input type="text" name="whatsApp" value={formData.whatsApp} onChange={handleChange} className="input font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" /> Portfolio o Web Personal
                  </label>
                  <input type="text" name="portfolio" value={formData.portfolio} onChange={handleChange} className="input font-medium" placeholder="tudominio.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> Ubicación
                  </label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="input font-medium" placeholder="Ciudad, País" />
                </div>
              </div>

              {/* Preferences */}
              <div className="card p-8 space-y-4">
                <h3 className="font-bold text-dark text-sm uppercase tracking-wide text-gray-500">Preferencias</h3>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5" /> Moneda por defecto
                  </label>
                  <select name="defaultCurrency" value={formData.defaultCurrency} onChange={handleChange} className="input font-bold">
                    <option value="USD">USD - Dólares</option>
                    <option value="ARS">ARS - Pesos Argentinos</option>
                    <option value="MXN">MXN - Pesos Mexicanos</option>
                    <option value="CLP">CLP - Pesos Chilenos</option>
                  </select>
                </div>
              </div>

              {/* Plan + Profile switcher */}
              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings.profile === 'community_manager' ? 'bg-violet-100' : 'bg-primary/10'}`}>
                      {settings.profile === 'community_manager'
                        ? <Megaphone className="w-5 h-5 text-violet-600" />
                        : <Code2 className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Perfil activo</p>
                      <p className="font-bold text-dark">{profileLabel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-medium">Plan activo</p>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full inline-block mt-0.5 ${
                      activePlan === 'agency' ? 'bg-amber-100 text-amber-700'
                      : activePlan === 'pro'
                        ? settings.profile === 'community_manager' ? 'bg-violet-100 text-violet-700' : 'bg-primary/10 text-primary'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {activePlan !== 'free' && <Zap className="w-3 h-3 inline mr-1" />}
                      {planLabel}
                    </span>
                  </div>
                </div>

                {/* Profile switcher */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400 mb-3">Cambiar modo de la app</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'developer', label: 'Developer Web', icon: Code2, color: 'border-primary text-primary bg-primary/5' },
                      { value: 'community_manager', label: 'Community Manager', icon: Megaphone, color: 'border-violet-500 text-violet-600 bg-violet-50' },
                    ].map(opt => {
                      const Icon = opt.icon;
                      const isActive = settings.profile === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            updateSettings({ profile: opt.value as 'developer' | 'community_manager' });
                            addNotification(`Cambiaste a perfil ${opt.label}`);
                            setTimeout(() => navigate('/'), 800);
                          }}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-bold ${
                            isActive
                              ? opt.color
                              : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-500'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs text-center leading-tight">{opt.label}</span>
                          {isActive && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/60">Activo</span>}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Al cambiar, la app se recarga automáticamente con el nuevo modo.
                  </p>
                </div>

                {settings.planExpiresAt && activePlan !== 'free' && (
                  <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                    Válido hasta: <strong className="text-dark">{new Date(settings.planExpiresAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
                    {settings.couponRedeemed && <span className="ml-2 text-gray-300">· Código: {settings.couponRedeemed}</span>}
                  </div>
                )}
                {activePlan === 'free' && (
                  <button onClick={() => setUpgradeOpen(true)} className="w-full btn-primary flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" /> Ver planes y mejorar
                  </button>
                )}
              </div>

              {/* Coupon */}
              <div className="card p-6 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <p className="font-bold text-dark text-sm">Canjear código de descuento</p>
                </div>
                {couponSuccess ? (
                  <div className="bg-success-light border border-success/30 rounded-xl p-4 flex items-center gap-3">
                    <Check className="w-5 h-5 text-success shrink-0" />
                    <p className="text-sm font-semibold text-success">{couponSuccess}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text" value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Ej: DEVPACK2025" className="input flex-1 font-mono uppercase"
                        onKeyDown={e => e.key === 'Enter' && redeemCoupon(couponCode)}
                      />
                      <button onClick={() => redeemCoupon(couponCode)} disabled={!couponCode.trim() || couponLoading} className="btn-primary flex items-center gap-2 shrink-0">
                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-danger flex items-center gap-1"><X className="w-3 h-3" /> {couponError}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Team tab ── */}
        {activeTab === 'team' && (
          <div className="max-w-2xl space-y-4">
            <div>
              <h2 className="text-xl font-bold text-dark">Equipo de trabajo</h2>
              <p className="text-sm text-gray-400 mt-1">
                Agregá los miembros de tu equipo para asignarles tareas y proyectos.
                Vos aparecés como el titular de la cuenta.
              </p>
            </div>
            <TeamPanel
              members={settings.teamMembers ?? []}
              ownerName={settings.name}
              onAdd={addTeamMember}
              onUpdate={updateTeamMember}
              onRemove={removeTeamMember}
            />
          </div>
        )}

        {/* ── Availability tab ── */}
        {activeTab === 'availability' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-dark">Disponibilidad y reservas</h2>
              <p className="text-sm text-gray-400 mt-1">
                Configurá tus horarios libres y compartí un link con tus clientes para que reserven reuniones directamente.
              </p>
            </div>
            <AvailabilityManager
              slots={settings.availabilitySlots ?? []}
              meetings={settings.meetings ?? []}
              bookingSlug={settings.bookingSlug ?? ''}
              teamMembers={settings.teamMembers ?? []}
              ownerName={settings.name}
              onAddSlot={addSlot}
              onRemoveSlot={removeSlot}
              onUpdateSlug={(slug) => updateSettings({ bookingSlug: slug })}
            />
          </div>
        )}

        {/* ── Danger zone tab ── */}
        {activeTab === 'danger' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-dark">Datos y backup</h2>
              <p className="text-sm text-gray-400 mt-1">Exportar, importar o borrar todos tus datos.</p>
            </div>
            <div className="card p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={handleExport} className="btn-secondary flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Exportar Backup (JSON)
                </button>
                <label className="btn-secondary flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" /> Importar Backup
                  <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                </label>
              </div>
              <button
                onClick={() => setShowResetModal(true)}
                className="w-full bg-red-50 text-danger border border-red-100 hover:bg-red-100 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Cerrar sesión y limpiar datos locales
              </button>
            </div>
          </div>
        )}
      </main>

      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <ConfirmModal
        isOpen={showResetModal}
        title="¿Borrar todos los datos?"
        message="Esta acción es irreversible. Perderás todos tus proyectos y configuración guardada localmente."
        confirmText="Sí, borrar todo"
        cancelText="No, cancelar"
        type="danger"
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
};

export default Settings;
