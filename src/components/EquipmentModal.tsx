import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Equipment, Employee } from '../types';
import { useData } from '../contexts/DataContext';
import { CloseIcon, SaveIcon, TrashIcon } from './common/Icon';

interface EquipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    equipment?: Equipment;
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({ isOpen, onClose, equipment }) => {
    const { addEquipment, updateEquipmentData, removeEquipment, employees } = useData();
    const [formData, setFormData] = useState<Omit<Equipment, 'id'>>({
        name: '',
        category: 'Camera',
        serialNumber: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        status: 'Available',
        value: 0,
        notes: '',
        assignedTo: undefined,
        lastMaintenance: undefined,
        nextMaintenance: undefined
    });

    useEffect(() => {
        if (equipment) {
            const { id, ...rest } = equipment;
            setFormData(rest);
        } else {
            setFormData({
                name: '',
                category: 'Camera',
                serialNumber: '',
                purchaseDate: new Date().toISOString().split('T')[0],
                status: 'Available',
                value: 0,
                notes: '',
                assignedTo: undefined,
                lastMaintenance: undefined,
                nextMaintenance: undefined
            });
        }
    }, [equipment, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (equipment) {
                await updateEquipmentData({ ...formData, id: equipment.id });
            } else {
                await addEquipment(formData);
            }
            onClose();
        } catch (error) {
            console.error("Error saving equipment:", error);
        }
    };

    const handleDelete = async () => {
        if (equipment) {
            await removeEquipment(equipment.id);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-brand-dark border border-gray-800 rounded-3xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-brand-gold/10 to-transparent">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                                    {equipment ? 'EDITAR EQUIPAMENTO' : 'NOVO EQUIPAMENTO'}
                                </h2>
                                <p className="text-gray-400 text-sm">Controle de patrimônio e manutenção</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">Nome do Equipamento</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-all"
                                        placeholder="Ex: Sony A7IV"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Categoria</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none appearance-none transition-all"
                                    >
                                        <option value="Camera">Câmera</option>
                                        <option value="Lens">Lente</option>
                                        <option value="Lighting">Iluminação</option>
                                        <option value="Audio">Áudio</option>
                                        <option value="Grip">Grip/Suporte</option>
                                        <option value="Other">Outro</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Número de Série</label>
                                    <input
                                        type="text"
                                        value={formData.serialNumber}
                                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-all"
                                        placeholder="S/N"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Status Atual</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none appearance-none transition-all"
                                    >
                                        <option value="Available">Disponível</option>
                                        <option value="In Use">Em Uso</option>
                                        <option value="Maintenance">Em Manutenção</option>
                                        <option value="Retired">Retirado</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Data de Compra</label>
                                    <input
                                        type="date"
                                        value={formData.purchaseDate}
                                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Valor (AOA)</label>
                                    <input
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Responsável Atual</label>
                                    <select
                                        value={formData.assignedTo || ''}
                                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value || undefined })}
                                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none appearance-none transition-all"
                                    >
                                        <option value="">Nenhum</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Próxima Manutenção</label>
                                    <input
                                        type="date"
                                        value={formData.nextMaintenance || ''}
                                        onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })}
                                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Notas Adicionais</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-all h-24 resize-none"
                                    placeholder="Detalhes, acessórios inclusos, etc."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                {equipment && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-all flex items-center gap-2 border border-red-500/20"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                        REMOVER
                                    </button>
                                )}
                                <div className="flex-1" />
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-3 text-gray-400 hover:text-white font-bold transition-all"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-brand-gold text-black rounded-xl font-black hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {equipment ? 'ATUALIZAR' : 'SALVAR'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
