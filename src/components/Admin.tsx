import React, { useState, useEffect } from 'react';
import { Employee, Role, Team } from '../types';
import { Card } from './common/Card';
import { Modal } from './common/Modal';
import { PlusIcon } from './common/Icon';
import { EmployeeModal } from './modals/EmployeeModal';

interface AdminProps {
    employees: Employee[];
    teams: Team[];
    onAddEmployee: (employee: Omit<Employee, 'id' | 'avatarUrl' | 'notificationPreferences'>, password?: string, avatarFile?: File) => void;
    onRemoveEmployee: (employeeId: number) => void;
    onUpdateEmployee: (employee: Employee, avatarFile?: File) => void;
    onAddTeam: (team: Omit<Team, 'id'>) => void;
    onUpdateTeam: (team: Team) => void;
    onRemoveTeam: (teamId: number) => void;
    onResetPassword?: (email: string) => void;
}



const TeamModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (team: Omit<Team, 'id'> | Team) => void, employees: Employee[], teamToEdit?: Team | null }> = ({ isOpen, onClose, onSave, employees, teamToEdit }) => {
    const [team, setTeam] = useState({ name: '', memberIds: [] as number[] });

    useEffect(() => {
        if (teamToEdit) {
            setTeam({ name: teamToEdit.name, memberIds: teamToEdit.memberIds });
        } else {
            setTeam({ name: '', memberIds: [] });
        }
    }, [teamToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (teamToEdit) {
            onSave({ ...teamToEdit, ...team });
        } else {
            onSave(team);
        }
        onClose();
    }
    const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => Number(option.value));
        setTeam(prev => ({ ...prev, memberIds: selectedIds }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={teamToEdit ? "Editar Equipe" : "Nova Equipe"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="name" placeholder="Nome da Equipe" value={team.name} onChange={(e) => setTeam(prev => ({ ...prev, name: e.target.value }))} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Membros</label>
                <select multiple value={team.memberIds.map(String)} onChange={handleMemberChange} className="p-2 border rounded w-full h-40 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black dark:bg-brand-gold dark:text-brand-dark">Salvar</button>
                </div>
            </form>
        </Modal>
    );
}


/**
 * Admin page component.
 * Provides an interface for admins to manage employees (add, remove) and teams.
 */
export const Admin: React.FC<AdminProps> = ({ employees, teams, onAddEmployee, onRemoveEmployee, onUpdateEmployee, onAddTeam, onUpdateTeam, onRemoveTeam, onResetPassword }) => {
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
    const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
    const [activeTab, setActiveTab] = useState<'employees' | 'teams'>('employees');

    const handleOpenEmployeeModal = (employee: Employee | null = null) => {
        setEmployeeToEdit(employee);
        setIsEmployeeModalOpen(true);
    };

    const handleOpenTeamModal = (team: Team | null = null) => {
        setTeamToEdit(team);
        setIsTeamModalOpen(true);
    };

    const handleSaveEmployee = (employeeData: Omit<Employee, 'id' | 'avatarUrl' | 'notificationPreferences'> | Employee, password?: string, avatarFile?: File) => {
        if ('id' in employeeData) {
            onUpdateEmployee(employeeData, avatarFile);
        } else {
            onAddEmployee(employeeData, password, avatarFile);
        }
    };

    const handleSaveTeam = (teamData: Omit<Team, 'id'> | Team) => {
        if ('id' in teamData) {
            onUpdateTeam(teamData);
        } else {
            onAddTeam(teamData);
        }
    };

    return (
        <>
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="border-b">
                        <button onClick={() => setActiveTab('employees')} className={`px-4 py-2 text-lg font-semibold ${activeTab === 'employees' ? 'border-b-2 border-brand-gold text-brand-dark' : 'text-gray-500'}`}>
                            Funcionários
                        </button>
                        <button onClick={() => setActiveTab('teams')} className={`px-4 py-2 text-lg font-semibold ${activeTab === 'teams' ? 'border-b-2 border-brand-gold text-brand-dark' : 'text-gray-500'}`}>
                            Equipes
                        </button>
                    </div>
                    <button
                        onClick={() => activeTab === 'employees' ? handleOpenEmployeeModal() : handleOpenTeamModal()}
                        className="flex items-center gap-2 bg-brand-gold text-brand-dark font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-yellow-500 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        {activeTab === 'employees' ? 'Adicionar Funcionário' : 'Nova Equipe'}
                    </button>
                </div>

                {activeTab === 'employees' ? (
                    <Card>
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total de funcionários: {employees.length}</p>
                        </div>
                        {employees.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                Nenhum funcionário encontrado.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cargo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acesso</th>
                                            <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {employees.map((employee) => (
                                            <tr key={employee.id} className={!employee.active ? 'opacity-60 bg-gray-50 dark:bg-gray-800' : ''}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <img className="h-10 w-10 rounded-full object-cover" src={employee.avatarUrl} alt={employee.name} />
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{employee.name}</div>
                                                            {!employee.active && <span className="text-xs text-red-500">Inativo</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{employee.position}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {employee.active ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Ativo</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inativo</span>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {employee.isAdmin ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Admin</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Usuário</span>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                                    <button onClick={() => handleOpenEmployeeModal(employee)} className="text-brand-gold hover:text-yellow-600">Editar</button>
                                                    {employee.active ? (
                                                        <button
                                                            onClick={() => onRemoveEmployee(employee.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        // Prevent deleting self (assuming we can identify self, but Admin component doesn't have currentUser prop yet.
                                                        // We should probably pass currentUser to Admin or handle it in onRemoveEmployee)
                                                        >
                                                            Remover
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => onUpdateEmployee({ ...employee, active: true })}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Reativar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.map(team => (
                            <Card key={team.id} title={team.name}>
                                <div className="space-y-2 mb-4">
                                    {team.memberIds.map(id => {
                                        const member = employees.find(e => e.id === id);
                                        return member ? <div key={id} className="flex items-center gap-2"><img src={member.avatarUrl} className="w-6 h-6 rounded-full" /><span>{member.name}</span></div> : null
                                    })}
                                </div>
                                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button onClick={() => handleOpenTeamModal(team)} className="text-sm text-brand-gold hover:text-yellow-600">Editar</button>
                                    <button onClick={() => onRemoveTeam(team.id)} className="text-sm text-red-600 hover:text-red-900">Remover</button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            <EmployeeModal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} onSave={handleSaveEmployee} employeeToEdit={employeeToEdit} onResetPassword={onResetPassword} />
            <TeamModal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} onSave={handleSaveTeam} employees={employees} teamToEdit={teamToEdit} />
        </>
    );
};