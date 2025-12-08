import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from './common/Card';
import { PlusIcon } from './common/Icon';
import { Modal } from './common/Modal';
import { Budget, Transaction, FinancialData, Tax } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const BudgetTracker: React.FC<{ budgets: Budget[] }> = ({ budgets }) => (
    <Card title="Controle Orçamentário (Mensal)">
        <div className="space-y-4">
            {budgets.map(budget => (
                <div key={budget.category}>
                    <div className="flex justify-between mb-1">
                        <span className="text-base font-medium text-brand-dark dark:text-gray-200">{budget.category}</span>
                        <span className="text-sm font-medium text-brand-dark dark:text-gray-200">
                            Kz {budget.spent.toLocaleString('pt-BR')} / Kz {budget.limit.toLocaleString('pt-BR')}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                            className="bg-brand-gold h-2.5 rounded-full"
                            style={{ width: `${(budget.spent / budget.limit) * 100}%` }}>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </Card>
);

const TransactionModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (transaction: Omit<Transaction, 'id'>) => void }> = ({ isOpen, onClose, onSave }) => {
    const [transaction, setTransaction] = useState({
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        type: 'expense' as Transaction['type'],
        category: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(transaction);
        onClose();
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTransaction(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nova Transação">
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="description" placeholder="Descrição" onChange={handleChange} className="p-2 border rounded w-full" required />
                <input name="amount" type="number" placeholder="Valor (Kz)" onChange={handleChange} className="p-2 border rounded w-full" required />
                <input name="category" placeholder="Categoria" onChange={handleChange} className="p-2 border rounded w-full" required />
                <input name="date" type="date" value={transaction.date} onChange={handleChange} className="p-2 border rounded w-full" required />
                <select name="type" value={transaction.type} onChange={handleChange} className="p-2 border rounded w-full">
                    <option value="expense">Despesa</option>
                    <option value="revenue">Receita</option>
                </select>
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
    onSave: (budget: Omit<Budget, 'id'> | Budget) => void;
    budgetToEdit?: Budget | null;
}> = ({ isOpen, onClose, onSave, budgetToEdit }) => {
    const [budget, setBudget] = useState<Omit<Budget, 'id'> | Budget>(
        budgetToEdit || { category: '', limit: 0, spent: 0 }
    );

    React.useEffect(() => {
        setBudget(budgetToEdit || { category: '', limit: 0, spent: 0 });
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
        <Modal isOpen={isOpen} onClose={onClose} title={budgetToEdit ? 'Editar Orçamento' : 'Novo Orçamento'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="category" value={budget.category} onChange={handleChange} placeholder="Categoria" className="p-2 border rounded w-full" required />
                <input name="limit" type="number" value={budget.limit} onChange={handleChange} placeholder="Limite (Kz)" className="p-2 border rounded w-full" required />
                <input name="spent" type="number" value={budget.spent} onChange={handleChange} placeholder="Gasto Atual (Kz)" className="p-2 border rounded w-full" />
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black">Salvar</button>
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
}> = ({ isOpen, onClose, onSave, taxToEdit }) => {
    const [tax, setTax] = useState<Omit<Tax, 'id'> | Tax>(
        taxToEdit || { name: '', amount: 0, dueDate: new Date().toISOString().split('T')[0], status: 'Pending', notes: '' }
    );

    React.useEffect(() => {
        setTax(taxToEdit || { name: '', amount: 0, dueDate: new Date().toISOString().split('T')[0], status: 'Pending', notes: '' });
    }, [taxToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(tax);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTax(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={taxToEdit ? 'Editar Imposto' : 'Novo Imposto'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="name" value={tax.name} onChange={handleChange} placeholder="Tipo de Imposto" className="p-2 border rounded w-full" required />
                <input name="amount" type="number" value={tax.amount} onChange={handleChange} placeholder="Valor (Kz)" className="p-2 border rounded w-full" required />
                <input name="dueDate" type="date" value={tax.dueDate} onChange={handleChange} className="p-2 border rounded w-full" required />
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
    onToggleTransaction?: (transaction: Transaction) => void;
    onAddBudget?: (budget: Omit<Budget, 'id'>) => void;
    onUpdateBudget?: (budget: Budget) => void;
    onDeleteBudget?: (budgetId: number) => void;
    onAddTax?: (tax: Omit<Tax, 'id'>) => void;
    onUpdateTax?: (tax: Tax) => void;
    onDeleteTax?: (taxId: number) => void;
    onPayTax?: (tax: Tax) => void;
}

/**
 * The Financial page component.
 * It provides a detailed view of the company's finances with charts and KPIs.
 */
export const Financial: React.FC<FinancialProps> = ({ financialData, onAddTransaction, onDeleteTransaction, onToggleTransaction, onAddBudget, onUpdateBudget, onDeleteBudget, onAddTax, onUpdateTax, onDeleteTax, onPayTax }) => {
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
    const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
    const [taxToEdit, setTaxToEdit] = useState<Tax | null>(null);
    const [taxTab, setTaxTab] = useState<'pending' | 'history'>('pending');

    const totalRevenue = financialData.revenue.reduce((a, b) => a + b, 0);
    const totalExpenses = financialData.expenses.reduce((a, b) => a + b, 0);
    const totalTaxes = financialData.taxes.reduce((a, b) => a + b, 0);
    const netProfit = totalRevenue - totalExpenses - totalTaxes;

    const chartData = financialData.labels.map((label, index) => ({
        name: label,
        Receita: financialData.revenue[index],
        Despesas: financialData.expenses[index],
        Impostos: financialData.taxes[index],
    }));

    const expenseByCategory = financialData.transactions
        .filter(t => t.type === 'expense' && t.active !== false)
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
            return acc;
        }, {} as { [key: string]: number });

    const pieData = Object.keys(expenseByCategory).map(key => ({ name: key, value: expenseByCategory[key] }));

    const handleSaveBudget = (budget: Omit<Budget, 'id'> | Budget) => {
        if ('id' in budget && onUpdateBudget) {
            onUpdateBudget(budget);
        } else if (onAddBudget) {
            onAddBudget(budget as Omit<Budget, 'id'>);
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

    return (
        <>
            <div className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-brand-dark dark:text-gray-100">Financeiro</h2>
                    <div className="flex gap-2">
                        <button onClick={handleNewBudget} className="flex items-center gap-2 bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-300 transition-colors">
                            <PlusIcon className="w-5 h-5" />
                            Novo Orçamento
                        </button>
                        <button onClick={() => setIsTransactionModalOpen(true)} className="flex items-center gap-2 bg-brand-gold text-brand-dark font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
                            <PlusIcon className="w-5 h-5" />
                            Nova Transação
                        </button>
                    </div>
                </div>

                {/* Financial KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <p className="text-sm font-medium text-brand-secondary">Receita Total (Ano)</p>
                        <p className="text-3xl font-bold text-green-600">Kz {totalRevenue.toLocaleString('pt-BR')}k</p>
                    </Card>
                    <Card>
                        <p className="text-sm font-medium text-brand-secondary">Despesas Totais (Ano)</p>
                        <p className="text-3xl font-bold text-red-600">Kz {totalExpenses.toLocaleString('pt-BR')}k</p>
                    </Card>
                    <Card>
                        <p className="text-sm font-medium text-brand-secondary">Lucro Líquido (Ano)</p>
                        <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">Kz {netProfit.toLocaleString('pt-BR')}k</p>
                    </Card>
                    <Card>
                        <p className="text-sm font-medium text-brand-secondary">Margem de Lucro</p>
                        <p className="text-3xl font-bold text-brand-dark dark:text-gray-100">{totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%</p>
                    </Card>
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <Card title="Receitas vs Despesas (Ano)" className="lg:col-span-3">
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis unit="k" />
                                    <Tooltip formatter={(value: number, name: string) => [`Kz ${value}k`, name]} />
                                    <Legend />
                                    <Line type="monotone" dataKey="Receita" stroke="#16a34a" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Despesas" stroke="#dc2626" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                    <Card title="Despesas por Categoria" className="lg:col-span-2">
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `Kz ${value.toLocaleString('pt-BR')}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card title="Transações Recentes">
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {financialData.transactions.map(t => (
                                <div key={t.id} className={`flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 group ${t.active === false ? 'opacity-50' : ''}`}>
                                    <div>
                                        <p className="font-medium text-brand-dark dark:text-gray-200">{t.description} {t.active === false && '(Desativada)'}</p>
                                        <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('pt-BR')} - {t.category}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className={`font-semibold ${t.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'revenue' ? '+' : '-'} Kz {Math.abs(t.amount).toLocaleString('pt-BR')}
                                        </p>
                                        <div className="flex gap-2">
                                            {onToggleTransaction && (
                                                <button
                                                    onClick={() => onToggleTransaction(t)}
                                                    className={`text-xs font-bold px-3 py-1.5 rounded text-white shadow-sm transition-colors ${t.active === false ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}`}
                                                    title={t.active === false ? "Ativar Transação" : "Desativar Transação"}
                                                >
                                                    {t.active === false ? 'Ativar' : 'Desativar'}
                                                </button>
                                            )}
                                            {onDeleteTransaction && (
                                                <button
                                                    onClick={() => onDeleteTransaction(t.id)}
                                                    className="text-xs font-bold px-3 py-1.5 rounded text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
                                                    title="Remover Transação"
                                                >
                                                    Remover
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card title="Controle Orçamentário (Mensal)">
                        <div className="space-y-4">
                            {financialData.budgets.map(budget => (
                                <div key={budget.id || budget.category} className="group relative">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-base font-medium text-brand-dark dark:text-gray-200">{budget.category}</span>
                                        <span className="text-sm font-medium text-brand-dark dark:text-gray-200">
                                            Kz {budget.spent.toLocaleString('pt-BR')} / Kz {budget.limit.toLocaleString('pt-BR')}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div
                                            className="bg-brand-gold h-2.5 rounded-full"
                                            style={{ width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%` }}>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 hidden group-hover:flex gap-2 bg-white dark:bg-gray-800 p-1 shadow-sm rounded">
                                        <button onClick={() => handleEditBudget(budget)} className="text-blue-500 text-xs">Editar</button>
                                        {onDeleteBudget && <button onClick={() => onDeleteBudget(budget.id)} className="text-red-500 text-xs">Remover</button>}
                                    </div>
                                </div>
                            ))}
                            {financialData.budgets.length === 0 && <p className="text-center text-gray-500">Nenhum orçamento definido.</p>}
                        </div>
                    </Card>
                </div>

                <Card title="Gestão de Impostos">
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
                        <button onClick={handleNewTax} className="flex items-center gap-2 bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-300 transition-colors text-sm">
                            <PlusIcon className="w-4 h-4" />
                            Novo Imposto
                        </button>
                    </div>
                    <div className="space-y-2">
                        {filteredTaxes.map(tax => (
                            <div key={tax.id} className="flex justify-between items-center p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors">
                                <div>
                                    <p className="font-medium text-brand-dark dark:text-gray-200">{tax.name}</p>
                                    <p className="text-xs text-gray-500">Vence em: {new Date(tax.dueDate).toLocaleDateString('pt-BR')}</p>
                                    {tax.notes && <p className="text-xs text-gray-400 italic">{tax.notes}</p>}
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className={`font-bold ${tax.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                                        Kz {tax.amount.toLocaleString('pt-BR')}
                                    </p>
                                    <div className="flex gap-2">
                                        {tax.status === 'Pending' && onPayTax && (
                                            <button onClick={() => onPayTax(tax)} className="text-green-600 hover:text-green-800 text-sm font-semibold">Pagar</button>
                                        )}
                                        {tax.status === 'Pending' && (
                                            <button onClick={() => handleEditTax(tax)} className="text-blue-500 hover:text-blue-700 text-sm">Editar</button>
                                        )}
                                        {onDeleteTax && <button onClick={() => onDeleteTax(tax.id)} className="text-red-500 hover:text-red-700 text-sm">Remover</button>}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredTaxes.length === 0 && <p className="text-center text-gray-500">Nenhum imposto {taxTab === 'pending' ? 'pendente' : 'no histórico'}.</p>}
                    </div>
                </Card>
            </div>
            <TransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} onSave={onAddTransaction} />
            <BudgetModal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} onSave={handleSaveBudget} budgetToEdit={budgetToEdit} />
            <TaxModal isOpen={isTaxModalOpen} onClose={() => setIsTaxModalOpen(false)} onSave={handleSaveTax} taxToEdit={taxToEdit} />
        </>
    );
};