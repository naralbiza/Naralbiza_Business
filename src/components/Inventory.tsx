import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { EquipmentModal } from './EquipmentModal';
import {
    PlusIcon,
    SearchIcon,
    FilterIcon,
    AlertTriangleIcon,
    ClockIcon,
    CheckCircleIcon,
    InventoryIcon,
    MoreVerticalIcon,
    UserIcon,
    SettingsIcon
} from './common/Icon';
import { Equipment } from '../types';
import { formatCurrency } from '../utils';

export const Inventory: React.FC = () => {
    const { equipment, employees, loading } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedStatus, setSelectedStatus] = useState<string>('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | undefined>(undefined);

    const categories = ['All', 'Camera', 'Lens', 'Lighting', 'Audio', 'Grip', 'Other'];
    const statuses = ['All', 'Available', 'In Use', 'Maintenance', 'Retired'];

    const filteredEquipment = equipment.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const kpis = [
        {
            label: 'Total de Itens',
            value: equipment.length,
            icon: InventoryIcon,
            color: 'blue',
            description: 'Patrimônio total'
        },
        {
            label: 'Em Uso',
            value: equipment.filter(e => e.status === 'In Use').length,
            icon: UserIcon,
            color: 'gold',
            description: 'Equipamento em campo'
        },
        {
            label: 'Manutenção',
            value: equipment.filter(e => e.status === 'Maintenance').length,
            icon: SettingsIcon,
            color: 'red',
            description: 'Itens em reparo'
        },
        {
            label: 'Disponível',
            value: equipment.filter(e => e.status === 'Available').length,
            icon: CheckCircleIcon,
            color: 'green',
            description: 'Pronto para uso'
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'In Use': return 'text-brand-gold bg-brand-gold/10 border-brand-gold/20';
            case 'Maintenance': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'Retired': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const handleEdit = (item: Equipment) => {
        setSelectedEquipment(item);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedEquipment(undefined);
        setIsModalOpen(true);
    };

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
                        INVENTÁRIO & <span className="text-brand-gold">EQUIPAMENTOS</span>
                    </h1>
                    <p className="text-gray-400 font-medium">Gestão inteligente de equipamentos e ativos Naralbiza.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-3 bg-brand-gold hover:bg-brand-gold/90 text-black px-8 py-4 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-gold/20"
                >
                    <PlusIcon className="w-6 h-6" />
                    NOVO EQUIPAMENTO
                </button>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-brand-dark/40 border border-gray-800 p-6 rounded-3xl hover:border-brand-gold/30 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-brand-dark border border-gray-800 shadow-inner group-hover:border-brand-gold/50 transition-colors`}>
                                <kpi.icon className="w-6 h-6 text-brand-gold" />
                            </div>
                            <span className="text-3xl font-black text-white">{kpi.value}</span>
                        </div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{kpi.label}</h3>
                        <p className="text-sm text-gray-400 mt-1">{kpi.description}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters & Actions */}
            <div className="bg-brand-dark/40 border border-gray-800 p-6 rounded-3xl space-y-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 relative group">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-gold transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou S/N..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-brand-gold outline-none transition-all placeholder:text-gray-600"
                        />
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="relative">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-black/40 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:border-brand-gold outline-none appearance-none pr-12 transition-all cursor-pointer min-w-[160px]"
                            >
                                {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'Todas Categorias' : c}</option>)}
                            </select>
                            <FilterIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="bg-black/40 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:border-brand-gold outline-none appearance-none pr-12 transition-all cursor-pointer min-w-[160px]"
                            >
                                {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'Todos Status' : s}</option>)}
                            </select>
                            <FilterIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
                </div>
            ) : filteredEquipment.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEquipment.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => handleEdit(item)}
                            className="bg-brand-dark/40 border border-gray-800 rounded-3xl overflow-hidden hover:border-brand-gold/50 transition-all group cursor-pointer"
                        >
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </div>
                                    <button className="text-gray-600 hover:text-white transition-colors">
                                        <MoreVerticalIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-brand-gold transition-colors">{item.name}</h3>
                                    <p className="text-xs text-gray-500 font-mono tracking-tighter uppercase">{item.category} • S/N: {item.serialNumber || 'N/A'}</p>
                                </div>

                                <div className="pt-4 border-t border-gray-800/50 space-y-3">
                                    {item.assignedTo && (
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <UserIcon className="w-4 h-4 text-brand-gold" />
                                            <span>{employees.find(e => e.id === item.assignedTo)?.name || 'Desconhecido'}</span>
                                        </div>
                                    )}
                                    {item.nextMaintenance && (
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <ClockIcon className="w-4 h-4 text-brand-gold" />
                                            <span>Prox: {new Date(item.nextMaintenance).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-black/20 border-t border-gray-800 flex justify-between items-center text-xs">
                                <span className="text-gray-500 uppercase font-bold tracking-tight">Valor Patrimonial</span>
                                <span className="text-white font-black">{formatCurrency(item.value)}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-brand-dark/20 border border-gray-800/50 rounded-3xl p-20 text-center">
                    <InventoryIcon className="w-16 h-16 text-gray-700 mx-auto mb-6" />
                    <h2 className="text-xl font-bold text-gray-400 mb-2">Nenhum equipamento encontrado</h2>
                    <p className="text-gray-600 max-w-sm mx-auto">Tente ajustar seus filtros ou adicione um novo item ao inventário.</p>
                </div>
            )}

            <EquipmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                equipment={selectedEquipment}
            />
        </div>
    );
};
