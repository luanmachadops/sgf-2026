import React, { useState } from 'react';
import { SGFCard } from '@/components/sgf/SGFCard';
import { SGFButton } from '@/components/sgf/SGFButton';
import { SGFInput } from '@/components/sgf/SGFInput';
import { SGFSelect } from '@/components/sgf/SGFSelect';
import { SGFBadge } from '@/components/sgf/SGFBadge';
import { SGFTable, type SGFTableColumn } from '@/components/sgf/SGFTable';
import { Pagination } from '@/components/ui/pagination';
import { Modal } from '@/components/ui/Modal';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbPage,
} from '@/components/ui/Breadcrumb';
import {
    Search,
    Route,
    Eye,
    AlertTriangle,
    MapPin,
    Clock,
    Car,
    Users,
} from 'lucide-react';
import { formatDate, formatDateTime, formatDistance, getStatusLabel, getStatusColor } from '@/lib/utils';
import { useHeader } from '@/contexts/HeaderContext';
import { useEffect } from 'react';

// Mock data
const mockTrips = [
    { id: '1', date: '2026-01-17T08:30:00', vehicle: 'ABC-1234', driver: 'Maria Santos', department: 'Obras', startKm: 45100, endKm: 45230, distance: 130, duration: 125, purpose: 'Visita técnica', status: 'IN_PROGRESS', hasAnomaly: false },
    { id: '2', date: '2026-01-16T14:15:00', vehicle: 'XYZ-5678', driver: 'João Silva', department: 'Saúde', startKm: 67500, endKm: 67680, distance: 180, duration: 95, purpose: 'Transporte de materiais', status: 'COMPLETED', hasAnomaly: false },
    { id: '3', date: '2026-01-16T09:00:00', vehicle: 'DEF-9012', driver: 'Pedro Lima', department: 'Educação', startKm: 89000, endKm: 89350, distance: 350, duration: 180, purpose: 'Entrega de merenda', status: 'COMPLETED', hasAnomaly: true },
    { id: '4', date: '2026-01-15T16:45:00', vehicle: 'GHI-3456', driver: 'Ana Costa', department: 'Saúde', startKm: 12200, endKm: 12280, distance: 80, duration: 60, purpose: 'Visita domiciliar', status: 'COMPLETED', hasAnomaly: false },
    { id: '5', date: '2026-01-15T07:00:00', vehicle: 'JKL-7890', driver: 'Carlos Souza', department: 'Transporte', startKm: 123000, endKm: 123450, distance: 450, duration: 240, purpose: 'Transporte de funcionários', status: 'COMPLETED', hasAnomaly: true },
];

const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'IN_PROGRESS', label: 'Em Andamento' },
    { value: 'COMPLETED', label: 'Concluída' },
    { value: 'CANCELLED', label: 'Cancelada' },
];

const departmentOptions = [
    { value: '', label: 'Todas as secretarias' },
    { value: 'obras', label: 'Obras' },
    { value: 'saude', label: 'Saúde' },
    { value: 'educacao', label: 'Educação' },
    { value: 'transporte', label: 'Transporte' },
];

function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    return `${hours}h ${mins}min`;
}

export default function Trips() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState<typeof mockTrips[0] | null>(null);
    const { setTitle, setSearchPlaceholder, setSearchHandler } = useHeader();
    const pageSize = 10;

    useEffect(() => {
        setTitle('Viagens');
        setSearchPlaceholder('Pesquisar por veículo ou motorista...');
        setSearchHandler((term: string) => setSearchTerm(term));

        return () => {
            setSearchHandler(() => { });
        };
    }, [setTitle, setSearchPlaceholder, setSearchHandler]);

    const trips = mockTrips;
    const totalPages = 1;

    const filteredTrips = trips.filter((t) => {
        const matchesSearch =
            t.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.driver.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || t.status === statusFilter;
        const matchesDepartment = !departmentFilter || t.department.toLowerCase() === departmentFilter;
        const matchesAnomaly = !showAnomaliesOnly || t.hasAnomaly;
        return matchesSearch && matchesStatus && matchesDepartment && matchesAnomaly;
    });

    const totalDistance = filteredTrips.reduce((sum, t) => sum + t.distance, 0);
    const anomalyCount = trips.filter((t) => t.hasAnomaly).length;
    const inProgressCount = trips.filter((t) => t.status === 'IN_PROGRESS').length;

    const columns: SGFTableColumn<typeof trips[0]>[] = [
        {
            header: 'Data/Hora',
            accessor: (row) => (
                <div>
                    <p className="font-medium">{formatDate(row.date)}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(row.date).split(' ')[1]}</p>
                </div>
            )
        },
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
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4 text-gray-400" />
                        {row.driver}
                    </div>
                </div>
            )
        },
        {
            header: 'Distância',
            accessor: (row) => formatDistance(row.distance)
        },
        {
            header: 'Duração',
            accessor: (row) => formatDuration(row.duration)
        },
        {
            header: 'Finalidade',
            accessor: 'purpose',
            className: 'max-w-[200px] truncate'
        },
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
                <div className="flex items-center gap-2">
                    <SGFBadge variant={getStatusColor(row.status) as any}>
                        {getStatusLabel(row.status)}
                    </SGFBadge>
                    {row.hasAnomaly && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                </div>
            )
        },
        {
            header: 'Ações',
            accessor: (row) => (
                <SGFButton variant="ghost" size="sm" onClick={() => setSelectedTrip(row)} icon={Eye} />
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <SGFCard padding="sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Route className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{trips.length}</p>
                            <p className="text-sm text-gray-500">Total de viagens</p>
                        </div>
                    </div>
                </SGFCard>
                <SGFCard padding="sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{inProgressCount}</p>
                            <p className="text-sm text-gray-500">Em andamento</p>
                        </div>
                    </div>
                </SGFCard>
                <SGFCard padding="sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--sgf-primary)]/10 rounded-lg">
                            <MapPin className="h-5 w-5 text-[var(--sgf-primary)]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{formatDistance(totalDistance)}</p>
                            <p className="text-sm text-gray-500">Km percorridos</p>
                        </div>
                    </div>
                </SGFCard>
                <SGFCard padding="sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{anomalyCount}</p>
                            <p className="text-sm text-gray-500">Anomalias detectadas</p>
                        </div>
                    </div>
                </SGFCard>
            </div>

            {/* Table */}
            <div className="-mx-6 md:mx-0">
                <SGFTable
                    columns={columns}
                    data={filteredTrips}
                    keyExtractor={(row) => row.id}
                    onRowClick={(row) => setSelectedTrip(row)}
                    emptyMessage="Nenhuma viagem encontrada."
                />
            </div>

            {/* Trip Details Modal */}
            <Modal
                isOpen={!!selectedTrip}
                onClose={() => setSelectedTrip(null)}
                title={`Viagem - ${selectedTrip?.vehicle}`}
                size="lg"
            >
                {selectedTrip && (
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-gray-500">Motorista</p>
                                <p className="font-medium">{selectedTrip.driver}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Secretaria</p>
                                <p className="font-medium">{selectedTrip.department}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Data/Hora</p>
                                <p className="font-medium">{formatDateTime(selectedTrip.date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Duração</p>
                                <p className="font-medium">{formatDuration(selectedTrip.duration)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Km Inicial</p>
                                <p className="font-medium">{selectedTrip.startKm.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Km Final</p>
                                <p className="font-medium">{selectedTrip.endKm.toLocaleString()}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Finalidade</p>
                                <p className="font-medium">{selectedTrip.purpose}</p>
                            </div>
                        </div>
                        {selectedTrip.hasAnomaly && (
                            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                <p className="text-sm text-yellow-800">
                                    <span className="font-medium">Anomalia detectada:</span> Consumo de combustível fora do padrão.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
