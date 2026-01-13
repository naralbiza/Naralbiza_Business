import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import {
    PlusIcon, UsersIcon, FileTextIcon, ClockIcon,
    GraduationCapIcon, HeartIcon, SendIcon, CheckCircleIcon, EditIcon,
    TrashIcon, SearchIcon, FilterIcon, BriefcaseIcon,
    BarChartIcon, CalendarIcon, DownloadIcon, ChevronRightIcon,
    DashboardIcon as LayoutIcon, ListIcon as TableIcon
} from './common/Icon';
import { formatCurrency } from '../utils';
import { Page, User, JobRole, Freelancer, WeeklyReport, Training, CultureFeedback, AttendanceRecord } from '../types';
import { JobRoleModal } from './modals/JobRoleModal';
import { FreelancerModal } from './modals/FreelancerModal';
import { TrainingModal } from './modals/TrainingModal';
import { CultureFeedbackModal } from './modals/CultureFeedbackModal';
import { EmployeeModal } from './modals/EmployeeModal';

export const HRPerformance: React.FC = () => {
    const {
        employees, jobRoles, freelancers, weeklyReports, trainings, cultureFeedbacks,
        addJobRole, updateJobRoleData, removeJobRole,
        addFreelancer, updateFreelancerData, removeFreelancer,
        addWeeklyReport, removeWeeklyReport, addTraining, removeTraining,
        addCultureFeedback, updateEmployeeData, addEmployee,
        attendanceRecords, addAttendanceRecord, removeAttendanceRecord
    } = useData();
    const { currentUser, isAdmin } = useAuth();

    const [activeTab, setActiveTab] = useState('colaboradores');
    const [searchTerm, setSearchTerm] = useState('');

    const tabs = [
        { id: 'colaboradores', label: 'Colaboradores', icon: UsersIcon },
        { id: 'freelancers', label: 'Freelancers', icon: UsersIcon },
        { id: 'cargos', label: 'Cargos e Funções', icon: BriefcaseIcon, adminOnly: true },
        { id: 'formulario', label: 'Formulário Semanal', icon: FileTextIcon },
        { id: 'relatorios_admin', label: 'Relatórios Gerais', icon: BarChartIcon, adminOnly: true },
        { id: 'desempenho', label: 'Desempenho', icon: BarChartIcon },
        { id: 'assiduidade', label: 'Assiduidade', icon: CalendarIcon },
        { id: 'capacitacao', label: 'Capacitação', icon: GraduationCapIcon },
        { id: 'cultura', label: 'Cultura', icon: HeartIcon },
    ];

    const filteredTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

    // Modal States
    const [isJobRoleModalOpen, setIsJobRoleModalOpen] = useState(false);
    const [editingJobRole, setEditingJobRole] = useState<JobRole | undefined>(undefined);

    const [isFreelancerModalOpen, setIsFreelancerModalOpen] = useState(false);
    const [editingFreelancer, setEditingFreelancer] = useState<Freelancer | undefined>(undefined);

    const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
    const [isCultureModalOpen, setIsCultureModalOpen] = useState(false);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [selectedEmployeeToEdit, setSelectedEmployeeToEdit] = useState<User | null>(null);
    const [editingReport, setEditingReport] = useState<WeeklyReport | null>(null);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

    // Handlers
    const handleOpenJobRoleModal = (role?: JobRole) => {
        setEditingJobRole(role);
        setIsJobRoleModalOpen(true);
    };

    const handleOpenFreelancerModal = (freelancer?: Freelancer) => {
        setEditingFreelancer(freelancer);
        setIsFreelancerModalOpen(true);
    };

    const handleJobRoleSubmit = async (roleData: any) => {
        if (editingJobRole) {
            await updateJobRoleData({ ...editingJobRole, ...roleData });
        } else {
            await addJobRole(roleData);
        }
    };

    const handleFreelancerSubmit = async (freelancerData: any) => {
        if (editingFreelancer) {
            await updateFreelancerData({ ...editingFreelancer, ...freelancerData });
        } else {
            await addFreelancer(freelancerData);
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">RH & PERFORMANCE</h1>
                    <p className="text-gray-400 mt-1">Gestão estratégica de pessoas e produtividade</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-brand-dark/50 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/50 w-64 transition-all"
                        />
                    </div>
                    <button className="bg-brand-dark/50 border border-gray-800 p-2.5 rounded-xl hover:bg-gray-800 transition-colors">
                        <FilterIcon className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-brand-dark/30 backdrop-blur-sm border border-gray-800 p-1 rounded-2xl flex flex-wrap gap-1">
                {filteredTabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isActive
                                ? 'bg-brand-gold text-brand-dark shadow-lg shadow-brand-gold/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
                {activeTab === 'colaboradores' && <CollaboratorsTab employees={employees} searchTerm={searchTerm} updateEmployee={updateEmployeeData} setIsEmployeeModalOpen={setIsEmployeeModalOpen} setSelectedEmployeeToEdit={setSelectedEmployeeToEdit} />}
                {activeTab === 'freelancers' && <FreelancersTab freelancers={freelancers} searchTerm={searchTerm} onAdd={() => handleOpenFreelancerModal()} onEdit={handleOpenFreelancerModal} removeFreelancer={removeFreelancer} />}
                {activeTab === 'cargos' && <JobRolesTab jobRoles={jobRoles} onAdd={() => handleOpenJobRoleModal()} onEdit={handleOpenJobRoleModal} removeJobRole={removeJobRole} />}
                {activeTab === 'formulario' && <WeeklyFormTab currentUser={currentUser!} jobRoles={jobRoles} addWeeklyReport={addWeeklyReport} employees={employees} isAdmin={isAdmin} weeklyReports={weeklyReports} />}
                {activeTab === 'relatorios_admin' && <AdminReportsTab weeklyReports={weeklyReports} employees={employees} jobRoles={jobRoles} removeWeeklyReport={removeWeeklyReport} />}
                {activeTab === 'desempenho' && <PerformanceTab weeklyReports={weeklyReports} employees={employees} cultureFeedbacks={cultureFeedbacks} />}
                {activeTab === 'assiduidade' && (
                    <AttendanceTab
                        attendanceRecords={attendanceRecords}
                        employees={employees}
                        onAdd={() => setIsAttendanceModalOpen(true)}
                        removeRecord={removeAttendanceRecord}
                    />
                )}
                {activeTab === 'capacitacao' && <TrainingTab trainings={trainings} employees={employees} onAdd={() => setIsTrainingModalOpen(true)} removeTraining={removeTraining} />}
                {activeTab === 'cultura' && <CultureTab cultureFeedbacks={cultureFeedbacks} employees={employees} onAdd={() => setIsCultureModalOpen(true)} isAdmin={isAdmin} />}
            </div>

            {/* Modals */}
            <JobRoleModal
                isOpen={isJobRoleModalOpen}
                onClose={() => setIsJobRoleModalOpen(false)}
                onSubmit={handleJobRoleSubmit}
                roleToEdit={editingJobRole}
            />
            <FreelancerModal
                isOpen={isFreelancerModalOpen}
                onClose={() => setIsFreelancerModalOpen(false)}
                onSubmit={handleFreelancerSubmit}
                freelancerToEdit={editingFreelancer}
            />
            <TrainingModal
                isOpen={isTrainingModalOpen}
                onClose={() => setIsTrainingModalOpen(false)}
                onSubmit={addTraining}
                employees={employees}
            />
            <CultureFeedbackModal
                isOpen={isCultureModalOpen}
                onClose={() => setIsCultureModalOpen(false)}
                onSubmit={addCultureFeedback}
                currentUser={currentUser}
            />
            <AttendanceModal
                isOpen={isAttendanceModalOpen}
                onClose={() => setIsAttendanceModalOpen(false)}
                onSubmit={addAttendanceRecord}
                employees={employees}
            />

            <EmployeeModal
                isOpen={isEmployeeModalOpen}
                onClose={() => {
                    setIsEmployeeModalOpen(false);
                    setSelectedEmployeeToEdit(null);
                }}
                onSave={async (data, pwd, file) => {
                    if (selectedEmployeeToEdit) {
                        await updateEmployeeData(data as User, file);
                    } else {
                        await addEmployee(data as any, pwd, file);
                    }
                }}
                employeeToEdit={selectedEmployeeToEdit}
                roles={jobRoles.map(r => ({ id: r.id, name: r.name }))}
            />
        </div>
    );
};

// --- Tab Components ---

const CollaboratorsTab: React.FC<{ employees: User[], searchTerm: string, updateEmployee: (u: User) => Promise<void>, setIsEmployeeModalOpen: (b: boolean) => void, setSelectedEmployeeToEdit: (u: User | null) => void }> = ({ employees, searchTerm, updateEmployee, setIsEmployeeModalOpen, setSelectedEmployeeToEdit }) => {
    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
            {filtered.map(emp => (
                <div key={emp.id} className="bg-brand-dark/40 border border-gray-800 rounded-2xl p-5 hover:border-brand-gold/30 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                        <img
                            src={emp.avatarUrl}
                            alt={emp.name}
                            className="w-14 h-14 rounded-full border-2 border-brand-gold/20"
                        />
                        <div>
                            <h3 className="font-bold text-white group-hover:text-brand-gold transition-colors">{emp.name}</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{emp.role}</p>
                        </div>
                    </div>

                    <div className="space-y-3 py-4 border-t border-gray-800/50">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Departamento:</span>
                            <span className="text-gray-300">{emp.department || 'Não definido'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Contrato:</span>
                            <span className="text-gray-300">{emp.contractType || 'CLT'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Admissão:</span>
                            <span className="text-gray-300">{emp.admissionDate ? new Date(emp.admissionDate).toLocaleDateString() : '-'}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedEmployeeToEdit(emp);
                            setIsEmployeeModalOpen(true);
                        }}
                        className="w-full mt-4 py-2 px-4 bg-gray-800 hover:bg-brand-gold hover:text-brand-dark rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <EditIcon className="w-3.5 h-3.5" />
                        Gerenciar Perfil
                    </button>
                </div>
            ))}
        </div>
    );
};

// Placeholder for other tabs - will implement them in subsequent steps
const FreelancersTab: React.FC<{ freelancers: Freelancer[], searchTerm: string, onAdd: () => void, onEdit: (f: Freelancer) => void, removeFreelancer: any }> = ({ freelancers, searchTerm, onAdd, onEdit, removeFreelancer }) => {
    const filtered = freelancers.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.mainFunction.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Base de Freelancers</h2>
                <button
                    onClick={onAdd}
                    className="bg-brand-gold text-brand-dark px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-all"
                >
                    <PlusIcon className="w-4 h-4" />
                    Novo Freelancer
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(free => (
                    <div key={free.id} className="bg-brand-dark/40 border border-gray-800 rounded-2xl p-5 hover:border-brand-gold/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-white">{free.name}</h3>
                                <p className="text-xs text-brand-gold font-bold uppercase tracking-wider">{free.mainFunction}</p>
                            </div>
                            <div className="bg-brand-gold/10 text-brand-gold px-2 py-1 rounded text-[10px] font-bold uppercase">
                                {free.usageFrequency} uso
                            </div>
                        </div>

                        <div className="flex items-center gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map(star => (
                                <HeartIcon key={star} className={`w - 3 h - 3 ${star <= free.averageRating ? 'fill-brand-gold text-brand-gold' : 'text-gray-700'} `} />
                            ))}
                            <span className="text-xs text-gray-500 ml-2">Avaliação Média</span>
                        </div>

                        <div className="text-xs text-gray-400 mb-4 bg-black/20 p-3 rounded-lg">
                            <p className="font-bold text-gray-500 uppercase text-[9px] mb-1">Disponibilidade</p>
                            {free.availability}
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => onEdit(free)} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-[11px] font-bold transition-all">Editar</button>
                            <button onClick={() => removeFreelancer(free.id)} className="px-3 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all border border-red-500/20">
                                <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const JobRolesTab: React.FC<{ jobRoles: JobRole[], onAdd: () => void, onEdit: (r: JobRole) => void, removeJobRole: any }> = ({ jobRoles, onAdd, onEdit, removeJobRole }) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Cargos e KPIs Estratégicos</h2>
                <button
                    onClick={onAdd}
                    className="bg-brand-gold text-brand-dark px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                >
                    <PlusIcon className="w-4 h-4" />
                    Novo Cargo
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {jobRoles.map(role => (
                    <div key={role.id} className="bg-brand-dark/40 border border-gray-800 rounded-2xl p-6 hover:border-brand-gold/20 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">{role.name}</h3>
                                <p className="text-sm text-gray-400 mt-1">{role.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => onEdit(role)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"><EditIcon className="w-4 h-4 text-gray-400" /></button>
                                <button onClick={() => removeJobRole(role.id)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Indicadores de Performance (KPIs)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {role.kpis?.map((kpi, idx) => (
                                    <div key={idx} className="bg-black/20 p-3 rounded-xl border border-gray-800/50 flex justify-between items-center">
                                        <span className="text-xs text-gray-300 font-bold">{kpi.name}</span>
                                        <span className="text-[10px] bg-brand-gold/10 text-brand-gold px-1.5 py-0.5 rounded font-black">PESO {kpi.weight}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const WeeklyFormTab: React.FC<{ currentUser: User, jobRoles: JobRole[], addWeeklyReport: any, employees: User[], isAdmin: boolean, weeklyReports: WeeklyReport[] }> = ({ currentUser, jobRoles, addWeeklyReport, employees, isAdmin, weeklyReports }) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(currentUser.id);

    const [formData, setFormData] = useState({
        weekStartDate: new Date().toISOString().split('T')[0],
        roleId: '',
        projectsWorked: '',
        hoursWorked: 0,
        deliveriesMade: 0,
        difficultyLevel: 3,
        selfEvaluation: 3,
        mainChallenges: '',
        improvementNotes: '',
        motivationLevel: 3,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const startDate = new Date(formData.weekStartDate);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);

            await addWeeklyReport({
                ...formData,
                employeeId: isAdmin ? selectedEmployeeId : currentUser.id,
                weekEndDate: endDate.toISOString().split('T')[0],
                confirmed: true
            });
            alert('Relatório enviado com sucesso!');
            // Reset common fields
            setFormData(prev => ({ ...prev, projectsWorked: '', hoursWorked: 0, deliveriesMade: 0, mainChallenges: '', improvementNotes: '' }));
        } catch (error) {
            console.error("Error submitting report:", error);
            alert('Erro ao enviar relatório. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter reports to show
    const myReports = weeklyReports.filter(r => r.employeeId === (isAdmin ? selectedEmployeeId : currentUser.id));

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div className="bg-brand-dark/40 border border-gray-800 rounded-3xl p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-brand-gold/10 p-3 rounded-2xl">
                        <FileTextIcon className="w-6 h-6 text-brand-gold" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white">Relatório de Atividades Semanal</h2>
                        <p className="text-gray-400 text-sm">Documente seu progresso e desafios desta semana</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isAdmin && (
                        <div className="md:col-span-2 bg-gray-800/50 p-4 rounded-xl border border-gray-700 mb-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Selecionar Colaborador (Admin)</label>
                            <select
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                className="w-full bg-black/30 border border-gray-600 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all"
                            >
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id} className="text-black">{emp.name} ({emp.role})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Cargo/Função nesta semana</label>
                        <select
                            value={formData.roleId}
                            onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                            className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all"
                            required
                        >
                            <option value="" className="text-black">Selecione o cargo</option>
                            {jobRoles.map(r => <option key={r.id} value={r.id} className="text-black">{r.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Data de Início da Semana</label>
                        <input
                            type="date"
                            value={formData.weekStartDate}
                            onChange={e => setFormData({ ...formData, weekStartDate: e.target.value })}
                            className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-brand-gold/50 outline-none"
                            required
                        />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Projectos Trabalhados (Vídeos/Sessões)</label>
                        <textarea
                            value={formData.projectsWorked}
                            onChange={e => setFormData({ ...formData, projectsWorked: e.target.value })}
                            placeholder="Ex: Edição Vídeo Coca-cola, Sessão de Retrato CEO..."
                            className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-brand-gold/50 outline-none min-h-[100px]"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Total de Horas Faturáveis</label>
                        <input
                            type="number"
                            value={formData.hoursWorked}
                            onChange={e => setFormData({ ...formData, hoursWorked: parseInt(e.target.value) || 0 })}
                            className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-brand-gold/50 outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Entregas Finalizadas</label>
                        <input
                            type="number"
                            value={formData.deliveriesMade}
                            onChange={e => setFormData({ ...formData, deliveriesMade: parseInt(e.target.value) || 0 })}
                            className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-brand-gold/50 outline-none"
                        />
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-800/50 mt-4">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Nível de Dificuldade (1-5)</label>
                            <div className="flex justify-between px-2">
                                {[1, 2, 3, 4, 5].map(v => (
                                    <button
                                        key={v} type="button"
                                        onClick={() => setFormData({ ...formData, difficultyLevel: v })}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${formData.difficultyLevel === v ? 'bg-brand-gold text-brand-dark' : 'bg-gray-800 text-gray-500'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Auto-Avaliação (1-5)</label>
                            <div className="flex justify-between px-2">
                                {[1, 2, 3, 4, 5].map(v => (
                                    <button
                                        key={v} type="button"
                                        onClick={() => setFormData({ ...formData, selfEvaluation: v })}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${formData.selfEvaluation === v ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-500'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Motivação (1-5)</label>
                            <div className="flex justify-between px-2">
                                {[1, 2, 3, 4, 5].map(v => (
                                    <button
                                        key={v} type="button"
                                        onClick={() => setFormData({ ...formData, motivationLevel: v })}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${formData.motivationLevel === v ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-500'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full bg-brand-gold hover:bg-yellow-600 text-brand-dark font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] shadow-xl shadow-brand-gold/20 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin"></div>
                                    ENVIANDO RELATÓRIO...
                                </>
                            ) : (
                                <>
                                    <SendIcon className="w-5 h-5" />
                                    SUBMETER RELATÓRIO SEMANAL
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* List of Recent Reports */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4">Relatórios Recentes {isAdmin && selectedEmployeeId !== currentUser.id ? '(Colaborador Selecionado)' : ''}</h3>
                <div className="space-y-4">
                    {myReports.length === 0 ? (
                        <div className="text-gray-500 text-sm italic bg-brand-dark/20 p-6 rounded-2xl border border-gray-800 text-center">
                            Nenhum relatório encontrado para este período/colaborador.
                        </div>
                    ) : (
                        myReports.map(report => (
                            <div key={report.id} className="bg-brand-dark/40 border border-gray-800 rounded-2xl p-6 hover:border-brand-gold/20 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-brand-gold font-bold text-sm">Semana de {new Date(report.weekStartDate).toLocaleDateString()}</span>
                                            {report.confirmed && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
                                        </div>
                                        <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">
                                            {jobRoles.find(r => r.id === report.roleId)?.name || 'Cargo não encontrado'}
                                        </p>
                                    </div>
                                    <div className="flex gap-4 text-right">
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Entregas</p>
                                            <p className="text-xl font-black text-white">{report.deliveriesMade}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Horas</p>
                                            <p className="text-xl font-black text-brand-gold">{report.hoursWorked}h</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50 mb-4">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-2">Projectos</p>
                                    <p className="text-sm text-gray-300 whitespace-pre-line">{report.projectsWorked}</p>
                                </div>
                                <div className="flex gap-4 border-t border-gray-800/50 pt-4">
                                    <div className="flex items-center gap-2" title="Auto-Avaliação">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">Avaliação</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-black ${report.selfEvaluation >= 4 ? 'bg-green-500/10 text-green-500' : 'bg-gray-800 text-gray-400'}`}>{report.selfEvaluation}/5</span>
                                    </div>
                                    <div className="flex items-center gap-2" title="Nível de Dificuldade">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">Dificuldade</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-black bg-gray-800 text-gray-400`}>{report.difficultyLevel}/5</span>
                                    </div>
                                    <div className="flex items-center gap-2" title="Motivação">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">Motivação</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-black ${report.motivationLevel >= 4 ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-800 text-gray-400'}`}>{report.motivationLevel}/5</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminReportsTab: React.FC<{ weeklyReports: WeeklyReport[], employees: User[], jobRoles: JobRole[], removeWeeklyReport: any }> = ({ weeklyReports, employees, jobRoles, removeWeeklyReport }) => {
    const [filterEmployee, setFilterEmployee] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const filteredReports = useMemo(() => {
        return weeklyReports.filter(r => {
            const matchesEmployee = filterEmployee ? r.employeeId === filterEmployee : true;
            // Normalize dates to YYYY-MM-DD for reliable comparison
            const reportDate = r.weekStartDate.split('T')[0];
            const filterDateStr = filterDate.split('T')[0];
            const matchesDate = filterDate ? reportDate === filterDateStr : true;
            return matchesEmployee && matchesDate;
        }).sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());
    }, [weeklyReports, filterEmployee, filterDate]);

    // Stats
    const totalHours = filteredReports.reduce((acc, r) => acc + r.hoursWorked, 0);
    const totalDeliveries = filteredReports.reduce((acc, r) => acc + r.deliveriesMade, 0);
    const avgEvaluation = filteredReports.length > 0
        ? (filteredReports.reduce((acc, r) => acc + r.selfEvaluation, 0) / filteredReports.length).toFixed(1)
        : 0;

    const handleDelete = async (id: string) => {
        if (window.confirm('Excluir este relatório definitivamente?')) {
            await removeWeeklyReport(id);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-dark/40 border border-gray-800 p-6 rounded-3xl">
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5 ml-1">Filtrar por Colaborador</label>
                        <select
                            value={filterEmployee}
                            onChange={e => setFilterEmployee(e.target.value)}
                            className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-brand-gold/50 outline-none"
                        >
                            <option value="">Todos os Colaboradores</option>
                            {employees.map(e => <option key={e.id} value={e.id} className="text-black">{e.name}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5 ml-1">Por Data (Início)</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}

                            className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-brand-gold/50 outline-none"
                        />
                    </div>
                    <div className="flex items-end self-end">
                        <button
                            onClick={() => { setFilterEmployee(''); setFilterDate(''); }}
                            className="text-xs font-bold text-gray-500 hover:text-white underline decoration-gray-700 hover:decoration-white transition-all pb-2"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                </div>

                <div className="flex gap-6 pr-4">
                    <div className="text-center">
                        <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Total Horas</p>
                        <p className="text-xl font-black text-brand-gold">{totalHours}h</p>
                    </div>
                    <div className="text-center border-l border-gray-800 pl-6">
                        <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Entregas</p>
                        <p className="text-xl font-black text-white">{totalDeliveries}</p>
                    </div>
                    <div className="text-center border-l border-gray-800 pl-6">
                        <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Média Avalia.</p>
                        <p className="text-xl font-black text-green-500">{avgEvaluation}/5</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredReports.map(report => {
                    const employee = employees.find(e => e.id === report.employeeId);
                    const role = jobRoles.find(jr => jr.id === report.roleId);
                    return (
                        <div key={report.id} className="bg-brand-dark/30 border border-gray-800 rounded-2xl p-6 hover:border-brand-gold/30 transition-all flex flex-col md:flex-row gap-6 relative group">
                            <button
                                onClick={() => handleDelete(report.id)}
                                className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                title="Excluir Relatório"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                            <div className="md:w-48 flex-shrink-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <img src={employee?.avatarUrl} className="w-10 h-10 rounded-full border border-gray-700" alt="" />
                                    <div>
                                        <p className="text-sm font-bold text-white leading-tight">{employee?.name}</p>
                                        <p className="text-[10px] text-brand-gold uppercase font-black">{role?.name || 'Cargo N/D'}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Semana</p>
                                    <p className="text-xs text-gray-300">{new Date(report.weekStartDate).toLocaleDateString()} - {new Date(report.weekEndDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-5 rounded-2xl border border-gray-800/50">
                                <div>
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <BriefcaseIcon className="w-3 h-3 text-brand-gold" />
                                        Atividades & Projectos
                                    </h4>
                                    <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed italic">"{report.projectsWorked}"</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Horas Faturadas</p>
                                        <p className="text-lg font-black text-white">{report.hoursWorked}h</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Entregas</p>
                                        <p className="text-lg font-black text-white">{report.deliveriesMade}</p>
                                    </div>
                                    <div className="col-span-2 grid grid-cols-3 gap-2 mt-2">
                                        <div className="text-center bg-gray-900/50 p-2 rounded-lg">
                                            <p className="text-[8px] text-gray-600 font-bold uppercase mb-1">Dificuldade</p>
                                            <p className="text-xs font-black text-white">{report.difficultyLevel}/5</p>
                                        </div>
                                        <div className="text-center bg-gray-900/50 p-2 rounded-lg">
                                            <p className="text-[8px] text-gray-600 font-bold uppercase mb-1">Self-Eval</p>
                                            <p className="text-xs font-black text-green-500">{report.selfEvaluation}/5</p>
                                        </div>
                                        <div className="text-center bg-gray-900/50 p-2 rounded-lg">
                                            <p className="text-[8px] text-gray-600 font-bold uppercase mb-1">Motivação</p>
                                            <p className="text-xs font-black text-blue-400">{report.motivationLevel}/5</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredReports.length === 0 && (
                    <div className="text-center py-20 bg-brand-dark/20 rounded-3xl border border-dashed border-gray-800">
                        <FileTextIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 italic">Nenhum relatório encontrado para os filtros selecionados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const PerformanceTab: React.FC<{ weeklyReports: WeeklyReport[], employees: User[], cultureFeedbacks: CultureFeedback[] }> = ({ weeklyReports, employees, cultureFeedbacks }) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthReports = weeklyReports.filter(r => {
        const d = new Date(r.weekStartDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthReports = weeklyReports.filter(r => {
        const d = new Date(r.weekStartDate);
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    });

    const totalDeliveriesThisMonth = thisMonthReports.reduce((sum, r) => sum + r.deliveriesMade, 0);
    const totalDeliveriesLastMonth = lastMonthReports.reduce((sum, r) => sum + r.deliveriesMade, 0);
    const deliveryDiff = totalDeliveriesLastMonth === 0 ? 0 : Math.round(((totalDeliveriesThisMonth - totalDeliveriesLastMonth) / totalDeliveriesLastMonth) * 100);

    const totalHours = thisMonthReports.reduce((sum, r) => sum + r.hoursWorked, 0);
    const efficiency = totalHours === 0 ? 0 : (totalDeliveriesThisMonth / totalHours).toFixed(2);

    const avgSatisf = cultureFeedbacks.length === 0 ? 0 : (cultureFeedbacks.reduce((sum, f) => sum + f.satisfactionScore, 0) / cultureFeedbacks.length).toFixed(1);

    const empStats = employees.map(emp => {
        const empReports = thisMonthReports.filter(r => r.employeeId === emp.id);
        const deliveries = empReports.reduce((sum, r) => sum + r.deliveriesMade, 0);
        return { emp, deliveries };
    }).sort((a, b) => b.deliveries - a.deliveries);


    const topPerformer = empStats[0]?.emp;
    const topPerformerDeliveries = empStats[0]?.deliveries;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-brand-dark/40 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                    <div className="bg-brand-gold/10 p-3 rounded-xl">
                        <CheckCircleIcon className="w-6 h-6 text-brand-gold" />
                    </div>
                    <div>
                        <p className="text-xs text-brand-gold font-black uppercase tracking-wider">Entregas (Mês)</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-black text-white">{totalDeliveriesThisMonth}</h3>
                            <span className={`text-xs font-bold mb-1 ${deliveryDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {deliveryDiff > 0 ? '+' : ''}{deliveryDiff}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-brand-dark/40 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-xl">
                        <ClockIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-xs text-blue-500 font-black uppercase tracking-wider">Eficiência</p>
                        <h3 className="text-2xl font-black text-white">{efficiency} <span className="text-xs text-gray-500 font-normal">entregas/hora</span></h3>
                    </div>
                </div>

                <div className="bg-brand-dark/40 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                    <div className="bg-green-500/10 p-3 rounded-xl">
                        <HeartIcon className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <p className="text-xs text-green-500 font-black uppercase tracking-wider">Satisfação</p>
                        <h3 className="text-2xl font-black text-white">{avgSatisf} <span className="text-xs text-gray-500 font-normal">/ 5.0</span></h3>
                    </div>
                </div>

                {/* Employee of the Month Card */}
                <div className="bg-gradient-to-br from-brand-gold/20 to-brand-dark border border-brand-gold/30 rounded-2xl p-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-brand-gold text-brand-dark text-[10px] font-black px-2 py-1 rounded-bl-lg">
                        DESTAQUE DO MÊS
                    </div>
                    <div className="h-full bg-brand-dark/80 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4">
                        {topPerformer ? (
                            <>
                                <img src={topPerformer.avatarUrl} className="w-12 h-12 rounded-full border-2 border-brand-gold" alt="" />
                                <div>
                                    <p className="text-sm font-bold text-white leading-tight">{topPerformer.name}</p>
                                    <p className="text-xs text-brand-gold font-bold">{topPerformerDeliveries} Entregas</p>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center w-full h-full text-xs text-gray-500 italic">
                                Sem dados suficientes
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rankings Table */}
                <div className="bg-brand-dark/40 border border-gray-800 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <BarChartIcon className="w-5 h-5 text-brand-gold" />
                        Ranking de Produtividade
                    </h3>
                    <div className="space-y-4">
                        {empStats.map((stat, idx) => (
                            <div key={stat.emp.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-gray-800">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-brand-gold text-brand-dark' : 'bg-gray-800 text-gray-400'}`}>
                                    {idx + 1}
                                </div>
                                <img src={stat.emp.avatarUrl} className="w-10 h-10 rounded-full bg-gray-800" alt="" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white">{stat.emp.name}</p>
                                    <p className="text-xs text-gray-500 uppercase font-bold">{stat.emp.role}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-white">{stat.deliveries}</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase">Entregas</p>
                                </div>
                            </div>
                        ))}
                        {empStats.length === 0 && (
                            <p className="text-center text-gray-500 py-4 italic">Nenhum dado de performance este mês.</p>
                        )}
                    </div>
                </div>

                {/* Culture Feedback Latest */}
                <div className="bg-brand-dark/40 border border-gray-800 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <HeartIcon className="w-5 h-5 text-pink-500" />
                        Feedbacks de Cultura Recentes
                    </h3>
                    <div className="space-y-4">
                        {cultureFeedbacks.slice(0, 5).map(feedback => (
                            <div key={feedback.id} className="bg-black/20 border border-gray-800/50 p-4 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-bold uppercase">
                                        {feedback.anonymous ? 'Anônimo' : employees.find(e => e.id === feedback.employeeId)?.name || 'Desconhecido'}
                                    </span>
                                    <span className="text-[10px] text-gray-600 font-mono">{new Date(feedback.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-300 italic mb-3">"{feedback.feedbackText}"</p>
                                <div className="flex gap-4">
                                    <div className="text-xs">
                                        <span className="text-gray-500 font-bold mr-1">Satisfação:</span>
                                        <span className={`font-black ${feedback.satisfactionScore >= 4 ? 'text-green-500' : 'text-yellow-500'}`}>{feedback.satisfactionScore}/5</span>
                                    </div>
                                    <div className="text-xs">
                                        <span className="text-gray-500 font-bold mr-1">Motivação:</span>
                                        <span className={`font-black ${feedback.motivationScore >= 4 ? 'text-blue-500' : 'text-yellow-500'}`}>{feedback.motivationScore}/5</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {cultureFeedbacks.length === 0 && (
                            <p className="text-center text-gray-500 py-4 italic">Nenhum feedback recebido ainda.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );


};


const AttendanceTab: React.FC<{ attendanceRecords: AttendanceRecord[], employees: User[], onAdd: () => void, removeRecord: any }> = ({ attendanceRecords, employees, onAdd, removeRecord }) => {
    // Helper to calculate presence
    const getEmployeeStats = (employeeId: string) => {
        const records = attendanceRecords.filter(r => r.employeeId === employeeId);
        const absences = records.filter(r => r.type === 'Falta').length;
        const delays = records.filter(r => r.type === 'Atraso').length;
        // Simple mock calculation for presence % based on assumption of 22 work days/month or simply absences count
        // Let's just show counts for now as requested "definitive"
        return { absences, delays, lastRecord: records[0] };
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Controlo de Assiduidade</h2>
                <button
                    onClick={onAdd}
                    className="bg-brand-gold text-brand-dark px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                >
                    <PlusIcon className="w-4 h-4" />
                    Registrar Ausência/Atraso
                </button>
            </div>

            <div className="bg-brand-dark/40 border border-gray-800 rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-black/40 border-b border-gray-800">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Colaborador</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Ausências</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Atrasos</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Último Registo</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Acções</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => {
                            const stats = getEmployeeStats(emp.id);
                            return (
                                <tr key={emp.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={emp.avatarUrl} className="w-8 h-8 rounded-full border border-gray-700" alt="" />
                                            <span className="text-sm font-bold text-white">{emp.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold ${stats.absences > 0 ? 'text-red-400' : 'text-gray-400'}`}>{stats.absences}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold ${stats.delays > 0 ? 'text-yellow-400' : 'text-gray-400'}`}>{stats.delays}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {stats.lastRecord ? (
                                            <span className="text-xs text-gray-300">
                                                {new Date(stats.lastRecord.date).toLocaleDateString()} - {stats.lastRecord.type}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-brand-gold hover:text-white transition-colors text-xs font-bold">Ver Detalhes</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* List of recent records */}
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-8 mb-4">Registos Recentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attendanceRecords.slice(0, 6).map(record => {
                    const employee = employees.find(e => e.id === record.employeeId);
                    return (
                        <div key={record.id} className="bg-brand-dark/40 border border-gray-800 p-4 rounded-xl flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                                {employee && <img src={employee.avatarUrl} className="w-8 h-8 rounded-full" />}
                                <div>
                                    <p className="text-sm font-bold text-white">{employee?.name}</p>
                                    <p className="text-xs text-brand-gold">{record.type} {record.durationMinutes ? `(${record.durationMinutes} min)` : ''}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString()}</p>
                                <button onClick={() => removeRecord(record.id)} className="text-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"><TrashIcon className="w-3 h-3" /></button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
const TrainingTab: React.FC<{ trainings: Training[], employees: User[], onAdd: () => void, removeTraining: any }> = ({ trainings, employees, onAdd, removeTraining }) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Programas de Capacitação</h2>
                <button
                    onClick={onAdd}
                    className="bg-brand-gold text-brand-dark px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                >
                    <PlusIcon className="w-4 h-4" />
                    Novo Treino
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trainings.map(train => (
                    <div key={train.id} className="bg-brand-dark/40 border border-gray-800 rounded-3xl p-6 hover:border-blue-500/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-500/10 p-3 rounded-2xl">
                                <GraduationCapIcon className="w-6 h-6 text-blue-400" />
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${train.status === 'Concluído' ? 'bg-green-500/10 text-green-500' : 'bg-brand-gold/10 text-brand-gold'}`}>
                                {train.status || 'Agendado'}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2">{train.title}</h3>
                        <p className="text-sm text-gray-400 mb-6">{train.description}</p>
                        <p className="text-xs text-gray-500 mb-4">Participante: <span className="text-gray-300">{employees.find(e => e.id === train.employeeId)?.name || 'Todos'}</span></p>

                        <div className="flex items-center justify-between py-4 border-t border-gray-800/50">
                            <div className="flex -space-x-2">
                                {/* Avatars placeholder */}
                            </div>
                            <span className="text-xs text-gray-500 font-bold">{new Date(train.date).toLocaleDateString()}</span>
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-bold transition-all">Detalhes</button>
                            <button
                                onClick={() => removeTraining(train.id)}
                                className="px-3 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CultureTab: React.FC<{ cultureFeedbacks: CultureFeedback[], employees: User[], onAdd: () => void, isAdmin: boolean }> = ({ cultureFeedbacks, employees, onAdd, isAdmin }) => {
    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="bg-gradient-to-br from-brand-dark/60 to-brand-dark/40 border border-gray-800 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-brand-gold/5 blur-[100px] rounded-full"></div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-2xl font-black text-white mb-4">Círculo de Feedback & Cultura</h2>
                    <p className="text-gray-400 text-sm leading-relaxed mb-8">
                        Sua opinião é fundamental para construirmos uma Naralbiza cada vez melhor.
                        Envie seu feedback de forma anónima ou identificada.
                    </p>
                    <button
                        onClick={onAdd}
                        className="bg-brand-gold hover:bg-yellow-600 text-brand-dark px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all transform hover:scale-105"
                    >
                        <HeartIcon className="w-5 h-5 fill-brand-dark" />
                        ENVIAR MEU FEEDBACK
                    </button>
                </div>
            </div>

            {isAdmin && (
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Feedbacks Recentes (Admin View)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cultureFeedbacks.map(cf => (
                            <div key={cf.id} className="bg-brand-dark/30 border border-gray-800 p-5 rounded-2xl">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            {cf.anonymous ? 'Anónimo' : employees.find(e => e.id === cf.employeeId)?.name || 'Usuário Desconhecido'}
                                        </span>
                                    </div>
                                    <span className="text-[9px] text-gray-600 font-bold">{new Date(cf.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-300 italic">"{cf.feedbackText}"</p>
                                <div className="flex gap-4 mt-4 pt-4 border-t border-white/5">
                                    <div className="text-center">
                                        <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Satisfação</p>
                                        <p className="text-xs font-black text-brand-gold">{cf.satisfactionScore}/5</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Motivação</p>
                                        <p className="text-xs font-black text-blue-400">{cf.motivationScore}/5</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const AttendanceModal: React.FC<{ isOpen: boolean, onClose: () => void, onSubmit: (data: any) => Promise<void>, employees: User[] }> = ({ isOpen, onClose, onSubmit, employees }) => {
    const [formData, setFormData] = useState({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Falta',
        reason: '',
        durationMinutes: 0
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({ ...formData, status: 'Pendente' });
        onClose();
        setFormData({ employeeId: '', date: new Date().toISOString().split('T')[0], type: 'Falta', reason: '', durationMinutes: 0 });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-dark/90 border border-gray-800 rounded-3xl p-8 max-w-lg w-full animate-fadeIn">
                <h2 className="text-2xl font-black text-white mb-6">Registrar Assiduidade</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Colaborador</label>
                        <select
                            value={formData.employeeId}
                            onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                            className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                            required
                        >
                            <option value="">Selecione...</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Data</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tipo</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                            >
                                <option value="Falta">Falta</option>
                                <option value="Atraso">Atraso</option>
                                <option value="Saída Antecipada">Saída Antecipada</option>
                                <option value="Presença">Presença (Extra)</option>
                            </select>
                        </div>
                    </div>
                    {(formData.type === 'Atraso' || formData.type === 'Saída Antecipada') && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Duração (minutos)</label>
                            <input
                                type="number"
                                value={formData.durationMinutes}
                                onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                                className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                            />
                        </div>
                    )}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Motivo / Obs</label>
                        <textarea
                            value={formData.reason}
                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                            className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                        />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-800 rounded-xl font-bold text-gray-400 hover:text-white transition-colors">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 bg-brand-gold text-brand-dark rounded-xl font-black hover:bg-yellow-600 transition-colors">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
