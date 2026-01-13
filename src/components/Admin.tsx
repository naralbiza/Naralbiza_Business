import React, { useState, useEffect } from 'react';
import { User, Role, Team, ModulePermission } from '../types';
import { getRoles } from '../services/api';
import { Card } from './common/Card';
import { Modal } from './common/Modal';
import { PlusIcon } from './common/Icon';
import { EmployeeModal } from './modals/EmployeeModal';
import { PermissionsManager } from './admin/PermissionsManager';

interface AdminProps {
    employees: User[];
    teams: Team[];
    onAddEmployee: (employee: Omit<User, 'id' | 'avatarUrl' | 'permissions'> & { permissions?: ModulePermission[] }, password?: string, avatarFile?: File) => Promise<void>;
    onRemoveEmployee: (employeeId: string) => Promise<void>;
    onUpdateEmployee: (user: User, avatarFile?: File) => Promise<void>;
    onAddTeam: (team: Omit<Team, 'id'>) => Promise<void>;
    onUpdateTeam: (team: Team) => Promise<void>;
    onRemoveTeam: (teamId: string) => Promise<void>;
    onResetPassword?: (email: string) => Promise<void>;
}



const TeamModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (team: Omit<Team, 'id'> | Team) => Promise<void>, employees: User[], teamToEdit?: Team | null }> = ({ isOpen, onClose, onSave, employees, teamToEdit }) => {
    const [team, setTeam] = useState({ name: '', memberIds: [] as string[] });
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (teamToEdit) {
            setTeam({ name: teamToEdit.name, memberIds: teamToEdit.memberIds });
        } else {
            setTeam({ name: '', memberIds: [] });
        }
        setErrorMessage(null);
    }, [teamToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setErrorMessage(null);
        try {
            if (teamToEdit) {
                await onSave({ ...teamToEdit, ...team });
            } else {
                await onSave(team);
            }
            onClose();
        } catch (error: any) {
            setErrorMessage("Erro ao salvar equipe: " + (error.message || "Erro desconhecido"));
        } finally {
            setIsSaving(false);
        }
    }
    const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
        setTeam(prev => ({ ...prev, memberIds: selectedIds }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={teamToEdit ? "Editar Equipe" : "Nova Equipe"}>
            {errorMessage && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{errorMessage}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="name" placeholder="Nome da Equipe" value={team.name} onChange={(e) => setTeam(prev => ({ ...prev, name: e.target.value }))} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required disabled={isSaving} />
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Membros</label>
                <select multiple value={team.memberIds.map(String)} onChange={handleMemberChange} className="p-2 border rounded w-full h-40 dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={isSaving}>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300" disabled={isSaving}>Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black dark:bg-brand-gold dark:text-brand-dark disabled:opacity-50" disabled={isSaving}>
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
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
    const [employeeToEdit, setEmployeeToEdit] = useState<User | null>(null);
    const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
    const [activeTab, setActiveTab] = useState<'employees' | 'teams' | 'permissions'>('employees');
    const [roles, setRoles] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const data = await getRoles();
                setRoles(data);
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };
        fetchRoles();
    }, []);

    const handleOpenEmployeeModal = (employee: User | null = null) => {
        setEmployeeToEdit(employee);
        setIsEmployeeModalOpen(true);
    };

    const handleOpenTeamModal = (team: Team | null = null) => {
        setTeamToEdit(team);
        setIsTeamModalOpen(true);
    };

    const handleSaveEmployee = async (employeeData: Omit<User, 'id' | 'avatarUrl' | 'permissions'> | User, password?: string, avatarFile?: File) => {
        if ('id' in employeeData) {
            await onUpdateEmployee(employeeData, avatarFile);
        } else {
            await onAddEmployee(employeeData, password, avatarFile);
        }
    };

    const handleSaveTeam = async (teamData: Omit<Team, 'id'> | Team) => {
        if ('id' in teamData) {
            await onUpdateTeam(teamData);
        } else {
            await onAddTeam(teamData);
        }
    };

    // Wrapper for delete to confirm (though UI already might have confirmation, best to keep generic here or move confirmation down)
    // Actually Admin UI has inline buttons, let's add confirmation here or assume passed function handles it. 
    // Usually it's better to confirm before calling async delete.
    const handleDeleteEmployee = async (id: string) => {
        if (window.confirm("Tem certeza que deseja remover este funcionário?")) {
            await onRemoveEmployee(id);
        }
    }

    const handleDeleteTeam = async (id: string) => {
        if (window.confirm("Tem certeza que deseja remover esta equipe?")) {
            await onRemoveTeam(id);
        }
    }


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
                        <button onClick={() => setActiveTab('permissions')} className={`px-4 py-2 text-lg font-semibold ${activeTab === 'permissions' ? 'border-b-2 border-brand-gold text-brand-dark' : 'text-gray-500'}`}>
                            Permissões
                        </button>
                    </div>
                    {activeTab !== 'permissions' && (
                        <button
                            onClick={() => activeTab === 'employees' ? handleOpenEmployeeModal() : handleOpenTeamModal()}
                            className="flex items-center gap-2 bg-brand-gold text-brand-dark font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-yellow-500 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            {activeTab === 'employees' ? 'Adicionar Funcionário' : 'Nova Equipe'}
                        </button>
                    )}
                </div>

                {activeTab === 'employees' && (
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sector</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-bold text-brand-dark">{employee.role}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{employee.sector}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {employee.active ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Ativo</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inativo</span>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                                    <button onClick={() => handleOpenEmployeeModal(employee)} className="text-brand-gold hover:text-yellow-600">Editar</button>
                                                    {employee.active ? (
                                                        <button
                                                            onClick={() => handleDeleteEmployee(employee.id)}
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
                )}

                {activeTab === 'teams' && (
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
                                    <button onClick={() => handleDeleteTeam(team.id)} className="text-sm text-red-600 hover:text-red-900">Remover</button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'permissions' && (
                    <PermissionsManager />
                )}
            </div>
            <EmployeeModal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} onSave={handleSaveEmployee} employeeToEdit={employeeToEdit} onResetPassword={onResetPassword} roles={roles} />
            <TeamModal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} onSave={handleSaveTeam} employees={employees} teamToEdit={teamToEdit} />
        </>
    );
};