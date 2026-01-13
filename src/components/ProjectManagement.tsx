import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { ProductionProject, ProjectType, ProductionStatus } from '../types';
import { Card } from './common/Card';
import { Modal } from './common/Modal';
import {
    FinancialIcon,
    TrendingUpIcon,
    AlertTriangleIcon,
    ClockIcon,
    CheckCircleIcon,
    SearchIcon,
    FilterIcon,
    EditIcon,
    SaveIcon
} from './common/Icon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../utils';

export const ProjectManagement: React.FC = () => {
    const { productionProjects, updateProductionProjectData } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<{ budget: number; actualCost: number; hours: number }>({ budget: 0, actualCost: 0, hours: 0 });

    const filteredProjects = useMemo(() => {
        return productionProjects.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [productionProjects, searchTerm, statusFilter]);

    // Derived Statistics
    const stats = useMemo(() => {
        let totalRevenue = 0;
        let totalCost = 0;
        let totalHours = 0;
        let activeProjects = 0;

        filteredProjects.forEach(p => {
            totalRevenue += p.budget || 0;
            totalCost += p.actualCost || 0;
            // Parse hours from notes: "HOURS: 40"
            const hoursMatch = p.notes?.match(/HOURS:\s*(\d+)/);
            if (hoursMatch) {
                totalHours += parseInt(hoursMatch[1], 10);
            }
            if (p.status !== ProductionStatus.Completed) {
                activeProjects++;
            }
        });

        const profit = totalRevenue - totalCost;
        const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

        return { totalRevenue, totalCost, profit, margin, totalHours, activeProjects };
    }, [filteredProjects]);

    const chartData = useMemo(() => {
        // Group by Type
        const grouped = filteredProjects.reduce((acc, curr) => {
            const type = curr.type;
            if (!acc[type]) acc[type] = { name: type, Revenue: 0, Cost: 0, Profit: 0 };
            acc[type].Revenue += curr.budget || 0;
            acc[type].Cost += curr.actualCost || 0;
            acc[type].Profit += (curr.budget || 0) - (curr.actualCost || 0);
            return acc;
        }, {} as Record<string, any>);
        return Object.values(grouped);
    }, [filteredProjects]);

    const handleEditClick = (project: ProductionProject) => {
        setEditingId(project.id);
        const hoursMatch = project.notes?.match(/HOURS:\s*(\d+)/);
        setEditValues({
            budget: project.budget || 0,
            actualCost: project.actualCost || 0,
            hours: hoursMatch ? parseInt(hoursMatch[1], 10) : 0
        });
    };

    const handleSave = async (project: ProductionProject) => {
        // Update notes with new hours, preserving other notes
        let newNotes = project.notes || '';
        if (newNotes.includes('HOURS:')) {
            newNotes = newNotes.replace(/HOURS:\s*\d+/, `HOURS: ${editValues.hours}`);
        } else {
            newNotes = newNotes ? `${newNotes}\nHOURS: ${editValues.hours}` : `HOURS: ${editValues.hours}`;
        }

        await updateProductionProjectData({
            ...project,
            budget: editValues.budget,
            actualCost: editValues.actualCost,
            notes: newNotes
        });
        setEditingId(null);
    };

    const getProfitClass = (revenue: number, cost: number) => {
        const profit = revenue - cost;
        if (profit > 0) return 'text-green-600';
        if (profit < 0) return 'text-red-500';
        return 'text-gray-500';
    };

    return (
        <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div>
                <h1 className="text-3xl font-black text-brand-dark dark:text-white">GESTÃO & RENTABILIDADE</h1>
                <p className="text-gray-500">Controle financeiro detalhado por projeto, margens e horas dedicadas.</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Receita Total (Projetado)</p>
                            <p className="text-2xl font-black text-brand-dark dark:text-white">
                                {formatCurrency(stats.totalRevenue)}
                            </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full"><TrendingUpIcon className="w-6 h-6 text-green-600" /></div>
                    </div>
                </Card>
                <Card className="border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Custos Reais</p>
                            <p className="text-2xl font-black text-red-500">
                                {formatCurrency(stats.totalCost)}
                            </p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full"><FinancialIcon className="w-6 h-6 text-red-600" /></div>
                    </div>
                </Card>
                <Card className="border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Lucro Líquido</p>
                            <p className={`text-2xl font-black ${stats.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                {formatCurrency(stats.profit)}
                            </p>
                            <p className="text-xs text-gray-400">Margem: {stats.margin.toFixed(1)}%</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full"><FinancialIcon className="w-6 h-6 text-blue-600" /></div>
                    </div>
                </Card>
                <Card className="border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Horas Totais (Apontadas)</p>
                            <p className="text-2xl font-black text-brand-dark dark:text-white">{stats.totalHours}h</p>
                            <p className="text-xs text-gray-400">{stats.activeProjects} projetos ativos</p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full"><ClockIcon className="w-6 h-6 text-yellow-600" /></div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                        <div className="relative flex-grow">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar projetos..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-w-[150px]"
                        >
                            <option value="All">Todos Status</option>
                            {Object.values(ProductionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Financial Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs uppercase">
                                    <th className="p-4 font-bold">Projeto</th>
                                    <th className="p-4 font-bold text-right">Receita (Budget)</th>
                                    <th className="p-4 font-bold text-right">Custo Real</th>
                                    <th className="p-4 font-bold text-right">Horas</th>
                                    <th className="p-4 font-bold text-right">Lucro / Margem</th>
                                    <th className="p-4 font-bold text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredProjects.map(project => {
                                    const isEditing = editingId === project.id;
                                    const revenue = project.budget || 0;
                                    const cost = project.actualCost || 0;
                                    const profit = revenue - cost;
                                    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
                                    const hoursMatch = project.notes?.match(/HOURS:\s*(\d+)/);
                                    const hours = hoursMatch ? hoursMatch[1] : '0';

                                    return (
                                        <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                            <td className="p-4">
                                                <p className="font-bold text-brand-dark dark:text-gray-100">{project.title}</p>
                                                <span className="text-xs text-gray-400">{project.status} • {project.type}</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        className="w-24 p-1 border rounded text-right bg-white dark:bg-gray-600 dark:text-white"
                                                        value={editValues.budget}
                                                        onChange={e => setEditValues({ ...editValues, budget: Number(e.target.value) })}
                                                    />
                                                ) : (
                                                    <span className="text-gray-700 dark:text-gray-300">{formatCurrency(revenue)}</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        className="w-24 p-1 border rounded text-right bg-white dark:bg-gray-600 dark:text-white"
                                                        value={editValues.actualCost}
                                                        onChange={e => setEditValues({ ...editValues, actualCost: Number(e.target.value) })}
                                                    />
                                                ) : (
                                                    <span className="text-red-500">{formatCurrency(cost)}</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        className="w-16 p-1 border rounded text-right bg-white dark:bg-gray-600 dark:text-white"
                                                        value={editValues.hours}
                                                        onChange={e => setEditValues({ ...editValues, hours: Number(e.target.value) })}
                                                    />
                                                ) : (
                                                    <span className="text-gray-500">{hours}h</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className={`font-bold ${getProfitClass(revenue, cost)}`}>
                                                        {formatCurrency(profit)}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{margin.toFixed(1)}%</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                {isEditing ? (
                                                    <button
                                                        onClick={() => handleSave(project)}
                                                        className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                                                        title="Salvar"
                                                    >
                                                        <SaveIcon className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEditClick(project)}
                                                        className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
                                                        title="Editar Financeiro"
                                                    >
                                                        <EditIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredProjects.length === 0 && (
                            <div className="p-8 text-center text-gray-500">Nenhum projeto encontrado.</div>
                        )}
                    </div>
                </div>

                {/* Right Column Charts */}
                <div className="space-y-6">
                    <Card className="h-96">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4">Rentabilidade por Tipo</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <Tooltip
                                    formatter={(value: number) => `${formatCurrency(value)}`}
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Legend />
                                <Bar dataKey="Revenue" name="Receita" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                                <Bar dataKey="Cost" name="Custo" fill="#EF4444" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4">Destaques</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 rounded-lg"><CheckCircleIcon className="w-5 h-5 text-green-600" /></div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">Projeto Mais Rentável</p>
                                    <p className="text-xs text-gray-500">
                                        {filteredProjects.length > 0 ? filteredProjects.reduce((prev, current) => ((prev.budget || 0) - (prev.actualCost || 0)) > ((current.budget || 0) - (current.actualCost || 0)) ? prev : current).title : '-'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg"><AlertTriangleIcon className="w-5 h-5 text-yellow-600" /></div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">Maior Desvio de Custo</p>
                                    <p className="text-xs text-gray-500">
                                        {filteredProjects.length > 0 ? filteredProjects.reduce((prev, current) => (prev.actualCost || 0) > (current.actualCost || 0) ? prev : current).title : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
