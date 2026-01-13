import React, { useState } from 'react';
import { Training, User } from '../../types';
import { XIcon } from '../common/Icon';

interface TrainingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (training: Omit<Training, 'id' | 'createdAt'>) => Promise<void>;
    employees: User[];
}

export const TrainingModal: React.FC<TrainingModalProps> = ({ isOpen, onClose, onSubmit, employees }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Treinamento');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [employeeId, setEmployeeId] = useState('');
    const [impactLevel, setImpactLevel] = useState(3);
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            title,
            type,
            date,
            employeeId,
            impactLevel,
            notes
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-brand-dark border border-gray-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">Registrar Capacitação</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Título do Treinamento</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipo</label>
                                <select
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                    className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none"
                                >
                                    <option value="Treinamento">Treinamento</option>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Curso">Curso</option>
                                    <option value="Mentoria">Mentoria</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Colaborador (Opcional/Responsável)</label>
                            <select
                                value={employeeId}
                                onChange={e => setEmployeeId(e.target.value)}
                                className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none"
                            >
                                <option value="">Sem vínculo específico</option>
                                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nível de Impacto (1-5)</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(lvl => (
                                    <button
                                        key={lvl}
                                        type="button"
                                        onClick={() => setImpactLevel(lvl)}
                                        className={`w-10 h-10 rounded-xl font-bold transition-all ${impactLevel === lvl ? 'bg-brand-gold text-brand-dark' : 'bg-gray-800 text-gray-500'}`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Notas / Descrição</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="w-full bg-black/30 border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold/50 outline-none h-24"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 transition-colors">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-brand-gold text-brand-dark rounded-xl text-sm font-bold hover:bg-yellow-600 transition-colors">
                            Registrar Evento
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
