import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from './common/Card';
import { PlusIcon, CalendarIcon } from './common/Icon';
import { Modal } from './common/Modal';
import { Budget, Transaction, FinancialData, Tax, Employee, Page, ProductionProject, Client, BudgetItem, InternalBudget } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { formatCurrency } from '../utils';
import { v4 as uuidv4 } from 'uuid';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const TransactionModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (transaction: Omit<Transaction, 'id'> | Transaction) => Promise<void>,
    transactionToEdit?: Transaction | null,
    projects?: ProductionProject[]
}> = ({ isOpen, onClose, onSave, transactionToEdit, projects = [] }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transaction, setTransaction] = useState<Omit<Transaction, 'id'> | Transaction>(
        transactionToEdit || {
            description: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            issueDate: new Date().toISOString().split('T')[0], // Default issue date today
            paymentDate: undefined,
            type: 'expense',
            category: '',
            status: 'Paid',
            dueDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'Transferência Bancária',
            notes: '',
            responsibleId: undefined,
            projectId: undefined
        }
    );

    const { employees } = useData();

    React.useEffect(() => {
        if (transactionToEdit) {
            setTransaction(transactionToEdit);
        } else {
            setTransaction({
                description: '',
                amount: 0,
                date: new Date().toISOString().split('T')[0],
                issueDate: new Date().toISOString().split('T')[0],
                type: 'expense',
                category: '',
                status: 'Paid',
                dueDate: new Date().toISOString().split('T')[0],
                paymentMethod: 'Transferência Bancária',
                notes: '',
                responsibleId: undefined
            });
        }
    }, [transactionToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await onSave(transaction);
            onClose();
        } catch (err: any) {
            console.error("DEBUG: Failed to save transaction", err);
            setError(`Erro ao salvar transação: ${err.message || 'Erro desconhecido'}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTransaction(prev => ({
            ...prev,
            [name]: name === 'amount'
                ? Number(value)
                : value
        }));
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={transactionToEdit ? 'Editar Transação' : 'Nova Transação'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <input name="description" value={transaction.description} placeholder="Ex: Pagamento Fornecedor" onChange={handleChange} className="p-2 border rounded w-full" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Valor (AOA)</label>
                        <input name="amount" type="number" value={transaction.amount} placeholder="0.00" onChange={handleChange} className="p-2 border rounded w-full" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Categoria</label>
                        <input name="category" value={transaction.category} placeholder="Ex: Marketing" onChange={handleChange} className="p-2 border rounded w-full" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Data Competência</label>
                        <input name="date" type="date" value={transaction.date} onChange={handleChange} className="p-2 border rounded w-full" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Data Emissão</label>
                        <input name="issueDate" type="date" value={transaction.issueDate || ''} onChange={handleChange} className="p-2 border rounded w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tipo</label>
                        <select name="type" value={transaction.type} onChange={handleChange} className="p-2 border rounded w-full">
                            <option value="expense">Despesa</option>
                            <option value="revenue">Receita</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select name="status" value={transaction.status} onChange={handleChange} className="p-2 border rounded w-full">
                            <option value="Paid">Pago</option>
                            <option value="Pending">Pendente</option>
                            <option value="Overdue">Vencido</option>
                        </select>
                    </div>
                    {transaction.status === 'Paid' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Data Pagamento</label>
                            <input name="paymentDate" type="date" value={transaction.paymentDate || ''} onChange={handleChange} className="p-2 border rounded w-full" />
                        </div>
                    )}
                    {(transaction.status === 'Pending' || transaction.status === 'Overdue') && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Data de Vencimento</label>
                            <input name="dueDate" type="date" value={transaction.dueDate || ''} onChange={handleChange} className="p-2 border rounded w-full" required />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1">Forma de Pagamento</label>
                        <select name="paymentMethod" value={transaction.paymentMethod || ''} onChange={handleChange} className="p-2 border rounded w-full">
                            <option value="Transferência Bancária">Transferência Bancária</option>
                            <option value="Multicaixa Express">Multicaixa Express</option>
                            <option value="Depósito">Depósito</option>
                            <option value="Numerário">Numerário</option>
                            <option value="Cartão de Crédito/Débito">Cartão de Crédito/Débito</option>
                            <option value="Cheque">Cheque</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Responsável</label>
                        <select name="responsibleId" value={transaction.responsibleId || ''} onChange={handleChange} className="p-2 border rounded w-full">
                            <option value="">Selecione...</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium mb-1">Projeto Relacionado</label>
                        <select name="projectId" value={transaction.projectId || ''} onChange={handleChange} className="p-2 border rounded w-full">
                            <option value="">Nenhum</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Observações / Notas</label>
                        <textarea name="notes" value={transaction.notes || ''} onChange={handleChange} rows={2} className="p-2 border rounded w-full" placeholder="Detalhes adicionais do pagamento..." />
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6 items-center">
                    {error && <p className="text-red-500 text-sm mr-auto">{error}</p>}
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300" disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black disabled:opacity-50" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const InternalBudgetModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (budget: InternalBudget) => void;
    budgetToEdit?: InternalBudget | null;
}> = ({ isOpen, onClose, onSave, budgetToEdit }) => {
    const [budget, setBudget] = useState<InternalBudget>(
        budgetToEdit || { id: 0, category: '', limit: 0, spent: 0 }
    );

    React.useEffect(() => {
        setBudget(budgetToEdit || { id: 0, category: '', limit: 0, spent: 0 });
    }, [budgetToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(budget);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBudget(prev => ({ ...prev, [name]: name === 'category' ? value : Number(value) }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={budgetToEdit ? 'Editar Meta de Categoria' : 'Nova Meta de Categoria'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="category" value={budget.category} onChange={handleChange} placeholder="Categoria" className="p-2 border rounded w-full" required />
                <input name="limit" type="number" value={budget.limit} onChange={handleChange} placeholder="Limite (AOA)" className="p-2 border rounded w-full" required />
                <input name="spent" type="number" value={budget.spent} onChange={handleChange} placeholder="Gasto Atual (AOA)" className="p-2 border rounded w-full" />
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black">Salvar</button>
                </div>
            </form>
        </Modal>
    );
};

const BudgetModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (budget: Omit<Budget, 'id'> | Budget) => Promise<void>;
    budgetToEdit?: Budget | null;
}> = ({ isOpen, onClose, onSave, budgetToEdit }) => {
    const { clients, productionProjects } = useData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [budget, setBudget] = useState<Omit<Budget, 'id'> | Budget>(
        budgetToEdit || {
            date: new Date().toISOString().split('T')[0],
            clientId: '',
            projectId: undefined,
            status: 'Rascunho',
            items: [],
            totalValue: 0,
            discount: 0,
            finalValue: 0,
            notes: ''
        }
    );

    React.useEffect(() => {
        if (budgetToEdit) {
            setBudget(budgetToEdit);
        } else {
            setBudget({
                date: new Date().toISOString().split('T')[0],
                clientId: '',
                projectId: undefined,
                status: 'Rascunho',
                items: [],
                totalValue: 0,
                discount: 0,
                finalValue: 0,
                notes: ''
            });
        }
    }, [budgetToEdit, isOpen]);

    // Recalculate totals whenever items or discount change
    // Force recalculate totals on every render to be safe
    const currentTotal = budget.items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
    const currentFinal = currentTotal - (Number(budget.discount) || 0);

    React.useEffect(() => {
        if (budget.totalValue !== currentTotal || budget.finalValue !== currentFinal) {
            setBudget(prev => ({
                ...prev,
                totalValue: currentTotal,
                finalValue: currentFinal
            }));
        }
    }, [currentTotal, currentFinal, budget.totalValue, budget.finalValue]);

    const addItem = () => {
        const newItem: BudgetItem = {
            id: uuidv4(),
            budgetId: (budget as Budget).id || '', // Temporary or empty if new
            service: '',
            quantity: 1,
            unitPrice: 0,
            subtotal: 0
        };
        setBudget(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const updateItem = (index: number, field: keyof BudgetItem, value: any) => {
        setBudget(prev => {
            const newItems = [...prev.items];
            const item = { ...newItems[index], [field]: value };
            if (field === 'quantity' || field === 'unitPrice') {
                item.subtotal = Number(item.quantity) * Number(item.unitPrice);
            }
            newItems[index] = item;
            return { ...prev, items: newItems };
        });
    };

    const removeItem = (index: number) => {
        setBudget(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await onSave(budget);
            onClose();
        } catch (err: any) {
            console.error("DEBUG: Failed to save budget", err);
            setError(`Erro ao salvar orçamento: ${err.message || 'Erro desconhecido'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={budgetToEdit ? 'Editar Orçamento (Cliente)' : 'Novo Orçamento (Cliente)'} size="xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Cliente</label>
                        <select
                            value={budget.clientId}
                            onChange={e => setBudget(prev => ({ ...prev, clientId: e.target.value }))}
                            className="p-2 border rounded w-full"
                            required
                        >
                            <option value="">Selecione um Cliente</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Projeto (Opcional)</label>
                        <select
                            value={budget.projectId || ''}
                            onChange={e => setBudget(prev => ({ ...prev, projectId: e.target.value }))}
                            className="p-2 border rounded w-full"
                        >
                            <option value="">Selecione um Projeto</option>
                            {productionProjects.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Data</label>
                        <input
                            type="date"
                            value={budget.date}
                            onChange={e => setBudget(prev => ({ ...prev, date: e.target.value }))}
                            className="p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            value={budget.status}
                            onChange={e => setBudget(prev => ({ ...prev, status: e.target.value as any }))}
                            className="p-2 border rounded w-full"
                        >
                            <option value="Rascunho">Rascunho</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Aprovado">Aprovado</option>
                            <option value="Rejeitado">Rejeitado</option>
                        </select>
                    </div>
                </div>

                {/* Items Section */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">Itens / Serviços</label>
                        <button type="button" onClick={addItem} className="text-xs bg-brand-gold text-brand-dark px-2 py-1 rounded hover:bg-yellow-500 font-bold">Adicionar Item</button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto border p-2 rounded bg-gray-50 dark:bg-gray-800">
                        {budget.items.map((item, index) => (
                            <div key={item.id || index} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-12 md:col-span-5">
                                    <input
                                        placeholder="Serviço"
                                        value={item.service}
                                        onChange={e => updateItem(index, 'service', e.target.value)}
                                        className="p-1 border rounded w-full text-sm"
                                        required
                                    />
                                </div>
                                <div className="col-span-3 md:col-span-2">
                                    <input
                                        type="number"
                                        placeholder="Qtd"
                                        value={item.quantity}
                                        onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                                        className="p-1 border rounded w-full text-sm"
                                        min="1"
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <input
                                        type="number"
                                        placeholder="Preço Unit."
                                        value={item.unitPrice}
                                        onChange={e => updateItem(index, 'unitPrice', Number(e.target.value))}
                                        className="p-1 border rounded w-full text-sm"
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2 text-right text-sm font-bold">
                                    {formatCurrency(item.subtotal)}
                                </div>
                                <div className="col-span-1 md:col-span-1 text-center">
                                    <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">X</button>
                                </div>
                            </div>
                        ))}
                        {budget.items.length === 0 && <p className="text-center text-gray-400 text-xs italic">Nenhum item adicionado.</p>}
                    </div>
                </div>

                {/* Totals */}
                <div className="flex flex-col items-end gap-2">
                    <p className="text-sm">Subtotal: <span className="font-bold">{formatCurrency(budget.totalValue)}</span></p>
                    <div className="flex items-center gap-2">
                        <label className="text-sm">Desconto:</label>
                        <input
                            type="number"
                            value={budget.discount}
                            onChange={e => setBudget(prev => ({ ...prev, discount: Number(e.target.value) }))}
                            className="p-1 border rounded w-32 text-right text-sm"
                        />
                    </div>
                    <p className="text-lg font-bold text-brand-dark dark:text-gray-100">Total Final: {formatCurrency(budget.finalValue)}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Notas</label>
                    <textarea
                        value={budget.notes || ''}
                        onChange={e => setBudget(prev => ({ ...prev, notes: e.target.value }))}
                        className="p-2 border rounded w-full h-20"
                        placeholder="Condições de pagamento, prazos, etc."
                    />
                </div>

                <div className="flex justify-end gap-4 items-center">
                    {error && <p className="text-red-500 text-sm mr-auto">{error}</p>}
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300" disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black disabled:opacity-50" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar Orçamento'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const TaxModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (tax: Omit<Tax, 'id'> | Tax) => void;
    taxToEdit?: Tax | null;
    employees?: Employee[];
}> = ({ isOpen, onClose, onSave, taxToEdit, employees = [] }) => {
    const [tax, setTax] = useState<Omit<Tax, 'id'> | Tax>(
        taxToEdit || { name: '', amount: 0, dueDate: new Date().toISOString().split('T')[0], status: 'Pending', notes: '', responsibleId: undefined }
    );

    React.useEffect(() => {
        setTax(taxToEdit || { name: '', amount: 0, dueDate: new Date().toISOString().split('T')[0], status: 'Pending', notes: '', responsibleId: undefined });
    }, [taxToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(tax);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTax(prev => ({
            ...prev,
            [name]: name === 'amount'
                ? Number(value)
                : value
        }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={taxToEdit ? 'Editar Imposto' : 'Novo Imposto'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="name" value={tax.name} onChange={handleChange} placeholder="Tipo de Imposto" className="p-2 border rounded w-full" required />
                <input name="amount" type="number" value={tax.amount} onChange={handleChange} placeholder="Valor (AOA)" className="p-2 border rounded w-full" required />
                <input name="dueDate" type="date" value={tax.dueDate} onChange={handleChange} className="p-2 border rounded w-full" required />
                <select
                    name="responsibleId"
                    value={tax.responsibleId || ''}
                    onChange={handleChange}
                    className="p-2 border rounded w-full bg-white dark:bg-gray-800"
                >
                    <option value="">Selecione um Responsável (Opcional)</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                </select>
                <textarea name="notes" value={tax.notes || ''} onChange={handleChange} placeholder="Observações" className="p-2 border rounded w-full" />
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black">Salvar</button>
                </div>
            </form>
        </Modal>
    );
};

interface FinancialProps {
    financialData: FinancialData;
    onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    onDeleteTransaction?: (id: number) => void;
    onUpdateTransaction?: (transaction: Transaction) => void;
    onToggleTransaction?: (transaction: Transaction) => void;
    onAddBudget?: (budget: Omit<Budget, 'id'>) => void;
    onUpdateBudget?: (budget: Budget) => void;
    onDeleteBudget?: (budgetId: string) => void; // Changed to string
    onAddTax?: (tax: Omit<Tax, 'id'>) => void;
    onUpdateTax?: (tax: Tax) => void;
    onDeleteTax?: (taxId: number) => void;
    onPayTax?: (tax: Tax) => void;
    onAddInternalBudget?: (budget: Omit<InternalBudget, 'id'>) => void;
    onUpdateInternalBudget?: (budget: InternalBudget) => void;
    onDeleteInternalBudget?: (id: number) => void;
    employees?: Employee[];
}

const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

const getGoogleCalendarUrl = (tax: Tax) => {
    const title = encodeURIComponent(`Pagar Imposto: ${tax.name}`);
    const details = encodeURIComponent(`Valor: ${formatCurrency(tax.amount)}\nObservações: ${tax.notes || ''}`);

    // Format dates as YYYYMMDD
    const date = new Date(tax.dueDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const isoDate = `${year}${month}${day}`;
    // Add 1 day for end date to make it an all-day event
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    const nextYear = nextDay.getFullYear();
    const nextMonth = String(nextDay.getMonth() + 1).padStart(2, '0');
    const nextDayStr = String(nextDay.getDate()).padStart(2, '0');
    const isoNextDate = `${nextYear}${nextMonth}${nextDayStr}`;

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${isoDate}/${isoNextDate}`;
};

/**
 * The Financial page component.
 * It provides a detailed view of the company's finances with charts and KPIs.
 */
export const Financial: React.FC<FinancialProps> = ({
    financialData,
    onAddTransaction, onDeleteTransaction, onUpdateTransaction, onToggleTransaction,
    onAddBudget, onUpdateBudget, onDeleteBudget,
    onAddTax, onUpdateTax, onDeleteTax, onPayTax,
    onAddInternalBudget, onUpdateInternalBudget, onDeleteInternalBudget,
    employees = []
}) => {
    const { hasPermission } = useAuth();
    const { productionProjects } = useData();
    const canCreate = hasPermission(Page.Financial, 'create');
    const canEdit = hasPermission(Page.Financial, 'edit');

    const [activeTab, setActiveTab] = useState<'overview' | 'budgets' | 'receivables' | 'payables' | 'cashflow' | 'history'>('overview');
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isInternalBudgetModalOpen, setIsInternalBudgetModalOpen] = useState(false); // For category limits
    const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
    const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
    const [internalBudgetToEdit, setInternalBudgetToEdit] = useState<InternalBudget | null>(null);
    const [taxToEdit, setTaxToEdit] = useState<Tax | null>(null);
    const [taxTab, setTaxTab] = useState<'pending' | 'history'>('pending');

    const paidTransactions = financialData.transactions.filter(t => t.status === 'Paid' && t.active !== false);
    const pendingTransactions = financialData.transactions.filter(t => t.status === 'Pending' && t.active !== false);
    // Combined all transactions for history
    const allTransactions = financialData.transactions.filter(t => t.active !== false).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalRevenue = paidTransactions.filter(t => t.type === 'revenue').reduce((a, b) => a + b.amount, 0);
    const totalExpenses = paidTransactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
    const totalTaxes = financialData.taxRecords ? financialData.taxRecords.filter(t => t.status === 'Paid').reduce((a, b) => a + b.amount, 0) : 0;
    const netProfit = totalRevenue - totalExpenses - totalTaxes;

    const chartData = financialData.labels.map((label, index) => ({
        name: label,
        Receita: financialData.revenue[index],
        Despesas: financialData.expenses[index],
        Impostos: financialData.taxes[index],
    }));

    const cashFlowData = financialData.cashFlowForecast.map((value, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() + index);
        return {
            name: date.toLocaleDateString('pt-BR', { month: 'short' }),
            Saldo: value
        };
    });

    const expenseByCategory = financialData.transactions
        .filter(t => t.type === 'expense' && t.status === 'Paid' && t.active !== false)
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
            return acc;
        }, {} as { [key: string]: number });

    const pieData = Object.keys(expenseByCategory).map(key => ({ name: key, value: expenseByCategory[key] }));

    const handleSaveTransaction = async (transaction: Omit<Transaction, 'id'> | Transaction) => {
        if ('id' in transaction && onUpdateTransaction) {
            await onUpdateTransaction(transaction as Transaction);
        } else {
            await onAddTransaction(transaction as Omit<Transaction, 'id'>);
        }
        setEditingTransaction(null);
    };

    const handleEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsTransactionModalOpen(true);
    };

    const handleSaveBudget = async (budget: Omit<Budget, 'id'> | Budget) => {
        if ('id' in budget && onUpdateBudget) {
            await onUpdateBudget(budget as Budget);
        } else if (onAddBudget) {
            await onAddBudget(budget as Omit<Budget, 'id'>);
        }
    };

    const handleEditBudget = (budget: Budget) => {
        setBudgetToEdit(budget);
        setIsBudgetModalOpen(true);
    };

    const handleNewBudget = () => {
        setBudgetToEdit(null);
        setIsBudgetModalOpen(true);
    };

    const handleSaveInternalBudget = async (budget: Omit<InternalBudget, 'id'> | InternalBudget) => {
        if ('id' in budget && onUpdateInternalBudget) {
            await onUpdateInternalBudget(budget as InternalBudget);
        } else if (onAddInternalBudget) {
            await onAddInternalBudget(budget as Omit<InternalBudget, 'id'>);
        }
        setInternalBudgetToEdit(null);
    };

    const handleEditInternalBudget = (budget: InternalBudget) => {
        setInternalBudgetToEdit(budget);
        setIsInternalBudgetModalOpen(true);
    };

    const handleNewInternalBudget = () => {
        setInternalBudgetToEdit(null);
        setIsInternalBudgetModalOpen(true);
    };


    const handleSaveTax = (tax: Omit<Tax, 'id'> | Tax) => {
        if ('id' in tax && onUpdateTax) {
            onUpdateTax(tax);
        } else if (onAddTax) {
            onAddTax(tax as Omit<Tax, 'id'>);
        }
    };

    const handleEditTax = (tax: Tax) => {
        setTaxToEdit(tax);
        setIsTaxModalOpen(true);
    };

    const handleNewTax = () => {
        setTaxToEdit(null);
        setIsTaxModalOpen(true);
    };

    const filteredTaxes = financialData.taxRecords ? financialData.taxRecords.filter(t => {
        if (taxTab === 'pending') return t.status === 'Pending';
        return t.status === 'Paid';
    }) : [];

    const receivables = pendingTransactions.filter(t => t.type === 'revenue');
    const payables = pendingTransactions.filter(t => t.type === 'expense');

    return (
        <>
            <div className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-brand-dark dark:text-gray-100">Financeiro</h2>
                        <p className="text-brand-secondary text-sm mt-1">Gestão de fluxo de caixa, pagamentos e recebimentos.</p>
                    </div>
                    <div className="flex gap-2">
                        {canCreate && (
                            <>
                                <button onClick={handleNewBudget} className="flex items-center gap-2 bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-300 transition-colors text-sm">
                                    <PlusIcon className="w-5 h-5" />
                                    Novo Orçamento
                                </button>
                                <button onClick={() => { setEditingTransaction(null); setIsTransactionModalOpen(true); }} className="flex items-center gap-2 bg-brand-gold text-brand-dark font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-yellow-500 transition-colors text-sm">
                                    <PlusIcon className="w-5 h-5" />
                                    Nova Transação
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <button
                        className={`pb-2 px-4 transition-all whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-brand-gold font-bold text-brand-dark dark:text-white' : 'text-gray-500 hover:text-brand-dark italic'}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Visão Geral
                    </button>
                    <button
                        className={`pb-2 px-4 transition-all whitespace-nowrap ${activeTab === 'budgets' ? 'border-b-2 border-brand-gold font-bold text-brand-dark dark:text-white' : 'text-gray-500 hover:text-brand-dark italic'}`}
                        onClick={() => setActiveTab('budgets')}
                    >
                        Orçamentos
                    </button>
                    <button
                        className={`pb-2 px-4 transition-all whitespace-nowrap ${activeTab === 'receivables' ? 'border-b-2 border-brand-gold font-bold text-brand-dark dark:text-white' : 'text-gray-500 hover:text-brand-dark italic'}`}
                        onClick={() => setActiveTab('receivables')}
                    >
                        Contas a Receber ({receivables.length})
                    </button>
                    <button
                        className={`pb-2 px-4 transition-all whitespace-nowrap ${activeTab === 'payables' ? 'border-b-2 border-brand-gold font-bold text-brand-dark dark:text-white' : 'text-gray-500 hover:text-brand-dark italic'}`}
                        onClick={() => setActiveTab('payables')}
                    >
                        Contas a Pagar ({payables.length})
                    </button>
                    <button
                        className={`pb-2 px-4 transition-all whitespace-nowrap ${activeTab === 'cashflow' ? 'border-b-2 border-brand-gold font-bold text-brand-dark dark:text-white' : 'text-gray-500 hover:text-brand-dark italic'}`}
                        onClick={() => setActiveTab('cashflow')}
                    >
                        Fluxo de Caixa
                    </button>
                    <button
                        className={`pb-2 px-4 transition-all whitespace-nowrap ${activeTab === 'history' ? 'border-b-2 border-brand-gold font-bold text-brand-dark dark:text-white' : 'text-gray-500 hover:text-brand-dark italic'}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Histórico
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Financial KPIs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            <Card>
                                <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider">Faturamento Realizado</p>
                                <p className="text-xl font-black text-green-600">{formatCurrency(totalRevenue)}</p>
                            </Card>
                            <Card>
                                <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider">Despesas e Custos</p>
                                <p className="text-xl font-black text-red-600">{formatCurrency(totalExpenses)}</p>
                            </Card>
                            <Card>
                                <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider">Contas a Receber</p>
                                <p className="text-xl font-black text-yellow-500">
                                    {formatCurrency(financialData.transactions.filter(t => t.status === 'Pending' && t.type === 'revenue' && t.active !== false).reduce((sum, t) => sum + t.amount, 0))}
                                </p>
                            </Card>
                            <Card>
                                <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider">Contas a Pagar</p>
                                <p className="text-xl font-black text-orange-500">
                                    {formatCurrency(financialData.transactions.filter(t => t.status === 'Pending' && t.type === 'expense' && t.active !== false).reduce((sum, t) => sum + t.amount, 0))}
                                </p>
                            </Card>
                            <Card>
                                <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider">Lucro Líquido Real</p>
                                <p className={`text-xl font-black ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {formatCurrency(netProfit)}
                                </p>
                            </Card>
                            <Card>
                                <p className="text-xs font-bold text-brand-secondary uppercase">Margem Real</p>
                                <p className="text-xl font-black text-brand-dark dark:text-gray-100">
                                    {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%
                                </p>
                            </Card>
                        </div>

                        {/* Main Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <Card title="Realizado: Receitas vs Despesas (Ano)" className="lg:col-span-3">
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip formatter={(value: number, name: string) => [`${formatCurrency(value)}`, name]} />
                                            <Legend />
                                            <Line type="monotone" dataKey="Receita" stroke="#16a34a" strokeWidth={2} />
                                            <Line type="monotone" dataKey="Despesas" stroke="#dc2626" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card title="Composição de Despesas" className="lg:col-span-2">
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => `${formatCurrency(value)}`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card title="Histórico de Transações (Pagas)">
                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                    {paidTransactions.map(t => (
                                        <div key={t.id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 group">
                                            <div>
                                                <p className="font-medium text-brand-dark dark:text-gray-200">{t.description}</p>
                                                <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('pt-BR')} - {t.category}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className={`font-semibold ${t.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {t.type === 'revenue' ? '+' : '-'} {formatCurrency(Math.abs(t.amount))}
                                                </p>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {canEdit && <button onClick={() => handleEditTransaction(t)} className="text-blue-500 text-xs">Editar</button>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {paidTransactions.length === 0 && <p className="text-center text-gray-500 py-4 italic">Nenhuma transação paga.</p>}
                                </div>
                            </Card>
                            <Card title="Metas de Categoria (Orçamentos Internos)">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-xs font-bold text-gray-500 uppercase">Limites Definidos</p>
                                        {canCreate && (
                                            <button onClick={handleNewInternalBudget} className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                                + Novo Limite
                                            </button>
                                        )}
                                    </div>
                                    {financialData.internalBudgets.map(budget => (
                                        <div key={budget.id} className="space-y-1 group">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-600 font-medium">{budget.category}</span>
                                                <div className="flex gap-2">
                                                    <span className="text-gray-400">
                                                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                                                    </span>
                                                    {canEdit && (
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEditInternalBudget(budget)}
                                                                className="text-blue-500 hover:text-blue-700"
                                                            >
                                                                Editar
                                                            </button>
                                                            {onDeleteInternalBudget && (
                                                                <button
                                                                    onClick={() => { if (window.confirm('Excluir este limite?')) onDeleteInternalBudget(budget.id) }}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    Excluir
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                                <div
                                                    className="bg-brand-gold h-2.5 rounded-full"
                                                    style={{ width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%` }}>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!financialData.internalBudgets || financialData.internalBudgets.length === 0) && <p className="text-center text-gray-500 py-4 italic">Nenhuma meta definida.</p>}
                                </div>
                            </Card>
                        </div>


                        <Card title="Gestão de Impostos (Fiscais)">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
                                    <button
                                        className={`pb-2 px-1 ${taxTab === 'pending' ? 'border-b-2 border-brand-gold font-semibold text-brand-dark dark:text-white' : 'text-gray-500'}`}
                                        onClick={() => setTaxTab('pending')}
                                    >
                                        Pendentes
                                    </button>
                                    <button
                                        className={`pb-2 px-1 ${taxTab === 'history' ? 'border-b-2 border-brand-gold font-semibold text-brand-dark dark:text-white' : 'text-gray-500'}`}
                                        onClick={() => setTaxTab('history')}
                                    >
                                        Histórico
                                    </button>
                                </div>
                                {canCreate && (
                                    <button onClick={handleNewTax} className="flex items-center gap-2 bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-300 transition-colors text-sm">
                                        <PlusIcon className="w-4 h-4" />
                                        Novo Imposto
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {filteredTaxes.map(tax => {
                                    const daysRemaining = getDaysRemaining(tax.dueDate);
                                    const isUrgent = daysRemaining <= 3 && tax.status === 'Pending';
                                    const isWarning = daysRemaining <= 7 && daysRemaining > 3 && tax.status === 'Pending';

                                    return (
                                        <div key={tax.id} className="flex justify-between items-center p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-brand-dark dark:text-gray-200">{tax.name}</p>
                                                    {tax.status === 'Pending' && (
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isUrgent ? 'bg-red-100 text-red-700' :
                                                            isWarning ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-green-100 text-green-700'
                                                            }`}>
                                                            {daysRemaining < 0 ? `Vencido há ${Math.abs(daysRemaining)} dias` :
                                                                daysRemaining === 0 ? 'Vence hoje' :
                                                                    `Vence em ${daysRemaining} dias`}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500">Data: {new Date(tax.dueDate).toLocaleDateString('pt-BR')}</p>
                                                {tax.notes && <p className="text-xs text-gray-400 italic">{tax.notes}</p>}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className={`font-bold ${tax.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatCurrency(tax.amount)}
                                                </p>
                                                <div className="flex gap-2">
                                                    {tax.status === 'Pending' && (
                                                        <a
                                                            href={getGoogleCalendarUrl(tax)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1 text-gray-500 hover:text-brand-dark transition-colors"
                                                            title="Adicionar ao Google Calendar"
                                                        >
                                                            <CalendarIcon className="w-5 h-5" />
                                                        </a>
                                                    )}
                                                    {tax.status === 'Pending' && onPayTax && canEdit && (
                                                        <button onClick={() => onPayTax(tax)} className="text-green-600 hover:text-green-800 text-sm font-semibold">Pagar</button>
                                                    )}
                                                    {tax.status === 'Pending' && canEdit && (
                                                        <button onClick={() => handleEditTax(tax)} className="text-blue-500 hover:text-blue-700 text-sm">Editar</button>
                                                    )}
                                                    {onDeleteTax && canEdit && <button onClick={() => onDeleteTax(tax.id)} className="text-red-500 hover:text-red-700 text-sm">Remover</button>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredTaxes.length === 0 && <p className="text-center text-gray-500 py-4 italic">Nenhum imposto {taxTab === 'pending' ? 'pendente' : 'no histórico'}.</p>}
                            </div>
                        </Card>
                    </div >
                )}
                {/* Budgets Tab */}
                {
                    activeTab === 'budgets' && (
                        <div className="animate-in slide-in-from-right duration-500 space-y-4">
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Orçamentos de Clientes</h3>
                                {canCreate && (
                                    <button onClick={handleNewBudget} className="flex items-center gap-2 bg-brand-gold text-brand-dark font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-yellow-500 transition-colors text-sm">
                                        <PlusIcon className="w-5 h-5" />
                                        Novo Orçamento
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {financialData.budgets.map(budget => (
                                    <Card key={budget.id} className="relative group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-lg text-brand-dark dark:text-white">
                                                {financialData.clients?.find(c => c.id === budget.clientId)?.name || 'Cliente Desconhecido'}
                                            </h4>
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${budget.status === 'Aprovado' ? 'bg-green-100 text-green-700' :
                                                budget.status === 'Rejeitado' ? 'bg-red-100 text-red-700' :
                                                    budget.status === 'Enviado' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {budget.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Data: {new Date(budget.date).toLocaleDateString('pt-BR')}
                                        </p>
                                        <div className="space-y-1 mb-4">
                                            {budget.items.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                                    <span>{item.quantity}x {item.service}</span>
                                                    <span>{formatCurrency(item.subtotal)}</span>
                                                </div>
                                            ))}
                                            {budget.items.length > 3 && <p className="text-xs text-gray-400 italic">...e mais {budget.items.length - 3} itens</p>}
                                        </div>
                                        <div className="border-t pt-2 mt-2 flex justify-between items-center">
                                            <span className="font-bold text-lg text-brand-dark dark:text-white">{formatCurrency(budget.finalValue)}</span>
                                            <div className="flex gap-2">
                                                {canEdit && <button onClick={() => handleEditBudget(budget)} className="text-blue-500 text-xs hover:underline font-semibold">Editar</button>}
                                                {canEdit && onDeleteBudget && <button onClick={() => onDeleteBudget(budget.id)} className="text-red-500 text-xs hover:underline font-semibold">Excluir</button>}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                                {financialData.budgets.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-gray-500 italic">
                                        Nenhum orçamento cadastrado.
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }
                {
                    activeTab === 'receivables' && (
                        <div className="animate-in slide-in-from-right duration-500">
                            <Card title="Próximos Recebimentos (Contas a Receber)">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-sm font-bold text-gray-500 border-b dark:border-gray-700">
                                                <th className="pb-3 px-2">Vencimento</th>
                                                <th className="pb-3 px-2">Descrição</th>
                                                <th className="pb-3 px-2 text-right">Valor</th>
                                                <th className="pb-3 px-2 text-center">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-gray-700">
                                            {receivables.map(t => (
                                                <tr key={t.id} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <td className="py-4 px-2 text-brand-secondary font-bold">
                                                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : 'Sem data'}
                                                    </td>
                                                    <td className="py-4 px-2">
                                                        <p className="font-semibold text-brand-dark dark:text-gray-100">{t.description}</p>
                                                        <div className="flex gap-2 items-center mt-1">
                                                            <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{t.category}</span>
                                                            {t.projectId && (
                                                                <span className="text-[10px] text-brand-gold font-bold italic">Projeto: {productionProjects.find(p => Number(p.id) === t.projectId)?.title || t.projectId}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-2 text-right font-bold text-green-600">{formatCurrency(t.amount)}</td>
                                                    <td className="py-4 px-2">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => handleSaveTransaction({ ...t, status: 'Paid' } as Transaction)}
                                                                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-bold"
                                                            >
                                                                Recebi
                                                            </button>
                                                            <button onClick={() => handleEditTransaction(t)} className="text-blue-500 text-xs hover:underline">Editar</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {receivables.length === 0 && <p className="text-center text-gray-500 py-12 italic font-medium">Nenhum valor a receber pendente no momento.</p>}
                                </div>
                            </Card>
                        </div>
                    )
                }

                {
                    activeTab === 'payables' && (
                        <div className="animate-in slide-in-from-right duration-500">
                            <Card title="Próximos Pagamentos (Contas a Pagar)">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-sm font-bold text-gray-500 border-b dark:border-gray-700">
                                                <th className="pb-3 px-2">Vencimento</th>
                                                <th className="pb-3 px-2">Descrição</th>
                                                <th className="pb-3 px-2 text-right">Valor</th>
                                                <th className="pb-3 px-2 text-center">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-gray-700">
                                            {payables.map(t => (
                                                <tr key={t.id} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <td className="py-4 px-2 text-brand-secondary font-bold">
                                                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : 'Sem data'}
                                                    </td>
                                                    <td className="py-4 px-2">
                                                        <p className="font-semibold text-brand-dark dark:text-gray-100">{t.description}</p>
                                                        <div className="flex gap-2 items-center mt-1">
                                                            <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{t.category}</span>
                                                            {t.projectId && (
                                                                <span className="text-[10px] text-brand-gold font-bold italic">Projeto: {productionProjects.find(p => Number(p.id) === t.projectId)?.title || t.projectId}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-2 text-right font-bold text-red-600">{formatCurrency(t.amount)}</td>
                                                    <td className="py-4 px-2">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => handleSaveTransaction({ ...t, status: 'Paid' } as Transaction)}
                                                                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-bold"
                                                            >
                                                                Paguei
                                                            </button>
                                                            <button onClick={() => handleEditTransaction(t)} className="text-blue-500 text-xs hover:underline">Editar</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {payables.length === 0 && <p className="text-center text-gray-500 py-12 italic font-medium">Nenhum pagamento agendado no momento.</p>}
                                </div>
                            </Card>
                        </div>
                    )
                }

                {
                    activeTab === 'cashflow' && (
                        <div className="space-y-8 animate-in zoom-in duration-500">
                            <Card title="Projeção de Fluxo de Caixa (Próximos 6 Meses)">
                                <div className="mb-6">
                                    <p className="text-sm text-brand-secondary italic">
                                        Esta projeção dinâmica estima o saldo futuro combinando a média de receitas realizadas com os recebimentos e pagamentos pendentes agendados.
                                    </p>
                                </div>
                                <div style={{ width: '100%', height: 400 }}>
                                    <ResponsiveContainer>
                                        <LineChart data={cashFlowData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val} AOA`} />
                                            <Tooltip
                                                formatter={(value: number) => [`${formatCurrency(value)}`, 'Saldo Previsto']}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend verticalAlign="top" height={36} />
                                            <Line
                                                type="monotone"
                                                dataKey="Saldo"
                                                stroke="#eab308"
                                                strokeWidth={4}
                                                dot={{ r: 6, fill: '#eab308', strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 8, strokeWidth: 0 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20">
                                    <h3 className="text-lg font-bold text-green-800 dark:text-green-400 mb-2">Total a Receber</h3>
                                    <p className="text-3xl font-black text-green-600">{formatCurrency(receivables.reduce((a, b) => a + b.amount, 0))}</p>
                                    <p className="text-xs text-green-700 mt-2 italic">{receivables.length} faturas pendentes</p>
                                </Card>
                                <Card className="bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20">
                                    <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-2">Total a Pagar</h3>
                                    <p className="text-3xl font-black text-red-600">{formatCurrency(payables.reduce((a, b) => a + b.amount, 0))}</p>
                                    <p className="text-xs text-red-700 mt-2 italic">{payables.length} compromissos agendados</p>
                                </Card>
                            </div>
                        </div>
                    )
                }


                {
                    activeTab === 'history' && (
                        <div className="animate-in slide-in-from-right duration-500">
                            <Card title="Histórico Completo de Transações">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-sm font-bold text-gray-500 border-b dark:border-gray-700">
                                                <th className="pb-3 px-2">Data</th>
                                                <th className="pb-3 px-2">Descrição</th>
                                                <th className="pb-3 px-2">Categoria</th>
                                                <th className="pb-3 px-2">Status</th>
                                                <th className="pb-3 px-2 text-right">Valor</th>
                                                <th className="pb-3 px-2 text-center">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-gray-700">
                                            {allTransactions.map(t => (
                                                <tr key={t.id} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <td className="py-4 px-2 text-brand-secondary">
                                                        {new Date(t.date).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td className="py-4 px-2 font-medium text-brand-dark dark:text-gray-100">{t.description}</td>
                                                    <td className="py-4 px-2 text-gray-500">{t.category}</td>
                                                    <td className="py-4 px-2">
                                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${t.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                            t.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {t.status === 'Paid' ? 'Pago' : t.status === 'Overdue' ? 'Vencido' : 'Pendente'}
                                                        </span>
                                                    </td>
                                                    <td className={`py-4 px-2 text-right font-bold ${t.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {t.type === 'revenue' ? '+' : '-'} {formatCurrency(Math.abs(t.amount))}
                                                    </td>
                                                    <td className="py-4 px-2 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button onClick={() => handleEditTransaction(t)} className="text-blue-500 text-xs hover:underline">Editar</button>
                                                            {onDeleteTransaction && (
                                                                <button
                                                                    onClick={() => { if (window.confirm('Excluir esta transação?')) onDeleteTransaction(t.id) }}
                                                                    className="text-red-500 text-xs hover:underline"
                                                                >
                                                                    Excluir
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {allTransactions.length === 0 && <p className="text-center text-gray-500 py-12 italic">Nenhuma transação registrada.</p>}
                                </div>
                            </Card>
                        </div>
                    )
                }
            </div >

            <TransactionModal
                isOpen={isTransactionModalOpen}
                projects={productionProjects}
                onClose={() => setIsTransactionModalOpen(false)}
                onSave={handleSaveTransaction}
                transactionToEdit={editingTransaction}
            />

            <BudgetModal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
                onSave={handleSaveBudget}
                budgetToEdit={budgetToEdit}
            />

            <InternalBudgetModal
                isOpen={isInternalBudgetModalOpen}
                onClose={() => setIsInternalBudgetModalOpen(false)}
                onSave={handleSaveInternalBudget}
                budgetToEdit={internalBudgetToEdit}
            />


            <TaxModal
                isOpen={isTaxModalOpen}
                onClose={() => setIsTaxModalOpen(false)}
                onSave={handleSaveTax}
                taxToEdit={taxToEdit}
                employees={employees}
            />
        </>
    );
};