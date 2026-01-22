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
                    <h1 className="text-3xl font-black text-black tracking-tight drop-shadow-sm uppercase">RH & PERFORMANCE</h1>
                    <p className="text-black/60 mt-1 font-bold">Gestão estratégica de pessoas e produtividade</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border-2 border-black/10 rounded-xl pl-10 pr-4 py-2 text-sm text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-brand-gold w-64 transition-all"
                        />
                    </div>
                    <button className="bg-white border-2 border-black/10 p-2.5 rounded-xl hover:bg-black hover:text-white transition-all">
                        <FilterIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-black p-1 rounded-2xl flex flex-wrap gap-1 shadow-2xl">
                {filteredTabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 ${isActive
                                ? 'bg-gold-metallic text-black shadow-lg shadow-brand-gold/40 scale-105'
                                : 'text-white/40 hover:text-white hover:bg-white/10'
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
                {activeTab === 'formulario' && <WeeklyFormTab currentUser={currentUser!} jobRoles={jobRoles} addWeeklyReport={addWeeklyReport} removeWeeklyReport={removeWeeklyReport} employees={employees} isAdmin={isAdmin} weeklyReports={weeklyReports} />}
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
                <div key={emp.id} className="bg-white border-2 border-black/5 rounded-2xl p-5 hover:border-brand-gold transition-all group shadow-sm hover:shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <img
                            src={emp.avatarUrl}
                            alt={emp.name}
                            className="w-14 h-14 rounded-full border-2 border-brand-gold"
                        />
                        <div>
                            <h3 className="font-extrabold text-black group-hover:text-brand-gold transition-colors">{emp.name}</h3>
                            <p className="text-[10px] text-black/40 uppercase tracking-widest font-black">{emp.role}</p>
                        </div>
                    </div>

                    <div className="space-y-3 py-4 border-t border-black/5">
                        <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-black/40 uppercase">Departamento:</span>
                            <span className="text-black">{emp.department || 'Não definido'}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-black/40 uppercase">Contrato:</span>
                            <span className="text-black">{emp.contractType || 'CLT'}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-black/40 uppercase">Admissão:</span>
                            <span className="text-black">{emp.admissionDate ? new Date(emp.admissionDate).toLocaleDateString() : '-'}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedEmployeeToEdit(emp);
                            setIsEmployeeModalOpen(true);
                        }}
                        className="w-full mt-4 py-3 px-4 bg-black text-white hover:bg-gold-metallic hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
            {freelancers.map(free => (
                <div key={free.id} className="bg-white border-2 border-black/5 rounded-2xl p-6 hover:border-brand-gold transition-all group shadow-sm hover:shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center border-2 border-brand-gold text-brand-gold font-black text-xl shadow-lg">
                            {free.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-extrabold text-black group-hover:text-brand-gold transition-colors">{free.name}</h3>
                            <p className="text-[10px] text-brand-gold uppercase tracking-widest font-black">{free.specialty}</p>
                        </div>
                    </div>

                    <div className="space-y-3 py-4 border-t border-black/5">
                        <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-black/40 uppercase">Status:</span>
                            <span className={`flex items-center gap-1.5 ${free.status === 'Ativo' ? 'text-green-600' : 'text-red-600'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${free.status === 'Ativo' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                {free.status}
                            </span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-black/40 uppercase">Taxa/Hora:</span>
                            <span className="text-black">{free.hourlyRate} €</span>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button className="flex-1 py-3 bg-black text-white hover:bg-gold-metallic hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Ver Projetos</button>
                        <button className="px-3 py-3 border-2 border-black/5 hover:border-brand-gold hover:bg-brand-gold/5 rounded-xl transition-all">
                            <EditIcon className="w-4 h-4 text-black" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const JobRolesTab: React.FC<{ jobRoles: JobRole[], onAdd: () => void, onEdit: (r: JobRole) => void, removeJobRole: any }> = ({ jobRoles, onAdd, onEdit, removeJobRole }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
            {jobRoles.map(role => (
                <div key={role.id} className="bg-white border-2 border-black/5 rounded-2xl p-6 hover:border-brand-gold transition-all group shadow-sm hover:shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-black p-3 rounded-2xl border border-brand-gold/30 shadow-lg">
                            <BriefcaseIcon className="w-6 h-6 text-brand-gold" />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-black/40 uppercase font-black tracking-widest">Base</p>
                            <p className="text-sm font-black text-black">{role.baseSalary}€</p>
                        </div>
                    </div>

                    <h3 className="text-lg font-black text-black mb-1 drop-shadow-sm uppercase">{role.name}</h3>
                    <p className="text-[11px] text-black/60 font-bold mb-6 line-clamp-2">{role.description}</p>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5 mt-auto">
                        <div className="bg-black/5 p-3 rounded-xl border border-black/5">
                            <p className="text-[10px] text-black/40 uppercase font-black mb-1">Candidatos</p>
                            <p className="text-sm font-black text-black">12</p>
                        </div>
                        <div className="bg-black/5 p-3 rounded-xl border border-black/5">
                            <p className="text-[10px] text-black/40 uppercase font-black mb-1">Vagas</p>
                            <p className="text-sm font-black text-brand-gold">02</p>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                        <button className="flex-1 py-3 bg-black text-white hover:bg-gold-metallic hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md">Detalhes</button>
                    </div>
                </div>
            ))}

            <button onClick={onAdd} className="bg-white border-2 border-black/10 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-brand-gold hover:bg-brand-gold/5 transition-all text-black/40 hover:text-brand-gold group h-full min-h-[250px] shadow-sm">
                <div className="bg-black p-4 rounded-full group-hover:bg-gold-metallic transition-all shadow-lg">
                    <PlusIcon className="w-8 h-8 text-brand-gold group-hover:text-black" />
                </div>
                <span className="font-extrabold uppercase tracking-widest text-xs">Novo Cargo</span>
            </button>
        </div>
    );
};
const WeeklyFormTab: React.FC<{ currentUser: User, jobRoles: JobRole[], addWeeklyReport: any, removeWeeklyReport: any, employees: User[], isAdmin: boolean, weeklyReports: WeeklyReport[] }> = ({ currentUser, jobRoles, addWeeklyReport, removeWeeklyReport, employees, isAdmin, weeklyReports }) => {
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
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-white border-2 border-black/5 rounded-[32px] p-10 shadow-sm">
                <div className="flex items-center gap-6 mb-10">
                    <div className="bg-black p-4 rounded-2xl border border-brand-gold/30 shadow-xl">
                        <FileTextIcon className="w-8 h-8 text-brand-gold" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-black uppercase tracking-tight">Relatório <span className="text-brand-gold">Semanal</span></h3>
                        <p className="text-black/60 text-sm font-bold">Documente seu progresso e desafios desta semana</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {isAdmin && (
                        <div className="md:col-span-2 bg-black/5 p-6 rounded-2xl border border-black/5 mb-2">
                            <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] ml-1 mb-3 block">Selecionar Colaborador (Admin)</label>
                            <select
                                value={selectedEmployeeId}
                                onChange={e => setSelectedEmployeeId(e.target.value)}
                                className="w-full bg-white border-2 border-black/5 rounded-xl px-6 py-4 text-sm text-black font-black focus:border-brand-gold outline-none transition-all shadow-sm"
                            >
                                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] ml-1 mb-3 block">Cargo/Função nesta semana</label>
                        <select
                            value={formData.roleId}
                            onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                            className="w-full bg-black/5 border-2 border-transparent rounded-xl px-6 py-4 text-sm text-black font-black focus:border-brand-gold focus:bg-white outline-none transition-all appearance-none"
                        >
                            <option value="">Selecione o cargo...</option>
                            {jobRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] ml-1 mb-3 block">Data de Início da Semana</label>
                        <input
                            type="date"
                            value={formData.weekStartDate}
                            onChange={e => setFormData({ ...formData, weekStartDate: e.target.value })}
                            className="w-full bg-black/5 border-2 border-transparent rounded-xl px-6 py-4 text-sm text-black font-black focus:border-brand-gold focus:bg-white outline-none transition-all"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] ml-1 mb-3 block">Projectos Trabalhados (Vídeos/Sessões)</label>
                        <textarea
                            value={formData.projectsWorked}
                            onChange={e => setFormData({ ...formData, projectsWorked: e.target.value })}
                            className="w-full bg-black/5 border-2 border-transparent rounded-2xl px-6 py-4 text-sm text-black font-bold focus:border-brand-gold focus:bg-white outline-none min-h-[140px] resize-none transition-all"
                            placeholder="Descreva os projectos e o status de cada um..."
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] ml-1 mb-3 block">Total de Horas Faturáveis</label>
                        <input
                            type="number"
                            value={formData.hoursWorked}
                            onChange={e => setFormData({ ...formData, hoursWorked: parseInt(e.target.value) || 0 })}
                            className="w-full bg-black/5 border-2 border-transparent rounded-xl px-6 py-4 text-sm text-black font-black focus:border-brand-gold focus:bg-white outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] ml-1 mb-3 block">Entregas Finalizadas</label>
                        <input
                            type="number"
                            value={formData.deliveriesMade}
                            onChange={e => setFormData({ ...formData, deliveriesMade: parseInt(e.target.value) || 0 })}
                            className="w-full bg-black/5 border-2 border-transparent rounded-xl px-6 py-4 text-sm text-black font-black focus:border-brand-gold focus:bg-white outline-none transition-all"
                        />
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-black/5 mt-4">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] block">Nível de Dificuldade</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(v => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, difficultyLevel: v })}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black transition-all shadow-sm ${formData.difficultyLevel === v ? 'bg-black text-white scale-110 shadow-lg' : 'bg-black/5 text-black/40 hover:bg-black/10'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] block">Auto-Avaliação</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(v => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, selfEvaluation: v })}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black transition-all shadow-sm ${formData.selfEvaluation === v ? 'bg-green-600 text-white scale-110 shadow-lg' : 'bg-black/5 text-black/40 hover:bg-black/10'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] block">Motivação</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(v => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, motivationLevel: v })}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black transition-all shadow-sm ${formData.motivationLevel === v ? 'bg-brand-gold text-black scale-110 shadow-lg' : 'bg-black/5 text-black/40 hover:bg-black/10'}`}
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
                            className={`w-full bg-gold-metallic text-black py-6 rounded-2xl font-black text-sm uppercase tracking-[0.3em] shadow-xl shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Enviando...' : 'Submeter Relatório Semanal'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-4 mt-12">
                <h3 className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] ml-2">Seus Relatórios Recentes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myReports.length === 0 ? (
                        <div className="md:col-span-2 text-black/30 text-[10px] font-black uppercase tracking-widest bg-white/50 border-2 border-dashed border-black/5 p-12 rounded-3xl text-center italic">
                            Nenhum relatório encontrado para este período.
                        </div>
                    ) : (
                        myReports.map(report => (
                            <div key={report.id} className="bg-white border-2 border-black/5 rounded-[32px] p-8 hover:border-brand-gold transition-all shadow-sm group">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-3">
                                        <CalendarIcon className="w-5 h-5 text-brand-gold" />
                                        <p className="text-xs font-black text-black uppercase tracking-tight">
                                            Semana de {new Date(report.weekStartDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="text-right">
                                            <p className="text-[9px] text-black/40 font-black uppercase tracking-widest mb-1">Entregas</p>
                                            <p className="text-sm font-black text-black">{report.deliveriesMade}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-black/40 font-black uppercase tracking-widest mb-1">Horas</p>
                                            <p className="text-sm font-black text-brand-gold">{report.hoursWorked}h</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black/5 p-6 rounded-2xl border border-black/5 mb-8">
                                    <p className="text-[9px] text-black/40 font-black uppercase tracking-[0.2em] mb-3">Resumo dos Projectos</p>
                                    <p className="text-sm text-black/80 font-bold italic leading-relaxed whitespace-pre-line">{report.projectsWorked}</p>
                                </div>

                                <div className="flex justify-between items-center pt-8 border-t border-black/5">
                                    <div className="flex gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-black/40 font-black uppercase tracking-[0.2em] mb-1">Avaliação</span>
                                            <span className={`text-xs font-black ${report.selfEvaluation >= 4 ? 'text-green-600' : 'text-brand-gold'}`}>{report.selfEvaluation}/5</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-black/40 font-black uppercase tracking-[0.2em] mb-1">Dificuldade</span>
                                            <span className="text-xs font-black text-black">{report.difficultyLevel}/5</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-black/40 font-black uppercase tracking-[0.2em] mb-1">Motivação</span>
                                            <span className="text-xs font-black text-brand-gold">{report.motivationLevel}/5</span>
                                        </div>
                                    </div>
                                    <button onClick={() => removeWeeklyReport(report.id)} className="text-red-500 hover:scale-125 transition-all p-2 opacity-0 group-hover:opacity-100"><TrashIcon className="w-5 h-5" /></button>
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
    const [filterEmployeeId, setFilterEmployeeId] = useState('all');
    const [filterDate, setFilterDate] = useState('');

    const filteredReports = useMemo(() => {
        return weeklyReports.filter(r => {
            const matchesEmployee = filterEmployeeId === 'all' ? true : r.employeeId === filterEmployeeId;
            const reportDate = r.weekStartDate.split('T')[0];
            const filterDateStr = filterDate.split('T')[0];
            const matchesDate = filterDate ? reportDate === filterDateStr : true;
            return matchesEmployee && matchesDate;
        }).sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());
    }, [weeklyReports, filterEmployeeId, filterDate]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Excluir este relatório definitivamente?')) {
            await removeWeeklyReport(id);
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white border-2 border-black/5 p-10 rounded-[40px] shadow-sm">
                <div className="flex-1 w-full lg:w-auto">
                    <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] block mb-3 ml-1">Filtrar por Colaborador</label>
                    <select
                        value={filterEmployeeId}
                        onChange={e => setFilterEmployeeId(e.target.value)}
                        className="w-full bg-black/5 border-2 border-transparent rounded-2xl px-6 py-4 text-sm text-black font-black focus:border-brand-gold focus:bg-white outline-none transition-all shadow-inner"
                    >
                        <option value="all">Todos os Colaboradores</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 w-full lg:w-auto">
                    <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] block mb-3 ml-1">Data de Início</label>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        className="w-full bg-black/5 border-2 border-transparent rounded-2xl px-6 py-4 text-sm text-black font-black focus:border-brand-gold focus:bg-white outline-none transition-all shadow-inner"
                    />
                </div>
                <button
                    onClick={() => { setFilterEmployeeId('all'); setFilterDate(''); }}
                    className="h-[60px] px-8 text-[10px] font-black text-black/40 hover:text-black uppercase tracking-widest underline decoration-brand-gold decoration-4 underline-offset-8 transition-all self-end mb-1"
                >
                    Limpar Filtros
                </button>

                <div className="flex gap-12 lg:pl-12 lg:border-l-2 lg:border-black/5">
                    <div className="text-center">
                        <p className="text-[9px] text-black/40 font-black uppercase tracking-[0.2em] mb-2">Total Horas</p>
                        <p className="text-2xl font-black text-brand-gold">{filteredReports.reduce((acc, r) => acc + r.hoursWorked, 0)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] text-black/40 font-black uppercase tracking-[0.2em] mb-2">Entregas</p>
                        <p className="text-2xl font-black text-black">{filteredReports.reduce((acc, r) => acc + r.deliveriesMade, 0)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredReports.length === 0 ? (
                    <div className="text-center py-20 bg-black/5 rounded-[40px] border-2 border-dashed border-black/5">
                        <FileTextIcon className="w-12 h-12 text-black/10 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">Nenhum relatório encontrado</p>
                    </div>
                ) : (
                    filteredReports.map(report => {
                        const employee = employees.find(e => e.id === report.employeeId);
                        const role = jobRoles.find(jr => jr.id === report.roleId);
                        return (
                            <div key={report.id} className="bg-white border-2 border-black/5 rounded-[32px] p-8 hover:border-brand-gold transition-all flex flex-col lg:flex-row gap-8 relative group shadow-sm hover:shadow-xl">
                                <div className="flex-1 border-r border-black/5 pr-8">
                                    <div className="flex items-center gap-5 mb-6">
                                        <img src={employee?.avatarUrl} className="w-14 h-14 rounded-full border-4 border-black/5 shadow-md" alt="" />
                                        <div>
                                            <p className="text-lg font-black text-black uppercase tracking-tight leading-none mb-1">{employee?.name}</p>
                                            <p className="text-[10px] text-brand-gold font-black uppercase tracking-widest">{role?.name || 'Cargo N/D'}</p>
                                        </div>
                                    </div>
                                    <div className="bg-black/5 p-6 rounded-2xl border border-black/5">
                                        <p className="text-[9px] text-black/40 font-black uppercase tracking-[0.2em] mb-3">Projectos Reportados</p>
                                        <p className="text-sm text-black font-bold italic leading-relaxed whitespace-pre-line">"{report.projectsWorked}"</p>
                                    </div>
                                </div>

                                <div className="w-full lg:w-72 flex flex-col justify-between">
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-black text-white p-5 rounded-2xl shadow-lg">
                                            <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Horas</p>
                                            <p className="text-xl font-black text-white">{report.hoursWorked}h</p>
                                        </div>
                                        <div className="bg-black text-white p-5 rounded-2xl shadow-lg">
                                            <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Entregas</p>
                                            <p className="text-xl font-black text-brand-gold">{report.deliveriesMade}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-2">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-black/40">Avaliação</span>
                                            <span className={report.selfEvaluation >= 4 ? 'text-green-600' : 'text-brand-gold'}>{report.selfEvaluation}/5</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${report.selfEvaluation >= 4 ? 'bg-green-600' : 'bg-brand-gold'}`} style={{ width: `${(report.selfEvaluation / 5) * 100}%` }}></div>
                                        </div>

                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mt-4">
                                            <span className="text-black/40">Data</span>
                                            <span className="text-black">{new Date(report.weekStartDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <button onClick={() => handleDelete(report.id)} className="absolute top-8 right-8 text-black/10 hover:text-red-500 transition-all hover:scale-125"><TrashIcon className="w-6 h-6" /></button>
                                </div>
                            </div>
                        );
                    })
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
                <div className="bg-white border-2 border-black/5 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                    <div className="bg-black p-3 rounded-xl border border-brand-gold/30 shadow-lg">
                        <CheckCircleIcon className="w-6 h-6 text-brand-gold" />
                    </div>
                    <div>
                        <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">Entregas (Mês)</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-black text-black">{totalDeliveriesThisMonth}</h3>
                            <span className={`text-[10px] font-black mb-1 drop-shadow-sm ${deliveryDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {deliveryDiff > 0 ? '+' : ''}{deliveryDiff}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-black/5 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                    <div className="bg-black p-3 rounded-xl border border-black/5 shadow-lg">
                        <ClockIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">Eficiência</p>
                        <h3 className="text-2xl font-black text-black">{efficiency} <span className="text-[10px] text-black/30 font-bold lowercase">entregas/hora</span></h3>
                    </div>
                </div>

                <div className="bg-white border-2 border-black/5 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                    <div className="bg-black p-3 rounded-xl border border-black/5 shadow-lg">
                        <HeartIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">Satisfação</p>
                        <h3 className="text-2xl font-black text-black">{avgSatisf} <span className="text-[10px] text-black/30 font-bold">/ 5.0</span></h3>
                    </div>
                </div>

                {/* Employee of the Month Card */}
                <div className="bg-black border-2 border-brand-gold rounded-2xl p-1 relative overflow-hidden group shadow-xl">
                    <div className="absolute top-0 right-0 bg-gold-metallic text-black text-[10px] font-black px-3 py-1 rounded-bl-lg shadow-sm">
                        DESTAQUE DO MÊS
                    </div>
                    <div className="h-full bg-black/40 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4">
                        {topPerformer ? (
                            <>
                                <img src={topPerformer.avatarUrl} className="w-12 h-12 rounded-full border-2 border-brand-gold shadow-lg shadow-brand-gold/20" alt="" />
                                <div>
                                    <p className="text-sm font-black text-white leading-tight uppercase tracking-tight">{topPerformer.name}</p>
                                    <p className="text-[10px] text-brand-gold font-black uppercase tracking-widest">{topPerformerDeliveries} Entregas</p>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center w-full h-full text-[10px] text-white/30 font-black uppercase italic">
                                Sem dados suficientes
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rankings Table */}
                <div className="bg-white border-2 border-black/5 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-black text-black mb-6 flex items-center gap-2 uppercase tracking-widest">
                        <BarChartIcon className="w-5 h-5 text-brand-gold" />
                        Ranking de Produtividade
                    </h3>
                    <div className="space-y-4">
                        {empStats.map((stat, idx) => (
                            <div key={stat.emp.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 transition-all border border-transparent hover:border-black/5 shadow-sm hover:shadow-md">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-md ${idx === 0 ? 'bg-gold-metallic text-black' : 'bg-black text-white'}`}>
                                    {idx + 1}
                                </div>
                                <img src={stat.emp.avatarUrl} className="w-10 h-10 rounded-full border border-black/5 shadow-sm" alt="" />
                                <div className="flex-1">
                                    <p className="text-sm font-black text-black uppercase tracking-tight">{stat.emp.name}</p>
                                    <p className="text-[9px] text-black/40 uppercase font-black tracking-widest">{stat.emp.role}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-black">{stat.deliveries}</p>
                                    <p className="text-[9px] text-black/40 font-black uppercase tracking-widest">Entregas</p>
                                </div>
                            </div>
                        ))}
                        {empStats.length === 0 && (
                            <p className="text-center text-black/30 py-8 font-black uppercase text-[10px] italic">Nenhum dado de performance este mês.</p>
                        )}
                    </div>
                </div>

                {/* Culture Feedback Latest */}
                <div className="bg-white border-2 border-black/5 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-black text-black mb-6 flex items-center gap-2 uppercase tracking-widest">
                        <HeartIcon className="w-5 h-5 text-black" />
                        Feedbacks de Cultura Recentes
                    </h3>
                    <div className="space-y-4">
                        {cultureFeedbacks.slice(0, 5).map(feedback => (
                            <div key={feedback.id} className="bg-black/5 border border-black/5 p-5 rounded-2xl group hover:shadow-lg transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[9px] bg-black text-white px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm group-hover:bg-gold-metallic group-hover:text-black transition-all">
                                        {feedback.anonymous ? 'Anônimo' : employees.find(e => e.id === feedback.employeeId)?.name || 'Desconhecido'}
                                    </span>
                                    <span className="text-[9px] text-black/30 font-black">{new Date(feedback.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-black/80 font-bold italic mb-4">"{feedback.feedbackText}"</p>
                                <div className="flex gap-6 pt-3 border-t border-black/5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-black/40 font-black uppercase tracking-widest mb-1">Satisfação</span>
                                        <span className={`text-xs font-black ${feedback.satisfactionScore >= 4 ? 'text-green-600' : 'text-brand-gold'}`}>{feedback.satisfactionScore}/5</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-black/40 font-black uppercase tracking-widest mb-1">Motivação</span>
                                        <span className={`text-xs font-black ${feedback.motivationScore >= 4 ? 'text-black' : 'text-brand-gold'}`}>{feedback.motivationScore}/5</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {cultureFeedbacks.length === 0 && (
                            <p className="text-center text-black/30 py-8 font-black uppercase text-[10px] italic">Nenhum feedback recebido ainda.</p>
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
                <h2 className="text-xl font-black text-black uppercase tracking-tight">Controlo de Assiduidade</h2>
                <button
                    onClick={onAdd}
                    className="bg-gold-metallic text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:shadow-brand-gold/20 transition-all"
                >
                    <PlusIcon className="w-4 h-4" />
                    Registrar Ausência
                </button>
            </div>

            <div className="bg-white border-2 border-black/5 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-black border-b border-black">
                            <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">Colaborador</th>
                            <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Ausências</th>
                            <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Atrasos</th>
                            <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest">Último Registo</th>
                            <th className="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest text-right">Acções</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => {
                            const stats = getEmployeeStats(emp.id);
                            return (
                                <tr key={emp.id} className="border-b border-black/5 hover:bg-black/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={emp.avatarUrl} className="w-9 h-9 rounded-full border-2 border-black/5" alt="" />
                                            <span className="text-sm font-black text-black uppercase tracking-tight">{emp.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-sm font-black ${stats.absences > 0 ? 'text-red-600' : 'text-black/20'}`}>{stats.absences}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-sm font-black ${stats.delays > 0 ? 'text-brand-gold' : 'text-black/20'}`}>{stats.delays}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {stats.lastRecord ? (
                                            <span className="text-[10px] text-black/60 font-bold uppercase tracking-wider">
                                                {new Date(stats.lastRecord.date).toLocaleDateString()} — {stats.lastRecord.type}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-black/20 font-black tracking-widest">NADA</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-black font-black hover:text-brand-gold transition-colors text-[10px] uppercase tracking-widest underline decoration-brand-gold decoration-2 underline-offset-4">Ver Detalhes</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* List of recent records */}
            <h3 className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mt-12 mb-4 ml-1">Registos Recentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attendanceRecords.slice(0, 6).map(record => {
                    const employee = employees.find(e => e.id === record.employeeId);
                    return (
                        <div key={record.id} className="bg-white border-2 border-black/5 p-4 rounded-2xl flex justify-between items-center group shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                {employee && <img src={employee.avatarUrl} className="w-10 h-10 rounded-full border-2 border-black/5" alt="" />}
                                <div>
                                    <p className="text-xs font-black text-black uppercase tracking-tight">{employee?.name}</p>
                                    <p className="text-[10px] text-brand-gold font-black uppercase tracking-widest">{record.type} {record.durationMinutes ? `(${record.durationMinutes} min)` : ''}</p>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                                <p className="text-[9px] text-black/30 font-black">{new Date(record.date).toLocaleDateString()}</p>
                                <button onClick={() => removeRecord(record.id)} className="text-red-500 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
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
                <h2 className="text-xl font-black text-black uppercase tracking-tight">Capacitação & Treinos</h2>
                <button
                    onClick={onAdd}
                    className="bg-gold-metallic text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:shadow-brand-gold/20 transition-all"
                >
                    <PlusIcon className="w-4 h-4" />
                    Novo Programa
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trainings.map(train => (
                    <div key={train.id} className="bg-white border-2 border-black/5 rounded-3xl p-8 hover:border-brand-gold transition-all shadow-sm group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-black p-4 rounded-2xl border border-brand-gold/30 shadow-xl group-hover:bg-gold-metallic group-hover:text-black transition-all">
                                <GraduationCapIcon className="w-7 h-7 text-brand-gold group-hover:text-black" />
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${train.status === 'Concluído' ? 'bg-green-100 text-green-700' : 'bg-gold-metallic text-black'}`}>
                                {train.status || 'Agendado'}
                            </span>
                        </div>

                        <h3 className="text-lg font-black text-black mb-2 uppercase drop-shadow-sm">{train.title}</h3>
                        <p className="text-sm text-black/60 font-bold mb-8 leading-relaxed">{train.description}</p>

                        <div className="flex items-center gap-2 mb-6 p-3 bg-black/5 rounded-xl border border-black/5">
                            <span className="text-[10px] text-black/40 font-black uppercase tracking-widest">Participante:</span>
                            <span className="text-xs font-black text-black uppercase">{employees.find(e => e.id === train.employeeId)?.name || 'Todos'}</span>
                        </div>

                        <div className="flex items-center justify-between py-6 border-t border-black/5">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-brand-gold" />
                                <span className="text-xs font-black text-black uppercase tracking-wider">{new Date(train.date).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-2">
                            <button className="flex-1 py-4 bg-black text-white hover:bg-brand-gold hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md">Ver Conteúdo</button>
                            <button
                                onClick={() => removeTraining(train.id)}
                                className="px-5 py-4 border-2 border-red-50/50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm"
                            >
                                <TrashIcon className="w-5 h-5" />
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
            <div className="bg-black border-2 border-brand-gold rounded-[40px] p-12 relative overflow-hidden shadow-2xl">
                <div className="absolute right-[-5%] top-[-5%] w-96 h-96 bg-brand-gold/10 blur-[120px] rounded-full"></div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tight leading-tight">Círculo de Feedback <span className="text-brand-gold">& Cultura</span></h2>
                    <p className="text-white/60 text-base font-bold leading-relaxed mb-10 max-w-lg">
                        Sua voz molda o futuro da Naralbiza.
                        Compartilhe suas ideias, críticas e sentimentos para evoluirmos juntos.
                    </p>
                    <button
                        onClick={onAdd}
                        className="bg-gold-metallic hover:scale-110 active:scale-95 text-black px-12 py-5 rounded-2xl font-black text-sm flex items-center gap-3 transition-all shadow-[0_0_50px_rgba(197,160,89,0.3)] uppercase tracking-[0.2em]"
                    >
                        <HeartIcon className="w-5 h-5 fill-black" />
                        ENVIAR FEEDBACK
                    </button>
                </div>
            </div>

            {isAdmin && (
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] ml-2">Mural de Transparência (Admin)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cultureFeedbacks.map(cf => (
                            <div key={cf.id} className="bg-white border-2 border-black/5 p-6 rounded-[32px] group hover:border-brand-gold transition-all shadow-sm">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-brand-gold shadow-[0_0_10px_rgba(197,160,89,0.5)]"></div>
                                        <span className="text-[10px] font-black text-black uppercase tracking-widest">
                                            {cf.anonymous ? 'Anónimo' : employees.find(e => e.id === cf.employeeId)?.name || 'Usuário Desconhecido'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-black/20 font-black">{new Date(cf.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-black/80 font-bold italic leading-relaxed mb-8">"{cf.feedbackText}"</p>
                                <div className="flex gap-8 mt-6 pt-6 border-t border-black/5">
                                    <div className="flex flex-col">
                                        <p className="text-[9px] text-black/40 font-black uppercase tracking-[0.2em] mb-1">Satisfação</p>
                                        <p className="text-sm font-black text-brand-gold">{cf.satisfactionScore}/5</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[9px] text-black/40 font-black uppercase tracking-[0.2em] mb-1">Motivação</p>
                                        <p className="text-sm font-black text-black">{cf.motivationScore}/5</p>
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
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-brand-gold rounded-[40px] p-10 max-w-lg w-full animate-scaleIn shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-black uppercase tracking-tight">Registrar <span className="text-brand-gold">Presença</span></h2>
                    <div className="bg-black/5 p-2 px-4 rounded-full text-[10px] font-black uppercase text-black/40">RH-V2</div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] block mb-2 ml-1">Colaborador</label>
                        <select
                            value={formData.employeeId}
                            onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                            className="w-full bg-black/5 border-2 border-transparent rounded-[20px] px-6 py-4 text-sm text-black font-bold focus:outline-none focus:border-brand-gold focus:bg-white transition-all appearance-none"
                            required
                        >
                            <option value="">Selecione o membro...</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] block mb-2 ml-1">Data</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-black/5 border-2 border-transparent rounded-[20px] px-6 py-4 text-sm text-black font-black focus:outline-none focus:border-brand-gold focus:bg-white transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] block mb-2 ml-1">Tipo</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-black/5 border-2 border-transparent rounded-[20px] px-6 py-4 text-sm text-black font-black focus:outline-none focus:border-brand-gold focus:bg-white transition-all appearance-none"
                            >
                                <option value="Falta">Falta</option>
                                <option value="Atraso">Atraso</option>
                                <option value="Saída Antecipada">Saída Antecipada</option>
                                <option value="Presença">Presença (Extra)</option>
                            </select>
                        </div>
                    </div>

                    {(formData.type === 'Atraso' || formData.type === 'Saída Antecipada') && (
                        <div className="animate-slideDown">
                            <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] block mb-2 ml-1">Duração (minutos)</label>
                            <input
                                type="number"
                                value={formData.durationMinutes}
                                onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                                className="w-full bg-black/5 border-2 border-transparent rounded-[20px] px-6 py-4 text-sm text-black font-black focus:outline-none focus:border-brand-gold focus:bg-white transition-all"
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] block mb-2 ml-1">Motivo / Notas</label>
                        <textarea
                            value={formData.reason}
                            placeholder="Descreva o motivo..."
                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                            className="w-full bg-black/5 border-2 border-transparent rounded-[24px] px-6 py-4 text-sm text-black font-bold min-h-[120px] focus:outline-none focus:border-brand-gold focus:bg-white transition-all resize-none"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-5 bg-black/5 rounded-[22px] font-black text-[10px] uppercase tracking-widest text-black/40 hover:bg-red-50 hover:text-red-500 transition-all">Cancelar</button>
                        <button type="submit" className="flex-1 py-5 bg-gold-metallic text-black rounded-[22px] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-brand-gold/20 hover:scale-105 active:scale-95 transition-all">SALVAR REGISTO</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
