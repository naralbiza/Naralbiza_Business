import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { formatCurrency } from '../utils';
import {
    MarketingIcon, TrendingUpIcon, TargetIcon, DollarSignIcon,
    CalendarIcon, PlusIcon, SearchIcon, FilterIcon,
    InstagramIcon, YoutubeIcon, FacebookIcon, LinkedinIcon,
    MoreHorizontalIcon, EditIcon, TrashIcon, CheckCircleIcon,
    ClockIcon, PlayIcon, ImageIcon, FileTextIcon, MoreVerticalIcon,
    DAMIcon
} from './common/Icon';
import { MarketingMetric, EditorialContent, Goal, LeadStatus } from '../types';
import { MarketingMetricModal } from './modals/MarketingMetricModal';
import { EditorialContentModal } from './modals/EditorialContentModal';
import { Modal } from './common/Modal';
import { DAMContent } from './DAM';

// Helper for date formatting
const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
    } catch {
        return dateStr;
    }
};

const formatMonth = (monthStr: string) => {
    if (!monthStr) return '-';
    try {
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
    } catch {
        return monthStr;
    }
};


export const Marketing: React.FC = () => {
    const {
        marketingMetrics, editorialContent, employees, leads, goals,
        addMarketingMetric, updateMarketingMetricData, removeMarketingMetric,
        addEditorialContent, updateEditorialContentData, removeEditorialContent,
        addGoal, updateGoal
    } = useData();

    const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'channels' | 'dam'>('overview');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
    const [isContentModalOpen, setIsContentModalOpen] = useState(false);
    const [editingMetric, setEditingMetric] = useState<MarketingMetric | null>(null);
    const [editingContent, setEditingContent] = useState<EditorialContent | null>(null);

    // Goal editing
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [leadGoalTarget, setLeadGoalTarget] = useState(15);

    // Handlers
    const handleSaveMetric = async (metricData: Omit<MarketingMetric, 'id'>) => {
        if (editingMetric) {
            await updateMarketingMetricData({ ...metricData, id: editingMetric.id });
        } else {
            await addMarketingMetric(metricData);
        }
    };

    const handleSaveContent = async (contentData: Omit<EditorialContent, 'id'>) => {
        if (editingContent) {
            await updateEditorialContentData({ ...contentData, id: editingContent.id });
        } else {
            await addEditorialContent(contentData);
        }
    };

    const openMetricModal = (metric?: MarketingMetric) => {
        setEditingMetric(metric || null);
        setIsMetricModalOpen(true);
    };

    const openContentModal = (content?: EditorialContent) => {
        setEditingContent(content || null);
        setIsContentModalOpen(true);
    };

    // Lead Goal Logic
    const leadGoal = goals.find(g => g.title === 'Meta Lead - Custo');

    const handleSaveLeadGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (leadGoal) {
                await updateGoal({ ...leadGoal, target: leadGoalTarget });
            } else {
                await addGoal({
                    title: 'Meta Lead - Custo',
                    target: leadGoalTarget,
                    current: 0,
                    type: 'team',
                    unit: 'currency',
                    deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
                });
            }
            setIsGoalModalOpen(false);
        } catch (error) {
            console.error("Error saving lead goal:", error);
        }
    };

    // Aggregate Metrics
    const stats = useMemo(() => {
        const totalInvestment = marketingMetrics.reduce((sum, m) => sum + m.investment, 0);
        const totalLeads = marketingMetrics.reduce((sum, m) => sum + m.leads, 0);
        const avgCAC = totalLeads > 0 ? totalInvestment / totalLeads : 0;
        const totalReach = marketingMetrics.reduce((sum, m) => sum + (m.reach || 0), 0);

        // Advanced ROI Stats
        const totalRevenueFromLeads = leads
            .filter(l => l.status === LeadStatus.Won)
            .reduce((sum, l) => sum + l.value, 0);

        const roi = totalInvestment > 0 ? (totalRevenueFromLeads / totalInvestment) : 0;

        const qualifiedLeads = leads.filter(l => l.status !== LeadStatus.New && l.status !== LeadStatus.Lost).length;
        const newLeads = leads.filter(l => l.status === LeadStatus.New).length;

        return {
            totalInvestment,
            totalLeads,
            avgCAC,
            totalReach,
            roi,
            qualifiedLeads,
            newLeads,
            targetCPL: leadGoal?.target || 15
        };
    }, [marketingMetrics, leads, leadGoal]);

    const MetricCard = ({ title, value, icon: Icon, trend, color }: any) => (
        <div className="bg-brand-dark/50 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${color}/5 rounded-full blur-2xl group-hover:bg-${color}/10 transition-colors pointer-events-none`} />
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 bg-${color}/10 rounded-lg`}>
                    <Icon className={`w-5 h-5 text-${color}`} />
                </div>
                {trend && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-black text-white">{value}</h3>
        </div>
    );

    return (
        <div className="p-8 pb-24 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white mb-2 flex items-center gap-3">
                        <MarketingIcon className="w-10 h-10 text-brand-gold" />
                        MARKETING & CONTEÚDO
                    </h1>
                    <p className="text-gray-400 font-medium">Gestão de canais, CAC e calendário editorial.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => openMetricModal()}
                        className="flex items-center gap-2 bg-brand-gold hover:bg-white text-brand-dark px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-brand-gold/20"
                    >
                        <PlusIcon className="w-5 h-5" />
                        NOVA MÉTRICA
                    </button>
                    <button
                        onClick={() => openContentModal()}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 border border-white/10"
                    >
                        <CalendarIcon className="w-5 h-5 text-brand-gold" />
                        AGENDAR CONTEÚDO
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <MetricCard
                    title="Investimento Total"
                    value={formatCurrency(stats.totalInvestment)}
                    icon={DollarSignIcon}
                    color="brand-gold"
                />
                <MetricCard
                    title="Leads Gerados"
                    value={stats.totalLeads}
                    icon={TargetIcon}
                    color="blue-500"
                />
                <MetricCard
                    title="CAC Médio"
                    value={formatCurrency(stats.avgCAC)}
                    icon={TrendingUpIcon}
                    color="brand-gold"
                />
                <MetricCard
                    title="Alcance Estimado"
                    value={stats.totalReach.toLocaleString()}
                    icon={MarketingIcon}
                    color="purple-500"
                />
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 bg-brand-dark/30 p-1 rounded-2xl border border-white/5 w-fit mb-8">
                {[
                    { id: 'overview', label: 'Dashboard', icon: TrendingUpIcon },
                    { id: 'calendar', label: 'Calendário Editorial', icon: CalendarIcon },
                    { id: 'channels', label: 'Métricas por Canal', icon: MarketingIcon },
                    { id: 'dam', label: 'Ativos Críticos', icon: DAMIcon }
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-brand-gold text-brand-dark shadow-lg shadow-brand-gold/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-brand-dark/50 border border-gray-800 rounded-3xl p-8">
                                    <h3 className="text-xl font-bold text-white mb-6">Performance por Canal</h3>
                                    <div className="space-y-4">
                                        {['Instagram', 'Youtube', 'Facebook', 'Google Ads', 'Others'].map(channel => {
                                            const channelData = marketingMetrics.filter(m => m.channel === channel);
                                            const cLeads = channelData.reduce((sum, m) => sum + m.leads, 0);
                                            const cInvest = channelData.reduce((sum, m) => sum + m.investment, 0);
                                            const percentage = stats.totalLeads > 0 ? (cLeads / stats.totalLeads) * 100 : 0;

                                            return (
                                                <div key={channel} className="group">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-bold text-white flex items-center gap-2">
                                                            {channel === 'Instagram' && <InstagramIcon className="w-4 h-4 text-pink-500" />}
                                                            {channel === 'Youtube' && <YoutubeIcon className="w-4 h-4 text-red-600" />}
                                                            {channel === 'Facebook' && <FacebookIcon className="w-4 h-4 text-blue-600" />}
                                                            {channel === 'Google Ads' && <TargetIcon className="w-4 h-4 text-yellow-500" />}
                                                            {channel}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-500">{cLeads} Leads ({percentage.toFixed(0)}%)</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percentage}%` }}
                                                            className="h-full bg-brand-gold rounded-full transition-all duration-1000"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-brand-dark/50 border border-gray-800 rounded-3xl p-8">
                                    <h3 className="text-xl font-bold text-white mb-6">Próximas Publicações</h3>
                                    <div className="space-y-4">
                                        {editorialContent
                                            .filter(c => c.status !== 'Published')
                                            .slice(0, 5)
                                            .map(content => (
                                                <div key={content.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-brand-gold/30 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center">
                                                            {content.format === 'Video' ? <PlayIcon className="w-5 h-5 text-brand-gold" /> : <ImageIcon className="w-5 h-5 text-brand-gold" />}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-white">{content.title}</h4>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                                {content.platform} • {formatDate(content.publishDate)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-black px-2 py-1 rounded-md ${content.status === 'Draft' ? 'bg-gray-500/10 text-gray-500' :
                                                        content.status === 'Planned' ? 'bg-blue-500/10 text-blue-500' :
                                                            'bg-brand-gold/10 text-brand-gold'
                                                        }`}>
                                                        {content.status}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-brand-gold rounded-3xl p-8 text-brand-dark">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-brand-dark/10 rounded-lg">
                                            <TrendingUpIcon className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-black tracking-tight">INVESTIMENTO ROI</h3>
                                    </div>
                                    <p className="text-xs font-bold opacity-70 mb-2 uppercase">Eficiência de Conversão (ROAS)</p>
                                    <h4 className="text-3xl font-black mb-6">{stats.roi.toFixed(1)}x</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end border-b border-brand-dark/10 pb-2">
                                            <span className="text-[10px] font-bold uppercase">CPL Médio Real</span>
                                            <span className="text-lg font-black">{formatCurrency(stats.avgCAC)}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase">Meta de Lead</span>
                                                <button
                                                    onClick={() => {
                                                        setLeadGoalTarget(stats.targetCPL);
                                                        setIsGoalModalOpen(true);
                                                    }}
                                                    className="text-[8px] font-black text-brand-dark/60 hover:text-brand-dark transition-colors text-left uppercase"
                                                >
                                                    [Ajustar Meta]
                                                </button>
                                            </div>
                                            <span className="text-lg font-black">{formatCurrency(stats.targetCPL)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-brand-dark/50 border border-gray-800 rounded-3xl p-8">
                                    <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest">Geração de Leads</h3>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-4xl font-black text-white">{stats.totalLeads}</span>
                                        <span className="text-green-500 text-xs font-bold font-mono">↑ 12%</span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium mb-8">Base total acumulada</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/5 rounded-2xl">
                                            <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Qualificados</p>
                                            <p className="text-lg font-black text-white">{stats.qualifiedLeads}</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl">
                                            <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Novos</p>
                                            <p className="text-lg font-black text-white">{stats.newLeads}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'calendar' && (
                        <div className="bg-brand-dark/50 border border-gray-800 rounded-3xl overflow-hidden">
                            <div className="p-8 border-b border-gray-800 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">Calendário de Produção</h3>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Buscar conteúdo..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="bg-brand-dark/80 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-brand-gold outline-none text-white w-64"
                                        />
                                    </div>
                                    <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5">
                                        <FilterIcon className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-brand-dark/20">
                                            <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest">Data / Status</th>
                                            <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest">Conteúdo</th>
                                            <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest">Plataforma</th>
                                            <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest">Responsável</th>
                                            <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/50">
                                        {editorialContent
                                            .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map(content => (
                                                <tr key={content.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-2">
                                                            <span className="text-sm font-bold text-white">{formatDate(content.publishDate)}</span>
                                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase w-fit ${content.status === 'Published' ? 'bg-green-500/10 text-green-500' :
                                                                content.status === 'In Production' ? 'bg-orange-500/10 text-orange-500' :
                                                                    'bg-gray-500/10 text-gray-500'
                                                                }`}>
                                                                {content.status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center group-hover:border-brand-gold/30 transition-colors">
                                                                {content.format === 'Video' && <PlayIcon className="w-5 h-5 text-brand-gold" />}
                                                                {content.format === 'Photo' && <ImageIcon className="w-5 h-5 text-brand-gold" />}
                                                                {content.format === 'Article' && <FileTextIcon className="w-5 h-5 text-brand-gold" />}
                                                                {(content.format === 'Reel' || content.format === 'Story') && <PlayIcon className="w-5 h-5 text-pink-500" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white mb-0.5">{content.title}</p>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{content.format}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                            {content.platform === 'Instagram' && <InstagramIcon className="w-4 h-4 text-pink-500" />}
                                                            {content.platform === 'Youtube' && <YoutubeIcon className="w-4 h-4 text-red-600" />}
                                                            {content.platform === 'Facebook' && <FacebookIcon className="w-4 h-4 text-blue-600" />}
                                                            {content.platform}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-brand-gold/20 flex items-center justify-center border border-brand-gold/20 overflow-hidden text-[10px] shadow-inner">
                                                                {employees.find(e => e.id === content.responsibleId)?.avatarUrl ? (
                                                                    <img src={employees.find(e => e.id === content.responsibleId)?.avatarUrl} alt="Avatar" />
                                                                ) : (
                                                                    <span className="font-bold text-brand-gold">
                                                                        {employees.find(e => e.id === content.responsibleId)?.name?.charAt(0) || '?'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-sm text-gray-400 font-medium">{employees.find(e => e.id === content.responsibleId)?.name || 'Ninguém'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => openContentModal(content)}
                                                                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white border border-transparent hover:border-white/10"
                                                            >
                                                                <EditIcon className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => removeEditorialContent(content.id)}
                                                                className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 border border-transparent hover:border-red-500/10"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400">
                                                                <MoreVerticalIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'channels' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {['Instagram', 'Youtube', 'Facebook', 'Google Ads'].map(channel => {
                                    const cMetrics = marketingMetrics.filter(m => m.channel === channel);
                                    const totalReach = cMetrics.reduce((sum, m) => sum + m.reach, 0);
                                    const totalLeads = cMetrics.reduce((sum, m) => sum + m.leads, 0);
                                    const totalInvest = cMetrics.reduce((sum, m) => sum + m.investment, 0);
                                    const cCAC = totalLeads > 0 ? totalInvest / totalLeads : 0;

                                    return (
                                        <div key={channel} className="bg-brand-dark/50 border border-gray-800 rounded-3xl p-8 relative overflow-hidden group">
                                            <div className="flex items-start justify-between mb-8">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-4 rounded-2xl ${channel === 'Instagram' ? 'bg-pink-500/10' :
                                                        channel === 'Youtube' ? 'bg-red-500/10' :
                                                            channel === 'Facebook' ? 'bg-blue-500/10' :
                                                                'bg-yellow-500/10'
                                                        }`}>
                                                        {channel === 'Instagram' && <InstagramIcon className="w-8 h-8 text-pink-500" />}
                                                        {channel === 'Youtube' && <YoutubeIcon className="w-8 h-8 text-red-600" />}
                                                        {channel === 'Facebook' && <FacebookIcon className="w-8 h-8 text-blue-600" />}
                                                        {channel === 'Google Ads' && <TargetIcon className="w-8 h-8 text-yellow-500" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black text-white">{channel}</h3>
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{cMetrics.length} Registros</p>
                                                    </div>
                                                </div>
                                                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                                                    <MoreHorizontalIcon className="w-5 h-5 text-gray-500" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-6">
                                                <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                                    <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Alcance</p>
                                                    <p className="text-xl font-black text-white">{totalReach.toLocaleString()}</p>
                                                </div>
                                                <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                                    <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Leads</p>
                                                    <p className="text-xl font-black text-white">{totalLeads}</p>
                                                </div>
                                                <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                                    <p className="text-[10px] text-gray-500 font-black uppercase mb-1">CAC</p>
                                                    <p className="text-xl font-black text-brand-gold">{formatCurrency(cCAC)}</p>
                                                </div>
                                            </div>

                                            <div className="mt-8 pt-8 border-t border-gray-800/50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black text-gray-500 uppercase">Eficiência de Conversão</span>
                                                    <span className="text-[10px] font-black text-green-500 uppercase">Ótima</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 rounded-full">
                                                    <div className="h-full bg-green-500 rounded-full w-[78%]" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-brand-dark/50 border border-gray-800 rounded-3xl p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-white">Histórico de Investimento</h3>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-colors">Exportar CSV</button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {marketingMetrics.slice(0, 5).map(m => (
                                        <div key={m.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-brand-gold/30 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center w-16">
                                                    <p className="text-lg font-black text-white">{formatMonth(m.date).split(' ')[0]}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{formatMonth(m.date).split(' ')[2]}</p>
                                                </div>
                                                <div className="h-10 w-px bg-gray-800" />
                                                <div>
                                                    <p className="text-sm font-bold text-white">{m.channel}</p>
                                                    <p className="text-[10px] font-bold text-brand-gold uppercase">{formatCurrency(m.investment)} Inv.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 font-bold uppercase mb-0.5">Leads</p>
                                                    <p className="text-sm font-black text-white">{m.leads}</p>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openMetricModal(m)}
                                                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"
                                                    >
                                                        <EditIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeMarketingMetric(m.id)}
                                                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'dam' && (
                        <div className="bg-brand-dark/50 border border-gray-800 rounded-3xl overflow-hidden">
                            <DAMContent showHeader={false} />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <MarketingMetricModal
                isOpen={isMetricModalOpen}
                onClose={() => setIsMetricModalOpen(false)}
                onSave={handleSaveMetric}
                editingMetric={editingMetric}
            />

            <EditorialContentModal
                isOpen={isContentModalOpen}
                onClose={() => setIsContentModalOpen(false)}
                onSave={handleSaveContent}
                employees={employees}
                editingContent={editingContent}
            />

            {/* Lead Goal Adjustment Modal */}
            <Modal
                isOpen={isGoalModalOpen}
                onClose={() => setIsGoalModalOpen(false)}
                title="Ajustar Meta de Custo por Lead"
            >
                <form onSubmit={handleSaveLeadGoal} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Valor Alvo (CPL em AOA)</label>
                        <input
                            type="number"
                            value={leadGoalTarget}
                            onChange={(e) => setLeadGoalTarget(parseFloat(e.target.value))}
                            className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors"
                            step="0.01"
                            min="0.01"
                            required
                        />
                        <p className="text-xs text-gray-500 italic">Esta meta é usada para comparar com o CAC real e calcular a eficiência das campanhas.</p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsGoalModalOpen(false)}
                            className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white transition-colors border border-gray-800 hover:bg-white/5"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-brand-gold hover:bg-white text-brand-dark px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-brand-gold/20"
                        >
                            Salvar Meta
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
