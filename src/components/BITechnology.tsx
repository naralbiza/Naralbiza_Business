import React, { useMemo } from 'react';
import {
    AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    FinancialData, Lead, Employee, Report, LeadStatus, FollowUp
} from '../types';
import {
    TrendingUpIcon, TrendingDownIcon, AlertTriangleIcon, DollarSignIcon,
    UsersIcon, CheckCircleIcon, ClockIcon, StarIcon, ActivityIcon
} from './common/Icon';
import { formatCurrency } from '../utils';

interface BITechnologyProps {
    leads: Lead[];
    financialData: FinancialData;
    employees: Employee[];
    reports: Report[];
    followUps: FollowUp[];
}

const COLORS = ['#D4AF37', '#1F2937', '#9CA3AF', '#E5E7EB', '#F59E0B', '#10B981'];

export const BITechnology: React.FC<BITechnologyProps> = ({ leads, financialData, employees, followUps }) => {

    // --- CALCULATIONS ---

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const getMonthData = (dateStr: string) => {
        const d = new Date(dateStr);
        return { month: d.getMonth(), year: d.getFullYear() };
    };

    // 1. Financial Metrics (Current Month vs Last Month)
    const financialMetrics = useMemo(() => {
        const calculateMonthlyRevenue = (month: number, year: number) => {
            return financialData.transactions
                .filter(t => {
                    const { month: m, year: y } = getMonthData(t.date);
                    return t.type === 'revenue' && m === month && y === year;
                })
                .reduce((sum, t) => sum + t.amount, 0);
        };

        const currentRevenue = calculateMonthlyRevenue(currentMonth, currentYear);
        const lastRevenue = calculateMonthlyRevenue(lastMonth, lastMonthYear);
        const revenueGrowth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

        // Data for Revenue Trend Chart
        const revenueTrendData = financialData.labels.map((label, index) => ({
            name: label,
            Receita: financialData.revenue[index] || 0,
            Despesas: financialData.expenses[index] || 0,
            Lucro: (financialData.revenue[index] || 0) - (financialData.expenses[index] || 0)
        }));

        return { currentRevenue, lastRevenue, revenueGrowth, revenueTrendData };
    }, [financialData, currentMonth, currentYear, lastMonth, lastMonthYear]);

    // 2. Lead Metrics
    const leadMetrics = useMemo(() => {
        const calculateMonthlyLeads = (month: number, year: number) => {
            return leads.filter(l => {
                const { month: m, year: y } = getMonthData(l.createdAt);
                return m === month && y === year;
            }).length;
        };

        const currentLeads = calculateMonthlyLeads(currentMonth, currentYear);
        const lastLeads = calculateMonthlyLeads(lastMonth, lastMonthYear);
        const leadGrowth = lastLeads > 0 ? ((currentLeads - lastLeads) / lastLeads) * 100 : 0;

        const totalWon = leads.filter(l => l.status === LeadStatus.Won || l.status === LeadStatus.Contacted).length; // Adjust logic if needed
        // Assuming 'Won' and 'Production' and 'Closed' means success. Let's use Won for now based on types.
        const actuallyWon = leads.filter(l => l.status === LeadStatus.Won).length;
        const totalClosed = leads.filter(l => l.status === LeadStatus.Won || l.status === LeadStatus.Lost).length;
        const conversionRate = totalClosed > 0 ? (actuallyWon / totalClosed) * 100 : 0;

        const leadsBySource = leads.reduce((acc, lead) => {
            acc[lead.source] = (acc[lead.source] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const sourceData = Object.keys(leadsBySource).map(source => ({
            name: source,
            value: leadsBySource[source]
        }));

        return { currentLeads, lastLeads, leadGrowth, conversionRate, sourceData };
    }, [leads, currentMonth, currentYear, lastMonth, lastMonthYear]);

    // 3. Project/Production Metrics
    const projectMetrics = useMemo(() => {
        const projectsByType = leads
            .filter(l => l.status === LeadStatus.Won) // Only consider won projects
            .reduce((acc, lead) => {
                acc[lead.projectType] = (acc[lead.projectType] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        const typeData = Object.keys(projectsByType).map(type => ({
            name: type,
            value: projectsByType[type]
        }));

        return { typeData };
    }, [leads]);

    // 4. Follow-up Metrics
    const followUpMetrics = useMemo(() => {
        if (!followUps || followUps.length === 0) return { total: 0, avgDuration: 0, avgRating: 0, outcomeData: [] };

        const total = followUps.length;
        const totalDuration = followUps.reduce((acc, current) => acc + (current.duration || 0), 0);
        const avgDuration = total > 0 ? totalDuration / total : 0;

        const ratings = followUps.filter(f => f.rating !== undefined && f.rating !== null).map(f => f.rating as number);
        const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

        const outcomeCounts = followUps.reduce((acc, curr) => {
            const outcome = curr.outcome || 'Sem Resultado';
            acc[outcome] = (acc[outcome] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const outcomeData = Object.entries(outcomeCounts).map(([name, value]) => ({ name, value }));

        return { total, avgDuration, avgRating, outcomeData };
    }, [followUps]);

    // 5. Alerts
    const alerts = useMemo(() => {
        const list = [];
        if (financialMetrics.revenueGrowth < -10) {
            list.push({ type: 'critical', message: `Queda crítica de receita: ${financialMetrics.revenueGrowth.toFixed(1)}% comparado ao mês anterior.` });
        } else if (financialMetrics.revenueGrowth < 0) {
            list.push({ type: 'warning', message: `Receita em queda leve: ${financialMetrics.revenueGrowth.toFixed(1)}%.` });
        }

        if (leadMetrics.leadGrowth < 0) {
            list.push({ type: 'warning', message: `Volume de leads caiu ${Math.abs(leadMetrics.leadGrowth).toFixed(1)}% este mês.` });
        }

        if (leadMetrics.conversionRate < 10 && leadMetrics.conversionRate > 0) {
            list.push({ type: 'warning', message: `Taxa de conversão baixa (${leadMetrics.conversionRate.toFixed(1)}%). Verifique a qualidade dos leads.` });
        }

        return list;
    }, [financialMetrics, leadMetrics]);

    const getOutcomeColor = (outcome: string) => {
        switch (outcome) {
            case 'Positivo': return '#10B981';
            case 'Negativo': return '#EF4444';
            case 'Neutro': return '#F59E0B';
            case 'Reagendado': return '#3B82F6';
            case 'Sem Resposta': return '#6B7280';
            default: return '#D1D5DB';
        }
    };

    return (
        <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-black text-brand-dark dark:text-white">DASHBOARD INTELIGENTE DE BI</h1>
                    <p className="text-gray-500">Análise de performance, crescimento e alertas estratégicos.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Mês Referência</p>
                    <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-brand-dark">
                        {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSignIcon className="w-16 h-16 text-brand-gold" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Receita Mensal</p>
                    <h3 className="text-3xl font-bold text-brand-dark dark:text-white mb-2">
                        {formatCurrency(financialMetrics.currentRevenue)}
                    </h3>
                    <div className={`flex items-center text-sm font-semibold ${financialMetrics.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {financialMetrics.revenueGrowth >= 0 ? <TrendingUpIcon className="w-4 h-4 mr-1" /> : <TrendingDownIcon className="w-4 h-4 mr-1" />}
                        {Math.abs(financialMetrics.revenueGrowth).toFixed(1)}% vs. mês anterior
                    </div>
                </div>

                {/* Leads Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <UsersIcon className="w-16 h-16 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Novos Leads</p>
                    <h3 className="text-3xl font-bold text-brand-dark dark:text-white mb-2">
                        {leadMetrics.currentLeads}
                    </h3>
                    <div className={`flex items-center text-sm font-semibold ${leadMetrics.leadGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {leadMetrics.leadGrowth >= 0 ? <TrendingUpIcon className="w-4 h-4 mr-1" /> : <TrendingDownIcon className="w-4 h-4 mr-1" />}
                        {Math.abs(leadMetrics.leadGrowth).toFixed(1)}% vs. mês anterior
                    </div>
                </div>

                {/* Conversion Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircleIcon className="w-16 h-16 text-green-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Taxa de Conversão</p>
                    <h3 className="text-3xl font-bold text-brand-dark dark:text-white mb-2">
                        {leadMetrics.conversionRate.toFixed(1)}%
                    </h3>
                    <p className="text-xs text-gray-400">Total Ganho / Total Fechado</p>
                </div>

                {/* Profit Card (Mock calculation based on trend data last point) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUpIcon className="w-16 h-16 text-purple-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Lucro Acumulado (YTD)</p>
                    {(() => {
                        const totalRev = financialData.revenue.reduce((a, b) => a + b, 0);
                        const totalExp = financialData.expenses.reduce((a, b) => a + b, 0);
                        const profit = totalRev - totalExp;
                        return (
                            <h3 className={`text-3xl font-bold mb-2 ${profit >= 0 ? 'text-brand-dark dark:text-white' : 'text-red-500'}`}>
                                {formatCurrency(profit)}
                            </h3>
                        )
                    })()}

                    <p className="text-xs text-gray-400">Receita Total - Despesas Total</p>
                </div>

                {/* Follow-up Volume Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ActivityIcon className="w-16 h-16 text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Follow-ups</p>
                    <h3 className="text-3xl font-bold text-brand-dark dark:text-white mb-2">
                        {followUpMetrics.total}
                    </h3>
                    <p className="text-xs text-gray-400">Interações Totais</p>
                </div>

                {/* Follow-up Duration Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ClockIcon className="w-16 h-16 text-orange-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Duração Média</p>
                    <h3 className="text-3xl font-bold text-brand-dark dark:text-white mb-2">
                        {followUpMetrics.avgDuration.toFixed(1)} min
                    </h3>
                    <p className="text-xs text-gray-400">Tempo médio por interação</p>
                </div>

                {/* Follow-up Quality Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <StarIcon className="w-16 h-16 text-yellow-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Qualidade Média</p>
                    <h3 className="text-3xl font-bold text-brand-dark dark:text-white mb-2">
                        {followUpMetrics.avgRating.toFixed(1)} / 5.0
                    </h3>
                    <p className="text-xs text-gray-400">Avaliação média de qualidade</p>
                </div>
            </div>

            {/* Alerts Section */}
            {alerts.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
                    <h4 className="flex items-center text-red-700 dark:text-red-400 font-bold mb-2">
                        <AlertTriangleIcon className="w-5 h-5 mr-2" />
                        Alertas de Crescimento & Performance
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-600 dark:text-red-300">
                        {alerts.map((alert, idx) => (
                            <li key={idx} className={alert.type === 'critical' ? 'font-bold' : ''}>{alert.message}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Financial Trend */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h4 className="font-bold text-lg mb-6 text-brand-dark dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700">
                        Tendência Financeira
                    </h4>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={financialMetrics.revenueTrendData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => formatCurrency(val)} tick={{ fill: '#9CA3AF' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="Receita" stroke="#D4AF37" fillOpacity={1} fill="url(#colorRevenue)" />
                                <Area type="monotone" dataKey="Lucro" stroke="#10B981" fillOpacity={1} fill="url(#colorProfit)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sales Composition */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h4 className="font-bold text-lg mb-6 text-brand-dark dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700">
                        Origem dos Leads
                    </h4>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={leadMetrics.sourceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {leadMetrics.sourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Secondary Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Types */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h4 className="font-bold text-lg mb-6 text-brand-dark dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700">
                        Projetos Fechados por Tipo
                    </h4>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={projectMetrics.typeData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#9CA3AF' }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                />
                                <Bar dataKey="value" fill="#D4AF37" radius={[0, 4, 4, 0]}>
                                    {projectMetrics.typeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Employee Performance (Simplified) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h4 className="font-bold text-lg mb-6 text-brand-dark dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700">
                        Top Vendedores (Receita)
                    </h4>
                    <ul className="space-y-4">
                        {employees
                            .filter(e => (e.role === 'Comercial' || e.role === 'CEO / Direção') && leads.some(l => l.ownerId === e.id && l.status === LeadStatus.Won))
                            .map(e => {
                                const val = leads.filter(l => l.ownerId === e.id && l.status === LeadStatus.Won).reduce((acc, curr) => acc + curr.value, 0);
                                return { ...e, val };
                            })
                            .sort((a, b) => b.val - a.val)
                            .slice(0, 5)
                            .map((e, idx) => (
                                <li key={e.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                    <div className="flex items-center">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>
                                            {idx + 1}
                                        </span>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">{e.name}</span>
                                    </div>
                                    <span className="font-bold text-brand-gold">{formatCurrency(e.val)}</span>
                                </li>
                            ))
                        }
                        {employees.filter(e => (e.role === 'Comercial' || e.role === 'CEO / Direção') && leads.some(l => l.ownerId === e.id && l.status === LeadStatus.Won)).length === 0 && (
                            <p className="text-gray-500 text-center py-4">Sem dados de vendas registados.</p>
                        )}
                    </ul>
                </div>
            </div>

            {/* Follow-up Distribution Chart Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h4 className="font-bold text-lg mb-6 text-brand-dark dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700">
                        Distribuição de Resultados de Follow-up
                    </h4>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={followUpMetrics.outcomeData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} allowDecimals={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {followUpMetrics.outcomeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getOutcomeColor(entry.name)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center text-center">
                    <div className="mb-4 p-4 bg-brand-gold/10 rounded-full">
                        <StarIcon className="w-12 h-12 text-brand-gold" />
                    </div>
                    <h4 className="text-xl font-bold text-brand-dark dark:text-white mb-2">Efetividade do Funil</h4>
                    <p className="text-gray-500 max-w-sm">
                        O acompanhamento constante (follow-up) aumenta em até 40% as chances de conversão.
                        Mantenha uma média de qualidade acima de 4.0 para garantir melhores resultados.
                    </p>
                </div>
            </div>
        </div>
    );
};
