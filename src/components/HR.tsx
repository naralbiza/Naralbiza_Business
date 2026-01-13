import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from './common/Card';
import { Report, Employee, HRReport, Lead, CalendarEvent } from '../types';
import { Reports } from './Reports';

interface HRProps {
    reports: Report[];
    employees: Employee[];
    currentUser: Employee;
    onAddReport: (report: Omit<Report, 'id'>) => void;
    onUpdateReport: (report: Report) => void;
    leads: Lead[];
    events: CalendarEvent[];
}

export const HR: React.FC<HRProps> = ({ reports, employees, currentUser, onAddReport, onUpdateReport, leads, events }) => {

    const hrReports = useMemo(() => {
        return reports
            .filter(r => r.role === 'HR')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) as HRReport[];
    }, [reports]);

    const chartData = useMemo(() => {
        return hrReports.map(report => ({
            date: new Date(report.date).toLocaleDateString('pt-BR'),
            Performance: report.hrPerformanceScore || 0,
            Produtividade: report.hrProductivityScore || 0,
        }));
    }, [hrReports]);

    const latestPerformance = hrReports.length > 0 ? hrReports[hrReports.length - 1].hrPerformanceScore : 0;
    const latestProductivity = hrReports.length > 0 ? hrReports[hrReports.length - 1].hrProductivityScore : 0;

    const averagePerformance = hrReports.length > 0
        ? hrReports.reduce((sum, r) => sum + (r.hrPerformanceScore || 0), 0) / hrReports.length
        : 0;

    const averageProductivity = hrReports.length > 0
        ? hrReports.reduce((sum, r) => sum + (r.hrProductivityScore || 0), 0) / hrReports.length
        : 0;

    return (
        <div className="p-8 space-y-8 bg-brand-light dark:bg-gray-900 min-h-screen">
            <h2 className="text-3xl font-bold text-brand-dark dark:text-gray-100">Painel de RH & Performance</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-sm font-medium text-brand-secondary dark:text-gray-400">Última Performance</p>
                    <p className="text-3xl font-bold text-blue-600">{latestPerformance}</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-sm font-medium text-brand-secondary dark:text-gray-400">Última Produtividade</p>
                    <p className="text-3xl font-bold text-green-600">{latestProductivity}</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-sm font-medium text-brand-secondary dark:text-gray-400">Média Performance</p>
                    <p className="text-3xl font-bold text-blue-800 dark:text-blue-400">{averagePerformance.toFixed(1)}</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-sm font-medium text-brand-secondary dark:text-gray-400">Média Produtividade</p>
                    <p className="text-3xl font-bold text-green-800 dark:text-green-400">{averageProductivity.toFixed(1)}</p>
                </div>
            </div>

            <Card title="Evolução de Desempenho e Produtividade">
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Performance" stroke="#2563EB" activeDot={{ r: 8 }} strokeWidth={2} />
                            <Line type="monotone" dataKey="Produtividade" stroke="#16A34A" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-brand-dark dark:text-gray-100">Relatórios de RH</h3>
                {/* Reuse Reports component but filter happens inside App or we pass props differently. 
                    Actually Reports component has its own filters. 
                    We can just render it here, maybe passing a default filter if possible, 
                    or just rendering it as is, and the user filters for HR. 
                    Since Reports component handles all reports, reusing it here is pragmatic.
                    Alternatively, I can copy logic, but re-using is better.
                */}
                <Reports
                    reports={reports.filter(r => r.role === 'HR')}
                    employees={employees}
                    currentUser={currentUser}
                    onAddReport={onAddReport}
                    onUpdateReport={onUpdateReport}
                    leads={leads}
                    events={events}
                />
            </div>
        </div>
    );
};
