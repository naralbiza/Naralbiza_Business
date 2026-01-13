import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { QualityChecklist, ClientApproval, Revision, ChecklistStatus, ApprovalStatus, ProductionProject } from '../types';
import { PlusIcon, CheckIcon, CheckCircleIcon, CloseIcon, XCircleIcon, ClockIcon, EditIcon, TrashIcon, CheckSquareIcon, FileTextIcon, AlertCircleIcon, ExternalLinkIcon } from './common/Icon';
import { Modal } from './common/Modal';

export const Quality: React.FC = () => {
    const {
        qualityChecklists, addQualityChecklist, updateQualityChecklistData, removeQualityChecklist,
        clientApprovals, addClientApproval, updateClientApprovalData, removeClientApproval,
        revisions, addRevision,
        productionProjects, clients
    } = useData();
    const { currentUser } = useAuth();

    const [activeTab, setActiveTab] = useState<'dashboard' | 'checklists' | 'approvals' | 'revisions'>('dashboard');

    // Modals
    const [showChecklistModal, setShowChecklistModal] = useState(false);
    const [checklistForm, setChecklistForm] = useState<Partial<QualityChecklist>>({});

    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalForm, setApprovalForm] = useState<Partial<ClientApproval>>({});

    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [revisionForm, setRevisionForm] = useState<Partial<Revision>>({});

    // -- Checklists --
    const handleSaveChecklist = async () => {
        if (!checklistForm.title) return alert('Título é obrigatório');

        try {
            if (checklistForm.id) {
                await updateQualityChecklistData(checklistForm as QualityChecklist);
            } else {
                await addQualityChecklist({
                    title: checklistForm.title!,
                    description: checklistForm.description || '',
                    projectId: checklistForm.projectId,
                    items: checklistForm.items || [],
                    status: ChecklistStatus.Draft,
                    createdBy: currentUser?.id || ''
                });
            }
            setShowChecklistModal(false);
            setChecklistForm({});
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar checklist');
        }
    };

    const handleAddItem = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const text = e.currentTarget.value;
            if (!text) return;
            const newItem = { id: crypto.randomUUID(), text, completed: false };
            setChecklistForm(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
            e.currentTarget.value = '';
        }
    };

    const deleteItem = (itemId: string) => {
        setChecklistForm(prev => ({ ...prev, items: prev.items?.filter(i => i.id !== itemId) }));
    };

    // -- Approvals --
    const handleSaveApproval = async () => {
        if (!approvalForm.title || !approvalForm.clientId) return alert('Preencha os campos obrigatórios');

        try {
            if (approvalForm.id) {
                await updateClientApprovalData(approvalForm as ClientApproval);
            } else {
                await addClientApproval({
                    title: approvalForm.title!,
                    description: approvalForm.description || '',
                    projectId: approvalForm.projectId,
                    clientId: approvalForm.clientId,
                    linkToDeliverable: approvalForm.linkToDeliverable || '',
                    status: ApprovalStatus.Pending,
                    sentDate: new Date().toISOString(),
                    requestedBy: currentUser?.id || ''
                });
            }
            setShowApprovalModal(false);
            setApprovalForm({});
        } catch (e) {
            console.error(e);
            alert('Erro ao criar aprovação');
        }
    };

    // -- Revisions --
    const handleSaveRevision = async () => {
        if (!revisionForm.projectId || !revisionForm.versionNumber) return alert('Preencha os campos obrigatórios');
        try {
            await addRevision({
                projectId: revisionForm.projectId,
                versionNumber: Number(revisionForm.versionNumber),
                changeLog: revisionForm.changeLog || '',
                clientFeedback: revisionForm.clientFeedback || '',
                date: new Date().toISOString(),
                authorId: currentUser?.id || '',
                reworkTime: Number(revisionForm.reworkTime) || 0
            });
            setShowRevisionModal(false);
            setRevisionForm({});
        } catch (e) {
            console.error(e);
            alert('Erro ao registrar revisão');
        }
    };

    return (
        <div className="p-8 text-brand-dark dark:text-gray-200">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-brand-dark dark:text-white">QUALIDADE</h1>
                    <p className="text-gray-500">Gestão de Checklists, Aprovações e Revisões</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => { setChecklistForm({}); setShowChecklistModal(true); }} className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold flex items-center hover:bg-yellow-400 transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2" /> Checklist
                    </button>
                    <button onClick={() => { setApprovalForm({}); setShowApprovalModal(true); }} className="bg-brand-dark text-white px-4 py-2 rounded-lg font-bold flex items-center hover:bg-gray-800 transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2" /> Aprovação
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-6 mb-8 border-b border-gray-200 dark:border-gray-800 pb-1">
                {['dashboard', 'checklists', 'approvals', 'revisions'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === tab ? 'border-brand-gold text-brand-gold' : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab === 'dashboard' ? 'Visão Geral' :
                            tab === 'checklists' ? 'Checklists' :
                                tab === 'approvals' ? 'Aprovações' : 'Revisões & Retrabalho'}
                    </button>
                ))}
            </div>

            {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-500 text-sm uppercase">Aprovações Pendentes</h3>
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600">
                                <ClockIcon className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-3xl font-black">{clientApprovals.filter(a => a.status === ApprovalStatus.Pending).length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-500 text-sm uppercase">Checklists Ativas</h3>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                                <CheckSquareIcon className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-3xl font-black">{qualityChecklists.filter(c => c.status === ChecklistStatus.Active || c.status === ChecklistStatus.Draft).length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-500 text-sm uppercase">Revisões (Total)</h3>
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600">
                                <AlertCircleIcon className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-3xl font-black">{revisions.length}</p>
                    </div>
                </div>
            )}

            {activeTab === 'checklists' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {qualityChecklists.map(checklist => (
                        <div key={checklist.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg">{checklist.title}</h3>
                                    <span className={`px-2 py-1 text-xs rounded font-bold ${checklist.status === ChecklistStatus.Completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>{checklist.status}</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{checklist.description}</p>
                                <div className="space-y-2 mb-4">
                                    {checklist.items.slice(0, 3).map(item => (
                                        <div key={item.id} className="flex items-center text-sm">
                                            <div className={`w-4 h-4 rounded border mr-2 flex items-center justify-center shrink-0 ${item.completed ? 'bg-brand-gold border-brand-gold' : 'border-gray-300'}`}>
                                                {item.completed && <CheckIcon className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className={item.completed ? 'line-through text-gray-400' : ''}>{item.text}</span>
                                        </div>
                                    ))}
                                    {checklist.items.length > 3 && <p className="text-xs text-gray-400">+{checklist.items.length - 3} itens</p>}
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 flex justify-end space-x-2 mt-auto">
                                <button onClick={() => { setChecklistForm(checklist); setShowChecklistModal(true); }} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500">
                                    <EditIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => removeQualityChecklist(checklist.id)} className="p-2 hover:bg-red-100 rounded text-red-500">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {qualityChecklists.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400">
                            <CheckSquareIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhuma checklist criada.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'approvals' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 font-bold border-b border-gray-100 dark:border-gray-700">
                                <th className="p-4">Projeto / Título</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Data Envio</th>
                                <th className="p-4">Feedback</th>
                                <th className="p-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientApprovals.map(approval => {
                                const client = clients.find(c => c.id === approval.clientId);
                                return (
                                    <tr key={approval.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <p className="font-bold">{approval.title}</p>
                                            {approval.linkToDeliverable && (
                                                <a href={approval.linkToDeliverable} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-gold hover:underline flex items-center mt-1">
                                                    Ver Entregável <ExternalLinkIcon className="w-3 h-3 ml-1" />
                                                </a>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm">{client?.name || 'Cliente Removido'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs rounded-full font-bold ${approval.status === ApprovalStatus.Approved ? 'bg-green-100 text-green-700' :
                                                    approval.status === ApprovalStatus.Rejected ? 'bg-red-100 text-red-700' :
                                                        approval.status === ApprovalStatus.ChangesRequested ? 'bg-orange-100 text-orange-700' :
                                                            'bg-gray-100 text-gray-600'
                                                }`}>
                                                {approval.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">{new Date(approval.sentDate).toLocaleDateString()}</td>
                                        <td className="p-4 text-sm max-w-xs truncate" title={approval.clientFeedback}>
                                            {approval.clientFeedback || '-'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <button onClick={() => { setApprovalForm(approval); setShowApprovalModal(true); }} className="text-gray-400 hover:text-brand-dark">
                                                    <EditIcon className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => removeClientApproval(approval.id)} className="text-gray-400 hover:text-red-500">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {clientApprovals.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">
                                        Nenhuma aprovação registrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'revisions' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button onClick={() => { setRevisionForm({}); setShowRevisionModal(true); }} className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold text-sm">
                            Registrar Revisão
                        </button>
                    </div>
                    <div className="grid gap-4">
                        {revisions.map(rev => (
                            <div key={rev.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="font-bold text-lg">v{rev.versionNumber}</span>
                                        <span className="text-sm text-gray-500">• {new Date(rev.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm mb-2"><span className="font-bold">Mudanças:</span> {rev.changeLog}</p>
                                    <div className="bg-red-50 dark:bg-red-900/10 p-2 rounded mt-2">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Feedback do Cliente</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{rev.clientFeedback}"</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Tempo Retrabalho</div>
                                    <div className="text-lg font-bold text-red-500">{rev.reworkTime || 0}h</div>
                                </div>
                            </div>
                        ))}
                        {revisions.length === 0 && (
                            <div className="py-12 text-center text-gray-400">
                                <AlertCircleIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum histórico de revisões.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            <Modal isOpen={showChecklistModal} onClose={() => setShowChecklistModal(false)} title={checklistForm.id ? "Editar Checklist" : "Nova Checklist"}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">Título</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={checklistForm.title || ''}
                            onChange={e => setChecklistForm({ ...checklistForm, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">Descrição</label>
                        <textarea
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows={2}
                            value={checklistForm.description || ''}
                            onChange={e => setChecklistForm({ ...checklistForm, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">Projeto Relacionado</label>
                        <select
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={checklistForm.projectId || ''}
                            onChange={e => setChecklistForm({ ...checklistForm, projectId: Number(e.target.value) })}
                        >
                            <option value="">Selecione um projeto...</option>
                            {productionProjects.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">Itens (Pressione Enter para adicionar)</label>
                        <input
                            type="text"
                            placeholder="Adicionar item..."
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-2"
                            onKeyDown={handleAddItem}
                        />
                        <ul className="space-y-2 max-h-40 overflow-y-auto">
                            {checklistForm.items?.map(item => (
                                <li key={item.id} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                    <span className="dark:text-white">{item.text}</span>
                                    <button onClick={() => deleteItem(item.id)} className="text-red-500"><CloseIcon className="w-4 h-4" /></button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {checklistForm.id && (
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">Status</label>
                            <select
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={checklistForm.status}
                                onChange={e => setChecklistForm({ ...checklistForm, status: e.target.value as ChecklistStatus })}
                            >
                                {Object.values(ChecklistStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="pt-4 flex justify-end">
                        <button onClick={handleSaveChecklist} className="bg-brand-gold text-brand-dark px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity">Salvar</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showApprovalModal} onClose={() => setShowApprovalModal(false)} title={approvalForm.id ? "Editar Aprovação" : "Nova Solicitação de Aprovação"}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">Título</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={approvalForm.title || ''}
                            onChange={e => setApprovalForm({ ...approvalForm, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">Descrição</label>
                        <textarea
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows={2}
                            value={approvalForm.description || ''}
                            onChange={e => setApprovalForm({ ...approvalForm, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">Cliente</label>
                        <select
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={approvalForm.clientId || ''}
                            onChange={e => setApprovalForm({ ...approvalForm, clientId: Number(e.target.value) })}
                        >
                            <option value="">Selecione um cliente...</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">Projeto (Opcional)</label>
                        <select
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={approvalForm.projectId || ''}
                            onChange={e => setApprovalForm({ ...approvalForm, projectId: Number(e.target.value) })}
                        >
                            <option value="">Selecione...</option>
                            {productionProjects.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">Link do Entregável</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={approvalForm.linkToDeliverable || ''}
                            onChange={e => setApprovalForm({ ...approvalForm, linkToDeliverable: e.target.value })}
                        />
                    </div>
                    {approvalForm.id && (
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">Status</label>
                            <select
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={approvalForm.status}
                                onChange={e => setApprovalForm({ ...approvalForm, status: e.target.value as ApprovalStatus })}
                            >
                                {Object.values(ApprovalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    )}
                    {approvalForm.id && (
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">Feedback do Cliente</label>
                            <textarea
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                rows={2}
                                value={approvalForm.clientFeedback || ''}
                                onChange={e => setApprovalForm({ ...approvalForm, clientFeedback: e.target.value })}
                            />
                        </div>
                    )}
                    <div className="pt-4 flex justify-end">
                        <button onClick={handleSaveApproval} className="bg-brand-gold text-brand-dark px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity">Salvar</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showRevisionModal} onClose={() => setShowRevisionModal(false)} title="Registrar Revisão">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">Projeto</label>
                        <select
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={revisionForm.projectId || ''}
                            onChange={e => setRevisionForm({ ...revisionForm, projectId: Number(e.target.value) })}
                        >
                            <option value="">Selecione...</option>
                            {productionProjects.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">Versão</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={revisionForm.versionNumber || ''}
                                onChange={e => setRevisionForm({ ...revisionForm, versionNumber: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">Tempo Retrabalho (h)</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={revisionForm.reworkTime || ''}
                                onChange={e => setRevisionForm({ ...revisionForm, reworkTime: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">Mudanças Realizadas</label>
                        <textarea
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows={3}
                            value={revisionForm.changeLog || ''}
                            onChange={e => setRevisionForm({ ...revisionForm, changeLog: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">Feedback do Cliente (Motivo)</label>
                        <textarea
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows={3}
                            value={revisionForm.clientFeedback || ''}
                            onChange={e => setRevisionForm({ ...revisionForm, clientFeedback: e.target.value })}
                        />
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button onClick={handleSaveRevision} className="bg-brand-gold text-brand-dark px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity">Salvar</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
