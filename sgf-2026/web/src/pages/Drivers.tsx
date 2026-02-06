import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SGFCard } from '@/components/sgf/SGFCard';
import { SGFButton } from '@/components/sgf/SGFButton';
import { SGFSelect } from '@/components/sgf/SGFSelect';
import { SGFBadge } from '@/components/sgf/SGFBadge';
import { SGFTable, type SGFTableColumn } from '@/components/sgf/SGFTable';
import { Modal } from '@/components/ui/Modal';
import {
    Plus,
    Users,
    Eye,
    Edit2,
    AlertTriangle,
    Phone,
    Search,
} from 'lucide-react';
import { formatDate, formatCPF, getStatusLabel, getStatusColor } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';
import { NewDriverForm } from '@/components/drivers/NewDriverForm';
import { useHeader } from '@/contexts/HeaderContext';
import { SGFKPICard } from '@/components/sgf/SGFKPICard';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data
const mockDrivers = [
    { id: '1', name: 'Maria Santos', cpf: '12345678901', phone: '11987654321', email: 'maria@prefeitura.gov.br', licenseNumber: '12345678', licenseCategory: 'B', licenseExpiry: '2027-05-15', department: 'Obras', status: 'ACTIVE' },
    { id: '2', name: 'João Silva', cpf: '98765432101', phone: '11976543210', email: 'joao@prefeitura.gov.br', licenseNumber: '87654321', licenseCategory: 'D', licenseExpiry: '2026-02-10', department: 'Saúde', status: 'ACTIVE' },
    { id: '3', name: 'Pedro Lima', cpf: '45678912301', phone: '11965432109', email: 'pedro@prefeitura.gov.br', licenseNumber: '45678912', licenseCategory: 'C', licenseExpiry: '2026-01-25', department: 'Educação', status: 'ACTIVE' },
    { id: '4', name: 'Ana Costa', cpf: '78912345601', phone: '11954321098', email: 'ana@prefeitura.gov.br', licenseNumber: '78912345', licenseCategory: 'B', licenseExpiry: '2028-09-20', department: 'Saúde', status: 'SUSPENDED' },
    { id: '5', name: 'Carlos Souza', cpf: '32165498701', phone: '11943210987', email: 'carlos@prefeitura.gov.br', licenseNumber: '32165498', licenseCategory: 'E', licenseExpiry: '2025-12-01', department: 'Transporte', status: 'ACTIVE' },
];

const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'INACTIVE', label: 'Inativo' },
    { value: 'SUSPENDED', label: 'Suspenso' },
];

const departmentOptions = [
    { value: '', label: 'Todas as secretarias' },
    { value: 'obras', label: 'Obras' },
    { value: 'saude', label: 'Saúde' },
    { value: 'educacao', label: 'Educação' },
    { value: 'transporte', label: 'Transporte' },
];

function getLicenseStatus(expiryDate: string) {
    const today = new Date();
    const expiry = parseISO(expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, today);

    if (daysUntilExpiry < 0) {
        return { label: 'Vencida', variant: 'error' as const, urgent: true };
    } else if (daysUntilExpiry <= 30) {
        return { label: `Vence em ${daysUntilExpiry} dias`, variant: 'warning' as const, urgent: true };
    } else if (daysUntilExpiry <= 90) {
        return { label: `Vence em ${daysUntilExpiry} dias`, variant: 'info' as const, urgent: false };
    }
    return { label: 'Regular', variant: 'success' as const, urgent: false };
}

export default function Drivers() {
    const { setTitle, setSearchHandler, setSearchPlaceholder, setHeaderAction } = useHeader();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        setTitle('Motoristas');
        setSearchPlaceholder('Buscar por nome, CPF ou CNH...');
        setSearchHandler((term) => setSearchTerm(term));

        setHeaderAction(
            <SGFButton onClick={() => setShowAddModal(true)} icon={Plus}>
                Novo Motorista
            </SGFButton>
        );

        return () => {
            setSearchHandler(() => { });
            setHeaderAction(null);
        };
    }, [setTitle, setSearchHandler, setSearchPlaceholder, setHeaderAction]);

    const drivers = mockDrivers;

    const filteredDrivers = drivers.filter((d) => {
        const matchesSearch =
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.cpf.includes(searchTerm) ||
            d.licenseNumber.includes(searchTerm);
        const matchesStatus = !statusFilter || d.status === statusFilter;
        const matchesDepartment = !departmentFilter || d.department.toLowerCase() === departmentFilter;
        return matchesSearch && matchesStatus && matchesDepartment;
    });

    const urgentCNHCount = drivers.filter((d) => getLicenseStatus(d.licenseExpiry).urgent).length;

    const columns: SGFTableColumn<typeof drivers[0]>[] = [
        {
            header: (
                <div className="flex flex-col gap-2 min-w-[200px]">
                    <span className="text-xs uppercase font-bold text-slate-400">Motorista</span>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar motorista..."
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
                    <div className="w-10 h-10 bg-[var(--sgf-primary)]/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-[var(--sgf-primary)]" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{row.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Phone className="h-3 w-3" />
                            {row.phone}
                        </div>
                    </div>
                </div>
            )
        },
        { header: 'CPF', accessor: (row) => formatCPF(row.cpf) },
        {
            header: 'CNH',
            accessor: (row) => (
                <div>
                    <span className="font-mono">{row.licenseNumber}</span>
                    <span className="ml-1 text-gray-500">({row.licenseCategory})</span>
                </div>
            )
        },
        {
            header: 'Validade CNH',
            accessor: (row) => {
                const status = getLicenseStatus(row.licenseExpiry);
                return (
                    <div className="flex items-center gap-2">
                        <span>{formatDate(row.licenseExpiry)}</span>
                        <SGFBadge variant={status.variant}>{status.label}</SGFBadge>
                    </div>
                );
            }
        },
        {
            header: (
                <div className="flex flex-col gap-2 min-w-[150px]">
                    <span className="text-xs uppercase font-bold text-slate-400">Secretaria</span>
                    <SGFSelect
                        value={departmentFilter}
                        onChange={(val) => setDepartmentFilter(val)}
                        options={departmentOptions}
                        placeholder="Filtrar..."
                    />
                </div>
            ),
            accessor: 'department'
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
                <SGFBadge variant={getStatusColor(row.status) as any}>
                    {getStatusLabel(row.status)}
                </SGFBadge>
            )
        },
        {
            header: 'Ações',
            accessor: (row) => (
                <div className="flex items-center gap-1">
                    <Link to={`/motoristas/${row.id}`}>
                        <SGFButton variant="ghost" size="sm" icon={Eye} />
                    </Link>
                    <SGFButton variant="ghost" size="sm" icon={Edit2} />
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header - Actions ONLY */}
            {/* Removed local button */}

            {/* Alert for expiring licenses */}
            <AnimatePresence>
                {urgentCNHCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex items-center gap-4 p-5 bg-rose-50 border border-rose-100 rounded-3xl shadow-sm mb-2">
                            <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-rose-900 leading-tight">Atenção com a CNH</h4>
                                <p className="text-sm text-rose-700/80 font-medium">
                                    <span className="font-black">{urgentCNHCount} motorista(s)</span> com CNH vencida ou próxima do vencimento. Verifique os prazos.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <SGFKPICard
                    title="Motoristas Ativos"
                    value={drivers.filter((d) => d.status === 'ACTIVE').length}
                    icon={Users}
                    iconColor="text-emerald-500"
                    chartColor="#10b981"
                    chartData={[
                        { month: 'Q1', value: 3 },
                        { month: 'Q2', value: 4 },
                        { month: 'Q3', value: 5 },
                    ]}
                />
                <SGFKPICard
                    title="Licenças em Alerta"
                    value={urgentCNHCount}
                    icon={AlertTriangle}
                    iconColor="text-amber-500"
                    chartColor="#f59e0b"
                    chartData={[
                        { month: 'Sem 1', value: 0 },
                        { month: 'Sem 2', value: 1 },
                        { month: 'Sem 3', value: urgentCNHCount },
                    ]}
                />
                <SGFKPICard
                    title="Cadastros Suspensos"
                    value={drivers.filter((d) => d.status === 'SUSPENDED').length}
                    icon={Users}
                    iconColor="text-slate-400"
                    chartColor="#94a3b8"
                    chartData={[
                        { month: 'Dez', value: 0 },
                        { month: 'Jan', value: 1 },
                        { month: 'Fev', value: drivers.filter((d) => d.status === 'SUSPENDED').length },
                    ]}
                />
            </div>

            {/* Table */}
            <div className="-mx-6 md:mx-0">
                <SGFTable columns={columns} data={filteredDrivers} keyExtractor={(r) => r.id} emptyMessage="Nenhum motorista encontrado." />
            </div>

            {/* Add Driver Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Novo Motorista"
                description="Adicione um novo motorista à frota"
                size="xl"
                showCloseButton={false}
            >
                <NewDriverForm
                    onSuccess={() => {
                        setShowAddModal(false);
                    }}
                    onCancel={() => setShowAddModal(false)}
                />
            </Modal>
        </div>
    );
}
