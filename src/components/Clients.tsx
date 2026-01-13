import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Client, Interaction, ClientTag, Lead, Transaction, LeadStatus, ProjectType, Page, Complaint, UpsellOpportunity, ImportantDate, ProductionStatus, ProductionProject, Feedback } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './common/Card';
import { Modal } from './common/Modal';
import { PlusIcon, EditIcon, TrashIcon, CheckCircleIcon, FinancialIcon, SearchIcon, MailIcon, PhoneIcon, DollarSignIcon } from './common/Icon';
import { formatCurrency } from '../utils';
import { getClient } from '../services/api';

/**
 * A reusable button for the tab navigation in the detail modal.
 */
const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${active
            ? 'border-b-2 border-brand-gold text-brand-dark dark:text-white'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
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
                <div className="flex border-b mb-4 dark:border-gray-700">
                    <button
                        type="button"
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'basic' ? 'border-b-2 border-brand-gold text-brand-dark dark:text-white' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('basic')}
                    >
                        Dados Básicos
                    </button>
                    <button
                        type="button"
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'dates' ? 'border-b-2 border-brand-gold text-brand-dark dark:text-white' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('dates')}
                    >
                        Datas Importantes
                    </button>
                    <button
                        type="button"
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'projects' ? 'border-b-2 border-brand-gold text-brand-dark dark:text-white' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('projects')}
                    >
                        Projetos Anteriores
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className={(clientToEdit || activeTab === 'basic') ? 'block space-y-4' : 'hidden'}>
                    <input name="name" value={client.name} onChange={handleChange} placeholder="Nome" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required={activeTab === 'basic'} disabled={isSaving} />
                    <input name="company" value={client.company} onChange={handleChange} placeholder="Empresa" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required={activeTab === 'basic'} disabled={isSaving} />
                    <input name="email" type="email" value={client.email} onChange={handleChange} placeholder="Email" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required={activeTab === 'basic'} disabled={isSaving} />
                    <input name="phone" value={client.phone} onChange={handleChange} placeholder="Telefone" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required={activeTab === 'basic'} disabled={isSaving} />
                    <select name="status" value={client.status} onChange={handleChange} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={isSaving}>
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                    </select>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data de Nascimento (Opcional)</label>
                        <input name="birthday" type="date" value={client.birthday} onChange={handleChange} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={isSaving} />
                    </div>
                </div>

                {!clientToEdit && activeTab === 'dates' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            {extraDates.map((d, i) => (
                                <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600">
                                    <span className="text-sm dark:text-gray-200">{d.description} ({new Date(d.date).toLocaleDateString()}) - {d.type}</span>
                                    <button type="button" onClick={() => removeDate(i)} className="text-red-500 hover:text-red-700">×</button>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-brand-light/10 border border-brand-gold/20 rounded-lg space-y-2 mt-2">
                            <h5 className="font-bold text-xs text-brand-dark dark:text-gray-300">Adicionar Data Importante</h5>
                            <input
                                placeholder="Descrição (ex: Casamento)"
                                value={tempDate.description}
                                onChange={e => setTempDate({ ...tempDate, description: e.target.value })}
                                className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={tempDate.date}
                                    onChange={e => setTempDate({ ...tempDate, date: e.target.value })}
                                    className="flex-1 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <select
                                    value={tempDate.type}
                                    onChange={e => setTempDate({ ...tempDate, type: e.target.value as any })}
                                    className="p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="Anniversary">Aniversário (Evento)</option>
                                    <option value="Event">Evento Social</option>
                                    <option value="Other">Outro</option>
                                </select>
                                <button type="button" onClick={addDate} className="bg-brand-gold text-brand-dark px-3 rounded font-bold hover:bg-yellow-500">+</button>
                            </div>
                        </div>
                    </div>
                )}

                {!clientToEdit && activeTab === 'projects' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            {extraProjects.map((p, i) => (
                                <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded border dark:border-gray-600">
                                    <span className="text-sm dark:text-gray-200">{p.title} ({new Date(p.date || '').toLocaleDateString()}) - {p.type}</span>
                                    <button type="button" onClick={() => removeProject(i)} className="text-red-500 hover:text-red-700">×</button>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-brand-light/10 border border-brand-gold/20 rounded-lg space-y-2 mt-2">
                            <h5 className="font-bold text-xs text-brand-dark dark:text-gray-300">Adicionar Projeto Anterior</h5>
                            <input
                                placeholder="Título do Projeto"
                                value={tempProject.title}
                                onChange={e => setTempProject({ ...tempProject, title: e.target.value })}
                                className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={tempProject.date}
                                    onChange={e => setTempProject({ ...tempProject, date: e.target.value })}
                                    className="flex-1 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <select
                                    value={tempProject.type}
                                    onChange={e => setTempProject({ ...tempProject, type: e.target.value as any })}
                                    className="p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    {Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <button type="button" onClick={addProject} className="bg-brand-gold text-brand-dark px-3 rounded font-bold hover:bg-yellow-500">+</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300" disabled={isSaving}>Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded bg-brand-dark text-white hover:bg-black" disabled={isSaving}>
                        {isSaving ? 'Salvando...' : 'Salvar Cliente'}
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
                if (healthScore >= 70) return 'bg-green-500';
                if (healthScore >= 40) return 'bg-yellow-500';
                return 'bg-red-500';
            };

            return (
                <div className="mt-4">
                    <h4 className="font-semibold text-lg text-brand-dark dark:text-gray-200 mb-2">Saúde do Cliente</h4>
                    <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className={`h-2.5 rounded-full ${getHealthColor()}`} style={{ width: `${healthScore}%` }}></div>
                        </div>
                        <span className="font-bold text-sm text-brand-dark dark:text-gray-100">{healthScore}%</span>
                    </div>
                </div>
            )
        };

        return (
            <Modal isOpen={!!client} onClose={onClose} title={`Detalhes de ${client.name}`}>
                <div className="border-b dark:border-gray-700 mb-4">
                    <nav className="-mb-px flex space-x-4">
                        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Visão Geral</TabButton>
                        <TabButton active={activeTab === 'interactions'} onClick={() => setActiveTab('interactions')}>Histórico {loadingDetails && activeTab !== 'interactions' ? '...' : ''}</TabButton>
                        <TabButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')}>Projectos</TabButton>
                        <TabButton active={activeTab === 'financials'} onClick={() => setActiveTab('financials')}>Financeiro</TabButton>
                        <TabButton active={activeTab === 'complaints'} onClick={() => setActiveTab('complaints')}>Reclamações</TabButton>
                        <TabButton active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')}>Feedback</TabButton>
                        <TabButton active={activeTab === 'upsell'} onClick={() => setActiveTab('upsell')}>Vendas</TabButton>
                        <TabButton active={activeTab === 'dates'} onClick={() => setActiveTab('dates')}>Datas</TabButton>
                    </nav>
                </div>

                <div className="min-h-[400px]">
                    {activeTab === 'overview' && (
                        <div className="dark:text-gray-300 space-y-2">
                            <p><strong>Empresa:</strong> {client.company}</p>
                            <p><strong>Email:</strong> {client.email}</p>
                            <p><strong>Telefone:</strong> {client.phone}</p>
                            <p><strong>Cliente Desde:</strong> {new Date(client.since).toLocaleDateString('pt-BR')}</p>
                            <p><strong>Tags:</strong> {client.tags.map(t => t.text).join(', ') || 'N/A'}</p>
                            <ClientHealth client={client} />
                        </div>
                    )}
                    {activeTab === 'interactions' && (
                        <div className="mt-2">
                            <h4 className="font-semibold text-lg text-brand-dark dark:text-gray-200 mb-2">Histórico de Interações</h4>
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                {loadingDetails ? <p className="text-center py-4 text-gray-500">Carregando histórico...</p> :
                                    (displayClient.interactionHistory && displayClient.interactionHistory.length > 0 ? [...displayClient.interactionHistory].reverse().map(item => (
                                        <div key={item.id} className="p-3 bg-white dark:bg-gray-700 rounded-md border dark:border-gray-600">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-brand-secondary dark:text-gray-300">{item.type}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(item.date).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.notes}</p>
                                        </div>
                                    )) : <p className="text-sm text-center py-4 text-gray-500 dark:text-gray-400">Nenhuma interação registrada.</p>)}
                            </div>
                            {canEdit && (
                                <form onSubmit={handleAddInteraction} className="mt-4 space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <h4 className="font-bold text-sm text-brand-dark dark:text-gray-200">Registrar Nova Interação</h4>
                                    <div className="flex gap-2">
                                        <select value={newInteraction.type} onChange={(e) => setNewInteraction(prev => ({ ...prev, type: e.target.value as Interaction['type'] }))} className="p-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" disabled={isSaving}>
                                            <option>Email</option><option>Call</option><option>Meeting</option>
                                        </select>
                                        <input type="text" placeholder="Notas da interação..." value={newInteraction.notes} onChange={(e) => setNewInteraction(prev => ({ ...prev, notes: e.target.value }))} className="flex-grow p-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" required disabled={isSaving} />
                                        <button type="submit" className="px-4 py-2 rounded-lg text-white text-sm bg-brand-dark hover:bg-black disabled:opacity-50" disabled={isSaving}>Adicionar</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                    {activeTab === 'projects' && (
                        <div className="mt-2">
                            <h4 className="font-semibold text-lg text-brand-dark dark:text-gray-200 mb-2">Projectos Anteriores</h4>
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                {loadingDetails ? <p className="text-center py-4 text-gray-500">Carregando projetos...</p> :
                                    (displayClient.projects?.length > 0 ? displayClient.projects.map(p => (
                                        <div key={p.id} className="p-3 bg-white dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-brand-dark dark:text-gray-200">{p.title}</p>
                                                <p className="text-xs text-gray-500">{p.type} • {new Date(p.startDate || p.date || '').toLocaleDateString()}</p>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-brand-light/50 dark:bg-gray-600 rounded-full font-bold text-brand-dark dark:text-gray-200">{p.status}</span>
                                        </div>
                                    )) : <p className="text-sm text-center py-4 text-gray-500 dark:text-gray-400 italic">Este cliente ainda não possui projectos concluídos registados.</p>)}

                                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                                    <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Leads & Orçamentos</h5>
                                    {relatedLeads.map(lead => (
                                        <div key={lead.id} className="p-2 flex justify-between items-center text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">{lead.name}</span>
                                            <span className="font-bold text-brand-gold">{formatCurrency(lead.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {canEdit && (
                                <form onSubmit={handleAddProject} className="p-3 bg-brand-light/20 dark:bg-gray-800 rounded-xl border border-brand-gold/20 space-y-3 mt-4">
                                    <h5 className="font-bold text-xs text-brand-gold uppercase tracking-widest">Adicionar Projeto Anterior</h5>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={newProject.title}
                                            onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))}
                                            placeholder="Título do Projeto"
                                            className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                            required
                                            disabled={isSaving}
                                        />
                                        <div className="flex gap-2">
                                            <select
                                                value={newProject.type}
                                                onChange={e => setNewProject(p => ({ ...p, type: e.target.value as ProjectType }))}
                                                className="p-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                                disabled={isSaving}
                                            >
                                                {Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            <input
                                                type="date"
                                                value={newProject.date}
                                                onChange={e => setNewProject(p => ({ ...p, date: e.target.value }))}
                                                className="p-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                                disabled={isSaving}
                                            />
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-brand-dark text-white rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-black transition-colors"
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
                        <div className="mt-2 text-sm text-gray-500 italic">Histórico completo de pagamentos e faturas.</div>
                    )}

                    {activeTab === 'complaints' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-lg text-brand-dark dark:text-gray-200">Livro de Reclamações</h4>
                            </div>
                            <div className="space-y-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl min-h-[100px]">
                                {loadingDetails ? <p className="text-center py-4 text-gray-500">Carregando reclamações...</p> :
                                    (displayClient.complaints?.length > 0 ? displayClient.complaints.map(c => (
                                        <div key={c.id} className="p-3 bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600">
                                            <div className="flex justify-between">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.severity === 'Alta' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.severity}</span>
                                                <span className="text-xs text-gray-400">{new Date(c.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="mt-1 text-sm">{c.description}</p>
                                            <div className="mt-2 text-xs font-semibold text-brand-gold">{c.status}</div>
                                        </div>
                                    )) : <p className="text-gray-400 text-center py-4">Nenhuma reclamação registrada.</p>)}
                            </div>
                            {canEdit && (
                                <form onSubmit={handleAddComplaint} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
                                    <h5 className="font-bold text-xs text-red-600 uppercase">Registrar Reclamação</h5>
                                    <div className="space-y-2">
                                        <textarea value={newComplaint.description} onChange={e => setNewComplaint(p => ({ ...p, description: e.target.value }))} placeholder="Descreva a reclamação..." className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600" required disabled={isSaving} />
                                        <div className="flex gap-2">
                                            <select value={newComplaint.severity} onChange={e => setNewComplaint(p => ({ ...p, severity: e.target.value as any }))} className="p-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" disabled={isSaving}>
                                                <option>Baixa</option><option>Média</option><option>Alta</option>
                                            </select>
                                            <button type="submit" className="flex-grow bg-red-600 text-white rounded-lg text-sm font-bold py-2 disabled:opacity-50" disabled={isSaving}>Adicionar ao Livro</button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg text-brand-dark dark:text-gray-200">Feedback e Depoimentos</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {loadingDetails ? <p className="text-center py-4 text-gray-500">Carregando feedback...</p> :
                                    (displayClient.feedbacks?.length > 0 ? displayClient.feedbacks.map(f => (
                                        <div key={f.id} className="p-4 bg-brand-light/20 dark:bg-gray-800 rounded-xl border border-brand-gold/20">
                                            <div className="flex gap-1 mb-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={i < f.rating ? "text-brand-gold text-lg" : "text-gray-300 text-lg"}>★</span>
                                                ))}
                                            </div>
                                            <p className="text-sm italic text-gray-700 dark:text-gray-300">"{f.comment}"</p>
                                            <div className="mt-2 flex justify-between items-center">
                                                <span className="text-[10px] text-gray-500 uppercase">{new Date(f.date).toLocaleDateString()}</span>
                                                {f.testimonial && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">DEPOIMENTO</span>}
                                            </div>
                                        </div>
                                    )) : <p className="text-gray-400 text-center py-4">Ainda não recebemos feedback deste cliente.</p>)}
                            </div>
                            {canEdit && (
                                <form onSubmit={handleAddFeedback} className="p-3 bg-brand-light/20 dark:bg-gray-800 rounded-xl border border-brand-gold/20 space-y-3 mt-4">
                                    <h5 className="font-bold text-xs text-brand-gold uppercase tracking-widest">Registrar Feedback</h5>
                                    <textarea
                                        value={newFeedback.comment}
                                        onChange={e => setNewFeedback(p => ({ ...p, comment: e.target.value }))}
                                        placeholder="Comentário do cliente..."
                                        className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                        required
                                        disabled={isSaving}
                                    />
                                    <div className="flex gap-2 items-center">
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm dark:text-gray-300">Avaliação:</span>
                                            <select
                                                value={newFeedback.rating}
                                                onChange={e => setNewFeedback(p => ({ ...p, rating: Number(e.target.value) }))}
                                                className="p-1 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                                disabled={isSaving}
                                            >
                                                {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} ★</option>)}
                                            </select>
                                        </div>
                                        <label className="flex items-center gap-1 ml-4 cursor-pointer text-sm dark:text-gray-300">
                                            <input
                                                type="checkbox"
                                                checked={newFeedback.testimonial}
                                                onChange={e => setNewFeedback(p => ({ ...p, testimonial: e.target.checked }))}
                                                disabled={isSaving}
                                                className="form-checkbox"
                                            />
                                            Depoimento Público
                                        </label>
                                        <button
                                            type="submit"
                                            className="flex-grow ml-4 bg-brand-dark text-white rounded-lg text-sm font-bold py-2 disabled:opacity-50 hover:bg-black transition-colors"
                                            disabled={isSaving}
                                        >
                                            Salvar Feedback
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {activeTab === 'upsell' && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg text-brand-dark dark:text-gray-200">Upsell & Cross-sell Opportunities</h4>
                            <div className="space-y-3">
                                {loadingDetails ? <p className="text-center py-4 text-gray-500">Carregando oportunidades...</p> :
                                    (displayClient.upsellOpportunities?.length > 0 ? displayClient.upsellOpportunities.map(o => (
                                        <div key={o.id} className="p-3 bg-white dark:bg-gray-700 rounded-xl border-l-4 border-brand-gold shadow-sm">
                                            <div className="font-bold text-brand-dark dark:text-gray-200">{o.description}</div>
                                            <div className="text-sm text-brand-gold font-black">{formatCurrency(o.value)}</div>
                                            <div className="mt-1 flex justify-between items-center">
                                                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-600 rounded">{o.status}</span>
                                                <span className="text-[10px] text-gray-400 text-right uppercase">Identificada em<br />{new Date(o.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    )) : <p className="text-gray-400 text-center py-4">Nenhuma oportunidade identificada no momento.</p>)}
                            </div>
                            {canEdit && (
                                <form onSubmit={handleAddUpsell} className="p-3 bg-brand-light/20 dark:bg-gray-800 rounded-xl border border-brand-gold/20 space-y-3">
                                    <h5 className="font-bold text-xs text-brand-gold uppercase tracking-widest">Identificar Oportunidade</h5>
                                    <input type="text" value={newUpsell.description} onChange={e => setNewUpsell(p => ({ ...p, description: e.target.value }))} placeholder="Descrição (ex: Álbum Extra)" className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600" required disabled={isSaving} />
                                    <div className="flex gap-2">
                                        <input type="number" value={newUpsell.value} onChange={e => setNewUpsell(p => ({ ...p, value: Number(e.target.value) }))} placeholder="Valor" className="w-1/3 p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600" required disabled={isSaving} />
                                        <button type="submit" className="flex-grow bg-brand-dark text-white rounded-lg text-sm font-bold py-2 disabled:opacity-50" disabled={isSaving}>Registar Venda</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {activeTab === 'dates' && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg text-brand-dark dark:text-gray-200">Datas Importantes</h4>
                            <div className="space-y-3">
                                {client.birthday && (
                                    <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-100 dark:border-pink-900/30 flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-pink-700 dark:text-pink-300">Aniversário do Cliente</div>
                                            <div className="text-xs text-pink-600 dark:text-pink-400">{new Date(client.birthday + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</div>
                                        </div>
                                        <span className="text-2xl">🎂</span>
                                    </div>
                                )}
                                {loadingDetails ? <p className="text-center py-4 text-gray-500">Carregando datas...</p> :
                                    (displayClient.importantDates?.length > 0 ? displayClient.importantDates.map(d => (
                                        <div key={d.id} className="p-3 bg-white dark:bg-gray-700 rounded-xl border dark:border-gray-600 flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-brand-dark dark:text-gray-200">{d.description}</div>
                                                <div className="text-xs text-gray-500">{new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</div>
                                            </div>
                                            <span className="text-sm bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded">{d.type}</span>
                                        </div>
                                    )) : !client.birthday && <p className="text-gray-400 text-center py-4">Nenhuma data importante registrada.</p>)}
                            </div>
                            {canEdit && (
                                <form onSubmit={handleAddImportantDate} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
                                    <h5 className="font-bold text-xs text-gray-500 uppercase">Nova Data Especial</h5>
                                    <input type="text" value={newDate.description} onChange={e => setNewDate(p => ({ ...p, description: e.target.value }))} placeholder="Descrição (ex: Casamento)" className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600" required disabled={isSaving} />
                                    <div className="flex gap-2">
                                        <input type="date" value={newDate.date} onChange={e => setNewDate(p => ({ ...p, date: e.target.value }))} className="p-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" required disabled={isSaving} />
                                        <select value={newDate.type} onChange={e => setNewDate(p => ({ ...p, type: e.target.value as any }))} className="p-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" disabled={isSaving}>
                                            <option value="Anniversary">Aniversário (Evento)</option>
                                            <option value="Event">Evento Social</option>
                                            <option value="Other">Outro</option>
                                        </select>
                                        <button type="submit" className="flex-grow bg-brand-gold text-brand-dark rounded-lg text-sm font-bold py-2 disabled:opacity-50" disabled={isSaving}>Salvar</button>
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
        <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card><div className="flex items-center gap-4"><CheckCircleIcon className="w-8 h-8 text-green-500" /><p className="text-sm font-medium text-brand-secondary">Clientes Ativos<br /><span className="text-3xl font-bold text-brand-dark">{analytics.activeClients}</span></p></div></Card>
                <Card><div className="flex items-center gap-4"><FinancialIcon className="w-8 h-8 text-blue-500" /><p className="text-sm font-medium text-brand-secondary">Receita Média<br /><span className="text-3xl font-bold text-brand-dark">{formatCurrency(analytics.avgRevenue)}</span></p></div></Card>
                <Card className="lg:col-span-2"><p className="text-sm font-medium text-brand-secondary">Cliente Mais Valioso</p><p className="text-2xl font-bold text-brand-gold">{analytics.topClient?.name || 'N/A'}</p><p className="text-sm text-green-600 font-semibold">{analytics.topClient ? formatCurrency(analytics.topClient.totalRevenue) : formatCurrency(0)}</p></Card>
            </div>

            <Card title="Top 5 Clientes por Receita Total">
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={analytics.topClientsChartData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" tickFormatter={(val) => `${formatCurrency(val)}`} />
                            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: number) => `${formatCurrency(value)}`} />
                            <Legend />
                            <Bar dataKey="totalRevenue" name="Receita Total" fill="#D4AF37" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-brand-dark dark:text-gray-100">Clientes</h2>
                {canCreate && (
                    <button onClick={handleNewClient} className="flex items-center gap-2 bg-brand-gold text-brand-dark font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
                        <PlusIcon className="w-5 h-5" />
                        Novo Cliente
                    </button>
                )}
            </div>

            <div className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 gap-4">
                <div className="flex-1 flex items-center gap-2">
                    <SearchIcon className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar clientes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-700 dark:text-gray-200"
                    />
                </div>
                <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="all">Todas as Tags</option>
                    {allTags.map(tag => <option key={tag.id} value={tag.id}>{tag.text}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map(client => (
                    <div
                        key={client.id}
                        onClick={() => handleClientClick(client)}
                        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer relative group"
                    >
                        <div className="absolute top-4 right-4 hidden group-hover:flex gap-2">
                            {canEdit && (
                                <button
                                    onClick={(e) => handleEditClient(e, client)}
                                    className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                                    title="Editar"
                                >
                                    <EditIcon className="w-4 h-4" />
                                </button>
                            )}
                            {canEdit && (
                                <button
                                    onClick={(e) => handleDeleteClick(e, client.id)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                    title="Excluir"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center text-brand-dark font-bold text-xl">
                                {client.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-brand-dark dark:text-gray-100">{client.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{client.company}</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <MailIcon className="w-4 h-4" />
                                {client.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <PhoneIcon className="w-4 h-4" />
                                {client.phone}
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSignIcon className="w-4 h-4" />
                                Receita: {formatCurrency(client.totalRevenue)}
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${client.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {client.status}
                            </span>
                            {client.tags?.map(tag => (
                                <span key={tag.id} className={`px-2 py-1 rounded-full text-xs font-semibold bg-${tag.color}-100 text-${tag.color}-800`}>
                                    {tag.text}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
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