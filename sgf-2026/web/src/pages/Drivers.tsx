import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    Edit2,
    Eye,
    KeyRound,
    Phone,
    Search,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { SGFButton } from '@/components/sgf/SGFButton';
import { SGFBadge } from '@/components/sgf/SGFBadge';
import { SGFKPICard } from '@/components/sgf/SGFKPICard';
import { SGFSelect } from '@/components/sgf/SGFSelect';
import { SGFTable, type SGFTableColumn } from '@/components/sgf/SGFTable';
import { NewDriverForm } from '@/components/drivers/NewDriverForm';
import { DriverAccessForm } from '@/components/drivers/DriverAccessForm';
import { Modal } from '@/components/ui/Modal';
import { useHeader } from '@/contexts/HeaderContext';
import { departmentsApi } from '@/lib/supabase-api';
import { formatCPF, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useDrivers, type DriverRecord } from '@/hooks/useDrivers';

const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'INACTIVE', label: 'Inativo' },
    { value: 'SUSPENDED', label: 'Suspenso' },
];

type DriverTableRow = DriverRecord & {
    departmentName: string;
    hasAccess: boolean;
};

function getLicenseStatus(expiryDate: string) {
    const today = new Date();
    const expiry = parseISO(expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, today);

    if (daysUntilExpiry < 0) {
        return { label: 'Vencida', variant: 'error' as const, urgent: true };
    }
    if (daysUntilExpiry <= 30) {
        return { label: `Vence em ${daysUntilExpiry} dias`, variant: 'warning' as const, urgent: true };
    }
    if (daysUntilExpiry <= 90) {
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
    const [accessModal, setAccessModal] = useState<{
        mode: 'provision' | 'reset';
        driver: DriverRecord;
    } | null>(null);

    const { data: departments = [] } = useQuery({
        queryKey: ['departments'],
        queryFn: () => departmentsApi.getAll(),
    });

    const {
        data: drivers = [],
        isLoading,
    } = useDrivers({
        search: searchTerm || undefined,
        status: statusFilter as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | undefined,
        departmentId: departmentFilter || undefined,
    });

    useEffect(() => {
        setTitle('Motoristas');
        setSearchPlaceholder('Buscar por nome, CPF, e-mail ou CNH...');
        setSearchHandler((term) => setSearchTerm(term));

        setHeaderAction(
            <SGFButton onClick={() => setShowAddModal(true)} icon={Users}>
                Novo Motorista
            </SGFButton>
        );

        return () => {
            setSearchHandler(() => { });
            setHeaderAction(null);
        };
    }, [setTitle, setSearchHandler, setSearchPlaceholder, setHeaderAction]);

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

    const tableRows = useMemo<DriverTableRow[]>(
        () =>
            drivers.map((driver) => ({
                ...driver,
                departmentName: driver.departments?.name || 'Sem secretaria',
                hasAccess: Boolean(driver.user_id),
            })),
        [drivers]
    );

    const urgentCNHCount = tableRows.filter((driver) => getLicenseStatus(driver.cnh_expiry_date).urgent).length;
    const activeDriversCount = tableRows.filter((driver) => driver.status === 'ACTIVE').length;
    const suspendedDriversCount = tableRows.filter((driver) => driver.status === 'SUSPENDED').length;
    const noAccessCount = tableRows.filter((driver) => !driver.hasAccess).length;

    const columns: SGFTableColumn<DriverTableRow>[] = [
        {
            header: (
                <div className="flex flex-col gap-2 min-w-[220px]">
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
                            {row.phone || 'Sem telefone'}
                        </div>
                    </div>
                </div>
            ),
        },
        { header: 'CPF', accessor: (row) => formatCPF(row.cpf) },
        {
            header: 'CNH',
            accessor: (row) => (
                <div>
                    <span className="font-mono">{row.cnh_number}</span>
                    <span className="ml-1 text-gray-500">({row.cnh_category})</span>
                </div>
            ),
        },
        {
            header: 'Validade CNH',
            accessor: (row) => {
                const status = getLicenseStatus(row.cnh_expiry_date);
                return (
                    <div className="flex items-center gap-2">
                        <span>{formatDate(row.cnh_expiry_date)}</span>
                        <SGFBadge variant={status.variant}>{status.label}</SGFBadge>
                    </div>
                );
            },
        },
        {
            header: (
                <div className="flex flex-col gap-2 min-w-[150px]">
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
            header: 'Acesso',
            accessor: (row) => (
                <SGFBadge variant={row.hasAccess ? 'success' : 'warning'} icon={row.hasAccess ? ShieldCheck : KeyRound}>
                    {row.hasAccess ? 'Com acesso' : 'Sem acesso'}
                </SGFBadge>
            ),
        },
        {
            header: (
                <div className="flex flex-col gap-2 min-w-[150px]">
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
        {
            header: 'Ações',
            accessor: (row) => (
                <div className="flex items-center gap-1">
                    <Link to={`/motoristas/${row.id}`}>
                        <SGFButton variant="ghost" size="sm" icon={Eye} />
                    </Link>
                    <SGFButton variant="ghost" size="sm" icon={Edit2} />
                    <SGFButton
                        variant="ghost"
                        size="sm"
                        icon={row.hasAccess ? KeyRound : ShieldCheck}
                        onClick={(event) => {
                            event.stopPropagation();
                            setAccessModal({
                                mode: row.hasAccess ? 'reset' : 'provision',
                                driver: row,
                            });
                        }}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
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
                                    <span className="font-black">{urgentCNHCount} motorista(s)</span> com CNH vencida ou próxima do vencimento.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-4 md:grid-cols-4">
                <SGFKPICard
                    title="Motoristas Ativos"
                    value={activeDriversCount}
                    icon={Users}
                    iconColor="text-emerald-500"
                    chartColor="#10b981"
                    chartData={[
                        { month: 'Cad.', value: tableRows.length },
                        { month: 'Ativ.', value: activeDriversCount },
                        { month: 'Susp.', value: suspendedDriversCount },
                    ]}
                />
                <SGFKPICard
                    title="Licenças em Alerta"
                    value={urgentCNHCount}
                    icon={AlertTriangle}
                    iconColor="text-amber-500"
                    chartColor="#f59e0b"
                    chartData={[
                        { month: 'Reg.', value: Math.max(tableRows.length - urgentCNHCount, 0) },
                        { month: 'Alert.', value: urgentCNHCount },
                        { month: 'Susp.', value: suspendedDriversCount },
                    ]}
                />
                <SGFKPICard
                    title="Sem Acesso"
                    value={noAccessCount}
                    icon={ShieldCheck}
                    iconColor="text-sky-500"
                    chartColor="#0ea5e9"
                    chartData={[
                        { month: 'Com', value: tableRows.length - noAccessCount },
                        { month: 'Sem', value: noAccessCount },
                        { month: 'Total', value: tableRows.length },
                    ]}
                />
                <SGFKPICard
                    title="Cadastros Suspensos"
                    value={suspendedDriversCount}
                    icon={Users}
                    iconColor="text-slate-400"
                    chartColor="#94a3b8"
                    chartData={[
                        { month: 'Ativ.', value: activeDriversCount },
                        { month: 'Sem', value: noAccessCount },
                        { month: 'Susp.', value: suspendedDriversCount },
                    ]}
                />
            </div>

            <div className="-mx-6 md:mx-0">
                <SGFTable
                    columns={columns}
                    data={tableRows}
                    keyExtractor={(row) => row.id}
                    loading={isLoading}
                    emptyMessage="Nenhum motorista encontrado."
                />
            </div>

            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Novo Motorista"
                description="Cadastre o motorista e já crie o acesso dele ao app."
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

            <Modal
                isOpen={Boolean(accessModal)}
                onClose={() => setAccessModal(null)}
                title={accessModal?.mode === 'reset' ? 'Redefinir senha' : 'Criar acesso'}
                description={
                    accessModal?.mode === 'reset'
                        ? 'Defina uma nova senha para o motorista selecionado.'
                        : 'Crie a senha inicial para liberar o acesso do motorista ao app.'
                }
                size="lg"
                showCloseButton={false}
            >
                {accessModal ? (
                    <DriverAccessForm
                        driver={accessModal.driver}
                        mode={accessModal.mode}
                        onSuccess={() => setAccessModal(null)}
                        onCancel={() => setAccessModal(null)}
                    />
                ) : null}
            </Modal>
        </div>
    );
}
