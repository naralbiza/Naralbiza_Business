
import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import { Card } from './common/Card';
import { EmployeeModal } from './modals/EmployeeModal';
import { PlusIcon } from './common/Icon';
import { getRoles } from '../services/api';

type Theme = 'light' | 'dark';

interface SettingsProps {
  currentUser: Employee;
  onUpdateUser: (user: Employee) => Promise<void>;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onResetPassword?: (email: string) => Promise<void>;
  employees?: Employee[];
  onAddEmployee?: (employee: Omit<Employee, 'id' | 'avatarUrl' | 'notificationPreferences'>, password?: string, avatarFile?: File) => Promise<void>;
  onRemoveEmployee?: (employeeId: number) => Promise<void>;
  onUpdateEmployee?: (employee: Employee, avatarFile?: File) => Promise<void>;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <div
    onClick={onChange}
    className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-brand-gold' : 'bg-gray-300 dark:bg-gray-600'}`}
  >
    <div
      className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${checked ? 'translate-x-6' : ''}`}
    ></div>
  </div>
);


/**
 * Settings page component.
 * Allows users to manage their profile and application appearance.
 */
export const Settings: React.FC<SettingsProps> = ({ currentUser, onUpdateUser, theme, setTheme, onResetPassword, employees, onAddEmployee, onRemoveEmployee, onUpdateEmployee }) => {
  const [formState, setFormState] = useState({
    name: currentUser.name,
    position: currentUser.position,
    notificationPreferences: currentUser.notificationPreferences || { emailOnNewLead: false, emailOnTaskDue: false }
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    setFormState({
      name: currentUser.name,
      position: currentUser.position,
      notificationPreferences: currentUser.notificationPreferences || { emailOnNewLead: false, emailOnTaskDue: false }
    });
  }, [currentUser]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await onUpdateUser({
        ...currentUser,
        name: formState.name,
        position: formState.position,
        notificationPreferences: formState.notificationPreferences,
      });
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Erro ao salvar perfil."); // Improved from just alert
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (key: keyof Employee['notificationPreferences']) => {
    setFormState(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: !prev.notificationPreferences[key]
      }
    }));
  };

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
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
    if (currentUser.isAdmin && employees) {
      fetchRoles();
    }
  }, [currentUser, employees]);


  const handleOpenEmployeeModal = (employee: Employee | null = null) => {
    setEmployeeToEdit(employee);
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async (employeeData: Omit<Employee, 'id' | 'avatarUrl' | 'notificationPreferences'> | Employee, password?: string, avatarFile?: File) => {
    if ('id' in employeeData) {
      await onUpdateEmployee?.(employeeData, avatarFile);
    } else {
      await onAddEmployee?.(employeeData, password, avatarFile);
    }
  };

  const handleRemoveEmployee = async (id: number) => {
    if (window.confirm('Tem certeza que deseja remover este usuário?')) {
      await onRemoveEmployee?.(id);
    }
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-brand-dark dark:text-gray-100">Configurações</h2>
      <form onSubmit={handleProfileSubmit}>
        <div className="space-y-8">
          <Card title="Configurações do Perfil">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formState.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={isSavingProfile}
                />
              </div>
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cargo</label>
                <input
                  id="position"
                  name="position"
                  type="text"
                  value={formState.position}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={isSavingProfile}
                />
              </div>
            </div>
          </Card>

          <Card title="Preferências de Notificação">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-700 dark:text-gray-300">Receber e-mail para novos leads</p>
                <ToggleSwitch checked={formState.notificationPreferences.emailOnNewLead} onChange={() => handleNotificationToggle('emailOnNewLead')} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-gray-700 dark:text-gray-300">Receber e-mail para tarefas vencendo</p>
                <ToggleSwitch checked={formState.notificationPreferences.emailOnTaskDue} onChange={() => handleNotificationToggle('emailOnTaskDue')} />
              </div>
            </div>
          </Card>

          <div className="text-right">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-3 rounded text-white bg-brand-dark hover:bg-black dark:bg-brand-gold dark:text-brand-dark dark:hover:bg-yellow-500 font-semibold disabled:opacity-50"
            >
              {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </form>

      <Card title="Aparência">
        <div className="flex items-center justify-between">
          <p className="text-gray-700 dark:text-gray-300">Modo Escuro</p>
          <ToggleSwitch checked={theme === 'dark'} onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
        </div>
      </Card>

      <Card title="Integrações">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 dark:text-gray-300">Conectar com Google Calendar</p>
            <ToggleSwitch checked={false} onChange={() => { }} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-700 dark:text-gray-300">Conectar com Slack</p>
            <ToggleSwitch checked={true} onChange={() => { }} />
          </div>
        </div>
      </Card>

      <Card title="Segurança">
        <div className="space-y-4">
          <button
            onClick={() => {
              if (window.confirm('Enviar email de redefinição de senha para ' + currentUser.email + '?')) {
                onResetPassword?.(currentUser.email);
              }
            }}
            className="w-full text-left px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Alterar Senha
          </button>
        </div>
      </Card>

      {currentUser.isAdmin && employees && (
        <Card title="Gerenciar Usuários">
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => handleOpenEmployeeModal()}
                className="flex items-center gap-2 bg-brand-gold text-brand-dark font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-yellow-500 transition-colors text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Adicionar Usuário
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cargo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img className="h-8 w-8 rounded-full object-cover" src={employee.avatarUrl} alt={employee.name} />
                          <div className="ml-4"><div className="text-sm font-medium text-gray-900 dark:text-gray-100">{employee.name}</div></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{employee.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {employee.active ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Ativo</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inativo</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                        <button onClick={() => handleOpenEmployeeModal(employee)} className="text-brand-gold hover:text-yellow-600">Editar</button>
                        <button onClick={() => handleRemoveEmployee(employee.id)} className="text-red-600 hover:text-red-900">Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      <EmployeeModal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} onSave={handleSaveEmployee} employeeToEdit={employeeToEdit} onResetPassword={onResetPassword} roles={roles} />
    </div>
  );
};