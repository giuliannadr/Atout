import React, { useState } from 'react';
import { ChevronLeft, ExternalLink, MoreVertical, Edit2, Check, Share2, Copy, Trash2, ChevronDown, FileText } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useProjectStore } from '../../store/projectStore';
import { useNotificationStore } from '../../store/notificationStore';
import type { Project } from '../../types';

interface DetailTopbarProps {
  project: Project;
  isEditMode: boolean;
  onToggleEdit: () => void;
  onDelete: () => void;
}

type Status = Project['status'];

const STATUS_OPTIONS: { value: Status; label: string; color: string; dot: string }[] = [
  { value: 'active',    label: 'Activo',       color: 'text-primary', dot: 'bg-primary' },
  { value: 'review',    label: 'En revisión',  color: 'text-warning', dot: 'bg-warning' },
  { value: 'paused',    label: 'Pausado',      color: 'text-gray-500', dot: 'bg-gray-400' },
  { value: 'delivered', label: 'Entregado',    color: 'text-success', dot: 'bg-success' },
];

const statusBadge: Record<Status, string> = {
  active:    'bg-primary-light text-primary border-primary-mid',
  review:    'bg-warning-light text-warning border-warning-mid',
  paused:    'bg-gray-100 text-gray-500 border-gray-200',
  delivered: 'bg-success-light text-success border-success-mid',
};

const DetailTopbar: React.FC<DetailTopbarProps> = ({
  project,
  isEditMode,
  onToggleEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { duplicateProject, updateProject } = useProjectStore();
  const { addNotification } = useNotificationStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const currentStatus = STATUS_OPTIONS.find(s => s.value === project.status)!;

  const handleStatusChange = (newStatus: Status) => {
    if (newStatus === project.status) { setStatusOpen(false); return; }
    updateProject(project.id, { status: newStatus });
    addNotification(`Estado cambiado a "${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}".`);
    setStatusOpen(false);
  };

  const handleCopyLink = () => {
    // En Electron, window.location.origin es app://localhost (no es una URL pública).
    // VITE_APP_URL debe apuntar al deploy de Vercel para que el cliente pueda abrir el link.
    const base = import.meta.env.VITE_APP_URL?.replace(/\/$/, '') || window.location.origin;
    const url = `${base}/project/${project.id}/client-view`;
    navigator.clipboard.writeText(url)
      .then(() => addNotification('Link del cliente copiado al portapapeles.'))
      .catch(() => addNotification('No se pudo copiar el link.', 'error'));
    setMenuOpen(false);
  };

  const handleDuplicate = () => {
    const clone = duplicateProject(project.id);
    if (clone) {
      addNotification(`Proyecto duplicado como "${clone.name}".`);
      navigate(`/project/${clone.id}`);
    }
    setMenuOpen(false);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Left: back + title + status picker */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 text-gray-400 hover:text-dark transition-colors rounded-lg hover:bg-gray-100 shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h1 className="font-bold text-dark text-lg truncate max-w-[130px] md:max-w-xs">
          {project.name}
        </h1>

        {/* Status dropdown */}
        <div className="relative hidden sm:block shrink-0">
          <button
            onClick={() => setStatusOpen(v => !v)}
            className={`badge border flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity ${statusBadge[project.status]}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
            {currentStatus.label}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {statusOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setStatusOpen(false)} />
              <div className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                <p className="px-3 pt-1 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Cambiar estado
                </p>
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors hover:bg-gray-50 ${
                      opt.value === project.status ? 'font-bold' : 'font-medium text-gray-600'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                    <span className={opt.color}>{opt.label}</span>
                    {opt.value === project.status && (
                      <Check className="w-3.5 h-3.5 ml-auto text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Edit toggle */}
        <button
          onClick={onToggleEdit}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
            isEditMode
              ? 'bg-success text-white shadow-sm'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          {isEditMode ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          <span className="hidden md:inline">{isEditMode ? 'Guardar cambios' : 'Modo edición'}</span>
        </button>

        {/* Client view */}
        <Link
          to={`/project/${project.id}/client-view`}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-light text-primary hover:bg-primary-mid rounded-lg font-medium text-sm transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden md:inline">Vista cliente</span>
        </Link>

        {/* More menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-2 text-gray-400 hover:text-dark transition-colors rounded-lg hover:bg-gray-100"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <button
                  onClick={handleCopyLink}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-gray-400" /> Copiar link cliente
                </button>
                <button
                  onClick={handleDuplicate}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-400" /> Duplicar proyecto
                </button>
                <button
                  onClick={() => { navigate(`/project/${project.id}/invoice`); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4 text-gray-400" /> Generar factura
                </button>
                <div className="border-t border-gray-100" />
                <button
                  onClick={() => { onDelete(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger-light flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar proyecto
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default DetailTopbar;
