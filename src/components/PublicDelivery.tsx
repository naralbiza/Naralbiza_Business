import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDeliveryByToken, incrementDeliveryViews } from '../services/api';
import { Delivery, DeliveryStatus } from '../types';
import { DownloadIcon, PlayIcon, ImageIcon } from './common/Icon';

export const PublicDelivery: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [delivery, setDelivery] = useState<Delivery | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDelivery = async () => {
            if (!token) return;
            try {
                const data = await getDeliveryByToken(token);
                setDelivery(data);

                // Check expiration
                if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
                    setError('Este link de entrega expirou.');
                    return;
                }

                if (data.status === DeliveryStatus.Expired) {
                    setError('Esta entrega não está mais disponível.');
                    return;
                }

                // Increment view count
                await incrementDeliveryViews(data.id, data.views);

            } catch (err) {
                console.error(err);
                setError('Entrega não encontrada ou link inválido.');
            } finally {
                setLoading(false);
            }
        };
        fetchDelivery();
    }, [token]);

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error("Download failed", e);
            window.open(url, '_blank');
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Carregando...</div>;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-8">
                <div className="bg-red-500/10 p-8 rounded-2xl border border-red-500/20 text-center max-w-md">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Acesso Negado</h1>
                    <p className="text-gray-300">{error}</p>
                </div>
            </div>
        );
    }

    if (!delivery) return null;

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-widest text-white">NARALBIZA</h1>
                        <p className="text-[10px] text-brand-gold font-bold tracking-[0.2em] uppercase">Studios</p>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <div className="pt-32 pb-12 px-6 bg-gradient-to-b from-gray-800/50 to-gray-900">
                <div className="container mx-auto text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">{delivery.title}</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Aqui estão os arquivos preparados para você. Selecione os itens que deseja baixar ou visualize diretamente na galeria abaixo.
                    </p>
                    <div className="mt-8 flex justify-center gap-4 text-sm text-gray-500">
                        <span>{delivery.assets?.length} arquivos</span>
                        <span>•</span>
                        <span>Válido até: {delivery.expiresAt ? new Date(delivery.expiresAt).toLocaleDateString() : 'Indeterminado'}</span>
                    </div>
                </div>
            </div>

            {/* Gallery */}
            <div className="container mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {delivery.assets?.map((asset) => (
                        <div key={asset.id} className="group relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-brand-gold transition-all duration-300">
                            <div className="aspect-square bg-gray-900 relative">
                                {asset.type === 'photo' || asset.type === 'design' ? (
                                    <img src={asset.url} alt={asset.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-black/50">
                                        <PlayIcon className="w-12 h-12 text-white/80" />
                                        <video src={asset.url} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => window.open(asset.url, '_blank')}
                                        className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
                                        title="Visualizar"
                                    >
                                        {asset.type === 'video' ? <PlayIcon className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                                    </button>
                                    <button
                                        onClick={() => handleDownload(asset.url, asset.title)}
                                        className="p-3 bg-brand-gold hover:bg-yellow-500 text-white rounded-full transition-colors shadow-lg shadow-brand-gold/20"
                                        title="Baixar"
                                    >
                                        <DownloadIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-white font-bold truncate text-sm" title={asset.title}>{asset.title}</h3>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{asset.type} • {asset.fileSize || 'N/A'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="border-t border-gray-800 py-8 text-center text-gray-600 text-sm">
                <p>&copy; {new Date().getFullYear()} Naralbiza Studios. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
};
