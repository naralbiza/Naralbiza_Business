
import React, { useState } from 'react';
import { Proposal, ProposalItem, ProposalStatus } from '../types';
import { PlusIcon, TrashIcon, SendIcon, FileIcon } from './common/Icon';
import { Card } from './common/Card';
import { formatCurrency } from '../utils';

interface ProposalEditorProps {
    leadId: string;
    existingProposals: Proposal[];
    onSave: (proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const ProposalEditor: React.FC<ProposalEditorProps> = ({ leadId, existingProposals, onSave }) => {
    const [showNewForm, setShowNewForm] = useState(false);
    const [title, setTitle] = useState('');
    const [items, setItems] = useState<ProposalItem[]>([]);
    const [discount, setDiscount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    };

    const updateItem = (index: number, field: keyof ProposalItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
        }
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const totalValue = items.reduce((sum, item) => sum + item.total, 0) - discount;

    const handleSave = async () => {
        if (!title || items.length === 0) return;
        setIsSaving(true);
        try {
            await onSave({
                leadId,
                title,
                items,
                totalValue,
                discount,
                status: ProposalStatus.Sent,
                sentAt: new Date().toISOString()
            });
            setShowNewForm(false);
            setTitle('');
            setItems([]);
            setDiscount(0);
        } catch (error) {
            console.error("Error saving proposal:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <h3 className="font-bold text-lg text-brand-dark dark:text-white">Propostas</h3>
                <button
                    onClick={() => setShowNewForm(!showNewForm)}
                    className="flex items-center gap-2 bg-brand-gold text-brand-dark px-3 py-1.5 rounded-lg text-sm font-bold shadow hover:bg-yellow-500 transition-colors"
                >
                    <PlusIcon className="w-4 h-4" /> {showNewForm ? 'Cancelar' : 'Nova Proposta'}
                </button>
            </div>

            {showNewForm && (
                <Card className="bg-gray-50 dark:bg-gray-800/50 border-brand-gold/30">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título da Proposta</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Pacote Fotografia Wedding 2024"
                                className="w-full p-2.5 border rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-brand-gold outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Itens e Serviços</label>
                            {items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-start">
                                    <div className="col-span-6">
                                        <input
                                            value={item.description}
                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            placeholder="Descrição"
                                            className="w-full p-2 border rounded-lg dark:bg-gray-700 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                            placeholder="Qtd"
                                            className="w-full p-2 border rounded-lg dark:bg-gray-700 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            type="number"
                                            value={item.unitPrice}
                                            onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                            placeholder="Preço"
                                            className="w-full p-2 border rounded-lg dark:bg-gray-700 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-2">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={addItem}
                                className="text-sm font-bold text-brand-gold hover:text-yellow-600 flex items-center gap-1 mt-2"
                            >
                                <PlusIcon className="w-4 h-4" /> Adicionar Item
                            </button>
                        </div>

                        <div className="flex justify-end border-t dark:border-gray-700 pt-4 mt-4">
                            <div className="w-full max-w-[200px] space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal:</span>
                                    <span className="font-bold">{formatCurrency(totalValue + discount)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Desconto:</span>
                                    <input
                                        type="number"
                                        value={discount}
                                        onChange={(e) => setDiscount(Number(e.target.value))}
                                        className="w-20 p-1 border rounded text-right text-xs"
                                    />
                                </div>
                                <div className="flex justify-between text-lg border-t pt-2 mt-2">
                                    <span className="font-black text-brand-dark dark:text-white">Total:</span>
                                    <span className="font-black text-brand-gold text-xl">{formatCurrency(totalValue)}</span>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !title || items.length === 0}
                                    className="w-full bg-brand-dark text-white py-2.5 rounded-lg font-bold hover:bg-black transition-colors disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                                >
                                    <SendIcon className="w-4 h-4" /> {isSaving ? 'Enviando...' : 'Gerar e Enviar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <div className="space-y-3">
                {existingProposals.length === 0 ? (
                    <p className="text-center py-8 text-gray-400 italic bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed">Nenhuma proposta enviada ainda.</p>
                ) : (
                    existingProposals.map((prop) => (
                        <div key={prop.id} className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-brand-gold/10 rounded-full">
                                    <FileIcon className="w-6 h-6 text-brand-gold" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-dark dark:text-white">{prop.title}</h4>
                                    <p className="text-xs text-gray-400 font-medium">Enviada em {new Date(prop.sentAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-brand-dark dark:text-white mb-1">{formatCurrency(prop.totalValue)}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${prop.status === ProposalStatus.Accepted ? 'bg-green-100 text-green-700' :
                                    prop.status === ProposalStatus.Rejected ? 'bg-red-100 text-red-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                    {prop.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
