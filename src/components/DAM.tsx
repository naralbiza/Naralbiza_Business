import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Asset, Delivery, UsageRights, DeliveryStatus } from '../types';
import {
    DAMIcon, SearchIcon, FilterIcon, PlusIcon, ImageIcon, PlayIcon,
    ShareIcon, FileTextIcon, DownloadIcon, TrashIcon, CheckCircleIcon,
    ListIcon, DashboardIcon, EditIcon // Using DashboardIcon as GridIcon for now
} from './common/Icon';
import { AssetModal } from './modals/AssetModal';
import { DeliveryModal } from './modals/DeliveryModal';

interface DAMContentProps {
    showHeader?: boolean;
}

export const DAMContent: React.FC<DAMContentProps> = ({ showHeader = true }) => {
    const { assets, addAsset, updateAssetData, clients, productionProjects, deliveries, addDelivery, updateDeliveryData, removeDelivery } = useData();
    const [activeTab, setActiveTab] = useState<'gallery' | 'deliveries' | 'rights'>('gallery');

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'photo' | 'video' | 'design'>('all');
    const [selectedClient, setSelectedClient] = useState<string>('');

    // Selection
    const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);

    // Modals
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | undefined>(undefined);

    // Filtered Assets
    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType === 'all' || asset.type === filterType;
        // Use loose equality or string comparison for UUIDs
        const matchesClient = selectedClient === '' || asset.clientId === selectedClient;

        return matchesSearch && matchesType && matchesClient;
    });

    const toggleAssetSelection = (id: number) => {
        setSelectedAssetIds(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const handleSaveAsset = async (assetData: any) => {
        try {
            if (editingAsset) {
                const updatedAsset = {
                    ...editingAsset,
                    ...assetData,
                    // Preserve existing ID and other fields that form doesn't touch
                    id: editingAsset.id,
                    createdAt: editingAsset.createdAt,
                    versions: editingAsset.versions
                };
                await updateAssetData(updatedAsset);
            } else {
                await addAsset(assetData);
            }
            setIsAssetModalOpen(false);
            setEditingAsset(undefined);
        } catch (error) {
            console.error("Error saving asset", error);
        }
    };

    const handleCreateDelivery = async (delivery: any, assetIds: number[]) => {
        await addDelivery(delivery, assetIds);
        setSelectedAssetIds([]);
        setActiveTab('deliveries');
    };

    const handleShareLink = (token: string) => {
        const url = `${window.location.origin}/delivery/${token}`;
        navigator.clipboard.writeText(url);
        alert("Link copiado para a área de transferência!");
    };

    const getClientName = (id?: string) => clients.find(c => c.id === id)?.name || 'N/A';
    const getProjectTitle = (id?: string) => productionProjects.find(p => p.id === id)?.title || 'N/A';

    return (
        <div className="p-8 pb-32">
            <div className={`flex justify-between items-center mb-8 ${!showHeader ? 'justify-end' : ''}`}>
                {showHeader && (
                    <div>
                        <h1 className="text-3xl font-black text-white flex items-center">
                            <DAMIcon className="w-8 h-8 mr-3 text-brand-gold" />
                            ACTIVOS CRIATIVOS
                        </h1>
                        <p className="text-gray-400 mt-1">Gestão centralizada de fotos, vídeos e entregas.</p>
                    </div>
                )}
                <div className="flex gap-3">
                    {activeTab === 'gallery' && (
                        <>
                            {selectedAssetIds.length > 0 && (
                                <button
                                    onClick={() => setIsDeliveryModalOpen(true)}
                                    className="flex items-center px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-lg shadow-brand-gold/20"
                                >
                                    <ShareIcon className="w-5 h-5 mr-2" />
                                    Criar Entrega ({selectedAssetIds.length})
                                </button>
                            )}
                            <button
                                onClick={() => setIsAssetModalOpen(true)}
                                className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Novo Ativo
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-6 border-b border-gray-800 mb-6">
                <button
                    onClick={() => setActiveTab('gallery')}
                    className={`pb-3 text-sm font-bold tracking-wider uppercase transition-colors border-b-2 ${activeTab === 'gallery' ? 'border-brand-gold text-brand-gold' : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    Galeria
                </button>
                <button
                    onClick={() => setActiveTab('deliveries')}
                    className={`pb-3 text-sm font-bold tracking-wider uppercase transition-colors border-b-2 ${activeTab === 'deliveries' ? 'border-brand-gold text-brand-gold' : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    Entregas
                </button>
                <button
                    onClick={() => setActiveTab('rights')}
                    className={`pb-3 text-sm font-bold tracking-wider uppercase transition-colors border-b-2 ${activeTab === 'rights' ? 'border-brand-gold text-brand-gold' : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                >
                    Direitos de Uso
                </button>
            </div>

            {/* Content */}
            {activeTab === 'gallery' && (
                <div className="animate-fade-in">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                        <div className="flex-1 relative min-w-[200px]">
                            <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Buscar por título ou tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-900 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-brand-gold transition-colors"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-brand-gold"
                            >
                                <option value="all">Todos os Tipos</option>
                                <option value="photo">Fotos</option>
                                <option value="video">Vídeos</option>
                                <option value="design">Design</option>
                            </select>
                            <select
                                value={selectedClient}
                                onChange={(e) => setSelectedClient(e.target.value)}
                                className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-brand-gold"
                            >
                                <option value="">Todos os Clientes</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredAssets.map(asset => (
                            <div
                                key={asset.id}
                                className={`group relative bg-gray-800 rounded-xl overflow-hidden border transition-all duration-300 ${selectedAssetIds.includes(asset.id) ? 'border-brand-gold shadow-lg shadow-brand-gold/10 ring-1 ring-brand-gold' : 'border-gray-700 hover:border-gray-500'
                                    }`}
                            >
                                <div
                                    className="aspect-square bg-gray-900 relative cursor-pointer"
                                    onClick={() => toggleAssetSelection(asset.id)}
                                >
                                    {asset.type === 'photo' || asset.type === 'design' ? (
                                        <img src={asset.thumbnailUrl || asset.url} alt={asset.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-black/50">
                                            {asset.thumbnailUrl ? (
                                                <img src={asset.thumbnailUrl} alt={asset.title} className="w-full h-full object-cover opacity-50" />
                                            ) : (
                                                <PlayIcon className="w-12 h-12 text-white/50" />
                                            )}
                                        </div>
                                    )}

                                    {/* Type Badge */}
                                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm p-1.5 rounded-lg text-white pointer-events-none">
                                        {asset.type === 'video' ? <PlayIcon className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                                    </div>

                                    {/* Selection Overlay */}
                                    <div className={`absolute inset-0 bg-brand-gold/20 transition-opacity flex items-center justify-center ${selectedAssetIds.includes(asset.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${selectedAssetIds.includes(asset.id) ? 'bg-brand-gold border-brand-gold text-white' : 'border-white text-transparent'}`}>
                                            <CheckCircleIcon className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-white font-bold truncate text-sm flex-1 mr-2" title={asset.title}>{asset.title}</h3>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingAsset(asset);
                                                setIsAssetModalOpen(true);
                                            }}
                                            className="text-gray-500 hover:text-white transition-colors"
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2">
                                                <span className="text-[10px] uppercase text-gray-500 tracking-wider font-medium bg-gray-700/50 px-2 py-1 rounded">
                                                    {asset.fileSize || 'Unknown Size'}
                                                </span>
                                                {asset.dimensions && (
                                                    <span className="text-[10px] uppercase text-gray-500 tracking-wider font-medium bg-gray-700/50 px-2 py-1 rounded">
                                                        {asset.dimensions}
                                                    </span>
                                                )}
                                            </div>
                                            {asset.clientId && (
                                                <span className="text-[10px] text-gray-400 truncate max-w-[80px]" title={getClientName(asset.clientId)}>
                                                    {getClientName(asset.clientId)}
                                                </span>
                                            )}
                                        </div>
                                        {asset.projectId && (
                                            <span className="text-[10px] text-gray-500 truncate w-full block" title={getProjectTitle(asset.projectId)}>
                                                Proj: {getProjectTitle(asset.projectId)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'deliveries' && (
                <div className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {deliveries.map(delivery => (
                            <div key={delivery.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">{delivery.title}</h3>
                                        <p className="text-sm text-gray-400">{delivery.recipientEmail}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${delivery.status === DeliveryStatus.Viewed ? 'bg-green-500/20 text-green-500' :
                                        delivery.status === DeliveryStatus.Expired ? 'bg-red-500/20 text-red-500' :
                                            'bg-blue-500/20 text-blue-500'
                                        }`}>
                                        {delivery.status}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-900/50 p-3 rounded-lg">
                                        <span>Visualizações</span>
                                        <span className="text-white font-bold">{delivery.views}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-900/50 p-3 rounded-lg">
                                        <span>Expirar em</span>
                                        <span className="text-white font-bold">{delivery.expiresAt ? new Date(delivery.expiresAt).toLocaleDateString() : 'Nunca'}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-6">
                                    <button
                                        onClick={() => handleShareLink(delivery.shareLinkToken)}
                                        className="flex-1 flex items-center justify-center px-3 py-2 bg-brand-gold/10 text-brand-gold rounded hover:bg-brand-gold/20 transition-colors text-sm font-bold"
                                    >
                                        <ShareIcon className="w-4 h-4 mr-2" />
                                        Compartilhar
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Apagar entrega?")) removeDelivery(delivery.id);
                                        }}
                                        className="px-3 py-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'rights' && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden animate-fade-in">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Ativo</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Projeto</th>
                                <th className="p-4">Status dos Direitos</th>
                                <th className="p-4">Validade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {assets.map(asset => (
                                <tr key={asset.id} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded bg-gray-900 mr-3 overflow-hidden">
                                                <img src={asset.thumbnailUrl || asset.url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-white font-bold text-sm">{asset.title}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300 text-sm">{getClientName(asset.clientId)}</td>
                                    <td className="p-4 text-gray-300 text-sm">{getProjectTitle(asset.projectId)}</td>
                                    <td className="p-4">
                                        <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-bold uppercase">
                                            Liberado
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm">
                                        {asset.usageRights?.expiresAt ? new Date(asset.usageRights.expiresAt).toLocaleDateString() : 'Vitalício'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <AssetModal
                isOpen={isAssetModalOpen}
                onClose={() => {
                    setIsAssetModalOpen(false);
                    setEditingAsset(undefined);
                }}
                onSave={handleSaveAsset}
                clients={clients}
                projects={productionProjects}
                initialData={editingAsset}
            />

            <DeliveryModal
                isOpen={isDeliveryModalOpen}
                onClose={() => setIsDeliveryModalOpen(false)}
                onSave={handleCreateDelivery}
                selectedAssets={assets.filter(a => selectedAssetIds.includes(a.id))}
            />
        </div>
    );
};

export const DAM: React.FC = () => {
    return <DAMContent />;
};
