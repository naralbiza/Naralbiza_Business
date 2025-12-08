import { supabase } from '../lib/supabase';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import {
    Lead, Client, Transaction, Report, Goal, CalendarEvent, Employee, Team,
    Activity, Notification, LeadNote, Task, FileAttachment, Interaction,
    GoalUpdate, Budget, ClientTag, Tax
} from '../types';

// Re-export supabase for use in other modules
export { supabase };

// Employees & Teams
export const mapEmployeeFromDB = (emp: any): Employee => ({
    ...emp,
    avatarUrl: emp.avatar_url,
    isAdmin: emp.is_admin,
    notificationPreferences: emp.notification_preferences || { emailOnNewLead: false, emailOnTaskDue: false }
});

export const getEmployees = async () => {
    try {
        const { data, error } = await supabase.from('employees').select('*');
        if (error) {
            console.error('Error fetching employees:', error);
            return [];
        }
        return data.map(mapEmployeeFromDB);
    } catch (error) {
        console.error('Unexpected error in getEmployees:', error);
        return [];
    }
};

export const createEmployee = async (employee: Omit<Employee, 'id' | 'avatarUrl' | 'notificationPreferences'>, userId?: string) => {
    const dbEmployee = {
        name: employee.name,
        position: employee.position,
        role: employee.role,
        is_admin: employee.isAdmin,
        email: employee.email,
        active: employee.active !== undefined ? employee.active : true,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random`,
        // notification_preferences column seems to be missing in DB, omitting for now
        user_id: userId
    };
    const { data, error } = await supabase.from('employees').insert(dbEmployee).select().single();
    if (error) throw error;
    return mapEmployeeFromDB(data);
};

export const updateEmployee = async (employee: Employee) => {
    const { avatarUrl, notificationPreferences, ...rest } = employee;
    const dbEmployee = {
        name: rest.name,
        position: rest.position,
        role: rest.role,
        is_admin: rest.isAdmin,
        email: rest.email,
        active: rest.active,
        avatar_url: avatarUrl,
        // notification_preferences: notificationPreferences
        // We generally don't update user_id
    };
    const { data, error } = await supabase.from('employees').update(dbEmployee).eq('id', employee.id).select().single();
    if (error) throw error;
    return mapEmployeeFromDB(data);
};

export const deleteEmployee = async (employeeId: number) => {
    // Soft delete: mark as inactive
    const { error } = await supabase.from('employees').update({ active: false }).eq('id', employeeId);
    if (error) throw error;
};

export const getTeams = async () => {
    const { data, error } = await supabase.from('teams').select('*');
    if (error) throw error;

    const teams = data as any[];
    const { data: members, error: membersError } = await supabase.from('team_members').select('*');
    if (membersError) throw membersError;

    return teams.map(team => ({
        ...team,
        memberIds: members.filter((m: any) => m.team_id === team.id).map((m: any) => m.employee_id)
    })) as Team[];
};

export const createTeam = async (team: Omit<Team, 'id'>) => {
    const { memberIds, ...teamData } = team;
    const { data, error } = await supabase.from('teams').insert(teamData).select().single();
    if (error) throw error;

    if (memberIds && memberIds.length > 0) {
        const members = memberIds.map(id => ({ team_id: data.id, employee_id: id }));
        const { error: memError } = await supabase.from('team_members').insert(members);
        if (memError) throw memError;
    }

    return { ...data, memberIds } as Team;
};

// Leads
const mapNoteFromDB = (note: any): LeadNote => ({
    ...note,
    authorId: note.author_id,
});

const mapTaskFromDB = (task: any): Task => ({
    ...task,
    dueDate: task.due_date,
});

const mapFileFromDB = (file: any): FileAttachment => ({
    ...file,
    uploadDate: file.upload_date,
});

const mapLeadFromDB = (lead: any): Lead => ({
    ...lead,
    ownerId: lead.owner_id,
    projectType: lead.project_type,
    convertedToClientId: lead.converted_to_client_id,
    notes: lead.notes?.map(mapNoteFromDB) || [],
    tasks: lead.tasks?.map(mapTaskFromDB) || [],
    files: lead.files?.map(mapFileFromDB) || [],
});

export const getLeads = async () => {
    const { data, error } = await supabase
        .from('leads')
        .select(`
            *,
            notes:lead_notes(*),
            tasks:tasks(*),
            files:lead_files(*)
        `);
    if (error) throw error;
    return data.map(mapLeadFromDB);
};

export const createLead = async (lead: Omit<Lead, 'id' | 'notes' | 'tasks' | 'files'>) => {
    const { ownerId, projectType, convertedToClientId, ...rest } = lead;
    const dbLead = {
        ...rest,
        owner_id: ownerId,
        project_type: projectType,
        converted_to_client_id: convertedToClientId
    };
    const { data, error } = await supabase.from('leads').insert(dbLead).select().single();
    if (error) throw error;
    return mapLeadFromDB({ ...data, notes: [], tasks: [], files: [] });
};

export const updateLead = async (lead: Lead) => {
    const { notes, tasks, files, ownerId, projectType, convertedToClientId, ...leadData } = lead; // Exclude relations from update
    const dbLead = {
        ...leadData,
        owner_id: ownerId,
        project_type: projectType,
        converted_to_client_id: convertedToClientId
    };
    const { data, error } = await supabase.from('leads').update(dbLead).eq('id', lead.id).select().single();
    if (error) throw error;
    return mapLeadFromDB({ ...data, notes, tasks, files });
};

export const createLeadNote = async (leadId: number, note: Omit<LeadNote, 'id'>) => {
    const { authorId, ...rest } = note;
    const dbNote = { ...rest, author_id: authorId, lead_id: leadId };
    const { data, error } = await supabase.from('lead_notes').insert(dbNote).select().single();
    if (error) throw error;
    return mapNoteFromDB(data);
};

export const createLeadTask = async (leadId: number, task: Omit<Task, 'id'>) => {
    const { dueDate, ...rest } = task;
    const dbTask = { ...rest, due_date: dueDate, lead_id: leadId };
    const { data, error } = await supabase.from('tasks').insert(dbTask).select().single();
    if (error) throw error;
    return mapTaskFromDB(data);
};

export const toggleLeadTask = async (taskId: number, completed: boolean) => {
    const { data, error } = await supabase.from('tasks').update({ completed }).eq('id', taskId).select().single();
    if (error) throw error;
    return mapTaskFromDB(data);
};

export const createLeadFile = async (leadId: number, file: Omit<FileAttachment, 'id'>) => {
    const { uploadDate, ...rest } = file;
    const dbFile = { ...rest, upload_date: uploadDate, lead_id: leadId };
    const { data, error } = await supabase.from('lead_files').insert(dbFile).select().single();
    if (error) throw error;
    return mapFileFromDB(data);
};

export const deleteLead = async (leadId: number) => {
    const { error } = await supabase.from('leads').delete().eq('id', leadId);
    if (error) throw error;
};

// Clients
const mapClientFromDB = (client: any): Client => ({
    ...client,
    totalRevenue: client.total_revenue,
    // interactionHistory and tags are handled in getClients or separate calls
});

export const getClients = async () => {
    const { data, error } = await supabase
        .from('clients')
        .select(`
            *,
            interactionHistory:interactions(*),
            tags:client_client_tags(tag_id)
        `);

    if (error) throw error;

    // We need to fetch the actual tag objects
    const { data: allTags, error: tagsError } = await supabase.from('client_tags').select('*');
    if (tagsError) throw tagsError;

    const tagsMap = new Map(allTags.map((t: any) => [t.id, t]));

    return data.map((client: any) => ({
        ...mapClientFromDB(client),
        interactionHistory: client.interactionHistory || [],
        tags: client.tags.map((t: any) => tagsMap.get(t.tag_id)).filter(Boolean)
    })) as Client[];
};

export const createClient = async (client: Omit<Client, 'id' | 'interactionHistory' | 'totalRevenue' | 'since'>) => {
    // Ensure we don't send extra fields that might be passed by mistake
    const { interactionHistory, tags, totalRevenue, since, ...rest } = client as any;
    const { data, error } = await supabase.from('clients').insert(rest).select().single();
    if (error) throw error;
    return { ...mapClientFromDB(data), interactionHistory: [], tags: [] } as Client;
};

export const updateClient = async (client: Client) => {
    const { interactionHistory, tags, totalRevenue, ...clientData } = client;
    const dbClient = {
        ...clientData,
        total_revenue: totalRevenue
    };
    const { data, error } = await supabase.from('clients').update(dbClient).eq('id', client.id).select().single();
    if (error) throw error;
    return { ...mapClientFromDB(data), interactionHistory, tags } as Client;
};

export const deleteClient = async (clientId: number) => {
    const { error } = await supabase.from('clients').delete().eq('id', clientId);
    if (error) throw error;
};

export const createInteraction = async (clientId: number, interaction: Omit<Interaction, 'id'>) => {
    const { data, error } = await supabase.from('interactions').insert({ ...interaction, client_id: clientId }).select().single();
    if (error) throw error;
    return data as Interaction;
};

// Financials
export const getTransactions = async () => {
    const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data as Transaction[];
};

export const createTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const { data, error } = await supabase.from('transactions').insert(transaction).select().single();
    if (error) throw error;
    return data as Transaction;
};

export const deleteTransaction = async (id: number) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
};

export const updateTransaction = async (transaction: Transaction) => {
    const { error } = await supabase.from('transactions').update(transaction).eq('id', transaction.id);
    if (error) throw error;
};

export const getBudgets = async () => {
    const { data, error } = await supabase.from('budgets').select('*');
    if (error) throw error;
    return data as Budget[];
};

// Reports
const mapReportFromDB = (report: any): Report => ({
    ...report,
    employeeId: report.employee_id,
    leadsContacted: report.leads_contacted,
    contractsSigned: report.contracts_signed,
    nextActions: report.next_actions,
    projectsShot: report.projects_shot,
    hoursOnLocation: report.hours_on_location,
    equipmentUsed: report.equipment_used,
    nextSteps: report.next_steps,
    ticketsResolved: report.tickets_resolved,
    systemsMaintenance: report.systems_maintenance,
    blockers: report.blockers,
});

export const getReports = async () => {
    const { data, error } = await supabase.from('reports').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data.map(mapReportFromDB);
};

export const createReport = async (report: Omit<Report, 'id'>) => {
    // We need to cast to any to access specific fields safely or just destructure known ones
    const r = report as any;

    const dbReport = {
        employee_id: r.employeeId,
        date: r.date,
        role: r.role,
        notes: r.notes,
        status: r.status,
        // Sales
        leads_contacted: r.leadsContacted,
        contracts_signed: r.contractsSigned,
        next_actions: r.nextActions,
        // Creative
        projects_shot: r.projectsShot,
        hours_on_location: r.hoursOnLocation,
        equipment_used: r.equipmentUsed,
        next_steps: r.nextSteps,
        // IT
        tickets_resolved: r.ticketsResolved,
        systems_maintenance: r.systemsMaintenance,
        blockers: r.blockers
    };

    const { data, error } = await supabase.from('reports').insert(dbReport).select().single();
    if (error) throw error;
    return mapReportFromDB(data);
};

export const updateReport = async (report: Report) => {
    const r = report as any;
    const dbReport = {
        employee_id: r.employeeId,
        date: r.date,
        role: r.role,
        notes: r.notes,
        status: r.status,
        // Sales
        leads_contacted: r.leadsContacted,
        contracts_signed: r.contractsSigned,
        next_actions: r.nextActions,
        // Creative
        projects_shot: r.projectsShot,
        hours_on_location: r.hoursOnLocation,
        equipment_used: r.equipmentUsed,
        next_steps: r.nextSteps,
        // IT
        tickets_resolved: r.ticketsResolved,
        systems_maintenance: r.systemsMaintenance,
        blockers: r.blockers
    };

    const { data, error } = await supabase.from('reports').update(dbReport).eq('id', report.id).select().single();
    if (error) throw error;
    return mapReportFromDB(data);
};

// Calendar
export const getCalendarEvents = async () => {
    const { data, error } = await supabase.from('calendar_events').select('*');
    if (error) throw error;

    const { data: attendees, error: attendeesError } = await supabase.from('event_attendees').select('*');
    if (attendeesError) throw attendeesError;

    return data.map((event: any) => ({
        ...event,
        responsibleId: event.responsible_id,
        attendeeIds: attendees.filter((a: any) => a.event_id === event.id).map((a: any) => a.employee_id)
    })) as CalendarEvent[];
};

export const createCalendarEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    const { attendeeIds, responsibleId, ...eventData } = event;
    const dbEvent = { ...eventData, responsible_id: responsibleId };
    const { data, error } = await supabase.from('calendar_events').insert(dbEvent).select().single();
    if (error) throw error;

    if (attendeeIds && attendeeIds.length > 0) {
        const attendees = attendeeIds.map(id => ({ event_id: data.id, employee_id: id }));
        const { error: attError } = await supabase.from('event_attendees').insert(attendees);
        if (attError) throw attError;
    }

    return { ...data, attendeeIds } as CalendarEvent;
};

export const updateCalendarEvent = async (event: CalendarEvent) => {
    const { attendeeIds, responsibleId, ...eventData } = event;
    const dbEvent = { ...eventData, responsible_id: responsibleId };
    const { data, error } = await supabase.from('calendar_events').update(dbEvent).eq('id', event.id).select().single();
    if (error) throw error;

    if (attendeeIds) {
        await supabase.from('event_attendees').delete().eq('event_id', event.id);
        if (attendeeIds.length > 0) {
            const attendees = attendeeIds.map(id => ({ event_id: event.id, employee_id: id }));
            await supabase.from('event_attendees').insert(attendees);
        }
    }

    return { ...data, attendeeIds } as CalendarEvent;
};

export const deleteCalendarEvent = async (eventId: number) => {
    const { error } = await supabase.from('calendar_events').delete().eq('id', eventId);
    if (error) throw error;
};

// Goals
const mapGoalFromDB = (goal: any): Goal => ({
    ...goal,
    employeeId: goal.employee_id,
    updates: goal.updates?.map(mapGoalUpdateFromDB) || [],
});

const mapGoalUpdateFromDB = (update: any): GoalUpdate => ({
    ...update,
    goalId: update.goal_id,
});

export const getGoals = async () => {
    const { data, error } = await supabase
        .from('goals')
        .select(`
            *,
            updates:goal_updates(*)
        `);
    if (error) throw error;
    return data.map(mapGoalFromDB);
};

export const createGoal = async (goal: Omit<Goal, 'id' | 'updates'>) => {
    const { employeeId, ...rest } = goal;
    const dbGoal = { ...rest, employee_id: employeeId };
    const { data, error } = await supabase.from('goals').insert(dbGoal).select().single();
    if (error) throw error;
    return mapGoalFromDB({ ...data, updates: [] });
};

export const updateGoal = async (goal: Goal) => {
    const { updates, employeeId, ...goalData } = goal;
    const dbGoal = { ...goalData, employee_id: employeeId };
    const { data, error } = await supabase.from('goals').update(dbGoal).eq('id', goal.id).select().single();
    if (error) throw error;
    return mapGoalFromDB({ ...data, updates });
};

export const deleteGoal = async (goalId: number) => {
    const { error } = await supabase.from('goals').delete().eq('id', goalId);
    if (error) throw error;
};

export const createGoalUpdate = async (goalId: number, update: GoalUpdate) => {
    const { data, error } = await supabase.from('goal_updates').insert({ ...update, goal_id: goalId }).select().single();
    if (error) throw error;
    return mapGoalUpdateFromDB(data);
};

// Notifications
export const getNotifications = async () => {
    const { data, error } = await supabase.from('notifications').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data as Notification[];
};

export const updateNotification = async (notification: Notification) => {
    const { data, error } = await supabase.from('notifications').update(notification).eq('id', notification.id).select().single();
    if (error) throw error;
    return data as Notification;
};

export const createNotification = async (notification: Omit<Notification, 'id'>) => {
    const { data, error } = await supabase.from('notifications').insert(notification).select().single();
    if (error) throw error;
    return data as Notification;
};

// Activities
const mapActivityFromDB = (activity: any): Activity => ({
    ...activity,
    actorId: activity.actor_id,
});

export const getActivities = async () => {
    const { data, error } = await supabase.from('activities').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data.map(mapActivityFromDB);
};

export const createActivity = async (activity: Omit<Activity, 'id'>) => {
    const { actorId, ...rest } = activity;
    const dbActivity = { ...rest, actor_id: actorId };
    const { data, error } = await supabase.from('activities').insert(dbActivity).select().single();
    if (error) throw error;
    return mapActivityFromDB(data);
};

// Budgets
export const createBudget = async (budget: Omit<Budget, 'id'>) => {
    const { data, error } = await supabase.from('budgets').insert(budget).select().single();
    if (error) throw error;
    return data as Budget;
};

export const updateBudget = async (budget: Budget) => {
    const { data, error } = await supabase.from('budgets').update(budget).eq('id', budget.id).select().single();
    if (error) throw error;
    return data as Budget;
};

export const deleteBudget = async (budgetId: number) => {
    const { error } = await supabase.from('budgets').delete().eq('id', budgetId);
    if (error) throw error;
};

// Client Tags
export const createTag = async (tag: Omit<ClientTag, 'id'>) => {
    const { data, error } = await supabase.from('client_tags').insert(tag).select().single();
    if (error) throw error;
    return data as ClientTag;
};

export const addClientTag = async (clientId: number, tagId: string) => {
    const { error } = await supabase.from('client_client_tags').insert({ client_id: clientId, tag_id: tagId });
    if (error) throw error;
};

export const removeClientTag = async (clientId: number, tagId: string) => {
    const { error } = await supabase.from('client_client_tags').delete().match({ client_id: clientId, tag_id: tagId });
    if (error) throw error;
};

// Taxes
export const getTaxes = async () => {
    const { data, error } = await supabase.from('taxes').select('*').order('due_date', { ascending: true });
    // Supabase usually uses snake_case. Let's assume due_date in DB.
    // But wait, I need to map it if I use camelCase in types.
    if (error) throw error;
    return data.map((t: any) => ({ ...t, dueDate: t.due_date })) as Tax[];
};

export const createTax = async (tax: Omit<Tax, 'id'>) => {
    const { dueDate, ...rest } = tax;
    const dbTax = { ...rest, due_date: dueDate };
    const { data, error } = await supabase.from('taxes').insert(dbTax).select().single();
    if (error) throw error;
    return { ...data, dueDate: data.due_date } as Tax;
};

export const updateTax = async (tax: Tax) => {
    const { dueDate, ...rest } = tax;
    const dbTax = { ...rest, due_date: dueDate };
    const { data, error } = await supabase.from('taxes').update(dbTax).eq('id', tax.id).select().single();
    if (error) throw error;
    return { ...data, dueDate: data.due_date } as Tax;
};

export const deleteTax = async (taxId: number) => {
    const { error } = await supabase.from('taxes').delete().eq('id', taxId);
    if (error) throw error;
};

export const createUser = async (email: string, password: string, employeeData: Omit<Employee, 'id' | 'avatarUrl' | 'notificationPreferences'>) => {
    console.log('[createUser] Starting creation for:', email);
    // 1. Create a temporary client to sign up the new user without logging out the current admin
    const tempSupabase = createSupabaseClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: authData, error: authError } = await tempSupabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: employeeData.name,
                role: employeeData.role,
            }
        }
    });

    if (authError) {
        console.error('[createUser] Auth error:', authError);
        if (authError.message.includes('already registered')) {
            throw new Error('Este email já está cadastrado no sistema de autenticação. Como os dados do funcionário foram apagados, você deve usar um email diferente para recriá-lo.');
        }
        throw authError;
    }

    if (authData.user) {
        // 2. Create Profile (Employee) linked to the Auth User
        console.log('[createUser] Auth user created:', authData.user.id);
        try {
            const newEmployee = await createEmployee({ ...employeeData, email, active: true }, authData.user.id);
            console.log('[createUser] Employee profile created:', newEmployee);
            return newEmployee;
        } catch (profileError) {
            console.error('[createUser] Failed to create employee profile:', profileError);
            // We can't rollback the Auth user creation easily from client.
            // But we should inform the caller.
            throw new Error(`User created in Auth but failed to create Profile: ${profileError instanceof Error ? profileError.message : 'Unknown error'}`);
        }
    } else {
        throw new Error('User created but no user object returned from Supabase Auth (check email confirmation settings).');
    }
};

export const uploadAvatar = async (file: File, userId: number): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

export const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password', // Ensure you have this route or just root
    });
    if (error) throw error;
};

// Additional missing functions for DataContext

export const getTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*').order('due_date', { ascending: true });
    if (error) throw error;
    return data.map(mapTaskFromDB);
};

export const getFinancialData = async () => {
    // This is a placeholder - you may want to customize this based on your needs
    const transactions = await getTransactions();
    const budgets = await getBudgets();

    // Calculate aggregates
    const revenue = transactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const profit = revenue - expenses;

    return {
        revenue,
        expenses,
        profit,
        pending: 0, // Placeholder - customize based on your business logic
        history: transactions
    };
};

export const updateTeam = async (team: Team) => {
    const { memberIds, ...teamData } = team;
    const { data, error } = await supabase.from('teams').update(teamData).eq('id', team.id).select().single();
    if (error) throw error;

    // Update team members
    await supabase.from('team_members').delete().eq('team_id', team.id);
    if (memberIds && memberIds.length > 0) {
        const members = memberIds.map(id => ({ team_id: team.id, employee_id: id }));
        await supabase.from('team_members').insert(members);
    }

    return { ...data, memberIds } as Team;
};

export const deleteTeam = async (teamId: number) => {
    const { error } = await supabase.from('teams').delete().eq('id', teamId);
    if (error) throw error;
};

