import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Car, Fuel, Plus, Search, Wrench } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { SGFBadge } from '@/components/sgf/SGFBadge';
import { SGFButton } from '@/components/sgf/SGFButton';
import { SGFKPICard } from '@/components/sgf/SGFKPICard';
import { SGFSelect } from '@/components/sgf/SGFSelect';
import { SGFTable, type SGFTableColumn } from '@/components/sgf/SGFTable';
import { NewVehicleForm } from '@/components/vehicles/NewVehicleForm';
import { useHeader } from '@/contexts/HeaderContext';
import { departmentsApi } from '@/lib/supabase-api';
import { formatDistance, formatPlate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useVehicles } from '@/hooks/useVehicles';
import type { VehicleRecord } from '@/lib/supabase-api';

type VehicleTableRow = VehicleRecord & {
    departmentName: string;
};

const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'AVAILABLE', label: 'Disponível' },
    { value: 'IN_USE', label: 'Em uso' },
    { value: 'MAINTENANCE', label: 'Manutenção' },
    { value: 'INACTIVE', label: 'Inativo' },
];

function getFuelLabel(fuelType: VehicleRecord['fuel_type']) {
    const labels: Record<string, string> = {
        GASOLINE: 'Gasolina',
        ETHANOL: 'Etanol',
        DIESEL: 'Diesel',
        FLEX: 'Flex',
    };

    return labels[fuelType] || fuelType;
}

export default function Vehicles() {
    const navigate = useNavigate();
    const { setTitle, setSearchPlaceholder, setSearchHandler, setHeaderAction } = useHeader();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const { data: departments = [] } = useQuery({
        queryKey: ['departments'],
        queryFn: () => departmentsApi.getAll(),
    });

    const { data: vehicles = [], isLoading } = useVehicles({
        search: searchTerm || undefined,
        status: statusFilter as 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'INACTIVE' | undefined,
        departmentId: departmentFilter || undefined,
    });

    useEffect(() => {
        setTitle('Frota');
        setSearchPlaceholder('Buscar por placa, marca ou modelo...');
        setSearchHandler((term: string) => setSearchTerm(term));

        setHeaderAction(
            <SGFButton onClick={() => setShowAddModal(true)} icon={Plus}>
                Novo Veículo
            </SGFButton>
        );

        return () => {
            setSearchHandler(() => { });
            setHeaderAction(null);
        };
    }, [setHeaderAction, setSearchHandler, setSearchPlaceholder, setTitle]);

    const departmentOptions = useMemo(
        () => [
            { value: '', label: 'Todas as secretarias' },
            ...departments.map((department) => ({
                value: department.id,
                label: department.name,
            })),
        ],
        [departments]
    );

    const tableRows = useMemo<VehicleTableRow[]>(
        () =>
            vehicles.map((vehicle) => ({
                ...vehicle,
                departmentName: vehicle.departments?.name || 'Sem secretaria',
            })),
        [vehicles]
    );

    const statusCounts = useMemo(
        () =>
            tableRows.reduce(
                (acc, vehicle) => {
                    acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
                    return acc;
                },
                {} as Record<string, number>
            ),
        [tableRows]
    );

    const totalTankCapacity = tableRows.reduce((sum, vehicle) => sum + vehicle.tank_capacity, 0);

    const columns: SGFTableColumn<VehicleTableRow>[] = [
        {
            header: (
                <div className="flex min-w-[220px] flex-col gap-2">
                    <span className="text-xs uppercase font-bold text-slate-400">Veículo</span>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                        <input
                            type="text"
                            placeholder="Buscar placa..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-medium text-slate-700 shadow-sm transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            onClick={(event) => event.stopPropagation()}
                        />
                    </div>
                </div>
            ),
            accessor: (row) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--sgf-primary)]/10">
                        <Car className="h-5 w-5 text-[var(--sgf-primary)]" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{formatPlate(row.plate)}</p>
                        <p className="text-sm text-gray-500">
                            {row.brand} {row.model} • {row.year}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Combustível',
            accessor: (row) => getFuelLabel(row.fuel_type),
        },
        {
            header: (
                <div className="flex min-w-[160px] flex-col gap-2">
                    <span className="text-xs uppercase font-bold text-slate-400">Secretaria</span>
                    <SGFSelect
                        value={departmentFilter}
                        onChange={(value) => setDepartmentFilter(value)}
                        options={departmentOptions}
                        placeholder="Filtrar..."
                    />
                </div>
            ),
            accessor: 'departmentName',
        },
        {
            header: 'Odômetro',
            accessor: (row) => formatDistance(row.current_odometer),
        },
        {
            header: (
                <div className="flex min-w-[160px] flex-col gap-2">
                    <span className="text-xs uppercase font-bold text-slate-400">Status</span>
                    <SGFSelect
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value)}
                        options={statusOptions}
                        placeholder="Filtrar..."
                    />
                </div>
            ),
            accessor: (row) => (
                <SGFBadge variant={getStatusColor(row.status) as any}>
                    {getStatusLabel(row.status)}
                </SGFBadge>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-4 md:grid-cols-4"
            >
                <SGFKPICard
                    title="Frota Total"
                    value={tableRows.length}
                    icon={Car}
                    iconColor="text-slate-500"
                    chartColor="#64748b"
                    chartData={[
                        { month: 'Total', value: tableRows.length },
                        { month: 'Uso', value: statusCounts.IN_USE || 0 },
                        { month: 'Disp.', value: statusCounts.AVAILABLE || 0 },
                    ]}
                />
                <SGFKPICard
                    title="Disponíveis"
                    value={statusCounts.AVAILABLE || 0}
                    icon={Car}
                    iconColor="text-emerald-500"
                    chartColor="#10b981"
                    chartData={[
                        { month: 'Disp.', value: statusCounts.AVAILABLE || 0 },
                        { month: 'Uso', value: statusCounts.IN_USE || 0 },
                        { month: 'Man.', value: statusCounts.MAINTENANCE || 0 },
                    ]}
                />
                <SGFKPICard
                    title="Em Uso"
                    value={statusCounts.IN_USE || 0}
                    icon={Fuel}
                    iconColor="text-blue-500"
                    chartColor="#3b82f6"
                    chartData={[
                        { month: 'Uso', value: statusCounts.IN_USE || 0 },
                        { month: 'Disp.', value: statusCounts.AVAILABLE || 0 },
                        { month: 'Inat.', value: statusCounts.INACTIVE || 0 },
                    ]}
                />
                <SGFKPICard
                    title="Capacidade Total"
                    value={`${totalTankCapacity.toFixed(0)} L`}
                    icon={Wrench}
                    iconColor="text-amber-500"
                    chartColor="#f59e0b"
                    chartData={[
                        { month: 'Disp.', value: statusCounts.AVAILABLE || 0 },
                        { month: 'Uso', value: statusCounts.IN_USE || 0 },
                        { month: 'Man.', value: statusCounts.MAINTENANCE || 0 },
                    ]}
                />
            </motion.div>

            <div className="-mx-6 md:mx-0">
                <SGFTable
                    columns={columns}
                    data={tableRows}
                    keyExtractor={(row) => row.id}
                    onRowClick={(row) => navigate(`/veiculos/${row.id}`)}
                    loading={isLoading}
                    emptyMessage="Nenhum veículo encontrado."
                />
            </div>

            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Novo Veículo"
                description="Cadastre um veículo com os campos reais da frota."
                size="xl"
                showCloseButton={false}
            >
                <NewVehicleForm
                    onSuccess={() => setShowAddModal(false)}
                    onCancel={() => setShowAddModal(false)}
                />
            </Modal>
        </div>
    );
}
