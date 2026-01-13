
import React, { useState, useMemo } from 'react';
import { Card } from './common/Card';
import { Modal } from './common/Modal';
import { PlusIcon } from './common/Icon';
import { Report, Employee, SalesReport, CreativeReport, ITReport, HRReport, Lead, CalendarEvent } from '../types';
import { getReportSummary } from '../services/geminiService';
import { formatCurrency } from '../utils';



interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (report: Omit<Report, 'id'>) => void;
    currentUser: Employee;
    employees: Employee[];
    reportToEdit?: Report | null;
    leads: Lead[];
    events: CalendarEvent[];
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSave, currentUser, employees, reportToEdit, leads, events }) => {
    const [reportData, setReportData] = useState<Partial<Report>>({
        employeeId: currentUser.id,
        date: new Date().toISOString().split('T')[0],
        notes: '',
        role: currentUser.role,
        status: 'Pendente',
        ...(reportToEdit || {})
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setReportData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(reportData as Omit<Report, 'id'>);
        onClose();
    };

    const handleAutoFill = () => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        if (currentUser.role === 'Sales' || reportData.role === 'Sales') {
            const recentLeads = leads.filter(l => l.ownerId === currentUser.id && new Date(l.createdAt) > oneWeekAgo).length;
            const convertedLeads = leads.filter(l => l.ownerId === currentUser.id && l.status === 'Fechado' && new Date(l.updatedAt) > oneWeekAgo).length;
            setReportData(prev => ({
                ...prev,
                leadsContacted: recentLeads,
                contractsSigned: convertedLeads,
                nextActions: 'Seguir com leads quentes.'
            }));
        } else if (['Creative', 'Photographer', 'Videomaker'].includes(currentUser.role) || ['Creative', 'Photographer', 'Videomaker'].includes(reportData.role || '')) {
            const recentEvents = events.filter(e => e.responsibleId === currentUser.id && new Date(e.date) > oneWeekAgo).length;
            setReportData(prev => ({
                ...prev,
                projectsShot: `Projetos recentes: ${recentEvents}`,
                hoursOnLocation: recentEvents * 4, // Estimate
                equipmentUsed: 'Câmeras, Luzes',
                nextSteps: 'Edição e entrega.'
            }));
        } else if (currentUser.role === 'IT' || reportData.role === 'IT') {
            setReportData(prev => ({
                ...prev,
                ticketsResolved: 5,
                systemsMaintenance: 'Verificação de servidores.',
                blockers: 'Nenhum.'
            }));
        } else {
            setReportData(prev => ({
                ...prev,
                notes: 'Resumo das atividades da semana.'
            }));
        }
    };

    const renderRoleSpecificFields = () => {
        const role = reportData.role || currentUser.role;
        switch (role) {
            case 'Sales':
                return (
                    <>
                        <input name="leadsContacted" type="number" value={(reportData as Partial<SalesReport>).leadsContacted || ''} onChange={handleInputChange} placeholder="Leads Contactados" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        <input name="salesQualifiedLeads" type="number" value={(reportData as Partial<SalesReport>).salesQualifiedLeads || ''} onChange={handleInputChange} placeholder="Leads Qualificados" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        <input name="salesProposalsSent" type="number" value={(reportData as Partial<SalesReport>).salesProposalsSent || ''} onChange={handleInputChange} placeholder="Propostas Enviadas" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        <input name="contractsSigned" type="number" value={(reportData as Partial<SalesReport>).contractsSigned || ''} onChange={handleInputChange} placeholder="Contratos Assinados" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        <input name="salesRevenue" type="number" value={(reportData as Partial<SalesReport>).salesRevenue || ''} onChange={handleInputChange} placeholder="Receita Gerada (AOA)" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        <input name="salesConversionRate" type="number" step="0.1" value={(reportData as Partial<SalesReport>).salesConversionRate || ''} onChange={handleInputChange} placeholder="Taxa de Conversão (%)" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        <textarea name="nextActions" value={(reportData as Partial<SalesReport>).nextActions || ''} onChange={handleInputChange} placeholder="Próximas Ações" rows={3} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required></textarea>
                    </>
                );
            case 'Creative':
            case 'Photographer':
            case 'Videomaker':
                return (
                    <>
                        <input name="projectsShot" value={(reportData as Partial<CreativeReport>).projectsShot || ''} onChange={handleInputChange} placeholder="Projetos Realizados" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        <input name="hoursOnLocation" type="number" value={(reportData as Partial<CreativeReport>).hoursOnLocation || ''} onChange={handleInputChange} placeholder="Horas em Locação" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        <textarea name="equipmentUsed" value={(reportData as Partial<CreativeReport>).equipmentUsed || ''} onChange={handleInputChange} placeholder="Equipamento Utilizado" rows={2} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                        <textarea name="nextSteps" value={(reportData as Partial<CreativeReport>).nextSteps || ''} onChange={handleInputChange} placeholder="Próximos Passos" rows={3} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required></textarea>
                    </>
                );

            case 'HR':
                return (
                    <>
                        <textarea name="hrEmployees" value={(reportData as Partial<HRReport>).hrEmployees || ''} onChange={handleInputChange} placeholder="Colaboradores" rows={2} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                        <textarea name="hrFreelancers" value={(reportData as Partial<HRReport>).hrFreelancers || ''} onChange={handleInputChange} placeholder="Freelancers" rows={2} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                        <textarea name="hrRoles" value={(reportData as Partial<HRReport>).hrRoles || ''} onChange={handleInputChange} placeholder="Funções" rows={2} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                        <textarea name="hrPerformance" value={(reportData as Partial<HRReport>).hrPerformance || ''} onChange={handleInputChange} placeholder="Avaliação de desempenho" rows={2} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                        <input name="hrPerformanceScore" type="number" min="0" max="100" value={(reportData as Partial<HRReport>).hrPerformanceScore || ''} onChange={handleInputChange} placeholder="Nota de Desempenho (0-100)" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        <textarea name="hrProductivity" value={(reportData as Partial<HRReport>).hrProductivity || ''} onChange={handleInputChange} placeholder="Produtividade" rows={2} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                        <input name="hrProductivityScore" type="number" min="0" max="100" value={(reportData as Partial<HRReport>).hrProductivityScore || ''} onChange={handleInputChange} placeholder="Nota de Produtividade (0-100)" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        <textarea name="hrAbsences" value={(reportData as Partial<HRReport>).hrAbsences || ''} onChange={handleInputChange} placeholder="Faltas" rows={2} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                        <textarea name="hrTraining" value={(reportData as Partial<HRReport>).hrTraining || ''} onChange={handleInputChange} placeholder="Capacitação" rows={2} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                        <textarea name="hrCulture" value={(reportData as Partial<HRReport>).hrCulture || ''} onChange={handleInputChange} placeholder="Cultura & feedback" rows={2} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                    </>
                );
            case 'IT':
                return (
                    <>
                        <input name="ticketsResolved" type="number" value={(reportData as Partial<ITReport>).ticketsResolved || ''} onChange={handleInputChange} placeholder="Tickets Resolvidos" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        <textarea name="systemsMaintenance" value={(reportData as Partial<ITReport>).systemsMaintenance || ''} onChange={handleInputChange} placeholder="Manutenção de Sistemas" rows={3} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                        <textarea name="blockers" value={(reportData as Partial<ITReport>).blockers || ''} onChange={handleInputChange} placeholder="Impedimentos" rows={2} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={reportToEdit ? "Editar Relatório" : "Novo Relatório Semanal"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-end">
                    <button type="button" onClick={handleAutoFill} className="text-xs text-blue-600 hover:underline">Auto-preencher (IA/Dados)</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Área / Cargo</label>
                        <select
                            name="role"
                            value={reportData.role || currentUser.role}
                            onChange={handleInputChange}
                            className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="Sales">Vendas</option>
                            <option value="Creative">Criativo</option>
                            <option value="Photographer">Fotógrafo</option>
                            <option value="Videomaker">Videomaker</option>
                            <option value="HR">RH & Performance</option>
                            <option value="IT">TI</option>
                            <option value="Other">Outros</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Membro da Equipa</label>
                        <select
                            name="employeeId"
                            value={reportData.employeeId || currentUser.id}
                            onChange={handleInputChange}
                            className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {renderRoleSpecificFields()}
                <textarea name="notes" value={reportData.notes} onChange={handleInputChange} placeholder="Notas Gerais" rows={4} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black">Salvar Relatório</button>
                </div>
            </form>
        </Modal>
    );
};

interface ReportCardProps {
    report: Report;
    employee?: Employee;
    onUpdateStatus: (report: Report, status: 'Aprovado' | 'Pendente') => void;
    currentUser: Employee;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, employee, onUpdateStatus, currentUser }) => {
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleGenerateSummary = async () => {
        if (!employee) return;
        setIsLoading(true);
        try {
            const result = await getReportSummary(report, employee);
            setSummary(result);
        } catch (error) {
            setSummary("Erro ao gerar resumo.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderDetails = () => {
        switch (report.role) {
            case 'Sales': return <>
                <p><strong>Leads Contactados:</strong> {report.leadsContacted}</p>
                {report.salesQualifiedLeads !== undefined && <p><strong>Leads Qualificados:</strong> {report.salesQualifiedLeads}</p>}
                {report.salesProposalsSent !== undefined && <p><strong>Propostas Enviadas:</strong> {report.salesProposalsSent}</p>}
                <p><strong>Contratos Assinados:</strong> {report.contractsSigned}</p>
                {report.salesRevenue !== undefined && <p><strong>Receita Gerada:</strong> {formatCurrency(report.salesRevenue)}</p>}
                {report.salesConversionRate !== undefined && <p><strong>Taxa de Conversão:</strong> {report.salesConversionRate}%</p>}
                <p><strong>Próximas Ações:</strong> {report.nextActions}</p>
            </>;
            case 'Creative':
            case 'Photographer':
            case 'Videomaker': return <>
                <p><strong>Projetos Realizados:</strong> {report.projectsShot}</p>
                <p><strong>Horas em Locação:</strong> {report.hoursOnLocation}</p>
                <p><strong>Equipamento:</strong> {report.equipmentUsed}</p>
                <p><strong>Próximos Passos:</strong> {report.nextSteps}</p>
            </>;
            case 'IT': return <>
                <p><strong>Tickets Resolvidos:</strong> {report.ticketsResolved}</p>
                <p><strong>Manutenção:</strong> {report.systemsMaintenance}</p>
                <p><strong>Impedimentos:</strong> {report.blockers}</p>
            </>;
            case 'HR': return <>
                <p><strong>Colaboradores:</strong> {report.hrEmployees}</p>
                <p><strong>Freelancers:</strong> {report.hrFreelancers}</p>
                <p><strong>Funções:</strong> {report.hrRoles}</p>
                <p><strong>Avaliação de desempenho:</strong> {report.hrPerformance} {report.hrPerformanceScore !== undefined && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full ml-1">Nota: {report.hrPerformanceScore}</span>}</p>
                <p><strong>Produtividade:</strong> {report.hrProductivity} {report.hrProductivityScore !== undefined && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-1">Nota: {report.hrProductivityScore}</span>}</p>
                <p><strong>Faltas:</strong> {report.hrAbsences}</p>
                <p><strong>Capacitação:</strong> {report.hrTraining}</p>
                <p><strong>Cultura & feedback:</strong> {report.hrCulture}</p>
            </>;

            default: return null;
        }
    };

    return (
        <Card className="flex flex-col">
            <div className="flex justify-between items-start">
                <div>
                    {employee && <div className="flex items-center gap-2 mb-2">
                        <img src={employee.avatarUrl} alt={employee.name} className="w-8 h-8 rounded-full" />
                        <div>
                            <p className="font-semibold text-brand-dark dark:text-gray-100">{employee.name}</p>
                            <p className="text-xs text-brand-secondary dark:text-gray-400">{new Date(report.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>}
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${report.status === 'Aprovado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {report.status}
                </span>
            </div>

            <div className={`mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-2 flex-grow ${!isExpanded ? 'max-h-24 overflow-hidden' : ''}`}>
                {renderDetails()}
                <p><strong>Notas:</strong> {report.notes}</p>
            </div>

            <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm text-blue-600 hover:underline mt-2 text-left">
                {isExpanded ? 'Mostrar menos' : 'Mostrar mais'}
            </button>

            {summary && <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                <h5 className="font-bold mb-1">Resumo por IA:</h5>
                <p>{summary}</p>
            </div>}

            <div className="border-t dark:border-gray-700 mt-4 pt-4 flex justify-between items-center">
                <button onClick={handleGenerateSummary} disabled={isLoading} className="text-sm px-3 py-1.5 rounded-md bg-brand-dark text-white hover:bg-black disabled:bg-gray-400">
                    {isLoading ? 'Gerando...' : 'Gerar Resumo com IA'}
                </button>
                {currentUser?.isAdmin && (
                    <select value={report.status} onChange={(e) => onUpdateStatus(report, e.target.value as any)} className="text-sm p-1.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md">
                        <option value="Pendente">Pendente</option>
                        <option value="Aprovado">Aprovado</option>
                    </select>
                )}
            </div>
        </Card>
    );
};

interface ReportsProps {
    reports: Report[];
    employees: Employee[];
    currentUser: Employee;
    onAddReport: (report: Omit<Report, 'id'>) => void;
    onUpdateReport: (report: Report) => void;
    leads: Lead[];
    events: CalendarEvent[];
}

/**
 * Reports page component.
 * Displays reports from employees, allows creation of new reports,
 * and integrates with Gemini for AI-powered summaries.
 */
export const Reports: React.FC<ReportsProps> = ({ reports, employees, currentUser, onAddReport, onUpdateReport, leads, events }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reportToEdit, setReportToEdit] = useState<Report | null>(null);
    const [employeeFilter, setEmployeeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'Pendente' | 'Aprovado'>('all');
    const [roleFilter, setRoleFilter] = useState('all');

    const filteredReports = useMemo(() => {
        return reports.filter(r => {
            const employeeMatch = employeeFilter === 'all' || r.employeeId === parseInt(employeeFilter, 10);
            const statusMatch = statusFilter === 'all' || r.status === statusFilter;
            const roleMatch = roleFilter === 'all' || r.role === roleFilter;
            return employeeMatch && statusMatch && roleMatch;
        });
    }, [reports, employeeFilter, statusFilter, roleFilter]);

    const handleUpdateStatus = (report: Report, status: 'Aprovado' | 'Pendente') => {
        onUpdateReport({ ...report, status });
    };

    const handleEditReport = (report: Report) => {
        setReportToEdit(report);
        setIsModalOpen(true);
    };

    const handleSaveReport = (reportData: Omit<Report, 'id'>) => {
        if (reportToEdit) {
            onUpdateReport({ ...reportData, id: reportToEdit.id } as Report);
        } else {
            onAddReport(reportData);
        }
    };

    return (
        <>
            <div className="p-8 dark:bg-gray-900">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <select
                            value={employeeFilter}
                            onChange={e => setEmployeeFilter(e.target.value)}
                            className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="all">Todos os Funcionários</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as any)}
                            className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="all">Todos os Status</option>
                            <option value="Pendente">Pendente</option>
                            <option value="Aprovado">Aprovado</option>
                        </select>
                        <select
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                            className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="all">Todos os Cargos</option>
                            <option value="Sales">Vendas</option>
                            <option value="Creative">Criativo</option>
                            <option value="Photographer">Fotógrafo</option>
                            <option value="Videomaker">Videomaker</option>
                            <option value="IT">TI</option>
                            <option value="Other">Outros</option>
                        </select>
                    </div>
                    <button
                        onClick={() => {
                            setReportToEdit(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-brand-gold text-brand-dark font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-yellow-500 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Novo Relatório
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map(report => (
                        <div key={report.id} className="relative group">
                            <ReportCard
                                report={report}
                                employee={employees.find(e => e.id === report.employeeId)}
                                onUpdateStatus={handleUpdateStatus}
                                currentUser={currentUser}
                            />
                            {/* Allow editing if current user is the author */}
                            {currentUser.id === report.employeeId && report.status === 'Pendente' && (
                                <button
                                    onClick={() => handleEditReport(report)}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-blue-500 text-white p-1 rounded text-xs z-10"
                                >
                                    Editar
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {filteredReports.length === 0 && <p className="text-center text-gray-500 py-12">Nenhum relatório encontrado com os filtros selecionados.</p>}
            </div>

            <ReportModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setReportToEdit(null);
                }}
                onSave={handleSaveReport}
                currentUser={currentUser}
                employees={employees}
                reportToEdit={reportToEdit}
                leads={leads}
                events={events}
            />
        </>
    );
};
