
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { ProductionProject, ProductionStatus, Employee, Client } from '../types';
import { Card } from './common/Card';
import { Modal } from './common/Modal';
import {
    PlusIcon,
    ProductionIcon,
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    AlertCircleIcon,
    UsersIcon,
    FinancialIcon
} from './common/Icon';
import { formatCurrency } from '../utils';
import { ProjectType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const statusColumns: ProductionStatus[] = [
    ProductionStatus.PreProduction,
    ProductionStatus.Production,
    ProductionStatus.PostProduction,
    ProductionStatus.Delivery,
    ProductionStatus.Completed
];

const statusColors: { [key in ProductionStatus]: string } = {
    [ProductionStatus.PreProduction]: 'bg-blue-500',
    [ProductionStatus.Production]: 'bg-yellow-500',
    [ProductionStatus.PostProduction]: 'bg-purple-500',
    [ProductionStatus.Delivery]: 'bg-indigo-500',
    [ProductionStatus.Completed]: 'bg-green-500',
};

const ProjectCard: React.FC<{
    project: ProductionProject;
    responsible?: Employee;
    client?: Client;
    onClick: () => void
}> = ({ project, responsible, client, onClick }) => {
    const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== ProductionStatus.Completed;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -4 }}
            onClick={onClick}
            className="bg-white p-5 rounded-2xl shadow-sm border-2 border-black/5 cursor-pointer hover:shadow-lg hover:shadow-black/5 hover:border-brand-gold transition-all duration-300 group relative overflow-hidden"
        >
            <div className={`absolute top-0 left-0 w-1 h-full ${statusColors[project.status]} opacity-80`} />

            <div className="flex justify-between items-start mb-3 pl-2">
                <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">{project.type}</span>
                {isOverdue && <AlertCircleIcon className="w-4 h-4 text-red-500 animate-pulse" />}
            </div>

            <h4 className="font-black text-black mb-1 group-hover:text-brand-gold transition-colors text-lg tracking-tight pl-2">{project.title}</h4>
            <p className="text-xs text-black/40 mb-5 font-bold pl-2 tracking-wide">{client?.name || 'Cliente não definido'}</p>

            <div className="flex items-center gap-3 mb-5 pl-2">
                <div className="flex-grow bg-black/5 h-1.5 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${statusColors[project.status]} transition-all duration-500`}
                        style={{ width: `${project.progress}%` }}
                    ></div>
                </div>
                <span className="text-[10px] font-black text-black">{project.progress}%</span>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-black/5 pl-2">
                <div className="flex -space-x-2">
                    {responsible && (
                        <div className="w-8 h-8 rounded-full border-2 border-white shadow-md overflow-hidden bg-brand-gold flex items-center justify-center text-xs font-black text-black">
                            {responsible.avatarUrl ? (
                                <img
                                    src={responsible.avatarUrl}
                                    alt={responsible.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                responsible.name.charAt(0)
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-black/40 font-black uppercase tracking-wider">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {project.deadline ? new Date(project.deadline).toLocaleDateString('pt-BR') : 'Sem data'}
                </div>
            </div>
        </motion.div>
    );
};

export const Production: React.FC = () => {
    const {
        productionProjects,
        employees,
        clients,
        addProductionProject,
        updateProductionProjectData,
        removeProductionProject
    } = useData();

    const [selectedProject, setSelectedProject] = useState<ProductionProject | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const projectsByStatus = useMemo(() => {
        const grouped: { [key in ProductionStatus]: ProductionProject[] } = {} as any;
        statusColumns.forEach(status => grouped[status] = []);
        productionProjects.forEach(proj => {
            if (grouped[proj.status]) grouped[proj.status].push(proj);
        });
        return grouped;
    }, [productionProjects]);

    const stats = useMemo(() => {
        const total = productionProjects.length;
        const inProduction = productionProjects.filter(p => p.status === ProductionStatus.Production).length;
        const delayed = productionProjects.filter(p => p.deadline && new Date(p.deadline) < new Date() && p.status !== ProductionStatus.Completed).length;
        const totalBudget = productionProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);

        return { total, inProduction, delayed, totalBudget };
    }, [productionProjects]);

    return (
        <div className="p-8 bg-white min-h-screen">
            {/* Header section with KPIs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-black flex items-center gap-3 tracking-tighter">
                        <div className="p-3 bg-black text-brand-gold rounded-xl">
                            <ProductionIcon className="w-8 h-8" />
                        </div>
                        Gestão de Produção
                    </h1>
                    <p className="text-black/40 mt-1 font-bold tracking-wide uppercase text-xs ml-[60px]">Acompanhamento de fluxo criativo e entregas.</p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-black hover:bg-gold-metallic text-white hover:text-black hover:shadow-brand-gold/20 px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                    <PlusIcon className="w-4 h-4" />
                    Novo Projeto
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border-2 border-black/5 shadow-xl shadow-black/[0.02] hover:border-brand-gold/50 transition-all duration-300">
                    <div className="flex items-center gap-5">
                        <div className="bg-black/5 p-4 rounded-xl text-black"><ProductionIcon className="w-6 h-6" /></div>
                        <div>
                            <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Total Ativos</p>
                            <p className="text-3xl font-black text-black tracking-tighter">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border-2 border-black/5 shadow-xl shadow-black/[0.02] hover:border-brand-gold/50 transition-all duration-300">
                    <div className="flex items-center gap-5">
                        <div className="bg-brand-gold/10 p-4 rounded-xl text-brand-gold"><ClockIcon className="w-6 h-6" /></div>
                        <div>
                            <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Em Produção</p>
                            <p className="text-3xl font-black text-black tracking-tighter">{stats.inProduction}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border-2 border-black/5 shadow-xl shadow-black/[0.02] hover:border-brand-gold/50 transition-all duration-300">
                    <div className="flex items-center gap-5">
                        <div className="bg-red-50 p-4 rounded-xl text-red-500"><AlertCircleIcon className="w-6 h-6" /></div>
                        <div>
                            <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Atrasados</p>
                            <p className="text-3xl font-black text-black tracking-tighter">{stats.delayed}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border-2 border-black/5 shadow-xl shadow-black/[0.02] hover:border-brand-gold/50 transition-all duration-300">
                    <div className="flex items-center gap-5">
                        <div className="bg-green-50 p-4 rounded-xl text-green-600"><FinancialIcon className="w-6 h-6" /></div>
                        <div>
                            <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Capex Total</p>
                            <p className="text-3xl font-black text-black tracking-tighter">{formatCurrency(stats.totalBudget)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
                {statusColumns.map(status => (
                    <div key={status} className="flex-shrink-0 w-80">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${statusColors[status]}`}></div>
                                <h3 className="font-black text-black uppercase tracking-widest text-xs">{status}</h3>
                                <span className="bg-black/5 text-black/40 text-[10px] px-2 py-0.5 rounded-md font-black">
                                    {projectsByStatus[status].length}
                                </span>
                            </div>
                        </div>

                        <div className="bg-black/[0.02] p-2 rounded-[32px] min-h-[500px] flex flex-col gap-4 border-2 border-dashed border-black/5">
                            <AnimatePresence mode='popLayout'>
                                {projectsByStatus[status].map(project => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        responsible={employees.find(e => e.id === project.responsibleId)}
                                        client={clients.find(c => c.id === project.clientId)}
                                        onClick={() => setSelectedProject(project)}
                                    />
                                ))}
                            </AnimatePresence>

                            {projectsByStatus[status].length === 0 && (
                                <div className="flex-grow flex items-center justify-center">
                                    <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em]">Vazio</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Project Details Modal */}
            {selectedProject && (
                <ProjectDetailModal
                    isOpen={!!selectedProject}
                    onClose={() => setSelectedProject(null)}
                    project={selectedProject}
                    employees={employees}
                    clients={clients}
                    onUpdate={updateProductionProjectData}
                    onDelete={removeProductionProject}
                />
            )}

            {/* Add Project Modal */}
            <AddProjectModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                employees={employees}
                clients={clients}
                onAdd={addProductionProject}
            />
        </div>
    );
};

// --- Subcomponents for Modals ---

const ProjectDetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    project: ProductionProject;
    employees: Employee[];
    clients: Client[];
    onUpdate: (project: ProductionProject) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}> = ({ isOpen, onClose, project, employees, clients, onUpdate, onDelete }) => {
    const [edited, setEdited] = useState(project);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate(edited);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Projeto: ${project.title}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Título do Projeto</label>
                        <input
                            value={edited.title}
                            onChange={e => setEdited({ ...edited, title: e.target.value })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Cliente</label>
                        <select
                            value={edited.clientId}
                            onChange={e => setEdited({ ...edited, clientId: e.target.value })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                        >
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Progresso (%)</label>
                            <input
                                type="number"
                                value={edited.progress}
                                onChange={e => setEdited({ ...edited, progress: Number(e.target.value) })}
                                className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Status</label>
                            <select
                                value={edited.status}
                                onChange={e => setEdited({ ...edited, status: e.target.value as ProductionStatus })}
                                className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                            >
                                {statusColumns.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Responsável</label>
                        <select
                            value={edited.responsibleId}
                            onChange={e => setEdited({ ...edited, responsibleId: e.target.value })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                        >
                            <option value="">Selecione um responsável</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Deadline</label>
                        <input
                            type="date"
                            value={edited.deadline ? new Date(edited.deadline).toISOString().split('T')[0] : ''}
                            onChange={e => setEdited({ ...edited, deadline: e.target.value })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Budget ({formatCurrency(0).split(' ')[1]})</label>
                            <input
                                type="number"
                                value={edited.budget || 0}
                                onChange={e => setEdited({ ...edited, budget: Number(e.target.value) })}
                                className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Custo Real ({formatCurrency(0).split(' ')[1]})</label>
                            <input
                                type="number"
                                value={edited.actualCost || 0}
                                onChange={e => setEdited({ ...edited, actualCost: Number(e.target.value) })}
                                className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Horas Estimadas/Gastas</label>
                        <input
                            type="number"
                            value={edited.notes?.match(/HOURS:\s*(\d+)/)?.[1] || 0}
                            onChange={e => {
                                const hours = e.target.value;
                                let newNotes = edited.notes || '';
                                if (newNotes.includes('HOURS:')) {
                                    newNotes = newNotes.replace(/HOURS:\s*\d+/, `HOURS: ${hours}`);
                                } else {
                                    newNotes = newNotes ? `${newNotes}\nHOURS: ${hours}` : `HOURS: ${hours}`;
                                }
                                setEdited({ ...edited, notes: newNotes });
                            }}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                            placeholder="Ex: 40"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Notas de Produção</label>
                        <textarea
                            value={edited.notes?.replace(/HOURS:\s*\d+\n?/, '') || ''}
                            onChange={e => {
                                const hoursMatch = edited.notes?.match(/HOURS:\s*\d+/);
                                const hoursStr = hoursMatch ? hoursMatch[0] : '';
                                setEdited({ ...edited, notes: hoursStr ? `${hoursStr}\n${e.target.value}` : e.target.value });
                            }}
                            rows={3}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-black/5 flex justify-between gap-4">
                <button
                    onClick={() => onDelete(project.id)}
                    className="text-red-500 font-bold hover:underline text-xs uppercase tracking-widest px-4"
                >
                    Excluir Projeto
                </button>
                <div className="flex gap-4">
                    <button onClick={onClose} className="px-6 py-4 rounded-xl font-black uppercase text-black/40 hover:text-black hover:bg-black/5 transition-all text-xs tracking-widest">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-black hover:bg-gold-metallic hover:text-black text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all duration-300 shadow-lg hover:shadow-brand-gold/20 disabled:opacity-50"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const AddProjectModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    employees: Employee[];
    clients: Client[];
    onAdd: (project: Omit<ProductionProject, 'id'>) => Promise<void>;
}> = ({ isOpen, onClose, employees, clients, onAdd }) => {
    const initialState: Omit<ProductionProject, 'id'> = {
        title: '',
        clientId: clients[0]?.id || '',
        type: ProjectType.Portrait,
        status: ProductionStatus.PreProduction,
        progress: 0,
        budget: 0,
        actualCost: 0,
        deadline: new Date().toISOString(),
        responsibleId: employees[0]?.id || '',
        teamIds: [],
        notes: '',
        startDate: new Date().toISOString().split('T')[0],
        folderUrl: ''
    };

    const [newProj, setNewProj] = useState(initialState);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onAdd(newProj);
            setNewProj(initialState);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Novo Projeto de Produção">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Título</label>
                        <input
                            required
                            value={newProj.title}
                            onChange={e => setNewProj({ ...newProj, title: e.target.value })}
                            placeholder="Ex: Coleção Verão 2024 - Cliente X"
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300 placeholder:text-black/20"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Cliente</label>
                        <select
                            value={newProj.clientId}
                            onChange={e => setNewProj({ ...newProj, clientId: e.target.value })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                        >
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Tipo</label>
                        <select
                            value={newProj.type}
                            onChange={e => setNewProj({ ...newProj, type: e.target.value as ProjectType })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                        >
                            {Object.values(ProjectType).map(pt => (
                                <option key={pt} value={pt}>{pt}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Responsável</label>
                        <select
                            value={newProj.responsibleId}
                            onChange={e => setNewProj({ ...newProj, responsibleId: e.target.value })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                        >
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Prazo de Entrega</label>
                        <input
                            type="date"
                            required
                            value={newProj.deadline?.split('T')[0]}
                            onChange={e => setNewProj({ ...newProj, deadline: e.target.value })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Budget Inicial ({formatCurrency(0).split(' ')[1]})</label>
                        <input
                            type="number"
                            value={newProj.budget}
                            onChange={e => setNewProj({ ...newProj, budget: Number(e.target.value) })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Horas Previstas</label>
                        <input
                            type="number"
                            onChange={e => {
                                const hours = e.target.value;
                                setNewProj({ ...newProj, notes: `HOURS: ${hours}` });
                            }}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                            placeholder="Ex: 40"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-black/5">
                    <button type="button" onClick={onClose} className="px-6 py-4 rounded-xl font-black uppercase text-black/40 hover:text-black hover:bg-black/5 transition-all text-xs tracking-widest">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-black hover:bg-gold-metallic hover:text-black text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all duration-300 shadow-lg hover:shadow-brand-gold/20 disabled:opacity-50"
                    >
                        {isSaving ? 'Criando...' : 'Criar Projeto'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
