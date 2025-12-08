// types.ts

export enum Page {
  Dashboard = 'Dashboard',
  Pipeline = 'Leads & Pipeline',
  Clients = 'Clientes',
  Financial = 'Financeiro',
  Métricas = 'Métricas',
  Reports = 'Funcionários & Relatórios',
  Notifications = 'Notificações',
  Goals = 'Metas',
  Agenda = 'Agenda',
  Admin = 'Administração',
  Settings = 'Configurações',
}

export enum LeadStatus {
  New = 'Inquérito',
  Contacted = 'Consulta Agendada',
  Proposal = 'Proposta Enviada',
  Negotiation = 'Contrato Assinado',
  Production = 'Pós-Produção',
  Closed = 'Finalizado',
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
  dueDate: string;
  completed: boolean;
}

export interface LeadNote {
  id: number;
  date: string;
  text: string;
  authorId: number;
}

export interface FileAttachment {
  id: number;
  name: string;
  size: string; // e.g., "2.5MB"
  type: 'PDF' | 'Image' | 'Document';
  uploadDate: string;
}

export interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  priority: LeadPriority;
  status: LeadStatus;
  ownerId: number;
  projectType: ProjectType;
  value: number;
  notes: LeadNote[];
  tasks: Task[];
  files: FileAttachment[];
  convertedToClientId?: number;
}

export interface ClientTag {
  id: string;
  text: string;
  color: string; // e.g., 'blue', 'green'
}

export interface Client {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  since: string;
  totalRevenue: number;
  interactionHistory: Interaction[];
  status: 'Ativo' | 'Inativo';
  tags: ClientTag[];
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
  active?: boolean;
}

export interface Budget {
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
  budgets: Budget[];
  taxRecords: Tax[];
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'alert' | 'success' | 'info';
  userId?: number;
}

export type Role = 'Sales' | 'Creative' | 'IT' | 'Photographer' | 'Videomaker' | 'Other';

export interface Employee {
  id: number;
  name: string;
  email: string;
  active: boolean;
  position: string;
  avatarUrl: string;
  role: Role;
  isAdmin?: boolean;
  notificationPreferences: {
    emailOnNewLead: boolean;
    emailOnTaskDue: boolean;
  };
}

export interface Team {
  id: number;
  name: string;
  memberIds: number[];
}


// Base report structure
interface BaseReport {
  id: number;
  employeeId: number;
  date: string;
  notes: string; // General notes applicable to all roles
  status: 'Pendente' | 'Aprovado';
}

export interface SalesReport extends BaseReport {
  role: 'Sales';
  leadsContacted: number;
  contractsSigned: number;
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

export interface OtherReport extends BaseReport {
  role: 'Other';
  // Uses base fields only, or we could map some unused fields if needed.
  // For now, we'll rely on 'notes' for the main content.
}

export type Report = SalesReport | CreativeReport | ITReport | OtherReport;


export interface Tax {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Paid';
  notes?: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time?: string;
  location?: string;
  responsibleId?: number;
  notes?: string;
  type: 'meeting' | 'deadline' | 'task';
  description?: string;
  attendeeIds?: number[];
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
  employeeId?: number;
  unit: 'currency' | 'count';
  deadline: string;
  updates: GoalUpdate[];
}

export interface Activity {
  id: number;
  actorId: number;
  action: string;
  target: string; // e.g., "Lead 'Global Corp'"
  date: string;
  type: 'lead' | 'financial' | 'task' | 'client';
}