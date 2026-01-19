import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { formatCurrency } from '../utils';
import {
    User, Lead, Client, Team, Task, Activity, Notification, Report, FinancialData, CalendarEvent, Goal,
    FileAttachment, Interaction, ClientTag, Transaction, Budget, Tax, GoalUpdate,
    ProductionProject, Asset, Equipment, SOP, ProductionStatus,
    Proposal, FollowUp, LeadStatus, Feedback, Referral,
    MarketingMetric, EditorialContent,
    QualityChecklist, ClientApproval, Revision,
    Delivery, Complaint, UpsellOpportunity, ImportantDate,
    JobRole, Freelancer, WeeklyReport, Training, CultureFeedback, AttendanceRecord,
    InternalBudget
} from '../types';
import { supabase } from '../lib/supabase';
import {
    getEmployees, getLeads, getClients, getTeams, getTasks, getActivities, getNotifications, getReports, getCalendarEvents, getGoals,
    getTransactions, getBudgets, getInternalBudgets, getTaxes,
    createEmployee, updateEmployee, deleteEmployee, uploadAvatar, createUser,
    createLead, updateLead, deleteLead,
    createClient, updateClient, deleteClient,
    createTeam, updateTeam, deleteTeam,
    createNotification, createActivity,
    createLeadNote, createLeadTask, toggleLeadTask as toggleLeadTaskAPI, createLeadFile,
    createInteraction,
    createTransaction, deleteTransaction, updateTransaction, createBudget, updateBudget, deleteBudget,
    createInternalBudget, updateInternalBudget, deleteInternalBudget,
    createTax, updateTax, deleteTax,
    createReport, updateReport,
    createGoal, updateGoal, deleteGoal, createGoalUpdate,
    createCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
    createTag, addClientTag, removeClientTag,
    getProductionProjects, createProductionProject, updateProductionProject, deleteProductionProject,
    getAssets, createAsset, updateAsset,
    getEquipment, createEquipment, updateEquipment, deleteEquipment,
    getSOPs, createSOP, updateSOP, deleteSOP,
    getProposals, createProposal, updateProposal, deleteProposal,
    getFollowUps, createFollowUp, deleteFollowUp,
    getFeedbacks, createFeedback, deleteFeedback,
    getReferrals, createReferral, deleteReferral,
    getComplaints, createComplaint, deleteComplaint,
    getImportantDates, createImportantDate, deleteImportantDate,
    getUpsellOpportunities, createUpsellOpportunity, deleteUpsellOpportunity,
    getMarketingMetrics, createMarketingMetric, updateMarketingMetric, deleteMarketingMetric,
    getEditorialContent, createEditorialContent, updateEditorialContent, deleteEditorialContent,
    getQualityChecklists, createQualityChecklist, updateQualityChecklist, deleteQualityChecklist,
    getClientApprovals, createClientApproval, updateClientApproval, deleteClientApproval,
    getQualityRevisions, createQualityRevision,
    getDeliveries, createDelivery, updateDelivery, deleteDelivery,
    getJobRoles, createJobRole, updateJobRole, deleteJobRole,
    getFreelancers, createFreelancer, updateFreelancer, deleteFreelancer,
    getWeeklyReports, createWeeklyReport, updateWeeklyReport, deleteWeeklyReport,
    getTrainings, createTraining, deleteTraining,
    getCultureFeedbacks, createCultureFeedback, updateCultureFeedback, deleteCultureFeedback,
    getAttendanceRecords, createAttendanceRecord, updateAttendanceRecord, deleteAttendanceRecord
} from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
    employees: User[];
    leads: Lead[];
    clients: Client[];
    teams: Team[];
    tasks: Task[];
    activities: Activity[];
    notifications: Notification[];
    reports: Report[];
    financialData: FinancialData;
    calendarEvents: CalendarEvent[];
    goals: Goal[];
    productionProjects: ProductionProject[];
    assets: Asset[];
    equipment: Equipment[];
    sops: SOP[];
    proposals: Proposal[];
    followUps: FollowUp[];
    feedbacks: Feedback[];
    referrals: Referral[];
    complaints: Complaint[];
    upsellOpportunities: UpsellOpportunity[];
    importantDates: ImportantDate[];
    marketingMetrics: MarketingMetric[];
    editorialContent: EditorialContent[];
    qualityChecklists: QualityChecklist[];
    clientApprovals: ClientApproval[];
    revisions: Revision[];
    deliveries: Delivery[];

    // RH & Performance
    jobRoles: JobRole[];
    freelancers: Freelancer[];
    weeklyReports: WeeklyReport[];
    trainings: Training[];
    cultureFeedbacks: CultureFeedback[];
    attendanceRecords: AttendanceRecord[];

    loading: boolean;

    // Actions
    addEmployee: (employee: Omit<User, 'id' | 'avatarUrl' | 'permissions'> & { permissions?: any[] }, password?: string, avatarFile?: File) => Promise<void>;
    updateEmployeeData: (user: User, avatarFile?: File) => Promise<void>;
    removeEmployee: (id: string) => Promise<void>;

    addLead: (lead: Omit<Lead, 'id' | 'notes' | 'tasks' | 'files'>) => Promise<void>;
    updateLeadData: (lead: Lead) => Promise<void>;
    removeLead: (id: string) => Promise<void>;
    addLeadNote: (leadId: string, noteText: string) => Promise<void>;
    addLeadTask: (leadId: string, taskData: Omit<Task, 'id' | 'completed'>) => Promise<void>;
    toggleLeadTask: (leadId: string, taskId: number) => Promise<void>;
    addLeadFile: (leadId: string, fileData: Omit<FileAttachment, 'id'>) => Promise<void>;
    convertLeadToClient: (leadId: string) => Promise<void>;

    addProposal: (proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateProposalData: (proposal: Proposal) => Promise<void>;
    removeProposal: (id: string) => Promise<void>;

    addFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt'>) => Promise<void>;
    removeFollowUp: (id: string) => Promise<void>;

    addFeedback: (feedback: Omit<Feedback, 'id'>) => Promise<void>;
    removeFeedback: (id: string) => Promise<void>;
    addReferral: (referral: Omit<Referral, 'id'>) => Promise<void>;
    removeReferral: (id: string) => Promise<void>;
    addComplaint: (complaint: Omit<Complaint, 'id'>) => Promise<void>;
    removeComplaint: (id: string) => Promise<void>;
    addUpsellOpportunity: (opp: Omit<UpsellOpportunity, 'id'>) => Promise<void>;
    removeUpsellOpportunity: (id: string) => Promise<void>;
    addImportantDate: (date: Omit<ImportantDate, 'id'>) => Promise<void>;
    removeImportantDate: (id: string) => Promise<void>;

    addMarketingMetric: (metric: Omit<MarketingMetric, 'id'>) => Promise<void>;
    removeMarketingMetric: (id: string) => Promise<void>;
    addEditorialContent: (content: Omit<EditorialContent, 'id'>) => Promise<void>;
    updateEditorialContentData: (content: EditorialContent) => Promise<void>;
    removeEditorialContent: (id: string) => Promise<void>;

    addClient: (client: Omit<Client, 'id' | 'interactionHistory' | 'totalRevenue' | 'since'>) => Promise<void>;
    updateClientData: (client: Client) => Promise<void>;
    removeClient: (id: string) => Promise<void>;
    addInteraction: (clientId: string, interaction: Omit<Interaction, 'id'>) => Promise<void>;
    addClientTag: (clientId: string, tagId: string) => Promise<void>;
    removeClientTag: (clientId: string, tagId: string) => Promise<void>;
    createTag: (tag: Omit<ClientTag, 'id'>) => Promise<void>;

    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    updateTransactionData: (transaction: Transaction) => Promise<void>;
    removeTransaction: (id: number) => Promise<void>;
    toggleTransactionStatus: (transaction: Transaction) => Promise<void>;
    addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
    updateBudget: (budget: Budget) => Promise<void>;
    deleteBudget: (id: number) => Promise<void>;
    addInternalBudget: (budget: Omit<InternalBudget, 'id'>) => Promise<void>;
    updateInternalBudget: (budget: InternalBudget) => Promise<void>;
    deleteInternalBudget: (id: string) => Promise<void>;
    addTax: (tax: Omit<Tax, 'id'>) => Promise<void>;
    updateTax: (tax: Tax) => Promise<void>;
    deleteTax: (id: number) => Promise<void>;
    payTax: (tax: Tax) => Promise<void>;

    addReport: (report: Omit<Report, 'id'>) => Promise<void>;
    updateReport: (report: Report) => Promise<void>;

    addGoal: (goal: Omit<Goal, 'id' | 'updates'>) => Promise<void>;
    updateGoal: (goal: Goal) => Promise<void>;
    deleteGoal: (id: number) => Promise<void>;
    addGoalUpdate: (goalId: number, update: GoalUpdate) => Promise<void>;

    addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
    updateEvent: (event: CalendarEvent) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;

    addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
    updateTeamData: (team: Team) => Promise<void>;
    removeTeam: (id: string) => Promise<void>;

    addProductionProject: (project: Omit<ProductionProject, 'id'>) => Promise<void>;
    updateProductionProjectData: (project: ProductionProject) => Promise<void>;
    removeProductionProject: (id: string) => Promise<void>;

    addEquipment: (equipment: Omit<Equipment, 'id'>) => Promise<void>;
    updateEquipmentData: (equipment: Equipment) => Promise<void>;
    removeEquipment: (id: number) => Promise<void>;

    addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'versions'>) => Promise<void>;
    addSOP: (sop: Omit<SOP, 'id' | 'updatedAt'>) => Promise<void>;

    addNotification: (title: string, message: string, type: 'alert' | 'success' | 'info') => Promise<void>;
    markNotificationRead: (id: string) => Promise<void>;
    markAllNotificationsRead: () => Promise<void>;
    addActivity: (actorId: string, action: string, target: string, type: Activity['type']) => Promise<void>;

    // Quality
    addQualityChecklist: (checklist: Omit<QualityChecklist, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateQualityChecklistData: (checklist: QualityChecklist) => Promise<void>;
    removeQualityChecklist: (id: string) => Promise<void>;
    addClientApproval: (approval: Omit<ClientApproval, 'id'>) => Promise<void>;
    updateClientApprovalData: (approval: ClientApproval) => Promise<void>;
    removeClientApproval: (id: string) => Promise<void>;
    addRevision: (revision: Omit<Revision, 'id'>) => Promise<void>;

    // Deliveries
    addDelivery: (delivery: Omit<Delivery, 'id' | 'createdAt' | 'views' | 'assets'>, assetIds: number[]) => Promise<void>;
    updateDeliveryData: (delivery: Delivery) => Promise<void>;
    removeDelivery: (id: string) => Promise<void>;

    // RH & Performance Actions
    addJobRole: (role: Omit<JobRole, 'id' | 'createdAt'>) => Promise<void>;
    updateJobRoleData: (role: JobRole) => Promise<void>;
    removeJobRole: (id: string) => Promise<void>;
    addFreelancer: (freelancer: Omit<Freelancer, 'id' | 'createdAt'>) => Promise<void>;
    updateFreelancerData: (freelancer: Freelancer) => Promise<void>;
    removeFreelancer: (id: string) => Promise<void>;
    addWeeklyReport: (report: Omit<WeeklyReport, 'id' | 'createdAt'>) => Promise<void>;
    updateWeeklyReportData: (report: WeeklyReport) => Promise<void>;
    removeWeeklyReport: (id: string) => Promise<void>;
    addTraining: (training: Omit<Training, 'id' | 'createdAt'>) => Promise<void>;
    removeTraining: (id: string) => Promise<void>;
    addCultureFeedback: (feedback: Omit<CultureFeedback, 'id' | 'createdAt'>) => Promise<void>;
    updateCultureFeedbackData: (feedback: CultureFeedback) => Promise<void>;
    removeCultureFeedback: (id: string) => Promise<void>;
    addAttendanceRecord: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => Promise<void>;
    updateAttendanceRecordData: (record: AttendanceRecord) => Promise<void>;
    removeAttendanceRecord: (id: string) => Promise<void>;

    refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [employees, setEmployees] = useState<User[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [internalBudgets, setInternalBudgets] = useState<InternalBudget[]>([]);
    const [taxes, setTaxes] = useState<Tax[]>([]);
    const [financialData, setFinancialData] = useState<FinancialData>({
        revenue: [], expenses: [], taxes: [], cashFlowForecast: [], labels: [], transactions: [], budgets: [], internalBudgets: [], taxRecords: []
    });
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [productionProjects, setProductionProjects] = useState<ProductionProject[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [sops, setSops] = useState<SOP[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [followUps, setFollowUps] = useState<FollowUp[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [upsellOpportunities, setUpsellOpportunities] = useState<UpsellOpportunity[]>([]);
    const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
    const [marketingMetrics, setMarketingMetrics] = useState<MarketingMetric[]>([]);
    const [editorialContent, setEditorialContent] = useState<EditorialContent[]>([]);
    const [qualityChecklists, setQualityChecklists] = useState<QualityChecklist[]>([]);
    const [clientApprovals, setClientApprovals] = useState<ClientApproval[]>([]);
    const [revisions, setRevisions] = useState<Revision[]>([]);
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
    const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
    const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [cultureFeedbacks, setCultureFeedbacks] = useState<CultureFeedback[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

    const [loading, setLoading] = useState(true);

    const calculateFinancialData = useCallback((trans: Transaction[], buds: Budget[], intBuds: InternalBudget[], txs: Tax[]) => {
        const currentYear = new Date().getFullYear();
        const revenue = new Array(12).fill(0);
        const expenses = new Array(12).fill(0);
        const taxesMonthly = new Array(12).fill(0);
        const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        trans.forEach(t => {
            const date = new Date(t.date);
            if (t.active !== false && date.getFullYear() === currentYear && t.status === 'Paid') {
                const month = date.getMonth();
                if (t.type === 'revenue') revenue[month] += t.amount;
                else if (t.type === 'expense') {
                    expenses[month] += t.amount;
                    if (t.category === 'Impostos') taxesMonthly[month] += t.amount;
                }
            }
        });

        setFinancialData({
            revenue, expenses, taxes: taxesMonthly, labels, cashFlowForecast: [], transactions: trans, budgets: buds, internalBudgets: intBuds, taxRecords: txs
        });
    }, []);

    useEffect(() => { calculateFinancialData(transactions, budgets, internalBudgets, taxes); }, [transactions, budgets, internalBudgets, taxes, calculateFinancialData]);

    const refreshData = async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                getEmployees(), getLeads(), getClients(), getTeams(), getTasks(), getActivities(), getNotifications(), getReports(), getCalendarEvents(), getGoals(),
                getTransactions(), getBudgets(), getInternalBudgets(), getTaxes(),
                getProductionProjects(), getAssets(), getEquipment(), getSOPs(),
                getProposals(), getFollowUps(), getFeedbacks(), getReferrals(), getComplaints(), getUpsellOpportunities(), getImportantDates(),
                getMarketingMetrics(), getEditorialContent(),
                getQualityChecklists(), getClientApprovals(), getQualityRevisions(), getDeliveries(),
                getJobRoles(), getFreelancers(), getWeeklyReports(), getTrainings(), getCultureFeedbacks(), getAttendanceRecords()
            ]);

            const [
                empsResult, ldsResult, clsResult, tmsResult, tsksResult, actsResult, notifsResult, repsResult, evtsResult, glsResult,
                transResult, budsResult, intBudsResult, txsResult, projsResult, astsResult, eqsResult, spsResult, propsResult, flwsResult, fdbsResult, rfsResult, cmpsResult, oppsResult, impsResult,
                mksResult, edsResult, qcsResult, casResult, rvsResult, dlvsResult,
                jrsResult, frlsResult, wrsResult, trnsResult, cfsResult, arsResult
            ] = results;

            // Helper to get value or empty array/log error
            const getValue = <T,>(result: PromiseSettledResult<T>, name: string, defaultValue: T): T => {
                if (result.status === 'fulfilled') return result.value;
                console.warn(`Failed to fetch ${name}:`, result.reason);
                return defaultValue;
            };

            setEmployees(getValue(empsResult, 'employees', []));
            setLeads(getValue(ldsResult, 'leads', []));
            setClients(getValue(clsResult, 'clients', []));
            setTeams(getValue(tmsResult, 'teams', []));
            setTasks(getValue(tsksResult, 'tasks', []));
            setActivities(getValue(actsResult, 'activities', []));
            setNotifications(getValue(notifsResult, 'notifications', []));
            setReports(getValue(repsResult, 'reports', []));
            setCalendarEvents(getValue(evtsResult, 'calendarEvents', []));
            setGoals(getValue(glsResult, 'goals', []));
            setTransactions(getValue(transResult, 'transactions', []));
            setBudgets(getValue(budsResult, 'budgets', []));
            setInternalBudgets(getValue(intBudsResult, 'internalBudgets', []));
            setTaxes(getValue(txsResult, 'taxes', []));
            setProductionProjects(getValue(projsResult, 'productionProjects', []));
            setAssets(getValue(astsResult, 'assets', []));
            setEquipment(getValue(eqsResult, 'equipment', []));
            setSops(getValue(spsResult, 'sops', []));
            setProposals(getValue(propsResult, 'proposals', []));
            setFollowUps(getValue(flwsResult, 'followUps', []));
            setFeedbacks(getValue(fdbsResult, 'feedbacks', []));
            setReferrals(getValue(rfsResult, 'referrals', []));
            setComplaints(getValue(cmpsResult, 'complaints', []));
            setUpsellOpportunities(getValue(oppsResult, 'upsellOpportunities', []));
            setImportantDates(getValue(impsResult, 'importantDates', []));
            setMarketingMetrics(getValue(mksResult, 'marketingMetrics', []));
            setEditorialContent(getValue(edsResult, 'editorialContent', []));
            setQualityChecklists(getValue(qcsResult, 'qualityChecklists', []));
            setClientApprovals(getValue(casResult, 'clientApprovals', []));
            setRevisions(getValue(rvsResult, 'revisions', []));
            setDeliveries(getValue(dlvsResult, 'deliveries', []));
            setJobRoles(getValue(jrsResult, 'jobRoles', []));
            setFreelancers(getValue(frlsResult, 'freelancers', []));
            setWeeklyReports(getValue(wrsResult, 'weeklyReports', []));
            setTrainings(getValue(trnsResult, 'trainings', []));
            setCultureFeedbacks(getValue(cfsResult, 'cultureFeedbacks', []));
            setAttendanceRecords(getValue(arsResult, 'attendanceRecords', []));

        } catch (error) {
            console.error("Critical error in refreshData:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (currentUser) refreshData(); }, [currentUser]);

    // Actions
    const addEmployee = async (employee: Omit<User, 'id' | 'avatarUrl' | 'permissions'> & { permissions?: any[] }, password?: string, avatarFile?: File) => {
        try {
            let newEmp = password ? await createUser(employee.email, password, employee) : await createEmployee(employee);
            if (newEmp && avatarFile) {
                const url = await uploadAvatar(avatarFile, newEmp.id);
                newEmp = await updateEmployee({ ...newEmp, avatarUrl: url });
            }
            // Verify creation by refreshing list
            // This ensures we have the servers-side sorted and complete data
            const updatedEmployees = await getEmployees();
            setEmployees(updatedEmployees);

            await addNotification('Sucesso', 'Funcionário adicionado.', 'success');
        } catch (e: any) { console.error(e); alert("Erro ao adicionar funcionário: " + (e.message || "Erro desconhecido")); }
    };

    const updateEmployeeData = async (user: User, avatarFile?: File) => {
        try {
            let userToSave = user;
            if (avatarFile) {
                const url = await uploadAvatar(avatarFile, user.id);
                userToSave = { ...user, avatarUrl: url };
            }
            const updated = await updateEmployee(userToSave);
            setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
        } catch (e) { console.error(e); }
    };

    const removeEmployee = async (id: string) => {
        if (window.confirm('Remover funcionário?')) {
            try { await deleteEmployee(id); setEmployees(prev => prev.filter(e => e.id !== id)); }
            catch (e) { console.error(e); }
        }
    };

    const addLead = async (lead: Omit<Lead, 'id' | 'notes' | 'tasks' | 'files'>) => {
        try {
            const newLead = await createLead(lead);
            setLeads(prev => [newLead, ...prev]);
            await addNotification('Sucesso', 'Lead criado com sucesso.', 'success');
        } catch (e) {
            console.error(e);
            await addNotification('Erro', 'Falha ao criar lead. Verifique sua conexão ou permissões.', 'alert');
        }
    };

    const updateLeadData = async (lead: Lead) => {
        try {
            const updated = await updateLead(lead);
            setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
            await addNotification('Sucesso', 'Lead atualizado.', 'success');
        } catch (e) {
            console.error(e);
            await addNotification('Erro', 'Falha ao atualizar lead.', 'alert');
        }
    };

    const removeLead = async (id: string) => {
        try { await deleteLead(id); setLeads(prev => prev.filter(l => l.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addLeadNote = async (leadId: string, text: string) => {
        try {
            const note = await createLeadNote(leadId, { text, authorId: currentUser?.id, date: new Date().toISOString() });
            setLeads(prev => prev.map(l => {
                if (l.id === leadId) {
                    return { ...l, notes: [...(l.notes || []), note] };
                }
                return l;
            }));
        } catch (e) { console.error(e); }
    };

    const addLeadTask = async (leadId: string, task: any) => {
        try {
            const newTask = await createLeadTask(leadId, task);
            setLeads(prev => prev.map(l => {
                if (l.id === leadId) {
                    return { ...l, tasks: [...(l.tasks || []), newTask] };
                }
                return l;
            }));
        } catch (e) { console.error(e); }
    };

    const toggleLeadTask = async (leadId: string, taskId: number) => {
        try {
            // Optimistic update
            setLeads(prev => prev.map(l => {
                if (l.id === leadId) {
                    return { ...l, tasks: l.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) };
                }
                return l;
            }));

            const lead = leads.find(l => l.id === leadId);
            const task = lead?.tasks.find(t => t.id === taskId);
            if (task) {
                await toggleLeadTaskAPI(taskId, !task.completed);
            }
        } catch (e) { console.error(e); refreshData(); } // Revert on error
    };

    const addLeadFile = async (leadId: string, file: any) => {
        try {
            const newFile = await createLeadFile(leadId, file);
            setLeads(prev => prev.map(l => {
                if (l.id === leadId) {
                    return { ...l, files: [...(l.files || []), newFile] };
                }
                return l;
            }));
        } catch (e) { console.error(e); }
    };

    const convertLeadToClient = async (leadId: string) => {
        try {
            const lead = leads.find(l => l.id === leadId);
            if (lead) {
                const newClient = await createClient({
                    name: lead.name,
                    company: lead.company,
                    email: lead.email,
                    phone: lead.phone,
                    status: 'Ativo',
                    tags: [],
                    projects: [],
                    complaints: [],
                    importantDates: [],
                    feedbacks: [],
                    upsellOpportunities: []
                });

                // Optimistic updates
                setClients(prev => [...prev, newClient]);

                // Update lead to Won status
                const updatedLead = { ...lead, status: LeadStatus.Won, convertedToClientId: newClient.id };
                await updateLead(updatedLead);
                setLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));

                await addNotification('Sucesso', `Lead ${lead.name} convertido em Cliente com sucesso!`, 'success');
            }
        } catch (e) {
            console.error('Error converting lead to client:', e);
            await addNotification('Erro', 'Falha ao converter lead em cliente.', 'error');
        }
    };

    const addClient = async (client: any) => {
        try {
            const newClient = await createClient(client);
            setClients(prev => [...prev, newClient]);
            await addNotification('Sucesso', 'Cliente adicionado com sucesso.', 'success');
        } catch (e) {
            console.error(e);
            await addNotification('Erro', 'Falha ao adicionar cliente.', 'alert');
        }
    };

    const updateClientData = async (client: Client) => {
        try {
            const updated = await updateClient(client);
            setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
            await addNotification('Sucesso', 'Dados do cliente atualizados.', 'success');
        } catch (e) {
            console.error(e);
            await addNotification('Erro', 'Falha ao atualizar dados do cliente.', 'alert');
        }
    };

    const removeClient = async (id: string) => {
        try { await deleteClient(id); setClients(prev => prev.filter(c => c.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addInteraction = async (clientId: string, interaction: any) => {
        try {
            const newInteraction = await createInteraction({ ...interaction, client_id: clientId });
            setClients(prev => prev.map(c => {
                if (c.id === clientId) {
                    return { ...c, interactionHistory: [newInteraction, ...(c.interactionHistory || [])] };
                }
                return c;
            }));
        } catch (e) { console.error(e); }
    };

    const addClientTagAction = async (clientId: string, tagId: string) => {
        try {
            await addClientTag(clientId, tagId);
            // We need to fetch the tag object or construct it. For now assuming we refresh just this client or complex logic.
            // Simplified: refresh just to be safe for tags as they are complex relations, BUT let's try to avoid full refresh.
            // Actually, for tags, full refresh might be safer unless we have the tag object available here.
            // Let's keep refreshData for Tags for now to ensure consistency as I don't have the Tag object handy to push to state.
            refreshData();
        } catch (e) { console.error(e); }
    };

    const removeClientTagAction = async (clientId: string, tagId: string) => {
        try {
            await removeClientTag(clientId, tagId);
            setClients(prev => prev.map(c => {
                if (c.id === clientId) {
                    return { ...c, tags: c.tags.filter(t => t.id !== tagId) };
                }
                return c;
            }));
        } catch (e) { console.error(e); }
    };

    const createTagAction = async (tag: any) => {
        try { await createTag(tag); }
        catch (e) { console.error(e); }
    };

    const addProposal = async (proposal: any) => {
        try { const p = await createProposal(proposal); setProposals(prev => [p, ...prev]); }
        catch (e) { console.error(e); }
    };

    const updateProposalData = async (proposal: Proposal) => {
        try { const p = await updateProposal(proposal); setProposals(prev => prev.map(x => x.id === p.id ? p : x)); }
        catch (e) { console.error(e); }
    };

    const removeProposal = async (id: string) => {
        try { await deleteProposal(id); setProposals(prev => prev.filter(p => p.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addFollowUp = async (followUp: any) => {
        try { const f = await createFollowUp(followUp); setFollowUps(prev => [f, ...prev]); }
        catch (e) { console.error(e); }
    };

    const removeFollowUp = async (id: string) => {
        try { await deleteFollowUp(id); setFollowUps(prev => prev.filter(f => f.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addFeedback = async (feedback: any) => {
        try { const f = await createFeedback(feedback); setFeedbacks(prev => [f, ...prev]); }
        catch (e) { console.error(e); }
    };

    const removeFeedback = async (id: string) => {
        try { await deleteFeedback(id); setFeedbacks(prev => prev.filter(f => f.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addReferral = async (referral: any) => {
        try { const r = await createReferral(referral); setReferrals(prev => [r, ...prev]); }
        catch (e) { console.error(e); }
    };

    const removeReferral = async (id: string) => {
        try { await deleteReferral(id); setReferrals(prev => prev.filter(r => r.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addComplaint = async (complaint: any) => {
        try { const c = await createComplaint(complaint); setComplaints(prev => [c, ...prev]); }
        catch (e) { console.error(e); }
    };

    const removeComplaint = async (id: string) => {
        try { await deleteComplaint(id); setComplaints(prev => prev.filter(c => c.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addUpsellOpportunity = async (opp: any) => {
        try { const o = await createUpsellOpportunity(opp); setUpsellOpportunities(prev => [o, ...prev]); }
        catch (e) { console.error(e); }
    };

    const removeUpsellOpportunity = async (id: string) => {
        try { await deleteUpsellOpportunity(id); setUpsellOpportunities(prev => prev.filter(o => o.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addImportantDate = async (date: any) => {
        try { const d = await createImportantDate(date); setImportantDates(prev => [d, ...prev]); }
        catch (e) { console.error(e); }
    };

    const removeImportantDate = async (id: string) => {
        try { await deleteImportantDate(id); setImportantDates(prev => prev.filter(d => d.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addMarketingMetric = async (metric: any) => {
        try { const m = await createMarketingMetric(metric); setMarketingMetrics(prev => [...prev, m]); }
        catch (e) { console.error(e); }
    };

    const removeMarketingMetric = async (id: string) => {
        try { await deleteMarketingMetric(id); setMarketingMetrics(prev => prev.filter(m => m.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addEditorialContent = async (content: any) => {
        try { const c = await createEditorialContent(content); setEditorialContent(prev => [...prev, c]); }
        catch (e) { console.error(e); }
    };

    const updateEditorialContentData = async (content: EditorialContent) => {
        try { const updated = await updateEditorialContent(content); setEditorialContent(prev => prev.map(c => c.id === updated.id ? updated : c)); }
        catch (e) { console.error(e); }
    };

    const removeEditorialContent = async (id: string) => {
        try { await deleteEditorialContent(id); setEditorialContent(prev => prev.filter(c => c.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addTransaction = async (tx: any) => {
        try { const t = await createTransaction(tx); setTransactions(prev => [t, ...prev]); }
        catch (e) { console.error(e); }
    };

    const updateTransactionDataAction = async (tx: Transaction) => {
        try { const updated = await updateTransaction(tx); setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t)); }
        catch (e) { console.error(e); }
    };

    const removeTransaction = async (id: number) => {
        try { await deleteTransaction(id); setTransactions(prev => prev.filter(t => t.id !== id)); }
        catch (e) { console.error(e); }
    };

    const toggleTransactionStatus = async (tx: Transaction) => {
        try { const updated = await updateTransaction({ ...tx, status: tx.status === 'Paid' ? 'Pending' : 'Paid' }); setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t)); }
        catch (e) { console.error(e); }
    };

    const addBudget = async (budget: any) => {
        try { const b = await createBudget(budget); setBudgets(prev => [...prev, b]); }
        catch (e) { console.error(e); }
    };

    const updateBudgetAction = async (budget: Budget) => {
        try { const updated = await updateBudget(budget); setBudgets(prev => prev.map(b => b.id === updated.id ? updated : b)); }
        catch (e) { console.error(e); }
    };

    const deleteBudgetAction = async (id: number) => {
        try { await deleteBudget(id); setBudgets(prev => prev.filter(b => b.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addInternalBudgetAction = async (budget: Omit<InternalBudget, 'id'>) => {
        try { const b = await createInternalBudget(budget); setInternalBudgets(prev => [...prev, b]); }
        catch (e) { console.error(e); }
    };

    const updateInternalBudgetAction = async (budget: InternalBudget) => {
        try { const updated = await updateInternalBudget(budget); setInternalBudgets(prev => prev.map(b => b.id === updated.id ? updated : b)); }
        catch (e) { console.error(e); }
    };

    const deleteInternalBudgetAction = async (id: string) => {
        try { await deleteInternalBudget(id); setInternalBudgets(prev => prev.filter(b => b.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addTax = async (tax: any) => {
        try { const t = await createTax(tax); setTaxes(prev => [...prev, t]); }
        catch (e) { console.error(e); }
    };

    const updateTaxAction = async (tax: Tax) => {
        try { const updated = await updateTax(tax); setTaxes(prev => prev.map(t => t.id === updated.id ? updated : t)); }
        catch (e) { console.error(e); }
    };

    const deleteTaxAction = async (id: number) => {
        try { await deleteTax(id); setTaxes(prev => prev.filter(t => t.id !== id)); }
        catch (e) { console.error(e); }
    };

    const payTax = async (tax: Tax) => {
        try { const updated = await updateTax({ ...tax, status: 'Paid' }); setTaxes(prev => prev.map(t => t.id === updated.id ? updated : t)); }
        catch (e) { console.error(e); }
    };

    const addReport = async (report: any) => {
        try { const r = await createReport(report); setReports(prev => [r, ...prev]); }
        catch (e) { console.error(e); }
    };

    const updateReportAction = async (report: Report) => {
        try { const updated = await updateReport(report); setReports(prev => prev.map(r => r.id === updated.id ? updated : r)); }
        catch (e) { console.error(e); }
    };

    const addGoal = async (goal: any) => {
        try { const g = await createGoal(goal); setGoals(prev => [...prev, g]); }
        catch (e) { console.error(e); }
    };

    const updateGoalAction = async (goal: Goal) => {
        try { const updated = await updateGoal(goal); setGoals(prev => prev.map(g => g.id === updated.id ? updated : g)); }
        catch (e) { console.error(e); }
    };

    const deleteGoalAction = async (id: number) => {
        try { await deleteGoal(id); setGoals(prev => prev.filter(g => g.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addGoalUpdate = async (goalId: number, update: any) => {
        try {
            await createGoalUpdate(goalId, update);
            setGoals(prev => prev.map(g => {
                if (g.id === goalId) {
                    return { ...g, updates: [...(g.updates || []), update] };
                }
                return g;
            }));
        } catch (e) { console.error(e); }
    };

    const addEvent = async (event: any) => {
        try { const e = await createCalendarEvent(event); setCalendarEvents(prev => [...prev, e]); }
        catch (e) { console.error(e); }
    };

    const updateEvent = async (event: CalendarEvent) => {
        try { const updated = await updateCalendarEvent(event); setCalendarEvents(prev => prev.map(e => e.id === updated.id ? updated : e)); }
        catch (e) { console.error(e); }
    };

    const deleteEvent = async (id: string) => {
        try { await deleteCalendarEvent(id); setCalendarEvents(prev => prev.filter(e => e.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addTeam = async (team: any) => {
        try { const t = await createTeam(team); setTeams(prev => [...prev, t]); }
        catch (e) { console.error(e); }
    };

    const updateTeamData = async (team: Team) => {
        try { const updated = await updateTeam(team); setTeams(prev => prev.map(t => t.id === updated.id ? updated : t)); }
        catch (e) { console.error(e); }
    };

    const removeTeam = async (id: string) => {
        try { await deleteTeam(id); setTeams(prev => prev.filter(t => t.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addProductionProject = async (project: Omit<ProductionProject, 'id'>) => {
        try {
            const newProject = await createProductionProject(project);
            setProductionProjects(prev => [...prev, newProject]);
            await addNotification('Sucesso', 'Projeto criado com sucesso.', 'success');
        } catch (e) {
            console.error(e);
            await addNotification('Erro', 'Falha ao criar projeto.', 'alert');
        }
    };

    const updateProductionProjectData = async (project: ProductionProject) => {
        try {
            const updated = await updateProductionProject(project);
            setProductionProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
            await addNotification('Sucesso', 'Projeto atualizado com sucesso.', 'success');
        } catch (e) {
            console.error(e);
            await addNotification('Erro', 'Falha ao atualizar projeto.', 'alert');
        }
    };

    const removeProductionProject = async (id: string) => {
        try { await deleteProductionProject(id); setProductionProjects(prev => prev.filter(p => p.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addEquipment = async (item: any) => {
        try { const e = await createEquipment(item); setEquipment(prev => [...prev, e]); }
        catch (e) { console.error(e); }
    };

    const updateEquipmentData = async (item: Equipment) => {
        try { const updated = await updateEquipment(item); setEquipment(prev => prev.map(e => e.id === updated.id ? updated : e)); }
        catch (e) { console.error(e); }
    };

    const removeEquipment = async (id: number) => {
        try { await deleteEquipment(id); setEquipment(prev => prev.filter(e => e.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addAssetAction = async (asset: any) => {
        try { const a = await createAsset(asset); setAssets(prev => [a, ...prev]); }
        catch (e) { console.error(e); }
    };

    const addSOPAction = async (sop: any) => {
        try {
            const newSop = await createSOP(sop);
            setSops(prev => [...prev, newSop]);
        } catch (e) { console.error(e); }
    };

    const updateSOPAction = async (sop: SOP) => {
        try {
            const updated = await updateSOP(sop);
            setSops(prev => prev.map(s => s.id === updated.id ? updated : s));
        } catch (e) { console.error(e); }
    };

    const removeSOPAction = async (id: number) => {
        try {
            await deleteSOP(id);
            setSops(prev => prev.filter(s => s.id !== id));
        } catch (e) { console.error(e); }
    };

    const addNotification = async (title: string, message: string, type: any) => {
        try { const n = await createNotification({ title, message, type, date: new Date().toISOString(), read: false, userId: currentUser?.id }); setNotifications(prev => [n, ...prev]); }
        catch (e) { console.error(e); }
    };

    const markNotificationRead = async (id: string) => {
        try {
            const n = notifications.find(x => x.id.toString() === id);
            if (n) {
                await supabase.from('notifications').update({ read: true }).eq('id', id);
                setNotifications(prev => prev.map(x => x.id.toString() === id ? { ...x, read: true } : x));
            }
        } catch (e) { console.error(e); }
    };

    const markAllNotificationsRead = async () => {
        try { await supabase.from('notifications').update({ read: true }).eq('user_id', currentUser?.id); setNotifications(prev => prev.map(n => ({ ...n, read: true }))); }
        catch (e) { console.error(e); }
    };

    const addActivity = async (actorId: string, action: string, target: string, type: any) => {
        try { const a = await createActivity({ actorId, action, target, date: new Date().toISOString(), type }); setActivities(prev => [a, ...prev]); }
        catch (e) { console.error(e); }
    };

    // Quality Actions
    const addQualityChecklist = async (checklist: any) => {
        try { const c = await createQualityChecklist(checklist); setQualityChecklists(prev => [...prev, c]); }
        catch (e) { console.error(e); }
    };

    const updateQualityChecklistData = async (checklist: QualityChecklist) => {
        try { const updated = await updateQualityChecklist(checklist); setQualityChecklists(prev => prev.map(c => c.id === updated.id ? updated : c)); }
        catch (e) { console.error(e); }
    };

    const removeQualityChecklist = async (id: string) => {
        try { await deleteQualityChecklist(id); setQualityChecklists(prev => prev.filter(c => c.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addClientApproval = async (approval: any) => {
        try { const a = await createClientApproval(approval); setClientApprovals(prev => [...prev, a]); }
        catch (e) { console.error(e); }
    };

    const updateClientApprovalData = async (approval: ClientApproval) => {
        try { const updated = await updateClientApproval(approval); setClientApprovals(prev => prev.map(a => a.id === updated.id ? updated : a)); }
        catch (e) { console.error(e); }
    };

    const removeClientApproval = async (id: string) => {
        try { await deleteClientApproval(id); setClientApprovals(prev => prev.filter(a => a.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addRevision = async (revision: any) => {
        try { const r = await createQualityRevision(revision); setRevisions(prev => [r, ...prev]); }
        catch (e) { console.error(e); }
    };

    // Delivery Actions
    const addDelivery = async (delivery: any, assetIds: number[]) => {
        try { const d = await createDelivery(delivery, assetIds); setDeliveries(prev => [...prev, d]); }
        catch (e) { console.error(e); }
    };

    const updateDeliveryData = async (delivery: Delivery) => {
        try { const updated = await updateDelivery(delivery); setDeliveries(prev => prev.map(d => d.id === updated.id ? updated : d)); }
        catch (e) { console.error(e); }
    };

    const removeDelivery = async (id: string) => {
        try { await deleteDelivery(id); setDeliveries(prev => prev.filter(d => d.id !== id)); }
        catch (e) { console.error(e); }
    };

    // RH & Performance Actions
    const addJobRole = async (role: any) => {
        try { const r = await createJobRole(role); setJobRoles(prev => [...prev, r]); }
        catch (e) { console.error(e); }
    };

    const updateJobRoleData = async (role: JobRole) => {
        try { const updated = await updateJobRole(role); setJobRoles(prev => prev.map(r => r.id === updated.id ? updated : r)); }
        catch (e) { console.error(e); }
    };

    const removeJobRole = async (id: string) => {
        try { await deleteJobRole(id); setJobRoles(prev => prev.filter(r => r.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addFreelancer = async (freelancer: any) => {
        try { const f = await createFreelancer(freelancer); setFreelancers(prev => [...prev, f]); }
        catch (e) { console.error(e); }
    };

    const updateFreelancerData = async (freelancer: Freelancer) => {
        try { const updated = await updateFreelancer(freelancer); setFreelancers(prev => prev.map(f => f.id === updated.id ? updated : f)); }
        catch (e) { console.error(e); }
    };

    const removeFreelancer = async (id: string) => {
        try { await deleteFreelancer(id); setFreelancers(prev => prev.filter(f => f.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addWeeklyReport = async (report: any) => {
        try { const r = await createWeeklyReport(report); setWeeklyReports(prev => [...prev, r]); }
        catch (e) { console.error(e); throw e; }
    };

    const updateWeeklyReportData = async (report: WeeklyReport) => {
        try { const updated = await updateWeeklyReport(report); setWeeklyReports(prev => prev.map(r => r.id === updated.id ? updated : r)); }
        catch (e) { console.error(e); }
    };

    const removeWeeklyReport = async (id: string) => {
        try { await deleteWeeklyReport(id); setWeeklyReports(prev => prev.filter(r => r.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addTraining = async (training: any) => {
        try { const t = await createTraining(training); setTrainings(prev => [...prev, t]); }
        catch (e) { console.error(e); }
    };

    const removeTraining = async (id: string) => {
        try { await deleteTraining(id); setTrainings(prev => prev.filter(t => t.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addCultureFeedback = async (feedback: any) => {
        try { const f = await createCultureFeedback(feedback); setCultureFeedbacks(prev => [...prev, f]); }
        catch (e) { console.error(e); }
    };

    const updateCultureFeedbackData = async (feedback: CultureFeedback) => {
        try { const updated = await updateCultureFeedback(feedback); setCultureFeedbacks(prev => prev.map(f => f.id === updated.id ? updated : f)); }
        catch (e) { console.error(e); }
    };

    const removeCultureFeedback = async (id: string) => {
        try { await deleteCultureFeedback(id); setCultureFeedbacks(prev => prev.filter(f => f.id !== id)); }
        catch (e) { console.error(e); }
    };

    const addAttendanceRecord = async (record: any) => {
        try { const r = await createAttendanceRecord(record); setAttendanceRecords(prev => [...prev, r]); }
        catch (e) { console.error(e); }
    };

    const updateAttendanceRecordData = async (record: AttendanceRecord) => {
        try { const updated = await updateAttendanceRecord(record); setAttendanceRecords(prev => prev.map(r => r.id === updated.id ? updated : r)); }
        catch (e) { console.error(e); }
    };

    const removeAttendanceRecord = async (id: string) => {
        try { await deleteAttendanceRecord(id); setAttendanceRecords(prev => prev.filter(r => r.id !== id)); }
        catch (e) { console.error(e); }
    };

    const value = {
        employees, leads, clients, teams, tasks, activities, notifications, reports, financialData, calendarEvents, goals,
        productionProjects, assets, equipment, sops, proposals, followUps, feedbacks, referrals, complaints, upsellOpportunities, importantDates,
        marketingMetrics, editorialContent, qualityChecklists, clientApprovals, revisions, deliveries,
        jobRoles, freelancers, weeklyReports, trainings, cultureFeedbacks, attendanceRecords,
        loading,
        addEmployee, updateEmployeeData, removeEmployee,
        addLead, updateLeadData, removeLead, addLeadNote, addLeadTask, toggleLeadTask, addLeadFile, convertLeadToClient,
        addProposal, updateProposalData, removeProposal,
        addFollowUp, removeFollowUp,
        addFeedback, removeFeedback, addReferral, removeReferral,
        addComplaint, removeComplaint, addUpsellOpportunity, removeUpsellOpportunity, addImportantDate, removeImportantDate,
        addMarketingMetric, removeMarketingMetric, addEditorialContent, updateEditorialContentData, removeEditorialContent,
        addClient, updateClientData, removeClient, addInteraction, addClientTag: addClientTagAction, removeClientTag: removeClientTagAction, createTag: createTagAction,
        addTransaction, updateTransactionData: updateTransactionDataAction, removeTransaction, toggleTransactionStatus, addBudget, updateBudget: updateBudgetAction, deleteBudget: deleteBudgetAction,
        addInternalBudget: addInternalBudgetAction, updateInternalBudget: updateInternalBudgetAction, deleteInternalBudget: deleteInternalBudgetAction,
        addTax, updateTax: updateTaxAction, deleteTax: deleteTaxAction, payTax,
        addReport, updateReport: updateReportAction,
        addGoal, updateGoal: updateGoalAction, deleteGoal: deleteGoalAction, addGoalUpdate,
        addEvent, updateEvent, deleteEvent,
        addTeam, updateTeamData, removeTeam,
        addProductionProject, updateProductionProjectData, removeProductionProject,
        addEquipment, updateEquipmentData, removeEquipment,
        addAsset: addAssetAction, addSOP: addSOPAction, updateSOP: updateSOPAction, removeSOP: removeSOPAction,
        addNotification, markNotificationRead, markAllNotificationsRead, addActivity,
        addQualityChecklist, updateQualityChecklistData, removeQualityChecklist,
        addClientApproval, updateClientApprovalData, removeClientApproval, addRevision,
        addDelivery, updateDeliveryData, removeDelivery,
        addJobRole, updateJobRoleData, removeJobRole,
        addFreelancer, updateFreelancerData, removeFreelancer,
        addWeeklyReport, updateWeeklyReportData, removeWeeklyReport,
        addTraining, removeTraining,
        addCultureFeedback, updateCultureFeedbackData, removeCultureFeedback,
        addAttendanceRecord, updateAttendanceRecordData, removeAttendanceRecord,
        refreshData
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
};
