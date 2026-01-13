import React, { useState } from 'react';
import { Card } from './common/Card';
import { Modal } from './common/Modal';
import { PlusIcon, FileTextIcon, SearchIcon, FilterIcon, ListIcon } from './common/Icon';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { SOP } from '../types';

export const SOPs: React.FC = () => {
    const { sops, addSOP, updateSOP, removeSOP } = useData();
    const { currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newSOP, setNewSOP] = useState<Partial<SOP>>({
        title: '',
        category: 'Geral',
        content: '',
        tags: [],
        version: '1.0'
    });
    const [isEditing, setIsEditing] = useState(false);

    // Categories tailored to the business modules
    const categories = ['All', 'Geral', 'Vendas', 'Produção', 'Financeiro', 'RH', 'Marketing', 'TI', 'Jurídico', 'Qualidade'];

    const filteredSOPs = sops.filter(sop => {
        const matchesSearch = sop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sop.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sop.tags && sop.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
        const matchesCategory = categoryFilter === 'All' || sop.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleSaveSOP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSOP.title || !newSOP.content || !currentUser) return;

        if (isEditing && selectedSOP) {
            await updateSOP({
                ...selectedSOP,
                ...newSOP,
                updatedAt: new Date().toISOString()
            } as SOP);
        } else {
            await addSOP({
                title: newSOP.title,
                category: newSOP.category || 'Geral',
                content: newSOP.content,
                authorId: currentUser.id,
                version: newSOP.version || '1.0',
                tags: newSOP.tags || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        setIsCreateModalOpen(false);
        setIsEditing(false);
        setNewSOP({ title: '', category: 'Geral', content: '', tags: [], version: '1.0' });
    };

    const handleEditClick = (sop: SOP) => {
        setNewSOP({
            title: sop.title,
            category: sop.category,
            content: sop.content,
            tags: sop.tags,
            version: sop.version
        });
        setIsEditing(true);
        setIsCreateModalOpen(true);
    };

    const handleDeleteSOP = async (id: number) => {
        if (confirm('Tem certeza que deseja excluir este procedimento?')) {
            await removeSOP(id);
            setSelectedSOP(null);
        }
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
        setNewSOP(prev => ({ ...prev, tags }));
    };

    return (
        <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-brand-dark dark:text-white">MANUAIS DE PROCESSO (SOPs)</h1>
                    <p className="text-gray-500">Base de conhecimento, procedimentos padrão e guias da empresa.</p>
                </div>
                {['Admin', 'CEO / Direção'].includes(currentUser?.role || '') && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-brand-gold text-brand-dark px-4 py-2 rounded-lg font-bold flex items-center shadow-lg hover:bg-yellow-500 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Novo Procedimento
                    </button>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Pesquisar manuais, conteúdo ou tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-gold text-gray-700 dark:text-gray-200"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto custom-scrollbar">
                    <FilterIcon className="text-gray-400 w-5 h-5 shrink-0" />
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${categoryFilter === cat
                                ? 'bg-brand-dark text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* List of SOPs */}
                <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredSOPs.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed dark:border-gray-700">
                            Nenhum documento encontrado.
                        </div>
                    ) : (
                        filteredSOPs.map(sop => (
                            <div
                                key={sop.id}
                                onClick={() => setSelectedSOP(sop)}
                                className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedSOP?.id === sop.id
                                    ? 'bg-brand-gold/10 border-brand-gold shadow-md'
                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-gray-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${selectedSOP?.id === sop.id
                                        ? 'bg-brand-gold text-brand-dark'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                        }`}>
                                        {sop.category}
                                    </span>
                                    <span className="text-xs text-gray-400 font-mono">v{sop.version}</span>
                                </div>
                                <h3 className={`font-bold mb-2 ${selectedSOP?.id === sop.id ? 'text-brand-dark dark:text-brand-gold' : 'text-gray-800 dark:text-gray-100'}`}>
                                    {sop.title}
                                </h3>
                                <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-2 border-t dark:border-gray-700/50">
                                    <div className="flex items-center gap-1">
                                        <FileTextIcon className="w-3 h-3" />
                                        <span>{new Date(sop.updatedAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                                {sop.tags && sop.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {sop.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Content View */}
                <div className="lg:col-span-2 h-full">
                    {selectedSOP ? (
                        <Card className="h-full min-h-[70vh] flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                            <div className="border-b dark:border-gray-700 pb-4 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="bg-brand-dark text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">
                                        {selectedSOP.category}
                                    </span>
                                    <div className="text-sm text-gray-500">
                                        Versão <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedSOP.version}</span> • {new Date(selectedSOP.updatedAt).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedSOP.title}</h2>
                                {selectedSOP.tags && selectedSOP.tags.length > 0 && (
                                    <div className="flex gap-2 mt-2">
                                        {selectedSOP.tags.map(tag => (
                                            <span key={tag} className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/10 px-2 py-1 rounded-md">#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="prose dark:prose-invert max-w-none flex-grow overflow-y-auto pr-2 custom-scrollbar text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                                {selectedSOP.content}
                            </div>

                            <div className="border-t dark:border-gray-700 pt-4 mt-4 text-xs text-gray-400 flex justify-between items-center">
                                <span>ID: {selectedSOP.id}</span>
                                <div>
                                    <span className="mr-4">Autor ID: {selectedSOP.authorId}</span>
                                    {['Admin', 'CEO / Direção'].includes(currentUser?.role || '') && (
                                        <div className="inline-flex gap-3">
                                            <button
                                                onClick={() => handleEditClick(selectedSOP)}
                                                className="text-brand-gold hover:text-yellow-400 font-bold transition-colors"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSOP(selectedSOP.id)}
                                                className="text-red-500 hover:text-red-400 font-bold transition-colors"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 min-h-[400px]">
                            <ListIcon className="w-16 h-16 mb-4 opacity-50 text-gray-300 dark:text-gray-600" />
                            <p className="font-medium text-lg">Selecione um documento pare leitura</p>
                            <p className="text-sm text-gray-500">ou crie um novo procedimento para a equipe.</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); setIsEditing(false); }} title={isEditing ? "Editar Procedimento Padrão (SOP)" : "Criar Novo Procedimento Padrão (SOP)"}>
                <form onSubmit={handleSaveSOP} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título do Documento</label>
                        <input
                            type="text"
                            required
                            value={newSOP.title}
                            onChange={(e) => setNewSOP({ ...newSOP, title: e.target.value })}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-gold focus:outline-none"
                            placeholder="Ex: Processo de Onboarding de Clientes"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                            <select
                                value={newSOP.category}
                                onChange={(e) => setNewSOP({ ...newSOP, category: e.target.value })}
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-gold focus:outline-none"
                            >
                                {categories.filter(c => c !== 'All').map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Versão Inicial</label>
                            <input
                                type="text"
                                value={newSOP.version}
                                onChange={(e) => setNewSOP({ ...newSOP, version: e.target.value })}
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-gold focus:outline-none"
                                placeholder="1.0"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (separadas por vírgula)</label>
                        <input
                            type="text"
                            value={newSOP.tags?.join(', ')}
                            onChange={handleTagsChange}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-gold focus:outline-none"
                            placeholder="vendas, crm, atendimento"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conteúdo (Markdown suportado)</label>
                        <textarea
                            required
                            value={newSOP.content}
                            onChange={(e) => setNewSOP({ ...newSOP, content: e.target.value })}
                            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white h-64 font-mono text-sm focus:ring-2 focus:ring-brand-gold focus:outline-none"
                            placeholder="# Título Principal&#10;&#10;## Subtítulo&#10;- Passo 1&#10;- Passo 2&#10;&#10;Este conteúdo será formatado."
                        ></textarea>
                        <p className="text-xs text-gray-500 mt-1 flex justify-between">
                            <span>Use Markdown para formatar o texto.</span>
                            <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Guia Markdown</a>
                        </p>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-brand-dark text-white rounded-lg hover:bg-black font-bold shadow-lg transition-transform active:scale-95"
                        >
                            Criar Procedimento
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
