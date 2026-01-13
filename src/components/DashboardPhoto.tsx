import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { ProductionStatus, ProjectType } from '../types';
import { formatCurrency } from '../utils';

export const DashboardPhoto: React.FC = () => {
    const { productionProjects, feedbacks } = useData();

    const stats = useMemo(() => {
        const photoProjects = productionProjects.filter(p => p.type === ProjectType.Portrait || p.type === ProjectType.Wedding || p.type === ProjectType.Event);

        const totalSessions = photoProjects.length;
        const activeProjects = photoProjects.filter(p => p.status !== ProductionStatus.Completed && p.status !== ProductionStatus.Delivery).length;

        // Mocking edition time as we don't have time logs yet. Can be improved later.
        const editionHours = 0;

        // Calculate satisfaction from feedbacks linked to these projects or all feedbacks if generic
        // Assuming feedbacks are linked to clients, not directly projects in all cases, but we'll try to filter by photo projects
        const photoFeedbacks = feedbacks; // Refine this filter if project links exist
        const averageSatisfaction = photoFeedbacks.length > 0
            ? (photoFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / photoFeedbacks.length).toFixed(1)
            : 'N/A';

        return {
            totalSessions,
            activeProjects,
            editionHours,
            averageSatisfaction,
            reworkRate: '0' // Placeholder
        };
    }, [productionProjects, feedbacks]);

    return (
        <div className="p-8 pb-32">
            <h1 className="text-3xl font-black mb-8 text-white">📸 DASHBOARD FOTOGRAFIA</h1>
            <div className="bg-brand-dark/50 border border-gray-800 rounded-2xl p-12 text-center">
                <h2 className="text-xl font-bold mb-4 text-brand-gold">Métricas de Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                    <div className="bg-brand-dark border border-gray-800 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-2">Projetos Activos</p>
                        <p className="text-2xl font-black text-white">{stats.activeProjects}</p>
                    </div>
                    <div className="bg-brand-dark border border-gray-800 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-2">Sessões Totais</p>
                        <p className="text-2xl font-black text-white">{stats.totalSessions}</p>
                    </div>
                    <div className="bg-brand-dark border border-gray-800 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-2">Retrabalho</p>
                        <p className="text-2xl font-black text-red-500">{stats.reworkRate}%</p>
                    </div>
                    <div className="bg-brand-dark border border-gray-800 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-2">Satisfação</p>
                        <p className="text-2xl font-black text-green-500">{stats.averageSatisfaction} <span className="text-sm text-gray-400">/ 5</span></p>
                    </div>
                </div>
            </div>

            {/* Recent Photo Projects Table */}
            <div className="mt-8 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white">Sessões Recentes</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-900/50 text-xs font-bold text-gray-500 uppercase">
                        <tr>
                            <th className="p-4">Título</th>
                            <th className="p-4">Tipo</th>
                            <th className="p-4">Data</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {productionProjects
                            .filter(p => p.type === ProjectType.Portrait || p.type === ProjectType.Wedding || p.type === ProjectType.Event)
                            .slice(0, 5)
                            .map(project => (
                                <tr key={project.id} className="hover:bg-gray-700/30">
                                    <td className="p-4 text-white font-medium">{project.title}</td>
                                    <td className="p-4 text-gray-400">{project.type}</td>
                                    <td className="p-4 text-gray-400">{new Date(project.startDate).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${project.status === ProductionStatus.Completed ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
