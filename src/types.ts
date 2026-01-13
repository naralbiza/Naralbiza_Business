// types.ts

export enum Page {
  Dashboard = 'Dashboard Geral',
  CRM = 'CRM & Vendas',
  Clients = 'Clientes & Relacionamento',
  Production = 'Produção',
  ProjectManagement = 'Gestão de Projectos',
  DAM = 'Activos Criativos (DAM)',
  Inventory = 'Inventário & Equipamentos',
  Financial = 'Financeiro',
  HR = 'RH & Performance',
  Marketing = 'Marketing & Conteúdo',
  Quality = 'Qualidade & Aprovação',
  AfterSales = 'Pós-venda & Retenção',
  BI = 'Relatórios & BI',
  SOPs = 'Processos & SOPs',
  Settings = 'Configurações & Administração',
  // Dashboard areas
  DashboardPhoto = '📸 Fotografia',
  DashboardVideo = '🎥 Vídeo',
  DashboardSocial = '📲 Social Media',
  // Legacy or used elsewhere
  Notifications = 'Notificações',
  Agenda = 'Agenda',
  Goals = 'Metas',
  Admin = 'Administração',
  Pipeline = 'Pipeline',
  Métricas = 'Métricas',
  Reports = 'Relatórios',
}


export enum LeadStatus {
  New = 'Novo',
  Contacted = 'Contato feito',
  Negotiation = 'Em negociação',
  Lost = 'Perdido',
  Won = 'Ganho',
}

export enum LeadPriority {
  Low = 'Baixa',
  Medium = 'Média',
  High = 'Alta',
}

export enum ProjectType {
  Wedding = 'Casamento',
  Corporate = 'Corporativo',
  Portrait = 'Retrato',
  Event = 'Evento',
}

export interface Task {
  id: number;
  text: string;
  title?: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  priority?: string;
  status?: string;
  assignedTo?: string;
  projectId?: string;
}

export interface LeadNote {
  id: number;
  leadId: string;
  date: string;
  text: string;
  authorId: string;
}

export interface FileAttachment {
  id: number;
  name: string;
  size: string; // e.g., "2.5MB"
  type: 'PDF' | 'Image' | 'Document';
  uploadDate: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  position?: string;
  email: string;
  phone: string;
  source: string;
  priority: LeadPriority;
  status: LeadStatus;
  ownerId: string;
  projectType: ProjectType;
  value: number;
  probability?: number; // 0-100
  expectedCloseDate?: string;
  notes: LeadNote[];
  tasks: Task[];
  files: FileAttachment[];
  convertedToClientId?: string;
  internalNotes?: string;
  lastStatusChangeAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ProposalStatus {
  Sent = 'Enviada',
  Accepted = 'Aceita',
  Rejected = 'Rejeitada'
}

export interface ProposalItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Proposal {
  id: string;
  leadId: string;
  title: string;
  totalValue: number;
  discount: number;
  items: ProposalItem[];
  sentAt: string | null;
  status: ProposalStatus;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export enum FollowUpType {
  Email = 'Email',
  Phone = 'Telefone',
  Meeting = 'Reunião',
  WhatsApp = 'WhatsApp'
}

export interface FollowUp {
  id: string;
  leadId: string;
  type: FollowUpType;
  notes: string;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  duration?: number; // Duration in minutes
  outcome?: string; // e.g., 'Positive', 'Negative'
  rating?: number; // 1-5
}

export interface ClientTag {
  id: string;
  text: string;
  color: string; // e.g., 'blue', 'green'
}

export interface Client {
  id: string; // UUID
  name: string;
  company: string;
  email: string;
  phone: string;
  since: string;
  totalRevenue: number;
  interactionHistory: Interaction[];
  status: 'Ativo' | 'Inativo';
  tags: ClientTag[];
  birthday?: string;
  importantDates: ImportantDate[];
  complaints: Complaint[];
  feedbacks: Feedback[];
  upsellOpportunities: UpsellOpportunity[];
  projects: any[]; // Linked production projects
}

export interface Complaint {
  id: string;
  clientId: string;
  date: string;
  description: string;
  status: 'Pendente' | 'Resolvido' | 'Arquivado';
  severity: 'Baixa' | 'Média' | 'Alta';
}

export interface UpsellOpportunity {
  id: string;
  clientId: string;
  date: string;
  description: string;
  value: number;
  status: 'Identificada' | 'Em Negociação' | 'Ganha' | 'Perdida';
}

export interface ImportantDate {
  id: string;
  clientId: string;
  date: string;
  description: string;
  type: 'Birthday' | 'Anniversary' | 'Event' | 'Other';
}

export interface Interaction {
  id: number;
  date: string;
  type: 'Email' | 'Call' | 'Meeting';
  notes: string;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'revenue' | 'expense';
  category: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate?: string;
  issueDate?: string; // Data de emissão
  paymentDate?: string; // Data do pagamento
  projectId?: string;
  paymentMethod?: string;
  notes?: string;
  responsibleId?: string; // Quem lançou ou responsável
  active?: boolean;
}

export type BudgetStatus = 'Rascunho' | 'Enviado' | 'Aprovado' | 'Rejeitado';

export interface BudgetItem {
  id: string; // UUID
  budgetId: string;
  service: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Budget {
  id: string; // UUID
  clientId: string;
  projectId?: string;
  title: string;
  date: string;
  validity?: string;
  status: BudgetStatus;
  items: BudgetItem[];
  totalAmount: number; // Linked to totalValue
  totalValue: number;
  discount: number;
  finalValue: number;
  notes?: string;
  createdAt: string;
}

/**
 * @deprecated Legacy internal budget for category limits.
 * Renaming to avoid conflict with Client Quotes.
 */
export interface InternalBudget {
  id: number;
  category: string;
  limit: number;
  spent: number;
}

export interface FinancialData {
  revenue: number[];
  expenses: number[];
  taxes: number[];
  cashFlowForecast: number[];
  labels: string[];
  transactions: Transaction[];
  budgets: Budget[]; // Now Client Quotes
  internalBudgets: InternalBudget[]; // Legacy category limits
  taxRecords: Tax[];
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'alert' | 'success' | 'info';
  userId?: string;
}

export type Role = 'Admin' | 'CEO / Direção' | 'Fotógrafo' | 'Videógrafo' | 'Social Media' | 'Comercial' | 'Financeiro' | 'RH';

export type Sector = 'Fotografia' | 'Vídeo' | 'Social Media' | 'Comercial' | 'Financeiro' | 'RH' | 'Produção' | 'Administração';

export interface ModulePermission {
  id: string;
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canApprove: boolean;
  roleId?: string;
  userId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
  role: Role;
  sector: Sector;
  avatarUrl: string;
  position?: string;
  notificationPreferences?: {
    emailOnNewLead: boolean;
    emailOnTaskDue: boolean;
  };
  permissions?: ModulePermission[];
  department?: string;
  contractType?: string;
  admissionDate?: string;
  supervisorId?: string;
}

// Keep Employee alias for backward compatibility during migration
export type Employee = User;

export interface Team {
  id: string;
  name: string;
  memberIds: string[];
}


// Base report structure
interface BaseReport {
  id: number;
  employeeId: string;
  date: string;
  notes: string; // General notes applicable to all roles
  status: 'Pendente' | 'Aprovado';
  // Common fields that appeared in mappers for safety across role types
  leadsContacted?: number;
  salesQualifiedLeads?: number;
  salesProposalsSent?: number;
  contractsSigned?: number;
  salesRevenue?: number;
  salesConversionRate?: number;
  nextActions?: string;
  projectsShot?: string;
  hoursOnLocation?: number;
  equipmentUsed?: string;
  nextSteps?: string;
  ticketsResolved?: number;
  systemsMaintenance?: string;
  blockers?: string;
  hrEmployees?: string;
  hrFreelancers?: string;
  hrRoles?: string;
  hrPerformance?: string;
  hrPerformanceScore?: number;
  hrProductivity?: string;
  hrProductivityScore?: number;
  hrAbsences?: string;
  hrTraining?: string;
  hrCulture?: string;
}

export interface SalesReport extends BaseReport {
  role: 'Sales';
  leadsContacted: number;
  contractsSigned: number;
  contractValue?: number; // Optional: keeps legacy support
  salesRevenue?: number;
  salesQualifiedLeads?: number;
  salesProposalsSent?: number;
  salesConversionRate?: number;
  nextActions: string;
}

export interface CreativeReport extends BaseReport {
  role: 'Creative' | 'Photographer' | 'Videomaker';
  projectsShot: string; // e.g., "Casamento Smith & Jones, Retratos Corporativos Acme Inc"
  hoursOnLocation: number;
  equipmentUsed: string;
  nextSteps: string; // e.g., "Iniciar edição do casamento Smith"
}

export interface ITReport extends BaseReport {
  role: 'IT';
  ticketsResolved: number;
  systemsMaintenance: string; // e.g., "Atualização do software da galeria, backups do servidor"
  blockers: string;
}

export interface HRReport extends BaseReport {
  role: 'HR';
  hrEmployees: string;
  hrFreelancers: string;
  hrRoles: string;
  hrPerformance: string;
  hrProductivity: string;
  hrAbsences: string;
  hrTraining: string;
  hrCulture: string;
  hrPerformanceScore?: number;
  hrProductivityScore?: number;
}

export interface OtherReport extends BaseReport {
  role: 'Other';
  // Uses base fields only, or we could map some unused fields if needed.
  // For now, we'll rely on 'notes' for the main content.
}

export type Report = SalesReport | CreativeReport | ITReport | HRReport | OtherReport;


export interface Tax {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Paid';
  notes?: string;
  responsibleId?: string;
}

export interface CalendarEvent {
  id: string; // UUID
  title: string; // titulo
  description?: string; // descricao
  startDate: string; // data_inicio (ISO String)
  endDate?: string; // data_fim (ISO String)
  location?: string; // local
  status: 'agendado' | 'concluido' | 'cancelado';
  type: 'meeting' | 'deadline' | 'task'; // tipo (Manter para UI)
  responsibleId?: string; // responsible_id
  attendeeIds?: string[]; // attendee_ids
  notes?: string; // mapped to description or separate if needed? User asked for description. I'll keep notes as optional for UI compat if needed or alias it.
}

export interface GoalUpdate {
  date: string;
  notes: string;
}

export interface Goal {
  id: number;
  title: string;
  target: number;
  current: number;
  type: 'team' | 'individual';
  employeeId?: string;
  unit: 'currency' | 'count';
  deadline: string;
  updates: GoalUpdate[];
}

export interface Activity {
  id: number;
  actorId: string;
  action: string;
  target: string; // e.g., "Lead 'Global Corp'"
  date: string;
  type: 'lead' | 'financial' | 'task' | 'client';
}

// --- Production & Projects ---

export enum ProductionStatus {
  PreProduction = 'Pré-produção',
  Production = 'Produção',
  PostProduction = 'Pós-produção',
  Delivery = 'Entrega',
  Completed = 'Finalizado',
}

export interface ProductionProject {
  id: string; // UUID
  clientId: string;
  title: string;
  type: ProjectType;
  status: ProductionStatus;
  startDate: string;
  deadline: string;
  responsibleId: string;
  teamIds: string[];
  progress: number; // 0-100
  budget?: number;
  actualCost?: number;
  notes?: string;
  folderUrl?: string; // Link to DAM or external storage
}

// --- DAM (Digital Asset Management) ---

export interface Asset {
  id: number;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  type: 'photo' | 'video' | 'design';
  projectId?: string;
  clientId?: string;
  folderId?: string; // Missing folderId
  tags: string[];
  dimensions?: string;
  fileSize?: string;
  size?: number; // DB size in bytes
  mimeType?: string; // DB mime type
  createdAt: string;
  versions: { version: number; url: string; date: string }[];
  usageRights?: UsageRights;
}

export interface UsageRights {
  canExpire: boolean;
  expiresAt?: string;
  territories?: string[];
  medias?: string[]; // e.g. 'Social Media', 'TV', 'Print'
  notes?: string;
}

export enum DeliveryStatus {
  Draft = 'Rascunho',
  Sent = 'Enviado',
  Viewed = 'Visualizado',
  Expired = 'Expirado'
}

export interface Delivery {
  id: string; // UUID
  title: string;
  recipientEmail?: string;
  shareLinkToken: string;
  status: DeliveryStatus;
  expiresAt?: string;
  projectId?: string;
  createdBy: string;
  createdAt: string;
  views: number;
  assets?: Asset[]; // For UI convenience
}

export interface DeliveryItem {
  id: string; // UUID
  deliveryId: string;
  assetId: number;
}

// --- Inventory & Equipment ---

export interface Equipment {
  id: number;
  name: string;
  category: 'Camera' | 'Lens' | 'Lighting' | 'Audio' | 'Grip' | 'Other';
  serialNumber: string;
  purchaseDate: string;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Retired';
  lastMaintenance?: string;
  nextMaintenance?: string;
  assignedTo?: string; // Employee ID
  value: number;
  notes?: string;
}

// --- SOPs (Processes) ---

export interface SOP {
  id: number;
  title: string;
  category: string;
  content: string; // Markdown supported
  authorId: string;
  updatedAt: string;
  version: string;
  tags: string[];
}

// --- After-Sales & Retention ---

export interface Feedback {
  id: string;
  clientId: string;
  projectId?: string;
  rating: number; // 1-5
  comment: string;
  testimonial: boolean; // Whether it can be used as a public testimonial
  status: 'Pending' | 'Approved' | 'Archived';
  date: string;
}

// --- Attendance ---

export type AttendanceType = 'Falta' | 'Atraso' | 'Saída Antecipada' | 'Presença';
export type AttendanceStatus = 'Pendente' | 'Justificada' | 'Injustificada';

export interface AttendanceRecord {
  id: string; // UUID
  employeeId: string;
  date: string;
  type: AttendanceType;
  reason?: string;
  durationMinutes: number; // Made non-optional for mapping safety
  status: AttendanceStatus;
  createdAt: string;
}

// --- RH & Performance ---

export interface JobRole {
  id: string; // UUID
  name: string;
  description: string;
  kpis: { name: string; weight: number }[];
  createdAt: string;
}

export interface Freelancer {
  id: string; // UUID
  name: string;
  mainFunction: string;
  associatedProjects: number[]; // Array of project IDs
  averageRating: number;
  availability: string;
  usageFrequency: 'baixo' | 'médio' | 'alto';
  createdAt: string;
}

export interface WeeklyReport {
  id: string; // UUID
  employeeId: string;
  weekStartDate: string;
  weekEndDate: string;
  roleId: string;
  // Productivity
  projectsWorked: string; // Text description
  hoursWorked: number;
  deliveriesMade: number;
  difficultyLevel: number; // 1-5
  // Quality
  selfEvaluation: number; // 1-5
  mainChallenges: string;
  improvementNotes: string;
  // Attendance
  absencesCount: number;
  absenceType?: 'Justificada' | 'Não justificada' | 'Atraso recorrente';
  attendanceNotes?: string;
  // Culture & Climate
  weekEvaluation: number; // 1-5
  motivationLevel: number; // 1-5
  feedbackText?: string;
  confirmed: boolean;
  createdAt: string;
}

export interface Training {
  id: string; // UUID
  employeeId: string;
  title: string;
  type: string; // 'Treinamento', 'Workshop', 'Curso'
  date: string;
  impactLevel: number; // 1-5
  notes?: string;
  createdAt: string;
}

export interface CultureFeedback {
  id: string; // UUID
  employeeId: string;
  anonymous: boolean;
  motivationScore: number; // 1-5
  satisfactionScore: number; // 1-5
  feedbackText?: string;
  date: string;
  createdAt: string;
}

// --- Quality Module ---

export enum ChecklistStatus {
  Draft = 'Rascunho',
  Active = 'Ativo',
  Completed = 'Concluído',
  Archived = 'Arquivado'
}

export interface QualityChecklistItem {
  id: string; // UUID
  text: string;
  completed: boolean;
}

export interface QualityChecklist {
  id: string; // UUID
  title: string;
  description?: string;
  projectId?: string; // Link to production project ID
  items: QualityChecklistItem[];
  status: ChecklistStatus;
  createdBy: string; // User ID
  createdAt: string;
  updatedAt: string;
}

export enum ApprovalStatus {
  Pending = 'Pendente',
  Approved = 'Aprovado',
  Rejected = 'Rejeitado',
  ChangesRequested = 'Alterações Solicitadas'
}

export interface ClientApproval {
  id: string; // UUID
  title: string;
  description: string;
  projectId?: string; // Link to production project
  clientId: string;
  linkToDeliverable: string;
  status: ApprovalStatus;
  clientFeedback?: string;
  feedbackDate?: string;
  sentDate: string; // When it was sent to client
  requestedBy: string; // User ID
  createdAt: string;
}

export interface Revision {
  id: string; // UUID
  projectId: string;
  versionNumber: number; // 1, 2, 3...
  changeLog: string; // What changed
  clientFeedback?: string; // What prompted this revision
  date: string;
  authorId: string;
  reworkTime?: number; // Hours spent on rework
  createdAt: string;
}

// --- Marketing & Content ---

export interface MarketingMetric {
  id: string;
  channel: string; // channel is preserved
  platform?: string; // added for mapping compatibility
  reach: number;
  engagement?: number;
  leads: number;
  conversions?: number; // added
  investment: number;
  spend?: number; // added
  notes?: string; // added
  date: string; // YYYY-MM
}

export interface EditorialContent {
  id: string;
  title: string;
  platform: string;
  type?: string; // added for mapping
  format: 'Video' | 'Photo' | 'Reel' | 'Story' | 'Article';
  status: 'Draft' | 'Planned' | 'In Production' | 'Published';
  publishDate: string;
  authorId?: string; // added
  responsibleId: string;
  content?: string; // added
  visualBrief?: string; // added
  link?: string;
}

export interface Referral {
  id: string;
  referrerClientId: string;
  referredClientName: string;
  status: 'Requested' | 'Pending' | 'Converted' | 'Rejected';
  rewardStatus: 'None' | 'Pending' | 'Given';
  notes?: string;
  date: string;
}