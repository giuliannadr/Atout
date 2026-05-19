import React from 'react';
import { Layers, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import type { Project } from '../../types';

interface StatsBarProps {
  projects: Project[];
}

const currencySymbol: Record<string, string> = {
  USD: 'USD',
  ARS: 'ARS',
  MXN: 'MXN',
  CLP: 'CLP',
};

const StatsBar: React.FC<StatsBarProps> = ({ projects }) => {
  const activeCount = projects.filter(p => p.status === 'active' || p.status === 'review').length;
  const deliveredCount = projects.filter(p => p.status === 'delivered').length;

  // Ingresos cobrados: proyectos donde ambos pagos están recibidos
  const totalCobrado = projects.reduce((sum, p) => {
    let amount = 0;
    if (p.adelantoStatus === 'received') amount += p.totalAmount / 2;
    if (p.saldoStatus === 'received') amount += p.totalAmount / 2;
    return sum + amount;
  }, 0);

  // Ingresos pendientes: suma de pagos no recibidos
  const totalPendiente = projects.reduce((sum, p) => {
    let amount = 0;
    if (p.adelantoStatus === 'pending') amount += p.totalAmount / 2;
    if (p.saldoStatus === 'pending') amount += p.totalAmount / 2;
    return sum + amount;
  }, 0);

  // Moneda predominante para mostrar
  const dominantCurrency = projects.length > 0 ? projects[0].currency : 'USD';
  const symbol = currencySymbol[dominantCurrency] ?? 'USD';

  const stats = [
    {
      label: 'Total proyectos',
      value: projects.length.toString(),
      icon: Layers,
      color: 'text-primary',
      bg: 'bg-primary-light',
      sub: `${deliveredCount} entregados`,
    },
    {
      label: 'En progreso',
      value: activeCount.toString(),
      icon: Activity,
      color: 'text-accent',
      bg: 'bg-accent-light',
      sub: `${projects.filter(p => p.status === 'review').length} en revisión`,
    },
    {
      label: 'Cobrado',
      value: `${symbol} ${Math.round(totalCobrado).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-success',
      bg: 'bg-success-light',
      sub: 'ingresos recibidos',
    },
    {
      label: 'Por cobrar',
      value: `${symbol} ${Math.round(totalPendiente).toLocaleString()}`,
      icon: AlertCircle,
      color: 'text-warning',
      bg: 'bg-warning-light',
      sub: 'pagos pendientes',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className="card p-5 flex items-center gap-4">
          <div className={`${stat.bg} p-3 rounded-xl shrink-0`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-xl font-bold text-dark truncate">{stat.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
