import React, { useState, useMemo, useEffect } from 'react';
import { Card } from './common/Card';
import { Lead, LeadStatus, LeadPriority, ProjectType, Employee, User, LeadNote, Task, Activity, FileAttachment, Proposal, FollowUp, Page } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ProposalEditor } from './ProposalEditor';
import { FollowUpTimeline } from './FollowUpTimeline';
import { PlusIcon, MailIcon, TaskIcon, CheckIcon, FileTextIcon, ActivityIcon, FinancialIcon, TargetIcon, ClientsIcon, PipelineIcon, ClockIcon, CheckCircleIcon, UserIcon, DollarSignIcon, MessageCircleIcon, ListIcon, SendIcon, PhoneIcon, SearchIcon, TrashIcon, StarIcon } from './common/Icon';
import { Modal } from './common/Modal';
import { formatCurrency } from '../utils';

const statusColumns: LeadStatus[] = [
    LeadStatus.New,
    LeadStatus.Contacted,
    LeadStatus.Negotiation,
    LeadStatus.Won,
    LeadStatus.Lost,
];

const priorityColors: { [key in LeadPriority]: string } = {
    [LeadPriority.High]: 'bg-red-500',
    [LeadPriority.Medium]: 'bg-yellow-500',
    [LeadPriority.Low]: 'bg-green-500',
};

const projectTypeColors: { [key in ProjectType]: string } = {
    [ProjectType.Wedding]: 'bg-pink-100 text-pink-800',
    [ProjectType.Corporate]: 'bg-blue-100 text-blue-800',
    [ProjectType.Portrait]: 'bg-purple-100 text-purple-800',
    [ProjectType.Event]: 'bg-indigo-100 text-indigo-800',
};

const LeadCard: React.FC<{ lead: Lead; owner?: Employee; onClick: () => void }> = ({ lead, owner, onClick }) => {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('leadId', lead.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow mb-4 group active:cursor-grabbing cursor-grab"
        >
            <div onClick={onClick} className="cursor-pointer">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-brand-dark dark:text-gray-100 pr-2">{lead.name}</h4>
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${priorityColors[lead.priority]}`} title={`Prioridade: ${lead.priority}`}></span>
                </div>
                <p className="text-sm text-brand-secondary dark:text-gray-400">{lead.company}</p>
                <div className="mt-3 flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mb-1 ${projectTypeColors[lead.projectType]}`}>{lead.projectType}</span>
                        {lead.expectedCloseDate && (
                            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {new Date(lead.expectedCloseDate).toLocaleDateString('pt-BR')}
                            </span>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-black text-brand-dark dark:text-white">{formatCurrency(lead.value)}</p>
                        {lead.probability !== undefined && (
                            <div className="flex items-center gap-1 justify-end">
                                <div className="w-12 bg-gray-100 dark:bg-gray-600 h-1 rounded-full overflow-hidden">
                                    <div className="bg-brand-gold h-full" style={{ width: `${lead.probability}%` }}></div>
                                </div>
                                <span className="text-[10px] font-bold text-brand-gold">{lead.probability}%</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="border-t dark:border-gray-600 mt-3 pt-2 flex justify-between items-center">
                {owner && <img src={owner.avatarUrl} alt={owner.name} className="w-6 h-6 rounded-full" title={`Responsável: ${owner.name}`} />}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button title="Adicionar Tarefa" className="text-gray-400 hover:text-brand-dark"><TaskIcon className="w-4 h-4" /></button>
                    <a href={`mailto:${lead.email}`} title="Enviar Email" className="text-gray-400 hover:text-brand-dark"><MailIcon className="w-4 h-4" /></a>
                </div>
            </div>
        </div>
    );
};

const LeadDetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
    employees: Employee[];
    activities: Activity[];
    proposals: Proposal[];
    followUps: FollowUp[];
    onUpdate: (updatedLead: Lead) => Promise<void>;
    onAddNote: (leadId: string, noteText: string) => Promise<void>;
    onAddTask: (leadId: string, taskData: Omit<Task, 'id' | 'completed'>) => Promise<void>;
    onToggleTask: (leadId: string, taskId: number) => Promise<void>;
    onAddLeadFile: (leadId: string, fileData: Omit<FileAttachment, 'id'>) => Promise<void>;
    onConvertLead: (leadId: string) => Promise<void>;
    onDeleteLead: (leadId: string) => Promise<void>;
    onAddProposal: (proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    onAddFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt'>) => Promise<void>;
    onRemoveFollowUp: (id: string) => Promise<void>;
}> = ({
    isOpen, onClose, lead, employees, activities, proposals, followUps,
    onUpdate, onAddNote, onAddTask, onToggleTask, onAddLeadFile, onConvertLead, onDeleteLead,
    onAddProposal, onAddFollowUp, onRemoveFollowUp
}) => {
        const [activeTab, setActiveTab] = useState<'details' | 'proposals' | 'followup'>('details');
        const [editedLead, setEditedLead] = useState(lead);
        const [newNote, setNewNote] = useState("");
        const [newTaskText, setNewTaskText] = useState("");
        const [newTaskDueDate, setNewTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
        const [isSaving, setIsSaving] = useState(false);
        const [errorMessage, setErrorMessage] = useState<string | null>(null);

        const { hasPermission } = useAuth();
        const canEdit = hasPermission(Page.CRM, 'edit');

        React.useEffect(() => {
            setEditedLead(lead);
            setActiveTab('details');
            setErrorMessage(null);
        }, [lead]);

        if (!isOpen || !editedLead) return null;

        const handleNoteSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (newNote.trim()) {
                setIsSaving(true);
                try {
                    await onAddNote(editedLead.id, newNote);
                    setNewNote("");
                } catch (err) { } finally { setIsSaving(false); }
            }
        };

        const handleTaskSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (newTaskText.trim() && newTaskDueDate) {
                setIsSaving(true);
                try {
                    await onAddTask(editedLead.id, { text: newTaskText, dueDate: newTaskDueDate });
                    setNewTaskText("");
                } catch (err) { } finally { setIsSaving(false); }
            }
        };

        const handleAddFile = async () => {
            const fileName = prompt("Nome do arquivo:");
            if (fileName) {
                const fileData: Omit<FileAttachment, 'id'> = {
                    name: fileName,
                    size: '0KB',
                    type: 'Document',
                    uploadDate: new Date().toISOString()
                };
                setIsSaving(true);
                try {
                    await onAddLeadFile(editedLead.id, fileData);
                } catch (err) { } finally { setIsSaving(false); }
            }
        };

        const handleSave = async () => {
            if (editedLead) {
                setIsSaving(true);
                setErrorMessage(null);
                try {
                    await onUpdate(editedLead);
                    onClose();
                } catch (error: any) {
                    setErrorMessage("Erro ao salvar: " + (error.message || "Erro desconhecido"));
                } finally {
                    setIsSaving(false);
                }
            }
        };

        const handleConvert = async () => {
            const confirmConvert = window.confirm("Deseja realmente converter este lead em cliente? Esta ação também finalizará o lead.");
            if (!confirmConvert) return;

            setIsSaving(true);
            try {
                await onConvertLead(editedLead.id);
                onClose();
            } catch (error: any) {
                alert("Erro ao converter: " + (error.message || "Erro desconhecido"));
            } finally {
                setIsSaving(false);
            }
        };

        const handleDelete = async () => {
            await onDeleteLead(editedLead.id);
            onClose();
        };

        return (
            <Modal isOpen={isOpen} onClose={onClose} title={lead?.name || "Detalhes do Lead"} maxWidth="4xl">
                {lead && (
                    <div className="flex flex-col h-[70vh]">
                        <div className="flex border-b dark:border-gray-700 mb-6">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'details' ? 'border-brand-gold text-brand-dark dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                <UserIcon className="w-4 h-4" /> Detalhes e Notas
                            </button>
                            <button
                                onClick={() => setActiveTab('proposals')}
                                className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'proposals' ? 'border-brand-gold text-brand-dark dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                <FileTextIcon className="w-4 h-4" /> Propostas
                            </button>
                            <button
                                onClick={() => setActiveTab('followup')}
                                className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'followup' ? 'border-brand-gold text-brand-dark dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                <MessageCircleIcon className="w-4 h-4" /> Follow-up
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto custom-scrollbar px-1">
                            {activeTab === 'details' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
                                                <input
                                                    type="text"
                                                    value={editedLead?.name}
                                                    onChange={(e) => setEditedLead(prev => prev ? { ...prev, name: e.target.value } : null)}
                                                    className="w-full p-2.5 border rounded-lg dark:bg-gray-700 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Empresa</label>
                                                <input
                                                    type="text"
                                                    value={editedLead?.company}
                                                    onChange={(e) => setEditedLead(prev => prev ? { ...prev, company: e.target.value } : null)}
                                                    className="w-full p-2.5 border rounded-lg dark:bg-gray-700 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor do Negócio</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-gray-400 text-sm">AOA</span>
                                                    <input
                                                        type="number"
                                                        value={editedLead?.value}
                                                        onChange={(e) => setEditedLead(prev => prev ? { ...prev, value: Number(e.target.value) } : null)}
                                                        className="w-full p-2.5 pl-12 border rounded-lg dark:bg-gray-700 outline-none font-bold"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Projecto</label>
                                                <select
                                                    value={editedLead?.projectType}
                                                    onChange={(e) => setEditedLead(prev => prev ? { ...prev, projectType: e.target.value as ProjectType } : null)}
                                                    className="w-full p-2.5 border rounded-lg dark:bg-gray-700 outline-none"
                                                >
                                                    {Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prioridade</label>
                                                <select
                                                    value={editedLead?.priority}
                                                    onChange={(e) => setEditedLead(prev => prev ? { ...prev, priority: e.target.value as LeadPriority } : null)}
                                                    className="w-full p-2.5 border rounded-lg dark:bg-gray-700 outline-none"
                                                >
                                                    {Object.values(LeadPriority).map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Probabilidade</label>
                                                <input
                                                    type="number"
                                                    min="0" max="100"
                                                    value={editedLead?.probability || 0}
                                                    onChange={(e) => setEditedLead(prev => prev ? { ...prev, probability: Number(e.target.value) } : null)}
                                                    className="w-full p-2.5 border rounded-lg dark:bg-gray-700 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecho Esperado</label>
                                                <input
                                                    type="date"
                                                    value={editedLead?.expectedCloseDate ? editedLead.expectedCloseDate.split('T')[0] : ''}
                                                    onChange={(e) => setEditedLead(prev => prev ? { ...prev, expectedCloseDate: e.target.value } : null)}
                                                    className="w-full p-2.5 border rounded-lg dark:bg-gray-700 outline-none text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            {canEdit && (
                                                <>
                                                    <button
                                                        onClick={handleSave}
                                                        disabled={isSaving}
                                                        className="flex-1 bg-brand-dark text-white py-2.5 rounded-lg font-bold hover:bg-black transition-colors disabled:opacity-50"
                                                    >
                                                        {isSaving ? "Salvando..." : "Salvar Alterações"}
                                                    </button>
                                                    <button
                                                        onClick={handleConvert}
                                                        className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-bold hover:bg-green-700 transition-colors"
                                                    >
                                                        Converter em Cliente
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        {canEdit && (
                                            <button
                                                onClick={() => { if (confirm('Excluir este lead?')) handleDelete(); }}
                                                className="w-full bg-red-50 text-red-600 py-2.5 rounded-lg font-bold hover:bg-red-100 transition-colors"
                                            >
                                                Excluir Lead
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700">
                                            <h4 className="font-bold text-brand-dark dark:text-gray-100 flex items-center gap-2 mb-4">
                                                <ListIcon className="w-4 h-4" /> Notas e Histórico
                                            </h4>
                                            <div className="flex gap-2 mb-4">
                                                <input
                                                    type="text"
                                                    placeholder="Adicionar uma nota..."
                                                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700 text-sm outline-none"
                                                    value={newNote}
                                                    onChange={(e) => setNewNote(e.target.value)}
                                                />
                                                <button
                                                    onClick={handleNoteSubmit}
                                                    className="bg-brand-gold text-brand-dark px-3 py-1 rounded-lg text-sm font-bold"
                                                >
                                                    Ok
                                                </button>
                                            </div>
                                            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2 text-sm">
                                                {lead.notes.map(note => (
                                                    <div key={note.id} className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border dark:border-gray-600">
                                                        <p className="text-gray-600 dark:text-gray-300">{note.text}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1 font-medium">{new Date(note.date).toLocaleString()}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'proposals' && (
                                <ProposalEditor
                                    leadId={lead.id}
                                    existingProposals={proposals.filter(p => p.leadId === lead.id)}
                                    onSave={onAddProposal}
                                />
                            )}

                            {activeTab === 'followup' && (
                                <FollowUpTimeline
                                    leadId={lead.id}
                                    followUps={followUps.filter(f => f.leadId === lead.id)}
                                    onAdd={onAddFollowUp}
                                    onRemove={onRemoveFollowUp}
                                />
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        );
    };

const NewLeadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (lead: Omit<Lead, 'id' | 'notes' | 'tasks' | 'files'>) => Promise<void>;
    employees: Employee[];
    currentUser?: User;
}> = ({ isOpen, onClose, onSave, employees, currentUser }) => {
    const initialLeadState: Omit<Lead, 'id' | 'notes' | 'tasks' | 'files' | 'convertedToClientId'> = {
        name: '',
        company: '',
        email: '',
        phone: '',
        source: '',
        priority: LeadPriority.Medium,
        status: LeadStatus.New,
        ownerId: currentUser?.id || (employees.length > 0 ? employees[0].id : ''),
        projectType: ProjectType.Wedding,
        value: 0,
        probability: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    const [newLead, setNewLead] = useState(initialLeadState);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewLead(prev => ({ ...prev, [name]: name === 'value' ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setErrorMessage(null);
        try {
            await onSave(newLead);
            setNewLead(initialLeadState);
            onClose();
        } catch (error: any) {
            setErrorMessage("Erro ao criar lead: " + (error.message || "Erro desconhecido"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Criar Novo Lead">
            {errorMessage && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{errorMessage}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name" value={newLead.name} onChange={handleInputChange} placeholder="Nome do Lead" className="p-2 border rounded w-full" required />
                    <input name="company" value={newLead.company} onChange={handleInputChange} placeholder="Empresa" className="p-2 border rounded w-full" />
                    <input name="email" type="email" value={newLead.email} onChange={handleInputChange} placeholder="Email" className="p-2 border rounded w-full" />
                    <input name="phone" value={newLead.phone} onChange={handleInputChange} placeholder="Telefone" className="p-2 border rounded w-full" />
                    <input name="value" type="number" value={newLead.value} onChange={handleInputChange} placeholder="Valor Estimado (AOA)" className="p-2 border rounded w-full" />
                    <input name="probability" type="number" min="0" max="100" value={newLead.probability || 0} onChange={handleInputChange} placeholder="Probabilidade (%)" className="p-2 border rounded w-full" />
                    <input name="expectedCloseDate" type="date" value={newLead.expectedCloseDate || ''} onChange={handleInputChange} className="p-2 border rounded w-full" />
                    <input name="source" value={newLead.source} onChange={handleInputChange} placeholder="Fonte do Lead" className="p-2 border rounded w-full" />
                    <select name="priority" value={newLead.priority} onChange={handleInputChange} className="p-2 border rounded w-full">
                        {Object.values(LeadPriority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select name="ownerId" value={newLead.ownerId} onChange={handleInputChange} className="p-2 border rounded w-full">
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                    <select name="projectType" value={newLead.projectType} onChange={handleInputChange} className="p-2 border rounded w-full">
                        {Object.values(ProjectType).map(pt => <option key={pt} value={pt}>{pt}</option>)}
                    </select>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300" disabled={isSaving}>Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black disabled:opacity-50" disabled={isSaving}>
                        {isSaving ? 'Salvando...' : 'Criar Lead'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

interface PipelineProps {
    leads: Lead[];
    employees: Employee[];
    activities: Activity[];
    proposals: Proposal[];
    followUps: FollowUp[];
    onUpdateLead: (updatedLead: Lead) => Promise<void>;
    onAddLead: (lead: Omit<Lead, 'id' | 'notes' | 'tasks' | 'files'>) => Promise<void>;
    onAddLeadNote: (leadId: string, noteText: string) => Promise<void>;
    onAddLeadTask: (leadId: string, taskData: Omit<Task, 'id' | 'completed'>) => Promise<void>;
    onToggleLeadTask: (leadId: string, taskId: number) => Promise<void>;
    onAddLeadFile: (leadId: string, fileData: Omit<FileAttachment, 'id'>) => Promise<void>;
    onConvertLeadToClient: (leadId: string) => Promise<void>;
    onDeleteLead: (leadId: string) => Promise<void>;
    onAddProposal: (proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    onUpdateProposal: (proposal: Proposal) => Promise<void>;
    onRemoveProposal: (id: string) => Promise<void>;
    onAddFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt'>) => Promise<void>;
    onRemoveFollowUp: (id: string) => Promise<void>;
    currentUser: User;
}

export const Pipeline: React.FC<PipelineProps> = ({
    leads, employees, activities, proposals, followUps,
    onUpdateLead, onAddLead, onAddLeadNote, onAddLeadTask, onToggleLeadTask, onAddLeadFile, onConvertLeadToClient, onDeleteLead,
    onAddProposal, onUpdateProposal, onRemoveProposal, onAddFollowUp, onRemoveFollowUp, currentUser
}) => {
    const { hasPermission } = useAuth();
    const canCreate = hasPermission(Page.CRM, 'create');
    const canEdit = hasPermission(Page.CRM, 'edit');

    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const followUpMetrics = useMemo(() => {
        if (!followUps.length) return { count: 0, duration: 0, rating: 0, positive: 0 };
        const count = followUps.length;
        const duration = followUps.reduce((sum, f) => sum + (f.duration || 0), 0);
        const ratingCount = followUps.filter(f => f.rating).length;
        const ratingSum = followUps.reduce((sum, f) => sum + (f.rating || 0), 0);
        const positive = followUps.filter(f => f.outcome === 'Positivo').length;
        return {
            count,
            duration: (duration / 60).toFixed(1),
            rating: ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : '0.0',
            positive
        };
    }, [followUps]);

    const [filterOwner, setFilterOwner] = useState<number | 'all'>('all');
    const [filterPriority, setFilterPriority] = useState<LeadPriority | 'all'>('all');
    const [filterProjectType, setFilterProjectType] = useState<ProjectType | 'all'>('all');

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesOwner = filterOwner === 'all' || lead.ownerId === filterOwner;
            const matchesPriority = filterPriority === 'all' || lead.priority === filterPriority;
            const matchesProjectType = filterProjectType === 'all' || lead.projectType === filterProjectType;

            return matchesSearch && matchesOwner && matchesPriority && matchesProjectType;
        });
    }, [leads, searchTerm, filterOwner, filterPriority, filterProjectType]);

    const leadsByStatus = useMemo(() => {
        const grouped: { [key in LeadStatus]: Lead[] } = {} as any;
        statusColumns.forEach(status => grouped[status] = []);
        filteredLeads.forEach(lead => {
            if (grouped[lead.status]) {
                grouped[lead.status].push(lead);
            }
        });
        return grouped;
    }, [filteredLeads]);

    const handleLeadClick = (lead: Lead) => {
        setSelectedLead(lead);
    };

    const getColumnValue = (status: LeadStatus) => {
        return leadsByStatus[status].reduce((sum, lead) => sum + lead.value, 0);
    }

    const getStageConversion = (status: LeadStatus) => {
        const total = leads.length;
        if (total === 0) return '0%';
        const higherStagesCount = leads.filter(l => {
            const statusIdx = statusColumns.indexOf(status);
            const leadIdx = statusColumns.indexOf(l.status);
            return leadIdx >= statusIdx;
        }).length;

        return ((higherStagesCount / total) * 100).toFixed(0) + '%';
    }

    const handleDragOver = (e: React.DragEvent) => {
        if (!canEdit) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, newStatus: LeadStatus) => {
        if (!canEdit) return;
        e.preventDefault();
        const leadId = e.dataTransfer.getData('leadId');
        const lead = leads.find(l => l.id === leadId);
        if (lead && lead.status !== newStatus) {
            await onUpdateLead({ ...lead, status: newStatus });
        }
    };

    const kpiData = useMemo(() => {
        const activeLeads = leads.filter(l => l.status !== LeadStatus.Won && l.status !== LeadStatus.Lost);
        const totalPipelineValue = activeLeads.reduce((sum, l) => sum + l.value, 0);
        const weightedValue = activeLeads.reduce((sum, l) => sum + (l.value * (l.probability || 0) / 100), 0);
        const avgLeadValue = activeLeads.length > 0 ? totalPipelineValue / activeLeads.length : 0;
        const conversionRate = leads.length > 0 ? (leads.filter(l => l.status === LeadStatus.Won).length / leads.length) * 100 : 0;
        return { totalPipelineValue, weightedValue, avgLeadValue, conversionRate: conversionRate.toFixed(1) + '%' };
    }, [leads]);

    return (
        <>
            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card><div className="flex items-center gap-4"><FinancialIcon className="w-8 h-8 text-blue-500" /><p className="text-sm font-medium text-brand-secondary">Valor em Pipeline<br /><span className="text-2xl font-black text-brand-dark">{formatCurrency(kpiData.totalPipelineValue)}</span></p></div></Card>
                    <Card><div className="flex items-center gap-4"><CheckCircleIcon className="w-8 h-8 text-green-500" /><p className="text-sm font-medium text-brand-secondary">Valor Ponderado<br /><span className="text-2xl font-black text-brand-dark">{formatCurrency(kpiData.weightedValue)}</span></p></div></Card>
                    <Card><div className="flex items-center gap-4"><TargetIcon className="w-8 h-8 text-indigo-500" /><p className="text-sm font-medium text-brand-secondary">Taxa de Conversão<br /><span className="text-2xl font-black text-brand-dark">{kpiData.conversionRate}</span></p></div></Card>
                    <Card><div className="flex items-center gap-4"><ClockIcon className="w-8 h-8 text-yellow-500" /><p className="text-sm font-medium text-brand-secondary">VGV Médio<br /><span className="text-2xl font-black text-brand-dark">{formatCurrency(kpiData.avgLeadValue)}</span></p></div></Card>
                </div>

                <h3 className="text-lg font-bold text-brand-dark dark:text-gray-200 mb-4 px-1">Metrificação de Follow-ups</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card><div className="flex items-center gap-4"><MessageCircleIcon className="w-8 h-8 text-blue-500" /><p className="text-sm font-medium text-brand-secondary">Total Interações<br /><span className="text-2xl font-black text-brand-dark">{followUpMetrics.count}</span></p></div></Card>
                    <Card><div className="flex items-center gap-4"><ClockIcon className="w-8 h-8 text-purple-500" /><p className="text-sm font-medium text-brand-secondary">Tempo Total (h)<br /><span className="text-2xl font-black text-brand-dark">{followUpMetrics.duration}h</span></p></div></Card>
                    <Card><div className="flex items-center gap-4"><StarIcon className="w-8 h-8 text-brand-gold" /><p className="text-sm font-medium text-brand-secondary">Qualidade Média<br /><span className="text-2xl font-black text-brand-dark">{followUpMetrics.rating}</span></p></div></Card>
                    <Card><div className="flex items-center gap-4"><CheckCircleIcon className="w-8 h-8 text-green-500" /><p className="text-sm font-medium text-brand-secondary">Positivos<br /><span className="text-2xl font-black text-brand-dark">{followUpMetrics.positive}</span></p></div></Card>
                </div>

                <div className="flex flex-wrap gap-4 items-end mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
                    <div className="flex-1 min-w-[250px]">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Busca Rápida</label>
                        <div className="relative">
                            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Nome, empresa ou email..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none text-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="w-48">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Responsável</label>
                        <select
                            className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none text-sm focus:ring-2 focus:ring-brand-gold transition-all"
                            value={filterOwner}
                            onChange={(e) => setFilterOwner(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        >
                            <option value="all">Todos os Responsáveis</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-40">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Prioridade</label>
                        <select
                            className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none text-sm focus:ring-2 focus:ring-brand-gold transition-all"
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value as any)}
                        >
                            <option value="all">Todas</option>
                            {Object.values(LeadPriority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div className="w-40">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tipo de Projeto</label>
                        <select
                            className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none text-sm focus:ring-2 focus:ring-brand-gold transition-all"
                            value={filterProjectType}
                            onChange={(e) => setFilterProjectType(e.target.value as any)}
                        >
                            <option value="all">Todos</option>
                            {Object.values(ProjectType).map(pt => <option key={pt} value={pt}>{pt}</option>)}
                        </select>
                    </div>

                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilterOwner('all');
                            setFilterPriority('all');
                            setFilterProjectType('all');
                        }}
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Limpar Filtros"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>

                    {canCreate && (
                        <button
                            onClick={() => setIsNewLeadModalOpen(true)}
                            className="flex items-center justify-center gap-2 bg-brand-gold text-brand-dark font-bold px-6 py-2 rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all ml-auto"
                        >
                            <PlusIcon className="w-5 h-5" /> Criar Novo Lead
                        </button>
                    )}
                </div>

                <div className="flex space-x-4 overflow-x-auto pb-4">
                    {statusColumns.map(status => (
                        <div
                            key={status}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, status)}
                            className="flex-shrink-0 w-80 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col h-[calc(100vh-250px)]"
                        >
                            <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-700 rounded-t-lg shadow-sm">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-bold text-brand-dark dark:text-gray-100">{status}</h3>
                                    <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-bold">
                                        {leadsByStatus[status].length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-sm font-black text-brand-gold">{formatCurrency(getColumnValue(status))}</p>
                                    <div className="text-[10px] text-gray-400 text-right">
                                        <p>Conversão acumulada</p>
                                        <p className="font-bold text-gray-500">{getStageConversion(status)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 space-y-4 overflow-y-auto flex-grow custom-scrollbar">
                                {leadsByStatus[status].map(lead => (
                                    <LeadCard
                                        key={lead.id}
                                        lead={lead}
                                        owner={employees.find(e => e.id === lead.ownerId)}
                                        onClick={() => handleLeadClick(lead)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <LeadDetailModal
                isOpen={!!selectedLead}
                onClose={() => setSelectedLead(null)}
                lead={selectedLead}
                employees={employees}
                activities={activities}
                proposals={proposals}
                followUps={followUps}
                onUpdate={onUpdateLead}
                onAddNote={onAddLeadNote}
                onAddTask={onAddLeadTask}
                onToggleTask={onToggleLeadTask}
                onAddLeadFile={onAddLeadFile}
                onConvertLead={onConvertLeadToClient}
                onDeleteLead={onDeleteLead}
                onAddProposal={onAddProposal}
                onAddFollowUp={onAddFollowUp}
                onRemoveFollowUp={onRemoveFollowUp}
            />

            <NewLeadModal
                isOpen={isNewLeadModalOpen}
                onClose={() => setIsNewLeadModalOpen(false)}
                onSave={onAddLead}
                employees={employees}
                currentUser={currentUser}
            />
        </>
    );
};
