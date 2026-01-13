import React, { useState, useEffect } from 'react';
import { Page, Role, ModulePermission, User } from '../../types';
import { getRoles, getPermissionsByRole, updatePermission, createPermission, getUsers, getPermissionsByUser } from '../../services/api';
import { Card } from '../common/Card';

interface Props {
}

export const PermissionsManager: React.FC<Props> = () => {
    const [roles, setRoles] = useState<{ id: string, name: string }[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [viewMode, setViewMode] = useState<'roles' | 'users'>('roles');
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [permissions, setPermissions] = useState<ModulePermission[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadRoles();
        loadUsers();
    }, []);

    useEffect(() => {
        if (viewMode === 'roles' && selectedRoleId) {
            loadPermissionsByRole(selectedRoleId);
        } else if (viewMode === 'users' && selectedUserId) {
            loadPermissionsByUser(selectedUserId);
        } else {
            setPermissions([]);
        }
    }, [selectedRoleId, selectedUserId, viewMode]);

    const loadRoles = async () => {
        try {
            const data = await getRoles();
            setRoles(data);
            if (data.length > 0 && !selectedRoleId) setSelectedRoleId(data[0].id);
        } catch (error) {
            console.error("Error loading roles:", error);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data.filter(u => u.active));
        } catch (error) {
            console.error("Error loading users:", error);
        }
    };

    const loadPermissionsByRole = async (roleId: string) => {
        setLoading(true);
        try {
            const data = await getPermissionsByRole(roleId);
            setPermissions(data);
        } catch (error) {
            console.error("Error loading role permissions:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadPermissionsByUser = async (userId: string) => {
        setLoading(true);
        try {
            const data = await getPermissionsByUser(userId);
            setPermissions(data);
        } catch (error) {
            console.error("Error loading user permissions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (module: string, action: 'canView' | 'canCreate' | 'canEdit' | 'canApprove') => {
        if (viewMode === 'roles' && !selectedRoleId) return;
        if (viewMode === 'users' && !selectedUserId) return;

        setSaving(true);
        try {
            const existingPermission = permissions.find(p => p.module === module);

            if (existingPermission) {
                // Update existing
                const updatedPermission = {
                    ...existingPermission,
                    [action]: !existingPermission[action]
                };
                const saved = await updatePermission(updatedPermission);
                setPermissions(prev => prev.map(p => p.module === module ? saved : p));
            } else {
                // Create new
                const permissionToCreate = {
                    module,
                    roleId: viewMode === 'roles' ? (selectedRoleId || undefined) : undefined,
                    userId: viewMode === 'users' ? (selectedUserId || undefined) : undefined,
                    canView: false,
                    canCreate: false,
                    canEdit: false,
                    canApprove: false,
                    [action]: true
                };

                const saved = await createPermission(permissionToCreate);
                setPermissions(prev => [...prev, saved]);
            }
        } catch (error) {
            console.error("Error saving permission:", error);
            alert("Erro ao salvar permissão.");
        } finally {
            setSaving(false);
        }
    };

    const allModules = Object.values(Page);

    // Filter out modules that shouldn't be managed or are strictly public/hidden if any.
    // For now use all.

    return (
        <Card title="Gerenciador de Permissões">
            <div className="flex gap-4 mb-6 border-b pb-4">
                <button
                    onClick={() => setViewMode('roles')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'roles' ? 'bg-brand-gold text-brand-dark' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    Por Cargo
                </button>
                <button
                    onClick={() => setViewMode('users')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'users' ? 'bg-brand-gold text-brand-dark' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    Por Usuário (Overrides)
                </button>
            </div>

            <div className="mb-6">
                {viewMode === 'roles' ? (
                    <>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selecione o Cargo</label>
                        <select
                            className="p-2 border rounded w-full md:w-1/3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={selectedRoleId || ''}
                            onChange={(e) => setSelectedRoleId(e.target.value)}
                        >
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                    </>
                ) : (
                    <>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selecione o Usuário</label>
                        <select
                            className="p-2 border rounded w-full md:w-1/3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={selectedUserId || ''}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value="">Selecione um usuário...</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                            ))}
                        </select>
                        {selectedUserId && (
                            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                                💡 Permissões definidas aqui substituem as permissões padrão do cargo do usuário.
                            </p>
                        )}
                    </>
                )}
            </div>

            {loading ? (
                <div>Carregando permissões...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Módulo</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Visualizar</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Criar</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Editar</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aprovar/Deletar</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {allModules.map(module => {
                                const perm = permissions.find(p => p.module === module) || { canView: false, canCreate: false, canEdit: false, canApprove: false };
                                return (
                                    <tr key={module}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{module}</td>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={perm.canView}
                                                onChange={() => handleToggle(module, 'canView')}
                                                disabled={saving}
                                                className="h-4 w-4 text-brand-gold focus:ring-brand-gold border-gray-300 rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={perm.canCreate}
                                                onChange={() => handleToggle(module, 'canCreate')}
                                                disabled={saving}
                                                className="h-4 w-4 text-brand-gold focus:ring-brand-gold border-gray-300 rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={perm.canEdit}
                                                onChange={() => handleToggle(module, 'canEdit')}
                                                disabled={saving}
                                                className="h-4 w-4 text-brand-gold focus:ring-brand-gold border-gray-300 rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={perm.canApprove}
                                                onChange={() => handleToggle(module, 'canApprove')}
                                                disabled={saving}
                                                className="h-4 w-4 text-brand-gold focus:ring-brand-gold border-gray-300 rounded"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};
