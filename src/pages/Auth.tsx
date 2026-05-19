import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import AtoutLogo, { AtoutMark } from '../components/brand/AtoutLogo';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

type Mode = 'login' | 'register' | 'forgot';

const FEATURES = [
  'Gestión completa de proyectos freelance',
  'Vista profesional para compartir con tu cliente',
  'Timeline, entregables y control de revisiones',
  'Dashboard financiero con ingresos en tiempo real',
  'Exportación a PDF con un click',
  'Acceso desde cualquier dispositivo',
];

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        setSuccess('Te enviamos un email para restablecer tu contraseña.');
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        setSuccess('¡Cuenta creada! Revisá tu email para confirmar el registro.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      const msg = err?.message ?? 'Error inesperado. Intentá de nuevo.';
      if (msg.includes('Invalid login credentials')) setError('Email o contraseña incorrectos.');
      else if (msg.includes('Email not confirmed')) setError('Confirmá tu email antes de iniciar sesión.');
      else if (msg.includes('Password should be at least 6')) setError('La contraseña debe tener al menos 6 caracteres.');
      else if (msg.includes('User already registered')) setError('Ya existe una cuenta con ese email. Iniciá sesión.');
      else setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) {
      setError('Error al conectar con Google. Intentá de nuevo.');
      setGoogleLoading(false);
    }
  };

  const titles: Record<Mode, { title: string; sub: string; btn: string }> = {
    login: { title: 'Bienvenido de vuelta', sub: 'Ingresá a tu cuenta para continuar.', btn: 'Iniciar sesión' },
    register: { title: 'Creá tu cuenta gratis', sub: 'Empezá a gestionar tus proyectos hoy mismo.', btn: 'Crear cuenta' },
    forgot: { title: 'Recuperar contraseña', sub: 'Te enviaremos un link a tu email.', btn: 'Enviar link' },
  };

  const { title, sub, btn } = titles[mode];

  return (
    <div className="min-h-screen flex">
      {/* ─── Left panel (branding) ─── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: '#F8F6FF' }}>

        {/* Blob background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ position: 'absolute', left: '-15%', top: '-20%', width: '65%', height: '65%', background: '#C4B5FD', opacity: 0.4, borderRadius: '50%', filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', right: '-10%', top: '5%', width: '50%', height: '55%', background: '#67E8F9', opacity: 0.3, borderRadius: '50%', filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', left: '15%', bottom: '-20%', width: '60%', height: '60%', background: '#FED7AA', opacity: 0.38, borderRadius: '50%', filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', right: '5%', bottom: '10%', width: '40%', height: '45%', background: '#FCA5A5', opacity: 0.28, borderRadius: '50%', filter: 'blur(80px)' }} />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <AtoutLogo size="md" />
        </div>

        {/* Headline + features */}
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-gray-900 leading-tight mb-3">
            Tu estudio freelance,<br />
            <span style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>organizado.</span>
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs">
            La herramienta que todo freelance necesita para gestionar proyectos, cobros y equipo como un profesional.
          </p>

          <div className="space-y-2.5">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-gray-700 font-medium">{f}</span>
              </div>
            ))}
          </div>

          {/* Social proof pill */}
          <div className="mt-8 inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-white/80 rounded-full px-4 py-2 shadow-sm">
            <div className="flex -space-x-1.5">
              {['#C4B5FD','#67E8F9','#FCA5A5','#FED7AA'].map((c, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white" style={{ background: c }} />
              ))}
            </div>
            <span className="text-xs font-bold text-gray-700">+500 freelancers</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-400 text-xs relative z-10">
          © {new Date().getFullYear()} Atout · Todos los derechos reservados.
        </p>
      </div>

      {/* ─── Right panel (form) ─── */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white relative overflow-hidden">
        {/* Subtle bg blob */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ position: 'absolute', right: '-20%', bottom: '-10%', width: '55%', height: '55%', background: '#EEE9FF', opacity: 0.6, borderRadius: '50%', filter: 'blur(80px)' }} />
        </div>
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden relative z-10">
          <AtoutLogo size="sm" />
        </div>

        <div className="w-full max-w-sm relative z-10">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-1">{title}</h2>
            <p className="text-gray-400 text-sm">{sub}</p>
          </div>

          {/* Google button (not in forgot mode) */}
          {mode !== 'forgot' && (
            <>
              <button
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-std py-2.5 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-60 mb-4"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Continuar con Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">o con email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="hola@tudominio.com"
                  className="input pl-9"
                  autoComplete="email"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Contraseña {mode === 'register' && <span className="text-gray-400 normal-case font-normal">(mín. 6 caracteres)</span>}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="············"
                    className="input pl-9 pr-10"
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {error && (
              <div className="bg-danger-light border border-danger-mid text-danger text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-success-light border border-success-mid text-success text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {btn}
            </button>
          </form>

          {/* Switch mode */}
          <div className="mt-6 text-center text-sm text-gray-400">
            {mode === 'login' ? (
              <>
                ¿No tenés cuenta?{' '}
                <button
                  onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                  className="text-primary font-semibold hover:underline"
                >
                  Registrate gratis
                </button>
              </>
            ) : (
              <>
                ¿Ya tenés cuenta?{' '}
                <button
                  onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                  className="text-primary font-semibold hover:underline"
                >
                  Iniciá sesión
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
