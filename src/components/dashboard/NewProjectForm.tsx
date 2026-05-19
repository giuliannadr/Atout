import React, { useState, memo } from 'react';
import { format, addDays } from 'date-fns';
import { Layers, ShoppingCart, Smartphone, RefreshCw, FileText, ArrowRight, Check } from 'lucide-react';
import type { Project, Phase, Deliverable } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';

interface NewProjectFormProps {
  onSubmit: (project: Project) => void;
  onCancel: () => void;
}

interface Template {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  stack: string;
  durationDays: number;
  phases: Omit<Phase, 'id' | 'startDate' | 'endDate'>[];
  deliverables: Omit<Deliverable, 'id' | 'dueDate'>[];
}

const TEMPLATES: Template[] = [
  {
    id: 'landing',
    label: 'Landing Page',
    description: 'Página de presentación con formulario de contacto',
    icon: <Layers className="w-5 h-5" />,
    color: '#1D4ED8',
    stack: 'HTML · CSS · JS / Next.js',
    durationDays: 14,
    phases: [
      { name: 'Brief & Wireframe', description: 'Reunión inicial, definición de objetivos y estructura', status: 'active' },
      { name: 'Diseño Visual', description: 'Mockups en Figma con identidad del cliente', status: 'pending' },
      { name: 'Desarrollo', description: 'Maquetado y programación', status: 'pending' },
      { name: 'Revisión & Entrega', description: 'Ajustes finales y deploy', status: 'pending' },
    ],
    deliverables: [
      { name: 'Brief firmado', note: '', responsible: 'client', status: 'pending' },
      { name: 'Contenido y assets (logos, fotos)', note: 'Texto, imágenes, videos', responsible: 'client', status: 'pending' },
      { name: 'Wireframe aprobado', note: '', responsible: 'dev', status: 'pending' },
      { name: 'Diseño Figma aprobado', note: '', responsible: 'dev', status: 'pending' },
      { name: 'Landing publicada', note: 'Con formulario y analytics', responsible: 'dev', status: 'pending' },
    ],
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    description: 'Tienda online con catálogo y pagos integrados',
    icon: <ShoppingCart className="w-5 h-5" />,
    color: '#059669',
    stack: 'Next.js · Stripe · Supabase / WooCommerce',
    durationDays: 45,
    phases: [
      { name: 'Planificación & Brief', description: 'Catálogo de productos, pasarela de pago, flujo de compra', status: 'active' },
      { name: 'Diseño UX/UI', description: 'Mockups de tienda, carrito y checkout', status: 'pending' },
      { name: 'Desarrollo Frontend', description: 'Catálogo, producto individual, carrito', status: 'pending' },
      { name: 'Integración de Pagos', description: 'Stripe / MercadoPago / PayPal', status: 'pending' },
      { name: 'Testing & QA', description: 'Pruebas de compra real y carga', status: 'pending' },
      { name: 'Deploy & Capacitación', description: 'Publicación y manual de uso del panel admin', status: 'pending' },
    ],
    deliverables: [
      { name: 'Listado de productos con precios', note: 'Excel o Notion', responsible: 'client', status: 'pending' },
      { name: 'Acceso a pasarela de pago', note: 'Stripe / MercadoPago', responsible: 'client', status: 'pending' },
      { name: 'Diseño aprobado', note: '', responsible: 'dev', status: 'pending' },
      { name: 'Tienda en staging', note: 'Para pruebas internas', responsible: 'dev', status: 'pending' },
      { name: 'Test de compra exitoso', note: '', responsible: 'dev', status: 'pending' },
      { name: 'Deploy producción', note: '', responsible: 'dev', status: 'pending' },
    ],
  },
  {
    id: 'saas',
    label: 'App / SaaS',
    description: 'Aplicación web con autenticación y base de datos',
    icon: <Smartphone className="w-5 h-5" />,
    color: '#7C3AED',
    stack: 'React · Node.js · Supabase / PostgreSQL',
    durationDays: 60,
    phases: [
      { name: 'Descubrimiento & Scope', description: 'User stories, prioridades MVP', status: 'active' },
      { name: 'Arquitectura & Setup', description: 'DB, auth, estructura de proyecto', status: 'pending' },
      { name: 'Desarrollo MVP', description: 'Features core del producto', status: 'pending' },
      { name: 'Testing & QA', description: 'Pruebas funcionales y de regresión', status: 'pending' },
      { name: 'Beta & Feedback', description: 'Usuarios piloto y ajustes', status: 'pending' },
      { name: 'Launch', description: 'Deploy de producción y monitoreo', status: 'pending' },
    ],
    deliverables: [
      { name: 'Documento de requerimientos', note: 'User stories del MVP', responsible: 'client', status: 'pending' },
      { name: 'Wireframes aprobados', note: '', responsible: 'dev', status: 'pending' },
      { name: 'Base de datos diseñada', note: 'Esquema final', responsible: 'dev', status: 'pending' },
      { name: 'MVP funcional en staging', note: '', responsible: 'dev', status: 'pending' },
      { name: 'Informe de testing', note: '', responsible: 'dev', status: 'pending' },
      { name: 'App en producción', note: '', responsible: 'dev', status: 'pending' },
    ],
  },
  {
    id: 'redesign',
    label: 'Rediseño Web',
    description: 'Renovación visual y técnica de sitio existente',
    icon: <RefreshCw className="w-5 h-5" />,
    color: '#EA580C',
    stack: 'Next.js · Tailwind CSS · CMS',
    durationDays: 30,
    phases: [
      { name: 'Auditoría & Análisis', description: 'UX actual, performance, SEO, problemas reportados', status: 'active' },
      { name: 'Propuesta de diseño', description: 'Nueva identidad visual y arquitectura de información', status: 'pending' },
      { name: 'Desarrollo', description: 'Migración y reconstrucción del sitio', status: 'pending' },
      { name: 'Migración de contenido', description: 'Transfer de datos, URLs y redirecciones 301', status: 'pending' },
      { name: 'QA & Deploy', description: 'Pruebas cross-browser y publicación', status: 'pending' },
    ],
    deliverables: [
      { name: 'Acceso al sitio actual', note: 'CMS, hosting, dominio', responsible: 'client', status: 'pending' },
      { name: 'Informe de auditoría', note: '', responsible: 'dev', status: 'pending' },
      { name: 'Propuesta de diseño aprobada', note: '', responsible: 'dev', status: 'pending' },
      { name: 'Redirecciones SEO aplicadas', note: '', responsible: 'dev', status: 'pending' },
      { name: 'Sitio rediseñado en producción', note: '', responsible: 'dev', status: 'pending' },
    ],
  },
  {
    id: 'blank',
    label: 'En blanco',
    description: 'Empezar desde cero sin plantilla',
    icon: <FileText className="w-5 h-5" />,
    color: '#6B7280',
    stack: '',
    durationDays: 30,
    phases: [],
    deliverables: [],
  },
];

const NewProjectForm: React.FC<NewProjectFormProps> = ({ onSubmit, onCancel }) => {
  const { settings } = useSettingsStore();
  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    deliveryDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    totalAmount: '' as string | number,
    currency: settings.defaultCurrency,
    stack: '',
    hosting: '',
    domain: '',
    themeColor: '#1e3a8a',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSelectTemplate = (tpl: Template) => {
    setSelectedTemplate(tpl);
    setFormData(prev => ({
      ...prev,
      stack: tpl.stack,
      deliveryDate: format(addDays(new Date(), tpl.durationDays), 'yyyy-MM-dd'),
      themeColor: tpl.color,
    }));
    setStep(1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'El nombre es obligatorio';
    if (!formData.client.trim()) errs.client = 'El cliente es obligatorio';
    if (formData.deliveryDate < formData.startDate)
      errs.deliveryDate = 'La entrega no puede ser antes del inicio';
    if (formData.totalAmount !== '' && Number(formData.totalAmount) < 0)
      errs.totalAmount = 'El monto no puede ser negativo';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate1()) setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const today = new Date();
    const buildPhase = (p: Omit<Phase, 'id' | 'startDate' | 'endDate'>, i: number): Phase => ({
      id: crypto.randomUUID(),
      ...p,
      startDate: addDays(today, i * 7).toISOString(),
      endDate: addDays(today, (i + 1) * 7 - 1).toISOString(),
    });

    const buildDeliverable = (d: Omit<Deliverable, 'id' | 'dueDate'>): Deliverable => ({
      id: crypto.randomUUID(),
      ...d,
      dueDate: formData.deliveryDate,
    });

    const tplPhases = selectedTemplate?.phases.map(buildPhase) ?? [];
    const tplDeliverables = selectedTemplate?.deliverables.map(buildDeliverable) ?? [];

    const newProject: Project = {
      id: crypto.randomUUID(),
      name: formData.name,
      client: formData.client,
      description: formData.description,
      startDate: new Date(formData.startDate).toISOString(),
      deliveryDate: new Date(formData.deliveryDate).toISOString(),
      status: 'active',
      progress: 0,
      currentStage: tplPhases.length > 0 ? tplPhases[0].name : 'Planificación',
      notice: '',
      currency: formData.currency as Project['currency'],
      totalAmount: Number(formData.totalAmount) || 0,
      adelantoStatus: 'pending',
      saldoStatus: 'pending',
      phases: tplPhases,
      deliverables: tplDeliverables,
      revisions: [],
      documents: [],
      accesses: [],
      updates: [
        {
          id: crypto.randomUUID(),
          message: `Proyecto creado${selectedTemplate && selectedTemplate.id !== 'blank' ? ` desde plantilla "${selectedTemplate.label}"` : ''}.`,
          type: 'info',
          date: new Date().toISOString(),
          author: settings.name,
        },
      ],
      stack: formData.stack,
      hosting: formData.hosting,
      domain: formData.domain,
      themeColor: formData.themeColor,
      devName: settings.name,
      devEmail: settings.email,
      devWhatsApp: settings.whatsApp,
      devPortfolio: settings.portfolio,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(newProject);
  };

  const totalSteps = 3;
  const progressSteps = [0, 1, 2];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {progressSteps.map((s) => (
          <React.Fragment key={s}>
            <div className={`flex-1 h-1 rounded-full transition-colors duration-300 ${step > s ? 'bg-primary' : step === s ? 'bg-primary/40' : 'bg-gray-100'}`} />
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Template selection */}
      {step === 0 && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <h3 className="font-bold text-gray-500 uppercase text-xs tracking-widest">Elegí una plantilla</h3>
          <div className="grid grid-cols-1 gap-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary-light transition-all text-left group"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-white transition-transform group-hover:scale-105"
                  style={{ backgroundColor: tpl.color }}
                >
                  {tpl.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark">{tpl.label}</p>
                  <p className="text-xs text-gray-400 truncate">{tpl.description}</p>
                </div>
                {tpl.id !== 'blank' && (
                  <span className="text-[10px] font-medium text-gray-400 flex-shrink-0">
                    ~{tpl.durationDays}d
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Essentials */}
      {step === 1 && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          {selectedTemplate && selectedTemplate.id !== 'blank' && (
            <div
              className="flex items-center gap-2 p-2.5 rounded-lg text-white text-xs font-medium"
              style={{ backgroundColor: selectedTemplate.color }}
            >
              {selectedTemplate.icon}
              Plantilla: {selectedTemplate.label}
              <Check className="w-3.5 h-3.5 ml-auto" />
            </div>
          )}
          <h3 className="font-bold text-gray-500 uppercase text-xs tracking-widest">Paso 1 — Lo esencial</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del proyecto *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="Ej: E-commerce Gourmet"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <input
              type="text"
              name="client"
              value={formData.client}
              onChange={handleChange}
              className={`input ${errors.client ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="Ej: Resto del Mundo"
            />
            {errors.client && <p className="text-xs text-red-500 mt-1">{errors.client}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input h-20"
              placeholder="Una breve descripción del objetivo..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha entrega</label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleChange}
                className={`input ${errors.deliveryDate ? 'border-red-400' : ''}`}
              />
              {errors.deliveryDate && <p className="text-xs text-red-500 mt-1">{errors.deliveryDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto total</label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                onFocus={(e) => e.target.select()}
                min="0"
                className={`input ${errors.totalAmount ? 'border-red-400' : ''}`}
                placeholder="Ej: 1500"
              />
              {errors.totalAmount && <p className="text-xs text-red-500 mt-1">{errors.totalAmount}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
              <select name="currency" value={formData.currency} onChange={handleChange} className="input">
                <option value="USD">USD - Dólares</option>
                <option value="ARS">ARS - Pesos Arg</option>
                <option value="MXN">MXN - Pesos Mex</option>
                <option value="CLP">CLP - Pesos Chi</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Tech stack */}
      {step === 2 && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <h3 className="font-bold text-gray-500 uppercase text-xs tracking-widest">Paso 2 — El stack</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stack tecnológico</label>
            <input
              type="text"
              name="stack"
              value={formData.stack}
              onChange={handleChange}
              className="input"
              placeholder="Ej: React · Node.js · PostgreSQL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hosting</label>
            <input
              type="text"
              name="hosting"
              value={formData.hosting}
              onChange={handleChange}
              className="input"
              placeholder="Ej: Vercel / Netlify / AWS"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dominio</label>
            <input
              type="text"
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              className="input"
              placeholder="Ej: midominio.com"
            />
          </div>
          <div className="bg-primary-light p-4 rounded-xl">
            <p className="text-xs text-primary font-medium mb-1">Tus datos (del perfil):</p>
            <p className="text-sm font-bold text-dark">{settings.name}</p>
            <p className="text-xs text-gray-500">{settings.email} · {settings.whatsApp}</p>
          </div>
          {selectedTemplate && selectedTemplate.id !== 'blank' && (
            <div className="bg-gray-50 rounded-xl p-3 border border-dashed border-gray-200 space-y-1">
              <p className="text-xs font-semibold text-gray-500">Se crearán automáticamente:</p>
              <p className="text-xs text-gray-400">
                {selectedTemplate.phases.length} fases · {selectedTemplate.deliverables.length} entregables
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex justify-between pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => {
            if (step === 0) onCancel();
            else setStep(step - 1);
          }}
          className="btn-secondary"
        >
          {step === 0 ? 'Cancelar' : 'Anterior'}
        </button>

        {step === 0 ? null : step === 1 ? (
          <button type="button" onClick={handleNext} className="btn-primary">
            Siguiente
          </button>
        ) : (
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Check className="w-4 h-4" />
            Crear proyecto
          </button>
        )}
      </div>

      {/* Total steps counter */}
      <p className="text-center text-[10px] text-gray-300">
        {step === 0 ? 'Plantilla' : `Paso ${step} de ${totalSteps - 1}`}
      </p>
    </form>
  );
};

export default memo(NewProjectForm);
