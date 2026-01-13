import React, { useState, useEffect } from 'react';
import { Asset, User, ProductionProject, Client } from '../../types';
import { Modal } from '../common/Modal';
import { uploadProjectFile } from '../../services/api';

interface AssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (asset: Omit<Asset, 'id' | 'createdAt' | 'versions'>) => Promise<void>;
    clients: Client[];
    projects: ProductionProject[];
    initialData?: Asset;
}

export const AssetModal: React.FC<AssetModalProps> = ({ isOpen, onClose, onSave, clients, projects, initialData }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'photo' | 'video' | 'design'>('photo');
    const [clientId, setClientId] = useState<string | ''>('');
    const [projectId, setProjectId] = useState<string | ''>('');
    const [tags, setTags] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [currentUrl, setCurrentUrl] = useState('');
    const [dimensions, setDimensions] = useState('');

    const [usageRights, setUsageRights] = useState({
        canExpire: false,
        expiresAt: '',
        territories: '',
        medias: '',
        notes: ''
    });

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description || '');
            setType(initialData.type);
            setClientId(initialData.clientId || '');
            setProjectId(initialData.projectId || '');
            setTags(initialData.tags.join(', '));
            setDimensions(initialData.dimensions || '');
            setCurrentUrl(initialData.url);
            if (initialData.usageRights) {
                setUsageRights({
                    canExpire: initialData.usageRights.canExpire,
                    expiresAt: initialData.usageRights.expiresAt || '',
                    territories: initialData.usageRights.territories?.join(', ') || '',
                    medias: initialData.usageRights.medias?.join(', ') || '',
                    notes: initialData.usageRights.notes || ''
                });
            }
        } else {
            setTitle('');
            setDescription('');
            setType('photo');
            setClientId('');
            setProjectId('');
            setTags('');
            setDimensions('');
            setFile(null);
            setCurrentUrl('');
            setUsageRights({
                canExpire: false,
                expiresAt: '',
                territories: '',
                medias: '',
                notes: ''
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        try {
            let url = currentUrl;

            if (file) {
                const bucket = type === 'video' ? 'videos' : 'photos'; // Simple mapping
                try {
                    url = await uploadProjectFile(file, bucket);
                } catch (err) {
                    console.error("Upload failed", err);
                    alert("Falha no upload do arquivo. Tente novamente.");
                    setUploading(false);
                    return;
                }
            }

            if (!url) {
                alert("Por favor, faça upload de um arquivo ou forneça uma URL.");
                setUploading(false);
                return;
            }

            // Construct UsageRights object if any field is filled
            const hasUsageRights = usageRights.canExpire || usageRights.territories || usageRights.medias || usageRights.notes;
            const formattedUsageRights = hasUsageRights ? {
                canExpire: usageRights.canExpire,
                expiresAt: usageRights.expiresAt || undefined,
                territories: usageRights.territories.split(',').map(t => t.trim()).filter(t => t),
                medias: usageRights.medias.split(',').map(t => t.trim()).filter(t => t),
                notes: usageRights.notes
            } : undefined;

            await onSave({
                title,
                description,
                type,
                clientId: clientId === '' ? undefined : clientId,
                projectId: projectId === '' ? undefined : projectId,
                tags: tags.split(',').map(t => t.trim()).filter(t => t),
                dimensions,
                url,
                fileSize: file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : undefined,
                usageRights: formattedUsageRights
            });
            onClose();
        } catch (error) {
            console.error("Error saving asset:", error);
            alert("Erro ao salvar ativo.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar Ativo" : "Novo Ativo"}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Título</label>
                    <input
                        required
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Tipo</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    >
                        <option value="photo">Foto</option>
                        <option value="video">Vídeo</option>
                        <option value="design">Design</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Arquivo</label>
                    <input
                        type="file"
                        accept={type === 'video' ? "video/*" : "image/*"}
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full bg-gray-700 text-white rounded p-2"
                    />
                    {currentUrl && !file && (
                        <p className="text-xs text-gray-500 mt-1">Arquivo atual: <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">Link</a></p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Cliente (Opcional)</label>
                    <select
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    >
                        <option value="">Selecione...</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name} - {c.company}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Projeto (Opcional)</label>
                    <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    >
                        <option value="">Selecione...</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Descrição</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Tags (separadas por vírgula)</label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="casamento, praia, drone..."
                        className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                </div>

                {/* Usage Rights Section */}
                <div className="border-t border-gray-600 pt-4 mt-4">
                    <h3 className="text-sm font-bold text-white mb-3">Direitos de Uso</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="canExpire"
                                checked={usageRights.canExpire}
                                onChange={(e) => setUsageRights({ ...usageRights, canExpire: e.target.checked })}
                                className="rounded bg-gray-700 border-gray-600 text-brand-gold focus:ring-brand-gold"
                            />
                            <label htmlFor="canExpire" className="text-sm text-gray-300">Tem validade?</label>
                        </div>

                        {usageRights.canExpire && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Data de Expiração</label>
                                <input
                                    type="date"
                                    value={usageRights.expiresAt}
                                    onChange={(e) => setUsageRights({ ...usageRights, expiresAt: e.target.value })}
                                    className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Territórios (separados por vírgula)</label>
                            <input
                                type="text"
                                value={usageRights.territories}
                                onChange={(e) => setUsageRights({ ...usageRights, territories: e.target.value })}
                                placeholder="Brasil, Mundo, Online..."
                                className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Mídias (separadas por vírgula)</label>
                            <input
                                type="text"
                                value={usageRights.medias}
                                onChange={(e) => setUsageRights({ ...usageRights, medias: e.target.value })}
                                placeholder="TV, Internet, Impresso..."
                                className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Notas de Direitos</label>
                            <textarea
                                value={usageRights.notes}
                                onChange={(e) => setUsageRights({ ...usageRights, notes: e.target.value })}
                                rows={2}
                                className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="mr-3 px-4 py-2 text-gray-300 hover:text-white"
                        disabled={uploading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={uploading}
                        className="px-4 py-2 bg-brand-gold text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                    >
                        {uploading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

