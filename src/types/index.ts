export type Plan = 'free' | 'pro' | 'agency';
export type ProfileType = 'developer' | 'community_manager';

export const FREE_PROJECT_LIMIT = 5;
export const FREE_CM_ACCOUNT_LIMIT = 3;

// ─── TESTING MODE: todas las funciones desbloqueadas ────────────────────────
// Cambiar a false cuando se quiera activar los límites reales de planes.
export const UNLOCK_ALL = true;

export function isPlanActive(plan: Plan, planExpiresAt?: string): boolean {
  if (UNLOCK_ALL) return true;
  if (plan === 'free') return false;
  if (!planExpiresAt) return true;
  return new Date(planExpiresAt) > new Date();
}

export function effectivePlan(plan: Plan, planExpiresAt?: string): Plan {
  if (UNLOCK_ALL) return 'agency';
  return isPlanActive(plan, planExpiresAt) ? plan : 'free';
}

export function canAddProjectForPlan(
  projectCount: number,
  plan: Plan,
  profile: ProfileType,
  planExpiresAt?: string
): boolean {
  if (UNLOCK_ALL) return true;
  if (effectivePlan(plan, planExpiresAt) !== 'free') return true;
  const limit = profile === 'community_manager' ? FREE_CM_ACCOUNT_LIMIT : FREE_PROJECT_LIMIT;
  return projectCount < limit;
}

export interface CMMetrics {
  id: string;
  month: string; // "2025-01"
  platform: string;
  followers: number;
  followersGrowth: number;
  reach: number;
  impressions: number;
  engagementRate: number;
}

export type PostPriority = 'urgent' | 'high' | 'normal' | 'low';
export type ApprovalStatus = 'none' | 'pending_approval' | 'approved' | 'rejected';

export interface ContentPost {
  id: string;
  date: string;
  time?: string; // "14:00"
  platform: string; // primary platform (backward compat)
  platforms?: string[]; // multi-platform
  caption: string;
  status: 'draft' | 'scheduled' | 'published';
  type: 'reel' | 'post' | 'story' | 'carousel' | 'otro';
  priority?: PostPriority;
  approvalStatus?: ApprovalStatus;
  contentNote?: string; // description of visual asset
  link?: string; // Canva / Drive link
  hashtagGroupIds?: string[];
  inlineHashtags?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly';
  performanceReach?: number;
  performanceLikes?: number;
  performanceComments?: number;
  performanceNotes?: string;
  contentPillar?: string;
}

export interface CMCampaign {
  id: string;
  name: string;
  platform: string; // 'Meta' | 'Google' | 'TikTok' | 'LinkedIn' | 'Pinterest' | 'Otro'
  objective: string;
  budget: number;
  currency: 'USD' | 'ARS' | 'MXN' | 'CLP';
  startDate: string;
  endDate: string;
  reviewDate?: string;
  status: 'draft' | 'active' | 'paused' | 'finished';
  notes: string;
  reach?: number;
  clicks?: number;
  conversions?: number;
  spend?: number;
}

export interface CMEvent {
  id: string;
  title: string;
  date: string;
  type: 'meeting' | 'recording' | 'review' | 'delivery' | 'other';
  description: string;
  isDone: boolean;
}

export interface CMHashtagGroup {
  id: string;
  name: string;
  description: string;
  hashtags: string[]; // without #
  platform?: string;
}

export interface CMBrandConfig {
  brandVoice: string;
  contentPillars: string[];
  postingGoals: Record<string, number>; // platform → posts per week
  bioLink?: string;
  brandNotes: string;
}

export interface CMMetaConnection {
  /** Instagram Business Account ID (numeric string) */
  instagramAccountId?: string;
  /** Facebook Page ID linked to the IG account */
  pageId?: string;
  /** User Access Token (stored locally in Supabase, never shared externally) */
  accessToken?: string;
  /** ISO string of the last successful sync */
  lastSyncedAt?: string;
  /** Instagram username for display */
  username?: string;
}

export interface CMMonthlyFee {
  id: string;
  month: string; // "2025-01"
  amount: number;
  currency: 'USD' | 'ARS' | 'MXN' | 'CLP';
  status: 'pending' | 'invoiced' | 'paid';
  invoiceDate?: string;
  paymentDate?: string;
  notes: string;
}

export interface Project {
  id: string;                    // uuid
  name: string;                  // Nombre del proyecto
  client: string;                // Nombre del cliente
  description: string;           // Descripción breve
  stack: string;                 // Ej: "Next.js · Supabase · Vercel"
  hosting: string;               // Ej: "Vercel"
  domain: string;                // Ej: "tucliente.com"
  startDate: string;             // ISO date string
  deliveryDate: string;          // ISO date string
  status: 'active' | 'review' | 'paused' | 'delivered';
  progress: number;              // 0-100
  currentStage: string;          // Ej: "Semana 3 · Desarrollo"
  notice: string;                // Aviso pinneado para el cliente
  
  // Financiero
  currency: 'USD' | 'ARS' | 'MXN' | 'CLP';
  totalAmount: number;
  adelantoStatus: 'pending' | 'received';
  saldoStatus: 'pending' | 'received';
  
  // Timeline: fases del proyecto
  phases: Phase[];
  
  // Entregables
  deliverables: Deliverable[];
  
  // Revisiones
  revisions: Revision[];
  
  // Documentos
  documents: Document[];
  
  // Accesos
  accesses: Access[];
  
  // Log de actualizaciones
  updates: Update[];
  
  // Info del developer (se puede configurar globalmente)
  devName: string;
  devEmail: string;
  devWhatsApp: string;
  devPortfolio: string;
  
  createdAt: string;
  updatedAt: string;
  themeColor?: string;
  cmMetrics?: CMMetrics[];
  contentPosts?: ContentPost[];
  cmCampaigns?: CMCampaign[];
  cmEvents?: CMEvent[];
  cmHashtagGroups?: CMHashtagGroup[];
  cmBrandConfig?: CMBrandConfig;
  cmMonthlyFees?: CMMonthlyFee[];
  cmMetaConnection?: CMMetaConnection;
  assignedMembers?: string[];
  tasks?: Task[];
  changeRequests?: ChangeRequest[];
}

export interface Phase {
  id: string;
  name: string;
  description: string;
  status: 'done' | 'active' | 'pending';
  startDate: string;
  endDate: string;
}

export interface Deliverable {
  id: string;
  name: string;
  note: string;
  responsible: 'dev' | 'client';
  status: 'done' | 'in-progress' | 'pending' | 'waiting-client';
  dueDate: string;
}

export interface Revision {
  id: string;
  round: number;
  title: string;
  comment: string;
  status: 'pending' | 'incorporated';
  date: string;
}

export interface Document {
  id: string;
  type: 'figma' | 'staging' | 'pdf' | 'doc' | 'link' | 'repo';
  name: string;
  meta: string;
  url: string;
}

export interface Access {
  id: string;
  platform: string;
  detail: string;
  note: string;
}

export interface Update {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  date: string;
  author: string;
}

// ─── WORK SCHEDULE ──────────────────────────────────────
/** Range-based schedule: auto-generates AvailabilitySlots for N weeks ahead */
export interface WorkSchedule {
  days: number[];        // 0=Sun 1=Mon … 6=Sat
  startTime: string;     // "09:00"
  endTime: string;       // "18:00"
  meetingDuration: number; // minutes: 30 | 60 | 90
  bufferBetween: number;   // minutes between slots: 0 | 15 | 30
  weeksAhead: number;      // how many weeks to generate: 2 | 4 | 8
}

export const DEFAULT_WORK_SCHEDULE: WorkSchedule = {
  days: [1, 2, 3, 4, 5], // Mon–Fri
  startTime: '09:00',
  endTime: '18:00',
  meetingDuration: 60,
  bufferBetween: 0,
  weeksAhead: 4,
};

export interface DevConfig {
  name: string;
  email: string;
  whatsApp: string;
  portfolio: string;
  city: string;
  defaultCurrency: 'USD' | 'ARS' | 'MXN' | 'CLP';
  plan: Plan;
  profile: ProfileType;
  planExpiresAt?: string;
  couponRedeemed?: string;
  hasCompletedOnboarding?: boolean;
  teamMembers?: TeamMember[];
  availabilitySlots?: AvailabilitySlot[];
  meetings?: MeetingRequest[];
  bookingSlug?: string; // e.g. "giuliana" → /book/giuliana
  workSchedule?: WorkSchedule;
  teamResources?: TeamResource[];
  pinnedNotes?: PinnedNote[];
  meetingNotes?: MeetingNote[];
}

// ─── TEAM ───────────────────────────────────────────────
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string; // "Diseñador", "Developer", "CM", "SEO", etc.
  color: string; // hex color for avatar background
}

// ─── TASKS ──────────────────────────────────────────────
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: PostPriority; // reuse existing type
  assignedTo?: string[]; // TeamMember IDs or 'owner'
  dueDate?: string;
  createdAt: string;
  tags?: string[];
  subtasks?: Subtask[];
  isInternal?: boolean; // true = hidden from client view
}

// ─── TEAM HUB ───────────────────────────────────────────
export type ResourceIcon =
  | 'figma' | 'drive' | 'notion' | 'github' | 'whatsapp'
  | 'slack' | 'linear' | 'trello' | 'canva' | 'link';

export interface TeamResource {
  id: string;
  label: string;
  url: string;
  icon: ResourceIcon;
}

export interface PinnedNote {
  id: string;
  content: string;
  author: string;
  color: 'yellow' | 'blue' | 'green' | 'pink';
  createdAt: string;
}

// ─── CHANGE REQUESTS ────────────────────────────────────
export type ChangeRequestStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';
export type ChangeRequestPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  priority: ChangeRequestPriority;
  estimatedHours?: number;
  extraCost?: number;
  status: ChangeRequestStatus;
  statusNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

// ─── MEETING NOTES ──────────────────────────────────────
export interface MeetingNote {
  id: string;
  meetingId: string;
  decisions: string;
  actionItems: string;
  createdAt: string;
}

// ─── AVAILABILITY & BOOKING ─────────────────────────────
export interface AvailabilitySlot {
  id: string;
  memberId: string; // 'owner' or TeamMember.id
  date: string;      // "2025-01-15"
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  isBooked?: boolean;
  meetingId?: string;
}

export interface MeetingRequest {
  id: string;
  memberIds: string[]; // 'owner' or TeamMember ids
  slotDate: string;
  startTime: string;
  endTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  brief?: string; // mini brief for no-project bookings
  projectId?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  notes?: string; // internal notes
}
