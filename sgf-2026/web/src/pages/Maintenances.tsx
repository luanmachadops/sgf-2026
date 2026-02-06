import React, { useState } from 'react';
import { SGFCard } from '@/components/sgf/SGFCard';
import { SGFButton } from '@/components/sgf/SGFButton';
import { SGFInput } from '@/components/sgf/SGFInput';
import { SGFSelect } from '@/components/sgf/SGFSelect';
import { SGFBadge } from '@/components/sgf/SGFBadge';
import { Modal } from '@/components/ui/Modal';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbPage,
} from '@/components/ui/Breadcrumb';
import {
    Plus,
    Search,
    Wrench,
    Clock,
    CheckCircle,
    AlertTriangle,
    Car,
    Calendar,
    DollarSign,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useHeader } from '@/contexts/HeaderContext';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SGFKPICard } from '@/components/sgf/SGFKPICard';
import { motion, AnimatePresence } from 'framer-motion';
import { NewMaintenanceForm } from '@/components/maintenances/NewMaintenanceForm';

// Mock data
const mockMaintenances = [
    { id: '1', vehicle: 'ABC-1234', brand: 'Fiat Strada', type: 'preventive', description: 'Troca de óleo e filtros', scheduledDate: '2026-01-20', cost: null, workshop: null, status: 'PENDING', priority: 'medium' },
    { id: '2', vehicle: 'XYZ-5678', brand: 'Chevrolet Spin', type: 'corrective', description: 'Reparo no sistema de arrefecimento', scheduledDate: '2026-01-18', cost: 850, workshop: 'Auto Mecânica Central', status: 'IN_PROGRESS', priority: 'high' },
    { id: '3', vehicle: 'DEF-9012', brand: 'VW Saveiro', type: 'corrective', description: 'Substituição de pneus dianteiros', scheduledDate: '2026-01-15', cost: 1200, workshop: 'Pneus & Cia', status: 'AWAITING_PARTS', priority: 'medium' },
    { id: '4', vehicle: 'GHI-3456', brand: 'Renault Duster', type: 'preventive', description: 'Revisão 30.000 km', scheduledDate: '2026-01-12', cost: 680, workshop: 'Concessionária Oficial', status: 'COMPLETED', priority: 'low' },
    { id: '5', vehicle: 'JKL-7890', brand: 'Toyota Hilux', type: 'corrective', description: 'Reparo no sistema de freios', scheduledDate: '2026-01-10', cost: 1450, workshop: 'Auto Mecânica Central', status: 'COMPLETED', priority: 'high' },
];

const statusColumns = [
    { id: 'PENDING', label: 'Pendente', color: 'bg-yellow-50 border-yellow-200 text-yellow-800', icon: Clock },
    { id: 'IN_PROGRESS', label: 'Em Andamento', color: 'bg-blue-50 border-blue-200 text-blue-800', icon: Wrench },
    { id: 'AWAITING_PARTS', label: 'Aguardando Peças', color: 'bg-orange-50 border-orange-200 text-orange-800', icon: AlertTriangle },
    { id: 'COMPLETED', label: 'Concluído', color: 'bg-green-50 border-green-200 text-green-800', icon: CheckCircle },
];

const priorityColors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    low: 'info',
    medium: 'warning',
    high: 'error',
};

const priorityLabels: Record<string, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
};

const typeLabels: Record<string, string> = {
    preventive: 'Preventiva',
    corrective: 'Corretiva',
    inspection: 'Vistoria',
};

const priorityBorderColors: Record<string, string> = {
    low: 'border-l-sky-500',
    medium: 'border-l-amber-500',
    high: 'border-l-rose-500',
};

export default function Maintenances() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [selectedMaintenance, setSelectedMaintenance] = useState<typeof mockMaintenances[0] | null>(null);
    const { setTitle, setSearchPlaceholder, setSearchHandler, setHeaderAction } = useHeader();

    useEffect(() => {
        setTitle('Manutenções');
        setSearchPlaceholder('Buscar por veículo ou descrição...');
        setSearchHandler((term: string) => setSearchTerm(term));

        setHeaderAction(
            <SGFButton onClick={() => setShowAddModal(true)} icon={Plus}>
                Nova Manutenção
            </SGFButton>
        );

        return () => {
            setSearchHandler(() => { });
            setHeaderAction(null);
        };
    }, [setTitle, setSearchPlaceholder, setSearchHandler, setHeaderAction]);

    const maintenances = mockMaintenances;

    const getMaintenancesByStatus = (status: string) =>
        maintenances.filter((m) =>
            m.status === status &&
            (m.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (!priorityFilter || m.priority === priorityFilter) &&
            (!typeFilter || m.type === typeFilter)
        );

    const pendingCount = maintenances.filter((m) => m.status === 'PENDING').length;
    const inProgressCount = maintenances.filter((m) => m.status === 'IN_PROGRESS' || m.status === 'AWAITING_PARTS').length;
    const totalCost = maintenances
        .filter((m) => m.status === 'COMPLETED' && m.cost)
        .reduce((sum, m) => sum + (m.cost || 0), 0);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-1 rounded-2xl border border-slate-100 w-fit">
                <div className="w-48">
                    <SGFSelect
                        value={priorityFilter}
                        onChange={(val) => setPriorityFilter(val)}
                        options={[
                            { value: '', label: 'Todas as prioridades' },
                            { value: 'low', label: 'Baixa' },
                            { value: 'medium', label: 'Média' },
                            { value: 'high', label: 'Alta' },
                        ]}
                        placeholder="Prioridade"
                        className="border-none"
                    />
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div className="w-48">
                    <SGFSelect
                        value={typeFilter}
                        onChange={(val) => setTypeFilter(val)}
                        options={[
                            { value: '', label: 'Todos os tipos' },
                            { value: 'preventive', label: 'Preventiva' },
                            { value: 'corrective', label: 'Corretiva' },
                            { value: 'inspection', label: 'Vistoria' },
                        ]}
                        placeholder="Tipo"
                        className="border-none"
                    />
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
                <SGFKPICard
                    title="Pendentes"
                    value={pendingCount}
                    icon={Clock}
                    iconColor="text-amber-500"
                    chartColor="#f59e0b"
                    chartData={[
                        { month: 'Jan', value: 10 },
                        { month: 'Fev', value: 15 },
                        { month: 'Mar', value: pendingCount },
                    ]}
                />
                <SGFKPICard
                    title="Em Andamento"
                    value={inProgressCount}
                    icon={Wrench}
                    iconColor="text-blue-500"
                    chartColor="#3b82f6"
                    chartData={[
                        { month: 'Jan', value: 5 },
                        { month: 'Fev', value: 8 },
                        { month: 'Mar', value: inProgressCount },
                    ]}
                />
                <SGFKPICard
                    title="Concluídas"
                    value={maintenances.filter((m) => m.status === 'COMPLETED').length}
                    icon={CheckCircle}
                    iconColor="text-emerald-500"
                    chartColor="#10b981"
                    chartData={[
                        { month: 'Jan', value: 20 },
                        { month: 'Fev', value: 18 },
                        { month: 'Mar', value: maintenances.filter((m) => m.status === 'COMPLETED').length },
                    ]}
                />
                <SGFKPICard
                    title="Gasto este mês"
                    value={formatCurrency(totalCost)}
                    icon={DollarSign}
                    iconColor="text-emerald-600"
                    chartColor="#059669"
                    chartData={[
                        { month: 'Jan', value: 5000 },
                        { month: 'Fev', value: 4200 },
                        { month: 'Mar', value: totalCost },
                    ]}
                />
            </div>



            {/* Kanban Board */}
            <div className="grid gap-6 md:grid-cols-4 items-start h-full">
                {statusColumns.map((column) => {
                    const Icon = column.icon;
                    const items = getMaintenancesByStatus(column.id);

                    return (
                        <div key={column.id} className="flex flex-col h-full bg-slate-50/50 rounded-3xl border border-slate-100/60 p-3 lg:p-4">
                            {/* Column Header */}
                            <div className="flex items-center gap-3 mb-4 px-1">
                                <div className={cn("p-2 rounded-xl bg-white shadow-sm border border-slate-100", column.color.replace('bg-', 'text-').replace('text-', 'text-opacity-80'))}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <span className="font-bold text-slate-700 text-sm tracking-tight">{column.label}</span>
                                <span className="ml-auto bg-white shadow-sm border border-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                    {items.length}
                                </span>
                            </div>

                            {/* Cards */}
                            <div className="space-y-3 min-h-[150px]">
                                <AnimatePresence mode="popLayout">
                                    {items.map((maintenance) => (
                                        <motion.div
                                            key={maintenance.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <SGFCard
                                                className={cn(
                                                    "cursor-pointer group hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 active:scale-[0.98] border-l-[3px]",
                                                    priorityBorderColors[maintenance.priority]
                                                )}
                                                onClick={() => setSelectedMaintenance(maintenance)}
                                                padding="sm"
                                                variant="default"
                                            >
                                                {/* Header: Plate & Badge */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <Car className="h-3.5 w-3.5 text-slate-400" />
                                                            <span className="font-bold text-slate-800 text-sm tracking-tight">{maintenance.vehicle}</span>
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{maintenance.brand}</p>
                                                    </div>
                                                    {maintenance.priority === 'high' && (
                                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse ring-4 ring-rose-500/10" title="Alta Prioridade" />
                                                    )}
                                                </div>

                                                {/* Description */}
                                                <p className="text-sm font-medium text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                                                    {maintenance.description}
                                                </p>

                                                {/* Workshop Badge - If exists */}
                                                {maintenance.workshop && (
                                                    <div className="flex items-center gap-1.5 mb-3 px-2 py-1 bg-white border border-slate-100 rounded-lg w-fit shadow-sm">
                                                        <Wrench className="h-2.5 w-2.5 text-slate-400" />
                                                        <span className="text-[9px] font-bold text-slate-500 truncate max-w-[120px]">{maintenance.workshop}</span>
                                                    </div>
                                                )}

                                                {/* Footer */}
                                                <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100/50">
                                                        <Calendar className="h-3 w-3" />
                                                        <span className="font-bold">{formatDate(maintenance.scheduledDate).split('/')[0]}/{formatDate(maintenance.scheduledDate).split('/')[1]}</span>
                                                    </div>

                                                    <div className={cn(
                                                        "px-2.5 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-widest shadow-sm border",
                                                        maintenance.type === 'preventive' ? "bg-emerald-50 text-emerald-700 border-emerald-100/50" :
                                                            maintenance.type === 'corrective' ? "bg-amber-50 text-amber-700 border-amber-100/50" :
                                                                "bg-purple-50 text-purple-700 border-purple-100/50"
                                                    )}>
                                                        {typeLabels[maintenance.type]}
                                                    </div>
                                                </div>
                                            </SGFCard>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Nova Manutenção"
                description="Agende uma nova manutenção para um veículo"
                size="lg"
            >
                <NewMaintenanceForm
                    onSuccess={() => setShowAddModal(false)}
                    onCancel={() => setShowAddModal(false)}
                />
            </Modal>

            {/* Details Modal */}
            <Modal
                isOpen={!!selectedMaintenance}
                onClose={() => setSelectedMaintenance(null)}
                title={`Detalhes da Manutenção`}
                size="lg"
                footer={
                    <div className="flex w-full justify-between items-center">
                        <div className="flex gap-2">
                            {selectedMaintenance?.status === 'PENDING' && (
                                <>
                                    <SGFButton variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={() => setSelectedMaintenance(null)}>
                                        Rejeitar
                                    </SGFButton>
                                    <SGFButton variant="primary" onClick={() => setSelectedMaintenance(null)}>
                                        Aprovar Manutenção
                                    </SGFButton>
                                </>
                            )}
                            {(selectedMaintenance?.status === 'IN_PROGRESS' || selectedMaintenance?.status === 'AWAITING_PARTS') && (
                                <SGFButton variant="primary" onClick={() => setSelectedMaintenance(null)}>
                                    Concluir Serviço
                                </SGFButton>
                            )}
                        </div>
                        <SGFButton variant="ghost" onClick={() => setSelectedMaintenance(null)}>
                            Fechar
                        </SGFButton>
                    </div>
                }
            >
                {selectedMaintenance && (
                    <div className="space-y-6">
                        {/* Status Header */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                    <Clock className="h-5 w-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status Atual</p>
                                    <p className="font-bold text-slate-700">{statusColumns.find(c => c.id === selectedMaintenance.status)?.label}</p>
                                </div>
                            </div>
                            <SGFBadge variant={priorityColors[selectedMaintenance.priority]}>
                                Prioridade {priorityLabels[selectedMaintenance.priority]}
                            </SGFBadge>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Vehicle Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                        <Car size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Veículo</p>
                                        <p className="font-bold text-slate-800">{selectedMaintenance.vehicle}</p>
                                        <p className="text-xs text-slate-500">{selectedMaintenance.brand}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Data Agendada</p>
                                        <p className="font-bold text-slate-800">{formatDate(selectedMaintenance.scheduledDate)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Service Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                                        <Wrench size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tipo de Serviço</p>
                                        <div className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-xs font-bold text-slate-600 w-fit">
                                            {typeLabels[selectedMaintenance.type]}
                                        </div>
                                    </div>
                                </div>

                                {selectedMaintenance.cost && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Custo do Serviço</p>
                                            <p className="font-bold text-emerald-600 text-lg">{formatCurrency(selectedMaintenance.cost)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição detalhada</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                                "{selectedMaintenance.description}"
                            </p>
                        </div>

                        {selectedMaintenance.workshop && (
                            <div className="flex items-center gap-3 p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                                <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-400">
                                    <Wrench size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Oficina / Estabelecimento</p>
                                    <p className="text-sm font-bold text-slate-700">{selectedMaintenance.workshop}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
