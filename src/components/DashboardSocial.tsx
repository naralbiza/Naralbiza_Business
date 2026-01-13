import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';

export const DashboardSocial: React.FC = () => {
    const { marketingMetrics, editorialContent } = useData();

    const stats = useMemo(() => {
        // Calculate totals across all metrics (assuming monthly entries)
        const totalReach = marketingMetrics.reduce((acc, curr) => acc + curr.reach, 0);
        const totalLeads = marketingMetrics.reduce((acc, curr) => acc + curr.leads, 0);
        const totalPosts = editorialContent.filter(c => c.status === 'Published').length;

        // ROI Estimation: (Total Leads * Avg Lead Value) / Investment
        // Assuming Avg Lead Value = 50,000 for calculation example (This should ideally come from config)
        const totalInvestment = marketingMetrics.reduce((acc, curr) => acc + curr.investment, 0);
        const roi = totalInvestment > 0 ? ((totalLeads * 50000) / totalInvestment).toFixed(1) : '0';

        return {
            totalReach,
            totalLeads,
            totalPosts,
            roi
        };
    }, [marketingMetrics, editorialContent]);

    return (
        <div className="p-8 pb-32">
            <h1 className="text-3xl font-black mb-8 text-white">📲 DASHBOARD SOCIAL MEDIA</h1>
            <div className="bg-brand-dark/50 border border-gray-800 rounded-2xl p-12 text-center">
                <h2 className="text-xl font-bold mb-4 text-brand-gold">Alcance & Conversão</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                    <div className="bg-brand-dark border border-gray-800 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-2">Publicações</p>
                        <p className="text-2xl font-black text-white">{stats.totalPosts}</p>
                    </div>
                    <div className="bg-brand-dark border border-gray-800 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-2">Alcance Total</p>
                        <p className="text-2xl font-black text-white">{stats.totalReach.toLocaleString()}</p>
                    </div>
                    <div className="bg-brand-dark border border-gray-800 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-2">Leads Gerados</p>
                        <p className="text-2xl font-black text-green-500">{stats.totalLeads}</p>
                    </div>
                    <div className="bg-brand-dark border border-gray-800 p-6 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-2">ROI Estimado</p>
                        <p className="text-2xl font-black text-brand-gold">{stats.roi}x</p>
                    </div>
                </div>
            </div>

            {/* Upcoming Content */}
            <div className="mt-8 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Calendário de Conteúdo (Próximos)</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-900/50 text-xs font-bold text-gray-500 uppercase">
                        <tr>
                            <th className="p-4">Título</th>
                            <th className="p-4">Plataforma</th>
                            <th className="p-4">Data</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {editorialContent
                            .filter(c => c.status !== 'Published')
                            .sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime())
                            .slice(0, 5)
                            .map(content => (
                                <tr key={content.id} className="hover:bg-gray-700/30">
                                    <td className="p-4 text-white font-medium">{content.title}</td>
                                    <td className="p-4 text-gray-400">{content.platform}</td>
                                    <td className="p-4 text-gray-400">{new Date(content.publishDate).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-blue-500/20 text-blue-500">
                                            {content.status}
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
