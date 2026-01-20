import { supabase } from '../lib/supabase';
export { supabase };
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import {
    User, Employee, Lead, Client, Team, Task, Activity, Notification, Report, FinancialData, CalendarEvent, Goal,
    FileAttachment, Interaction, ClientTag, Transaction, Budget, Tax, GoalUpdate,
    ProductionProject, Asset, Equipment, SOP, ProductionStatus, ProjectType,
    Proposal, FollowUp, LeadStatus, Feedback, Referral,
    MarketingMetric, EditorialContent,
    QualityChecklist, ClientApproval, Revision,
    Delivery, Complaint, UpsellOpportunity, ImportantDate,
    JobRole, Freelancer, WeeklyReport, Training, CultureFeedback, AttendanceRecord,
    InternalBudget, ModulePermission
} from '../types';
import { withRetry } from '../utils/retry';
export { withRetry };

// --- Mappers ---
// --- Mappers ---
export const mapUserFromDB = (u: any): User => ({
    id: u.id,
    name: u.name,
    email: u.email,
    active: u.active,
    role: u.role,
    sector: u.sector,
    avatarUrl: u.avatar_url,
    permissions: u.permissions ? u.permissions.map(mapPermissionFromDB) : [],
    department: u.department,
    contractType: u.contract_type,
    admissionDate: u.admission_date,
    supervisorId: u.supervisor_id
});

export const mapEmployeeFromDB = mapUserFromDB;

export const mapLeadFromDB = (l: any): Lead => ({
    id: l.id,
    name: l.name,
    company: l.company,
    position: l.position,
    email: l.email,
    phone: l.phone,
    source: l.source,
    priority: l.priority,
    status: l.status,
    ownerId: l.owner_id,
    projectType: l.project_type,
    value: l.value,
    probability: l.probability,
    expectedCloseDate: l.expected_close_date,
    notes: l.notes || [],
    tasks: l.tasks || [],
    files: l.files || [],
    convertedToClientId: l.converted_to_client_id,
    internalNotes: l.internal_notes,
    lastStatusChangeAt: l.last_status_change_at,
    createdAt: l.created_at,
    updatedAt: l.updated_at
});

export const mapClientFromDB = (c: any): Client => ({
    id: c.id,
    name: c.name,
    company: c.company,
    email: c.email,
    phone: c.phone,
    since: c.since,
    totalRevenue: c.total_revenue !== undefined ? c.total_revenue : (c.totalRevenue || 0),
    status: c.status,
    tags: c.tags || c.client_tags || [], // client.tags is preserved if passed
    interactionHistory: c.interactions || c.interactionHistory || [],
    birthday: c.birthday,
    importantDates: (c.important_dates ? c.important_dates.map(mapImportantDateFromDB) : (c.importantDates || [])),
    complaints: (c.complaints ? c.complaints.map(mapComplaintFromDB) : (c.complaints || [])),
    feedbacks: (c.feedbacks ? c.feedbacks.map(mapFeedbackFromDB) : (c.feedbacks || [])),
    upsellOpportunities: (c.upsell_opportunities ? c.upsell_opportunities.map(mapUpsellOpportunityFromDB) : (c.upsellOpportunities || [])),
    projects: c.links || c.projects || c.production_projects || []
});

// ... (lines 80-535 skipped)



export const mapFeedbackFromDB = (f: any): Feedback => ({
    id: f.id,
    clientId: f.client_id,
    projectId: f.project_id,
    rating: f.rating,
    comment: f.comment,
    testimonial: f.testimonial,
    status: f.status,
    date: f.date || f.created_at
});

export const mapFeedbackToDB = (f: Partial<Feedback>) => ({
    client_id: f.clientId,
    project_id: f.projectId,
    rating: f.rating,
    comment: f.comment,
    testimonial: f.testimonial,
    status: f.status,
    date: f.date
});

export const mapComplaintFromDB = (c: any): Complaint => ({
    id: c.id,
    clientId: c.client_id,
    date: c.date,
    description: c.description,
    status: c.status,
    severity: c.severity
});

export const mapComplaintToDB = (c: Partial<Complaint>) => ({
    client_id: c.clientId,
    date: c.date,
    description: c.description,
    status: c.status,
    severity: c.severity
});

export const mapUpsellOpportunityFromDB = (o: any): UpsellOpportunity => ({
    id: o.id,
    clientId: o.client_id,
    date: o.date,
    description: o.description,
    value: Number(o.value) || 0,
    status: o.status
});

export const mapUpsellOpportunityToDB = (o: Partial<UpsellOpportunity>) => ({
    client_id: o.clientId,
    date: o.date,
    description: o.description,
    value: o.value,
    status: o.status
});

export const mapProductionProjectFromDB = (p: any): ProductionProject => ({
    id: String(p.id),
    clientId: String(p.client_id),
    title: p.title,
    type: p.type as ProjectType,
    status: p.status as ProductionStatus,
    startDate: p.start_date,
    deadline: p.deadline,
    responsibleId: p.responsible_id,
    teamIds: p.team_ids || [],
    progress: p.progress || 0,
    budget: Number(p.budget) || 0,
    actualCost: Number(p.actual_cost) || 0,
    notes: p.notes,
    folderUrl: p.folder_url
});

export const mapProductionProjectToDB = (p: Partial<ProductionProject>) => {
    const db: any = {};
    if (p.clientId !== undefined) db.client_id = p.clientId;
    if (p.title !== undefined) db.title = p.title;
    if (p.type !== undefined) db.type = p.type;
    if (p.status !== undefined) db.status = p.status;
    if (p.startDate !== undefined) db.start_date = p.startDate;
    if (p.deadline !== undefined) db.deadline = p.deadline;
    if (p.responsibleId !== undefined) db.responsible_id = p.responsibleId;
    if (p.teamIds !== undefined) db.team_ids = p.teamIds;
    if (p.progress !== undefined) db.progress = p.progress;
    if (p.budget !== undefined) db.budget = p.budget;
    if (p.actualCost !== undefined) db.actual_cost = p.actualCost;
    if (p.notes !== undefined) db.notes = p.notes;
    if (p.folderUrl !== undefined) db.folder_url = p.folderUrl;
    return db;
};

export const mapImportantDateFromDB = (d: any): ImportantDate => ({
    id: d.id,
    clientId: d.client_id,
    date: d.date,
    description: d.description,
    type: d.type
});

export const mapNotificationFromDB = (n: any): Notification => ({
    id: n.id,
    userId: n.user_id,
    title: n.title,
    message: n.message,
    date: n.date,
    read: n.read,
    type: n.type
});

export const mapNotificationToDB = (n: Partial<Notification>) => ({
    user_id: n.userId,
    title: n.title,
    message: n.message,
    date: n.date,
    read: n.read,
    type: n.type
});

export const mapActivityFromDB = (a: any): Activity => ({
    id: a.id,
    actorId: a.actor_id,
    action: a.action,
    target: a.target,
    date: a.date,
    type: a.type
});

export const mapActivityToDB = (a: Partial<Activity>) => ({
    actor_id: a.actorId,
    action: a.action,
    target: a.target,
    date: a.date,
    type: a.type
});

export const mapGoalFromDB = (g: any): Goal => ({
    id: g.id,
    title: g.title,
    target: Number(g.target) || 0,
    current: Number(g.current) || 0,
    type: g.type,
    employeeId: g.employee_id,
    unit: g.unit,
    deadline: g.deadline,
    updates: g.updates || []
});

export const mapGoalToDB = (g: Partial<Goal>) => ({
    title: g.title,
    target: g.target,
    current: g.current,
    type: g.type,
    employee_id: g.employeeId,
    unit: g.unit,
    deadline: g.deadline,
    updates: g.updates
});

export const mapImportantDateToDB = (d: Partial<ImportantDate>) => ({
    client_id: d.clientId,
    date: d.date,
    description: d.description,
    type: d.type
});

export const mapReferralToDB = (r: Partial<Referral>) => ({
    client_id: r.referrerClientId,
    referred_client_name: r.referredClientName,
    status: r.status,
    reward_status: r.rewardStatus,
    notes: r.notes,
    date: r.date
});

export const mapJobRoleToDB = (r: Partial<JobRole>) => ({
    name: r.name,
    description: r.description,
    kpis: r.kpis
});

export const mapFreelancerToDB = (f: Partial<Freelancer>) => ({
    name: f.name,
    main_function: f.mainFunction,
    associated_projects: f.associatedProjects,
    average_rating: f.averageRating,
    availability: f.availability,
    usage_frequency: f.usageFrequency
});

export const mapWeeklyReportToDB = (r: Partial<WeeklyReport>) => ({
    employee_id: r.employeeId,
    week_start_date: r.weekStartDate,
    week_end_date: r.weekEndDate,
    role_id: r.roleId,
    projects_worked: r.projectsWorked,
    hours_worked: r.hoursWorked,
    deliveries_made: r.deliveriesMade,
    difficulty_level: r.difficultyLevel,
    self_evaluation: r.selfEvaluation,
    main_challenges: r.mainChallenges,
    improvement_notes: r.improvementNotes,
    absences_count: r.absencesCount,
    absence_type: r.absenceType,
    attendance_notes: r.attendanceNotes,
    week_evaluation: r.weekEvaluation,
    motivation_level: r.motivationLevel,
    feedback_text: r.feedbackText,
    confirmed: r.confirmed
});

export const mapTrainingToDB = (t: Partial<Training>) => ({
    employee_id: t.employeeId,
    title: t.title,
    type: t.type,
    date: t.date,
    impact_level: t.impactLevel,
    notes: t.notes
});

export const mapCultureFeedbackToDB = (f: Partial<CultureFeedback>) => ({
    employee_id: f.employeeId,
    anonymous: f.anonymous,
    motivation_score: f.motivationScore,
    satisfaction_score: f.satisfactionScore,
    feedback_text: f.feedbackText,
    date: f.date
});

export const mapAttendanceRecordFromDB = (data: any): AttendanceRecord => ({
    id: data.id,
    employeeId: data.employee_id,
    date: data.date,
    type: data.type,
    reason: data.reason,
    durationMinutes: Number(data.duration_minutes) || 0,
    status: data.status,
    createdAt: data.created_at
});

export const mapAttendanceRecordToDB = (r: Partial<AttendanceRecord>) => ({
    employee_id: r.employeeId,
    date: r.date,
    type: r.type,
    reason: r.reason,
    duration_minutes: r.durationMinutes,
    status: r.status
});

export const mapCalendarEventFromDB = (e: any): CalendarEvent => ({
    id: e.id,
    title: e.titulo,
    description: e.descricao,
    startDate: e.data_inicio,
    endDate: e.data_fim,
    location: e.local,
    status: e.status,
    type: e.tipo,
    responsibleId: e.responsible_id,
    attendeeIds: e.attendee_ids || []
});

export const mapCalendarEventToDB = (e: Partial<CalendarEvent>) => ({
    titulo: e.title,
    descricao: e.description,
    data_inicio: e.startDate,
    data_fim: e.endDate,
    local: e.location,
    status: e.status,
    tipo: e.type,
    responsible_id: e.responsibleId,
    attendee_ids: e.attendeeIds
});

export const mapReferralFromDB = (r: any): Referral => ({
    ...r,
    // Correctly map based on types.ts Referral interface
    referrerClientId: r.client_id,
    referredClientName: r.referred_client_name || String(r.referred_client_id || ''), // Fallback
    date: r.date,
    status: r.status,
    rewardStatus: r.reward_status,
    notes: r.notes
});

const mapPermissionFromDB = (p: any): ModulePermission => ({
    id: p.id,
    module: p.module,
    canView: p.can_view,
    canCreate: p.can_create,
    canEdit: p.can_edit,
    canApprove: p.can_approve,
    roleId: p.role_id,
    userId: p.user_id
});

export const mapTransactionFromDB = (t: any): Transaction => ({
    id: t.id,
    date: t.date,
    amount: Number(t.amount) || 0,
    category: t.category,
    description: t.description,
    type: t.type,
    status: t.status,
    active: t.active,
    dueDate: t.due_date,
    issueDate: t.issue_date,
    paymentDate: t.payment_date,
    projectId: t.project_id,
    paymentMethod: t.payment_method,
    responsibleId: t.responsible_id,
    notes: t.notes
});

export const mapTransactionToDB = (t: Partial<Transaction>) => ({
    date: t.date,
    amount: t.amount,
    category: t.category,
    description: t.description,
    type: t.type,
    status: t.status,
    active: t.active,
    due_date: t.dueDate,
    issue_date: t.issueDate,
    payment_date: t.paymentDate,
    project_id: t.projectId,
    payment_method: t.paymentMethod,
    responsible_id: t.responsibleId,
    notes: t.notes
});

export const mapTaxFromDB = (t: any): Tax => ({
    id: t.id,
    name: t.name,
    amount: Number(t.amount) || 0,
    dueDate: t.due_date,
    status: t.status,
    responsibleId: t.responsible_id,
    notes: t.notes
});

export const mapTaxToDB = (t: Partial<Tax>) => ({
    name: t.name,
    amount: t.amount,
    due_date: t.dueDate,
    status: t.status,
    responsible_id: t.responsibleId,
    notes: t.notes
});

export const mapBudgetFromDB = (b: any): Budget => ({
    id: b.id,
    clientId: b.client_id,
    projectId: b.project_id,
    title: b.title || '',
    date: b.date || new Date().toISOString().split('T')[0],
    validity: b.validity,
    status: b.status,
    items: b.items || [],
    totalAmount: Number(b.total_amount) || 0,
    totalValue: Number(b.total_value) || Number(b.total_amount) || 0,
    discount: Number(b.discount) || 0,
    finalValue: Number(b.final_value) || Number(b.total_amount) || 0,
    notes: b.notes,
    createdAt: b.created_at
});

export const mapBudgetToDB = (b: Partial<Budget>) => ({
    client_id: b.clientId,
    project_id: b.projectId,
    title: b.title,
    date: b.date,
    validity: b.validity,
    status: b.status,
    total_amount: b.totalAmount,
    total_value: b.totalValue,
    discount: b.discount,
    final_value: b.finalValue,
    notes: b.notes
});

export const mapQualityChecklistFromDB = (c: any): QualityChecklist => ({
    id: c.id,
    title: c.title,
    description: c.description,
    projectId: c.project_id,
    status: c.status,
    items: (c.items || []).map((i: any) => ({
        id: i.id,
        text: i.text,
        completed: i.completed
    })),
    createdBy: c.created_by,
    createdAt: c.created_at,
    updatedAt: c.updated_at
});

export const mapQualityChecklistToDB = (c: Partial<QualityChecklist>) => ({
    title: c.title,
    description: c.description,
    project_id: c.projectId,
    status: c.status,
    created_by: c.createdBy
});

export const mapClientApprovalFromDB = (a: any): ClientApproval => ({
    id: a.id,
    title: a.title,
    description: a.description,
    projectId: a.project_id,
    clientId: a.client_id,
    linkToDeliverable: a.link_to_deliverable,
    status: a.status,
    sentDate: a.sent_date,
    requestedBy: a.requested_by,
    clientFeedback: a.client_feedback,
    createdAt: a.created_at
});

export const mapClientApprovalToDB = (a: Partial<ClientApproval>) => ({
    title: a.title,
    description: a.description,
    project_id: a.projectId,
    client_id: a.clientId,
    link_to_deliverable: a.linkToDeliverable,
    status: a.status,
    sent_date: a.sentDate,
    requested_by: a.requestedBy,
    client_feedback: a.clientFeedback
});

export const mapRevisionFromDB = (r: any): Revision => ({
    id: r.id,
    projectId: r.project_id,
    versionNumber: r.version_number,
    changeLog: r.change_log,
    clientFeedback: r.client_feedback,
    date: r.date,
    authorId: r.author_id,
    reworkTime: r.rework_time_hours,
    createdAt: r.created_at
});

export const mapRevisionToDB = (r: Partial<Revision>) => ({
    project_id: r.projectId,
    version_number: r.versionNumber,
    change_log: r.changeLog,
    client_feedback: r.clientFeedback,
    date: r.date,
    author_id: r.authorId,
    rework_time_hours: r.reworkTime
});

export const mapAssetFromDB = (a: any): Asset => ({
    id: a.id,
    title: a.title,
    description: a.description,
    type: a.type,
    url: a.url,
    thumbnailUrl: a.thumbnail_url,
    projectId: a.project_id,
    clientId: a.client_id,
    folderId: a.folder_id,
    tags: a.tags || [],
    dimensions: a.dimensions,
    fileSize: a.file_size,
    size: a.size,
    mimeType: a.mime_type,
    createdAt: a.created_at,
    versions: a.versions || []
});

export const mapAssetToDB = (a: Partial<Asset>) => ({
    title: a.title,
    description: a.description,
    type: a.type,
    url: a.url,
    thumbnail_url: a.thumbnailUrl,
    project_id: a.projectId,
    client_id: a.clientId,
    folder_id: a.folderId,
    tags: a.tags,
    dimensions: a.dimensions,
    file_size: a.fileSize,
    size: a.size,
    mime_type: a.mimeType
});

export const mapSOPFromDB = (s: any): SOP => ({
    id: s.id,
    title: s.title,
    category: s.category,
    content: s.content,
    authorId: s.author_id,
    updatedAt: s.updated_at,
    version: s.version || '1.0',
    tags: s.tags || []
});

export const mapSOPToDB = (s: Partial<SOP>) => ({
    title: s.title,
    category: s.category,
    content: s.content,
    author_id: s.authorId,
    version: s.version,
    tags: s.tags
});

export const mapMarketingMetricFromDB = (m: any): MarketingMetric => ({
    id: m.id,
    date: m.date,
    channel: m.channel || m.platform || 'Other',
    platform: m.platform || m.channel,
    reach: Number(m.reach) || 0,
    engagement: Number(m.engagement) || 0,
    leads: Number(m.leads) || Number(m.conversions) || 0,
    conversions: Number(m.conversions) || Number(m.leads) || 0,
    investment: Number(m.investment) || Number(m.spend) || 0,
    spend: Number(m.spend) || Number(m.investment) || 0,
    notes: m.notes
});

export const mapMarketingMetricToDB = (m: Partial<MarketingMetric>) => ({
    date: m.date,
    channel: m.channel || m.platform,
    platform: m.platform || m.channel,
    reach: m.reach,
    engagement: m.engagement,
    leads: m.leads || m.conversions,
    conversions: m.conversions || m.leads,
    investment: m.investment || m.spend,
    spend: m.spend || m.investment,
    notes: m.notes
});

export const mapEditorialContentFromDB = (e: any): EditorialContent => ({
    id: e.id,
    title: e.title,
    platform: e.platform,
    type: e.type || e.format,
    format: e.format || e.type || 'Article',
    status: e.status,
    publishDate: e.publish_date,
    authorId: e.author_id,
    responsibleId: e.responsible_id || e.author_id || '',
    content: e.content,
    visualBrief: e.visual_brief
});

export const mapEditorialContentToDB = (e: Partial<EditorialContent>) => ({
    title: e.title,
    platform: e.platform,
    type: e.type || e.format,
    format: e.format || e.type,
    status: e.status,
    publish_date: e.publishDate,
    author_id: e.authorId,
    responsible_id: e.responsibleId || e.authorId,
    content: e.content,
    visual_brief: e.visualBrief
});

export const mapReportFromDB = (r: any): Report => ({
    id: r.id,
    employeeId: r.employee_id,
    date: r.date,
    role: r.role,
    status: r.status,
    notes: r.notes,
    // Sales
    leadsContacted: r.leads_contacted,
    salesQualifiedLeads: r.sales_qualified_leads,
    salesProposalsSent: r.sales_proposals_sent,
    contractsSigned: r.contracts_signed,
    salesRevenue: r.sales_revenue,
    salesConversionRate: r.sales_conversion_rate,
    nextActions: r.next_actions,
    // Creative
    projectsShot: r.projects_shot,
    hoursOnLocation: r.hours_on_location,
    equipmentUsed: r.equipment_used,
    nextSteps: r.next_steps,
    // IT
    ticketsResolved: r.tickets_resolved,
    systemsMaintenance: r.systems_maintenance,
    blockers: r.blockers,
    // HR
    hrEmployees: r.hr_employees,
    hrFreelancers: r.hr_freelancers,
    hrRoles: r.hr_roles,
    hrPerformance: r.hr_performance,
    hrPerformanceScore: r.hr_performance_score,
    hrProductivity: r.hr_productivity,
    hrProductivityScore: r.hr_productivity_score,
    hrAbsences: r.hr_absences,
    hrTraining: r.hr_training,
    hrCulture: r.hr_culture
});

export const mapReportToDB = (r: Partial<Report>) => ({
    employee_id: r.employeeId,
    date: r.date,
    role: r.role,
    status: r.status,
    notes: r.notes,
    // Sales
    leads_contacted: r.leadsContacted,
    sales_qualified_leads: r.salesQualifiedLeads,
    sales_proposals_sent: r.salesProposalsSent,
    contracts_signed: r.contractsSigned,
    sales_revenue: r.salesRevenue,
    sales_conversion_rate: r.salesConversionRate,
    next_actions: r.nextActions,
    // Creative
    projects_shot: r.projectsShot,
    hours_on_location: r.hoursOnLocation,
    equipment_used: r.equipmentUsed,
    next_steps: r.nextSteps,
    // IT
    tickets_resolved: r.ticketsResolved,
    systems_maintenance: r.systemsMaintenance,
    blockers: r.blockers,
    // HR
    hr_employees: r.hrEmployees,
    hr_freelancers: r.hrFreelancers,
    hr_roles: r.hrRoles,
    hr_performance: r.hrPerformance,
    hr_performance_score: r.hrPerformanceScore,
    hr_productivity: r.hrProductivity,
    hr_productivity_score: r.hrProductivityScore,
    hr_absences: r.hrAbsences,
    hr_training: r.hrTraining,
    hr_culture: r.hrCulture
});

export const mapTaskFromDB = (t: any): Task => ({
    id: Number(t.id),
    text: t.text,
    title: t.title,
    description: t.description,
    dueDate: t.due_date,
    completed: t.completed,
    priority: t.priority,
    status: t.status,
    assignedTo: t.assigned_to,
    projectId: t.project_id
});

export const mapTaskToDB = (t: Partial<Task>) => ({
    text: t.text,
    title: t.title,
    description: t.description,
    due_date: t.dueDate,
    completed: t.completed,
    priority: t.priority,
    status: t.status,
    assigned_to: t.assignedTo,
    project_id: t.projectId
});

export const mapEquipmentFromDB = (e: any): Equipment => ({
    id: e.id,
    name: e.name,
    category: e.category,
    serialNumber: e.serial_number,
    purchaseDate: e.purchase_date,
    status: e.status,
    lastMaintenance: e.last_maintenance,
    nextMaintenance: e.next_maintenance,
    assignedTo: e.assigned_to,
    value: Number(e.value) || 0,
    notes: e.notes
});

export const mapEquipmentToDB = (e: Partial<Equipment>) => ({
    name: e.name,
    category: e.category,
    serial_number: e.serialNumber,
    purchase_date: e.purchaseDate,
    status: e.status,
    last_maintenance: e.lastMaintenance,
    next_maintenance: e.nextMaintenance,
    assigned_to: e.assignedTo,
    value: e.value,
    notes: e.notes
});

// --- Auth & Users ---
// --- Auth & Users ---
export const getUsers = async () => {
    return withRetry(async () => {
        const { data: users, error: userError } = await supabase.from('users').select('*');
        if (userError) throw userError;

        const { data: permissions, error: permError } = await supabase.from('permissions').select('*').not('user_id', 'is', null);
        if (permError) throw permError;

        return users.map((u: any) => {
            const userPerms = permissions.filter((p: any) => p.user_id === u.id).map(mapPermissionFromDB);
            // We need to merge this with mapUserFromDB logic, but mapUserFromDB expects 'permissions' prop if we want to use valid User type
            // So we construct the object directly or enhance the mapper usage.
            // Ideally mapUserFromDB handles it if we pass a merged object.
            return {
                ...mapUserFromDB(u),
                permissions: userPerms
            };
        });
    });
};

export const getEmployees = getUsers;

export const createEmployee = async (employee: Omit<User, 'id' | 'avatarUrl' | 'permissions'> & { permissions?: Partial<ModulePermission>[] }, userId?: string) => {
    return withRetry(async () => {
        const dbUser = {
            id: userId,
            name: employee.name,
            email: employee.email,
            role: employee.role,
            sector: employee.sector,
            active: employee.active !== undefined ? employee.active : true,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random`,
            department: employee.department,
            contract_type: employee.contractType,
            admission_date: employee.admissionDate,
            supervisor_id: employee.supervisorId
        };
        const { data, error } = await supabase.from('users').upsert(dbUser, { onConflict: 'id' }).select().single();
        if (error) throw error;

        const newUser = mapUserFromDB(data);

        // Handle Permissions
        if (employee.permissions && employee.permissions.length > 0) {
            const permissionsToInsert = employee.permissions.map(p => ({
                module: p.module,
                can_view: p.canView || false,
                can_create: p.canCreate || false,
                can_edit: p.canEdit || false,
                can_approve: p.canApprove || false,
                user_id: newUser.id,
                role_id: null // Explicitly null for user-specific overrides
            }));

            const { error: permError } = await supabase.from('permissions').insert(permissionsToInsert);
            if (permError) console.error("Error creating permissions:", permError);
        }

        // Re-fetch the user to include the newly created permissions and ensure full consistency
        const { data: refreshedUser, error: refreshError } = await supabase
            .from('users')
            .select('*')
            .eq('id', newUser.id)
            .single();

        if (refreshError || !refreshedUser) {
            console.error("Error refreshing new user:", refreshError);
            return newUser;
        }

        // Fetch new permissions separately
        const { data: newPerms, error: permFetchError } = await supabase.from('permissions').select('*').eq('user_id', newUser.id);

        const mappedUser = mapUserFromDB(refreshedUser);
        if (!permFetchError && newPerms) {
            mappedUser.permissions = newPerms.map(mapPermissionFromDB);
        }

        return mappedUser;
    });
};

export const insertUser = createEmployee;

export const getRoles = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('roles').select('*');
        if (error) throw error;
        return data as any[];
    });
};

export const getPermissionsByUser = async (userId: string) => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('permissions').select('*').eq('user_id', userId);
        if (error) throw error;
        return data.map(mapPermissionFromDB);
    });
};

export const getPermissionsByRole = async (roleId: string) => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('permissions').select('*').eq('role_id', roleId);
        if (error) throw error;
        return data.map(mapPermissionFromDB);
    });
};

export const updatePermission = async (permission: ModulePermission) => {
    return withRetry(async () => {
        const { id, ...rest } = permission;
        const dbPerm = {
            can_view: permission.canView,
            can_create: permission.canCreate,
            can_edit: permission.canEdit,
            can_approve: permission.canApprove
        };
        const { data, error } = await supabase.from('permissions').update(dbPerm).eq('id', id).select().single();
        if (error) throw error;
        return mapPermissionFromDB(data);
    });
};

export const createPermission = async (permission: Omit<ModulePermission, 'id'>) => {
    return withRetry(async () => {
        const dbPerm = {
            module: permission.module,
            can_view: permission.canView,
            can_create: permission.canCreate,
            can_edit: permission.canEdit,
            can_approve: permission.canApprove,
            role_id: permission.roleId,
            user_id: permission.userId
        };
        const { data, error } = await supabase.from('permissions').insert(dbPerm).select().single();
        if (error) throw error;
        return mapPermissionFromDB(data);
    });
};

export const updateEmployee = async (user: User) => {
    return withRetry(async () => {
        const { avatarUrl, permissions, ...rest } = user;
        const dbUser = {
            name: rest.name,
            role: rest.role,
            sector: rest.sector,
            email: rest.email,
            active: rest.active,
            avatar_url: avatarUrl,
            department: rest.department,
            contract_type: rest.contractType,
            admission_date: rest.admissionDate,
            supervisor_id: rest.supervisorId
        };
        const { data, error } = await supabase.from('users').update(dbUser).eq('id', user.id).select().single();
        if (error) throw error;

        // Handle Permissions Update
        if (permissions && permissions.length > 0) {
            // We'll update existing or insert new ones based on the module and user_id
            // Since we have a unique constraint or logic, upsert is best if setup, otherwise we loop
            for (const p of permissions) {
                const permPayload = {
                    module: p.module,
                    can_view: p.canView,
                    can_create: p.canCreate,
                    can_edit: p.canEdit,
                    can_approve: p.canApprove,
                    user_id: user.id
                };

                // Check if exists for this user and module
                const { data: existing } = await supabase.from('permissions')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('module', p.module)
                    .single();

                if (existing) {
                    await supabase.from('permissions').update(permPayload).eq('id', existing.id);
                } else {
                    await supabase.from('permissions').insert({ ...permPayload, role_id: null });
                }
            }
        }

        // Re-fetch to ensure consistency
        const { data: refreshedUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        const mappedUser = mapUserFromDB(refreshedUser || data);

        // Fetch permissions separately
        const { data: currentPerms } = await supabase.from('permissions').select('*').eq('user_id', user.id);
        if (currentPerms) {
            mappedUser.permissions = currentPerms.map(mapPermissionFromDB);
        }

        return mappedUser;
    });
};

export const deleteEmployee = async (userId: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('users').update({ active: false }).eq('id', userId);
        if (error) throw error;
    });
};

export const uploadAvatar = async (file: File, userId: string) => {
    return withRetry(async () => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        return data.publicUrl;
    });
};

export const createUser = async (email: string, password: string, employeeData: Omit<Employee, 'id' | 'avatarUrl' | 'notificationPreferences'> & { permissions?: Partial<ModulePermission>[] }) => {
    const tempSupabase = createSupabaseClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    let authData;
    let authError;

    // Use a separate try-catch block to handle the "already registered" case manually
    try {
        const result = await tempSupabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: employeeData.name,
                    role: employeeData.role,
                }
            }
        });
        authData = result.data;
        authError = result.error;

        if (authError && authError.message.includes("already registered")) {
            // Attempt recovery: Try to sign in. If successful, check if 'users' row is missing.
            console.log("User already registered. Attempting recovery...");
            const { data: signInData, error: signInError } = await tempSupabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInData.user) {
                // Check if user exists in public table
                const { data: existingUser } = await supabase.from('users').select('id').eq('id', signInData.user.id).single();

                if (!existingUser) {
                    // Orphaned auth user! Recover by creating the employee row.
                    console.log("Orphaned auth user found. Recreating employee record...");
                    return await createEmployee({ ...employeeData, email, active: true }, signInData.user.id);
                } else {
                    // User truly exists
                    throw new Error("Este email já está cadastrado e associado a um funcionário.");
                }
            } else {
                // Password didn't match or other sign-in error? Rethrow original
                throw authError;
            }
        } else if (authError) {
            throw authError; // Rethrow other errors
        }

    } catch (e: any) {
        // Handle specific re-thrown errors or unexpected ones
        if (e.message.includes("already registered") || e.message.includes("cadastrado")) {
            throw e; // Pass through our custom error
        }
        // If we caught the original signUp error in a weird way
        if (typeof e === 'object' && e !== null && 'message' in e && e.message.includes("already registered")) {
            // Fallback recovery check logic if needed, but the block above handles it.
            // This catch is mostly for safety if signUp throws synchronously (unlikely for Supabase JS client but possible)
        }
        throw e;
    }

    if (authData && authData.user) {
        return await createEmployee({ ...employeeData, email, active: true }, authData.user.id);
    }

    // Should be unreachable if logic holds
    throw new Error('User creation failed.');
};

// --- CRM / Leads ---
export const getLeads = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('leads').select('*, notes:lead_notes(*), tasks:lead_tasks(*), files:lead_files(*)').order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapLeadFromDB);
    });
};

export const createLead = async (lead: Omit<Lead, 'id' | 'notes' | 'tasks' | 'files'>) => {
    return withRetry(async () => {
        const dbLead = {
            name: lead.name,
            company: lead.company,
            position: lead.position,
            email: lead.email,
            phone: lead.phone,
            source: lead.source,
            priority: lead.priority,
            status: lead.status,
            owner_id: lead.ownerId,
            project_type: lead.projectType,
            value: lead.value,
            probability: lead.probability,
            expected_close_date: lead.expectedCloseDate,
            internal_notes: lead.internalNotes
        };
        const { data, error } = await supabase.from('leads').insert(dbLead).select().single();
        if (error) throw error;
        return mapLeadFromDB({ ...data, notes: [], tasks: [], files: [] });
    });
};

export const updateLead = async (lead: Lead) => {
    return withRetry(async () => {
        const { id, notes, tasks, files, createdAt, updatedAt, ...rest } = lead;
        const dbLead = {
            name: rest.name,
            company: rest.company,
            position: rest.position,
            email: rest.email,
            phone: rest.phone,
            source: rest.source,
            priority: rest.priority,
            status: rest.status,
            owner_id: rest.ownerId,
            project_type: rest.projectType,
            value: rest.value,
            probability: rest.probability,
            expected_close_date: rest.expectedCloseDate,
            internal_notes: rest.internalNotes,
            last_status_change_at: rest.lastStatusChangeAt
        };
        const { data, error } = await supabase.from('leads').update(dbLead).eq('id', id).select().single();
        if (error) throw error;
        return mapLeadFromDB({ ...data, notes, tasks, files });
    });
};

export const deleteLead = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (error) throw error;
    });
};

export const createLeadNote = async (leadId: string, note: any) => {
    return withRetry(async () => {
        const dbNote = {
            lead_id: leadId,
            text: note.text,
            author_id: note.authorId,
            date: note.date
        };
        const { data, error } = await supabase.from('lead_notes').insert(dbNote).select().single();
        if (error) throw error;
        return {
            id: data.id,
            text: data.text,
            authorId: data.author_id,
            date: data.date
        };
    });
};

export const createLeadTask = async (leadId: string, task: any) => {
    return withRetry(async () => {
        const dbTask = {
            lead_id: leadId,
            title: task.title,
            due_date: task.dueDate,
            completed: task.completed,
            priority: task.priority
        };
        const { data, error } = await supabase.from('lead_tasks').insert(dbTask).select().single();
        if (error) throw error;
        return {
            id: data.id,
            title: data.title,
            dueDate: data.due_date,
            completed: data.completed,
            priority: data.priority
        };
    });
};

export const toggleLeadTask = async (taskId: number, completed: boolean) => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('lead_tasks').update({ completed }).eq('id', taskId).select().single();
        if (error) throw error;
        return data;
    });
};

export const createLeadFile = async (leadId: string, file: any) => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('lead_files').insert({ ...file, lead_id: leadId }).select().single();
        if (error) throw error;
        return data;
    });
};

// --- Clients ---
export const getClients = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('clients').select('*').order('name');
        if (error) throw error;
        return data.map(mapClientFromDB);
    });
};

export const getClient = async (id: string) => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('clients')
            .select('*, interactions(*), important_dates:client_important_dates(*), complaints:client_complaints(*), feedbacks(*), upsell_opportunities:client_upsell_opportunities(*), projects:production_projects(*), tags:client_tags(*)')
            .eq('id', id)
            .single();
        if (error) throw error;
        return mapClientFromDB(data);
    });
};

export const createClient = async (client: Omit<Client, 'id' | 'interactionHistory' | 'totalRevenue' | 'since'> & { projects?: any[], importantDates?: any[] }) => {
    return withRetry(async () => {
        const dbClient = {
            name: client.name,
            company: client.company,
            email: client.email,
            phone: client.phone,
            status: client.status,
            // tags: client.tags, // REMOVED: Managed via relation
            birthday: client.birthday,
            since: new Date().toISOString()
        };
        const { data, error } = await supabase.from('clients').insert(dbClient).select().single();
        if (error) throw error;

        // Handle Extra Data (Projects, Dates, etc.)
        if (client.projects && client.projects.length > 0) {
            const projectsToInsert = client.projects.map(p => ({
                title: p.title,
                type: p.type,
                client_id: data.id,
                // Map frontend 'date' to DB 'start_date' and 'deadline'
                start_date: p.date,
                deadline: p.date,
                // Ensure defaults for required fields
                status: p.status || 'Finalizado', // Default to Completed for previous projects
                progress: p.progress || 100,
                budget: p.budget || 0,
                actual_cost: p.actualCost || 0,
                team_ids: [],
                responsible_id: null // Or fetch current user if possible, but irrelevant for legacy
            }));
            const { error: projectError } = await supabase.from('production_projects').insert(projectsToInsert);
            if (projectError) console.error("Error creating client projects:", projectError);
        }

        if (client.importantDates && client.importantDates.length > 0) {
            const datesToInsert = client.importantDates.map(d => ({
                description: d.description,
                date: d.date,
                type: d.type,
                client_id: data.id
            }));
            const { error: dateError } = await supabase.from('client_important_dates').insert(datesToInsert);
            if (dateError) console.error("Error creating client dates:", dateError);
        }

        // Return complete object (we might need to re-fetch or construct it)
        // For optimistic speed, we construct it, but we might miss auto-generated IDs for sub-items.
        // Given the requirement for "speed", we can return the constructed object with the Client ID.
        // Ideally we re-fetch to get the sub-IDs but that adds latency. 
        // Let's re-fetch just this client to be safe and accurate.
        const { data: fullClient, error: fetchError } = await supabase.from('clients')
            .select('*, interactions(*), important_dates:client_important_dates(*), complaints:client_complaints(*), feedbacks(*), upsell_opportunities:client_upsell_opportunities(*), projects:production_projects(*), tags:client_tags(*)')
            .eq('id', data.id)
            .single();

        if (fetchError) return mapClientFromDB(data); // Fallback
        return mapClientFromDB(fullClient);
    });
};

export const updateClient = async (client: Client) => {
    return withRetry(async () => {
        const { id, interactionHistory, totalRevenue, since, ...rest } = client;
        const dbClient = {
            name: rest.name,
            company: rest.company,
            email: rest.email,
            phone: rest.phone,
            status: rest.status,
            // tags: rest.tags, // REMOVED: Managed via relation
            birthday: rest.birthday
        };
        const { data, error } = await supabase.from('clients').update(dbClient).eq('id', id).select().single();
        if (error) throw error;
        return mapClientFromDB({ ...client, ...data, total_revenue: totalRevenue, since });
    });
};

export const deleteClient = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) throw error;
    });
};

export const createInteraction = async (interaction: any) => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('interactions').insert(interaction).select().single();
        if (error) throw error;
        return data;
    });
};

export const createTag = async (tag: Omit<ClientTag, 'id'>) => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('tags').insert(tag).select().single();
        if (error) throw error;
        return data;
    });
};

export const addClientTag = async (clientId: string, tagId: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('client_tags_pivot').insert({ client_id: clientId, tag_id: tagId });
        if (error) throw error;
    });
};

export const removeClientTag = async (clientId: string, tagId: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('client_tags_pivot').delete().match({ client_id: clientId, tag_id: tagId });
        if (error) throw error;
    });
};

// --- Proposals & Follow-ups ---
export const getProposals = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('proposals').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data as Proposal[];
    });
};

export const createProposal = async (proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>) => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('proposals').insert(proposal).select().single();
        if (error) throw error;
        return data as Proposal;
    });
};

export const updateProposal = async (proposal: Proposal) => {
    return withRetry(async () => {
        const { id, createdAt, updatedAt, ...rest } = proposal;
        const { data, error } = await supabase.from('proposals').update(rest).eq('id', id).select().single();
        if (error) throw error;
        return data as Proposal;
    });
};

export const deleteProposal = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('proposals').delete().eq('id', id);
        if (error) throw error;
    });
};

export const getFollowUps = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('follow_ups').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data as FollowUp[];
    });
};

export const createFollowUp = async (followUp: Omit<FollowUp, 'id' | 'createdAt'>) => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('follow_ups').insert(followUp).select().single();
        if (error) throw error;
        return data as FollowUp;
    });
};

export const deleteFollowUp = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('follow_ups').delete().eq('id', id);
        if (error) throw error;
    });
};

// --- Financials ---
export const getTransactions = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapTransactionFromDB);
    });
};

export const createTransaction = async (tx: Omit<Transaction, 'id'>) => {
    return withRetry(async () => {
        const dbTx = mapTransactionToDB(tx);
        const { data, error } = await supabase.from('transactions').insert(dbTx).select().single();
        if (error) throw error;
        return mapTransactionFromDB(data);
    });
};

export const updateTransaction = async (tx: Transaction) => {
    return withRetry(async () => {
        const { id, ...rest } = tx;
        const dbTx = mapTransactionToDB(rest);
        const { data, error } = await supabase.from('transactions').update(dbTx).eq('id', id).select().single();
        if (error) throw error;
        return mapTransactionFromDB(data);
    });
};

export const deleteTransaction = async (id: number) => {
    return withRetry(async () => {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
    });
};

export const getBudgets = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('budgets').select('*, items:budget_items(*)');
        if (error) throw error;
        return (data || []).map(mapBudgetFromDB);
    });
};

export const createBudget = async (budget: Omit<Budget, 'id'>) => {
    return withRetry(async () => {
        const { items, ...rest } = budget;
        const dbBudget = mapBudgetToDB(rest);
        const { data, error } = await supabase.from('budgets').insert(dbBudget).select().single();
        if (error) throw error;

        if (items && items.length > 0) {
            const budgetItems = items.map(item => ({
                budget_id: data.id,
                service: item.service,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                subtotal: item.subtotal
            }));
            const { error: itemsError } = await supabase.from('budget_items').insert(budgetItems);
            if (itemsError) throw itemsError;
        }

        const { data: fullBudget, error: fetchError } = await supabase
            .from('budgets')
            .select('*, items:budget_items(*)')
            .eq('id', data.id)
            .single();

        if (fetchError) throw fetchError;
        return mapBudgetFromDB(fullBudget);
    });
};

export const updateBudget = async (budget: Budget) => {
    return withRetry(async () => {
        const { id, items, ...rest } = budget;
        const dbBudget = mapBudgetToDB(rest);
        const { error } = await supabase.from('budgets').update(dbBudget).eq('id', id);
        if (error) throw error;

        await supabase.from('budget_items').delete().eq('budget_id', id);
        if (items && items.length > 0) {
            const budgetItems = items.map(item => ({
                budget_id: id,
                service: item.service,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                subtotal: item.subtotal
            }));
            await supabase.from('budget_items').insert(budgetItems);
        }

        const { data: fullBudget, error: fetchError } = await supabase
            .from('budgets')
            .select('*, items:budget_items(*)')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        return mapBudgetFromDB(fullBudget);
    });
};

export const deleteBudget = async (id: number | string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('budgets').delete().eq('id', id);
        if (error) throw error;
    });
};

export const getInternalBudgets = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('internal_budgets').select('*');
        if (error) throw error;
        return data as InternalBudget[];
    });
};

export const createInternalBudget = async (budget: Omit<InternalBudget, 'id'>) => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('internal_budgets').insert(budget).select().single();
        if (error) throw error;
        return data as InternalBudget;
    });
};

export const updateInternalBudget = async (budget: InternalBudget) => {
    return withRetry(async () => {
        const { id, ...rest } = budget;
        const { data, error } = await supabase.from('internal_budgets').update(rest).eq('id', id).select().single();
        if (error) throw error;
        return data as InternalBudget;
    });
};

export const deleteInternalBudget = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('internal_budgets').delete().eq('id', id);
        if (error) throw error;
    });
};


export const getTaxes = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('taxes').select('*');
        if (error) throw error;
        return (data || []).map(mapTaxFromDB);
    });
};

export const createTax = async (tax: Omit<Tax, 'id'>) => {
    return withRetry(async () => {
        const dbTax = mapTaxToDB(tax);
        const { data, error } = await supabase.from('taxes').insert(dbTax).select().single();
        if (error) throw error;
        return mapTaxFromDB(data);
    });
};

export const updateTax = async (tax: Tax) => {
    return withRetry(async () => {
        const { id, ...rest } = tax;
        const dbTax = mapTaxToDB(rest);
        const { data, error } = await supabase.from('taxes').update(dbTax).eq('id', id).select().single();
        if (error) throw error;
        return mapTaxFromDB(data);
    });
};

export const deleteTax = async (id: number) => {
    return withRetry(async () => {
        const { error } = await supabase.from('taxes').delete().eq('id', id);
        if (error) throw error;
    });
};

// --- Production ---
export const getProductionProjects = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('production_projects').select('*');
        if (error) throw error;
        return (data || []).map(mapProductionProjectFromDB);
    });
};

export const createProductionProject = async (project: Omit<ProductionProject, 'id'>) => {
    return withRetry(async () => {
        const dbProject = mapProductionProjectToDB(project);
        const { data, error } = await supabase.from('production_projects').insert(dbProject).select().single();
        if (error) throw error;

        // Re-fetch to ensure all fields are mapped correctly
        return await getProductionProject(data.id);
    });
};

export const getProductionProject = async (id: string | number) => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('production_projects').select('*').eq('id', id).single();
        if (error) throw error;
        return mapProductionProjectFromDB(data);
    });
};

export const updateProductionProject = async (project: ProductionProject) => {
    return withRetry(async () => {
        const { id, ...rest } = project;
        const dbProject = mapProductionProjectToDB(rest);
        const { data, error } = await supabase.from('production_projects').update(dbProject).eq('id', id).select().single();
        if (error) throw error;
        return mapProductionProjectFromDB(data);
    });
};

export const deleteProductionProject = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('production_projects').delete().eq('id', id);
        if (error) throw error;
    });
};

// --- DAM ---
export const getAssets = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('assets').select('*');
        if (error) throw error;
        return (data || []).map(mapAssetFromDB);
    });
};

export const createAsset = async (asset: Omit<Asset, 'id' | 'createdAt' | 'versions'>) => {
    return withRetry(async () => {
        const dbAsset = mapAssetToDB(asset);
        const { data, error } = await supabase.from('assets').insert(dbAsset).select().single();
        if (error) throw error;
        return mapAssetFromDB(data);
    });
};

export const updateAsset = async (asset: Asset) => {
    return withRetry(async () => {
        const { id, ...rest } = asset;
        const dbAsset = mapAssetToDB(rest);
        const { data, error } = await supabase.from('assets').update(dbAsset).eq('id', id).select().single();
        if (error) throw error;
        return mapAssetFromDB(data);
    });
};

// --- Inventory ---
export const getEquipment = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('equipment').select('*');
        if (error) throw error;
        return (data || []).map(mapEquipmentFromDB);
    });
};

export const createEquipment = async (item: Omit<Equipment, 'id'>) => {
    return withRetry(async () => {
        const dbEquipment = mapEquipmentToDB(item);
        const { data, error } = await supabase.from('equipment').insert(dbEquipment).select().single();
        if (error) throw error;
        return mapEquipmentFromDB(data);
    });
};

export const updateEquipment = async (item: Equipment) => {
    return withRetry(async () => {
        const { id, ...rest } = item;
        const dbEquipment = mapEquipmentToDB(rest);
        const { data, error } = await supabase.from('equipment').update(dbEquipment).eq('id', id).select().single();
        if (error) throw error;
        return mapEquipmentFromDB(data);
    });
};

export const deleteEquipment = async (id: number) => {
    return withRetry(async () => {
        const { error } = await supabase.from('equipment').delete().eq('id', id);
        if (error) throw error;
    });
};

// --- SOPs ---
export const getSOPs = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('sops').select('*');
        if (error) throw error;
        return (data || []).map(mapSOPFromDB);
    });
};

export const createSOP = async (sop: Omit<SOP, 'id' | 'updatedAt'>) => {
    return withRetry(async () => {
        const dbSOP = mapSOPToDB(sop);
        const { data, error } = await supabase.from('sops').insert(dbSOP).select().single();
        if (error) throw error;
        return mapSOPFromDB(data);
    });
};

export const updateSOP = async (sop: SOP) => {
    return withRetry(async () => {
        const { id, ...rest } = sop;
        const dbSOP = mapSOPToDB(rest);
        const { data, error } = await supabase.from('sops').update(dbSOP).eq('id', id).select().single();
        if (error) throw error;
        return mapSOPFromDB(data);
    });
};

export const deleteSOP = async (id: number) => {
    return withRetry(async () => {
        const { error } = await supabase.from('sops').delete().eq('id', id);
        if (error) throw error;
    });
};

// --- After-Sales ---
export const getFeedbacks = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('feedbacks').select('*');
        if (error) throw error;
        return (data || []).map(mapFeedbackFromDB);
    });
};

export const createFeedback = async (feedback: Omit<Feedback, 'id'>) => {
    return withRetry(async () => {
        const dbFeedback = mapFeedbackToDB(feedback);
        const { data, error } = await supabase.from('feedbacks').insert(dbFeedback).select().single();
        if (error) throw error;
        return mapFeedbackFromDB(data);
    });
};

export const deleteFeedback = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('feedbacks').delete().eq('id', id);
        if (error) throw error;
    });
};

// --- Complaints ---
export const getComplaints = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('client_complaints').select('*');
        if (error) throw error;
        return (data || []).map(mapComplaintFromDB);
    });
};

export const createComplaint = async (complaint: Omit<Complaint, 'id'>) => {
    return withRetry(async () => {
        const dbComplaint = mapComplaintToDB(complaint);
        const { data, error } = await supabase.from('client_complaints').insert(dbComplaint).select().single();
        if (error) throw error;
        return mapComplaintFromDB(data);
    });
};

export const deleteComplaint = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('client_complaints').delete().eq('id', id);
        if (error) throw error;
    });
};

// --- Important Dates ---
export const getImportantDates = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('client_important_dates').select('*');
        if (error) throw error;
        return (data || []).map(mapImportantDateFromDB);
    });
};

export const createImportantDate = async (date: Omit<ImportantDate, 'id'>) => {
    return withRetry(async () => {
        const dbDate = mapImportantDateToDB(date);
        const { data, error } = await supabase.from('client_important_dates').insert(dbDate).select().single();
        if (error) throw error;
        return mapImportantDateFromDB(data);
    });
};

export const deleteImportantDate = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('client_important_dates').delete().eq('id', id);
        if (error) throw error;
    });
};

// --- Upsell Opportunities ---
export const getUpsellOpportunities = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('client_upsell_opportunities').select('*');
        if (error) throw error;
        return (data || []).map(mapUpsellOpportunityFromDB);
    });
};

export const createUpsellOpportunity = async (opp: Omit<UpsellOpportunity, 'id'>) => {
    return withRetry(async () => {
        const dbOpp = mapUpsellOpportunityToDB(opp);
        const { data, error } = await supabase.from('client_upsell_opportunities').insert(dbOpp).select().single();
        if (error) throw error;
        return mapUpsellOpportunityFromDB(data);
    });
};

export const deleteUpsellOpportunity = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('client_upsell_opportunities').delete().eq('id', id);
        if (error) throw error;
    });
};

// --- Referrals ---
export const getReferrals = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('referrals').select('*');
        if (error) throw error;
        return (data || []).map(mapReferralFromDB);
    });
};

export const createReferral = async (referral: Omit<Referral, 'id'>) => {
    return withRetry(async () => {
        const dbReferral = mapReferralToDB(referral);
        const { data, error } = await supabase.from('referrals').insert(dbReferral).select().single();
        if (error) throw error;
        return mapReferralFromDB(data);
    });
};

export const deleteReferral = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('referrals').delete().eq('id', id);
        if (error) throw error;
    });
};

// --- Marketing ---
export const getMarketingMetrics = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('marketing_metrics').select('*');
        if (error) throw error;
        return (data || []).map(mapMarketingMetricFromDB);
    });
};

export const createMarketingMetric = async (metric: Omit<MarketingMetric, 'id'>) => {
    return withRetry(async () => {
        const dbMetric = mapMarketingMetricToDB(metric);
        const { data, error } = await supabase.from('marketing_metrics').insert(dbMetric).select().single();
        if (error) throw error;
        return mapMarketingMetricFromDB(data);
    });
};

export const updateMarketingMetric = async (metric: MarketingMetric) => {
    return withRetry(async () => {
        const { id, ...rest } = metric;
        const dbMetric = mapMarketingMetricToDB(rest);
        const { data, error } = await supabase.from('marketing_metrics').update(dbMetric).eq('id', id).select().single();
        if (error) throw error;
        return mapMarketingMetricFromDB(data);
    });
};

export const deleteMarketingMetric = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('marketing_metrics').delete().eq('id', id);
        if (error) throw error;
    });
};

export const getEditorialContent = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('editorial_content').select('*').order('publish_date');
        if (error) throw error;
        return (data || []).map(mapEditorialContentFromDB);
    });
};

export const createEditorialContent = async (content: Omit<EditorialContent, 'id'>) => {
    return withRetry(async () => {
        const dbContent = mapEditorialContentToDB(content);
        const { data, error } = await supabase.from('editorial_content').insert(dbContent).select().single();
        if (error) throw error;
        return mapEditorialContentFromDB(data);
    });
};

export const updateEditorialContent = async (content: EditorialContent) => {
    return withRetry(async () => {
        const { id, ...rest } = content;
        const dbContent = mapEditorialContentToDB(rest);
        const { data, error } = await supabase.from('editorial_content').update(dbContent).eq('id', id).select().single();
        if (error) throw error;
        return mapEditorialContentFromDB(data);
    });
};

export const deleteEditorialContent = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('editorial_content').delete().eq('id', id);
        if (error) throw error;
    });
};

// --- HR & Performance (Jan 2nd Addition) ---
export const mapJobRoleFromDB = (data: any): JobRole => ({
    id: data.id,
    name: data.name,
    description: data.description,
    kpis: data.kpis || [],
    createdAt: data.created_at
});

export const getJobRoles = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('job_roles').select('*');
        if (error) throw error;
        return data.map(mapJobRoleFromDB);
    });
};

export const createJobRole = async (role: Omit<JobRole, 'id' | 'createdAt'>) => {
    return withRetry(async () => {
        const dbRole = mapJobRoleToDB(role);
        const { data, error } = await supabase.from('job_roles').insert(dbRole).select().single();
        if (error) throw error;
        return mapJobRoleFromDB(data);
    });
};

export const updateJobRole = async (role: JobRole) => {
    return withRetry(async () => {
        const { id, createdAt, ...rest } = role;
        const dbRole = mapJobRoleToDB(rest);
        const { data, error } = await supabase.from('job_roles').update(dbRole).eq('id', id).select().single();
        if (error) throw error;
        return mapJobRoleFromDB(data);
    });
};

export const deleteJobRole = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('job_roles').delete().eq('id', id);
        if (error) throw error;
    });
};

export const mapFreelancerFromDB = (data: any): Freelancer => ({
    id: data.id,
    name: data.name,
    mainFunction: data.main_function,
    associatedProjects: data.associated_projects || [],
    averageRating: Number(data.average_rating),
    availability: data.availability,
    usageFrequency: data.usage_frequency,
    createdAt: data.created_at
});

export const getFreelancers = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('freelancers').select('*');
        if (error) throw error;
        return data.map(mapFreelancerFromDB);
    });
};

export const createFreelancer = async (freelancer: Omit<Freelancer, 'id' | 'createdAt'>) => {
    return withRetry(async () => {
        const dbFreelancer = mapFreelancerToDB(freelancer);
        const { data, error } = await supabase.from('freelancers').insert(dbFreelancer).select().single();
        if (error) throw error;
        return mapFreelancerFromDB(data);
    });
};

export const updateFreelancer = async (freelancer: Freelancer) => {
    return withRetry(async () => {
        const { id, createdAt, ...rest } = freelancer;
        const dbFreelancer = mapFreelancerToDB(rest);
        const { data, error } = await supabase.from('freelancers').update(dbFreelancer).eq('id', id).select().single();
        if (error) throw error;
        return mapFreelancerFromDB(data);
    });
};

export const deleteFreelancer = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('freelancers').delete().eq('id', id);
        if (error) throw error;
    });
};

export const mapWeeklyReportFromDB = (data: any): WeeklyReport => ({
    id: data.id,
    employeeId: data.employee_id,
    weekStartDate: data.week_start_date,
    weekEndDate: data.week_end_date,
    roleId: data.role_id,
    projectsWorked: data.projects_worked, // Now string
    hoursWorked: Number(data.hours_worked || 0),
    deliveriesMade: Number(data.deliveries_made || 0),
    difficultyLevel: Number(data.difficulty_level || 3),
    selfEvaluation: Number(data.self_evaluation || 3),
    mainChallenges: data.main_challenges,
    improvementNotes: data.improvement_notes,
    absencesCount: Number(data.absences_count || 0),
    absenceType: data.absence_type,
    attendanceNotes: data.attendance_notes,
    weekEvaluation: Number(data.week_evaluation || 3),
    motivationLevel: Number(data.motivation_level || 3),
    feedbackText: data.feedback_text,
    confirmed: data.confirmed,
    createdAt: data.created_at
});

export const getWeeklyReports = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('weekly_reports').select('*').order('week_start_date', { ascending: false });
        if (error) throw error;
        return data.map(mapWeeklyReportFromDB);
    });
};

export const createWeeklyReport = async (report: Omit<WeeklyReport, 'id' | 'createdAt'>) => {
    return withRetry(async () => {
        const dbReport = mapWeeklyReportToDB(report);
        const { data, error } = await supabase.from('weekly_reports').insert(dbReport).select().single();
        if (error) throw error;
        return mapWeeklyReportFromDB(data);
    });
};

export const updateWeeklyReport = async (report: WeeklyReport) => {
    return withRetry(async () => {
        const { id, createdAt, ...rest } = report;
        const dbReport = mapWeeklyReportToDB(rest);
        const { data, error } = await supabase.from('weekly_reports').update(dbReport).eq('id', id).select().single();
        if (error) throw error;
        return mapWeeklyReportFromDB(data);
    });
};

export const deleteWeeklyReport = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('weekly_reports').delete().eq('id', id);
        if (error) throw error;
    });
};


export const mapTrainingFromDB = (data: any): Training => ({
    id: data.id,
    employeeId: data.employee_id,
    title: data.title,
    type: data.type,
    date: data.date,
    impactLevel: data.impact_level,
    notes: data.notes,
    createdAt: data.created_at
});

export const getTrainings = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('trainings').select('*');
        if (error) throw error;
        return data.map(mapTrainingFromDB);
    });
};

export const createTraining = async (training: Omit<Training, 'id' | 'createdAt'>) => {
    return withRetry(async () => {
        const dbTraining = mapTrainingToDB(training);
        const { data, error } = await supabase.from('trainings').insert(dbTraining).select().single();
        if (error) throw error;
        return mapTrainingFromDB(data);
    });
};

export const updateTraining = async (training: Training) => {
    return withRetry(async () => {
        const { id, createdAt, ...rest } = training;
        const dbTraining = mapTrainingToDB(rest);
        const { data, error } = await supabase.from('trainings').update(dbTraining).eq('id', id).select().single();
        if (error) throw error;
        return mapTrainingFromDB(data);
    });
};

export const deleteTraining = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('trainings').delete().eq('id', id);
        if (error) throw error;
    });
};

export const mapCultureFeedbackFromDB = (data: any): CultureFeedback => ({
    id: data.id,
    employeeId: data.employee_id,
    anonymous: data.anonymous,
    motivationScore: data.motivation_score,
    satisfactionScore: data.satisfaction_score,
    feedbackText: data.feedback_text,
    date: data.date,
    createdAt: data.created_at
});

export const getCultureFeedbacks = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('culture_feedback').select('*');
        if (error) throw error;
        return data.map(mapCultureFeedbackFromDB);
    });
};

export const createCultureFeedback = async (feedback: Omit<CultureFeedback, 'id' | 'createdAt'>) => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('culture_feedback').insert({
            employee_id: feedback.employeeId,
            anonymous: feedback.anonymous,
            motivation_score: feedback.motivationScore,
            satisfaction_score: feedback.satisfactionScore,
            feedback_text: feedback.feedbackText,
            date: feedback.date
        }).select().single();
        if (error) throw error;
        return mapCultureFeedbackFromDB(data);
    });
};

export const updateCultureFeedback = async (feedback: CultureFeedback) => {
    return withRetry(async () => {
        const { id, createdAt, ...rest } = feedback;
        const { data, error } = await supabase.from('culture_feedback').update({
            motivation_score: rest.motivationScore,
            satisfaction_score: rest.satisfactionScore,
            feedback_text: rest.feedbackText
        }).eq('id', id).select().single();
        if (error) throw error;
        return mapCultureFeedbackFromDB(data);
    });
};

export const deleteCultureFeedback = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('culture_feedback').delete().eq('id', id);
        if (error) throw error;
    });
};

export const getAttendanceRecords = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('attendance_records').select('*').order('date', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapAttendanceRecordFromDB);
    });
};

export const createAttendanceRecord = async (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => {
    return withRetry(async () => {
        const dbRecord = mapAttendanceRecordToDB(record);
        const { data, error } = await supabase.from('attendance_records').insert(dbRecord).select().single();
        if (error) throw error;
        return mapAttendanceRecordFromDB(data);
    });
};

export const updateAttendanceRecord = async (record: AttendanceRecord) => {
    return withRetry(async () => {
        const { id, createdAt, ...rest } = record;
        const dbRecord = mapAttendanceRecordToDB(rest);
        const { data, error } = await supabase.from('attendance_records').update(dbRecord).eq('id', id).select().single();
        if (error) throw error;
        return mapAttendanceRecordFromDB(data);
    });
};

export const deleteAttendanceRecord = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('attendance_records').delete().eq('id', id);
        if (error) throw error;
    });
};

export const updateTeam = async (team: Team) => {
    return withRetry(async () => {
        const { memberIds, ...teamData } = team;
        const { data, error } = await supabase.from('teams').update(teamData).eq('id', team.id).select().single();
        if (error) throw error;

        await supabase.from('team_members').delete().eq('team_id', team.id);
        if (memberIds && memberIds.length > 0) {
            const members = memberIds.map(id => ({ team_id: team.id, employee_id: id }));
            const { error: insError } = await supabase.from('team_members').insert(members);
            if (insError) throw insError;
        }

        return { ...data, memberIds } as Team;
    });
};

export const deleteTeam = async (teamId: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('teams').delete().eq('id', teamId);
        if (error) throw error;
    });
};

// --- Quality ---
export const getQualityChecklists = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('quality_checklists').select('*, items:quality_checklist_items(*)');
        if (error) throw error;
        return (data || []).map(mapQualityChecklistFromDB);
    });
};

export const createQualityChecklist = async (checklist: Omit<QualityChecklist, 'id' | 'createdAt' | 'updatedAt'>) => {
    return withRetry(async () => {
        const { items, ...rest } = checklist;
        const dbChecklist = mapQualityChecklistToDB(rest);
        const { data, error } = await supabase.from('quality_checklists').insert(dbChecklist).select().single();
        if (error) throw error;

        if (items && items.length > 0) {
            const checklistItems = items.map(item => ({
                checklist_id: data.id,
                text: item.text,
                completed: item.completed || false
            }));
            const { error: itemsError } = await supabase.from('quality_checklist_items').insert(checklistItems);
            if (itemsError) throw itemsError;
        }

        const { data: fullChecklist, error: fetchError } = await supabase
            .from('quality_checklists')
            .select('*, items:quality_checklist_items(*)')
            .eq('id', data.id)
            .single();

        if (fetchError) throw fetchError;
        return mapQualityChecklistFromDB(fullChecklist);
    });
};

export const updateQualityChecklist = async (checklist: QualityChecklist) => {
    return withRetry(async () => {
        const { id, items, ...rest } = checklist;
        const dbChecklist = mapQualityChecklistToDB(rest);
        const { error } = await supabase.from('quality_checklists').update(dbChecklist).eq('id', id);
        if (error) throw error;

        await supabase.from('quality_checklist_items').delete().eq('checklist_id', id);
        if (items && items.length > 0) {
            const checklistItems = items.map(item => ({
                checklist_id: id,
                text: item.text,
                completed: item.completed || false
            }));
            await supabase.from('quality_checklist_items').insert(checklistItems);
        }

        const { data: fullChecklist, error: fetchError } = await supabase
            .from('quality_checklists')
            .select('*, items:quality_checklist_items(*)')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        return mapQualityChecklistFromDB(fullChecklist);
    });
};

export const deleteQualityChecklist = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('quality_checklists').delete().eq('id', id);
        if (error) throw error;
    });
};

export const getClientApprovals = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('client_approvals').select('*').order('sent_date', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapClientApprovalFromDB);
    });
};

export const createClientApproval = async (approval: Omit<ClientApproval, 'id' | 'createdAt'>) => {
    return withRetry(async () => {
        const dbApproval = mapClientApprovalToDB(approval);
        const { data, error } = await supabase.from('client_approvals').insert(dbApproval).select().single();
        if (error) throw error;
        return mapClientApprovalFromDB(data);
    });
};

export const updateClientApproval = async (approval: ClientApproval) => {
    return withRetry(async () => {
        const { id, ...rest } = approval;
        const dbApproval = mapClientApprovalToDB(rest);
        const { data, error } = await supabase.from('client_approvals').update(dbApproval).eq('id', id).select().single();
        if (error) throw error;
        return mapClientApprovalFromDB(data);
    });
};

export const deleteClientApproval = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('client_approvals').delete().eq('id', id);
        if (error) throw error;
    });
};

export const getQualityRevisions = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('quality_revisions').select('*').order('date', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapRevisionFromDB);
    });
};

export const createQualityRevision = async (revision: Omit<Revision, 'id' | 'createdAt'>) => {
    return withRetry(async () => {
        const dbRevision = mapRevisionToDB(revision);
        const { data, error } = await supabase.from('quality_revisions').insert(dbRevision).select().single();
        if (error) throw error;
        return mapRevisionFromDB(data);
    });
};

// --- Deliveries ---
export const getDeliveries = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('deliveries').select('*, assets:delivery_items(asset_id)');
        if (error) throw error;
        return data as Delivery[];
    });
};

export const createDelivery = async (delivery: Omit<Delivery, 'id' | 'createdAt' | 'views'>, assetIds: number[]) => {
    return withRetry(async () => {
        const { assets, ...rest } = delivery as any;
        const { data, error } = await supabase.from('deliveries').insert(rest).select().single();
        if (error) throw error;

        if (assetIds && assetIds.length > 0) {
            await supabase.from('delivery_items').insert(assetIds.map(id => ({ delivery_id: data.id, asset_id: id })));
        }

        // Re-fetch to get items
        const { data: fullDelivery, error: fetchError } = await supabase
            .from('deliveries')
            .select('*, items:delivery_items(*)')
            .eq('id', data.id)
            .single();

        if (fetchError) throw fetchError;
        return fullDelivery as Delivery;
    });
};

export const updateDelivery = async (delivery: Delivery) => {
    return withRetry(async () => {
        const { id, assets, ...rest } = delivery as any;
        const { data, error } = await supabase.from('deliveries').update(rest).eq('id', id).select().single();
        if (error) throw error;
        return data as Delivery;
    });
};

export const deleteDelivery = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('deliveries').delete().eq('id', id);
        if (error) throw error;
    });
};

// --- Agenda ---
export const getCalendarEvents = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('agenda_eventos').select('*');
        if (error) throw error;
        return (data || []).map(mapCalendarEventFromDB);
    });
};

export const createCalendarEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    return withRetry(async () => {
        const dbEvent = mapCalendarEventToDB(event);
        const { data, error } = await supabase.from('agenda_eventos').insert(dbEvent).select().single();
        if (error) throw error;
        return mapCalendarEventFromDB(data);
    });
};

export const updateCalendarEvent = async (event: CalendarEvent) => {
    return withRetry(async () => {
        const { id, ...rest } = event;
        const dbEvent = mapCalendarEventToDB(rest);
        const { data, error } = await supabase.from('agenda_eventos').update(dbEvent).eq('id', id).select().single();
        if (error) throw error;
        return mapCalendarEventFromDB(data);
    });
};

export const deleteCalendarEvent = async (id: string) => {
    return withRetry(async () => {
        const { error } = await supabase.from('agenda_eventos').delete().eq('id', id);
        if (error) throw error;
    });
};

// --- Goals ---
export const getGoals = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('goals').select('*');
        if (error) throw error;
        return (data || []).map(mapGoalFromDB);
    });
};

export const createGoal = async (goal: Omit<Goal, 'id'>) => {
    return withRetry(async () => {
        const dbGoal = mapGoalToDB(goal);
        const { data, error } = await supabase.from('goals').insert(dbGoal).select().single();
        if (error) throw error;
        return mapGoalFromDB(data);
    });
};

export const updateGoal = async (goal: Goal) => {
    return withRetry(async () => {
        const { id, ...rest } = goal;
        const dbGoal = mapGoalToDB(rest);
        const { data, error } = await supabase.from('goals').update(dbGoal).eq('id', id).select().single();
        if (error) throw error;
        return mapGoalFromDB(data);
    });
};

export const deleteGoal = async (id: number) => {
    return withRetry(async () => {
        const { error } = await supabase.from('goals').delete().eq('id', id);
        if (error) throw error;
    });
};

export const createGoalUpdate = async (goalId: number, update: GoalUpdate) => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('goals').select('updates').eq('id', goalId).single();
        if (error) throw error;
        const currentUpdates = data.updates || [];
        const newUpdates = [...currentUpdates, update];
        const { error: upError } = await supabase.from('goals').update({ updates: newUpdates }).eq('id', goalId);
        if (upError) throw upError;
        return update;
    });
};

// --- Common Utilities ---
export const getActivities = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('activities').select('*').order('date', { ascending: false }).limit(50);
        if (error) throw error;
        return (data || []).map(mapActivityFromDB);
    });
};

export const createActivity = async (activity: Omit<Activity, 'id'>) => {
    return withRetry(async () => {
        const dbActivity = mapActivityToDB(activity);
        const { data, error } = await supabase.from('activities').insert(dbActivity).select().single();
        if (error) throw error;
        return mapActivityFromDB(data);
    });
};

export const getNotifications = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('notifications').select('*').order('date', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapNotificationFromDB);
    });
};

export const createNotification = async (notif: Omit<Notification, 'id'>) => {
    return withRetry(async () => {
        const dbNotif = mapNotificationToDB(notif);
        const { data, error } = await supabase.from('notifications').insert(dbNotif).select().single();
        if (error) throw error;
        return mapNotificationFromDB(data);
    });
};

export const updateNotification = async (notif: Notification) => {
    return withRetry(async () => {
        const { id, ...rest } = notif;
        const { data, error } = await supabase.from('notifications').update(rest).eq('id', id).select().single();
        if (error) throw error;
        return data as Notification;
    });
};

// --- Reports ---
export const getReports = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('reports').select('*').order('date', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapReportFromDB);
    });
};

export const createReport = async (report: Omit<Report, 'id'>) => {
    return withRetry(async () => {
        const dbReport = mapReportToDB(report);
        const { data, error } = await supabase.from('reports').insert(dbReport).select().single();
        if (error) throw error;
        return mapReportFromDB(data);
    });
};

export const updateReport = async (report: Report) => {
    return withRetry(async () => {
        const { id, ...rest } = report;
        const dbReport = mapReportToDB(rest);
        const { data, error } = await supabase.from('reports').update(dbReport).eq('id', id).select().single();
        if (error) throw error;
        return mapReportFromDB(data);
    });
};

export const deleteReport = async (id: number) => {
    return withRetry(async () => {
        const { error } = await supabase.from('reports').delete().eq('id', id);
        if (error) throw error;
    });
};

export const resetPassword = async (email: string) => {
    return withRetry(async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
    });
};

export const sendEmailNotification = async (to: string, subject: string, body: string) => {
    // Mocking email notification for now as in the baseline
    console.log(`Sending email to ${to}: ${subject}`);
    return { success: true };
};

export const getTeams = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('teams').select('*');
        if (error) throw error;
        return data as Team[];
    });
};

export const createTeam = async (team: Omit<Team, 'id'>) => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('teams').insert(team).select().single();
        if (error) throw error;
        return data as Team;
    });
};

export const getTasks = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('tasks').select('*');
        if (error) throw error;
        return (data || []).map(mapTaskFromDB);
    });
};

export const createTask = async (task: Omit<Task, 'id'>) => {
    return withRetry(async () => {
        const dbTask = mapTaskToDB(task);
        const { data, error } = await supabase.from('tasks').insert(dbTask).select().single();
        if (error) throw error;
        return mapTaskFromDB(data);
    });
};

export const updateTask = async (task: Task) => {
    return withRetry(async () => {
        const { id, ...rest } = task;
        const dbTask = mapTaskToDB(rest);
        const { data, error } = await supabase.from('tasks').update(dbTask).eq('id', id).select().single();
        if (error) throw error;
        return mapTaskFromDB(data);
    });
};

export const deleteTask = async (id: number) => {
    return withRetry(async () => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw error;
    });
};

export const uploadProjectFile = async (file: File, bucket: string, path: string) => {
    return withRetry(async () => {
        const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
            upsert: true
        });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
        return publicUrl;
    });
};

export const getDeliveryByToken = async (token: string) => {
    return withRetry(async () => {
        const { data, error } = await supabase.from('deliveries').select('*').eq('token', token).single();
        if (error) throw error;
        return data as Delivery;
    });
};

export const incrementDeliveryViews = async (id: string) => {
    return withRetry(async () => {
        await supabase.rpc('increment_delivery_views', { delivery_id: id });
    });
};

