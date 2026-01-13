
// --- Weekly Reports ---
const mapWeeklyReportFromDB = (data: any): WeeklyReport => ({
    id: data.id,
    employeeId: data.employee_id,
    weekStartDate: data.week_start_date,
    weekEndDate: data.week_end_date,
    roleId: data.role_id,
    projectsWorked: data.projects_worked,
    hoursWorked: data.hours_worked,
    deliveriesMade: data.deliveries_made,
    difficultyLevel: data.difficulty_level,
    selfEvaluation: data.self_evaluation,
    mainChallenges: data.main_challenges,
    improvementNotes: data.improvement_notes,
    motivationLevel: data.motivation_level,
    absencesCount: data.absences_count,
    absenceType: data.absence_type,
    attendanceNotes: data.attendance_notes,
    weekEvaluation: data.week_evaluation,
    feedbackText: data.feedback_text,
    confirmed: data.confirmed,
    createdAt: data.created_at
});

export const getWeeklyReports = async () => {
    return withRetry(async () => {
        const { data, error } = await supabase
            .from('weekly_reports')
            .select('*')
            .order('week_start_date', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapWeeklyReportFromDB);
    });
};

export const createWeeklyReport = async (report: Omit<WeeklyReport, 'id' | 'createdAt'>) => {
    return withRetry(async () => {
        const dbReport = {
            employee_id: report.employeeId,
            week_start_date: report.weekStartDate,
            week_end_date: report.weekEndDate,
            role_id: report.roleId,
            projects_worked: report.projectsWorked,
            hours_worked: report.hoursWorked,
            deliveries_made: report.deliveriesMade,
            difficulty_level: report.difficultyLevel,
            self_evaluation: report.selfEvaluation,
            main_challenges: report.mainChallenges,
            improvement_notes: report.improvementNotes,
            motivation_level: report.motivationLevel,
            absences_count: report.absencesCount,
            absence_type: report.absenceType,
            attendance_notes: report.attendanceNotes,
            week_evaluation: report.weekEvaluation,
            feedback_text: report.feedbackText,
            confirmed: report.confirmed
        };

        const { data, error } = await supabase
            .from('weekly_reports')
            .insert(dbReport)
            .select()
            .single();

        if (error) throw error;
        return mapWeeklyReportFromDB(data);
    });
};

export const updateWeeklyReport = async (report: WeeklyReport) => {
    return withRetry(async () => {
        const dbReport = {
            employee_id: report.employeeId,
            week_start_date: report.weekStartDate,
            week_end_date: report.weekEndDate,
            role_id: report.roleId,
            projects_worked: report.projectsWorked,
            hours_worked: report.hoursWorked,
            deliveries_made: report.deliveriesMade,
            difficulty_level: report.difficultyLevel,
            self_evaluation: report.selfEvaluation,
            main_challenges: report.mainChallenges,
            improvement_notes: report.improvementNotes,
            motivation_level: report.motivationLevel,
            absences_count: report.absencesCount,
            absence_type: report.absenceType,
            attendance_notes: report.attendanceNotes,
            week_evaluation: report.weekEvaluation,
            feedback_text: report.feedbackText,
            confirmed: report.confirmed
        };

        const { data, error } = await supabase
            .from('weekly_reports')
            .update(dbReport)
            .eq('id', report.id)
            .select()
            .single();

        if (error) throw error;
        return mapWeeklyReportFromDB(data);
    });
};
