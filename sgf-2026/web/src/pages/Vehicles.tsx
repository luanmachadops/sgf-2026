import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import { SGFCard } from '@/components/sgf/SGFCard';
import { SGFButton } from '@/components/sgf/SGFButton';
import { SGFInput } from '@/components/sgf/SGFInput';
import { SGFSelect } from '@/components/sgf/SGFSelect';
import { SGFBadge } from '@/components/sgf/SGFBadge';
import { SGFTable, type SGFTableColumn } from '@/components/sgf/SGFTable';
import { Pagination } from '@/components/ui/pagination';
import { Modal } from '@/components/ui/Modal';
import {
    Plus,
    Car,
    Wrench,
    Search,
    Filter,
} from 'lucide-react';
import { getStatusLabel, getStatusColor, formatDistance } from '@/lib/utils';
import { vehiclesApi } from '@/lib/supabase-api';
import { NewVehicleForm } from '@/components/vehicles/NewVehicleForm';
import { useHeader } from '@/contexts/HeaderContext';
import { SGFKPICard } from '@/components/sgf/SGFKPICard';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for initial display
const mockVehicles = [
    { id: '1', plate: 'ABC-1234', brand: 'Fiat', model: 'Strada', year: 2023, type: 'Pickup', status: 'AVAILABLE', department: 'Obras', odometer: 45230, fuelType: 'Gasolina' },
    { id: '2', plate: 'XYZ-5678', brand: 'Chevrolet', model: 'Spin', year: 2022, type: 'Van', status: 'IN_USE', department: 'Saúde', odometer: 67890, fuelType: 'Flex' },
    { id: '3', plate: 'DEF-9012', brand: 'Volkswagen', model: 'Saveiro', year: 2021, type: 'Pickup', status: 'MAINTENANCE', department: 'Educação', odometer: 89120, fuelType: 'Flex' },
    { id: '4', plate: 'GHI-3456', brand: 'Renault', model: 'Duster', year: 2023, type: 'SUV', status: 'AVAILABLE', department: 'Saúde', odometer: 12340, fuelType: 'Flex' },
    { id: '5', plate: 'JKL-7890', brand: 'Toyota', model: 'Hilux', year: 2020, type: 'Pickup', status: 'INACTIVE', department: 'Obras', odometer: 123450, fuelType: 'Diesel' },
];

const departmentOptions = [
    { value: '', label: 'Todas as secretarias' },
    { value: 'obras', label: 'Obras' },
    { value: 'saude', label: 'Saúde' },
    { value: 'educacao', label: 'Educação' },
    { value: 'transporte', label: 'Transporte' },
];

const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'AVAILABLE', label: 'Disponível' },
    { value: 'IN_USE', label: 'Em Uso' },
    { value: 'MAINTENANCE', label: 'Manutenção' },
    { value: 'INACTIVE', label: 'Inativo' },
];

export default function Vehicles() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const { setTitle, setSearchPlaceholder, setSearchHandler, setHeaderAction } = useHeader();
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const pageSize = 10;

    useEffect(() => {
        setTitle('Frota');
        setSearchPlaceholder('Buscar por placa, modelo ou secretaria...');
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
    }, [setTitle, setSearchPlaceholder, setSearchHandler, setHeaderAction]);

    // Use mock data for now, replace with API call when backend is ready
    const { data, isLoading } = useQuery({
        queryKey: ['vehicles', searchTerm, statusFilter, departmentFilter, currentPage],
        queryFn: () => vehiclesApi.getAll({ search: searchTerm, status: statusFilter, department: departmentFilter, page: currentPage }),
        enabled: false, // Disable for now, use mock data
    });

    const vehicles = mockVehicles; // Replace with data?.data when API is ready
    const totalPages = 1;

    const filteredVehicles = vehicles.filter((v) => {
        const matchesSearch =
            v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.model.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || v.status === statusFilter;
        const matchesDepartment = !departmentFilter || v.department.toLowerCase() === departmentFilter;
        return matchesSearch && matchesStatus && matchesDepartment;
    });

    const statusCounts = vehicles.reduce(
        (acc, v) => {
            acc[v.status] = (acc[v.status] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    const columns: SGFTableColumn<typeof vehicles[0]>[] = [
        {
            header: (
                <div className="flex flex-col gap-2 min-w-[200px]">
                    <span className="text-xs uppercase font-bold text-slate-400">Veículo</span>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar placa..."
                            className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            ),
            accessor: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--sgf-primary)]/10 rounded-lg flex items-center justify-center">
                        <Car className="h-5 w-5 text-[var(--sgf-primary)]" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{row.plate}</p>
                        <p className="text-sm text-gray-500">
                            {row.brand} {row.model} {row.year}
                        </p>
                    </div>
                </div>
            ),
        },
        { header: 'Tipo', accessor: 'type' },
        {
            header: (
                <div className="flex flex-col gap-2 min-w-[150px]">
                    <span className="text-xs uppercase font-bold text-slate-400">Secretaria</span>
                    <SGFSelect
                        value={departmentFilter}
                        onChange={(val) => setDepartmentFilter(val)}
                        options={departmentOptions}
                        placeholder="Filtrar..."
                        className="text-xs"
                    />
                </div>
            ),
            accessor: 'department'
        },
        { header: 'Odômetro', accessor: (row) => formatDistance(row.odometer) },
        {
            header: (
                <div className="flex flex-col gap-2 min-w-[150px]">
                    <span className="text-xs uppercase font-bold text-slate-400">Status</span>
                    <SGFSelect
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val)}
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
            {/* Header - ACTIONS ONLY (Title is in SubHeader) */}
            {/* Header - ACTIONS ONLY (Title is in SubHeader) */}
            {/* Local button removed */}

            {/* Stats Cards */}
            {/* Stats Cards */}
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <SGFKPICard
                    title="Frota Total"
                    value={vehicles.length}
                    icon={Car}
                    iconColor="text-slate-500"
                    chartColor="#64748b"
                    chartData={[
                        { month: 'Set', value: 4 },
                        { month: 'Out', value: 4 },
                        { month: 'Nov', value: 5 },
                        { month: 'Dez', value: vehicles.length },
                    ]}
                />
                <SGFKPICard
                    title="Disponíveis"
                    value={statusCounts['AVAILABLE'] || 0}
                    icon={Car}
                    iconColor="text-emerald-500"
                    chartColor="#10b981"
                    chartData={[
                        { month: 'Jan', value: 2 },
                        { month: 'Fev', value: 3 },
                        { month: 'Mar', value: statusCounts['AVAILABLE'] || 0 },
                    ]}
                />
                <SGFKPICard
                    title="Em Uso"
                    value={statusCounts['IN_USE'] || 0}
                    icon={Car}
                    iconColor="text-blue-500"
                    chartColor="#3b82f6"
                    chartData={[
                        { month: 'Jan', value: 1 },
                        { month: 'Fev', value: 2 },
                        { month: 'Mar', value: statusCounts['IN_USE'] || 0 },
                    ]}
                />
                <SGFKPICard
                    title="Manutenção"
                    value={statusCounts['MAINTENANCE'] || 0}
                    icon={Wrench}
                    iconColor="text-amber-500"
                    chartColor="#f59e0b"
                    chartData={[
                        { month: 'Jan', value: 0 },
                        { month: 'Fev', value: 1 },
                        { month: 'Mar', value: statusCounts['MAINTENANCE'] || 0 },
                    ]}
                />
            </div>

            {/* Filters removed - moved to table header */}


            {/* Table */}
            {/* Table */}
            <div className="-mx-6 md:mx-0"> {/* Negative margin on mobile to flush with edges if needed, otherwise just simple div or Fragment */}
                <SGFTable
                    columns={columns}
                    data={filteredVehicles}
                    keyExtractor={(row) => row.id}
                    onRowClick={(row) => navigate(`/veiculos/${row.id}`)}
                    emptyMessage="Nenhum veículo encontrado."
                />
            </div>

            {/* Add Vehicle Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Novo Veículo"
                description="Preencha os dados abaixo para cadastrar um novo veículo"
                size="xl"
                showCloseButton={false}
            >
                <NewVehicleForm
                    onSuccess={() => {
                        setShowAddModal(false);
                    }}
                    onCancel={() => setShowAddModal(false)}
                />
            </Modal>
        </div >
    );
}
