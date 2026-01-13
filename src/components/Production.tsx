
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
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all group"
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-brand-secondary dark:text-gray-400 uppercase tracking-wider">{project.type}</span>
                {isOverdue && <AlertCircleIcon className="w-4 h-4 text-red-500 animate-pulse" />}
            </div>

            <h4 className="font-bold text-brand-dark dark:text-gray-100 mb-1 group-hover:text-brand-gold transition-colors">{project.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">{client?.name || 'Cliente não definido'}</p>

            <div className="flex items-center gap-2 mb-4">
                <div className="flex-grow bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${statusColors[project.status]} transition-all duration-500`}
                        style={{ width: `${project.progress}%` }}
                    ></div>
                </div>
                <span className="text-xs font-bold text-gray-500">{project.progress}%</span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex -space-x-2">
                    {responsible && (
                        <img
                            src={responsible.avatarUrl}
                            alt={responsible.name}
                            className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                            title={`Responsável: ${responsible.name}`}
                        />
                    )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
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
        <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header section with KPIs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white flex items-center gap-3">
                        <ProductionIcon className="w-10 h-10 text-brand-gold" />
                        Gestão de Produção
                    </h1>
                    <p className="text-brand-secondary dark:text-gray-400 mt-1">Acompanhamento de fluxo criativo e entregas.</p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-brand-dark text-white hover:bg-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                    <PlusIcon className="w-5 h-5 text-brand-gold" />
                    Novo Projeto de Produção
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <Card className="border-l-4 border-blue-500">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg"><ProductionIcon className="w-6 h-6 text-blue-600" /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Total Ativos</p>
                            <p className="text-2xl font-black text-brand-dark dark:text-white">{stats.total}</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-l-4 border-yellow-500">
                    <div className="flex items-center gap-4">
                        <div className="bg-yellow-100 p-3 rounded-lg"><ClockIcon className="w-6 h-6 text-yellow-600" /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Em Produção</p>
                            <p className="text-2xl font-black text-brand-dark dark:text-white">{stats.inProduction}</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-l-4 border-red-500">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-100 p-3 rounded-lg"><AlertCircleIcon className="w-6 h-6 text-red-600" /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Atrasados</p>
                            <p className="text-2xl font-black text-red-600 dark:text-red-400">{stats.delayed}</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-l-4 border-green-500">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-lg"><FinancialIcon className="w-6 h-6 text-green-600" /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Capex Total</p>
                            <p className="text-2xl font-black text-brand-dark dark:text-white">{formatCurrency(stats.totalBudget)}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Kanban Board */}
            <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
                {statusColumns.map(status => (
                    <div key={status} className="flex-shrink-0 w-80">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${statusColors[status]}`}></div>
                                <h3 className="font-bold text-brand-dark dark:text-gray-200 uppercase tracking-tighter text-sm">{status}</h3>
                                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full font-bold">
                                    {projectsByStatus[status].length}
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-200/50 dark:bg-gray-800/40 p-2 rounded-2xl min-h-[500px] flex flex-col gap-4">
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
                                <div className="flex-grow flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                                    <p className="text-sm text-gray-400 italic">Vazio</p>
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
                        <label className="text-xs font-bold text-gray-500 uppercase">Título do Projeto</label>
                        <input
                            value={edited.title}
                            onChange={e => setEdited({ ...edited, title: e.target.value })}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-xl"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Cliente</label>
                        <select
                            value={edited.clientId}
                            onChange={e => setEdited({ ...edited, clientId: e.target.value })}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-xl"
                        >
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Progresso (%)</label>
                            <input
                                type="number"
                                value={edited.progress}
                                onChange={e => setEdited({ ...edited, progress: Number(e.target.value) })}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                            <select
                                value={edited.status}
                                onChange={e => setEdited({ ...edited, status: e.target.value as ProductionStatus })}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-xl"
                            >
                                {statusColumns.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Responsável</label>
                        <select
                            value={edited.responsibleId}
                            onChange={e => setEdited({ ...edited, responsibleId: e.target.value })}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-xl"
                        >
                            <option value="">Selecione um responsável</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Deadline</label>
                        <input
                            type="date"
                            value={edited.deadline ? new Date(edited.deadline).toISOString().split('T')[0] : ''}
                            onChange={e => setEdited({ ...edited, deadline: e.target.value })}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-xl"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Budget ({formatCurrency(0).split(' ')[1]})</label>
                            <input
                                type="number"
                                value={edited.budget || 0}
                                onChange={e => setEdited({ ...edited, budget: Number(e.target.value) })}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Custo Real ({formatCurrency(0).split(' ')[1]})</label>
                            <input
                                type="number"
                                value={edited.actualCost || 0}
                                onChange={e => setEdited({ ...edited, actualCost: Number(e.target.value) })}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-xl"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Horas Estimadas/Gastas</label>
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
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-xl"
                            placeholder="Ex: 40"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Notas de Produção</label>
                        <textarea
                            value={edited.notes?.replace(/HOURS:\s*\d+\n?/, '') || ''}
                            onChange={e => {
                                const hoursMatch = edited.notes?.match(/HOURS:\s*\d+/);
                                const hoursStr = hoursMatch ? hoursMatch[0] : '';
                                setEdited({ ...edited, notes: hoursStr ? `${hoursStr}\n${e.target.value}` : e.target.value });
                            }}
                            rows={3}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-xl"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t flex justify-between gap-4">
                <button
                    onClick={() => onDelete(project.id)}
                    className="text-red-500 font-bold hover:underline"
                >
                    Excluir Projeto
                </button>
                <div className="flex gap-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl bg-gray-200 font-bold">Cancelar</button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 rounded-xl bg-brand-dark text-white font-bold disabled:opacity-50"
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
                        <label className="text-xs font-bold text-gray-500 uppercase">Título</label>
                        <input
                            required
                            value={newProj.title}
                            onChange={e => setNewProj({ ...newProj, title: e.target.value })}
                            placeholder="Ex: Coleção Verão 2024 - Cliente X"
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Cliente</label>
                        <select
                            value={newProj.clientId}
                            onChange={e => setNewProj({ ...newProj, clientId: e.target.value })}
                            className="w-full p-2 border rounded"
                        >
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
                        <select
                            value={newProj.type}
                            onChange={e => setNewProj({ ...newProj, type: e.target.value as ProjectType })}
                            className="w-full p-2 border rounded"
                        >
                            {Object.values(ProjectType).map(pt => (
                                <option key={pt} value={pt}>{pt}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Responsável</label>
                        <select
                            value={newProj.responsibleId}
                            onChange={e => setNewProj({ ...newProj, responsibleId: e.target.value })}
                            className="w-full p-2 border rounded"
                        >
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Prazo de Entrega</label>
                        <input
                            type="date"
                            required
                            value={newProj.deadline?.split('T')[0]}
                            onChange={e => setNewProj({ ...newProj, deadline: e.target.value })}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Budget Inicial ({formatCurrency(0).split(' ')[1]})</label>
                        <input
                            type="number"
                            value={newProj.budget}
                            onChange={e => setNewProj({ ...newProj, budget: Number(e.target.value) })}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Horas Previstas</label>
                        <input
                            type="number"
                            onChange={e => {
                                const hours = e.target.value;
                                setNewProj({ ...newProj, notes: `HOURS: ${hours}` });
                            }}
                            className="w-full p-2 border rounded"
                            placeholder="Ex: 40"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded font-bold">Cancelar</button>
                    <button type="submit" disabled={isSaving} className="px-6 py-2 bg-brand-dark text-white rounded font-bold disabled:opacity-50">
                        {isSaving ? 'Criando...' : 'Criar Projeto'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
