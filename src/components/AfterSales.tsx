import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UsersIcon,
    StarIcon,
    AwardIcon,
    TrendingUpIcon,
    MessageSquareIcon,
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
    ClockIcon,
    SearchIcon,
    ArrowUpRightIcon,
    ShareIcon
} from './common/Icon';
import { useData } from '../contexts/DataContext';
import { Feedback, Referral } from '../types';
import { FeedbackModal } from './modals/FeedbackModal';
import { ReferralModal } from './modals/ReferralModal';

// --- Helpers ---

const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(new Date(date));
};

// --- Components ---

const MetricCard: React.FC<{ title: string; value: string | number; subtitle?: string; icon: React.ElementType; color: string }> = ({
    title, value, subtitle, icon: Icon, color
}) => (
    <div className="bg-brand-dark/40 border border-gray-800 rounded-2xl p-6 transition-all hover:border-brand-gold/30 group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-${color}/10 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 text-${color}`} />
            </div>
            <div className="flex items-center text-xs text-brand-gold font-medium bg-brand-gold/10 px-2 py-1 rounded-full">
                <TrendingUpIcon className="w-3 h-3 mr-1" />
                +12%
            </div>
        </div>
        <div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{value}</span>
                {subtitle && <span className="text-xs text-gray-500 font-medium">{subtitle}</span>}
            </div>
        </div>
    </div>
);

export const AfterSales: React.FC = () => {
    const {
        clients, feedbacks, referrals, productionProjects,
        addFeedback, removeFeedback, addReferral, removeReferral
    } = useData();
    const [activeTab, setActiveTab] = useState<'overview' | 'followup' | 'feedback' | 'referral'>('overview');
    const [isAddFeedbackOpen, setIsAddFeedbackOpen] = useState(false);
    const [isAddReferralOpen, setIsAddReferralOpen] = useState(false);

    // --- Data Processing ---

    const stats = useMemo(() => {
        const avgNps = feedbacks.length > 0
            ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
            : '0.0';

        const totalReferrals = referrals.length;
        const convertedReferrals = referrals.filter(r => r.status === 'Converted').length;
        const conversionRate = totalReferrals > 0
            ? ((convertedReferrals / totalReferrals) * 100).toFixed(0)
            : '0';

        const completedProjects = productionProjects.filter(p => p.status === 'Finalizado').length;

        return { avgNps, totalReferrals, conversionRate, completedProjects };
    }, [feedbacks, referrals, productionProjects]);

    const followupQueue = useMemo(() => {
        // Projects marked as 'Finalizado' that haven't received feedback yet
        return productionProjects
            .filter(p => p.status === 'Finalizado')
            .filter(p => !feedbacks.some(f => f.projectId === p.id))
            .sort((a, b) => new Date(b.deliveryDate || '').getTime() - new Date(a.deliveryDate || '').getTime());
    }, [productionProjects, feedbacks]);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-3 text-brand-gold mb-2">
                        <AwardIcon className="w-5 h-5" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase">Excelência & Retenção</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase italic">
                        PÓS-VENDA
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddFeedbackOpen(true)}
                        className="flex items-center gap-2 bg-brand-gold text-black px-5 py-3 rounded-xl font-bold text-sm hover:bg-brand-gold/90 transition-all active:scale-95"
                    >
                        <PlusIcon className="w-4 h-4" />
                        NOVO FEEDBACK
                    </button>
                    <button
                        onClick={() => setIsAddReferralOpen(true)}
                        className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all active:scale-95"
                    >
                        <PlusIcon className="w-4 h-4" />
                        NOVA INDICAÇÃO
                    </button>
                </div>
            </header>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <MetricCard
                    title="Média NPS"
                    value={stats.avgNps}
                    subtitle="/ 5.0"
                    icon={StarIcon}
                    color="brand-gold"
                />
                <MetricCard
                    title="Indicações"
                    value={stats.totalReferrals}
                    subtitle="Totais"
                    icon={ShareIcon}
                    color="blue-400"
                />
                <MetricCard
                    title="Taxa Conversão"
                    value={`${stats.conversionRate}%`}
                    subtitle="Indicações"
                    icon={TrendingUpIcon}
                    color="emerald-400"
                />
                <MetricCard
                    title="Projetos Finalizados"
                    value={stats.completedProjects}
                    subtitle="Aguardando Follow-up"
                    icon={CheckCircleIcon}
                    color="purple-400"
                />
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-900 mb-8 p-1">
                {[
                    { id: 'overview', label: 'Dashboard', icon: TrendingUpIcon },
                    { id: 'followup', label: 'Fila de Follow-up', icon: ClockIcon, count: followupQueue.length },
                    { id: 'feedback', label: 'Testemunhos', icon: MessageSquareIcon },
                    { id: 'referral', label: 'Indicações', icon: UsersIcon }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            relative flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all rounded-t-xl
                            ${activeTab === tab.id ? 'text-brand-gold bg-brand-gold/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                        `}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold"
                            />
                        )}
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={`
                                ml-1 px-1.5 py-0.5 rounded-full text-[10px] leading-none
                                ${activeTab === tab.id ? 'bg-brand-gold text-black' : 'bg-gray-800 text-gray-400'}
                            `}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Summary Charts or Insights would go here */}
                            <div className="bg-brand-dark/30 border border-gray-800 rounded-2xl p-8 border-dashed flex flex-col items-center justify-center min-h-[400px]">
                                <TrendingUpIcon className="w-12 h-12 text-gray-700 mb-4" />
                                <h3 className="text-gray-400 font-bold mb-2 uppercase tracking-widest">Análise de Retenção</h3>
                                <p className="text-gray-600 text-sm max-w-xs text-center">
                                    Gráficos de evolução do NPS e taxa de recompra em desenvolvimento.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-sm font-black uppercase text-brand-gold border-l-2 border-brand-gold pl-4 tracking-widest mb-4">
                                    Últimos Feedbacks
                                </h3>
                                {feedbacks.slice(0, 3).map(f => (
                                    <div key={f.id} className="bg-brand-dark/40 border border-gray-800 rounded-xl p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center font-bold text-brand-gold">
                                                    {clients.find(c => c.id === f.clientId)?.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold text-sm">{clients.find(c => c.id === f.clientId)?.name}</h4>
                                                    <div className="flex gap-0.5 mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <StarIcon key={i} className={`w-3 h-3 ${i < f.rating ? 'text-brand-gold fill-brand-gold' : 'text-gray-700'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-500 uppercase font-black">{formatDate(f.date)}</span>
                                        </div>
                                        <p className="text-gray-400 text-sm italic italic">"{f.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'followup' && (
                        <div className="bg-brand-dark/40 border border-gray-800 rounded-2xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#0A0A0A] border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Projeto / Cliente</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Data de Entrega</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Status</th>
                                        <th className="px-6 py-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {followupQueue.map(project => (
                                        <tr key={project.id} className="hover:bg-brand-gold/[0.02] transition-colors group">
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold">{project.title}</span>
                                                    <span className="text-gray-500 text-xs">{clients.find(c => c.id === project.clientId)?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="text-gray-400 text-sm">
                                                    {project.deliveryDate ? formatDate(project.deliveryDate) : '--/--/----'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="bg-brand-gold/10 text-brand-gold text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-brand-gold/20">
                                                    Aguardando Feedback
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <button className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                    <ArrowUpRightIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {followupQueue.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center text-gray-500">
                                                Nenhum projeto pendente de follow-up no momento.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {feedbacks.map(f => (
                                <div key={f.id} className="bg-brand-dark/40 border border-gray-800 rounded-2xl p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => removeFeedback(f.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon key={i} className={`w-5 h-5 ${i < f.rating ? 'text-brand-gold fill-brand-gold' : 'text-gray-700'}`} />
                                        ))}
                                    </div>
                                    <p className="text-lg text-white font-medium mb-6 italic leading-relaxed">"{f.comment}"</p>
                                    <div className="flex items-center gap-4 mt-auto">
                                        <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center font-black text-brand-gold uppercase">
                                            {clients.find(c => c.id === f.clientId)?.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold">{clients.find(c => c.id === f.clientId)?.name}</h4>
                                            <span className="text-xs text-brand-gold font-bold uppercase tracking-widest">{f.testimonial ? 'Publicado' : 'Interno'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'referral' && (
                        <div className="bg-brand-dark/40 border border-gray-800 rounded-2xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#0A0A0A] border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Quem Indicou</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Indicado</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Recompensa</th>
                                        <th className="px-6 py-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {referrals.map(r => (
                                        <tr key={r.id} className="hover:bg-brand-gold/[0.02] transition-colors group">
                                            <td className="px-6 py-6 font-bold text-white">
                                                {clients.find(c => c.id === r.referrerClientId)?.name || 'Cliente Removido'}
                                            </td>
                                            <td className="px-6 py-6 text-gray-400">
                                                {r.referredClientName}
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className={`
                                                    text-[10px] font-black uppercase px-2.5 py-1 rounded-full border
                                                    ${r.status === 'Converted' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
                                                        r.status === 'Rejected' ? 'bg-red-400/10 text-red-400 border-red-400/20' :
                                                            'bg-blue-400/10 text-blue-400 border-blue-400/20'}
                                                `}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className={`
                                                    text-[10px] font-black uppercase px-2.5 py-1 rounded-full border
                                                    ${r.rewardStatus === 'Given' ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20' :
                                                        r.rewardStatus === 'Pending' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' :
                                                            'bg-gray-800 text-gray-500 border-gray-700'}
                                                `}>
                                                    {r.rewardStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <button onClick={() => removeReferral(r.id)} className="text-gray-600 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {referrals.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                                Nenhuma indicação registrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Modals */}
            <FeedbackModal
                isOpen={isAddFeedbackOpen}
                onClose={() => setIsAddFeedbackOpen(false)}
                onSave={addFeedback}
                clients={clients}
                projects={productionProjects}
            />
            <ReferralModal
                isOpen={isAddReferralOpen}
                onClose={() => setIsAddReferralOpen(false)}
                onSave={addReferral}
                clients={clients}
            />
        </div>
    );
};
