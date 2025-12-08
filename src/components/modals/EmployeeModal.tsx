import React, { useState, useEffect } from 'react';
import { Employee, Role } from '../../types';
import { Modal } from '../common/Modal';

interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employee: Omit<Employee, 'id' | 'avatarUrl' | 'notificationPreferences'> | Employee, password?: string, avatarFile?: File) => void;
    employeeToEdit: Employee | null;
    onResetPassword?: (email: string) => void;
    onUploadAvatar?: (file: File, userId: number) => Promise<string>;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSave, employeeToEdit, onResetPassword, onUploadAvatar }) => {

    const initialFormState = {
        name: '',
        email: '',
        position: '',
        role: 'Sales' as Role,
        isAdmin: false,
        avatarUrl: '',
        active: true,
        password: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('');

    useEffect(() => {
        if (employeeToEdit) {
            setFormData({
                name: employeeToEdit.name,
                email: employeeToEdit.email || '',
                position: employeeToEdit.position,
                role: employeeToEdit.role,
                isAdmin: employeeToEdit.isAdmin || false,
                avatarUrl: employeeToEdit.avatarUrl || '',
                active: employeeToEdit.active !== undefined ? employeeToEdit.active : true,
                password: ''
            });
            setAvatarPreview(employeeToEdit.avatarUrl || '');
        } else {
            setFormData(initialFormState);
            setAvatarPreview('');
        }
        setAvatarFile(null);
    }, [employeeToEdit, isOpen]);


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (employeeToEdit) {
            // Remove password from update if empty or handle separately (usually we don't update password here)
            const { password, ...rest } = formData;
            onSave({ ...employeeToEdit, ...rest }, undefined, avatarFile || undefined);
        } else {
            const { password, ...rest } = formData;
            onSave(rest, password, avatarFile || undefined);
        }
        onClose();
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={employeeToEdit ? "Editar Funcionário" : "Adicionar Novo Funcionário"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Nome Completo" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                {!employeeToEdit && (
                    <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Senha" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                )}
                <input name="position" value={formData.position} onChange={handleInputChange} placeholder="Cargo" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />

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
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-brand-gold file:text-brand-dark hover:file:bg-yellow-500 dark:text-gray-300"
                        />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ou deixe em branco para usar avatar automático</p>
                </div>

                <select name="role" value={formData.role} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="Sales">Vendas</option>
                    <option value="Creative">Criativo</option>
                    <option value="Photographer">Fotógrafo</option>
                    <option value="Videomaker">Videomaker</option>
                    <option value="IT">TI</option>
                    <option value="Other">Outros</option>
                </select>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <input id="isAdmin" name="isAdmin" type="checkbox" checked={formData.isAdmin} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold" />
                        <label htmlFor="isAdmin" className="block text-sm text-gray-900 dark:text-gray-300">Admin</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input id="active" name="active" type="checkbox" checked={formData.active} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold" />
                        <label htmlFor="active" className="block text-sm text-gray-900 dark:text-gray-300">Ativo</label>
                    </div>
                </div>
                {employeeToEdit && onResetPassword && (
                    <button type="button" onClick={() => onResetPassword(formData.email)} className="text-sm text-blue-600 hover:underline">
                        Enviar Email de Redefinição de Senha
                    </button>
                )}
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black dark:bg-brand-gold dark:text-brand-dark">Salvar</button>
                </div>
            </form>
        </Modal>
    );
};
