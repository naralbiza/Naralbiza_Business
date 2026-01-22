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
        leads: 0,
        reach: 0,
        engagement: 0,
        conversions: 0,
        investment: 0,
        spend: 0,
        date: new Date().toISOString().slice(0, 10),
        notes: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingMetric) {
            setFormData({
                channel: editingMetric.channel,
                investment: editingMetric.investment,
                spend: editingMetric.spend || editingMetric.investment,
                leads: editingMetric.leads,
                reach: editingMetric.reach,
                engagement: editingMetric.engagement || 0,
                conversions: editingMetric.conversions || 0,
                date: editingMetric.date,
                notes: editingMetric.notes || ''
            });
        } else {
            setFormData({
                channel: 'Instagram',
                leads: 0,
                reach: 0,
                engagement: 0,
                conversions: 0,
                investment: 0,
                spend: 0,
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Canal</label>
                        <select
                            value={formData.channel}
                            onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
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
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Data (Mês/Ano)</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Investimento (AOA)</label>
                        <input
                            type="number"
                            value={formData.investment}
                            onChange={(e) => setFormData({ ...formData, investment: parseFloat(e.target.value) })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Leads</label>
                        <input
                            type="number"
                            value={formData.leads}
                            onChange={(e) => setFormData({ ...formData, leads: parseInt(e.target.value) })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                            min="0"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Alcance</label>
                        <input
                            type="number"
                            value={formData.reach}
                            onChange={(e) => setFormData({ ...formData, reach: parseInt(e.target.value) })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                            min="0"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Engajamento</label>
                        <input
                            type="number"
                            value={formData.engagement}
                            onChange={(e) => setFormData({ ...formData, engagement: parseInt(e.target.value) })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                            min="0"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Conversões</label>
                        <input
                            type="number"
                            value={formData.conversions}
                            onChange={(e) => setFormData({ ...formData, conversions: parseInt(e.target.value) })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                            min="0"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Observações</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300 min-h-[120px]"
                        placeholder="Detalhes sobre a campanha ou performance..."
                    />
                </div>

                <div className="flex gap-4 pt-6 mt-4 border-t border-black/5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-4 rounded-xl font-black uppercase text-black/40 hover:text-black hover:bg-black/5 transition-all text-xs tracking-widest"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-black hover:bg-gold-metallic hover:text-black text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all duration-300 shadow-lg hover:shadow-brand-gold/20 disabled:opacity-50"
                    >
                        {loading ? "Salvando..." : editingMetric ? "Atualizar Métrica" : "Salvar Métrica"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
