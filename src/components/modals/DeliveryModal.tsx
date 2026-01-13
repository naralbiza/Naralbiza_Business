import React, { useState } from 'react';
import { Asset, Delivery, DeliveryStatus } from '../../types';
import { Modal } from '../common/Modal';

interface DeliveryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (delivery: Omit<Delivery, 'id' | 'createdAt' | 'views' | 'assets'>, assetIds: number[]) => Promise<void>;
    selectedAssets: Asset[];
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({ isOpen, onClose, onSave, selectedAssets }) => {
    const [title, setTitle] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Generate a simple token (in production this might be more robust or handled by backend)
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            await onSave({
                title,
                recipientEmail,
                shareLinkToken: token,
                status: DeliveryStatus.Sent, // Default to Sent for now
                expiresAt: expiresAt || undefined,
                createdBy: 'user', // This will be handled by backend or context usually, but api expects it. context should fill it or we pass it?
                // api.ts createDelivery takes createdBy. DataContext should probably inject currentUser.id.
                // We will pass a placeholder and let DataContext handle it if possible, or pass it from here if we have user.
                // Actually, DataContext's addDelivery calls createDelivery. Let's see DataContext.
            }, selectedAssets.map(a => a.id));
            onClose();
        } catch (error) {
            console.error("Error creating delivery:", error);
            alert("Erro ao criar entrega.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Criar Nova Entrega">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-gray-800 p-4 rounded mb-4">
                    <h4 className="text-sm font-bold text-gray-300 mb-2">Ativos Selecionados ({selectedAssets.length})</h4>
                    <ul className="text-xs text-gray-400 max-h-32 overflow-y-auto">
                        {selectedAssets.map(a => (
                            <li key={a.id} className="flex justify-between py-1 border-b border-gray-700 last:border-0">
                                <span>{a.title}</span>
                                <span className="uppercase text-[10px] bg-gray-700 px-1 rounded">{a.type}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Título da Entrega</label>
                    <input
                        required
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Fotos do Casamento - Final"
                        className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email do Destinatário</label>
                    <input
                        required
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="cliente@exemplo.com"
                        className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Validade (Opcional)</label>
                    <input
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="mr-3 px-4 py-2 text-gray-300 hover:text-white"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading || selectedAssets.length === 0}
                        className="px-4 py-2 bg-brand-gold text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                    >
                        {loading ? 'Criando...' : 'Criar Entrega'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
