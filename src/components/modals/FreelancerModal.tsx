import React, { useState, useEffect } from 'react';
import { Freelancer } from '../../types';
import { XIcon, HeartIcon } from '../common/Icon';

interface FreelancerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (freelancer: Omit<Freelancer, 'id' | 'createdAt'> | Freelancer) => Promise<void>;
    freelancerToEdit?: Freelancer;
}

export const FreelancerModal: React.FC<FreelancerModalProps> = ({ isOpen, onClose, onSubmit, freelancerToEdit }) => {
    const [name, setName] = useState('');
    const [mainFunction, setMainFunction] = useState('');
    const [averageRating, setAverageRating] = useState(0);
    const [availability, setAvailability] = useState('Disponível');
    const [usageFrequency, setUsageFrequency] = useState<'baixo' | 'médio' | 'alto'>('baixo');

    useEffect(() => {
        if (freelancerToEdit) {
            setName(freelancerToEdit.name);
            setMainFunction(freelancerToEdit.mainFunction);
            setAverageRating(freelancerToEdit.averageRating);
            setAvailability(freelancerToEdit.availability);
            setUsageFrequency(freelancerToEdit.usageFrequency);
        } else {
            setName('');
            setMainFunction('');
            setAverageRating(0);
            setAvailability('Disponível');
            setUsageFrequency('baixo');
        }
    }, [freelancerToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const freelancerData = {
            name,
            mainFunction,
            averageRating,
            availability,
            usageFrequency,
            associatedProjects: freelancerToEdit?.associatedProjects || []
        };

        if (freelancerToEdit) {
            await onSubmit({ ...freelancerToEdit, ...freelancerData });
        } else {
            await onSubmit(freelancerData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-dark border border-gray-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">{freelancerToEdit ? 'Editar Freelancer' : 'Novo Freelancer'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome Completo</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Função Principal</label>
                            <input
                                type="text"
                                value={mainFunction}
                                onChange={e => setMainFunction(e.target.value)}
                                className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none"
                                placeholder="Ex: Editor de Vídeo, Fotógrafo"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Avaliação Inicial</label>
                                <div className="flex gap-2 items-center h-[50px] px-3 bg-black/30 border border-gray-800 rounded-xl">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} type="button" onClick={() => setAverageRating(star)}>
                                            <HeartIcon className={`w-5 h-5 ${star <= averageRating ? 'fill-brand-gold text-brand-gold' : 'text-gray-600'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Frequência de Uso</label>
                                <select
                                    value={usageFrequency}
                                    onChange={e => setUsageFrequency(e.target.value as any)}
                                    className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none"
                                >
                                    <option value="baixo">Baixo</option>
                                    <option value="médio">Médio</option>
                                    <option value="alto">Alto</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Disponibilidade / Notas</label>
                            <textarea
                                value={availability}
                                onChange={e => setAvailability(e.target.value)}
                                className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none h-20"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 transition-colors">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-brand-gold text-brand-dark rounded-xl text-sm font-bold hover:bg-yellow-600 transition-colors">
                            {freelancerToEdit ? 'Salvar Alterações' : 'Cadastrar Freelancer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
