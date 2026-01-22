import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from './common/Card';
import { formatCurrency } from '../utils';
import { LeadStatus, Lead, CalendarEvent, Activity, FinancialData, Notification, Employee } from '../types';
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, CalendarIcon, TargetIcon, PipelineIcon, FinancialIcon, ClockIcon, ActivityIcon } from './common/Icon';

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
        <div className="flex items-center gap-5 py-5 border-b border-black/5 last:border-0 group">
            <img src={actor.avatarUrl} alt={actor.name} className="w-12 h-12 rounded-full object-cover border-2 border-black/5 shadow-sm group-hover:border-brand-gold transition-all" />
            <div className="flex-1">
                <p className="text-sm text-black font-bold">
                    <span className="font-black uppercase tracking-tight">{actor.name}</span> {activity.action} <span className="font-black text-brand-gold uppercase tracking-tighter">{activity.target}</span>.
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <ClockIcon className="w-3.5 h-3.5 text-black/20" />
                    <p className="text-[10px] text-black/30 font-black uppercase tracking-widest">{new Date(activity.date).toLocaleString('pt-BR')}</p>
                </div>
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
            case 'alert': return <div className="p-2 bg-red-50 rounded-lg shadow-sm"><AlertTriangleIcon className="w-5 h-5 text-red-600" /></div>;
            case 'success': return <div className="p-2 bg-green-50 rounded-lg shadow-sm"><CheckCircleIcon className="w-5 h-5 text-green-600" /></div>;
            case 'info': return <div className="p-2 bg-black rounded-lg shadow-sm"><InfoIcon className="w-5 h-5 text-brand-gold" /></div>;
        }
    };

    const getEventTypeIcon = (type: CalendarEvent['type']) => {
        switch (type) {
            case 'meeting': return <div className="bg-black p-2 rounded-lg"><CalendarIcon className="w-4 h-4 text-brand-gold" /></div>;
            case 'deadline': return <div className="bg-red-50 p-2 rounded-lg"><TargetIcon className="w-4 h-4 text-red-600" /></div>;
            case 'task': return <div className="bg-green-50 p-2 rounded-lg"><CheckCircleIcon className="w-4 h-4 text-green-600" /></div>;
        }
    }

    return (
        <div className="p-8 space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-black tracking-tight drop-shadow-sm uppercase">DASHBOARD <span className="text-brand-gold">OVERVIEW</span></h1>
                    <p className="text-black/60 mt-1 font-bold">Resumo operacional e métricas de desempenho em tempo real</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-gold-metallic hover:text-black transition-all">Exportar Relatórios</button>
                    <button className="bg-gold-metallic text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-gold/20 hover:scale-105 transition-all">Sincronizar Agora</button>
                </div>
            </div>

            {/* KPIs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="relative group">
                    <div className="bg-white rounded-[40px] p-8 border-2 border-black/5 shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all group">
                        <div className="flex items-center gap-6">
                            <div className="bg-black p-4 rounded-2xl border border-brand-gold/30 shadow-xl group-hover:bg-gold-metallic transition-all">
                                <PipelineIcon className="w-8 h-8 text-brand-gold group-hover:text-black" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-1">Novos Leads</p>
                                <p className="text-3xl font-black text-black tracking-tighter">{newLeads}</p>
                            </div>
                        </div>
                    </div>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-4 text-[10px] font-black text-white bg-black rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 uppercase tracking-widest text-center border border-brand-gold/20">
                        Leads na etapa de Inquérito
                    </span>
                </div>

                <div className="relative group">
                    <div className="bg-white rounded-[40px] p-8 border-2 border-black/5 shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all group">
                        <div className="flex items-center gap-6">
                            <div className="bg-black p-4 rounded-2xl border border-black/5 shadow-xl group-hover:bg-gold-metallic transition-all">
                                <TargetIcon className="w-8 h-8 text-brand-gold group-hover:text-black" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-1">Conversão</p>
                                <p className="text-3xl font-black text-black tracking-tighter">{totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : 0}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative group">
                    <div className="bg-white rounded-[40px] p-8 border-2 border-black/5 shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all group">
                        <div className="flex items-center gap-6">
                            <div className="bg-black p-4 rounded-2xl border border-brand-gold/30 shadow-xl group-hover:bg-gold-metallic transition-all">
                                <FinancialIcon className="w-8 h-8 text-brand-gold group-hover:text-black" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-1">Pipeline Em Aberto</p>
                                <p className="text-3xl font-black text-black tracking-tighter">{formatCurrency(pipelineValue)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative group">
                    <div className="bg-white rounded-[40px] p-8 border-2 border-black/5 shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all group">
                        <div className="flex items-center gap-6">
                            <div className="bg-black p-4 rounded-2xl border border-black/5 shadow-xl group-hover:bg-gold-metallic transition-all">
                                <CalendarIcon className="w-8 h-8 text-brand-gold group-hover:text-black" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-1">Pendências</p>
                                <p className="text-3xl font-black text-black tracking-tighter">{tasks.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card title="Visão Financeira (Últimos 6 meses)">
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000008" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#00000040', fontSize: 10, fontWeight: 900 }}
                                    />
                                    <YAxis
                                        tickFormatter={(val) => formatCurrency(val)}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#00000040', fontSize: 10, fontWeight: 900 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#00000005' }}
                                        contentStyle={{
                                            backgroundColor: '#000000',
                                            border: 'none',
                                            borderRadius: '16px',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            padding: '12px 16px'
                                        }}
                                        itemStyle={{ color: '#C5A059', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
                                        labelStyle={{ color: '#FFFFFF40', fontWeight: 900, fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase' }}
                                        formatter={(value: number) => formatCurrency(value)}
                                    />
                                    <Bar dataKey="Receita" fill="#C5A059" radius={[4, 4, 0, 0]} barSize={24} name="Receita" />
                                    <Bar dataKey="Despesa" fill="#000000" radius={[4, 4, 0, 0]} barSize={24} name="Despesa" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                <Card title="Atividade Recente">
                    <div className="space-y-1 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {activities.length > 0 ? (
                            activities.map(activity => <ActivityItem key={activity.id} activity={activity} employees={employees} />)
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <ActivityIcon className="w-12 h-12 text-black/5 mb-4" />
                                <p className="text-xs font-black text-black/20 uppercase tracking-widest">Nenhuma atividade recente</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card title="Resumo do Pipeline" className="lg:col-span-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {pipelineSummary.map(item => (
                            <div key={item.status} className="p-6 bg-black/[0.02] border-2 border-black/5 rounded-3xl hover:border-brand-gold/30 hover:bg-white transition-all group">
                                <p className="text-[9px] font-black text-black/30 uppercase tracking-widest leading-tight mb-2 group-hover:text-brand-gold transition-colors">{item.status}</p>
                                <p className="text-3xl font-black text-black tracking-tighter">{item.count}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Minhas Tarefas">
                    <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {tasks.slice(0, 5).map(task => (
                            <div key={task.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-black/[0.02] transition-all group border border-transparent hover:border-black/5">
                                <div className="transition-transform group-hover:scale-110">{getEventTypeIcon(task.type)}</div>
                                <div>
                                    <p className="font-black text-black text-xs uppercase tracking-tight">{task.title}</p>
                                    <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest mt-0.5">
                                        {new Date(task.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {tasks.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <CheckCircleIcon className="w-12 h-12 text-black/5 mb-4" />
                                <p className="text-xs font-black text-black/20 uppercase tracking-widest">Tudo em dia!</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};