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
        <div className="bg-white p-6 rounded-[32px] border-2 border-black/5 hover:border-brand-gold/30 hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-brand-gold/5 rounded-full blur-3xl group-hover:bg-brand-gold/10 transition-colors pointer-events-none`} />
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-black rounded-xl border border-brand-gold/30 group-hover:bg-gold-metallic group-hover:border-black transition-all duration-500 shadow-lg">
                    <Icon className="w-6 h-6 text-brand-gold group-hover:text-black" />
                </div>
                {trend && (
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
            <h3 className="text-3xl font-black text-black tracking-tighter group-hover:text-brand-gold transition-colors duration-300">{value}</h3>
        </div>
    );

    return (
        <div className="p-8 pb-24 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-black/5 pb-8">
                <div>
                    <h1 className="text-6xl font-black tracking-tighter text-black mb-4 flex items-center gap-4">
                        MARKETING
                        <span className="text-brand-gold relative">
                            & CONTEÚDO
                            <MarketingIcon className="w-12 h-12 absolute -top-8 -right-12 text-black/10 rotate-12" />
                        </span>
                    </h1>
                    <p className="text-black/40 font-black uppercase tracking-[0.2em] text-xs">Gestão de canais, CAC e calendário editorial</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => openMetricModal()}
                        className="flex items-center gap-3 bg-black hover:bg-gold-metallic hover:text-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 shadow-xl hover:shadow-brand-gold/20 group"
                    >
                        <PlusIcon className="w-5 h-5 text-brand-gold group-hover:text-black transition-colors" />
                        NOVA MÉTRICA
                    </button>
                    <button
                        onClick={() => openContentModal()}
                        className="flex items-center gap-3 bg-white hover:bg-black/5 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 border-2 border-black/5 hover:border-black/10"
                    >
                        <CalendarIcon className="w-5 h-5 text-black/20" />
                        AGENDAR
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
            <div className="flex items-center gap-1 bg-white p-2 rounded-[24px] border border-black/5 w-fit mb-12 shadow-sm">
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
                            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-gold-metallic text-black shadow-lg shadow-brand-gold/20 scale-105'
                                : 'text-black/40 hover:text-black hover:bg-black/5'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-black' : 'text-black/20'}`} />
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
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white p-8 rounded-[32px] border-2 border-black/5 shadow-xl shadow-black/[0.02]">
                                    <h3 className="text-2xl font-black text-black mb-8 tracking-tighter">Performance por Canal</h3>
                                    <div className="space-y-6">
                                        {['Instagram', 'Youtube', 'Facebook', 'Google Ads', 'Others'].map(channel => {
                                            const channelData = marketingMetrics.filter(m => m.channel === channel);
                                            const cLeads = channelData.reduce((sum, m) => sum + m.leads, 0);
                                            const cInvest = channelData.reduce((sum, m) => sum + m.investment, 0);
                                            const percentage = stats.totalLeads > 0 ? (cLeads / stats.totalLeads) * 100 : 0;

                                            return (
                                                <div key={channel} className="group">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-sm font-black text-black flex items-center gap-3 uppercase tracking-wider">
                                                            {channel === 'Instagram' && <InstagramIcon className="w-5 h-5 text-black" />}
                                                            {channel === 'Youtube' && <YoutubeIcon className="w-5 h-5 text-black" />}
                                                            {channel === 'Facebook' && <FacebookIcon className="w-5 h-5 text-black" />}
                                                            {channel === 'Google Ads' && <TargetIcon className="w-5 h-5 text-black" />}
                                                            {channel}
                                                        </span>
                                                        <span className="text-xs font-black text-black/40">{cLeads} Leads ({percentage.toFixed(0)}%)</span>
                                                    </div>
                                                    <div className="h-4 w-full bg-black/5 rounded-full overflow-hidden p-[2px]">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percentage}%` }}
                                                            className="h-full bg-black rounded-full transition-all duration-1000 shadow-lg shadow-black/20"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-[32px] border-2 border-black/5 shadow-xl shadow-black/[0.02]">
                                    <h3 className="text-2xl font-black text-black mb-8 tracking-tighter">Próximas Publicações</h3>
                                    <div className="space-y-4">
                                        {editorialContent
                                            .filter(c => c.status !== 'Published')
                                            .slice(0, 5)
                                            .map(content => (
                                                <div key={content.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-black/5 hover:border-brand-gold transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-brand-gold/10">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 bg-black text-brand-gold rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                            {content.format === 'Video' ? <PlayIcon className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-black text-black uppercase tracking-wide mb-1">{content.title}</h4>
                                                            <p className="text-[10px] text-black/40 font-black uppercase tracking-[0.2em]">
                                                                {content.platform} • {formatDate(content.publishDate)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider ${content.status === 'Draft' ? 'bg-black/5 text-black/40' :
                                                        content.status === 'Planned' ? 'bg-blue-100 text-blue-600' :
                                                            'bg-gold-metallic text-black'
                                                        }`}>
                                                        {content.status}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="bg-black rounded-[32px] p-8 text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                                    <div className="flex items-center gap-4 mb-6 relative z-10">
                                        <div className="p-3 bg-brand-gold/20 rounded-xl backdrop-blur-sm border border-brand-gold/20">
                                            <TrendingUpIcon className="w-6 h-6 text-brand-gold" />
                                        </div>
                                        <h3 className="text-xl font-black tracking-tight text-brand-gold">INVESTIMENTO ROI</h3>
                                    </div>
                                    <p className="text-[10px] font-black opacity-40 mb-2 uppercase tracking-[0.2em]">Eficiência de Conversão (ROAS)</p>
                                    <h4 className="text-5xl font-black mb-8 tracking-tighter">{stats.roi.toFixed(1)}x</h4>
                                    <div className="space-y-6 relative z-10">
                                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                            <span className="text-[10px] font-black uppercase tracking-wider opacity-60">CPL Médio Real</span>
                                            <span className="text-2xl font-black text-brand-gold">{formatCurrency(stats.avgCAC)}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Meta de Lead</span>
                                                <button
                                                    onClick={() => {
                                                        setLeadGoalTarget(stats.targetCPL);
                                                        setIsGoalModalOpen(true);
                                                    }}
                                                    className="text-[9px] font-black text-brand-gold hover:text-white transition-colors text-left uppercase tracking-widest border border-brand-gold/30 px-2 py-1 rounded bg-brand-gold/10 hover:bg-brand-gold/20 w-fit"
                                                >
                                                    Ajustar Meta
                                                </button>
                                            </div>
                                            <span className="text-2xl font-black text-white">{formatCurrency(stats.targetCPL)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-[32px] border-2 border-black/5 shadow-xl shadow-black/[0.02]">
                                    <h3 className="text-sm font-black text-black/40 mb-8 uppercase tracking-[0.2em]">Geração de Leads</h3>
                                    <div className="flex items-baseline gap-3 mb-2">
                                        <span className="text-5xl font-black text-black tracking-tighter">{stats.totalLeads}</span>
                                        <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-black">↑ 12%</span>
                                    </div>
                                    <p className="text-xs text-black/40 font-bold mb-8">Base total acumulada</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-black/5 rounded-2xl border border-black/5">
                                            <p className="text-[10px] text-black/40 font-black uppercase tracking-wider mb-2">Qualificados</p>
                                            <p className="text-2xl font-black text-black">{stats.qualifiedLeads}</p>
                                        </div>
                                        <div className="p-5 bg-black/5 rounded-2xl border border-black/5">
                                            <p className="text-[10px] text-black/40 font-black uppercase tracking-wider mb-2">Novos</p>
                                            <p className="text-2xl font-black text-black">{stats.newLeads}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'calendar' && (
                        <div className="bg-white rounded-[32px] border-2 border-black/5 overflow-hidden shadow-xl shadow-black/[0.02]">
                            <div className="p-8 border-b border-black/5 flex items-center justify-between">
                                <h3 className="text-2xl font-black text-black tracking-tighter">Calendário de Produção</h3>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                                        <input
                                            type="text"
                                            placeholder="Buscar conteúdo..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="bg-black/5 border-2 border-transparent hover:border-black/5 focus:border-brand-gold rounded-xl py-3 pl-10 pr-6 text-sm outline-none text-black w-72 transition-all font-bold placeholder:text-black/30"
                                        />
                                    </div>
                                    <button className="p-3 bg-white border-2 border-black/5 hover:border-black/20 rounded-xl transition-all shadow-sm hover:shadow-md">
                                        <FilterIcon className="w-5 h-5 text-black/60" />
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-black/5 border-b border-black/5">
                                            <th className="px-8 py-6 text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Data / Status</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Conteúdo</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Plataforma</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Responsável</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5">
                                        {editorialContent
                                            .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map(content => (
                                                <tr key={content.id} className="hover:bg-black/[0.02] transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-2">
                                                            <span className="text-sm font-black text-black">{formatDate(content.publishDate)}</span>
                                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase w-fit tracking-wider ${content.status === 'Published' ? 'bg-green-100 text-green-700' :
                                                                content.status === 'In Production' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-black/5 text-black/40'
                                                                }`}>
                                                                {content.status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-white rounded-xl border-2 border-black/5 flex items-center justify-center group-hover:border-brand-gold group-hover:bg-brand-gold/10 transition-all duration-300">
                                                                {content.format === 'Video' && <PlayIcon className="w-5 h-5 text-black" />}
                                                                {content.format === 'Photo' && <ImageIcon className="w-5 h-5 text-black" />}
                                                                {content.format === 'Article' && <FileTextIcon className="w-5 h-5 text-black" />}
                                                                {(content.format === 'Reel' || content.format === 'Story') && <PlayIcon className="w-5 h-5 text-black" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-black mb-1">{content.title}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-[10px] text-black/40 font-black uppercase tracking-wider">{content.format}</p>
                                                                    {content.visualBrief && (
                                                                        <>
                                                                            <span className="w-1 h-1 rounded-full bg-black/10" />
                                                                            <p className="text-[10px] text-brand-gold font-black uppercase tracking-wider truncate max-w-[200px]" title={content.visualBrief}>
                                                                                Briefing: {content.visualBrief}
                                                                            </p>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-sm font-bold text-black/60 flex items-center gap-2">
                                                            {content.platform === 'Instagram' && <InstagramIcon className="w-4 h-4 text-black" />}
                                                            {content.platform === 'Youtube' && <YoutubeIcon className="w-4 h-4 text-black" />}
                                                            {content.platform === 'Facebook' && <FacebookIcon className="w-4 h-4 text-black" />}
                                                            {content.platform}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-brand-gold text-black flex items-center justify-center border-2 border-white text-xs font-black shadow-md">
                                                                {employees.find(e => e.id === content.responsibleId)?.avatarUrl ? (
                                                                    <img src={employees.find(e => e.id === content.responsibleId)?.avatarUrl} alt="Avatar" />
                                                                ) : (
                                                                    <span>
                                                                        {employees.find(e => e.id === content.responsibleId)?.name?.charAt(0) || '?'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-sm text-black font-bold">{employees.find(e => e.id === content.responsibleId)?.name || 'Ninguém'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => openContentModal(content)}
                                                                className="p-2 hover:bg-black/5 rounded-lg text-black/40 hover:text-black transition-colors"
                                                            >
                                                                <EditIcon className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => removeEditorialContent(content.id)}
                                                                className="p-2 hover:bg-red-50 rounded-lg text-black/40 hover:text-red-500 transition-colors"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
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
                                        <div key={channel} className="bg-white p-8 rounded-[32px] border-2 border-black/5 hover:border-brand-gold/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                                            <div className="flex items-start justify-between mb-8">
                                                <div className="flex items-center gap-5">
                                                    <div className={`p-5 rounded-2xl bg-black shadow-lg`}>
                                                        {channel === 'Instagram' && <InstagramIcon className="w-8 h-8 text-white" />}
                                                        {channel === 'Youtube' && <YoutubeIcon className="w-8 h-8 text-white" />}
                                                        {channel === 'Facebook' && <FacebookIcon className="w-8 h-8 text-white" />}
                                                        {channel === 'Google Ads' && <TargetIcon className="w-8 h-8 text-white" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-3xl font-black text-black tracking-tighter">{channel}</h3>
                                                        <p className="text-xs font-black text-black/40 uppercase tracking-[0.2em]">{cMetrics.length} Registros</p>
                                                    </div>
                                                </div>
                                                <button className="p-3 bg-black/5 hover:bg-black/10 rounded-xl transition-colors">
                                                    <MoreHorizontalIcon className="w-5 h-5 text-black/60" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-6">
                                                <div className="p-4 rounded-2xl border-2 border-black/5 bg-black/[0.02]">
                                                    <p className="text-[10px] text-black/40 font-black uppercase mb-1 tracking-wider">Alcance</p>
                                                    <p className="text-xl font-black text-black">{totalReach.toLocaleString()}</p>
                                                </div>
                                                <div className="p-4 rounded-2xl border-2 border-black/5 bg-black/[0.02]">
                                                    <p className="text-[10px] text-black/40 font-black uppercase mb-1 tracking-wider">Leads</p>
                                                    <p className="text-xl font-black text-black">{totalLeads}</p>
                                                </div>
                                                <div className="p-4 rounded-2xl border-2 border-black/5 bg-black/[0.02]">
                                                    <p className="text-[10px] text-black/40 font-black uppercase mb-1 tracking-wider">CAC</p>
                                                    <p className="text-xl font-black text-brand-gold">{formatCurrency(cCAC)}</p>
                                                </div>
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-black/5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">Eficiência de Conversão</span>
                                                    <span className="text-[10px] font-black text-green-600 uppercase">Ótima</span>
                                                </div>
                                                <div className="h-3 w-full bg-black/5 rounded-full p-[2px]">
                                                    <div className="h-full bg-green-500 rounded-full w-[78%] shadow-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-white p-8 rounded-[32px] border-2 border-black/5 shadow-xl shadow-black/[0.02]">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-black tracking-tighter">Histórico de Investimento</h3>
                                    <div className="flex gap-2">
                                        <button className="px-5 py-2.5 bg-black/5 hover:bg-black/10 rounded-xl text-xs font-black text-black transition-colors uppercase tracking-wider">Exportar CSV</button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {marketingMetrics.slice(0, 5).map(m => (
                                        <div key={m.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-black/5 hover:border-brand-gold transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-brand-gold/10">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center w-16">
                                                    <p className="text-xl font-black text-black">{formatMonth(m.date).split(' ')[0]}</p>
                                                    <p className="text-[10px] text-black/40 font-black uppercase tracking-wider">{formatMonth(m.date).split(' ')[2]}</p>
                                                </div>
                                                <div className="h-10 w-px bg-black/5" />
                                                <div>
                                                    <p className="text-sm font-black text-black uppercase tracking-wide">{m.channel}</p>
                                                    <p className="text-[10px] font-black text-brand-gold uppercase tracking-wider">{formatCurrency(m.investment)} Inv.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[10px] text-black/40 font-black uppercase mb-0.5 tracking-wider">Engaj.</p>
                                                    <p className="text-lg font-black text-black">{m.engagement || 0}</p>
                                                </div>
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[10px] text-black/40 font-black uppercase mb-0.5 tracking-wider">Conv.</p>
                                                    <p className="text-lg font-black text-black">{m.conversions || 0}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-black/40 font-black uppercase mb-0.5 tracking-wider">Leads</p>
                                                    <p className="text-xl font-black text-black">{m.leads}</p>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openMetricModal(m)}
                                                        className="p-2 hover:bg-black/5 rounded-lg text-black/40 hover:text-black transition-colors"
                                                    >
                                                        <EditIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeMarketingMetric(m.id)}
                                                        className="p-2 hover:bg-red-50 rounded-lg text-black/40 hover:text-red-500 transition-colors"
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
                        <div className="bg-white rounded-[32px] border-2 border-black/5 overflow-hidden shadow-xl shadow-black/[0.02]">
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
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Valor Alvo (CPL em AOA)</label>
                        <input
                            type="number"
                            value={leadGoalTarget}
                            onChange={(e) => setLeadGoalTarget(parseFloat(e.target.value))}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                            step="0.01"
                            min="0.01"
                            required
                        />
                        <p className="text-[10px] text-black/40 italic font-medium">Esta meta é usada para comparar com o CAC real e calcular a eficiência das campanhas.</p>
                    </div>

                    <div className="flex gap-4 pt-6 mt-4 border-t border-black/5">
                        <button
                            type="button"
                            onClick={() => setIsGoalModalOpen(false)}
                            className="flex-1 px-6 py-4 rounded-xl font-black uppercase text-black/40 hover:text-black hover:bg-black/5 transition-all text-xs tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-black hover:bg-gold-metallic hover:text-black text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all duration-300 shadow-lg hover:shadow-brand-gold/20"
                        >
                            Salvar Meta
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
