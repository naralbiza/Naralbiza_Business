import React, { useState } from 'react';
import { CultureFeedback, User } from '../../types';
import { XIcon, HeartIcon } from '../common/Icon';

interface CultureFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (feedback: Omit<CultureFeedback, 'id' | 'createdAt'>) => Promise<void>;
    currentUser: User | null;
}

export const CultureFeedbackModal: React.FC<CultureFeedbackModalProps> = ({ isOpen, onClose, onSubmit, currentUser }) => {
    const [anonymous, setAnonymous] = useState(false);
    const [satisfactionScore, setSatisfactionScore] = useState(0);
    const [motivationScore, setMotivationScore] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser && !anonymous) {
            alert('Erro: Usuário não identificado');
            return;
        }

        await onSubmit({
            employeeId: currentUser ? currentUser.id : 'anonymous', // Handling potential null user if allowed contextually
            anonymous,
            satisfactionScore,
            motivationScore,
            feedbackText,
            date: new Date().toISOString()
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-dark border border-gray-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">Pesquisa de Clima & Cultura</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                            <input
                                type="checkbox"
                                id="anon"
                                checked={anonymous}
                                onChange={e => setAnonymous(e.target.checked)}
                                className="w-5 h-5 rounded bg-black border-gray-600 text-brand-gold focus:ring-0"
                            />
                            <label htmlFor="anon" className="text-sm text-gray-300 font-bold select-none cursor-pointer">
                                Enviar de forma anónima
                            </label>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">Nível de Satisfação Geral</label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} type="button" onClick={() => setSatisfactionScore(star)} className="transition-transform hover:scale-110">
                                        <HeartIcon className={`w-8 h-8 ${star <= satisfactionScore ? 'fill-brand-gold text-brand-gold' : 'text-gray-700'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">Nível de Motivação Atual</label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map(v => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setMotivationScore(v)}
                                        className={`w-10 h-10 rounded-full font-bold transition-all ${motivationScore === v ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-800 text-gray-500'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Comentários / Sugestões</label>
                            <textarea
                                value={feedbackText}
                                onChange={e => setFeedbackText(e.target.value)}
                                placeholder="Compartilhe o que estamos fazendo bem ou o que podemos melhorar..."
                                className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none h-32 text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
                        <button type="submit" className="w-full py-3 bg-brand-gold text-brand-dark rounded-xl text-sm font-black hover:bg-yellow-600 transition-colors shadow-lg shadow-brand-gold/20">
                            ENVIAR FEEDBACK
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
