import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Client, Referral } from '../../types';

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (referral: Omit<Referral, 'id'>) => Promise<void>;
    clients: Client[];
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
    isOpen, onClose, onSave, clients
}) => {
    const [referrerClientId, setReferrerClientId] = useState<number>(0);
    const [referredClientName, setReferredClientName] = useState('');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (referrerClientId === 0) return;

        setIsSaving(true);
        try {
            await onSave({
                referrerClientId,
                referredClientName,
                status: 'Requested',
                rewardStatus: 'None',
                notes,
                date: new Date().toISOString()
            });
            onClose();
            // Reset form
            setReferrerClientId(0);
            setReferredClientName('');
            setNotes('');
        } catch (error) {
            console.error('Error saving referral:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nova Indicação">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">
                        Cliente que Indicou
                    </label>
                    <select
                        value={referrerClientId}
                        onChange={(e) => setReferrerClientId(Number(e.target.value))}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                        required
                    >
                        <option value={0}>Selecione o cliente...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">
                        Nome do Indicado
                    </label>
                    <input
                        type="text"
                        value={referredClientName}
                        onChange={(e) => setReferredClientName(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                        placeholder="Nome da pessoa ou empresa indicada"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">
                        Observações
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-32 focus:ring-2 focus:ring-brand-gold outline-none transition-all resize-none"
                        placeholder="Telefone, e-mail ou contexto da indicação..."
                    ></textarea>
                </div>

                <div className="bg-brand-gold/5 border border-brand-gold/10 rounded-xl p-4">
                    <p className="text-xs text-brand-dark/70 italic">
                        <strong>Nota:</strong> Novas indicações são criadas com status "Requested" (Solicitada). O acompanhamento da conversão e premiação deve ser feito na aba de Indicações.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                        disabled={isSaving}
                    >
                        CANCELAR
                    </button>
                    <button
                        type="submit"
                        className="px-8 py-3 bg-brand-dark text-white rounded-xl font-bold hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                        disabled={isSaving}
                    >
                        {isSaving ? 'SALVANDO...' : 'REGISTRAR INDICAÇÃO'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
