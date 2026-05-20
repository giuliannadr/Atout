import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Calendar } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useSettingsStore } from '../../store/settingsStore';

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: 'U$D', ARS: '$', MXN: '$', CLP: '$',
};

const QuickStatsWidget: React.FC = () => {
  const { projects } = useProjectStore();
  const { settings }  = useSettingsStore();

  const currency = settings.defaultCurrency ?? 'USD';
  const sym      = CURRENCY_SYMBOL[currency];

  // Financial stats
  const now   = new Date();

  let billedThisMonth = 0;
  let pendingAmount   = 0;

  for (const p of projects) {
    const total    = p.totalAmount ?? 0;
    const adelanto = total * 0.5; // assume 50/50 split
    const saldo    = total * 0.5;

    // Billed = received payments
    if (p.adelantoStatus === 'received') billedThisMonth += adelanto;
    if (p.saldoStatus    === 'received') billedThisMonth += saldo;

    // Pending = not yet received
    if (p.adelantoStatus === 'pending') pendingAmount += adelanto;
    if (p.saldoStatus    === 'pending') pendingAmount += saldo;
  }

  // Project health
  const active    = projects.filter(p => p.status === 'active').length;
  const delivered = projects.filter(p => p.status === 'delivered').length;
  const atRisk    = projects.filter(p => {
    if (p.status !== 'active') return false;
    const delivery = new Date(p.deliveryDate);
    const daysLeft = Math.ceil((delivery.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft < 7 || p.progress < 30;
  }).length;

  // Next meeting
  const nextMeeting = (settings.meetings ?? [])
    .filter(m => m.status === 'confirmed' && new Date(`${m.slotDate}T${m.startTime}`) > now)
    .sort((a, b) => a.slotDate.localeCompare(b.slotDate))[0];

  const fmt = (n: number) =>
    n >= 1000 ? `${sym} ${(n / 1000).toFixed(1)}k` : `${sym} ${n.toFixed(0)}`;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">

      {/* Facturado */}
      <StatCard
        icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
        iconBg="bg-emerald-50"
        label="Facturado"
        value={fmt(billedThisMonth)}
        sub="en proyectos"
      />

      {/* Pendiente de cobro */}
      <StatCard
        icon={<DollarSign className="w-4 h-4 text-amber-600" />}
        iconBg="bg-amber-50"
        label="Por cobrar"
        value={fmt(pendingAmount)}
        sub={pendingAmount > 0 ? 'pendiente' : 'al día ✓'}
        highlight={pendingAmount > 0}
      />

      {/* Proyectos activos / en riesgo */}
      <StatCard
        icon={
          atRisk > 0
            ? <AlertTriangle className="w-4 h-4 text-red-500" />
            : <CheckCircle2 className="w-4 h-4 text-primary" />
        }
        iconBg={atRisk > 0 ? 'bg-red-50' : 'bg-primary/10'}
        label="Proyectos"
        value={`${active} activos`}
        sub={atRisk > 0 ? `${atRisk} en riesgo` : `${delivered} entregados`}
        highlight={atRisk > 0}
        highlightColor="text-red-500"
      />

      {/* Próxima reunión */}
      <StatCard
        icon={<Calendar className="w-4 h-4 text-blue-600" />}
        iconBg="bg-blue-50"
        label="Próxima reunión"
        value={
          nextMeeting
            ? new Date(`${nextMeeting.slotDate}T${nextMeeting.startTime}`).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
            : 'Sin reuniones'
        }
        sub={nextMeeting ? nextMeeting.startTime : 'agenda disponible'}
      />
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
  highlightColor?: string;
}> = ({ icon, iconBg, label, value, sub, highlight, highlightColor = 'text-amber-600' }) => (
  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 shadow-sm">
    <div className="flex items-center gap-2.5 mb-2">
      <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-black text-dark leading-tight">{value}</p>
    <p className={`text-[11px] mt-0.5 font-semibold ${highlight ? highlightColor : 'text-gray-400'}`}>
      {sub}
    </p>
  </div>
);

export default QuickStatsWidget;
