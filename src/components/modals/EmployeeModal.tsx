
import React, { useState, useEffect } from 'react';
import { User, Role, Sector, Page } from '../../types';
import { Modal } from '../common/Modal';
import { getPermissionsByRole } from '../../services/api';

interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employee: Omit<User, 'id' | 'avatarUrl' | 'permissions'> & { permissions?: any[] } | User, password?: string, avatarFile?: File) => Promise<void>;
    employeeToEdit: User | null;
    onResetPassword?: (email: string) => void;
    onUploadAvatar?: (file: File, userId: string) => Promise<string>;
    roles: { id: string, name: string }[];
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSave, employeeToEdit, onResetPassword, onUploadAvatar, roles }) => {

    const initialFormState = {
        name: '',
        email: '',
        role: 'Comercial' as Role,
        sector: 'Comercial' as Sector,
        avatarUrl: '',
        active: true,
        password: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [pagePermissions, setPagePermissions] = useState<Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean }>>({});
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (employeeToEdit) {
            setFormData({
                name: employeeToEdit.name,
                email: employeeToEdit.email || '',
                role: employeeToEdit.role,
                sector: employeeToEdit.sector,
                avatarUrl: employeeToEdit.avatarUrl || '',
                active: employeeToEdit.active !== undefined ? employeeToEdit.active : true,
                password: ''
            });
            setAvatarPreview(employeeToEdit.avatarUrl || '');
            const perms: Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean }> = {};
            employeeToEdit.permissions?.forEach(p => {
                perms[p.module] = {
                    canView: p.canView,
                    canCreate: p.canCreate,
                    canEdit: p.canEdit
                };
            });
            setPagePermissions(perms);
        } else {
            setFormData(initialFormState);
            setAvatarPreview('');
            setPagePermissions({});
        }
        setAvatarFile(null);
        setErrorMessage(null);
    }, [employeeToEdit, isOpen]);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setErrorMessage(null);

        // Validation
        if (!formData.name.trim()) {
            setErrorMessage("O nome é obrigatório.");
            setIsSaving(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setErrorMessage("Por favor, insira um email válido.");
            setIsSaving(false);
            return;
        }

        if (!employeeToEdit) {
            if (!formData.password) {
                setErrorMessage("A senha é obrigatória para novos usuários.");
                setIsSaving(false);
                return;
            }
            if (formData.password.length < 6) {
                setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
                setIsSaving(false);
                return;
            }
        }

        try {
            const permissionsToSave = Object.entries(pagePermissions)
                .filter(([_, p]: [string, { canView: boolean; canCreate: boolean; canEdit: boolean }]) => p.canView)
                .map(([module, p]: [string, { canView: boolean; canCreate: boolean; canEdit: boolean }]) => ({
                    module,
                    canView: true,
                    canCreate: p.canCreate,
                    canEdit: p.canEdit,
                    canApprove: p.canEdit // Default approve to edit permission for now in this simplified UI
                }));

            if (employeeToEdit) {
                const { password, ...rest } = formData;
                await onSave({ ...employeeToEdit, ...rest, permissions: permissionsToSave as any }, undefined, avatarFile || undefined);
            } else {
                const { password, ...rest } = formData;
                const userToSave = {
                    ...rest,
                    permissions: permissionsToSave
                };
                await onSave(userToSave as any, password, avatarFile || undefined);
            }
            onClose();
        } catch (error: any) {
            console.error("Error saving employee:", error);
            // Translate common Supabase errors if possible
            if (error.message?.includes('unique') || error.code === '23505') {
                setErrorMessage("Este email já está cadastrado.");
            } else {
                setErrorMessage("Erro ao salvar funcionário: " + (error.message || "Erro desconhecido"));
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));

            if (name === 'role') {
                // Fetch permissions for the selected role
                const role = roles.find(r => r.name === value); // Match by name as the select uses name values
                if (role) {
                    try {
                        const rolePerms = await getPermissionsByRole(role.id);
                        const perms: Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean }> = {};
                        rolePerms.forEach(p => {
                            perms[p.module] = {
                                canView: p.canView,
                                canCreate: p.canCreate,
                                canEdit: p.canEdit
                            };
                        });
                        setPagePermissions(perms);
                    } catch (err) {
                        console.error("Error fetching role permissions:", err);
                    }
                }
            }
        }
    };

    const togglePage = (pageName: string) => {
        setPagePermissions(prev => {
            const current = prev[pageName];
            if (current?.canView) {
                // Remove
                const { [pageName]: _, ...rest } = prev;
                return rest;
            } else {
                // Add
                return {
                    ...prev,
                    [pageName]: { canView: true, canCreate: true, canEdit: true }
                };
            }
        });
    };

    const toggleSubPermission = (e: React.MouseEvent, pageName: string, type: 'canCreate' | 'canEdit') => {
        e.stopPropagation();
        setPagePermissions(prev => ({
            ...prev,
            [pageName]: {
                ...prev[pageName],
                [type]: !prev[pageName]?.[type]
            }
        }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={employeeToEdit ? "Editar Funcionário" : "Adicionar Novo Funcionário"}>
            {errorMessage && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{errorMessage}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4 pb-4 border-b border-gray-100 mb-4 sticky top-0 bg-white z-10">
                    <button type="submit" className="flex-1 py-3 rounded-lg text-white font-bold text-lg bg-brand-gold hover:bg-yellow-500 shadow-lg transform transition hover:scale-[1.02] dark:text-brand-dark disabled:opacity-50 disabled:scale-100 disabled:shadow-none" disabled={isSaving}>
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 font-semibold" disabled={isSaving}>
                        Cancelar
                    </button>
                </div>
                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Nome Completo" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={isSaving} />
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={isSaving} />
                {!employeeToEdit && (
                    <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Senha" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={isSaving} />
                )}

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Foto de Perfil</label>
                    <div className="flex items-center gap-4">
                        {avatarPreview && (
                            <img src={avatarPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isSaving}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-brand-gold file:text-brand-dark hover:file:bg-yellow-500 dark:text-gray-300"
                        />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ou deixe em branco para usar avatar automático</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Cargo</label>
                        <select name="role" value={formData.role} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={isSaving}>
                            <option value="Admin">Admin</option>
                            <option value="CEO / Direção">CEO / Direção</option>
                            <option value="Fotógrafo">Fotógrafo</option>
                            <option value="Videógrafo">Videógrafo</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Financeiro">Financeiro</option>
                            <option value="RH">RH</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Sector</label>
                        <select name="sector" value={formData.sector} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={isSaving}>
                            <option value="Administração">Administração</option>
                            <option value="Fotografia">Fotografia</option>
                            <option value="Vídeo">Vídeo</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Financeiro">Financeiro</option>
                            <option value="RH">RH</option>
                            <option value="Produção">Produção</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-2 border-t pt-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Visibilidade de Páginas (Acessos)
                    </label>
                    <p className="text-xs text-gray-500 mb-4">Selecione quais os módulos que este utilizador poderá visualizar.</p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.values(Page).map((pageValue) => {
                            const p = pagePermissions[pageValue];
                            const isActive = !!p?.canView;
                            return (
                                <div
                                    key={pageValue}
                                    onClick={() => togglePage(pageValue)}
                                    className={`
                                        cursor-pointer p-2 rounded-lg border flex flex-col justify-between transition-all min-h-[80px]
                                        ${isActive
                                            ? 'border-brand-gold bg-brand-gold/10 text-brand-dark ring-2 ring-brand-gold ring-opacity-50'
                                            : 'border-gray-200 hover:border-brand-gold/50 dark:border-gray-700 dark:text-gray-300'}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[80%]">{pageValue}</span>
                                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${isActive ? 'bg-brand-gold border-brand-gold' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {isActive && (
                                                <svg className="w-3 h-3 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>

                                    {isActive && (
                                        <div className="flex gap-2 mt-auto pt-1 border-t border-brand-gold/20">
                                            <button
                                                onClick={(e) => toggleSubPermission(e, pageValue, 'canCreate')}
                                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors ${p.canCreate ? 'bg-brand-dark text-white' : 'bg-gray-200 text-gray-500'}`}
                                                title="Pode Criar"
                                            >
                                                C
                                            </button>
                                            <button
                                                onClick={(e) => toggleSubPermission(e, pageValue, 'canEdit')}
                                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors ${p.canEdit ? 'bg-brand-dark text-white' : 'bg-gray-200 text-gray-500'}`}
                                                title="Pode Editar"
                                            >
                                                E
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <input id="active" name="active" type="checkbox" checked={formData.active} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold" disabled={isSaving} />
                        <label htmlFor="active" className="block text-sm text-gray-900 dark:text-gray-300">Usuário Ativo</label>
                    </div>
                </div>
                {employeeToEdit && onResetPassword && (
                    <button type="button" onClick={() => onResetPassword(formData.email)} className="text-sm text-blue-600 hover:underline" disabled={isSaving}>
                        Enviar Email de Redefinição de Senha
                    </button>
                )}

            </form>
        </Modal>
    );
};
