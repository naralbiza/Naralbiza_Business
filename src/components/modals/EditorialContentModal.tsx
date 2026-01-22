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
        responsibleId: employees.length > 0 ? employees[0].id : '',
        content: '',
        visualBrief: ''
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
                content: editingContent.content || '',
                visualBrief: editingContent.visualBrief || ''
            });
        } else {
            setFormData({
                title: '',
                format: 'Video',
                platform: 'Instagram',
                publishDate: new Date().toISOString().slice(0, 10),
                status: 'Planned',
                responsibleId: employees.length > 0 ? employees[0].id : '',
                content: '',
                visualBrief: ''
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
                    <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Título do Conteúdo</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300 placeholder:text-black/30"
                        placeholder="Ex: Teaser do Evento Corporativo X"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Formato</label>
                        <select
                            value={formData.format}
                            onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
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
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Plataforma</label>
                        <select
                            value={formData.platform}
                            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Data de Publicação</label>
                        <input
                            type="date"
                            value={formData.publishDate}
                            onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Responsável</label>
                        <select
                            value={formData.responsibleId}
                            onChange={(e) => setFormData({ ...formData, responsibleId: e.target.value })}
                            className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
                            required
                        >
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300"
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
                    <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Conteúdo / Detalhes</label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300 min-h-[100px] placeholder:text-black/30"
                        placeholder="Scripts, legendas, referências..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Briefing Visual / Referências</label>
                    <textarea
                        value={formData.visualBrief || ''}
                        onChange={(e) => setFormData({ ...formData, visualBrief: e.target.value })}
                        className="w-full bg-white border-2 border-black/5 rounded-2xl px-5 py-4 text-black font-bold focus:border-brand-gold outline-none transition-all duration-300 min-h-[80px] placeholder:text-black/30"
                        placeholder="Estilo visual, referências de imagem/vídeo..."
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
                        {loading ? "Salvando..." : editingContent ? "Atualizar Conteúdo" : "Agendar Conteúdo"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
