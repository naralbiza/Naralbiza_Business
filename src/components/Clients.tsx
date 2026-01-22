import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Client, Interaction, ClientTag, Lead, Transaction, LeadStatus, ProjectType, Page, Complaint, UpsellOpportunity, ImportantDate, ProductionStatus, ProductionProject, Feedback } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './common/Card';
import { Modal } from './common/Modal';
import { PlusIcon, EditIcon, TrashIcon, CheckCircleIcon, FinancialIcon, SearchIcon, MailIcon, PhoneIcon, DollarSignIcon, CalendarIcon, ClockIcon, ActivityIcon, TrendingUpIcon, FilterIcon, SettingsIcon } from './common/Icon';
import { formatCurrency } from '../utils';
import { getClient } from '../services/api';

/**
 * A reusable button for the tab navigation in the detail modal.
 */
const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${active
            ? 'bg-gold-metallic text-black shadow-lg shadow-brand-gold/20 rounded-xl scale-105'
            : 'text-black/40 hover:text-black hover:bg-black/5 rounded-xl'
            }`}
    >
        {children}
    </button>
);


/**
 * Modal for creating a new client or editing an existing one.
 */
const ClientFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    clientToEdit: Client | null;
    onAddClient: (client: any) => Promise<void>;
    onUpdateClient: (client: Client) => Promise<void>;
}> = ({ isOpen, onClose, clientToEdit, onAddClient, onUpdateClient }) => {
    const { refreshData } = useData();
    const [client, setClient] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'Ativo' as 'Ativo' | 'Inativo',
        tags: [] as ClientTag[],
        birthday: '',
    });

    // Additional data for new client creation
    const [extraDates, setExtraDates] = useState<Omit<ImportantDate, 'id' | 'clientId'>[]>([]);
    const [extraProjects, setExtraProjects] = useState<Omit<ProductionProject, 'id' | 'clientId' | 'responsibleId' | 'teamIds' | 'progress' | 'budget'>[]>([]);
    const [activeTab, setActiveTab] = useState<'basic' | 'dates' | 'projects'>('basic');

    // Form states for adding items
    const [tempDate, setTempDate] = useState({ description: '', date: '', type: 'Event' as ImportantDate['type'] });
    const [tempProject, setTempProject] = useState({ title: '', type: ProjectType.Corporate, date: '' });

    const [newTagText, setNewTagText] = useState('');

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (clientToEdit) {
            setClient({
                name: clientToEdit.name,
                company: clientToEdit.company,
                email: clientToEdit.email,
                phone: clientToEdit.phone,
                status: clientToEdit.status,
                tags: clientToEdit.tags,
                birthday: clientToEdit.birthday || '',
            });
            setExtraDates([]);
            setExtraProjects([]);
        } else {
            setClient({
                name: '',
                company: '',
                email: '',
                phone: '',
                status: 'Ativo',
                tags: [],
                birthday: ''
            });
            setExtraDates([]);
            setExtraProjects([]);
            setActiveTab('basic');
        }
    }, [clientToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (clientToEdit) {
                await onUpdateClient({ ...clientToEdit, ...client });
            } else {
                await onAddClient({
                    ...client,
                    projects: extraProjects,
                    importantDates: extraDates
                });
            }
            onClose();
        } catch (e) {
            console.error("Error saving client:", e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setClient(prev => ({ ...prev, [name]: value }));
    };

    const addDate = () => {
        if (tempDate.description && tempDate.date) {
            setExtraDates([...extraDates, { ...tempDate }]);
            setTempDate({ description: '', date: '', type: 'Event' });
        }
    };

    const removeDate = (index: number) => {
        setExtraDates(prev => prev.filter((_, i) => i !== index));
    };

    const addProject = () => {
        if (tempProject.title && tempProject.date) {
            setExtraProjects([...extraProjects, { ...tempProject } as any]);
            setTempProject({ title: '', type: ProjectType.Corporate, date: '' });
        }
    };

    const removeProject = (index: number) => {
        setExtraProjects(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={clientToEdit ? 'Editar Cliente' : 'Novo Cliente'}>
            {!clientToEdit && (
                <div className="flex bg-black/5 p-1 rounded-2xl gap-1 mb-6">
                    <button
                        type="button"
                        className={`flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'basic' ? 'bg-black text-white shadow-xl' : 'text-black/40 hover:bg-black/5'}`}
                        onClick={() => setActiveTab('basic')}
                    >
                        Dados Básicos
                    </button>
                    <button
                        type="button"
                        className={`flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'dates' ? 'bg-black text-white shadow-xl' : 'text-black/40 hover:bg-black/5'}`}
                        onClick={() => setActiveTab('dates')}
                    >
                        Datas Importantes
                    </button>
                    <button
                        type="button"
                        className={`flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'projects' ? 'bg-black text-white shadow-xl' : 'text-black/40 hover:bg-black/5'}`}
                        onClick={() => setActiveTab('projects')}
                    >
                        Projetos Anteriores
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className={(clientToEdit || activeTab === 'basic') ? 'block space-y-5' : 'hidden'}>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Nome Completo</label>
                        <input name="name" value={client.name} onChange={handleChange} placeholder="Ex: João Silva" className="w-full p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black placeholder:text-black/20" required={activeTab === 'basic'} disabled={isSaving} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Empresa / Instituição</label>
                        <input name="company" value={client.company} onChange={handleChange} placeholder="Ex: Naralbiza Corp" className="w-full p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black placeholder:text-black/20" required={activeTab === 'basic'} disabled={isSaving} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">E-mail</label>
                            <input name="email" type="email" value={client.email} onChange={handleChange} placeholder="joao@exemplo.com" className="w-full p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black placeholder:text-black/20" required={activeTab === 'basic'} disabled={isSaving} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Telemóvel</label>
                            <input name="phone" value={client.phone} onChange={handleChange} placeholder="+351 912 345 678" className="w-full p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black placeholder:text-black/20" required={activeTab === 'basic'} disabled={isSaving} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Estado</label>
                            <select name="status" value={client.status} onChange={handleChange} className="w-full p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black" disabled={isSaving}>
                                <option value="Ativo">Ativo</option>
                                <option value="Inativo">Inativo</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Aniversário</label>
                            <input name="birthday" type="date" value={client.birthday} onChange={handleChange} className="w-full p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black" disabled={isSaving} />
                        </div>
                    </div>
                </div>

                {!clientToEdit && activeTab === 'dates' && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            {extraDates.map((d, i) => (
                                <div key={i} className="flex justify-between items-center bg-black/[0.02] p-4 rounded-2xl border border-black/5 hover:border-brand-gold/30 transition-all group">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">{d.type}</span>
                                        <span className="text-sm font-bold text-black">{d.description}</span>
                                        <span className="text-[10px] font-black text-brand-gold uppercase tracking-tighter">{new Date(d.date).toLocaleDateString()}</span>
                                    </div>
                                    <button type="button" onClick={() => removeDate(i)} className="p-2 text-black/20 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-black/[0.02] border-2 border-black/5 rounded-[32px] space-y-4">
                            <h5 className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Adicionar Data Especial</h5>
                            <input
                                placeholder="Descrição (ex: Casamento)"
                                value={tempDate.description}
                                onChange={e => setTempDate({ ...tempDate, description: e.target.value })}
                                className="w-full p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black placeholder:text-black/20 text-sm"
                            />
                            <div className="flex gap-3">
                                <input
                                    type="date"
                                    value={tempDate.date}
                                    onChange={e => setTempDate({ ...tempDate, date: e.target.value })}
                                    className="flex-1 p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black text-sm"
                                />
                                <select
                                    value={tempDate.type}
                                    onChange={e => setTempDate({ ...tempDate, type: e.target.value as any })}
                                    className="p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black text-sm"
                                >
                                    <option value="Anniversary">Aniversário</option>
                                    <option value="Event">Evento Social</option>
                                    <option value="Other">Outro</option>
                                </select>
                                <button type="button" onClick={addDate} className="bg-black text-white px-6 rounded-2xl font-black hover:bg-brand-gold hover:text-black transition-all shadow-xl">+</button>
                            </div>
                        </div>
                    </div>
                )}

                {!clientToEdit && activeTab === 'projects' && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            {extraProjects.map((p, i) => (
                                <div key={i} className="flex justify-between items-center bg-black/[0.02] p-4 rounded-2xl border border-black/5 hover:border-brand-gold/30 transition-all group">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">{p.type}</span>
                                        <span className="text-sm font-bold text-black">{p.title}</span>
                                        <span className="text-[10px] font-black text-brand-gold uppercase tracking-tighter">{new Date(p.date || '').toLocaleDateString()}</span>
                                    </div>
                                    <button type="button" onClick={() => removeProject(i)} className="p-2 text-black/20 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-black/[0.02] border-2 border-black/5 rounded-[32px] space-y-4">
                            <h5 className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Adicionar Projeto Anterior</h5>
                            <input
                                placeholder="Título do Projeto"
                                value={tempProject.title}
                                onChange={e => setTempProject({ ...tempProject, title: e.target.value })}
                                className="w-full p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black placeholder:text-black/20 text-sm"
                            />
                            <div className="flex gap-3">
                                <input
                                    type="date"
                                    value={tempProject.date}
                                    onChange={e => setTempProject({ ...tempProject, date: e.target.value })}
                                    className="flex-1 p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black text-sm"
                                />
                                <select
                                    value={tempProject.type}
                                    onChange={e => setTempProject({ ...tempProject, type: e.target.value as any })}
                                    className="p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black text-sm"
                                >
                                    {Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <button type="button" onClick={addProject} className="bg-black text-white px-6 rounded-2xl font-black hover:bg-brand-gold hover:text-black transition-all shadow-xl">+</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-4 mt-10">
                    <button type="button" onClick={onClose} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black hover:bg-black/5 transition-all" disabled={isSaving}>Cancelar</button>
                    <button type="submit" className="px-8 py-4 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-gold hover:text-black transition-all shadow-xl disabled:opacity-50" disabled={isSaving}>
                        {isSaving ? 'Processando...' : (clientToEdit ? 'Atualizar Cliente' : 'Finalizar Cadastro')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};


/**
 * A comprehensive modal showing all details for a selected client, organized into tabs.
 */
const ClientDetailModal: React.FC<{
    client: Client | null;
    leads: Lead[];
    transactions: Transaction[];
    onClose: () => void;
    onAddInteraction: (clientId: string, interaction: any) => Promise<void>;
    onAddFeedback: (feedback: any) => Promise<void>;
    onAddComplaint: (complaint: any) => Promise<void>;
    onAddUpsellOpportunity: (opp: any) => Promise<void>;
    onAddImportantDate: (date: any) => Promise<void>;
    onAddProductionProject: (project: any) => Promise<void>;
}> = ({
    client, leads, transactions, onClose,
    onAddInteraction, onAddFeedback, onAddComplaint,
    onAddUpsellOpportunity, onAddImportantDate, onAddProductionProject
}) => {
        const { hasPermission, currentUser } = useAuth();
        const { refreshData } = useData();
        const canEdit = hasPermission(Page.Clients, 'edit');
        const [activeTab, setActiveTab] = useState<'overview' | 'interactions' | 'projects' | 'financials' | 'complaints' | 'feedback' | 'upsell' | 'dates'>('overview');
        const [newInteraction, setNewInteraction] = useState({ type: 'Email' as Interaction['type'], notes: '' });
        const [newComplaint, setNewComplaint] = useState({ description: '', severity: 'Média' as Complaint['severity'] });
        const [newUpsell, setNewUpsell] = useState({ description: '', value: 0 });
        const [newDate, setNewDate] = useState({ description: '', date: '', type: 'Event' as ImportantDate['type'] });
        const [newFeedback, setNewFeedback] = useState({ comment: '', rating: 5, testimonial: false });
        const [newProject, setNewProject] = useState({ title: '', type: ProjectType.Corporate, date: '' });



        const [isSaving, setIsSaving] = useState(false);

        // State for full client details
        const [fullClient, setFullClient] = useState<Client | null>(client);
        const [loadingDetails, setLoadingDetails] = useState(false);

        useEffect(() => {
            if (client) {
                setFullClient(client); // Start with basic info
                setLoadingDetails(true);
                getClient(client.id)
                    .then(data => {
                        setFullClient(data);
                    })
                    .catch(err => console.error("Failed to load client details:", err))
                    .finally(() => setLoadingDetails(false));
            }
        }, [client]);

        if (!client) return null;

        // Use fullClient for details, fallback to client or empty arrays
        const displayClient = fullClient || client;

        const relatedLeads = leads.filter(lead => lead.company.toLowerCase() === client.company.toLowerCase());
        const relatedTransactions = transactions.filter(t => t.description.toLowerCase().includes(client.name.toLowerCase()));

        const handleAddInteraction = async (e: React.FormEvent) => {
            e.preventDefault();
            if (client && newInteraction.notes.trim()) {
                setIsSaving(true);
                try {
                    await onAddInteraction(client.id, { ...newInteraction, date: new Date().toISOString() });
                    setNewInteraction({ type: 'Email', notes: '' });
                } catch (e) {
                    console.error("Error adding interaction:", e);
                } finally {
                    setIsSaving(false);
                }
            }
        };

        const handleAddComplaint = async (e: React.FormEvent) => {
            e.preventDefault();
            if (client && newComplaint.description.trim()) {
                setIsSaving(true);
                try {
                    await onAddComplaint({ ...newComplaint, clientId: client.id, date: new Date().toISOString(), status: 'Pendente' });
                    setNewComplaint({ description: '', severity: 'Média' });
                    refreshData();
                } catch (e) {
                    console.error("Error adding complaint:", e);
                } finally {
                    setIsSaving(false);
                }
            }
        };

        const handleAddUpsell = async (e: React.FormEvent) => {
            e.preventDefault();
            if (client && newUpsell.description.trim()) {
                setIsSaving(true);
                try {
                    await onAddUpsellOpportunity({ ...newUpsell, clientId: client.id, date: new Date().toISOString(), status: 'Identificada' });
                    setNewUpsell({ description: '', value: 0 });
                    refreshData();
                } catch (e) {
                    console.error("Error adding upsell:", e);
                } finally {
                    setIsSaving(false);
                }
            }
        };

        const handleAddImportantDate = async (e: React.FormEvent) => {
            e.preventDefault();
            if (client && newDate.description.trim() && newDate.date) {
                setIsSaving(true);
                try {
                    await onAddImportantDate({ ...newDate, clientId: client.id });
                    setNewDate({ description: '', date: '', type: 'Event' });
                    refreshData();
                } catch (e) {
                    console.error("Error adding date:", e);
                } finally {
                    setIsSaving(false);
                }
            }
        };

        const handleAddFeedback = async (e: React.FormEvent) => {
            e.preventDefault();
            if (client && newFeedback.comment.trim()) {
                setIsSaving(true);
                try {
                    await onAddFeedback({
                        clientId: client.id,
                        comment: newFeedback.comment,
                        rating: newFeedback.rating,
                        testimonial: newFeedback.testimonial,
                        date: new Date().toISOString(),
                        status: 'Pending'
                    });
                    setNewFeedback({ comment: '', rating: 5, testimonial: false });
                    refreshData();
                } catch (e) {
                    console.error("Error adding feedback:", e);
                } finally {
                    setIsSaving(false);
                }
            }
        };

        const handleAddProject = async (e: React.FormEvent) => {
            e.preventDefault();
            if (client && newProject.title.trim()) {
                setIsSaving(true);
                try {
                    await onAddProductionProject({
                        clientId: client.id,
                        title: newProject.title,
                        type: newProject.type,
                        status: ProductionStatus.Completed,
                        startDate: newProject.date || new Date().toISOString().split('T')[0],
                        deadline: newProject.date || new Date().toISOString().split('T')[0],
                        responsibleId: currentUser?.id || '',
                        teamIds: [],
                        progress: 100,
                        budget: 0
                    });
                    setNewProject({ title: '', type: ProjectType.Corporate, date: '' });
                    refreshData();
                } catch (e) {
                    console.error("Error adding project:", e);
                } finally {
                    setIsSaving(false);
                }
            }
        };

        const ClientHealth: React.FC<{ client: Client }> = ({ client }) => {
            const healthScore = useMemo(() => {
                let score = 0;
                if (client.totalRevenue > 100000) score += 40; else if (client.totalRevenue > 20000) score += 20;
                if (client.interactionHistory.length > 5) score += 40; else if (client.interactionHistory.length > 1) score += 20;
                if (client.status === 'Ativo') score += 20;
                return Math.min(score, 100);
            }, [client]);

            const getHealthColor = () => {
                if (healthScore >= 70) return 'bg-gold-metallic';
                if (healthScore >= 40) return 'bg-black/40';
                return 'bg-black/10';
            };

            return (
                <div className="bg-black text-white p-6 rounded-[32px] border border-brand-gold/20 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-[60px] group-hover:bg-brand-gold/10 transition-all"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h4 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] mb-1">Qualidade do Relacionamento</h4>
                                <div className="text-2xl font-black tracking-tighter">ÍNDICE DE SAÚDE</div>
                            </div>
                            <div className="text-4xl font-black text-brand-gold tracking-tighter">{healthScore}%</div>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden border border-white/5">
                            <div className={`h-full rounded-full transition-all duration-1000 ${getHealthColor()}`} style={{ width: `${healthScore}%` }}></div>
                        </div>
                        <div className="mt-4 flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Premium</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-white/20"></div>
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Estável</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        };

        return (
            <Modal isOpen={!!client} onClose={onClose} title={`Perfil de ${client.name}`}>
                <div className="overflow-x-auto custom-scrollbar-hide pb-2 mb-6">
                    <nav className="flex space-x-2 min-w-max">
                        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Visão Geral</TabButton>
                        <TabButton active={activeTab === 'interactions'} onClick={() => setActiveTab('interactions')}>Histórico {loadingDetails && activeTab !== 'interactions' ? '...' : ''}</TabButton>
                        <TabButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')}>Projetos</TabButton>
                        <TabButton active={activeTab === 'financials'} onClick={() => setActiveTab('financials')}>Financeiro</TabButton>
                        <TabButton active={activeTab === 'complaints'} onClick={() => setActiveTab('complaints')}>Reclamações</TabButton>
                        <TabButton active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')}>Feedback</TabButton>
                        <TabButton active={activeTab === 'upsell'} onClick={() => setActiveTab('upsell')}>Vendas</TabButton>
                        <TabButton active={activeTab === 'dates'} onClick={() => setActiveTab('dates')}>Datas</TabButton>
                    </nav>
                </div>

                <div className="min-h-[400px]">
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 bg-black/[0.02] border-2 border-black/5 rounded-[32px] flex items-center gap-5 hover:bg-white hover:shadow-xl transition-all group">
                                    <div className="p-4 bg-black rounded-2xl border border-brand-gold/30 shadow-xl group-hover:bg-gold-metallic transition-all">
                                        <PlusIcon className="w-6 h-6 text-brand-gold group-hover:text-black" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-black/40 uppercase tracking-[0.2em]">Nome do Cliente</span>
                                        <span className="text-lg font-black text-black tracking-tight">{client.name}</span>
                                    </div>
                                </div>
                                <div className="p-6 bg-black/[0.02] border-2 border-black/5 rounded-[32px] flex items-center gap-5 hover:bg-white hover:shadow-xl transition-all group">
                                    <div className="p-4 bg-black rounded-2xl border border-brand-gold/30 shadow-xl group-hover:bg-gold-metallic transition-all">
                                        <CheckCircleIcon className="w-6 h-6 text-brand-gold group-hover:text-black" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-black/40 uppercase tracking-[0.2em]">Empresa</span>
                                        <span className="text-lg font-black text-black tracking-tight">{client.company}</span>
                                    </div>
                                </div>
                                <div className="p-6 bg-black/[0.02] border-2 border-black/5 rounded-[32px] flex items-center gap-5 hover:bg-white hover:shadow-xl transition-all group">
                                    <div className="p-4 bg-black rounded-2xl border border-brand-gold/30 shadow-xl group-hover:bg-gold-metallic transition-all">
                                        <MailIcon className="w-6 h-6 text-brand-gold group-hover:text-black" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-black/40 uppercase tracking-[0.2em]">Contacto Principal</span>
                                        <span className="text-lg font-black text-black tracking-tight">{client.email}</span>
                                        <span className="text-[10px] font-bold text-black/30 tracking-widest">{client.phone}</span>
                                    </div>
                                </div>
                                <div className="p-6 bg-black/[0.02] border-2 border-black/5 rounded-[32px] flex items-center gap-5 hover:bg-white hover:shadow-xl transition-all group">
                                    <div className="p-4 bg-black rounded-2xl border border-brand-gold/30 shadow-xl group-hover:bg-gold-metallic transition-all">
                                        <CalendarIcon className="w-6 h-6 text-brand-gold group-hover:text-black" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-black/40 uppercase tracking-[0.2em]">Data de Adesão</span>
                                        <span className="text-lg font-black text-black tracking-tight">{new Date(client.since).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-black/[0.02] border-2 border-black/5 rounded-[40px]">
                                <h4 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-4">Categorização & Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {client.tags.length > 0 ? client.tags.map((t, idx) => (
                                        <span key={idx} className="px-5 py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-brand-gold/20 shadow-lg">
                                            {t.text}
                                        </span>
                                    )) : (
                                        <span className="text-[10px] font-black text-black/20 uppercase tracking-widest italic">Nenhuma tag atribuída</span>
                                    )}
                                </div>
                            </div>
                            <ClientHealth client={client} />
                        </div>
                    )}
                    {activeTab === 'interactions' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <h4 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2">Histórico Cronológico</h4>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                {loadingDetails ? (
                                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                        <div className="w-12 h-12 border-4 border-black/5 border-t-brand-gold rounded-full animate-spin"></div>
                                        <p className="text-[10px] font-black text-black/40 uppercase tracking-widest leading-none">Sincronizando Histórico...</p>
                                    </div>
                                ) : (displayClient.interactionHistory && displayClient.interactionHistory.length > 0) ? (
                                    [...displayClient.interactionHistory].reverse().map(item => (
                                        <div key={item.id} className="p-5 bg-white border-2 border-black/5 rounded-[24px] hover:border-brand-gold/30 transition-all group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                    {item.type}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-black/30 font-black uppercase tracking-widest">
                                                    <ClockIcon className="w-3 h-3" />
                                                    {new Date(item.date).toLocaleDateString('pt-BR')}
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-black leading-relaxed">{item.notes}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 bg-black/[0.02] border-2 border-dashed border-black/5 rounded-[40px]">
                                        <ActivityIcon className="w-12 h-12 text-black/10 mb-4" />
                                        <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Nenhuma atividade registrada</p>
                                    </div>
                                )}
                            </div>
                            {canEdit && (
                                <form onSubmit={handleAddInteraction} className="p-6 bg-black text-white rounded-[32px] border border-brand-gold/20 shadow-2xl space-y-4">
                                    <h4 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em]">Registrar Nova Interação</h4>
                                    <div className="flex gap-3">
                                        <select
                                            value={newInteraction.type}
                                            onChange={(e) => setNewInteraction(prev => ({ ...prev, type: e.target.value as Interaction['type'] }))}
                                            className="bg-white/10 border border-white/10 rounded-2xl px-4 text-sm font-bold text-white focus:outline-none focus:border-brand-gold/50"
                                            disabled={isSaving}
                                        >
                                            <option className="bg-black">Email</option>
                                            <option className="bg-black">Call</option>
                                            <option className="bg-black">Meeting</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Notas detalhadas..."
                                            value={newInteraction.notes}
                                            onChange={(e) => setNewInteraction(prev => ({ ...prev, notes: e.target.value }))}
                                            className="flex-grow bg-white/10 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-brand-gold/50"
                                            required
                                            disabled={isSaving}
                                        />
                                        <button
                                            type="submit"
                                            className="px-6 py-3 bg-brand-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl disabled:opacity-50"
                                            disabled={isSaving}
                                        >
                                            Adicionar
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                    {activeTab === 'projects' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-1">Portfolio do Cliente</h4>
                                    <div className="text-2xl font-black tracking-tighter">PROJECTOS ANTERIORES</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                {loadingDetails ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="w-12 h-12 border-4 border-black/5 border-t-brand-gold rounded-full animate-spin"></div>
                                    </div>
                                ) : (displayClient.projects?.length > 0 ? displayClient.projects.map(p => (
                                    <div key={p.id} className="p-6 bg-black/[0.02] border-2 border-black/5 rounded-[32px] flex justify-between items-center hover:bg-white hover:border-brand-gold/30 hover:shadow-xl transition-all group">
                                        <div className="flex items-center gap-5">
                                            <div className="p-4 bg-black rounded-2xl border border-brand-gold/30 group-hover:bg-gold-metallic transition-all shadow-xl">
                                                <CheckCircleIcon className="w-6 h-6 text-brand-gold group-hover:text-black" />
                                            </div>
                                            <div>
                                                <p className="font-black text-black text-lg tracking-tight">{p.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black text-brand-gold uppercase tracking-widest">{p.type}</span>
                                                    <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">•</span>
                                                    <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">{new Date(p.startDate || p.date || '').toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="px-4 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-brand-gold/30">
                                            {p.status}
                                        </span>
                                    </div>
                                )) : (
                                    <div className="text-center py-16 bg-black/[0.02] border-2 border-dashed border-black/5 rounded-[40px]">
                                        <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Nenhum projeto registrado</p>
                                    </div>
                                ))}

                                {relatedLeads.length > 0 && (
                                    <div className="mt-8 pt-8 border-t border-black/5">
                                        <h5 className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] mb-4">Leads & Orçamentos Relacionados</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {relatedLeads.map(lead => (
                                                <div key={lead.id} className="p-4 bg-white border border-black/5 rounded-2xl flex justify-between items-center group hover:border-brand-gold/30 transition-all">
                                                    <span className="text-xs font-bold text-black group-hover:text-brand-gold transition-colors">{lead.name}</span>
                                                    <span className="text-xs font-black text-black tracking-tight">{formatCurrency(lead.value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {canEdit && (
                                <form onSubmit={handleAddProject} className="p-8 bg-black/[0.02] border-2 border-black/5 rounded-[40px] space-y-6">
                                    <h5 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Adicionar Experiência Anterior</h5>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={newProject.title}
                                            onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))}
                                            placeholder="Título do Projeto"
                                            className="w-full p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black"
                                            required
                                            disabled={isSaving}
                                        />
                                        <div className="flex gap-3">
                                            <select
                                                value={newProject.type}
                                                onChange={e => setNewProject(p => ({ ...p, type: e.target.value as ProjectType }))}
                                                className="flex-grow p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black"
                                                disabled={isSaving}
                                            >
                                                {Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            <input
                                                type="date"
                                                value={newProject.date}
                                                onChange={e => setNewProject(p => ({ ...p, date: e.target.value }))}
                                                className="p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black"
                                                disabled={isSaving}
                                            />
                                            <button
                                                type="submit"
                                                className="px-8 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-metallic hover:text-black transition-all shadow-xl disabled:opacity-50"
                                                disabled={isSaving}
                                            >
                                                Adicionar
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                    {activeTab === 'financials' && (
                        <div className="flex flex-col items-center justify-center py-24 bg-black/[0.02] border-2 border-dashed border-black/5 rounded-[40px] space-y-4 animate-in fade-in duration-700">
                            <FinancialIcon className="w-16 h-16 text-black/10" />
                            <div className="text-center">
                                <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] mb-2">Módulo em Integração</p>
                                <p className="text-sm font-bold text-black/20 italic">Histórico completo de pagamentos e faturas em breve.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'complaints' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div>
                                <h4 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-1">Contingências</h4>
                                <div className="text-2xl font-black tracking-tighter">LIVRO DE RECLAMAÇÕES</div>
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                {loadingDetails ? (
                                    <div className="flex justify-center py-12">
                                        <div className="w-12 h-12 border-4 border-black/5 border-t-brand-gold rounded-full animate-spin"></div>
                                    </div>
                                ) : (displayClient.complaints?.length > 0 ? displayClient.complaints.map(c => (
                                    <div key={c.id} className="p-6 bg-white border-2 border-black/5 rounded-[32px] hover:border-red-600/30 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${c.severity === 'Alta' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-200' :
                                                'bg-black text-white border-black'
                                                }`}>
                                                Severidade {c.severity}
                                            </span>
                                            <span className="text-[10px] font-black text-black/30 uppercase tracking-widest">{new Date(c.date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        <p className="text-sm font-bold text-black leading-relaxed mb-4">{c.description}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></div>
                                            <span className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em]">{c.status}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-20 bg-black/[0.02] border-2 border-dashed border-black/5 rounded-[40px]">
                                        <CheckCircleIcon className="w-16 h-16 text-black/5 mx-auto mb-4" />
                                        <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Nenhuma reclamação registrada</p>
                                    </div>
                                ))}
                            </div>

                            {canEdit && (
                                <form onSubmit={handleAddComplaint} className="p-8 bg-red-50 border-2 border-red-100 rounded-[40px] space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-8 bg-red-600 rounded-full"></div>
                                        <h5 className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">Registrar Ocorrência Crítica</h5>
                                    </div>
                                    <div className="space-y-4">
                                        <textarea
                                            value={newComplaint.description}
                                            onChange={e => setNewComplaint(p => ({ ...p, description: e.target.value }))}
                                            placeholder="Descreva detalhadamente a reclamação..."
                                            className="w-full p-5 bg-white border-2 border-red-100 rounded-[24px] focus:border-red-600 focus:outline-none transition-all font-bold text-black min-h-[120px]"
                                            required
                                            disabled={isSaving}
                                        />
                                        <div className="flex gap-4">
                                            <select
                                                value={newComplaint.severity}
                                                onChange={e => setNewComplaint(p => ({ ...p, severity: e.target.value as any }))}
                                                className="px-6 bg-white border-2 border-red-100 rounded-2xl font-bold text-black focus:outline-none focus:border-red-600"
                                                disabled={isSaving}
                                            >
                                                <option>Baixa</option>
                                                <option>Média</option>
                                                <option>Alta</option>
                                            </select>
                                            <button
                                                type="submit"
                                                className="flex-grow bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest py-4 hover:bg-black transition-all shadow-xl disabled:opacity-50"
                                                disabled={isSaving}
                                            >
                                                Adicionar ao Livro de Reclamações
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div>
                                <h4 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-1">Satisfação</h4>
                                <div className="text-2xl font-black tracking-tighter">FEEDBACK & DEPOIMENTOS</div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                {loadingDetails ? (
                                    <div className="flex justify-center py-12">
                                        <div className="w-12 h-12 border-4 border-black/5 border-t-brand-gold rounded-full animate-spin"></div>
                                    </div>
                                ) : (displayClient.feedbacks?.length > 0 ? displayClient.feedbacks.map(f => (
                                    <div key={f.id} className="p-6 bg-white border-2 border-black/5 rounded-[32px] hover:border-brand-gold/30 hover:shadow-xl transition-all group relative overflow-hidden">
                                        {f.testimonial && (
                                            <div className="absolute top-0 right-0 px-4 py-1.5 bg-gold-metallic text-black text-[9px] font-black uppercase tracking-widest rounded-bl-2xl">
                                                Depoimento Público
                                            </div>
                                        )}
                                        <div className="flex gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < f.rating ? "text-brand-gold text-xl" : "text-black/10 text-xl"}>★</span>
                                            ))}
                                        </div>
                                        <p className="text-sm font-bold text-black italic leading-relaxed mb-4">"{f.comment}"</p>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-black/30 uppercase tracking-widest">
                                            <CalendarIcon className="w-3 h-3" />
                                            {new Date(f.date).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-20 bg-black/[0.02] border-2 border-dashed border-black/5 rounded-[40px]">
                                        <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Nenhum feedback recebido</p>
                                    </div>
                                ))}
                            </div>

                            {canEdit && (
                                <form onSubmit={handleAddFeedback} className="p-8 bg-black/[0.02] border-2 border-black/5 rounded-[40px] space-y-6">
                                    <h5 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Registrar Experiência do Cliente</h5>
                                    <div className="space-y-4">
                                        <textarea
                                            value={newFeedback.comment}
                                            onChange={e => setNewFeedback(p => ({ ...p, comment: e.target.value }))}
                                            placeholder="Descreva o comentário do cliente..."
                                            className="w-full p-5 bg-white border-2 border-black/5 rounded-[24px] focus:border-brand-gold focus:outline-none transition-all font-bold text-black min-h-[120px]"
                                            required
                                            disabled={isSaving}
                                        />
                                        <div className="flex flex-wrap gap-4 items-center">
                                            <div className="flex items-center gap-3 px-4 py-2 bg-white border-2 border-black/5 rounded-2xl">
                                                <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">Avaliação:</span>
                                                <select
                                                    value={newFeedback.rating}
                                                    onChange={e => setNewFeedback(p => ({ ...p, rating: Number(e.target.value) }))}
                                                    className="bg-transparent font-black text-brand-gold focus:outline-none"
                                                    disabled={isSaving}
                                                >
                                                    {[1, 2, 3, 4, 5].map(r => <option key={r} value={r} className="text-black">{r} ★</option>)}
                                                </select>
                                            </div>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${newFeedback.testimonial ? 'bg-black border-black text-brand-gold' : 'border-black/10 group-hover:border-black/30'}`}>
                                                    {newFeedback.testimonial && <CheckCircleIcon className="w-4 h-4" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={newFeedback.testimonial}
                                                    onChange={e => setNewFeedback(p => ({ ...p, testimonial: e.target.checked }))}
                                                    disabled={isSaving}
                                                    className="hidden"
                                                />
                                                <span className="text-[10px] font-black text-black/60 uppercase tracking-widest group-hover:text-black">Disponível para Depoimento</span>
                                            </label>
                                            <button
                                                type="submit"
                                                className="flex-grow bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest py-4 hover:bg-gold-metallic hover:text-black transition-all shadow-xl disabled:opacity-50"
                                                disabled={isSaving}
                                            >
                                                Salvar Feedback
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {activeTab === 'upsell' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div>
                                <h4 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-1">Crescimento</h4>
                                <div className="text-2xl font-black tracking-tighter">OPORTUNIDADES DE UPSELL</div>
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                {loadingDetails ? (
                                    <div className="flex justify-center py-12">
                                        <div className="w-12 h-12 border-4 border-black/5 border-t-brand-gold rounded-full animate-spin"></div>
                                    </div>
                                ) : (displayClient.upsellOpportunities?.length > 0 ? displayClient.upsellOpportunities.map(o => (
                                    <div key={o.id} className="p-6 bg-white border-2 border-black/5 rounded-[32px] hover:border-brand-gold/30 hover:shadow-xl transition-all group border-l-8 border-l-brand-gold">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-black text-black text-lg tracking-tight uppercase">{o.description}</p>
                                            <span className="text-xl font-black text-brand-gold tracking-tighter">{formatCurrency(o.value)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                {o.status}
                                            </span>
                                            <span className="text-[10px] font-black text-black/30 uppercase tracking-widest">
                                                Identificada em {new Date(o.date).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-20 bg-black/[0.02] border-2 border-dashed border-black/5 rounded-[40px]">
                                        <PlusIcon className="w-16 h-16 text-black/5 mx-auto mb-4" />
                                        <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Nenhuma oportunidade mapeada</p>
                                    </div>
                                ))}
                            </div>

                            {canEdit && (
                                <form onSubmit={handleAddUpsell} className="p-8 bg-black/[0.02] border-2 border-black/5 rounded-[40px] space-y-6">
                                    <h5 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Sinalizar Novo Potencial</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            value={newUpsell.description}
                                            onChange={e => setNewUpsell(p => ({ ...p, description: e.target.value }))}
                                            placeholder="Ex: Álbum Premium de Luxo"
                                            className="w-full p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black"
                                            required
                                            disabled={isSaving}
                                        />
                                        <div className="flex gap-3">
                                            <input
                                                type="number"
                                                value={newUpsell.value}
                                                onChange={e => setNewUpsell(p => ({ ...p, value: Number(e.target.value) }))}
                                                placeholder="Valor Estimado"
                                                className="flex-grow p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black"
                                                required
                                                disabled={isSaving}
                                            />
                                            <button
                                                type="submit"
                                                className="px-8 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-metallic hover:text-black transition-all shadow-xl disabled:opacity-50"
                                                disabled={isSaving}
                                            >
                                                Registrar
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {activeTab === 'dates' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div>
                                <h4 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-1">Eventos & Marcos</h4>
                                <div className="text-2xl font-black tracking-tighter">DATAS IMPORTANTES</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                {client.birthday && (
                                    <div className="p-6 bg-gold-metallic text-black rounded-[32px] shadow-xl flex items-center justify-between group overflow-hidden relative border-2 border-brand-gold/50">
                                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                            <span className="text-8xl">🎂</span>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 opacity-60">Celebração de Vida</div>
                                            <div className="text-xl font-black tracking-tighter uppercase">Aniversário do Cliente</div>
                                            <div className="text-sm font-black mt-2 bg-black text-white px-3 py-1 rounded-lg inline-block">
                                                {new Date(client.birthday + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {loadingDetails ? (
                                    <div className="flex justify-center py-12 col-span-2">
                                        <div className="w-12 h-12 border-4 border-black/5 border-t-brand-gold rounded-full animate-spin"></div>
                                    </div>
                                ) : (displayClient.importantDates?.length > 0 ? displayClient.importantDates.map(d => (
                                    <div key={d.id} className="p-6 bg-white border-2 border-black/5 rounded-[32px] hover:border-brand-gold/30 hover:shadow-xl transition-all group flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                    {d.type}
                                                </span>
                                                <CalendarIcon className="w-5 h-5 text-black/10 group-hover:text-brand-gold transition-colors" />
                                            </div>
                                            <div className="text-lg font-black text-black tracking-tight uppercase">{d.description}</div>
                                        </div>
                                        <div className="mt-4 text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] pt-4 border-t border-black/5">
                                            {new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                )) : !client.birthday && (
                                    <div className="text-center py-20 bg-black/[0.02] border-2 border-dashed border-black/5 rounded-[40px] col-span-2">
                                        <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Nenhuma data catalogada</p>
                                    </div>
                                ))}
                            </div>

                            {canEdit && (
                                <form onSubmit={handleAddImportantDate} className="p-8 bg-black/[0.02] border-2 border-black/5 rounded-[40px] space-y-6">
                                    <h5 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Catalogar Novo Marco</h5>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={newDate.description}
                                            onChange={e => setNewDate(p => ({ ...p, description: e.target.value }))}
                                            placeholder="Ex: Aniversário de Casamento"
                                            className="w-full p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black"
                                            required
                                            disabled={isSaving}
                                        />
                                        <div className="flex flex-wrap gap-4">
                                            <input
                                                type="date"
                                                value={newDate.date}
                                                onChange={e => setNewDate(p => ({ ...p, date: e.target.value }))}
                                                className="flex-grow min-w-[200px] p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black"
                                                required
                                                disabled={isSaving}
                                            />
                                            <select
                                                value={newDate.type}
                                                onChange={e => setNewDate(p => ({ ...p, type: e.target.value as any }))}
                                                className="flex-grow min-w-[200px] p-4 bg-white border-2 border-black/5 rounded-2xl focus:border-brand-gold focus:outline-none transition-all font-bold text-black"
                                                disabled={isSaving}
                                            >
                                                <option value="Anniversary">Aniversário (Evento)</option>
                                                <option value="Event">Evento Social</option>
                                                <option value="Other">Outro</option>
                                            </select>
                                            <button
                                                type="submit"
                                                className="px-12 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-metallic hover:text-black transition-all shadow-xl disabled:opacity-50"
                                                disabled={isSaving}
                                            >
                                                Salvar Marco
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </Modal >
        );
    };


interface ClientsProps {
    clients: Client[];
    leads: Lead[];
    transactions: Transaction[];
    onAddInteraction: (clientId: string, interaction: any) => Promise<void>;
    onAddClient: (client: any) => Promise<void>;
    onUpdateClient: (client: Client) => Promise<void>;
    onDeleteClient: (id: string) => Promise<void>;
    onAddTag: (clientId: string, tagId: string) => Promise<void>;
    onRemoveTag: (clientId: string, tagId: string) => Promise<void>;
    onCreateTag: (tag: any) => Promise<void>;
    onAddFeedback: (feedback: any) => Promise<void>;
    onAddComplaint: (complaint: any) => Promise<void>;
    onAddUpsellOpportunity: (opp: any) => Promise<void>;
    onAddImportantDate: (date: any) => Promise<void>;
    onAddProductionProject: (project: any) => Promise<void>;
}

/**
 * Clients page component.
 * Manages the list of clients, their details, and interactions.
 */
export const Clients: React.FC<ClientsProps> = ({
    clients, leads, transactions,
    onAddInteraction, onAddClient, onUpdateClient, onDeleteClient,
    onAddTag, onRemoveTag, onCreateTag,
    onAddFeedback, onAddComplaint, onAddUpsellOpportunity, onAddImportantDate, onAddProductionProject
}) => {
    const { hasPermission } = useAuth();
    const { refreshData } = useData();
    const canCreate = hasPermission(Page.Clients, 'create');
    const canEdit = hasPermission(Page.Clients, 'edit');

    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [tagFilter, setTagFilter] = useState('all');

    const allTags = useMemo(() => {
        const tags = new Map<string, ClientTag>();
        clients.forEach(c => c.tags.forEach(t => tags.set(t.id, t)));
        return Array.from(tags.values());
    }, [clients]);

    const filteredClients = useMemo(() => {
        return clients.filter(c => {
            const searchMatch = !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.company.toLowerCase().includes(searchTerm.toLowerCase());
            const tagMatch = tagFilter === 'all' || c.tags.some(t => t.id === tagFilter);
            return searchMatch && tagMatch;
        }).sort((a, b) => b.totalRevenue - a.totalRevenue);
    }, [clients, searchTerm, tagFilter]);

    const analytics = useMemo(() => {
        const activeClients = clients.filter(c => c.status === 'Ativo').length;
        const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0);
        const avgRevenue = clients.length > 0 ? (totalRevenue / clients.length) : 0;
        const topClient = clients.length > 0 ? clients.reduce((max, c) => c.totalRevenue > max.totalRevenue ? c : max, clients[0]) : null;
        return { activeClients, avgRevenue, topClient, topClientsChartData: filteredClients.slice(0, 5) };
    }, [clients, filteredClients]);

    const handleClientClick = (client: Client) => {
        setSelectedClient(client);
    };

    const handleEditClient = (e: React.MouseEvent, client: Client) => {
        e.stopPropagation();
        setClientToEdit(client);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = async (e: React.MouseEvent, clientId: string) => {
        e.stopPropagation();
        if (!canEdit) return;
        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
            try {
                await onDeleteClient(clientId);
                if (selectedClient?.id === clientId) setSelectedClient(null);
            } catch (e) {
                console.error("Error deleting client:", e);
            }
        }
    };

    const handleNewClient = () => {
        setClientToEdit(null);
        setIsFormModalOpen(true);
    };

    return (
        <div className="p-8 space-y-12 animate-in fade-in duration-700">
            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="group hover:bg-black hover:text-white transition-all duration-500">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-black rounded-2xl border border-brand-gold/30 group-hover:bg-gold-metallic group-hover:border-black transition-all shadow-xl">
                            <CheckCircleIcon className="w-8 h-8 text-brand-gold group-hover:text-black" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-black/40 group-hover:text-brand-gold/60 uppercase tracking-[0.2em]">Clientes Ativos</p>
                            <span className="text-4xl font-black tracking-tighter">{analytics.activeClients}</span>
                        </div>
                    </div>
                </Card>

                <Card className="group hover:bg-black hover:text-white transition-all duration-500">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-black rounded-2xl border border-brand-gold/30 group-hover:bg-gold-metallic group-hover:border-black transition-all shadow-xl">
                            <FinancialIcon className="w-8 h-8 text-brand-gold group-hover:text-black" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-black/40 group-hover:text-brand-gold/60 uppercase tracking-[0.2em]">Ticket Médio</p>
                            <span className="text-3xl font-black tracking-tighter">{formatCurrency(analytics.avgRevenue)}</span>
                        </div>
                    </div>
                </Card>

                <Card className="lg:col-span-2 bg-black text-white border-brand-gold/20 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-brand-gold/5 blur-[80px] group-hover:bg-brand-gold/20 transition-all"></div>
                    <div className="flex justify-between items-center relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] mb-2">Relacionamento Elite</p>
                            <h3 className="text-3xl font-black tracking-tighter uppercase mb-2">
                                {analytics.topClient?.name || 'Sem Cliente'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-12 bg-gold-metallic rounded-full"></div>
                                <span className="text-xs font-black text-white/40 uppercase tracking-widest">Cliente Mais Valioso</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Faturamento Total</p>
                            <p className="text-3xl font-black text-brand-gold tracking-tighter">
                                {analytics.topClient ? formatCurrency(analytics.topClient.totalRevenue) : formatCurrency(0)}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="p-8 border-2 border-black/5 bg-white/50 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h4 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-1">Performance Comercial</h4>
                        <div className="text-2xl font-black tracking-tighter">Top 5 Clientes por Receita</div>
                    </div>
                    <div className="p-3 bg-black rounded-xl border border-brand-gold/30">
                        <TrendingUpIcon className="w-6 h-6 text-brand-gold" />
                    </div>
                </div>
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <BarChart data={analytics.topClientsChartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={120}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#000', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#000',
                                    border: '1px solid #C5A059',
                                    borderRadius: '16px',
                                    padding: '12px'
                                }}
                                itemStyle={{ color: '#C5A059', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase' }}
                                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                formatter={(value: number) => [`${formatCurrency(value)}`, 'RECEITA TOTAL']}
                            />
                            <Bar
                                dataKey="totalRevenue"
                                radius={[0, 12, 12, 0]}
                                barSize={32}
                            >
                                {analytics.topClientsChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#C5A059' : '#000'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 pt-8 border-t border-black/5">
                <div>
                    <h2 className="text-4xl font-black text-black tracking-tighter uppercase">Gestão de Clientes</h2>
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mt-1">Base de dados e relacionamento Premium</p>
                </div>
                {canCreate && (
                    <button
                        onClick={handleNewClient}
                        className="flex items-center gap-3 bg-black text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl hover:bg-gold-metallic hover:text-black transition-all active:scale-95 group"
                    >
                        <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Cadastrar Novo Membro
                    </button>
                )}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full flex items-center bg-white border-2 border-black/5 p-5 rounded-[24px] shadow-sm hover:border-brand-gold/30 transition-all group">
                    <SearchIcon className="w-6 h-6 text-black/20 group-hover:text-brand-gold transition-colors" />
                    <input
                        type="text"
                        placeholder="BUSCAR NA BASE DE CLIENTES..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm font-bold text-black placeholder:text-black/20 ml-4 uppercase tracking-widest"
                    />
                </div>
                <div className="w-full md:w-72 flex items-center bg-white border-2 border-black/5 p-5 rounded-[24px] shadow-sm hover:border-brand-gold/30 transition-all">
                    <FilterIcon className="w-5 h-5 text-black/20 mr-4" />
                    <select
                        value={tagFilter}
                        onChange={e => setTagFilter(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-[10px] font-black text-black uppercase tracking-widest cursor-pointer"
                    >
                        <option value="all">TODAS AS CATEGORIAS</option>
                        {allTags.map(tag => <option key={tag.id} value={tag.id}>{tag.text.toUpperCase()}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredClients.length > 0 ? filteredClients.map(client => (
                    <div
                        key={client.id}
                        onClick={() => handleClientClick(client)}
                        className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-black/5 hover:border-brand-gold/40 hover:shadow-2xl transition-all duration-500 cursor-pointer relative group overflow-hidden"
                    >
                        {/* Status Light */}
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-10 ${client.status === 'Ativo' ? 'bg-green-500' : 'bg-black'}`}></div>

                        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                            {canEdit && (
                                <button
                                    onClick={(e) => handleEditClient(e, client)}
                                    className="p-3 bg-black text-white hover:bg-gold-metallic hover:text-black rounded-xl shadow-lg transition-all"
                                    title="Configurações do Cliente"
                                >
                                    <SettingsIcon className="w-4 h-4" />
                                </button>
                            )}
                            {canEdit && (
                                <button
                                    onClick={(e) => handleDeleteClick(e, client.id)}
                                    className="p-3 bg-white text-red-600 hover:bg-red-600 hover:text-white border border-red-100 rounded-xl shadow-lg transition-all"
                                    title="Remover Registro"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-black border-2 border-brand-gold/30 flex items-center justify-center text-brand-gold font-black text-2xl shadow-xl group-hover:bg-gold-metallic group-hover:text-black transition-all duration-500">
                                {client.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-black text-xl text-black tracking-tighter uppercase leading-tight group-hover:text-brand-gold transition-colors">{client.name}</h3>
                                <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">{client.company || 'Empresa Privada'}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-4 p-4 bg-black/[0.02] rounded-2xl border border-black/5 group-hover:bg-white transition-all">
                                <div className="p-2 bg-black rounded-lg">
                                    <MailIcon className="w-3.5 h-3.5 text-brand-gold" />
                                </div>
                                <span className="text-xs font-bold text-black/60 truncate uppercase tracking-tighter">{client.email}</span>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-black/[0.02] rounded-2xl border border-black/5 group-hover:bg-white transition-all">
                                <div className="p-2 bg-black rounded-lg">
                                    <DollarSignIcon className="w-3.5 h-3.5 text-brand-gold" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-black/30 uppercase tracking-widest">Valor em Carteira</span>
                                    <span className="text-sm font-black text-black tracking-tight">{formatCurrency(client.totalRevenue)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-black/5">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${client.status === 'Ativo' ? 'bg-black text-white border-brand-gold/30' : 'bg-white text-black/40 border-black/5'}`}>
                                {client.status}
                            </span>
                            {client.tags?.slice(0, 2).map(tag => (
                                <span key={tag.id} className="px-4 py-1.5 bg-black/[0.05] text-black text-[9px] font-black uppercase tracking-widest rounded-full">
                                    #{tag.text}
                                </span>
                            ))}
                            {client.tags?.length > 2 && (
                                <span className="text-[9px] font-black text-black/20 uppercase">+{client.tags.length - 2}</span>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center bg-black/[0.02] border-2 border-dashed border-black/5 rounded-[40px]">
                        <SearchIcon className="w-16 h-16 text-black/5 mb-4" />
                        <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em]">Nenhum cliente encontrado nos filtros atuais</p>
                    </div>
                )}
            </div>

            {selectedClient && (
                <ClientDetailModal
                    client={selectedClient}
                    onClose={() => setSelectedClient(null)}
                    leads={leads}
                    transactions={transactions}
                    onAddInteraction={onAddInteraction}
                    onAddFeedback={onAddFeedback}
                    onAddComplaint={onAddComplaint}
                    onAddUpsellOpportunity={onAddUpsellOpportunity}
                    onAddImportantDate={onAddImportantDate}
                    onAddProductionProject={onAddProductionProject}
                />
            )}

            <ClientFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                clientToEdit={clientToEdit}
                onAddClient={onAddClient}
                onUpdateClient={onUpdateClient}
            />
        </div>
    );
};