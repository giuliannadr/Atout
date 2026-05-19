import React, { useEffect, useState, useRef, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Briefcase, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { fetchPublicProject } from '../api/clientView';
import ProjectHero from '../components/project/ProjectHero';
import ProjectProgressBar from '../components/project/ProgressBar';
import ProjectTimeline from '../components/project/Timeline';
import ProjectDeliverables from '../components/project/Deliverables';
import ProjectRevisions from '../components/project/Revisions';
import ProjectDocuments from '../components/project/Documents';
import NoticePin from '../components/project/NoticePin';
import { ProjectInfoWidget, DevContactWidget } from '../components/project/SidebarWidgets';
import { useNotificationStore } from '../store/notificationStore';
import type { Project } from '../types';

const NOOP = () => {};

const ClientView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();

  const [project, setProject]         = useState<Project | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [notFound, setNotFound]       = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetchPublicProject(id)
      .then((data) => {
        if (data) setProject(data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!printRef.current || !project) return;
    setIsDownloading(true);
    addNotification('Generando reporte PDF...', 'info');

    try {
      await new Promise(r => setTimeout(r, 500));

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1280,
        onclone: (doc) => {
          const style = doc.createElement('style');
          style.innerHTML = `
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; animation: none !important; }
            body { width: 1280px !important; background: #f3f4f6 !important; }
            main { background: #ffffff !important; padding: 60px !important; width: 1280px !important; margin: 0 !important; }
            .flex-col.lg\\:flex-row { display: flex !important; flex-direction: row !important; gap: 32px !important; }
            .lg\\:w-2\\/3 { width: 800px !important; flex-shrink: 0 !important; }
            .lg\\:w-1\\/3 { width: 400px !important; flex-shrink: 0 !important; }
          `;
          doc.head.appendChild(style);
          doc.querySelectorAll('*').forEach(el => {
            const s = window.getComputedStyle(el);
            const bad = (v: string) => v.includes('okl') || v.includes('lab');
            const h = el as HTMLElement;
            if (bad(s.backgroundColor)) h.style.backgroundColor = 'transparent';
            if (bad(s.color))           h.style.color = '#111827';
          });
        },
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let position = 0;
      let remaining = imgHeight;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      remaining -= 297;

      while (remaining > 0) {
        position -= 297;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        remaining -= 297;
      }

      pdf.save(`${(project.name || 'Proyecto').replace(/[^a-z0-9]/gi, '_')}_Reporte.pdf`);
      addNotification('¡Reporte generado con éxito!');
    } catch {
      addNotification('Error al generar el PDF. Intentá de nuevo.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="bg-primary p-2 rounded-xl">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-dark text-lg">FDOS</span>
          </div>
          <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Cargando portal del proyecto...</p>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (notFound || !project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-danger-light rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-danger" />
          </div>
          <h2 className="text-xl font-bold text-dark">Proyecto no encontrado</h2>
          <p className="text-sm text-gray-400">
            El link puede haber expirado o el proyecto fue eliminado.
          </p>
          <button onClick={() => navigate('/')} className="btn-secondary text-sm">
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  /* ── Main view ── */
  return (
    <div className="min-h-screen bg-white">
      {/* Topbar */}
      <header className="h-16 bg-white border-b border-gray-100 sticky top-0 z-40 px-6 flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          {window.history.length > 1 && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-gray-400 hover:text-dark transition-colors rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1 rounded-lg">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-dark text-sm">Portal del Proyecto</span>
          </div>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="btn-primary py-1.5 px-3 text-xs flex items-center gap-2"
        >
          {isDownloading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Download className="w-4 h-4" />}
          {isDownloading ? 'Generando...' : 'Descargar PDF'}
        </button>
      </header>

      <main ref={printRef} className="p-6 md:p-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 lg:w-2/3">
            <NoticePin notice={project.notice} isEditMode={false} onChange={NOOP} />
            <ProjectHero project={project} isEditMode={false} onUpdate={NOOP} />
            <ProjectProgressBar progress={project.progress} currentStage={project.currentStage} isEditMode={false} onUpdate={NOOP} />
            <ProjectTimeline phases={project.phases} isEditMode={false} onUpdate={NOOP} />
            <ProjectDeliverables deliverables={project.deliverables} isEditMode={false} onUpdate={NOOP} />
            <ProjectRevisions revisions={project.revisions} isEditMode={false} onUpdate={NOOP} />
            <ProjectDocuments documents={project.documents} isEditMode={false} onUpdate={NOOP} />
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            <ProjectInfoWidget project={project} isEditMode={false} onUpdate={NOOP} />

            {/* Payment status (read-only) */}
            {(project.adelantoStatus === 'received' || project.saldoStatus === 'received') && (
              <div className="card p-5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Estado de cuenta
                </h4>
                <div className="space-y-2">
                  {project.adelantoStatus === 'received' && (
                    <div className="flex items-center justify-between p-3 bg-success-light border border-success-mid rounded-xl text-success">
                      <span className="text-xs font-bold">Adelanto recibido</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                  {project.saldoStatus === 'received' && (
                    <div className="flex items-center justify-between p-3 bg-success-light border border-success-mid rounded-xl text-success">
                      <span className="text-xs font-bold">Saldo final pagado</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <DevContactWidget project={project} isEditMode={false} onUpdate={NOOP} />

            <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                Este portal es privado para el cliente y el developer.<br />
                © {new Date().getFullYear()} — Generado con FDOS
              </p>
            </div>
          </div>
        </div>
      </main>

      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </div>
  );
};

export default memo(ClientView);
