import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { EditorialContent, Employee } from '../../types';

interface EditorialContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (content: Omit<EditorialContent, 'id'>) => Promise<void>;
    employees: Employee[];
    editingContent?: EditorialContent | null;
}

export const EditorialContentModal: React.FC<EditorialContentModalProps> = ({
    isOpen,
    onClose,
    onSave,
    employees,
    editingContent
}) => {
    const [formData, setFormData] = useState<Omit<EditorialContent, 'id'>>({
        title: '',
        format: 'Video',
        platform: 'Instagram',
        publishDate: new Date().toISOString().slice(0, 10),
        status: 'Planned',
        responsibleId: 0,
        notes: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingContent) {
            setFormData({
                title: editingContent.title,
                format: editingContent.format,
                platform: editingContent.platform,
                publishDate: editingContent.publishDate,
                status: editingContent.status,
                responsibleId: editingContent.responsibleId,
                notes: editingContent.notes || ''
            });
        } else {
            setFormData({
                title: '',
                format: 'Video',
                platform: 'Instagram',
                publishDate: new Date().toISOString().slice(0, 10),
                status: 'Planned',
                responsibleId: employees.length > 0 ? employees[0].id : 0,
                notes: ''
            });
        }
    }, [editingContent, isOpen, employees]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Error saving editorial content:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingContent ? "Editar Conteúdo" : "Agendar Conteúdo"}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Título do Conteúdo</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors"
                        placeholder="Ex: Teaser do Evento Corporativo X"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Formato</label>
                        <select
                            value={formData.format}
                            onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                            className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors"
                            required
                        >
                            <option value="Video">Vídeo</option>
                            <option value="Photo">Foto</option>
                            <option value="Article">Artigo</option>
                            <option value="Reel">Reel / Short</option>
                            <option value="Story">Story</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Plataforma</label>
                        <select
                            value={formData.platform}
                            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                            className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors"
                            required
                        >
                            <option value="Instagram">Instagram</option>
                            <option value="Youtube">Youtube</option>
                            <option value="Facebook">Facebook</option>
                            <option value="TikTok">TikTok</option>
                            <option value="Website">Website</option>
                            <option value="LinkedIn">LinkedIn</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Data de Publicação</label>
                        <input
                            type="date"
                            value={formData.publishDate}
                            onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                            className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Responsável</label>
                        <select
                            value={formData.responsibleId}
                            onChange={(e) => setFormData({ ...formData, responsibleId: parseInt(e.target.value) })}
                            className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors"
                            required
                        >
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors"
                        required
                    >
                        <option value="Draft">Rascunho</option>
                        <option value="Planned">Planejado</option>
                        <option value="In Production">Em Produção</option>
                        <option value="Published">Publicado</option>
                        <option value="Archived">Arquivado</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Notas de Produção</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full bg-brand-dark border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-colors min-h-[80px]"
                        placeholder="Scripts, legendas, referências..."
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
                        {loading ? "Salvando..." : editingContent ? "Atualizar" : "Agendar Conteúdo"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
