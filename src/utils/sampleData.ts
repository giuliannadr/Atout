import type { Project } from '../types';
import { formatISO, addDays, subDays } from 'date-fns';

export const sampleProject: Project = {
  id: 'sample-project-1',
  name: 'Sitio web institucional · Ferretería López',
  client: 'Jorge López',
  description: 'Desarrollo de landing page, catálogo de productos y panel de administración básico para gestión de stock.',
  stack: 'Next.js · Supabase · Tailwind CSS',
  hosting: 'Vercel',
  domain: 'ferreterialopez.com.ar',
  startDate: formatISO(subDays(new Date(), 20)),
  deliveryDate: formatISO(addDays(new Date(), 15)),
  status: 'active',
  progress: 65,
  currentStage: 'Semana 3 · Desarrollo de Frontend',
  notice: '💡 Jorge, recordá enviarme las fotos de alta calidad del local para la sección "Quiénes Somos".',
  
  currency: 'USD',
  totalAmount: 1200,
  adelantoStatus: 'received',
  saldoStatus: 'pending',
  
  phases: [
    {
      id: 'p1',
      name: 'Briefing y UX/UI',
      description: 'Definición de requerimientos y diseño de wireframes.',
      status: 'done',
      startDate: formatISO(subDays(new Date(), 20)),
      endDate: formatISO(subDays(new Date(), 15)),
    },
    {
      id: 'p2',
      name: 'Desarrollo Frontend',
      description: 'Maquetado de las vistas principales y responsive.',
      status: 'active',
      startDate: formatISO(subDays(new Date(), 14)),
      endDate: formatISO(addDays(new Date(), 5)),
    },
    {
      id: 'p3',
      name: 'Integración Backend',
      description: 'Conexión con Supabase y autenticación.',
      status: 'pending',
      startDate: formatISO(addDays(new Date(), 6)),
      endDate: formatISO(addDays(new Date(), 15)),
    }
  ],
  
  deliverables: [
    {
      id: 'd1',
      name: 'Logo vectorizado',
      note: 'Jorge ya lo envió por mail.',
      responsible: 'client',
      status: 'done',
      dueDate: formatISO(subDays(new Date(), 18)),
    },
    {
      id: 'd2',
      name: 'Home y Catálogo',
      note: 'Listo para revisión.',
      responsible: 'dev',
      status: 'done',
      dueDate: formatISO(subDays(new Date(), 5)),
    },
    {
      id: 'd3',
      name: 'Fotos del local',
      note: 'Pendiente para la sección historia.',
      responsible: 'client',
      status: 'waiting-client',
      dueDate: formatISO(addDays(new Date(), 2)),
    }
  ],
  
  revisions: [
    {
      id: 'r1',
      round: 1,
      title: 'Feedback Diseño Home',
      comment: 'El color naranja es un poco fuerte, ¿podemos probar algo más apagado?',
      status: 'incorporated',
      date: formatISO(subDays(new Date(), 10)),
    }
  ],
  
  documents: [
    {
      id: 'doc1',
      type: 'figma',
      name: 'Prototipo UI',
      meta: 'v2.0 final',
      url: 'https://figma.com/file/example',
    },
    {
      id: 'doc2',
      type: 'repo',
      name: 'Repositorio GitHub',
      meta: 'Privado',
      url: 'https://github.com/example/ferreteria',
    }
  ],
  
  accesses: [
    {
      id: 'acc1',
      platform: 'Supabase',
      detail: 'Admin Dashboard',
      note: 'Credenciales en Bitwarden.',
    }
  ],
  
  updates: [
    {
      id: 'u1',
      message: 'Comenzamos con la integración de la pasarela de pagos.',
      type: 'info',
      date: formatISO(subDays(new Date(), 1)),
      author: 'Dev',
    },
    {
      id: 'u2',
      message: '¡Adelanto recibido! Proyecto iniciado oficialmente.',
      type: 'success',
      date: formatISO(subDays(new Date(), 19)),
      author: 'Dev',
    }
  ],
  
  devName: 'Tu Nombre',
  devEmail: 'hola@tuweb.com',
  devWhatsApp: '5491112345678',
  devPortfolio: 'tuportfolio.dev',
  
  createdAt: formatISO(subDays(new Date(), 20)),
  updatedAt: formatISO(new Date()),
};
