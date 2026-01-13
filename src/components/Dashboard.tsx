import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from './common/Card';
import { formatCurrency } from '../utils';
import { LeadStatus, Lead, CalendarEvent, Activity, FinancialData, Notification, Employee } from '../types';
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, CalendarIcon, TargetIcon, PipelineIcon, FinancialIcon } from './common/Icon';

interface DashboardProps {
    leads: Lead[];
    calendarEvents: CalendarEvent[];
    financialData: FinancialData;
    notifications: Notification[];
    activities: Activity[];
    employees: Employee[];
}

const ActivityItem: React.FC<{ activity: Activity; employees: Employee[] }> = ({ activity, employees }) => {
    const actor = employees.find(e => e.id === activity.actorId);
    if (!actor) return null;

    return (
        <div className="flex items-start gap-4 py-3 border-b dark:border-gray-700 last:border-0">
            <img src={actor.avatarUrl} alt={actor.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
                <p className="text-sm text-brand-dark dark:text-gray-200">
                    <span className="font-semibold">{actor.name}</span> {activity.action} <span className="font-semibold text-brand-gold">{activity.target}</span>.
                </p>
                <p className="text-xs text-brand-secondary dark:text-gray-400">{new Date(activity.date).toLocaleString('pt-BR')}</p>
            </div>
        </div>
    )
}

/**
 * Dashboard page component.
 * This is the main landing page after login, showing an overview of all important metrics.
 */
export const Dashboard: React.FC<DashboardProps> = ({ leads, calendarEvents, financialData, notifications, activities, employees }) => {
    const newLeads = leads.filter(lead => lead.status === LeadStatus.New).length;
    const closedLeads = leads.filter(lead => lead.status === LeadStatus.Won).length;
    const totalLeads = leads.length;
    const pipelineValue = leads.filter(l => l.status !== LeadStatus.Won && l.status !== LeadStatus.Lost).reduce((sum, lead) => sum + lead.value, 0);
    const tasks = calendarEvents.filter(event => new Date(event.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const pipelineSummary = Object.values(LeadStatus).map(status => ({
        status,
        count: leads.filter(lead => lead.status === status).length,
    }));

    const chartData = financialData.labels.slice(0, 6).map((label, index) => ({
        name: label,
        Receita: financialData.revenue[index] || 0,
        Despesa: financialData.expenses[index] || 0,
    }));

    const getNotificationIcon = (type: 'alert' | 'success' | 'info') => {
        switch (type) {
            case 'alert': return <AlertTriangleIcon className="w-6 h-6 text-red-500" />;
            case 'success': return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
            case 'info': return <InfoIcon className="w-6 h-6 text-blue-500" />;
        }
    };

    const getEventTypeIcon = (type: CalendarEvent['type']) => {
        switch (type) {
            case 'meeting': return <CalendarIcon className="w-5 h-5 text-blue-500" />;
            case 'deadline': return <TargetIcon className="w-5 h-5 text-red-500" />;
            case 'task': return <CheckCircleIcon className="w-5 h-5 text-yellow-500" />;
        }
    }

    return (
        <div className="p-8 space-y-8">
            {/* KPIs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="relative group">
                    <Card>
                        <div className="flex items-center gap-4">
                            <PipelineIcon className="w-8 h-8 text-brand-gold" />
                            <div>
                                <p className="text-sm font-medium text-brand-secondary">Novos Leads</p>
                                <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">{newLeads}</p>
                            </div>
                        </div>
                    </Card>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                        Número de leads que entraram no pipeline e estão na primeira etapa ('Inquérito').
                    </span>
                </div>
                <div className="relative group">
                    <Card>
                        <div className="flex items-center gap-4">
                            <TargetIcon className="w-8 h-8 text-brand-gold" />
                            <div>
                                <p className="text-sm font-medium text-brand-secondary">Taxa de Conversão</p>
                                <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">{totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : 0}%</p>
                            </div>
                        </div>
                    </Card>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                        Percentual de leads que passaram por todo o funil e foram marcados como 'Finalizado'.
                    </span>
                </div>
                <div className="relative group">
                    <Card>
                        <div className="flex items-center gap-4">
                            <FinancialIcon className="w-8 h-8 text-brand-gold" />
                            <div>
                                <p className="text-sm font-medium text-brand-secondary">Valor em Pipeline</p>
                                <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">{formatCurrency(pipelineValue)}</p>
                            </div>
                        </div>
                    </Card>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                        Soma dos valores de todos os leads que ainda não foram marcados como 'Finalizado'.
                    </span>
                </div>
                <div className="relative group">
                    <Card>
                        <div className="flex items-center gap-4">
                            <CalendarIcon className="w-8 h-8 text-brand-gold" />
                            <div>
                                <p className="text-sm font-medium text-brand-secondary">Tarefas Pendentes</p>
                                <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">{tasks.length}</p>
                            </div>
                        </div>
                    </Card>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                        Número total de tarefas agendadas para hoje ou para o futuro que ainda não foram concluídas.
                    </span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card title="Visão Financeira (Últimos 6 meses)" className="lg:col-span-2">
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(val) => formatCurrency(val)} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Bar dataKey="Receita" fill="#D4AF37" name="Receita" />
                                <Bar dataKey="Despesa" fill="#4B5563" name="Despesa" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Atividade Recente">
                    <div className="space-y-1 max-h-80 overflow-y-auto pr-2">
                        {activities.map(activity => <ActivityItem key={activity.id} activity={activity} employees={employees} />)}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card title="Resumo do Pipeline" className="lg:col-span-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                        {pipelineSummary.map(item => (
                            <div key={item.status} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs font-semibold text-brand-secondary dark:text-gray-300 truncate">{item.status}</p>
                                <p className="text-2xl font-bold text-brand-dark dark:text-gray-100 mt-1">{item.count}</p>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card title="Minhas Tarefas">
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {tasks.slice(0, 5).map(task => (
                            <div key={task.id} className="flex items-start gap-3">
                                <div>{getEventTypeIcon(task.type)}</div>
                                <div>
                                    <p className="font-semibold text-brand-dark dark:text-gray-200 text-sm">{task.title}</p>
                                    <p className="text-xs text-brand-secondary dark:text-gray-400">{new Date(task.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}</p>
                                </div>
                            </div>
                        ))}
                        {tasks.length === 0 && <p className="text-sm text-gray-500">Nenhuma tarefa futura.</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
};