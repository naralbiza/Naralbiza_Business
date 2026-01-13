import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { MarketingMetric } from '../../types';

interface MarketingMetricModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (metric: Omit<MarketingMetric, 'id'>) => Promise<void>;
    editingMetric?: MarketingMetric | null;
}

export const MarketingMetricModal: React.FC<MarketingMetricModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editingMetric
}) => {
    const [formData, setFormData] = useState<Omit<MarketingMetric, 'id'>>({
        channel: 'Instagram',
        investment: 0,
        leads: 0,
        reach: 0,
        date: new Date().toISOString().slice(0, 10),
        notes: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingMetric) {
            setFormData({
                channel: editingMetric.channel,
                investment: editingMetric.investment,
                leads: editingMetric.leads,
                reach: editingMetric.reach,
                date: editingMetric.date,
                notes: editingMetric.notes || ''
            });
        } else {
            setFormData({
                channel: 'Instagram',
                investment: 0,
                leads: 0,
                reach: 0,
                date: new Date().toISOString().slice(0, 10),
                notes: ''
            });
        }
    }, [editingMetric, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Error saving metric:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingMetric ? "Editar Métrica" : "Nova Métrica"}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Canal</label>
                        <select
                            value={formData.channel}
                            onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                            className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors"
                            required
                        >
                            <option value="Instagram">Instagram</option>
                            <option value="Youtube">Youtube</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Google Ads">Google Ads</option>
                            <option value="Linkedin">Linkedin</option>
                            <option value="Others">Outros</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Data (Mês/Ano)</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Investimento (AOA)</label>
                        <input
                            type="number"
                            value={formData.investment}
                            onChange={(e) => setFormData({ ...formData, investment: parseFloat(e.target.value) })}
                            className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Leads</label>
                        <input
                            type="number"
                            value={formData.leads}
                            onChange={(e) => setFormData({ ...formData, leads: parseInt(e.target.value) })}
                            className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors"
                            min="0"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Alcance</label>
                        <input
                            type="number"
                            value={formData.reach}
                            onChange={(e) => setFormData({ ...formData, reach: parseInt(e.target.value) })}
                            className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors"
                            min="0"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Observações</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors min-h-[100px]"
                        placeholder="Detalhes sobre a campanha ou performance..."
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white transition-colors border border-gray-800 hover:bg-white/5"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-brand-gold hover:bg-white text-brand-dark px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-brand-gold/20 disabled:opacity-50"
                    >
                        {loading ? "Salvando..." : editingMetric ? "Atualizar" : "Salvar Métrica"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
