import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Client, ProductionProject, Feedback } from '../../types';
import { StarIcon } from '../common/Icon';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (feedback: Omit<Feedback, 'id'>) => Promise<void>;
    clients: Client[];
    projects: ProductionProject[];
    initialProjectId?: number;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
    isOpen, onClose, onSave, clients, projects, initialProjectId
}) => {
    const [clientId, setClientId] = useState<number>(0);
    const [projectId, setProjectId] = useState<number | undefined>(initialProjectId);
    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState('');
    const [testimonial, setTestimonial] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Filter projects based on selected client
    const filteredProjects = projects.filter(p => p.clientId === clientId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (clientId === 0) return;

        setIsSaving(true);
        try {
            await onSave({
                clientId,
                projectId,
                rating,
                comment,
                testimonial,
                status: 'Pending',
                date: new Date().toISOString()
            });
            onClose();
            // Reset form
            setClientId(0);
            setProjectId(undefined);
            setRating(5);
            setComment('');
            setTestimonial(false);
        } catch (error) {
            console.error('Error saving feedback:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Novo Feedback">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">
                        Cliente
                    </label>
                    <select
                        value={clientId}
                        onChange={(e) => setClientId(Number(e.target.value))}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                        required
                    >
                        <option value={0}>Selecione um cliente...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">
                        Projeto (Opcional)
                    </label>
                    <select
                        value={projectId || 0}
                        onChange={(e) => setProjectId(Number(e.target.value) || undefined)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none transition-all"
                    >
                        <option value={0}>Selecione um projeto...</option>
                        {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">
                        Avaliação
                    </label>
                    <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`p-2 transition-all ${star <= rating ? 'text-brand-gold' : 'text-gray-300 hover:text-gray-400'}`}
                            >
                                <StarIcon className={`w-8 h-8 ${star <= rating ? 'fill-brand-gold' : ''}`} />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">
                        Comentário
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-32 focus:ring-2 focus:ring-brand-gold outline-none transition-all resize-none"
                        placeholder="Descreva a experiência do cliente..."
                        required
                    ></textarea>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="testimonial"
                        checked={testimonial}
                        onChange={(e) => setTestimonial(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                    />
                    <label htmlFor="testimonial" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Autoriza uso como testemunho público?
                    </label>
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
                        {isSaving ? 'SALVANDO...' : 'SALVAR FEEDBACK'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
