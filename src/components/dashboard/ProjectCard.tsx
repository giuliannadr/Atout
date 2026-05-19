import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays } from 'date-fns';
import { Calendar, CheckCircle2, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import type { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
}

const statusColors = {
  active: 'bg-primary-light text-primary border-primary-mid',
  review: 'bg-warning-light text-warning border-warning-mid',
  paused: 'bg-gray-100 text-gray-500 border-gray-200',
  delivered: 'bg-success-light text-success border-success-mid',
};

const statusLabels = {
  active: 'Activo',
  review: 'En revisión',
  paused: 'Pausado',
  delivered: 'Entregado',
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  const daysLeft = differenceInDays(new Date(project.deliveryDate), new Date());
  const isOverdue = daysLeft < 0 && project.status !== 'delivered';
  const isUrgent = daysLeft >= 0 && daysLeft <= 7 && project.status !== 'delivered';

  const daysBadge = () => {
    if (project.status === 'delivered') return null;
    if (isOverdue) return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-danger bg-danger-light px-2 py-0.5 rounded-full border border-danger-mid">
        <AlertTriangle className="w-3 h-3" /> {Math.abs(daysLeft)}d vencido
      </span>
    );
    if (isUrgent) return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-warning bg-warning-light px-2 py-0.5 rounded-full border border-warning-mid">
        <Clock className="w-3 h-3" /> {daysLeft}d restantes
      </span>
    );
    return (
      <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
        {daysLeft}d restantes
      </span>
    );
  };

  return (
    <div
      onClick={() => navigate(`/project/${project.id}`)}
      className="card hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <span className={`badge border ${statusColors[project.status]}`}>
            {statusLabels[project.status]}
          </span>
          {daysBadge()}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-dark group-hover:text-primary transition-colors mb-0.5 truncate">
          {project.name}
        </h3>
        <p className="text-sm text-gray-500 mb-5">{project.client}</p>

        {/* Progress bar */}
        <div className="space-y-2 mb-5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-gray-400 truncate max-w-[70%]">{project.currentStage}</span>
            <span className="text-dark font-bold">{project.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(project.deliveryDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Amount */}
            <div className="flex items-center gap-1 text-gray-500 font-medium">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{project.currency} {project.totalAmount.toLocaleString()}</span>
            </div>
            {/* Payment icons */}
            <div className="flex gap-1">
              <div title={`Adelanto: ${project.adelantoStatus === 'received' ? 'cobrado' : 'pendiente'}`}>
                {project.adelantoStatus === 'received'
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  : <Clock className="w-3.5 h-3.5 text-accent opacity-60" />}
              </div>
              <div title={`Saldo: ${project.saldoStatus === 'received' ? 'cobrado' : 'pendiente'}`}>
                {project.saldoStatus === 'received'
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  : <Clock className="w-3.5 h-3.5 text-gray-300" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ProjectCard);
