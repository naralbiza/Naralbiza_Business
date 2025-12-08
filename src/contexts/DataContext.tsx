import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    Employee, Lead, Client, Team, Task, Activity, Notification, Report, FinancialData, CalendarEvent, Goal,
    FileAttachment, Interaction, ClientTag, Transaction, Budget, Tax, GoalUpdate
} from '../types';
import {
    getEmployees, getLeads, getClients, getTeams, getTasks, getActivities, getNotifications, getReports, getCalendarEvents, getGoals,
    getTransactions, getBudgets, getTaxes,
    createEmployee, updateEmployee, deleteEmployee, uploadAvatar, createUser,
    createLead, updateLead, deleteLead,
    createClient, updateClient, deleteClient,
    createTeam, updateTeam, deleteTeam,
    createNotification, createActivity,
    createLeadNote, createLeadTask, toggleLeadTask as toggleLeadTaskAPI, createLeadFile,
    createInteraction,
    createTransaction, deleteTransaction, updateTransaction, createBudget, updateBudget, deleteBudget,
    createTax, updateTax, deleteTax,
    createReport, updateReport,
    createGoal, updateGoal, deleteGoal, createGoalUpdate,
    createCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
    createTag, addClientTag, removeClientTag
} from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
    employees: Employee[];
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
    loading: boolean;

    // Employee Actions
    addEmployee: (employee: Omit<Employee, 'id' | 'avatarUrl' | 'notificationPreferences'>, password?: string, avatarFile?: File) => Promise<void>;
    updateEmployeeData: (employee: Employee, avatarFile?: File) => Promise<void>;
    removeEmployee: (id: number) => Promise<void>;

    // Lead Actions
    addLead: (lead: Omit<Lead, 'id' | 'notes' | 'tasks' | 'files'>) => Promise<void>;
    updateLeadData: (lead: Lead) => Promise<void>;
    removeLead: (id: number) => Promise<void>;
    addLeadNote: (leadId: number, noteText: string) => Promise<void>;
    addLeadTask: (leadId: number, taskData: Omit<Task, 'id' | 'completed'>) => Promise<void>;
    toggleLeadTask: (leadId: number, taskId: number) => Promise<void>;
    addLeadFile: (leadId: number, fileData: Omit<FileAttachment, 'id'>) => Promise<void>;
    convertLeadToClient: (leadId: number) => Promise<void>;

    // Client Actions
    addClient: (client: Omit<Client, 'id' | 'interactionHistory' | 'totalRevenue' | 'since'>) => Promise<void>;
    updateClientData: (client: Client) => Promise<void>;
    removeClient: (id: number) => Promise<void>;
    addInteraction: (clientId: number, interaction: Omit<Interaction, 'id'>) => Promise<void>;
    addClientTag: (clientId: number, tagId: string) => Promise<void>;
    removeClientTag: (clientId: number, tagId: string) => Promise<void>;
    createTag: (tag: Omit<ClientTag, 'id'>) => Promise<void>;

    // Team Actions
    addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
    updateTeamData: (team: Team) => Promise<void>;
    removeTeam: (id: number) => Promise<void>;

    // Financial Actions
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    removeTransaction: (id: number) => Promise<void>;
    toggleTransactionStatus: (transaction: Transaction) => Promise<void>;
    addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
    updateBudget: (budget: Budget) => Promise<void>;
    deleteBudget: (id: number) => Promise<void>;
    addTax: (tax: Omit<Tax, 'id'>) => Promise<void>;
    updateTax: (tax: Tax) => Promise<void>;
    deleteTax: (id: number) => Promise<void>;
    payTax: (tax: Tax) => Promise<void>;

    // Report Actions
    addReport: (report: Omit<Report, 'id'>) => Promise<void>;
    updateReport: (report: Report) => Promise<void>;

    // Goal Actions
    addGoal: (goal: Omit<Goal, 'id' | 'updates'>) => Promise<void>;
    updateGoal: (goal: Goal) => Promise<void>;
    deleteGoal: (id: number) => Promise<void>;
    addGoalUpdate: (goalId: number, update: GoalUpdate) => Promise<void>;

    // Agenda Actions
    addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
    updateEvent: (event: CalendarEvent) => Promise<void>;
    deleteEvent: (id: number) => Promise<void>;

    // Notification Actions
    addNotification: (title: string, message: string, type: 'alert' | 'success' | 'info') => Promise<void>;
    markNotificationRead: (id: number) => Promise<void>;
    markAllNotificationsRead: () => Promise<void>;

    // Activity Actions
    addActivity: (actorId: number, action: string, target: string, type: Activity['type']) => Promise<void>;

    refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [financialData, setFinancialData] = useState<FinancialData>({
        revenue: [],
        expenses: [],
        taxes: [],
        cashFlowForecast: [],
        labels: [],
        transactions: [],
        budgets: [],
        taxRecords: []
    });
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        setLoading(true);
        try {
            const [
                emps, lds, cls, tms, tsks, acts, notifs, reps, evts, gls,
                trans, buds, txs
            ] = await Promise.all([
                getEmployees(), getLeads(), getClients(), getTeams(), getTasks(), getActivities(), getNotifications(), getReports(), getCalendarEvents(), getGoals(),
                getTransactions(), getBudgets(), getTaxes()
            ]);

            setEmployees(emps);
            setLeads(lds);
            setClients(cls);
            setTeams(tms);
            setTasks(tsks);
            setActivities(acts);
            setNotifications(notifs);
            setReports(reps);
            setCalendarEvents(evts);
            setGoals(gls);

            // Calculate financial aggregates
            const currentYear = new Date().getFullYear();
            const revenue = new Array(12).fill(0);
            const expenses = new Array(12).fill(0);
            const taxes = new Array(12).fill(0);
            const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

            trans.forEach(t => {
                const date = new Date(t.date);
                // Only count active transactions (default is true if undefined)
                if (t.active !== false && date.getFullYear() === currentYear) {
                    const month = date.getMonth();
                    if (t.type === 'revenue') {
                        revenue[month] += t.amount;
                    } else if (t.type === 'expense') {
                        expenses[month] += t.amount;
                        if (t.category === 'Impostos' || t.description.toLowerCase().includes('imposto')) {
                            taxes[month] += t.amount;
                        }
                    }
                }
            });

            // Simple cash flow forecast
            const lastMonthRevenue = revenue[new Date().getMonth()] || 0;
            const cashFlowForecast = [lastMonthRevenue, lastMonthRevenue * 1.05, lastMonthRevenue * 1.1, lastMonthRevenue * 1.15, lastMonthRevenue * 1.2, lastMonthRevenue * 1.25];

            setFinancialData({
                revenue,
                expenses,
                taxes,
                cashFlowForecast,
                labels,
                transactions: trans,
                budgets: buds,
                taxRecords: txs
            });

            // Check for due taxes and generate notifications
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (const tax of txs) {
                if (tax.status === 'Pending') {
                    const dueDate = new Date(tax.dueDate);
                    dueDate.setHours(0, 0, 0, 0);
                    const diffTime = dueDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays <= 3 && diffDays >= 0) {
                        const title = `Imposto a Vencer: ${tax.name}`;
                        // Check if notification already exists locally (to avoid spam in this session)
                        // Ideally we should check on server, but checking loaded notifications is a good start
                        const exists = notifs.some(n => n.title === title && !n.read);

                        if (!exists) {
                            await createNotification({
                                userId: currentUser?.id || 0, // Should be assigned to specific user or admin, defaulting to current
                                title,
                                message: `O imposto ${tax.name} vence em ${diffDays === 0 ? 'hoje' : diffDays + ' dias'} (Kz ${tax.amount.toLocaleString('pt-BR')}).`,
                                type: 'alert',
                                read: false,
                                date: new Date().toISOString()
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            refreshData();
        }
    }, [currentUser]);

    // --- Actions ---

    const addNotification = async (title: string, message: string, type: 'alert' | 'success' | 'info') => {
        if (!currentUser) return;
        try {
            await createNotification({
                userId: currentUser.id,
                title,
                message,
                type,
                read: false,
                date: new Date().toISOString()
            });
            const notifs = await getNotifications();
            setNotifications(notifs);
        } catch (error) {
            console.error("Error adding notification:", error);
        }
    };

    const addActivity = async (actorId: number, action: string, target: string, type: Activity['type']) => {
        try {
            await createActivity({
                actorId,
                action,
                target,
                type,
                date: new Date().toISOString()
            });
            const acts = await getActivities();
            setActivities(acts);
        } catch (error) {
            console.error("Error adding activity:", error);
        }
    };

    const addEmployee = async (employee: Omit<Employee, 'id' | 'avatarUrl' | 'notificationPreferences'>, password?: string, avatarFile?: File) => {
        try {
            let newEmployee;
            if (password) {
                newEmployee = await createUser(employee.email, password, employee);
            } else {
                newEmployee = await createEmployee(employee);
            }

            if (newEmployee && avatarFile) {
                try {
                    const avatarUrl = await uploadAvatar(avatarFile, newEmployee.id);
                    await updateEmployee({ ...newEmployee, avatarUrl });
                } catch (error) {
                    console.error("Error uploading avatar:", error);
                    await addNotification('Aviso', 'Funcionário criado, mas erro ao enviar foto.', 'alert');
                }
            }

            await refreshData();
            await addNotification('Sucesso', `Funcionário ${employee.name} adicionado.`, 'success');
        } catch (error: any) {
            console.error("Error adding employee:", error);
            alert(`Erro ao adicionar funcionário: ${error.message || 'Erro desconhecido'}`);
            throw error;
        }
    };

    const updateEmployeeData = async (employee: Employee, avatarFile?: File) => {
        try {
            let employeeToSave = employee;
            if (avatarFile) {
                try {
                    const avatarUrl = await uploadAvatar(avatarFile, employee.id);
                    employeeToSave = { ...employee, avatarUrl };
                } catch (error) {
                    console.error("Error uploading avatar:", error);
                    await addNotification('Aviso', 'Erro ao enviar nova foto.', 'alert');
                }
            }
            await updateEmployee(employeeToSave);
            await refreshData();
        } catch (error) {
            console.error("Error updating employee:", error);
            alert("Erro ao atualizar funcionário.");
            throw error;
        }
    };

    const removeEmployee = async (id: number) => {
        if (window.confirm('Tem certeza que deseja remover este funcionário?')) {
            try {
                await deleteEmployee(id);
                await refreshData();
            } catch (error) {
                console.error("Error removing employee:", error);
                alert("Erro ao remover funcionário.");
                throw error;
            }
        }
    };

    const addLead = async (lead: Omit<Lead, 'id' | 'notes' | 'tasks' | 'files'>) => {
        try {
            const newLead = await createLead(lead);
            await refreshData();
            if (currentUser) {
                await addActivity(currentUser.id, 'adicionou o lead', newLead.name, 'lead');
            }
            await addNotification('Sucesso', 'Novo lead criado.', 'success');
        } catch (error) {
            console.error("Error adding lead:", error);
            alert("Erro ao criar lead.");
        }
    };

    const updateLeadData = async (lead: Lead) => {
        try {
            await updateLead(lead);
            await refreshData();
        } catch (error) {
            console.error("Error updating lead:", error);
        }
    };

    const removeLead = async (id: number) => {
        if (window.confirm('Tem certeza que deseja remover este lead?')) {
            try {
                const lead = leads.find(l => l.id === id);
                await deleteLead(id);
                await refreshData();
                if (currentUser && lead) {
                    await addActivity(currentUser.id, 'apagou o lead', lead.name, 'lead');
                }
            } catch (error) {
                console.error("Error removing lead:", error);
            }
        }
    };

    const addLeadNote = async (leadId: number, noteText: string) => {
        if (!currentUser) return;
        try {
            await createLeadNote(leadId, { text: noteText, authorId: currentUser.id, date: new Date().toISOString() });
            // Optimistic update or refresh
            await refreshData();
        } catch (error) {
            console.error("Error adding note:", error);
        }
    };

    const addLeadTask = async (leadId: number, taskData: Omit<Task, 'id' | 'completed'>) => {
        try {
            await createLeadTask(leadId, { ...taskData, completed: false });
            await refreshData();
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const toggleLeadTask = async (leadId: number, taskId: number) => {
        const lead = leads.find(l => l.id === leadId);
        const task = lead?.tasks.find(t => t.id === taskId);
        if (!task) return;
        try {
            await toggleLeadTaskAPI(taskId, !task.completed);
            await refreshData();
        } catch (error) {
            console.error("Error toggling task:", error);
        }
    };

    const addLeadFile = async (leadId: number, fileData: Omit<FileAttachment, 'id'>) => {
        try {
            await createLeadFile(leadId, fileData);
            await refreshData();
        } catch (error) {
            console.error("Error adding file:", error);
        }
    };

    const convertLeadToClient = async (leadId: number) => {
        const lead = leads.find(l => l.id === leadId);
        if (!lead || lead.convertedToClientId) return;

        try {
            const newClientData = {
                name: lead.name,
                company: lead.company,
                email: lead.email,
                phone: lead.phone,
                since: new Date().toISOString().split('T')[0],
                totalRevenue: lead.value,
                status: 'Ativo' as const,
                tags: [],
            };

            const newClient = await createClient(newClientData);
            const updatedLead = { ...lead, status: 'Finalizado' as any, convertedToClientId: newClient.id }; // Using 'Finalizado' matching LeadStatus.Closed
            await updateLead(updatedLead);

            await refreshData();

            if (currentUser) {
                await addActivity(currentUser.id, 'converteu o lead em cliente', lead.name, 'client');
            }
        } catch (error) {
            console.error("Error converting lead:", error);
        }
    };

    const addClient = async (clientData: Omit<Client, 'id' | 'interactionHistory' | 'totalRevenue' | 'since'>) => {
        try {
            const newClientData = {
                ...clientData,
                since: new Date().toISOString().split('T')[0],
                totalRevenue: 0,
                interactionHistory: [],
                tags: []
            };
            await createClient(newClientData);
            await refreshData();
            await addNotification('Sucesso', 'Novo cliente adicionado.', 'success');
        } catch (error) {
            console.error("Error adding client:", error);
        }
    };

    const updateClientData = async (client: Client) => {
        try {
            await updateClient(client);
            await refreshData();
        } catch (error) {
            console.error("Error updating client:", error);
        }
    };

    const removeClient = async (id: number) => {
        if (window.confirm('Tem certeza que deseja remover este cliente?')) {
            try {
                await deleteClient(id);
                await refreshData();
            } catch (error) {
                console.error("Error removing client:", error);
            }
        }
    };

    const addInteraction = async (clientId: number, interaction: Omit<Interaction, 'id'>) => {
        try {
            await createInteraction(clientId, interaction);
            await refreshData();
        } catch (error) {
            console.error("Error adding interaction:", error);
        }
    };

    const addClientTagAction = async (clientId: number, tagId: string) => {
        try {
            await addClientTag(clientId, tagId);
            await refreshData();
        } catch (error) {
            console.error("Error adding client tag:", error);
        }
    };

    const removeClientTagAction = async (clientId: number, tagId: string) => {
        try {
            await removeClientTag(clientId, tagId);
            await refreshData();
        } catch (error) {
            console.error("Error removing client tag:", error);
        }
    };

    const createTagAction = async (tag: Omit<ClientTag, 'id'>) => {
        try {
            await createTag(tag);
            await refreshData();
        } catch (error) {
            console.error("Error creating tag:", error);
        }
    };

    // Financials
    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        try {
            await createTransaction(transaction);
            await refreshData();
            await addNotification('Sucesso', 'Transação adicionada.', 'success');
        } catch (error) {
            console.error("Error adding transaction:", error);
            alert("Erro ao adicionar transação.");
        }
    };

    const removeTransaction = async (id: number) => {
        try {
            await deleteTransaction(id);
            await refreshData();
            await addNotification('Sucesso', 'Transação removida.', 'success');
        } catch (error) {
            console.error("Error removing transaction:", error);
            alert("Erro ao remover transação.");
        }
    };

    const toggleTransactionStatus = async (transaction: Transaction) => {
        try {
            const updatedTransaction = { ...transaction, active: transaction.active === false ? true : false };
            await updateTransaction(updatedTransaction);
            await refreshData();
            await addNotification('Sucesso', `Transação ${updatedTransaction.active ? 'ativada' : 'desativada'}.`, 'success');
        } catch (error) {
            console.error("Error toggling transaction status:", error);
            alert("Erro ao alterar status da transação.");
        }
    };

    const addBudget = async (budget: Omit<Budget, 'id'>) => {
        try {
            await createBudget(budget);
            await refreshData();
        } catch (error) {
            console.error("Error creating budget:", error);
        }
    };

    const updateBudgetAction = async (budget: Budget) => {
        try {
            await updateBudget(budget);
            await refreshData();
        } catch (error) {
            console.error("Error updating budget:", error);
        }
    };

    const deleteBudgetAction = async (id: number) => {
        try {
            await deleteBudget(id);
            await refreshData();
        } catch (error) {
            console.error("Error deleting budget:", error);
        }
    };

    const addTax = async (tax: Omit<Tax, 'id'>) => {
        try {
            await createTax(tax);
            await refreshData();
        } catch (error) {
            console.error("Error creating tax:", error);
        }
    };

    const updateTaxAction = async (tax: Tax) => {
        try {
            await updateTax(tax);
            await refreshData();
        } catch (error) {
            console.error("Error updating tax:", error);
        }
    };

    const deleteTaxAction = async (id: number) => {
        try {
            await deleteTax(id);
            await refreshData();
        } catch (error) {
            console.error("Error deleting tax:", error);
        }
    };

    const payTax = async (tax: Tax) => {
        try {
            const paidTax = { ...tax, status: 'Paid' as const };
            const savedTax = await updateTax(paidTax);
            await refreshData();
            await addNotification('Imposto Pago', `Imposto ${savedTax.name} marcado como pago.`, 'success');

            if (window.confirm('Deseja criar uma transação de despesa para este pagamento?')) {
                await addTransaction({
                    description: `Pagamento de Imposto: ${savedTax.name}`,
                    amount: savedTax.amount,
                    date: new Date().toISOString().split('T')[0],
                    type: 'expense',
                    category: 'Impostos'
                });
            }
        } catch (error) {
            console.error("Error paying tax:", error);
        }
    };

    // Reports
    const addReport = async (report: Omit<Report, 'id'>) => {
        try {
            await createReport(report);
            await refreshData();
            await addNotification('Novo Relatório', `Relatório gerado.`, 'info');
        } catch (error) {
            console.error("Error creating report:", error);
        }
    };

    const updateReportAction = async (report: Report) => {
        try {
            await updateReport(report);
            await refreshData();
        } catch (error) {
            console.error("Error updating report:", error);
        }
    };

    // Goals
    const addGoal = async (goal: Omit<Goal, 'id' | 'updates'>) => {
        try {
            await createGoal(goal);
            await refreshData();
        } catch (error) {
            console.error("Error creating goal:", error);
        }
    };

    const updateGoalAction = async (goal: Goal) => {
        try {
            await updateGoal(goal);
            await refreshData();
        } catch (error) {
            console.error("Error updating goal:", error);
        }
    };

    const deleteGoalAction = async (id: number) => {
        if (window.confirm('Tem certeza que deseja remover esta meta?')) {
            try {
                await deleteGoal(id);
                await refreshData();
            } catch (error) {
                console.error("Error deleting goal:", error);
            }
        }
    };

    const addGoalUpdate = async (goalId: number, update: GoalUpdate) => {
        try {
            await createGoalUpdate(goalId, update);
            await refreshData();
        } catch (error) {
            console.error("Error adding goal update:", error);
        }
    };

    // Agenda
    const addEvent = async (event: Omit<CalendarEvent, 'id'>) => {
        try {
            const newEvent = await createCalendarEvent(event);
            await refreshData();
            await addNotification('Novo Evento', `Evento ${newEvent.title} criado.`, 'info');
        } catch (error) {
            console.error("Error creating event:", error);
        }
    };

    const updateEvent = async (event: CalendarEvent) => {
        try {
            await updateCalendarEvent(event);
            await refreshData();
        } catch (error) {
            console.error("Error updating event:", error);
        }
    };

    const deleteEvent = async (id: number) => {
        if (window.confirm('Tem certeza que deseja remover este evento?')) {
            try {
                await deleteCalendarEvent(id);
                await refreshData();
            } catch (error) {
                console.error("Error deleting event:", error);
            }
        }
    };

    const addTeam = async (team: Omit<Team, 'id'>) => {
        try {
            await createTeam(team);
            await refreshData();
        } catch (error) {
            console.error("Error adding team:", error);
        }
    };

    const updateTeamData = async (team: Team) => {
        try {
            await updateTeam(team);
            await refreshData();
        } catch (error) {
            console.error("Error updating team:", error);
        }
    };

    const removeTeam = async (id: number) => {
        try {
            await deleteTeam(id);
            await refreshData();
        } catch (error) {
            console.error("Error removing team:", error);
        }
    };

    const markNotificationRead = async (id: number) => {
        // Implement API call if needed, or just local state
        // For now, let's assume we update local state and maybe API
        // await updateNotification(id, { read: true }); 
        // We need updateNotification in api.ts
        // For now, just refresh
        await refreshData();
    };

    const markAllNotificationsRead = async () => {
        // await markAllRead();
        await refreshData();
    };

    const value = {
        employees, leads, clients, teams, tasks, activities, notifications, reports, financialData, calendarEvents, goals,
        loading,
        addEmployee, updateEmployeeData, removeEmployee,
        addLead, updateLeadData, removeLead, addLeadNote, addLeadTask, toggleLeadTask, addLeadFile, convertLeadToClient,
        addClient, updateClientData, removeClient, addInteraction, addClientTag: addClientTagAction, removeClientTag: removeClientTagAction, createTag: createTagAction,
        addTransaction, addBudget, updateBudget: updateBudgetAction, deleteBudget: deleteBudgetAction, addTax, updateTax: updateTaxAction, deleteTax: deleteTaxAction, payTax,
        addReport, updateReport: updateReportAction,
        addGoal, updateGoal: updateGoalAction, deleteGoal: deleteGoalAction, addGoalUpdate,
        addEvent, updateEvent, deleteEvent,
        addTeam, updateTeamData, removeTeam,
        addNotification, markNotificationRead, markAllNotificationsRead,
        addActivity,
        refreshData
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
