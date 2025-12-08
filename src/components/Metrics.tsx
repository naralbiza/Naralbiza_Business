import React, { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from './common/Card';
import { Lead, Employee, Report, FinancialData, LeadStatus, ProjectType } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#dd84d8'];

interface MetricsProps {
    leads: Lead[];
    employees: Employee[];
    reports: Report[];
    financialData: FinancialData;
}

/**
 * Metrics page component.
 * Displays advanced analytics for sales, production, and marketing.
 */
export const Metrics: React.FC<MetricsProps> = ({ leads, employees, reports, financialData }) => {

    // --- Sales Metrics Calculation ---
    const salesMetrics = useMemo(() => {
        const closedWonLeads = leads.filter(l => l.status === LeadStatus.Closed || l.status === LeadStatus.Production);
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
                    .filter(l => l.ownerId === employee.id && (l.status === LeadStatus.Closed || l.status === LeadStatus.Production))
                    .reduce((sum, l) => sum + l.value, 0);
                return {
                    name: employee.name.split(' ')[0], // First name
                    Receita: employeeLeadsValue,
                };
            })
            .filter(item => item.Receita > 0)
            .sort((a, b) => b.Receita - a.Receita);

        return {
            conversionRate,
            averageDealSize,
            leadsBySourceChartData,
            revenueBySalesperson,
        };
    }, [leads, employees]);

    // --- Production Metrics Calculation ---
    const productionMetrics = useMemo(() => {
        const creativeReports = reports.filter(r => r.role === 'Creative') as Extract<Report, { role: 'Creative' }>[];
        const projectsByPhotographer = employees
            .filter(e => e.role === 'Creative')
            .map(employee => ({
                name: employee.name,
                Projetos: creativeReports.filter(r => r.employeeId === employee.id).length,
            }))
            .filter(item => item.Projetos > 0);

        const projectsByType = leads
            .filter(l => l.status === LeadStatus.Closed || l.status === LeadStatus.Production)
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
        <div className="p-8 space-y-8">
            <h2 className="text-3xl font-bold text-brand-dark dark:text-gray-100">Métricas e Análises</h2>

            {/* Sales Section */}
            <Card title="Métricas de Vendas" className="dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                        <p className="text-sm font-medium text-brand-secondary dark:text-gray-300">Taxa de Conversão</p>
                        <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">{salesMetrics.conversionRate.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                        <p className="text-sm font-medium text-brand-secondary dark:text-gray-300">Ticket Médio</p>
                        <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">Kz {salesMetrics.averageDealSize.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-semibold mb-4 text-center dark:text-gray-200">Leads por Origem</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={salesMetrics.leadsBySourceChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {salesMetrics.leadsBySourceChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-center dark:text-gray-200">Receita por Vendedor (Finalizados)</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={salesMetrics.revenueBySalesperson} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" unit="k" tickFormatter={(val) => `${val / 1000}`} />
                                <YAxis type="category" dataKey="name" width={80} />
                                <Tooltip formatter={(value: number) => `Kz ${value.toLocaleString('pt-BR')}`} />
                                <Bar dataKey="Receita" fill="#D4AF37" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Card>

            {/* Production Section */}
            <Card title="Métricas de Produção (Fotógrafos)" className="dark:bg-gray-800">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                        <p className="text-sm font-medium text-brand-secondary dark:text-gray-300">Projetos por Fotógrafo (Média)</p>
                        <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">{(productionMetrics.projectsByPhotographer.reduce((s, p) => s + p.Projetos, 0) / (productionMetrics.projectsByPhotographer.length || 1)).toFixed(1)}</p>
                    </div>
                     <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                        <p className="text-sm font-medium text-brand-secondary dark:text-gray-300">Total de Horas em Locação</p>
                        <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">{productionMetrics.totalHours}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div>
                        <h4 className="font-semibold mb-4 text-center dark:text-gray-200">Projetos por Tipo</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={productionMetrics.projectsByTypeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {productionMetrics.projectsByTypeChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-center dark:text-gray-200">Projetos por Fotógrafo (Relatados)</h4>
                        <ResponsiveContainer width="100%" height={300}>
                             <BarChart data={productionMetrics.projectsByPhotographer}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="Projetos" fill="#4B5563" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Card>
            
            {/* Marketing Section */}
            <Card title="Métricas de Marketing" className="dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                        <p className="text-sm font-medium text-brand-secondary dark:text-gray-300">Investimento em Marketing (Mês)</p>
                        <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">Kz {marketingMetrics.marketingSpend.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                        <p className="text-sm font-medium text-brand-secondary dark:text-gray-300">Custo por Lead (CPL)</p>
                        <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">Kz {marketingMetrics.costPerLead.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                        <p className="text-sm font-medium text-brand-secondary dark:text-gray-300">Retorno sobre Investimento (ROI)</p>
                        <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">{marketingMetrics.marketingROI.toFixed(1)}%</p>
                    </div>
                </div>
            </Card>

        </div>
    );
};