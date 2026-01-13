import React, { useState, useEffect } from 'react';
import { JobRole } from '../../types';
import { XIcon, PlusIcon, TrashIcon } from '../common/Icon';

interface JobRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (role: Omit<JobRole, 'id' | 'createdAt'> | JobRole) => Promise<void>;
    roleToEdit?: JobRole;
}

export const JobRoleModal: React.FC<JobRoleModalProps> = ({ isOpen, onClose, onSubmit, roleToEdit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [kpis, setKpis] = useState<{ name: string; weight: number }[]>([]);

    useEffect(() => {
        if (roleToEdit) {
            setName(roleToEdit.name);
            setDescription(roleToEdit.description);
            setKpis(roleToEdit.kpis || []);
        } else {
            setName('');
            setDescription('');
            setKpis([]);
        }
    }, [roleToEdit, isOpen]);

    if (!isOpen) return null;

    const handleAddKpi = () => {
        setKpis([...kpis, { name: '', weight: 0 }]);
    };

    const handleUpdateKpi = (index: number, field: 'name' | 'weight', value: string | number) => {
        const newKpis = [...kpis];
        newKpis[index] = { ...newKpis[index], [field]: value };
        setKpis(newKpis);
    };

    const handleRemoveKpi = (index: number) => {
        setKpis(kpis.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const roleData = {
            name,
            description,
            kpis
        };
        if (roleToEdit) {
            await onSubmit({ ...roleToEdit, ...roleData });
        } else {
            await onSubmit(roleData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-dark border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">{roleToEdit ? 'Editar Cargo' : 'Novo Cargo Estratégico'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome do Cargo</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descrição da Função</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none h-24"
                                required
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-800/50">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs font-bold text-brand-gold uppercase tracking-wider">KPIs - Indicadores de Performance</label>
                                <button type="button" onClick={handleAddKpi} className="text-xs font-bold text-white flex items-center gap-1 hover:text-brand-gold transition-colors">
                                    <PlusIcon className="w-3 h-3" /> Adicionar KPI
                                </button>
                            </div>

                            <div className="space-y-3">
                                {kpis.map((kpi, idx) => (
                                    <div key={idx} className="flex gap-3 items-end">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Nome do KPI (Ex: Entregas no Prazo)"
                                                value={kpi.name}
                                                onChange={e => handleUpdateKpi(idx, 'name', e.target.value)}
                                                className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white"
                                            />
                                        </div>
                                        <div className="w-24">
                                            <input
                                                type="number"
                                                placeholder="Peso"
                                                value={kpi.weight}
                                                onChange={e => handleUpdateKpi(idx, 'weight', parseFloat(e.target.value))}
                                                className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white"
                                            />
                                        </div>
                                        <button type="button" onClick={() => handleRemoveKpi(idx)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {kpis.length === 0 && <p className="text-sm text-gray-500">Nenhum KPI definido.</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 transition-colors">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-brand-gold text-brand-dark rounded-xl text-sm font-bold hover:bg-yellow-600 transition-colors">
                            {roleToEdit ? 'Salvar Alterações' : 'Criar Cargo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
