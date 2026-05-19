import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Info, DollarSign, Key, History, User,
  Plus, MessageCircle, Globe, Server, Code2,
  Trash2, AlertTriangle, CheckCircle2, Clock, Mail
} from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import type { Project, Update, Access } from '../../types';

interface WidgetProps {
  project: Project;
  isEditMode: boolean;
  onUpdate: (fields: Partial<Project>) => void;
}

// Widget 1: Info
export const ProjectInfoWidget: React.FC<WidgetProps> = ({ project, isEditMode, onUpdate }) => {
  return (
    <div className="card p-5 mb-6">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="bg-primary-light p-1 rounded-lg">
          <Info className="w-3.5 h-3.5 text-primary" />
        </span>
        Info del proyecto
      </h4>
      <div className="space-y-4">
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 flex items-center gap-1.5">
            <Code2 className="w-3 h-3" /> Stack
          </p>
          {isEditMode ? (
            <input
              value={project.stack}
              onChange={(e) => onUpdate({ stack: e.target.value })}
              className="input py-1 text-sm font-bold"
            />
          ) : (
            <p className="text-sm font-bold text-dark">{project.stack || '—'}</p>
          )}
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 flex items-center gap-1.5">
            <Server className="w-3 h-3" /> Hosting
          </p>
          {isEditMode ? (
            <input
              value={project.hosting}
              onChange={(e) => onUpdate({ hosting: e.target.value })}
              className="input py-1 text-sm font-bold"
            />
          ) : (
            <p className="text-sm font-bold text-dark">{project.hosting || '—'}</p>
          )}
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 flex items-center gap-1.5">
            <Globe className="w-3 h-3" /> Dominio
          </p>
          {isEditMode ? (
            <input
              value={project.domain}
              onChange={(e) => onUpdate({ domain: e.target.value })}
              className="input py-1 text-sm font-bold text-primary italic underline underline-offset-4"
            />
          ) : (
            <p className="text-sm font-bold text-primary italic underline underline-offset-4">{project.domain || '—'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Widget 2: Pagos
export const PaymentWidget: React.FC<WidgetProps> = ({ project, isEditMode, onUpdate }) => {
  const toggleAdelanto = () => {
    if (!isEditMode) return;
    onUpdate({ adelantoStatus: project.adelantoStatus === 'received' ? 'pending' : 'received' });
  };
  const toggleSaldo = () => {
    if (!isEditMode) return;
    onUpdate({ saldoStatus: project.saldoStatus === 'received' ? 'pending' : 'received' });
  };

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <span className="bg-primary-light p-1 rounded-lg">
            <DollarSign className="w-3.5 h-3.5 text-primary" />
          </span>
          Estado de pagos
        </h4>
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <select
                value={project.currency}
                onChange={(e) => onUpdate({ currency: e.target.value as Project['currency'] })}
                className="bg-transparent text-sm font-bold text-dark border-none focus:ring-0 cursor-pointer p-0"
              >
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
                <option value="MXN">MXN</option>
                <option value="CLP">CLP</option>
              </select>
              <input
                type="number"
                value={project.totalAmount || ''}
                onChange={(e) => onUpdate({ totalAmount: Number(e.target.value) })}
                onFocus={(e) => e.target.select()}
                className="w-20 text-right text-sm font-bold text-dark bg-transparent border-b border-primary-light focus:border-primary outline-none"
                placeholder="0"
              />
            </>
          ) : (
            <span className="text-sm font-bold text-dark">{project.currency} {project.totalAmount.toLocaleString()}</span>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <button
          onClick={toggleAdelanto}
          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
            project.adelantoStatus === 'received'
              ? 'bg-success-light border-success-mid text-success'
              : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
          } ${isEditMode ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Adelanto (50%)</span>
            <span className="text-sm font-bold">{project.currency} {(project.totalAmount / 2).toLocaleString()}</span>
          </div>
          {project.adelantoStatus === 'received' ? <CheckCircle2 className="w-5 h-5 shadow-sm" /> : <Clock className="w-5 h-5 opacity-40" />}
        </button>
        <button
          onClick={toggleSaldo}
          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
            project.saldoStatus === 'received'
              ? 'bg-success-light border-success-mid text-success'
              : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
          } ${isEditMode ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Saldo (50%)</span>
            <span className="text-sm font-bold">{project.currency} {(project.totalAmount / 2).toLocaleString()}</span>
          </div>
          {project.saldoStatus === 'received' ? <CheckCircle2 className="w-5 h-5 shadow-sm" /> : <Clock className="w-5 h-5 opacity-40" />}
        </button>
      </div>
    </div>
  );
};

// Widget 3: Accesos
export const AccessesWidget: React.FC<WidgetProps> = ({ project, isEditMode, onUpdate }) => {
  const handleAdd = () => {
    const newItem: Access = { id: crypto.randomUUID(), platform: 'Plataforma', detail: 'User: admin', note: '' };
    onUpdate({ accesses: [...project.accesses, newItem] });
  };

  const handleUpdate = (id: string, fields: Partial<Access>) => {
    onUpdate({ accesses: project.accesses.map(a => a.id === id ? { ...a, ...fields } : a) });
  };

  const handleDelete = (id: string) => {
    onUpdate({ accesses: project.accesses.filter(a => a.id !== id) });
  };

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <span className="bg-primary-light p-1 rounded-lg">
            <Key className="w-3.5 h-3.5 text-primary" />
          </span>
          Accesos
        </h4>
        {isEditMode && (
          <button onClick={handleAdd} className="bg-primary-light text-primary p-1 rounded-lg hover:bg-primary-mid transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="space-y-3 mb-4">
        {project.accesses.map((acc) => (
          <div key={acc.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 relative group">
            {isEditMode ? (
              <div className="space-y-1 pr-8">
                <input
                  value={acc.platform}
                  onChange={(e) => handleUpdate(acc.id, { platform: e.target.value })}
                  className="font-bold text-dark bg-transparent border-b border-gray-200 outline-none text-xs w-full focus:border-primary"
                />
                <input
                  value={acc.detail}
                  onChange={(e) => handleUpdate(acc.id, { detail: e.target.value })}
                  className="text-[10px] text-gray-500 bg-transparent outline-none w-full"
                  placeholder="Detalles de acceso..."
                />
                <button
                  onClick={() => handleDelete(acc.id)}
                  className="absolute right-3 top-3 text-gray-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs font-bold text-dark">{acc.platform}</p>
                <p className="text-[10px] text-gray-500 font-mono tracking-tight">{acc.detail}</p>
              </>
            )}
          </div>
        ))}
        {project.accesses.length === 0 && !isEditMode && (
          <p className="text-xs text-gray-400 italic py-2">Sin accesos registrados.</p>
        )}
      </div>
      <div className="bg-orange-50 p-3 rounded-xl flex gap-3 border border-orange-100 shadow-sm shadow-orange-900/5">
        <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <p className="text-[10px] text-accent font-semibold leading-relaxed">
          Las credenciales sensibles se entregan por Bitwarden Send — nunca acá.
        </p>
      </div>
    </div>
  );
};

// Widget 4: Update Log
export const UpdateLogWidget: React.FC<WidgetProps> = ({ project, isEditMode, onUpdate }) => {
  const { settings } = useSettingsStore();
  const [newMessage, setNewMessage] = React.useState('');
  const [newType, setNewType] = React.useState<Update['type']>('info');

  const handleAdd = () => {
    if (!newMessage.trim()) return;
    const item: Update = {
      id: crypto.randomUUID(),
      message: newMessage,
      type: newType,
      date: new Date().toISOString(),
      author: settings.name,
    };
    onUpdate({ updates: [item, ...project.updates] });
    setNewMessage('');
  };

  const handleDelete = (id: string) => {
    onUpdate({ updates: project.updates.filter(u => u.id !== id) });
  };

  return (
    <div className="card p-5 mb-6">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="bg-primary-light p-1 rounded-lg">
          <History className="w-3.5 h-3.5 text-primary" />
        </span>
        Log de actualizaciones
      </h4>

      {isEditMode && (
        <div className="space-y-2 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="¿Qué novedades hay?"
            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-3 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none h-20 resize-none shadow-sm transition-all"
          />
          <div className="flex items-center justify-between gap-2">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as Update['type'])}
              className="text-[10px] font-bold uppercase rounded-lg border-gray-200 py-1.5 pl-3 pr-8 focus:ring-4 focus:ring-primary/5 transition-all"
            >
              <option value="info">Info (Azul)</option>
              <option value="warning">Aviso (Naranja)</option>
              <option value="success">Éxito (Verde)</option>
            </select>
            <button
              onClick={handleAdd}
              disabled={!newMessage.trim()}
              className="btn-primary p-1.5 rounded-lg w-10 h-10 flex items-center justify-center shrink-0"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6 relative ml-2">
        {project.updates.length > 0 && (
          <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-gray-100 rounded-full" />
        )}
        {project.updates.map((update) => (
          <div key={update.id} className="relative pl-6">
            <div className={`absolute left-[-3.5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white ${
              update.type === 'success' ? 'bg-success' : update.type === 'warning' ? 'bg-accent' : 'bg-primary'
            }`} />
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {format(new Date(update.date), "d MMM, HH:mm", { locale: es })}
                </span>
                {isEditMode && (
                  <button onClick={() => handleDelete(update.id)} className="text-gray-200 hover:text-danger transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-xs text-dark font-medium leading-relaxed">{update.message}</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase">por {update.author}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Widget 5: Dev Contact
export const DevContactWidget: React.FC<WidgetProps> = () => {
  const { settings } = useSettingsStore();
  const initials = settings.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="card p-5">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
        <span className="bg-primary-light p-1 rounded-lg">
          <User className="w-3.5 h-3.5 text-primary" />
        </span>
        Tu developer
      </h4>
      <div className="flex items-center gap-3 mb-6 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
        <div className="w-12 h-12 bg-primary-dark text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0 shadow-md shadow-primary/20 ring-4 ring-white">
          {initials}
        </div>
        <div>
          <p className="text-sm font-bold text-dark leading-none mb-1">{settings.name}</p>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Developer Freelance</p>
        </div>
      </div>
      <div className="space-y-3">
        <a
          href={`https://wa.me/${settings.whatsApp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-accent w-full py-3 shadow-md"
        >
          <MessageCircle className="w-4 h-4 mr-2" /> Escribir por WhatsApp
        </a>
        <a
          href={`mailto:${settings.email}`}
          className="btn-secondary w-full py-3"
        >
          <Mail className="w-4 h-4 mr-2" /> Enviar email
        </a>
      </div>
    </div>
  );
};
