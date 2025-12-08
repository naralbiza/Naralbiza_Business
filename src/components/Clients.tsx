import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Client, Interaction, ClientTag, Lead, Transaction, LeadStatus, ProjectType } from '../types';
import { Card } from './common/Card';
import { Modal } from './common/Modal';
import { PlusIcon, EditIcon, TrashIcon, CheckCircleIcon, FinancialIcon, SearchIcon, MailIcon, PhoneIcon, DollarSignIcon } from './common/Icon';

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
    onSave: (client: Omit<Client, 'id' | 'interactionHistory' | 'totalRevenue' | 'since'> | Client) => void;
    clientToEdit: Client | null;
}> = ({ isOpen, onClose, onSave, clientToEdit }) => {
    const [client, setClient] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'Ativo' as 'Ativo' | 'Inativo',
        tags: [] as ClientTag[],
    });
    const [newTagText, setNewTagText] = useState('');

    useEffect(() => {
        if (clientToEdit) {
            setClient({
                name: clientToEdit.name,
                company: clientToEdit.company,
                email: clientToEdit.email,
                phone: clientToEdit.phone,
                status: clientToEdit.status,
                tags: clientToEdit.tags,
            });
        } else {
            setClient({
                name: '',
                company: '',
                email: '',
                phone: '',
                status: 'Ativo',
                tags: []
            });
        }
    }, [clientToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (clientToEdit) {
            onSave({ ...clientToEdit, ...client });
        } else {
            onSave(client);
        }
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setClient(prev => ({ ...prev, [name]: value }));
    };

    const handleAddTag = () => {
        if (newTagText.trim()) {
            setNewTagText('');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={clientToEdit ? 'Editar Cliente' : 'Novo Cliente'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="name" value={client.name} onChange={handleChange} placeholder="Nome" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                <input name="company" value={client.company} onChange={handleChange} placeholder="Empresa" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                <input name="email" type="email" value={client.email} onChange={handleChange} placeholder="Email" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                <input name="phone" value={client.phone} onChange={handleChange} placeholder="Telefone" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                <select name="status" value={client.status} onChange={handleChange} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                </select>

                {/* Simple Tag Display (Read-only for now in form, can be expanded) */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {client.tags?.map(tag => (
                        <span key={tag.id} className={`px-2 py-1 rounded-full text-xs font-semibold bg-${tag.color}-100 text-${tag.color}-800`}>
                            {tag.text}
                        </span>
                    ))}
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black">Salvar</button>
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
    onAddInteraction: (clientId: number, interaction: Omit<Interaction, 'id'>) => void;
}> = ({ client, leads, transactions, onClose, onAddInteraction }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'interactions' | 'projects' | 'financials'>('overview');
    const [newInteraction, setNewInteraction] = useState({ type: 'Email' as Interaction['type'], notes: '' });

    if (!client) return null;

    const relatedLeads = leads.filter(lead => lead.company.toLowerCase() === client.company.toLowerCase());
    const relatedTransactions = transactions.filter(t => t.description.toLowerCase().includes(client.name.toLowerCase()));

    const handleAddInteraction = (e: React.FormEvent) => {
        e.preventDefault();
        if (client && newInteraction.notes.trim()) {
            onAddInteraction(client.id, { ...newInteraction, date: new Date().toISOString() });
            setNewInteraction({ type: 'Email', notes: '' });
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
                    <TabButton active={activeTab === 'interactions'} onClick={() => setActiveTab('interactions')}>Interações</TabButton>
                    <TabButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')}>Projetos</TabButton>
                    <TabButton active={activeTab === 'financials'} onClick={() => setActiveTab('financials')}>Financeiro</TabButton>
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
                            {client.interactionHistory.length > 0 ? [...client.interactionHistory].reverse().map(item => (
                                <div key={item.id} className="p-3 bg-white dark:bg-gray-700 rounded-md border dark:border-gray-600">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-brand-secondary dark:text-gray-300">{item.type}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(item.date).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.notes}</p>
                                </div>
                            )) : <p className="text-sm text-center py-4 text-gray-500 dark:text-gray-400">Nenhuma interação registrada.</p>}
                        </div>
                        <form onSubmit={handleAddInteraction} className="mt-4 space-y-3">
                            <h4 className="font-semibold text-lg text-brand-dark dark:text-gray-200">Registrar Nova Interação</h4>
                            <div className="flex gap-4">
                                <select value={newInteraction.type} onChange={(e) => setNewInteraction(prev => ({ ...prev, type: e.target.value as Interaction['type'] }))} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                    <option>Email</option><option>Call</option><option>Meeting</option>
                                </select>
                                <input type="text" placeholder="Notas da interação..." value={newInteraction.notes} onChange={(e) => setNewInteraction(prev => ({ ...prev, notes: e.target.value }))} className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
                                <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black">Adicionar</button>
                            </div>
                        </form>
                    </div>
                )}
                {activeTab === 'projects' && (
                    <div className="mt-2">
                        <h4 className="font-semibold text-lg text-brand-dark dark:text-gray-200 mb-2">Projetos Associados</h4>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {relatedLeads.length > 0 ? relatedLeads.map(lead => (
                                <div key={lead.id} className="p-3 border rounded-md dark:border-gray-600 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-brand-dark dark:text-gray-200">{lead.name} ({lead.projectType})</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Valor: Kz {lead.value.toLocaleString('pt-BR')}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${lead.status === LeadStatus.Closed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{lead.status}</span>
                                </div>
                            )) : <p className="text-sm text-center py-4 text-gray-500 dark:text-gray-400">Nenhum projeto encontrado.</p>}
                        </div>
                    </div>
                )}
                {activeTab === 'financials' && (
                    <div className="mt-2">
                        <h4 className="font-semibold text-lg text-brand-dark dark:text-gray-200 mb-2">Histórico Financeiro</h4>
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                            {relatedTransactions.length > 0 ? relatedTransactions.map(t => (
                                <div key={t.id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <div>
                                        <p className="font-medium text-brand-dark dark:text-gray-200">{t.description}</p>
                                        <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('pt-BR')} - {t.category}</p>
                                    </div>
                                    <p className={`font-semibold ${t.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'revenue' ? '+' : '-'} Kz {Math.abs(t.amount).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            )) : <p className="text-sm text-center py-4 text-gray-500 dark:text-gray-400">Nenhuma transação encontrada.</p>}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};


interface ClientsProps {
    clients: Client[];
    leads: Lead[];
    transactions: Transaction[];
    onAddInteraction: (clientId: number, interaction: Omit<Interaction, 'id'>) => void;
    onAddClient: (client: Omit<Client, 'id' | 'interactionHistory' | 'totalRevenue' | 'since'>) => void;
    onUpdateClient: (client: Client) => void;
    onDeleteClient: (clientId: number) => void;
    onAddTag?: (clientId: number, tagId: string) => void;
    onRemoveTag?: (clientId: number, tagId: string) => void;
    onCreateTag?: (tag: Omit<ClientTag, 'id'>) => void;
}

/**
 * Clients page component.
 * Manages the list of clients, their details, and interactions.
 */
export const Clients: React.FC<ClientsProps> = ({
    clients, leads, transactions, onAddInteraction, onAddClient, onUpdateClient, onDeleteClient,
    onAddTag, onRemoveTag, onCreateTag
}) => {
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

    const handleDeleteClick = (e: React.MouseEvent, clientId: number) => {
        e.stopPropagation();
        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
            onDeleteClient(clientId);
        }
    };

    const handleSaveClient = (clientData: Omit<Client, 'id' | 'interactionHistory' | 'totalRevenue' | 'since'> | Client) => {
        if ('id' in clientData) {
            onUpdateClient(clientData as Client);
        } else {
            onAddClient(clientData);
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
                <Card><div className="flex items-center gap-4"><FinancialIcon className="w-8 h-8 text-blue-500" /><p className="text-sm font-medium text-brand-secondary">Receita Média<br /><span className="text-3xl font-bold text-brand-dark">Kz {(analytics.avgRevenue / 1000).toFixed(1)}k</span></p></div></Card>
                <Card className="lg:col-span-2"><p className="text-sm font-medium text-brand-secondary">Cliente Mais Valioso</p><p className="text-2xl font-bold text-brand-gold">{analytics.topClient?.name || 'N/A'}</p><p className="text-sm text-green-600 font-semibold">Kz {analytics.topClient?.totalRevenue.toLocaleString('pt-BR') || '0'}</p></Card>
            </div>

            <Card title="Top 5 Clientes por Receita Total">
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={analytics.topClientsChartData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" unit="k" tickFormatter={(val) => `${val / 1000}`} />
                            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: number) => `Kz ${value.toLocaleString('pt-BR')}`} />
                            <Legend />
                            <Bar dataKey="totalRevenue" name="Receita Total" fill="#D4AF37" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-brand-dark dark:text-gray-100">Clientes</h2>
                <button onClick={handleNewClient} className="flex items-center gap-2 bg-brand-gold text-brand-dark font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
                    <PlusIcon className="w-5 h-5" />
                    Novo Cliente
                </button>
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
                            <button onClick={(e) => handleEditClient(e, client)} className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                                <EditIcon className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => handleDeleteClick(e, client.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                <TrashIcon className="w-4 h-4" />
                            </button>
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
                                Receita: Kz {client.totalRevenue.toLocaleString('pt-BR')}
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
                />
            )}

            <ClientFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveClient}
                clientToEdit={clientToEdit}
            />
        </div>
    );
};