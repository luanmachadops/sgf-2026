import React, { useState } from 'react';
import { SGFCard } from '@/components/sgf/SGFCard';
import { SGFButton } from '@/components/sgf/SGFButton';
import { SGFInput } from '@/components/sgf/SGFInput';
import { SGFSelect } from '@/components/sgf/SGFSelect';
import { SGFBadge } from '@/components/sgf/SGFBadge';
import { SGFTable, type SGFTableColumn } from '@/components/sgf/SGFTable';
import { Modal } from '@/components/ui/Modal';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbPage,
} from '@/components/ui/Breadcrumb';
import {
    Search,
    Fuel,
    Eye,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Car,
    Receipt,
    Plus,
    DollarSign,
    User,
    MapPin,
} from 'lucide-react';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { useHeader } from '@/contexts/HeaderContext';
import { useEffect } from 'react';
import { SGFKPICard } from '@/components/sgf/SGFKPICard';
import { motion, AnimatePresence } from 'framer-motion';
import { NewRefuelingForm } from '@/components/refuelings/NewRefuelingForm';

// Mock data
const mockRefuelings = [
    { id: '1', date: '2026-01-17', vehicle: 'ABC-1234', driver: 'Maria Santos', department: 'Obras', liters: 45.5, cost: 290.75, pricePerLiter: 6.39, odometer: 45230, fuelType: 'Gasolina', consumption: 8.2, isValidated: true, hasAnomaly: false, receiptUrl: '/receipts/1.jpg' },
    { id: '2', date: '2026-01-15', vehicle: 'XYZ-5678', driver: 'João Silva', department: 'Saúde', liters: 52.0, cost: 312.00, pricePerLiter: 6.00, odometer: 67680, fuelType: 'Etanol', consumption: 5.8, isValidated: true, hasAnomaly: true, receiptUrl: '/receipts/2.jpg' },
    { id: '3', date: '2026-01-14', vehicle: 'DEF-9012', driver: 'Pedro Lima', department: 'Educação', liters: 60.0, cost: 414.00, pricePerLiter: 6.90, odometer: 89350, fuelType: 'Diesel', consumption: 7.5, isValidated: false, hasAnomaly: false, receiptUrl: null },
    { id: '4', date: '2026-01-12', vehicle: 'GHI-3456', driver: 'Ana Costa', department: 'Saúde', liters: 38.0, cost: 242.82, pricePerLiter: 6.39, odometer: 12280, fuelType: 'Gasolina', consumption: 9.1, isValidated: true, hasAnomaly: false, receiptUrl: '/receipts/4.jpg' },
    { id: '5', date: '2026-01-10', vehicle: 'JKL-7890', driver: 'Carlos Souza', department: 'Transporte', liters: 80.0, cost: 552.00, pricePerLiter: 6.90, odometer: 123450, fuelType: 'Diesel', consumption: 4.2, isValidated: true, hasAnomaly: true, receiptUrl: '/receipts/5.jpg' },
];

const departmentOptions = [
    { value: '', label: 'Todas as secretarias' },
    { value: 'obras', label: 'Obras' },
    { value: 'saude', label: 'Saúde' },
    { value: 'educacao', label: 'Educação' },
    { value: 'transporte', label: 'Transporte' },
];

const validationOptions = [
    { value: '', label: 'Todos' },
    { value: 'validated', label: 'Validados' },
    { value: 'pending', label: 'Pendentes' },
];

export default function Refuelings() {
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [validationFilter, setValidationFilter] = useState('');
    const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedRefueling, setSelectedRefueling] = useState<typeof mockRefuelings[0] | null>(null);
    const { setTitle, setSearchPlaceholder, setSearchHandler, setHeaderAction } = useHeader();

    useEffect(() => {
        setTitle('Abastecimentos');
        setSearchPlaceholder('Pesquisar por veículo ou motorista...');
        setSearchHandler((term: string) => setSearchTerm(term));

        setHeaderAction(
            <SGFButton onClick={() => setShowAddModal(true)} icon={Plus}>
                Novo Abastecimento
            </SGFButton>
        );

        return () => {
            setSearchHandler(() => { });
            setHeaderAction(null);
        };
    }, [setTitle, setSearchPlaceholder, setSearchHandler, setHeaderAction]);

    const refuelings = mockRefuelings;

    const filteredRefuelings = refuelings.filter((r) => {
        const matchesSearch =
            r.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.driver.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = !departmentFilter || r.department.toLowerCase() === departmentFilter;
        const matchesValidation =
            !validationFilter ||
            (validationFilter === 'validated' ? r.isValidated : !r.isValidated);
        const matchesAnomaly = !showAnomaliesOnly || r.hasAnomaly;
        return matchesSearch && matchesDepartment && matchesValidation && matchesAnomaly;
    });

    const totalLiters = filteredRefuelings.reduce((sum, r) => sum + r.liters, 0);
    const totalCost = filteredRefuelings.reduce((sum, r) => sum + r.cost, 0);
    const anomalyCount = refuelings.filter((r) => r.hasAnomaly).length;
    const pendingCount = refuelings.filter((r) => !r.isValidated).length;

    const columns: SGFTableColumn<typeof mockRefuelings[0]>[] = [
        { header: 'Data', accessor: (row) => formatDate(row.date) },
        {
            header: (
                <div className="flex flex-col gap-2 min-w-[200px]">
                    <span className="text-xs uppercase font-bold text-slate-400">Veículo / Motorista</span>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            ),
            accessor: (row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-gray-400" />
                        <span className="font-mono font-medium">{row.vehicle}</span>
                    </div>
                    <div className="text-sm text-gray-600">{row.driver}</div>
                    <div className="text-xs text-gray-400">{row.department}</div>
                </div>
            )
        },
        { header: 'Litros', accessor: (row) => `${row.liters.toFixed(1)} L` },
        { header: 'Valor', accessor: (row) => formatCurrency(row.cost) },
        { header: 'R$/L', accessor: (row) => formatCurrency(row.pricePerLiter) },
        {
            header: 'Consumo',
            accessor: (row) => (
                <div className="flex items-center gap-1">
                    <span>{row.consumption.toFixed(1)} km/L</span>
                    {row.hasAnomaly && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                </div>
            )
        },
        {
            header: (
                <div className="flex flex-col gap-2 min-w-[150px]">
                    <span className="text-xs uppercase font-bold text-slate-400">Status</span>
                    <SGFSelect
                        value={validationFilter}
                        onChange={(val) => setValidationFilter(val)}
                        options={validationOptions}
                        placeholder="Filtrar..."
                    />
                </div>
            ),
            accessor: (row) => row.isValidated ? (
                <SGFBadge variant="success">
                    Validado
                </SGFBadge>
            ) : (
                <SGFBadge variant="warning">
                    Pendente
                </SGFBadge>
            )
        },
        {
            header: 'Ações',
            accessor: (row) => (
                <SGFButton variant="ghost" size="sm" icon={Eye} onClick={() => setSelectedRefueling(row)} />
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
                <SGFKPICard
                    title="Volume Total"
                    value={`${totalLiters.toFixed(1)} L`}
                    icon={Fuel}
                    iconColor="text-blue-500"
                    chartColor="#3b82f6"
                    chartData={[
                        { month: 'Sem 1', value: 200 },
                        { month: 'Sem 2', value: 250 },
                        { month: 'Sem 3', value: totalLiters },
                    ]}
                />
                <SGFKPICard
                    title="Gasto Total"
                    value={formatCurrency(totalCost)}
                    icon={Receipt}
                    iconColor="text-emerald-500"
                    chartColor="#10b981"
                    chartData={[
                        { month: 'Sem 1', value: 1200 },
                        { month: 'Sem 2', value: 1500 },
                        { month: 'Sem 3', value: totalCost },
                    ]}
                />
                <SGFKPICard
                    title="Anomalias"
                    value={anomalyCount}
                    icon={AlertTriangle}
                    iconColor="text-amber-500"
                    chartColor="#f59e0b"
                    chartData={[
                        { month: 'Sem 1', value: 0 },
                        { month: 'Sem 2', value: 1 },
                        { month: 'Sem 3', value: anomalyCount },
                    ]}
                />
                <SGFKPICard
                    title="Aguardando Validação"
                    value={pendingCount}
                    icon={XCircle}
                    iconColor="text-orange-500"
                    chartColor="#f97316"
                    chartData={[
                        { month: 'Sem 1', value: 5 },
                        { month: 'Sem 2', value: 3 },
                        { month: 'Sem 3', value: pendingCount },
                    ]}
                />
            </div>

            {/* Table */}
            <div className="-mx-6 md:mx-0">
                <SGFTable columns={columns} data={filteredRefuelings} keyExtractor={(r) => r.id} emptyMessage="Nenhum abastecimento encontrado." />
            </div>

            {/* Refueling Details Modal */}
            <Modal
                isOpen={!!selectedRefueling}
                onClose={() => setSelectedRefueling(null)}
                title="Detalhes do Abastecimento"
                size="lg"
                footer={
                    <div className="flex w-full justify-between items-center">
                        <div className="flex gap-2">
                            {selectedRefueling && !selectedRefueling.isValidated && (
                                <>
                                    <SGFButton variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={() => setSelectedRefueling(null)}>
                                        Rejeitar
                                    </SGFButton>
                                    <SGFButton variant="primary" onClick={() => setSelectedRefueling(null)}>
                                        Validar Abastecimento
                                    </SGFButton>
                                </>
                            )}
                        </div>
                        <SGFButton variant="ghost" onClick={() => setSelectedRefueling(null)}>
                            Fechar
                        </SGFButton>
                    </div>
                }
            >
                {selectedRefueling && (
                    <div className="space-y-6">
                        {/* Status Header */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                    <Fuel className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status de Validação</p>
                                    <p className={cn("font-bold", selectedRefueling.isValidated ? "text-emerald-600" : "text-amber-600")}>
                                        {selectedRefueling.isValidated ? 'Validado' : 'Aguardando Validação'}
                                    </p>
                                </div>
                            </div>
                            {selectedRefueling.hasAnomaly && (
                                <SGFBadge variant="warning">Anomalia Detectada</SGFBadge>
                            )}
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Left Column: People & Vehicle */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
                                        <Car size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Veículo</p>
                                        <p className="font-bold text-slate-800">{selectedRefueling.vehicle}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Motorista</p>
                                        <p className="font-bold text-slate-800">{selectedRefueling.driver}</p>
                                        <p className="text-xs text-slate-500">{selectedRefueling.department}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Odômetro</p>
                                        <p className="font-bold text-slate-800">{selectedRefueling.odometer.toLocaleString()} km</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Values & Consumption */}
                            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resumo Financeiro</p>
                                    <div className="px-2 py-0.5 bg-white rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500">
                                        {selectedRefueling.fuelType}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Quantidade</span>
                                        <span className="font-bold text-slate-800">{selectedRefueling.liters.toFixed(1)} L</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Preço p/ Litro</span>
                                        <span className="font-bold text-slate-800">{formatCurrency(selectedRefueling.pricePerLiter)}</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                                        <span className="text-slate-500 font-bold">Valor Total</span>
                                        <span className="font-black text-emerald-600 text-xl">{formatCurrency(selectedRefueling.cost)}</span>
                                    </div>
                                </div>

                                <div className="pt-4 mt-2 border-t border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Eficiência</p>
                                        <span className={cn(
                                            "font-black text-lg",
                                            selectedRefueling.consumption > 8 ? "text-emerald-600" : "text-amber-600"
                                        )}>
                                            {selectedRefueling.consumption.toFixed(1)} km/L
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedRefueling.hasAnomaly && (
                            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                <p className="text-sm text-amber-800 font-medium">
                                    <span className="font-black">Anomalia detectada:</span> O consumo registrado está significativamente abaixo da média histórica deste veículo.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Add Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Novo Abastecimento"
                description="Lançar novo abastecimento de veículo"
                size="lg"
            >
                <NewRefuelingForm
                    onSuccess={() => setShowAddModal(false)}
                    onCancel={() => setShowAddModal(false)}
                />
            </Modal>
        </div>
    );
}
