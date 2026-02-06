import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SGFCard } from '@/components/sgf/SGFCard';
import { SGFButton } from '@/components/sgf/SGFButton';
import { SGFBadge } from '@/components/sgf/SGFBadge';
import { SGFTable, type SGFTableColumn } from '@/components/sgf/SGFTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbLink,
} from '@/components/ui/Breadcrumb';
import {
    ArrowLeft,
    Edit2,
    Route,
    FileText,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Car,
    Award,
} from 'lucide-react';
import { formatDate, formatCPF, formatDistance, getStatusLabel, getStatusColor } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';

// Mock data
const mockDriver = {
    id: '1',
    name: 'Maria Santos',
    cpf: '12345678901',
    phone: '11987654321',
    email: 'maria@prefeitura.gov.br',
    address: 'Rua das Flores, 123 - Centro',
    licenseNumber: '12345678',
    licenseCategory: 'B',
    licenseExpiry: '2027-05-15',
    department: 'Obras',
    status: 'ACTIVE',
    hireDate: '2020-03-15',
    birthDate: '1985-08-22',
    totalTrips: 342,
    totalKm: 15420,
    avgRating: 4.8,
};

const mockTrips = [
    { id: '1', date: '2026-01-15', vehicle: 'ABC-1234', startKm: 45100, endKm: 45230, distance: 130, purpose: 'Visita técnica' },
    { id: '2', date: '2026-01-12', vehicle: 'XYZ-5678', startKm: 67500, endKm: 67680, distance: 180, purpose: 'Transporte de materiais' },
    { id: '3', date: '2026-01-10', vehicle: 'ABC-1234', startKm: 44900, endKm: 45100, distance: 200, purpose: 'Fiscalização' },
];

function getLicenseStatus(expiryDate: string) {
    const today = new Date();
    const expiry = parseISO(expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, today);

    if (daysUntilExpiry < 0) {
        return { label: 'Vencida', variant: 'error' as const };
    } else if (daysUntilExpiry <= 30) {
        return { label: `Vence em ${daysUntilExpiry} dias`, variant: 'warning' as const };
    } else if (daysUntilExpiry <= 90) {
        return { label: `Vence em ${daysUntilExpiry} dias`, variant: 'info' as const };
    }
    return { label: 'Regular', variant: 'success' as const };
}

export default function DriverDetails() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('info');

    const driver = mockDriver;
    const licenseStatus = getLicenseStatus(driver.licenseExpiry);

    const tripColumns: SGFTableColumn<typeof mockTrips[0]>[] = [
        { header: 'Data', accessor: (row) => formatDate(row.date) },
        { header: 'Veículo', accessor: (row) => <span className="font-mono">{row.vehicle}</span> },
        { header: 'Km Inicial', accessor: (row) => row.startKm.toLocaleString() },
        { header: 'Km Final', accessor: (row) => row.endKm.toLocaleString() },
        { header: 'Distância', accessor: (row) => formatDistance(row.distance) },
        { header: 'Finalidade', accessor: 'purpose' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/motoristas">Motoristas</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{driver.name}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="flex items-center gap-4 mt-2">
                        <Link to="/motoristas">
                            <SGFButton variant="ghost" size="sm" icon={ArrowLeft}>
                                Voltar
                            </SGFButton>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">{driver.name}</h1>
                        <SGFBadge variant={getStatusColor(driver.status) as any}>
                            {getStatusLabel(driver.status)}
                        </SGFBadge>
                    </div>
                </div>
                <SGFButton icon={Edit2}>Editar</SGFButton>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <SGFCard padding="sm">
                    <div className="flex items-center gap-3">
                        <Route className="h-8 w-8 text-[var(--sgf-primary)]" />
                        <div>
                            <p className="text-2xl font-bold">{driver.totalTrips}</p>
                            <p className="text-sm text-gray-500">Viagens totais</p>
                        </div>
                    </div>
                </SGFCard>
                <SGFCard padding="sm">
                    <div className="flex items-center gap-3">
                        <Car className="h-8 w-8 text-blue-600" />
                        <div>
                            <p className="text-2xl font-bold">{formatDistance(driver.totalKm)}</p>
                            <p className="text-sm text-gray-500">Km percorridos</p>
                        </div>
                    </div>
                </SGFCard>
                <SGFCard padding="sm">
                    <div className="flex items-center gap-3">
                        <Award className="h-8 w-8 text-yellow-500" />
                        <div>
                            <p className="text-2xl font-bold">{driver.avgRating}</p>
                            <p className="text-sm text-gray-500">Avaliação média</p>
                        </div>
                    </div>
                </SGFCard>
                <SGFCard padding="sm">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-green-600" />
                        <div>
                            <p className="text-2xl font-bold">{formatDate(driver.licenseExpiry)}</p>
                            <p className="text-sm text-gray-500">Validade CNH</p>
                        </div>
                    </div>
                </SGFCard>
            </div>

            {/* Tabs */}
            <SGFCard>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="info">
                            <FileText className="h-4 w-4 mr-2" />
                            Informações
                        </TabsTrigger>
                        <TabsTrigger value="trips">
                            <Route className="h-4 w-4 mr-2" />
                            Viagens
                        </TabsTrigger>
                        <TabsTrigger value="documents">
                            <FileText className="h-4 w-4 mr-2" />
                            Documentos
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="info">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900">Dados Pessoais</h3>
                                <dl className="space-y-3 p-4 bg-slate-50 rounded-xl">
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Nome completo</dt>
                                        <dd className="font-medium">{driver.name}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">CPF</dt>
                                        <dd className="font-medium">{formatCPF(driver.cpf)}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Data de nascimento</dt>
                                        <dd className="font-medium">{formatDate(driver.birthDate)}</dd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <dt className="text-gray-500">Telefone</dt>
                                        <dd className="font-medium flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            {driver.phone}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <dt className="text-gray-500">Email</dt>
                                        <dd className="font-medium flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            {driver.email}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <dt className="text-gray-500">Endereço</dt>
                                        <dd className="font-medium text-right flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                            {driver.address}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900">Habilitação e Vínculo</h3>
                                <dl className="space-y-3 p-4 bg-slate-50 rounded-xl">
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Nº CNH</dt>
                                        <dd className="font-medium font-mono">{driver.licenseNumber}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Categoria</dt>
                                        <dd className="font-medium">{driver.licenseCategory}</dd>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <dt className="text-gray-500">Validade</dt>
                                        <dd className="font-medium flex items-center gap-2">
                                            {formatDate(driver.licenseExpiry)}
                                            <SGFBadge variant={licenseStatus.variant}>{licenseStatus.label}</SGFBadge>
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Secretaria</dt>
                                        <dd className="font-medium">{driver.department}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Data de admissão</dt>
                                        <dd className="font-medium">{formatDate(driver.hireDate)}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="trips">
                        <SGFTable columns={tripColumns} data={mockTrips} keyExtractor={(r) => r.id} emptyMessage="Nenhuma viagem registrada." />
                    </TabsContent>

                    <TabsContent value="documents">
                        {/* Using SGFTable structure for documents if needed or just empty state */}
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">Nenhum documento cadastrado.</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </SGFCard>
        </div>
    );
}
