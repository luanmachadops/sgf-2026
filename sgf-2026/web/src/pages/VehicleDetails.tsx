import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SGFCard } from '@/components/sgf/SGFCard';
import { SGFButton } from '@/components/sgf/SGFButton';
import { SGFBadge } from '@/components/sgf/SGFBadge';
import { SGFTable, type SGFTableColumn } from '@/components/sgf/SGFTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
    ArrowLeft,
    Edit2,
    Fuel,
    Wrench,
    Route,
    FileText,
    Calendar,
    Gauge,
    Car,
    Camera,
    Upload,
    Loader2,
} from 'lucide-react';
import { formatDate, formatDistance, formatCurrency, getStatusLabel, getStatusColor } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { vehiclesApi } from '@/lib/supabase-api';
import { resizeAndConvertToWebP, isImageFile } from '@/lib/imageUtils';
import { toast } from 'sonner';

// Mock data - using real vehicle ID from database
const mockVehicle = {
    id: '660e8400-e29b-41d4-a716-446655440001',
    plate: 'ABC1A42',
    brand: 'Fiat',
    model: 'Pulse',
    year: 2023,
    type: 'Pickup',
    status: 'AVAILABLE',
    department: 'Obras',
    odometer: 45230,
    fuelType: 'Gasolina',
    chassi: '9BD17604DF4123456',
    renavam: '12345678901',
    color: 'Branco',
    acquisition: '2023-01-15',
    avgConsumption: 8.5,
    lastMaintenance: '2025-12-01',
    nextMaintenance: '2026-03-01',
    insuranceExpiry: '2026-06-15',
    photo: '',
};

const mockTrips = [
    { id: '1', date: '2026-01-15', driver: 'Maria Santos', startKm: 45100, endKm: 45230, distance: 130, purpose: 'Visita técnica' },
    { id: '2', date: '2026-01-14', driver: 'João Silva', startKm: 44900, endKm: 45100, distance: 200, purpose: 'Transporte de materiais' },
    { id: '3', date: '2026-01-12', driver: 'Pedro Lima', startKm: 44750, endKm: 44900, distance: 150, purpose: 'Fiscalização de obras' },
];

const mockRefuelings = [
    { id: '1', date: '2026-01-15', liters: 45, cost: 287.10, odometer: 45230, consumption: 8.2 },
    { id: '2', date: '2026-01-08', liters: 42, cost: 268.38, odometer: 44860, consumption: 8.8 },
    { id: '3', date: '2026-01-02', liters: 50, cost: 319.50, odometer: 44480, consumption: 7.6 },
];

const mockMaintenances = [
    { id: '1', date: '2025-12-01', type: 'Preventiva', description: 'Troca de óleo e filtros', cost: 450, status: 'COMPLETED' },
    { id: '2', date: '2025-10-15', type: 'Corretiva', description: 'Substituição pastilhas de freio', cost: 320, status: 'COMPLETED' },
    { id: '3', date: '2026-03-01', type: 'Preventiva', description: 'Revisão 50.000 km', cost: null, status: 'SCHEDULED' },
];

export default function VehicleDetails() {
    const { id } = useParams();
    const [vehicle, setVehicle] = useState(mockVehicle); // Replace with API call
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Table definitions
    const tripColumns: SGFTableColumn<typeof mockTrips[0]>[] = [
        { header: 'Data', accessor: (row) => formatDate(row.date) },
        { header: 'Motorista', accessor: 'driver' },
        { header: 'Km Inicial', accessor: (row) => row.startKm.toLocaleString() },
        { header: 'Km Final', accessor: (row) => row.endKm.toLocaleString() },
        { header: 'Distância', accessor: (row) => formatDistance(row.distance) },
        { header: 'Finalidade', accessor: 'purpose' },
    ];

    const refuelingColumns: SGFTableColumn<typeof mockRefuelings[0]>[] = [
        { header: 'Data', accessor: (row) => formatDate(row.date) },
        { header: 'Litros', accessor: (row) => `${row.liters} L` },
        { header: 'Valor', accessor: (row) => formatCurrency(row.cost) },
        { header: 'Odômetro', accessor: (row) => formatDistance(row.odometer) },
        { header: 'Consumo', accessor: (row) => `${row.consumption} km/L` },
    ];

    const maintenanceColumns: SGFTableColumn<typeof mockMaintenances[0]>[] = [
        { header: 'Data', accessor: (row) => formatDate(row.date) },
        { header: 'Tipo', accessor: 'type' },
        { header: 'Descrição', accessor: 'description' },
        { header: 'Custo', accessor: (row) => row.cost ? formatCurrency(row.cost) : '-' },
        {
            header: 'Status',
            accessor: (row) => (
                <SGFBadge variant={getStatusColor(row.status) as any}>
                    {getStatusLabel(row.status)}
                </SGFBadge>
            )
        },
    ];

    // Photo upload handler
    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!isImageFile(file)) {
            toast.error('Por favor, selecione um arquivo de imagem válido');
            return;
        }

        try {
            setIsUploading(true);
            toast.info('Processando imagem...');

            // Step 1: Resize and convert to WebP
            const optimizedBlob = await resizeAndConvertToWebP(file, 1000);

            // Step 2: Delete old photo if exists
            if (vehicle.photo) {
                try {
                    // Extract filename from URL
                    const oldUrl = vehicle.photo;
                    const urlParts = oldUrl.split('/');
                    const oldFileName = urlParts[urlParts.length - 1];

                    if (oldFileName && oldFileName.startsWith('vehicle-')) {
                        await supabase.storage
                            .from('vehicle-photos')
                            .remove([oldFileName]);
                        console.log('Old photo deleted:', oldFileName);
                    }
                } catch (deleteError) {
                    console.warn('Could not delete old photo:', deleteError);
                    // Continue anyway, old photo stays (not critical)
                }
            }

            // Step 3: Upload new photo to Supabase Storage
            const fileName = `vehicle-${vehicle.id}-${Date.now()}.webp`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('vehicle-photos')
                .upload(fileName, optimizedBlob, {
                    contentType: 'image/webp',
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            // Step 4: Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('vehicle-photos')
                .getPublicUrl(fileName);

            // Step 5: Update vehicle record via Supabase directly
            const { error: updateError } = await supabase
                .from('vehicles')
                .update({ photo_url: publicUrl })
                .eq('id', vehicle.id);

            if (updateError) {
                console.error('Database update error:', updateError);
                // Photo was uploaded successfully, just show warning
                toast.warning('Foto salva, mas houve um erro ao atualizar o registro');
            }

            // Step 6: Update local state
            setVehicle({ ...vehicle, photo: publicUrl });

            toast.success('Foto atualizada com sucesso!');
        } catch (error: any) {
            console.error('Error uploading photo:', error);
            toast.error(error.message || 'Erro ao fazer upload da foto');
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="grid grid-cols-3 items-center">
                <div>
                    <Link to="/veiculos">
                        <SGFButton variant="ghost" size="sm" icon={ArrowLeft}>
                            Voltar
                        </SGFButton>
                    </Link>
                </div>

                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {vehicle.brand} {vehicle.model} - {vehicle.plate}
                    </h1>
                </div>

                <div className="flex justify-end">
                    <SGFButton icon={Edit2}>Editar</SGFButton>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <SGFCard padding="sm">
                    <div className="flex items-center gap-3">
                        <Gauge className="h-8 w-8 text-[var(--sgf-primary)]" />
                        <div>
                            <p className="text-2xl font-bold">{formatDistance(vehicle.odometer)}</p>
                            <p className="text-sm text-gray-500">Odômetro</p>
                        </div>
                    </div>
                </SGFCard>
                <SGFCard padding="sm">
                    <div className="flex items-center gap-3">
                        <Fuel className="h-8 w-8 text-blue-600" />
                        <div>
                            <p className="text-2xl font-bold">{vehicle.avgConsumption} km/L</p>
                            <p className="text-sm text-gray-500">Consumo médio</p>
                        </div>
                    </div>
                </SGFCard>
                <SGFCard padding="sm">
                    <div className="flex items-center gap-3">
                        <Route className="h-8 w-8 text-green-600" />
                        <div>
                            <p className="text-2xl font-bold">{mockTrips.length}</p>
                            <p className="text-sm text-gray-500">Viagens este mês</p>
                        </div>
                    </div>
                </SGFCard>
                <SGFCard padding="sm">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-yellow-600" />
                        <div>
                            <p className="text-2xl font-bold">{formatDate(vehicle.nextMaintenance)}</p>
                            <p className="text-sm text-gray-500">Próxima manutenção</p>
                        </div>
                    </div>
                </SGFCard>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[400px] mx-auto bg-slate-100/50 p-1 rounded-xl">
                    <TabsTrigger
                        value="info"
                        className="rounded-lg data-[state=active]:bg-[#00A86B] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                    >
                        Info
                    </TabsTrigger>
                    <TabsTrigger
                        value="trips"
                        className="rounded-lg data-[state=active]:bg-[#00A86B] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                    >
                        Viagens
                    </TabsTrigger>
                    <TabsTrigger
                        value="refuelings"
                        className="rounded-lg data-[state=active]:bg-[#00A86B] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                    >
                        Abaste.
                    </TabsTrigger>
                    <TabsTrigger
                        value="maintenances"
                        className="rounded-lg data-[state=active]:bg-[#00A86B] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                    >
                        Manut.
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="info">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Photo and Status Card */}
                        <div className="lg:col-span-1 space-y-6">
                            <SGFCard className="h-fit">
                                <div className="space-y-6">
                                    <div className="aspect-[4/3] w-full bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden relative group shadow-inner">
                                        {vehicle.photo ? (
                                            <img
                                                src={vehicle.photo}
                                                alt={`${vehicle.brand} ${vehicle.model}`}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-slate-200">
                                                <Car size={80} strokeWidth={1} />
                                                <p className="mt-4 text-sm font-medium text-slate-400">Sem foto disponível</p>
                                            </div>
                                        )}

                                        <div
                                            className="absolute inset-0 bg-[#0F2B2F]/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
                                            onClick={handlePhotoClick}
                                        >
                                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <SGFButton
                                                    variant="secondary"
                                                    size="sm"
                                                    icon={isUploading ? Loader2 : Camera}
                                                    disabled={isUploading}
                                                    className="shadow-xl"
                                                >
                                                    {isUploading ? 'Enviando...' : 'Alterar Foto'}
                                                </SGFButton>
                                            </div>
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            className="hidden"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full animate-pulse ${vehicle.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                <span className="text-sm font-semibold text-slate-700">Status Atual</span>
                                            </div>
                                            <SGFBadge variant={getStatusColor(vehicle.status) as any}>
                                                {getStatusLabel(vehicle.status)}
                                            </SGFBadge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                                <p className="text-[10px] text-slate-400 uppercase tracking-[0.1em] font-bold mb-1">Ano Modelo</p>
                                                <p className="text-xl font-black text-[#0F2B2F]">{vehicle.year}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                                <p className="text-[10px] text-slate-400 uppercase tracking-[0.1em] font-bold mb-1">Combustível</p>
                                                <p className="text-sm font-bold text-[#0F2B2F]">{vehicle.fuelType}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SGFCard>
                        </div>

                        {/* Details Cards */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Technical Specs */}
                                <SGFCard title="Dados Técnicos" icon={Car}>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Marca / Fabricante', value: vehicle.brand, icon: Car },
                                            { label: 'Modelo do Veículo', value: vehicle.model, icon: Car },
                                            { label: 'Tipo / Categoria', value: vehicle.type, icon: Car },
                                            { label: 'Cor predominante', value: vehicle.color, icon: Car },
                                            { label: 'Quilometragem atual', value: formatDistance(vehicle.odometer), icon: Gauge },
                                        ].map((item, i) => (
                                            <div key={i} className="group flex items-center justify-between py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-2 -mx-2 rounded-lg transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                        <item.icon size={16} />
                                                    </div>
                                                    <span className="text-sm text-slate-500 font-medium">{item.label}</span>
                                                </div>
                                                <span className="text-sm font-bold text-slate-900">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </SGFCard>

                                {/* Documentation Specs */}
                                <SGFCard title="Documentação Legal" icon={FileText}>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Placa de Identificação', value: vehicle.plate, isBadge: true },
                                            { label: 'Número do Chassi', value: vehicle.chassi, isMono: true },
                                            { label: 'Código Renavam', value: vehicle.renavam },
                                            { label: 'Secretaria Responsável', value: vehicle.department },
                                            { label: 'Data de Aquisição', value: formatDate(vehicle.acquisition) },
                                            { label: 'Vencimento do Seguro', value: formatDate(vehicle.insuranceExpiry), isWarning: true },
                                        ].map((item, i) => (
                                            <div key={i} className="group flex items-center justify-between py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-2 -mx-2 rounded-lg transition-colors">
                                                <span className="text-sm text-slate-500 font-medium">{item.label}</span>
                                                {item.isBadge ? (
                                                    <span className="text-sm font-black bg-[#0F2B2F] text-white px-2.5 py-1 rounded-md tracking-wider">
                                                        {item.value}
                                                    </span>
                                                ) : (
                                                    <span className={`text-sm font-bold ${item.isMono ? 'font-mono text-xs' : ''} ${item.isWarning ? 'text-amber-600' : 'text-slate-900'}`}>
                                                        {item.value}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </SGFCard>
                            </div>

                            {/* Additional Info / Notes */}
                            <SGFCard className="relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 transition-transform duration-1000 group-hover:scale-110"></div>
                                <div className="relative flex items-start gap-4 p-2">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                                        <Fuel size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-[#0F2B2F] mb-1">Eficiência Energética</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            Este veículo mantém um consumo médio histórico de <span className="font-bold text-emerald-600">{vehicle.avgConsumption} km/L</span>.
                                            O desempenho ideal para esta categoria {vehicle.type} é de aproximadamente 9.2 km/L sob condições normais de uso.
                                        </p>
                                    </div>
                                </div>
                            </SGFCard>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="trips">
                    <div className="-mx-4 md:mx-0">
                        <SGFTable columns={tripColumns} data={mockTrips} keyExtractor={(r) => r.id} />
                    </div>
                </TabsContent>

                <TabsContent value="refuelings">
                    <div className="-mx-4 md:mx-0">
                        <SGFTable columns={refuelingColumns} data={mockRefuelings} keyExtractor={(r) => r.id} />
                    </div>
                </TabsContent>

                <TabsContent value="maintenances">
                    <div className="-mx-4 md:mx-0">
                        <SGFTable columns={maintenanceColumns} data={mockMaintenances} keyExtractor={(r) => r.id} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
