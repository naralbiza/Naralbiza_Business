
import React, { useState, useMemo } from 'react';
import { Card } from './common/Card';
import { Lead, LeadStatus, LeadPriority, ProjectType, Employee, LeadNote, Task, Activity, FileAttachment } from '../types';
// FIX: Imported PipelineIcon which was missing from the import list.
import { PlusIcon, MailIcon, TaskIcon, CheckIcon, FileTextIcon, ActivityIcon, FinancialIcon, TargetIcon, ClientsIcon, PipelineIcon } from './common/Icon';
import { Modal } from './common/Modal';

const statusColumns: LeadStatus[] = [
    LeadStatus.New,
    LeadStatus.Contacted,
    LeadStatus.Proposal,
    LeadStatus.Negotiation,
    LeadStatus.Production,
    LeadStatus.Closed,
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

const LeadCard: React.FC<{ lead: Lead; owner?: Employee; onClick: () => void }> = ({ lead, owner, onClick }) => (
    <div
        className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow mb-4 group"
    >
        <div onClick={onClick} className="cursor-pointer">
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-brand-dark dark:text-gray-100 pr-2">{lead.name}</h4>
                <span className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${priorityColors[lead.priority]}`} title={`Prioridade: ${lead.priority}`}></span>
            </div>
            <p className="text-sm text-brand-secondary dark:text-gray-400">{lead.company}</p>
            <div className="mt-3 flex justify-between items-end">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${projectTypeColors[lead.projectType]}`}>{lead.projectType}</span>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">Kz {lead.value.toLocaleString('pt-BR')}</p>
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

const LeadDetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
    employees: Employee[];
    activities: Activity[];
    onUpdate: (updatedLead: Lead) => void;
    onAddNote: (leadId: number, noteText: string) => void;
    onAddTask: (leadId: number, taskData: Omit<Task, 'id' | 'completed'>) => void;
    onToggleTask: (leadId: number, taskId: number) => void;
    onAddFile: (leadId: number, fileData: Omit<FileAttachment, 'id'>) => void;
    onConvertLead: (leadId: number) => void;
    onDeleteLead: (leadId: number) => void;
}> = ({ isOpen, onClose, lead, employees, activities, onUpdate, onAddNote, onAddTask, onToggleTask, onAddFile, onConvertLead, onDeleteLead }) => {
    const [editedLead, setEditedLead] = useState(lead);
    const [newNote, setNewNote] = useState("");
    const [newTaskText, setNewTaskText] = useState("");
    const [newTaskDueDate, setNewTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'tasks' | 'activity' | 'files'>('details');

    React.useEffect(() => {
        setEditedLead(lead);
        setActiveTab('details'); // Reset tab on new lead
    }, [lead]);

    if (!isOpen || !editedLead) return null;

    const leadActivities = activities.filter(a => a.target.includes(editedLead.name) || a.target.includes(editedLead.company));

    const handleNoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newNote.trim()) {
            onAddNote(editedLead.id, newNote);
            setNewNote("");
        }
    };

    const handleTaskSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskText.trim() && newTaskDueDate) {
            onAddTask(editedLead.id, { text: newTaskText, dueDate: newTaskDueDate });
            setNewTaskText("");
        }
    };

    const handleAddFile = () => {
        const fileName = prompt("Nome do arquivo:");
        if (fileName) {
            const fileData: Omit<FileAttachment, 'id'> = {
                name: fileName,
                size: '0KB', // Placeholder as we don't have real upload yet
                type: 'Document',
                uploadDate: new Date().toISOString()
            };
            onAddFile(editedLead.id, fileData);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedLead(prev => prev ? { ...prev, [name]: name === 'value' || name === 'ownerId' ? Number(value) : value } : null);
    };

    const handleSave = () => {
        if (editedLead) onUpdate(editedLead);
        onClose();
    };

    const handleConvert = () => {
        onConvertLead(editedLead.id);
        onClose();
    };

    const handleDelete = () => {
        onDeleteLead(editedLead.id);
        onClose();
    };

    const TabButton: React.FC<{ tab: string, children: React.ReactNode }> = ({ tab, children }) => (
        <button onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === tab ? 'border-b-2 border-brand-gold text-brand-dark dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            {children}
        </button>
    )

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Detalhes de ${lead?.name}`}>
            <div className="border-b dark:border-gray-700 mb-4">
                <nav className="-mb-px flex space-x-4">
                    <TabButton tab="details">Detalhes</TabButton>
                    <TabButton tab="tasks">Tarefas ({editedLead.tasks.filter(t => !t.completed).length})</TabButton>
                    <TabButton tab="notes">Notas ({editedLead.notes.length})</TabButton>
                    <TabButton tab="activity">Atividades</TabButton>
                    <TabButton tab="files">Arquivos ({editedLead.files.length})</TabButton>
                </nav>
            </div>

            <div className="min-h-[300px]">
                {activeTab === 'details' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="text-sm">Nome</label><input name="name" value={editedLead.name} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
                            <div><label className="text-sm">Empresa</label><input name="company" value={editedLead.company} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
                            <div><label className="text-sm">Email</label><input name="email" type="email" value={editedLead.email} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
                            <div><label className="text-sm">Telefone</label><input name="phone" value={editedLead.phone} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
                            <div><label className="text-sm">Valor (Kz)</label><input name="value" type="number" value={editedLead.value} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
                            <div><label className="text-sm">Fonte</label><input name="source" value={editedLead.source} onChange={handleInputChange} className="p-2 border rounded w-full" /></div>
                            <div>
                                <label className="text-sm">Prioridade</label>
                                <select name="priority" value={editedLead.priority} onChange={handleInputChange} className="p-2 border rounded w-full">
                                    {Object.values(LeadPriority).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm">Status</label>
                                <select name="status" value={editedLead.status} onChange={handleInputChange} className="p-2 border rounded w-full">
                                    {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm">Responsável</label>
                                <select name="ownerId" value={editedLead.ownerId} onChange={handleInputChange} className="p-2 border rounded w-full">
                                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm">Tipo de Projeto</label>
                                <select name="projectType" value={editedLead.projectType} onChange={handleInputChange} className="p-2 border rounded w-full">
                                    {Object.values(ProjectType).map(pt => <option key={pt} value={pt}>{pt}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'tasks' && (
                    <div>
                        <form onSubmit={handleTaskSubmit} className="flex gap-2 mb-4">
                            <input value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="Nova tarefa..." className="flex-grow p-2 border rounded" />
                            <input type="date" value={newTaskDueDate} onChange={e => setNewTaskDueDate(e.target.value)} className="p-2 border rounded" />
                            <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black">Adicionar</button>
                        </form>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {editedLead.tasks.map(task => (
                                <div key={task.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                                    <input type="checkbox" checked={task.completed} onChange={() => onToggleTask(editedLead.id, task.id)} className="w-5 h-5 rounded text-brand-gold focus:ring-brand-gold" />
                                    <p className={`flex-grow ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.text}</p>
                                    <span className="text-xs text-gray-400">{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'notes' && (
                    <div>
                        <form onSubmit={handleNoteSubmit} className="mb-4">
                            <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Adicionar uma nota..." rows={3} className="p-2 border rounded w-full mb-2"></textarea>
                            <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black w-full">Salvar Nota</button>
                        </form>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {[...editedLead.notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(note => {
                                const author = employees.find(e => e.id === note.authorId);
                                return (
                                    <div key={note.id} className="p-3 bg-gray-50 rounded-md border">
                                        <div className="flex items-center gap-2 mb-1">
                                            {author && <img src={author.avatarUrl} className="w-6 h-6 rounded-full" />}
                                            <p className="font-semibold text-sm">{author?.name || 'Desconhecido'}</p>
                                            <p className="text-xs text-gray-400 ml-auto">{new Date(note.date).toLocaleString('pt-BR')}</p>
                                        </div>
                                        <p className="text-sm text-gray-700">{note.text}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {activeTab === 'activity' && (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {leadActivities.map(activity => {
                            const actor = employees.find(e => e.id === activity.actorId);
                            return (
                                <div key={activity.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
                                    {actor && <img src={actor.avatarUrl} className="w-8 h-8 rounded-full mt-1" />}
                                    <div>
                                        <p className="text-sm text-gray-700"><span className="font-semibold">{actor?.name}</span> {activity.action}.</p>
                                        <p className="text-xs text-gray-400">{new Date(activity.date).toLocaleString('pt-BR')}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {activeTab === 'files' && (
                    <div>
                        <button onClick={handleAddFile} className="w-full text-center px-4 py-2 rounded text-white bg-brand-dark hover:bg-black mb-4">Adicionar Arquivo</button>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {editedLead.files.map(file => (
                                <div key={file.id} className="flex items-center gap-3 p-2 rounded border hover:bg-gray-50">
                                    <FileTextIcon className="w-6 h-6 text-gray-500" />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-sm">{file.name}</p>
                                        <p className="text-xs text-gray-400">{file.size} - {file.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            <div className="border-t pt-4 mt-4 flex justify-between items-center">
                <div className="flex gap-2">
                    {editedLead.convertedToClientId ? (
                        <span className="flex items-center gap-2 text-green-600 font-semibold">
                            <CheckIcon className="w-5 h-5" /> Convertido em Cliente
                        </span>
                    ) : (
                        <button onClick={handleConvert} className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700 flex items-center gap-2">
                            <ClientsIcon className="w-5 h-5" /> Converter em Cliente
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700"
                    >
                        Apagar Lead
                    </button>
                </div>
                <div>
                    <button onClick={onClose} className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300 mr-2">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black">Salvar Alterações</button>
                </div>
            </div>
        </Modal>
    );
};


const NewLeadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (lead: Omit<Lead, 'id' | 'notes' | 'tasks' | 'files'>) => void;
    employees: Employee[];
}> = ({ isOpen, onClose, onSave, employees }) => {
    const initialLeadState: Omit<Lead, 'id' | 'notes' | 'tasks' | 'files' | 'convertedToClientId'> = {
        name: '',
        company: '',
        email: '',
        phone: '',
        source: '',
        priority: LeadPriority.Medium,
        status: LeadStatus.New,
        ownerId: employees[0]?.id || 0,
        projectType: ProjectType.Wedding,
        value: 0,
    };
    const [newLead, setNewLead] = useState(initialLeadState);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewLead(prev => ({ ...prev, [name]: name === 'value' || name === 'ownerId' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(newLead);
        setNewLead(initialLeadState);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Criar Novo Lead">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name" value={newLead.name} onChange={handleInputChange} placeholder="Nome do Lead" className="p-2 border rounded w-full" required />
                    <input name="company" value={newLead.company} onChange={handleInputChange} placeholder="Empresa" className="p-2 border rounded w-full" />
                    <input name="email" type="email" value={newLead.email} onChange={handleInputChange} placeholder="Email" className="p-2 border rounded w-full" />
                    <input name="phone" value={newLead.phone} onChange={handleInputChange} placeholder="Telefone" className="p-2 border rounded w-full" />
                    <input name="value" type="number" value={newLead.value} onChange={handleInputChange} placeholder="Valor Estimado (Kz)" className="p-2 border rounded w-full" />
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
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black">Criar Lead</button>
                </div>
            </form>
        </Modal>
    );
};

interface PipelineProps {
    leads: Lead[];
    employees: Employee[];
    activities: Activity[];
    onUpdateLead: (updatedLead: Lead) => void;
    onAddLead: (lead: Omit<Lead, 'id' | 'notes' | 'tasks' | 'files'>) => void;
    onAddLeadNote: (leadId: number, noteText: string) => void;
    onAddLeadTask: (leadId: number, taskData: Omit<Task, 'id' | 'completed'>) => void;
    onToggleLeadTask: (leadId: number, taskId: number) => void;
    onAddLeadFile: (leadId: number, fileData: Omit<FileAttachment, 'id'>) => void;
    onConvertLeadToClient: (leadId: number) => void;
    onDeleteLead: (leadId: number) => void;
}

/**
 * Pipeline page component.
 * Displays a Kanban-style board for managing the sales pipeline.
 */
export const Pipeline: React.FC<PipelineProps> = ({ leads, employees, activities, onUpdateLead, onAddLead, onAddLeadNote, onAddLeadTask, onToggleLeadTask, onAddLeadFile, onConvertLeadToClient, onDeleteLead }) => {
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

    const leadsByStatus = useMemo(() => {
        const grouped: { [key in LeadStatus]: Lead[] } = {} as any;
        statusColumns.forEach(status => grouped[status] = []);
        leads.forEach(lead => {
            if (grouped[lead.status]) {
                grouped[lead.status].push(lead);
            }
        });
        return grouped;
    }, [leads]);

    const handleLeadClick = (lead: Lead) => {
        setSelectedLead(lead);
    };

    const getColumnValue = (status: LeadStatus) => {
        return leadsByStatus[status].reduce((sum, lead) => sum + lead.value, 0);
    }

    const kpiData = useMemo(() => {
        const activeLeads = leads.filter(l => l.status !== LeadStatus.Closed);
        const totalPipelineValue = activeLeads.reduce((sum, l) => sum + l.value, 0);
        const avgLeadValue = activeLeads.length > 0 ? totalPipelineValue / activeLeads.length : 0;
        const conversionRate = leads.length > 0 ? (leads.filter(l => l.status === LeadStatus.Closed).length / leads.length) * 100 : 0;
        return { totalPipelineValue, avgLeadValue, conversionRate: conversionRate.toFixed(1) + '%' };
    }, [leads]);

    return (
        <>
            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card><div className="flex items-center gap-4"><FinancialIcon className="w-8 h-8 text-blue-500" /><p className="text-sm font-medium text-brand-secondary">Valor Total em Pipeline<br /><span className="text-3xl font-bold text-brand-dark">Kz {(kpiData.totalPipelineValue / 1000).toFixed(1)}k</span></p></div></Card>
                    <Card><div className="flex items-center gap-4"><TargetIcon className="w-8 h-8 text-green-500" /><p className="text-sm font-medium text-brand-secondary">Taxa de Conversão<br /><span className="text-3xl font-bold text-brand-dark">{kpiData.conversionRate}</span></p></div></Card>
                    <Card><div className="flex items-center gap-4"><PipelineIcon className="w-8 h-8 text-yellow-500" /><p className="text-sm font-medium text-brand-secondary">Valor Médio por Lead<br /><span className="text-3xl font-bold text-brand-dark">Kz {(kpiData.avgLeadValue / 1000).toFixed(1)}k</span></p></div></Card>
                    <button onClick={() => setIsNewLeadModalOpen(true)} className="flex items-center justify-center gap-2 bg-brand-gold text-brand-dark font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
                        <PlusIcon className="w-6 h-6" /> Criar Novo Lead
                    </button>
                </div>

                <div className="flex space-x-4 overflow-x-auto pb-4">
                    {statusColumns.map(status => (
                        <div key={status} className="flex-shrink-0 w-80 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <div className="p-4 border-b dark:border-gray-700 sticky top-0 bg-gray-100 dark:bg-gray-800 rounded-t-lg">
                                <h3 className="font-semibold text-brand-dark dark:text-gray-100">{status} ({leadsByStatus[status].length})</h3>
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Kz {getColumnValue(status).toLocaleString('pt-BR')}</p>
                            </div>
                            <div className="p-4 space-y-4 h-full overflow-y-auto">
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
                onUpdate={onUpdateLead}
                onAddNote={onAddLeadNote}
                onAddTask={onAddLeadTask}
                onToggleTask={onToggleLeadTask}
                onAddFile={onAddLeadFile}
                onConvertLead={onConvertLeadToClient}
                onDeleteLead={onDeleteLead}
            />

            <NewLeadModal
                isOpen={isNewLeadModalOpen}
                onClose={() => setIsNewLeadModalOpen(false)}
                onSave={onAddLead}
                employees={employees}
            />
        </>
    );
};
