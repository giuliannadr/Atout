import React from 'react';
import { format, differenceInWeeks, differenceInDays } from 'date-fns';
import type { Project } from '../../types';

interface ProjectHeroProps {
  project: Project;
  isEditMode: boolean;
  onUpdate: (fields: Partial<Project>) => void;
}

const THEME_COLORS = [
  { name: 'Navy',   value: '#1e3a8a' },
  { name: 'Indigo', value: '#4338ca' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Teal',   value: '#0f766e' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Rose',   value: '#be123c' },
];

const ProjectHero: React.FC<ProjectHeroProps> = ({ project, isEditMode, onUpdate }) => {
  const startDate    = new Date(project.startDate);
  const deliveryDate = new Date(project.deliveryDate);
  const today        = new Date();

  const weekNumber   = Math.max(1, differenceInWeeks(today, startDate) + 1);
  const daysLeft     = differenceInDays(deliveryDate, today);
  const clientPending = project.deliverables.filter(
    d => d.responsible === 'client' && d.status !== 'done'
  ).length;

  const stats = [
    { label: 'Semana',            value: `#${weekNumber}` },
    { label: 'Progreso',          value: `${project.progress}%` },
    { label: 'Días restantes',    value: daysLeft > 0 ? `${daysLeft}` : '—' },
    { label: 'Pend. cliente',     value: `${clientPending}` },
  ];

  const bgColor = project.themeColor ?? '#1e3a8a';

  return (
    <div
      className="rounded-std p-8 md:p-10 mb-8 text-white transition-colors duration-500 shadow-xl"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="max-w-2xl flex-1">
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-3">
            Proyecto ·{' '}
            {isEditMode ? (
              <input
                value={project.client}
                onChange={e => onUpdate({ client: e.target.value })}
                className="bg-transparent border-b border-white/30 focus:border-white outline-none px-1"
              />
            ) : project.client}
            {' '}· Inicio: {format(startDate, "d/MM/yy")}
          </p>

          {isEditMode ? (
            <input
              value={project.name}
              onChange={e => onUpdate({ name: e.target.value })}
              className="text-3xl md:text-4xl font-bold bg-transparent border-b border-white/30 focus:border-white outline-none w-full mb-4"
            />
          ) : (
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{project.name}</h2>
          )}

          {isEditMode ? (
            <textarea
              value={project.description}
              onChange={e => onUpdate({ description: e.target.value })}
              className="text-white/80 bg-white/10 border border-white/20 rounded-lg p-3 focus:border-white outline-none w-full text-sm h-24 backdrop-blur-sm"
              placeholder="Describí el proyecto..."
            />
          ) : (
            <p className="text-white/80 text-sm md:text-base leading-relaxed mb-8 max-w-xl">
              {project.description}
            </p>
          )}
        </div>

        {/* Theme color picker */}
        {isEditMode && (
          <div className="bg-black/20 p-3 rounded-2xl backdrop-blur-md border border-white/10 shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60">Color de tema</p>
            <div className="flex gap-2">
              {THEME_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => onUpdate({ themeColor: c.value })}
                  title={c.name}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                    (project.themeColor ?? '#1e3a8a') === c.value
                      ? 'border-white scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
        {stats.map(stat => (
          <div
            key={stat.label}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10"
          >
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">
              {stat.label}
            </p>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectHero;
