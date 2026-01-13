import React, { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card } from './common/Card';
import { Lead, Employee, Report, CreativeReport, FinancialData, LeadStatus, ProjectType, SalesReport, HRReport } from '../types';
import { formatCurrency } from '../utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#dd84d8'];

interface MetricsProps {
    leads: Lead[];
    employees: Employee[];
    reports: Report[];
    financialData: FinancialData;
}

export const Metrics: React.FC<MetricsProps> = ({ leads, employees, reports, financialData }) => {

    // --- Sales Metrics Calculation ---
    const salesMetrics = useMemo(() => {
        const salesReports = reports.filter(r => r.role === 'Sales') as SalesReport[];
        const closedWonLeads = leads.filter(l => l.status === LeadStatus.Won);
        const conversionRate = leads.length > 0 ? (closedWonLeads.length / leads.length) * 100 : 0;
        const averageDealSize = closedWonLeads.length > 0 ? closedWonLeads.reduce((sum, l) => sum + l.value, 0) / closedWonLeads.length : 0;

        const leadsBySource = leads.reduce((acc, lead) => {
            acc[lead.source] = (acc[lead.source] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const leadsBySourceChartData = Object.keys(leadsBySource).map(source => ({
            name: source,
            value: leadsBySource[source],
        }));

        const revenueBySalesperson = employees
            .filter(e => e.role === 'Sales')
            .map(employee => {
                const employeeLeadsValue = leads
                    .filter(l => l.ownerId === employee.id && (l.status === LeadStatus.Won))
                    .reduce((sum, l) => sum + l.value, 0);
                return {
                    name: employee.name.split(' ')[0], // First name
                    Receita: employeeLeadsValue,
                };
            })
            .filter(item => item.Receita > 0)
            .sort((a, b) => b.Receita - a.Receita);

        // Weekly Revenue Trend from Reports
        const revenueTrendData = salesReports
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(r => ({
                date: new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                Receita: r.salesRevenue || 0,
            }));

        // Funnel Data (Aggregated from latest reports)
        const totalLeads = salesReports.reduce((sum, r) => sum + (r.leadsContacted || 0), 0);
        const totalQualified = salesReports.reduce((sum, r) => sum + (r.salesQualifiedLeads || 0), 0);
        const totalProposals = salesReports.reduce((sum, r) => sum + (r.salesProposalsSent || 0), 0);
        const totalContracts = salesReports.reduce((sum, r) => sum + (r.contractsSigned || 0), 0);

        const funnelData = [
            { name: 'Contactados', value: totalLeads },
            { name: 'Qualificados', value: totalQualified },
            { name: 'Propostas', value: totalProposals },
            { name: 'Contratos', value: totalContracts },
        ];

        return {
            conversionRate,
            averageDealSize,
            leadsBySourceChartData,
            revenueBySalesperson,
            revenueTrendData,
            funnelData,
            totalRevenue: salesReports.reduce((sum, r) => sum + (r.salesRevenue || 0), 0)
        };
    }, [leads, employees, reports]);

    // --- Production Metrics Calculation ---
    const productionMetrics = useMemo(() => {
        const creativeReports = reports.filter(r => r.role === 'Creative' || r.role === 'Photographer' || r.role === 'Videomaker') as CreativeReport[];
        const projectsByPhotographer = employees
            .filter(e => e.role === 'Creative' || e.role === 'Photographer' || e.role === 'Videomaker')
            .map(employee => ({
                name: employee.name,
                Projetos: creativeReports.filter(r => r.employeeId === employee.id).length,
            }))
            .filter(item => item.Projetos > 0);

        const projectsByType = leads
            .filter(l => l.status === LeadStatus.Won)
            .reduce((acc, lead) => {
                acc[lead.projectType] = (acc[lead.projectType] || 0) + 1;
                return acc;
            }, {} as Record<ProjectType, number>);

        const projectsByTypeChartData = Object.keys(projectsByType).map(type => ({
            name: type,
            value: projectsByType[type as ProjectType],
        }));

        const totalHours = creativeReports.reduce((sum, r) => sum + r.hoursOnLocation, 0);

        return { projectsByPhotographer, projectsByTypeChartData, totalHours };
    }, [reports, employees, leads]);

    // --- HR Metrics Calculation ---
    const hrMetrics = useMemo(() => {
        const hrReports = reports.filter(r => r.role === 'HR') as HRReport[];
        const sortedHR = hrReports.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const performanceTrend = sortedHR.map(r => ({
            date: new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            Performance: r.hrPerformanceScore || 0,
            Produtividade: r.hrProductivityScore || 0
        }));

        return { performanceTrend };
    }, [reports]);

    // --- Marketing Metrics Calculation ---
    const marketingMetrics = useMemo(() => {
        const marketingBudget = financialData.budgets.find(b => b.category === 'Marketing');
        const marketingSpend = marketingBudget ? marketingBudget.spent : 0;
        const totalLeads = leads.length;
        const costPerLead = totalLeads > 0 ? marketingSpend / totalLeads : 0;
        const totalRevenueFromLeads = leads.reduce((sum, l) => sum + l.value, 0);
        const marketingROI = marketingSpend > 0 ? ((totalRevenueFromLeads - marketingSpend) / marketingSpend) * 100 : 0;

        return { costPerLead, marketingROI, marketingSpend };
    }, [financialData, leads]);


    return (
        <div className="p-8 space-y-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <header className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold text-brand-dark dark:text-gray-100">Métricas e Análises por Área</h2>
            </header>

            {/* Sales Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-brand-primary rounded-full"></div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Vendas & Comercial</h3>
                </div>
                <Card className="dark:bg-gray-800 shadow-lg border-t-4 border-brand-primary">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-4 bg-blue-50 dark:bg-gray-700/50 rounded-xl text-center">
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Receita Total Relatada</p>
                            <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">{formatCurrency(salesMetrics.totalRevenue)}</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-gray-700/50 rounded-xl text-center">
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Ticket Médio (CRM)</p>
                            <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">{formatCurrency(salesMetrics.averageDealSize)}</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-gray-700/50 rounded-xl text-center">
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Conversão Global</p>
                            <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">{salesMetrics.conversionRate.toFixed(1)}%</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="h-[400px]">
                            <h4 className="font-semibold mb-6 text-center text-gray-600 dark:text-gray-300">Tendência de Receita Semanal</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesMetrics.revenueTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" />
                                    <YAxis tickFormatter={(val) => `Kz ${val / 1000}k`} />
                                    <Tooltip formatter={(val: any) => formatCurrency(val)} />
                                    <Legend />
                                    <Line type="monotone" dataKey="Receita" stroke="#D4AF37" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 10 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="h-[400px]">
                            <h4 className="font-semibold mb-6 text-center text-gray-600 dark:text-gray-300">Funil de Vendas (Acumulado)</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesMetrics.funnelData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#1E3A8A" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Production Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-green-500 rounded-full"></div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Produção & Criativo</h3>
                </div>
                <Card className="dark:bg-gray-800 shadow-lg border-t-4 border-green-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="p-4 bg-green-50 dark:bg-gray-700/50 rounded-xl text-center">
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Projetos por Fotógrafo (Média)</p>
                            <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">{(productionMetrics.projectsByPhotographer.reduce((s, p) => s + p.Projetos, 0) / (productionMetrics.projectsByPhotographer.length || 1)).toFixed(1)}</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-gray-700/50 rounded-xl text-center">
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Total de Horas em Locação</p>
                            <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">{productionMetrics.totalHours}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="h-[350px]">
                            <h4 className="font-semibold mb-4 text-center dark:text-gray-300">Projetos por Tipo</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={productionMetrics.projectsByTypeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                        {productionMetrics.projectsByTypeChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="h-[350px]">
                            <h4 className="font-semibold mb-4 text-center dark:text-gray-300">Projetos por Fotógrafo</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={productionMetrics.projectsByPhotographer}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="Projetos" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>
            </section>

            {/* HR & Performance Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-purple-500 rounded-full"></div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">RH & Performance</h3>
                </div>
                <Card className="dark:bg-gray-800 shadow-lg border-t-4 border-purple-500">
                    <div className="h-[400px]">
                        <h4 className="font-semibold mb-6 text-center text-gray-600 dark:text-gray-300">Evolução de Performance e Produtividade</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={hrMetrics.performanceTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="Performance" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 6 }} />
                                <Line type="monotone" dataKey="Produtividade" stroke="#EC4899" strokeWidth={3} dot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </section>

            {/* Marketing Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-orange-500 rounded-full"></div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Marketing & ROI</h3>
                </div>
                <Card className="dark:bg-gray-800 shadow-lg border-t-4 border-orange-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-orange-50 dark:bg-gray-700/50 rounded-xl text-center shadow-inner">
                            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Marketing Spend</p>
                            <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">{formatCurrency(marketingMetrics.marketingSpend)}</p>
                        </div>
                        <div className="p-6 bg-orange-50 dark:bg-gray-700/50 rounded-xl text-center shadow-inner">
                            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Custo por Lead (CPL)</p>
                            <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">{formatCurrency(marketingMetrics.costPerLead)}</p>
                        </div>
                        <div className="p-6 bg-orange-50 dark:bg-gray-700/50 rounded-xl text-center shadow-inner">
                            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Marketing ROI</p>
                            <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">{marketingMetrics.marketingROI.toFixed(1)}%</p>
                        </div>
                    </div>
                </Card>
            </section>
        </div>
    );
};