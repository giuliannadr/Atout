import React, { useState, useRef, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Plus, Trash2, Loader2, FileText, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { useProjectStore } from '../store/projectStore';
import { useSettingsStore } from '../store/settingsStore';
import { useNotificationStore } from '../store/notificationStore';
import type { Project } from '../types';

interface LineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

const CURRENCY_SYMBOLS: Record<Project['currency'], string> = {
  USD: '$',
  ARS: '$',
  MXN: '$',
  CLP: '$',
};

const InvoiceGenerator: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { settings } = useSettingsStore();
  const project = useProjectStore(s => s.projects.find(p => p.id === id) ?? null);
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`
  );
  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(
    format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  );
  const [notes, setNotes] = useState('');
  const [paymentInfo, setPaymentInfo] = useState('');
  const [items, setItems] = useState<LineItem[]>(() => {
    if (!project) return [];
    const lines: LineItem[] = [];
    if (project.totalAmount > 0) {
      const adelanto = project.totalAmount * 0.5;
      const saldo = project.totalAmount * 0.5;
      if (project.adelantoStatus === 'pending') {
        lines.push({ id: crypto.randomUUID(), description: 'Adelanto (50%) — ' + project.name, qty: 1, unitPrice: adelanto });
      }
      if (project.saldoStatus === 'pending') {
        lines.push({ id: crypto.randomUUID(), description: 'Saldo final (50%) — ' + project.name, qty: 1, unitPrice: saldo });
      }
      if (lines.length === 0) {
        lines.push({ id: crypto.randomUUID(), description: project.name, qty: 1, unitPrice: project.totalAmount });
      }
    } else {
      lines.push({ id: crypto.randomUUID(), description: project?.name ?? '', qty: 1, unitPrice: 0 });
    }
    return lines;
  });

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Proyecto no encontrado.</p>
      </div>
    );
  }

  const symbol = CURRENCY_SYMBOLS[project.currency];
  const subtotal = items.reduce((acc, i) => acc + i.qty * i.unitPrice, 0);
  const fmt = (n: number) => `${symbol}${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${project.currency}`;

  const addItem = () => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), description: '', qty: 1, unitPrice: 0 }]);
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateItem = (itemId: string, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, [field]: value } : i));
  };

  const handleDownload = async () => {
    if (!printRef.current) return;
    setIsDownloading(true);
    addNotification('Generando factura PDF...', 'info');
    try {
      await new Promise(r => setTimeout(r, 300));
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 900,
        onclone: (doc) => {
          const style = doc.createElement('style');
          style.innerHTML = `* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }`;
          doc.head.appendChild(style);
          doc.querySelectorAll('*').forEach(el => {
            const s = window.getComputedStyle(el);
            const bad = (v: string) => v.includes('okl') || v.includes('lab');
            const h = el as HTMLElement;
            if (bad(s.backgroundColor)) h.style.backgroundColor = 'transparent';
            if (bad(s.color)) h.style.color = '#111827';
          });
        },
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${invoiceNumber}_${project.client.replace(/[^a-z0-9]/gi, '_')}.pdf`);
      addNotification('¡Factura generada!');
    } catch {
      addNotification('Error al generar la factura.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="h-16 bg-white border-b border-gray-100 sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/project/${id}`)}
            className="p-2 -ml-2 text-gray-400 hover:text-dark transition-colors rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-dark text-sm">Generador de Factura</span>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="btn-primary py-1.5 px-3 text-xs flex items-center gap-2"
        >
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isDownloading ? 'Generando...' : 'Descargar PDF'}
        </button>
      </header>

      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: edit controls */}
        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Datos de la factura</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">N° de factura</label>
              <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="input text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de emisión</label>
              <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="input text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vencimiento</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input text-sm" />
            </div>
          </div>

          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Datos de pago</h3>
            <textarea
              value={paymentInfo}
              onChange={e => setPaymentInfo(e.target.value)}
              className="input text-sm h-28"
              placeholder={"Ej:\nBanco: Galicia\nAlias: miempresa\nCBU: 0123456..."}
            />
          </div>

          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notas</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input text-sm h-24"
              placeholder="Condiciones de pago, agradecimiento, etc."
            />
          </div>
        </div>

        {/* Right: invoice preview */}
        <div className="lg:col-span-2">
          <div
            ref={printRef}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            style={{ fontFamily: 'system-ui, sans-serif' }}
          >
            {/* Invoice header */}
            <div className="p-8" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1D4ED8 100%)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight">FACTURA</h1>
                  <p className="text-blue-200 text-sm mt-1 font-mono">{invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-lg">{settings.name || 'FDOS Developer'}</p>
                  <p className="text-blue-200 text-sm">{settings.email}</p>
                  {settings.whatsApp && <p className="text-blue-200 text-sm">{settings.whatsApp}</p>}
                  {settings.portfolio && <p className="text-blue-200 text-sm">{settings.portfolio}</p>}
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Dates + client */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Facturado a</p>
                  <p className="font-bold text-dark text-base">{project.client}</p>
                  <p className="text-sm text-gray-500">{project.name}</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Emisión:</span>
                    <span className="font-medium text-dark">
                      {issueDate ? format(new Date(issueDate + 'T12:00:00'), 'dd/MM/yyyy') : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Vencimiento:</span>
                    <span className="font-medium text-dark">
                      {dueDate ? format(new Date(dueDate + 'T12:00:00'), 'dd/MM/yyyy') : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100">
                  <span className="col-span-6">Descripción</span>
                  <span className="col-span-2 text-center">Cant.</span>
                  <span className="col-span-2 text-right">Precio unit.</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>
                <div className="space-y-2 mt-3">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center group">
                      <div className="col-span-6">
                        <input
                          value={item.description}
                          onChange={e => updateItem(item.id, 'description', e.target.value)}
                          className="w-full text-sm border-0 border-b border-transparent focus:border-primary focus:ring-0 bg-transparent p-0 py-1 text-dark placeholder-gray-300"
                          placeholder="Descripción del servicio"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={e => updateItem(item.id, 'qty', Number(e.target.value))}
                          min="1"
                          className="w-full text-sm border-0 border-b border-transparent focus:border-primary focus:ring-0 bg-transparent p-0 py-1 text-center text-dark"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                          min="0"
                          className="w-full text-sm border-0 border-b border-transparent focus:border-primary focus:ring-0 bg-transparent p-0 py-1 text-right text-dark"
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-1">
                        <span className="text-sm font-semibold text-dark text-right flex-1">
                          {fmt(item.qty * item.unitPrice)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-danger hover:text-red-700 transition-opacity p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="mt-4 flex items-center gap-1.5 text-xs text-primary hover:text-blue-700 font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar ítem
                </button>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm border-t-2 border-dark pt-3">
                    <span className="font-extrabold text-dark text-base">TOTAL</span>
                    <span className="font-extrabold text-dark text-base">{fmt(subtotal)}</span>
                  </div>
                  {/* Payment status badges */}
                  <div className="flex flex-col gap-1 pt-1">
                    {project.adelantoStatus === 'received' && (
                      <div className="flex items-center gap-1.5 text-success text-xs">
                        <Check className="w-3.5 h-3.5" />
                        <span>Adelanto recibido</span>
                      </div>
                    )}
                    {project.saldoStatus === 'received' && (
                      <div className="flex items-center gap-1.5 text-success text-xs">
                        <Check className="w-3.5 h-3.5" />
                        <span>Saldo cobrado</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment info */}
              {paymentInfo && (
                <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Datos de pago</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{paymentInfo}</p>
                </div>
              )}

              {/* Notes */}
              {notes && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Notas</p>
                  <p className="text-sm text-gray-500 whitespace-pre-line">{notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-[10px] text-gray-300">
                  Generado con FDOS · {settings.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(InvoiceGenerator);
