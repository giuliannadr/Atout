import React, { useState } from 'react';
import { Plus, Settings, LogOut, User, ChevronDown, Zap, Calendar } from 'lucide-react';
import AtoutLogo from '../brand/AtoutLogo';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useProjectStore } from '../../store/projectStore';
import { effectivePlan } from '../../types';
import UpgradeModal from './UpgradeModal';

interface TopbarProps {
  onNewProject: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onNewProject }) => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { settings, clearSettings } = useSettingsStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const activePlan = effectivePlan(settings.plan ?? 'free', settings.planExpiresAt);

  const initials = settings.name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  // Use avatar from Google OAuth if available
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const displayName = settings.name !== 'Tu Nombre' ? settings.name : (user?.user_metadata?.full_name ?? user?.email ?? '');

  const { clearProjects } = useProjectStore();

  const handleLogout = async () => {
    setMenuOpen(false);
    // Clear state immediately so UI updates at once
    setUser(null);
    clearProjects();
    clearSettings();
    navigate('/auth', { replace: true });
    // signOut in background (clears local Supabase session/cookie)
    supabase.auth.signOut().catch(console.error);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Logo */}
      <AtoutLogo size="sm" />

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {activePlan === 'free' && (
          <button
            onClick={() => setUpgradeOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" /> Mejorar plan
          </button>
        )}
        {activePlan !== 'free' && (
          <span className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
            activePlan === 'agency'
              ? 'bg-amber-50 border border-amber-200 text-amber-700'
              : settings.profile === 'community_manager'
                ? 'bg-violet-50 border border-violet-200 text-violet-700'
                : 'bg-primary/10 border border-primary/20 text-primary'
          }`}>
            <Zap className="w-3.5 h-3.5" />
            {activePlan === 'agency' ? 'Agencia' : 'Pro'}
          </span>
        )}

        <button
          onClick={onNewProject}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{settings.profile === 'community_manager' ? 'Nueva cuenta' : 'Nuevo proyecto'}</span>
        </button>

        <Link
          to="/calendar"
          className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-gray-50"
          title="Mi calendario"
        >
          <Calendar className="w-5 h-5" />
        </Link>

        <Link
          to="/settings"
          className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-gray-50"
          title="Configuración"
        >
          <Settings className="w-5 h-5" />
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100" />
            ) : (
              <div className="w-8 h-8 bg-primary-dark rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-gray-100">
                {initials}
              </div>
            )}
            <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs font-bold text-dark truncate">{displayName}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                </div>
                {/* Actions */}
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-400" /> Mi perfil
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); setUpgradeOpen(true); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  {activePlan === 'free' ? 'Mejorar plan' : `Plan ${activePlan === 'agency' ? 'Agencia' : 'Pro'}`}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger-light transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </header>
  );
};

export default Topbar;
