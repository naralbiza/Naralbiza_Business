import React, { useState } from 'react';
import { Card } from './common/Card';
import { Goal, Employee, GoalUpdate } from '../types';
import { Modal } from './common/Modal';
import { PlusIcon } from './common/Icon';
import { formatCurrency } from '../utils';

const formatValue = (value: number, unit: Goal['unit']) => {
    if (unit === 'currency') {
        return formatCurrency(value);
    }
    return value;
};

const GoalModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: Omit<Goal, 'id' | 'updates'> | Goal) => void;
    onAddUpdate: (goalId: number, update: GoalUpdate) => void;
    employees: Employee[];
    goalToEdit?: Goal | null;
}> = ({ isOpen, onClose, onSave, onAddUpdate, employees, goalToEdit }) => {
    const [goal, setGoal] = useState<Omit<Goal, 'id' | 'updates'> | Goal>(
        goalToEdit || { title: '', target: 0, current: 0, type: 'team', unit: 'count', deadline: '' }
    );
    const [newUpdate, setNewUpdate] = useState('');

    React.useEffect(() => {
        setGoal(goalToEdit || { title: '', target: 0, current: 0, type: 'team', unit: 'count', deadline: '' });
    }, [goalToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(goal);
        onClose();
    };

    const handleAddUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (goalToEdit && newUpdate.trim()) {
            onAddUpdate(goalToEdit.id, { date: new Date().toISOString(), notes: newUpdate });
            setNewUpdate('');
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['target', 'current', 'employeeId'].includes(name);
        setGoal(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={goalToEdit ? 'Editar Meta' : 'Nova Meta'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="title" value={'title' in goal ? goal.title : ''} onChange={handleChange} placeholder="Título da Meta" className="p-2 border rounded w-full" required />
                <div className="grid grid-cols-2 gap-4">
                    <input name="current" type="number" value={'current' in goal ? goal.current : ''} onChange={handleChange} placeholder="Valor Atual" className="p-2 border rounded w-full" required />
                    <input name="target" type="number" value={'target' in goal ? goal.target : ''} onChange={handleChange} placeholder="Valor Alvo" className="p-2 border rounded w-full" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <select name="type" value={'type' in goal ? goal.type : 'team'} onChange={handleChange} className="p-2 border rounded w-full">
                        <option value="team">Equipe</option>
                        <option value="individual">Individual</option>
                    </select>
                    <select name="unit" value={'unit' in goal ? goal.unit : 'count'} onChange={handleChange} className="p-2 border rounded w-full">
                        <option value="count">Contagem</option>
                        <option value="currency">Moeda (AOA)</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm">Prazo Final</label>
                    <input name="deadline" type="date" value={'deadline' in goal ? goal.deadline : ''} onChange={handleChange} className="p-2 border rounded w-full" required />
                </div>
                {goal.type === 'individual' && (
                    <select name="employeeId" value={'employeeId' in goal ? goal.employeeId || '' : ''} onChange={handleChange} className="p-2 border rounded w-full" required>
                        <option value="">Selecione um funcionário</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                )}

                {goalToEdit && (
                    <div>
                        <h4 className="font-semibold mt-4">Histórico de Progresso</h4>
                        <form onSubmit={handleAddUpdateSubmit} className="flex gap-2 mt-2">
                            <input value={newUpdate} onChange={e => setNewUpdate(e.target.value)} placeholder="Adicionar atualização..." className="flex-grow p-2 border rounded" />
                            <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black">Adicionar</button>
                        </form>
                    </div>
                )}


                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black">Salvar</button>
                </div>
            </form>
        </Modal>
    );
};


const GoalCard: React.FC<{ goal: Goal; employees: Employee[], onEdit: () => void; onDelete: () => void; }> = ({ goal, employees, onEdit, onDelete }) => {
    const progressPercentage = (goal.current / goal.target) * 100;
    const employee = goal.employeeId ? employees.find(e => e.id === goal.employeeId) : null;
    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-lg text-brand-dark dark:text-gray-100">{goal.title}</h3>
                    {employee && <p className="text-sm text-brand-secondary dark:text-gray-400">{employee.name}</p>}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${daysLeft < 0 ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'}`}>
                    {daysLeft < 0 ? `Atrasado em ${Math.abs(daysLeft)} dias` : `${daysLeft} dias restantes`}
                </span>
            </div>
            <div className="mt-4">
                <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold text-brand-dark dark:text-gray-100">{formatValue(goal.current, goal.unit)}</span>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">/ {formatValue(goal.target, goal.unit)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                    <div
                        className="bg-brand-gold h-2.5 rounded-full"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    ></div>
                </div>
            </div>
            <div className="mt-4 text-right space-x-2">
                <button onClick={onEdit} className="text-xs text-blue-600 hover:underline">Detalhes</button>
                <button onClick={onDelete} className="text-xs text-red-600 hover:underline">Remover</button>
            </div>
        </Card>
    );
}

interface GoalsProps {
    employees: Employee[];
    goals: Goal[];
    onAddGoal: (goal: Omit<Goal, 'id' | 'updates'>) => void;
    onUpdateGoal: (goal: Goal) => void;
    onDeleteGoal: (goalId: number) => void;
    onAddGoalUpdate: (goalId: number, update: GoalUpdate) => void;
}
/**
 * Goals page component.
 * Displays team and individual goals with progress bars.
 */
export const Goals: React.FC<GoalsProps> = ({ employees, goals, onAddGoal, onUpdateGoal, onDeleteGoal, onAddGoalUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

    const teamGoals = goals.filter(g => g.type === 'team');
    const individualGoals = goals.filter(g => g.type === 'individual');

    const openEditModal = (goal: Goal) => {
        setGoalToEdit(goal);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setGoalToEdit(null);
        setIsModalOpen(true);
    };

    const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'updates'> | Goal) => {
        if ('id' in goalData) {
            onUpdateGoal(goalData);
        } else {
            onAddGoal(goalData);
        }
    };

    return (
        <>
            <div className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-brand-dark dark:text-gray-100">Metas</h2>
                    <button onClick={openAddModal} className="flex items-center gap-2 bg-brand-gold text-brand-dark font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
                        <PlusIcon className="w-5 h-5" />
                        Nova Meta
                    </button>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-brand-dark dark:text-gray-200 mb-4">Metas da Equipe</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teamGoals.map(goal => <GoalCard key={goal.id} goal={goal} employees={employees} onEdit={() => openEditModal(goal)} onDelete={() => onDeleteGoal(goal.id)} />)}
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-brand-dark dark:text-gray-200 mb-4">Metas Individuais</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {individualGoals.map(goal => <GoalCard key={goal.id} goal={goal} employees={employees} onEdit={() => openEditModal(goal)} onDelete={() => onDeleteGoal(goal.id)} />)}
                    </div>
                </div>
            </div>
            <GoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveGoal} employees={employees} goalToEdit={goalToEdit} onAddUpdate={onAddGoalUpdate} />
        </>
    );
};