import React, { useState } from 'react';
import { FollowUp, FollowUpType } from '../types';
import { MailIcon, PhoneIcon, MessageCircleIcon, CalendarIcon, PlusIcon, TrashIcon, ClockIcon, CheckCircleIcon, AlertTriangleIcon, StarIcon } from './common/Icon';
import { Card } from './common/Card';
import { FollowUpChart } from './FollowUpChart';

interface FollowUpTimelineProps {
    leadId: string;
    followUps: FollowUp[];
    onAdd: (followUp: Omit<FollowUp, 'id' | 'createdAt'>) => Promise<void>;
    onRemove: (id: string) => Promise<void>;
}

const getTypeIcon = (type: FollowUpType) => {
    switch (type) {
        case FollowUpType.Email: return <MailIcon className="w-4 h-4" />;
        case FollowUpType.Phone: return <PhoneIcon className="w-4 h-4" />;
        case FollowUpType.Meeting: return <ClockIcon className="w-4 h-4" />;
        case FollowUpType.WhatsApp: return <MessageCircleIcon className="w-4 h-4" />;
        default: return <MessageCircleIcon className="w-4 h-4" />;
    }
};

export const FollowUpTimeline: React.FC<FollowUpTimelineProps> = ({ leadId, followUps, onAdd, onRemove }) => {
    const [showForm, setShowForm] = useState(false);
    const [type, setType] = useState<FollowUpType>(FollowUpType.Email);
    const [notes, setNotes] = useState('');
    const [scheduledAt, setScheduledAt] = useState(new Date().toISOString());
    const [duration, setDuration] = useState<number | ''>('');
    const [outcome, setOutcome] = useState('');
    const [rating, setRating] = useState<number | ''>('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notes.trim()) return;
        setIsSaving(true);
        try {
            await onAdd({
                leadId,
                type,
                notes,
                scheduledAt: scheduledAt || null,
                completedAt: new Date().toISOString(),
                duration: duration === '' ? undefined : Number(duration),
                outcome: outcome || undefined,
                rating: rating === '' ? undefined : Number(rating)
            });
            setShowForm(false);
            setNotes('');
            setDuration('');
            setOutcome('');
            setRating('');
        } catch (error) {
            console.error("Error adding follow-up:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <h3 className="font-bold text-lg text-brand-dark dark:text-white">Interações e Follow-up</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-brand-gold text-brand-dark px-3 py-1.5 rounded-lg text-sm font-bold shadow hover:bg-yellow-500 transition-colors"
                >
                    <PlusIcon className="w-4 h-4" /> {showForm ? 'Cancelar' : 'Registrar Contato'}
                </button>
            </div>

            {showForm && (
                <Card className="bg-gray-50 dark:bg-gray-800/50 border-brand-gold/30">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Contato</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as FollowUpType)}
                                    className="w-full p-2.5 border rounded-lg dark:bg-gray-700 outline-none"
                                >
                                    {Object.values(FollowUpType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                                <input
                                    type="datetime-local"
                                    value={scheduledAt.slice(0, 16)}
                                    onChange={(e) => setScheduledAt(new Date(e.target.value).toISOString())}
                                    className="w-full p-2.5 border rounded-lg dark:bg-gray-700 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duração (min)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    placeholder="Ex: 15"
                                    className="w-full p-2 border rounded dark:bg-gray-700 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Resultado</label>
                                <select
                                    value={outcome}
                                    onChange={(e) => setOutcome(e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-700 outline-none"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Positivo">Positivo</option>
                                    <option value="Negativo">Negativo</option>
                                    <option value="Neutro">Neutro</option>
                                    <option value="Reagendado">Reagendado</option>
                                    <option value="Sem Resposta">Sem Resposta</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qualidade (1-5)</label>
                                <select
                                    value={rating}
                                    onChange={(e) => setRating(Number(e.target.value))}
                                    className="w-full p-2 border rounded dark:bg-gray-700 outline-none"
                                >
                                    <option value="">-</option>
                                    <option value="1">1 - Ruim</option>
                                    <option value="2">2 - Fraco</option>
                                    <option value="3">3 - Regular</option>
                                    <option value="4">4 - Bom</option>
                                    <option value="5">5 - Excelente</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notas da Interação</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                placeholder="Descreva o que foi conversado..."
                                className="w-full p-2.5 border rounded-lg dark:bg-gray-700 outline-none resize-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-brand-dark text-white py-2.5 rounded-lg font-bold hover:bg-black transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Salvando...' : 'Salvar Interação'}
                        </button>
                    </form>
                </Card>
            )}

            {followUps.length > 0 && <FollowUpChart followUps={followUps} />}

            <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {followUps.length === 0 ? (
                    <p className="text-center py-8 text-gray-400 italic bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed ml-10">Nenhuma interação registrada.</p>
                ) : (
                    [...followUps].sort((a, b) => new Date(b.scheduledAt || b.createdAt).getTime() - new Date(a.scheduledAt || a.createdAt).getTime()).map((item) => (
                        <div key={item.id} className="relative flex items-start gap-4 group">
                            <div className="flex items-center justify-center p-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm z-10 shrink-0 mt-1">
                                {getTypeIcon(item.type)}
                            </div>
                            <div className="flex-grow bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-brand-dark dark:text-white">{item.type}</span>
                                            {item.duration && (
                                                <span className="text-xs bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                                    <ClockIcon className="w-3 h-3" /> {item.duration} min
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1">
                                            {new Date(item.scheduledAt || item.createdAt).toLocaleString('pt-BR')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.outcome && (
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase
                                                ${item.outcome === 'Positivo' ? 'bg-green-100 text-green-700' :
                                                    item.outcome === 'Negativo' ? 'bg-red-100 text-red-700' :
                                                        item.outcome === 'Neutro' ? 'bg-gray-100 text-gray-700' :
                                                            'bg-blue-100 text-blue-700'}`}>
                                                {item.outcome}
                                            </span>
                                        )}
                                        {item.rating && (
                                            <div className="flex text-brand-gold">
                                                {[...Array(item.rating)].map((_, i) => (
                                                    <StarIcon key={i} className="w-3 h-3 fill-current" />
                                                ))}
                                            </div>
                                        )}
                                        <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                            <TrashIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{item.notes}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
