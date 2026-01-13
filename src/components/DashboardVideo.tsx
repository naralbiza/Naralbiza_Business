import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { ProductionStatus, ProjectType } from '../types';

export const DashboardVideo: React.FC = () => {
    const { productionProjects, clientApprovals } = useData();

    const stats = useMemo(() => {
        const videoProjects = productionProjects.filter(p => p.type === ProjectType.Corporate || p.type === ProjectType.Event); // Assuming Corporate/Event are video heavy, can refine

        const activeProjects = videoProjects.filter(p => p.status === ProductionStatus.Production || p.status === ProductionStatus.PostProduction).length;

        // Mocking values for now
        const hoursEditing = 0;
        const costPerMinute = 0;

        const approvals = clientApprovals.length;
        // Simple metric: % of approvals that are "Approved" vs total
        const approvalRate = approvals > 0
            ? Math.round((clientApprovals.filter(a => a.status === 'Aprovado').length / approvals) * 100)
            : 0;

        return {
            activeProjects,
            hoursEditing,
            costPerMinute,
            approvalRate
        };
    }, [productionProjects, clientApprovals]);

    return (
        <div className="p-8 pb-32">
            <h1 className="text-3xl font-black mb-8 text-white">🎥 DASHBOARD VÍDEO</h1>
            <div className="bg-brand-dark/50 border border-gray-800 rounded-2xl p-12 text-center">
                <h2 className="text-xl font-bold mb-4 text-brand-gold">Métricas de Edição & Produção</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                    <div className="bg-brand-dark border border-gray-800 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-2">Projetos Activos</p>
                        <p className="text-2xl font-black text-white">{stats.activeProjects}</p>
                    </div>
                    <div className="bg-brand-dark border border-gray-800 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-2">Horas Edição</p>
                        <p className="text-2xl font-black text-white">{stats.hoursEditing} h</p>
                    </div>
                    <div className="bg-brand-dark border border-gray-800 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-2">Custo / Minuto</p>
                        <p className="text-2xl font-black text-white">{stats.costPerMinute} AOA</p>
                    </div>
                    <div className="bg-brand-dark border border-gray-800 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-2">Aprovações</p>
                        <p className="text-2xl font-black text-blue-500">{stats.approvalRate} %</p>
                    </div>
                </div>
            </div>

            {/* Recent Video Projects */}
            <div className="mt-8 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white">Produções em Andamento</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-900/50 text-xs font-bold text-gray-500 uppercase">
                        <tr>
                            <th className="p-4">Título</th>
                            <th className="p-4">Tipo</th>
                            <th className="p-4">Prazo</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {productionProjects
                            .filter(p => (p.type === ProjectType.Corporate || p.type === ProjectType.Event) && p.status !== ProductionStatus.Completed)
                            .slice(0, 5)
                            .map(project => (
                                <tr key={project.id} className="hover:bg-gray-700/30">
                                    <td className="p-4 text-white font-medium">{project.title}</td>
                                    <td className="p-4 text-gray-400">{project.type}</td>
                                    <td className="p-4 text-gray-400">{new Date(project.deadline).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${project.status === ProductionStatus.Production ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
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
