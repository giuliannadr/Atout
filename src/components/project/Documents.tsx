import React from 'react';
import { Plus, Trash2, FileText, Link as LinkIcon, ExternalLink, Monitor, Code2, BookOpen } from 'lucide-react';
import type { Document } from '../../types';

interface ProjectDocumentsProps {
  documents: Document[];
  isEditMode: boolean;
  onUpdate: (documents: Document[]) => void;
}

const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({ documents, isEditMode, onUpdate }) => {
  const handleAdd = () => {
    const newItem: Document = {
      id: crypto.randomUUID(),
      type: 'link',
      name: 'Nuevo recurso',
      meta: 'v1.0',
      url: '',
    };
    onUpdate([...documents, newItem]);
  };

  const handleUpdate = (id: string, fields: Partial<Document>) => {
    onUpdate(documents.map(d => d.id === id ? { ...d, ...fields } : d));
  };

  const handleDelete = (id: string) => {
    onUpdate(documents.filter(d => d.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'figma':   return <span className="text-lg">🎨</span>;
      case 'staging': return <Monitor className="w-5 h-5 text-primary" />;
      case 'repo':    return <Code2 className="w-5 h-5 text-dark" />;
      case 'pdf':     return <FileText className="w-5 h-5 text-danger" />;
      case 'doc':     return <BookOpen className="w-5 h-5 text-warning" />;
      default:        return <LinkIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-dark flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Documentos y Links
        </h3>
        {isEditMode && (
          <button onClick={handleAdd} className="btn-secondary py-1.5 text-xs flex items-center gap-1">
            <Plus className="w-3 h-3" /> Agregar recurso
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="card p-4 flex items-center justify-between group">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-center w-12 h-12 shrink-0">
                {isEditMode ? (
                  <select
                    value={doc.type}
                    onChange={(e) => handleUpdate(doc.id, { type: e.target.value as Document['type'] })}
                    className="bg-transparent border-none p-0 text-[10px] focus:ring-0 w-full"
                  >
                    <option value="link">🔗 Link</option>
                    <option value="figma">🎨 Figma</option>
                    <option value="staging">🚀 Staging</option>
                    <option value="repo">💻 Repo</option>
                    <option value="pdf">📄 PDF</option>
                    <option value="doc">📖 Doc</option>
                  </select>
                ) : getIcon(doc.type)}
              </div>
              <div className="flex-1 min-w-0">
                {isEditMode ? (
                  <div className="space-y-1">
                    <input
                      value={doc.name}
                      onChange={(e) => handleUpdate(doc.id, { name: e.target.value })}
                      className="font-bold text-dark bg-transparent border-b border-gray-200 focus:border-primary outline-none text-sm w-full"
                    />
                    <input
                      value={doc.meta}
                      onChange={(e) => handleUpdate(doc.id, { meta: e.target.value })}
                      className="text-[10px] text-gray-400 bg-transparent outline-none w-full"
                      placeholder="Meta (ej: v1.0)..."
                    />
                    <input
                      value={doc.url}
                      onChange={(e) => handleUpdate(doc.id, { url: e.target.value })}
                      className="text-[10px] text-primary bg-transparent outline-none w-full"
                      placeholder="https://..."
                    />
                  </div>
                ) : (
                  <>
                    <h4 className="font-bold text-dark text-sm truncate">{doc.name}</h4>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{doc.meta}</p>
                  </>
                )}
              </div>
            </div>

            {!isEditMode ? (
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-primary-light rounded-lg shrink-0"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            ) : (
              <button onClick={() => handleDelete(doc.id)} className="p-2 text-gray-300 hover:text-danger shrink-0">
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectDocuments;
