import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { SGFCard } from '@/components/sgf/SGFCard';
import { SGFInput } from '@/components/sgf/SGFInput';
import { SGFSelect } from '@/components/sgf/SGFSelect';
import { SGFBadge } from '@/components/sgf/SGFBadge';
import { Search, Car, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHeader } from '@/contexts/HeaderContext';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons by status
const createCustomIcon = (color: string) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <svg style="transform: rotate(45deg);" width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M5 11l1.5-4.5h11L19 11m-1.5 5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-9 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM5 11v5a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-5H5z"/>
        </svg>
      </div>
    `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

const statusIcons = {
    moving: createCustomIcon('#22C55E'),
    idle: createCustomIcon('#3B82F6'),
    stopped: createCustomIcon('#9CA3AF'),
    alert: createCustomIcon('#EF4444'),
};

// Mock data
const mockVehicles = [
    { id: '1', plate: 'ABC-1234', driver: 'Maria Santos', status: 'moving', lat: -22.9068, lng: -43.1729, speed: 45, department: 'Obras' },
    { id: '2', plate: 'XYZ-5678', driver: 'João Silva', status: 'idle', lat: -22.9128, lng: -43.1859, speed: 0, department: 'Saúde' },
    { id: '3', plate: 'DEF-9012', driver: 'Pedro Lima', status: 'moving', lat: -22.9018, lng: -43.1659, speed: 38, department: 'Educação' },
    { id: '4', plate: 'GHI-3456', driver: 'Ana Costa', status: 'stopped', lat: -22.9158, lng: -43.1789, speed: 0, department: 'Obras' },
    { id: '5', plate: 'JKL-7890', driver: 'Carlos Souza', status: 'alert', lat: -22.8998, lng: -43.1929, speed: 85, department: 'Transporte' },
];

const statusLabels: Record<string, string> = {
    moving: 'Em movimento',
    idle: 'Parado/Ligado',
    stopped: 'Desligado',
    alert: 'Alerta',
};

// SGFBadge handles variants automatically if matched, otherwise fallback
// SGFBadge variants: 'default' | 'success' | 'warning' | 'error' | 'info' | 'moving' | 'idle' | 'stopped' | 'alert'
// We map mock status to Badge variant
const getBadgeVariant = (status: string): any => {
    // Exact match for moving, idle, stopped, alert
    return status;
};

export default function MapPage() {
    const [vehicles] = useState(mockVehicles);
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { setTitle, setSearchPlaceholder, setSearchHandler } = useHeader();

    useEffect(() => {
        setTitle('Mapa');
        setSearchPlaceholder('Pesquisar veículo ou motorista...');
        setSearchHandler((term: string) => setSearchTerm(term));

        return () => {
            setSearchHandler(() => { });
        };
    }, [setTitle, setSearchPlaceholder, setSearchHandler]);



    const filteredVehicles = vehicles.filter((v) => {
        const matchesSearch =
            v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.driver.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusCounts = vehicles.reduce(
        (acc, v) => {
            acc[v.status] = (acc[v.status] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    return (
        <div className="flex h-[calc(100vh-7rem)] gap-4">
            {/* Sidebar */}
            <SGFCard className="w-80 flex-shrink-0 flex flex-col p-0 overflow-hidden" padding="none">

                <div className="p-4 flex flex-col gap-4">
                    {/* Filters */}
                    <SGFInput
                        placeholder="Buscar placa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={Search}
                        className="bg-white"
                    />
                    <SGFSelect
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val)}
                        options={[
                            { value: 'all', label: 'Todos os status' },
                            { value: 'moving', label: 'Em movimento' },
                            { value: 'idle', label: 'Parado/Ligado' },
                            { value: 'stopped', label: 'Desligado' },
                            { value: 'alert', label: 'Alerta' },
                        ]}
                    />

                    {/* Status Summary */}
                    <div className="flex flex-wrap gap-2">
                        <SGFBadge variant="moving" dot>{statusCounts.moving || 0} ativo</SGFBadge>
                        <SGFBadge variant="idle" dot>{statusCounts.idle || 0} parado</SGFBadge>
                        <SGFBadge variant="alert" dot>{statusCounts.alert || 0} alerta</SGFBadge>
                    </div>
                </div>

                {/* Vehicle List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {filteredVehicles.map((vehicle) => (
                        <div
                            key={vehicle.id}
                            onClick={() => setSelectedVehicle(vehicle.id)}
                            className={cn(
                                'p-3 rounded-2xl border cursor-pointer transition-all',
                                'hover:border-[var(--sgf-primary)] hover:bg-[var(--sgf-primary)]/5',
                                selectedVehicle === vehicle.id
                                    ? 'border-[var(--sgf-primary)] bg-[var(--sgf-primary)]/5'
                                    : 'border-transparent bg-slate-50'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center',
                                        vehicle.status === 'moving' && 'bg-emerald-100 text-emerald-600',
                                        vehicle.status === 'idle' && 'bg-blue-100 text-blue-600',
                                        vehicle.status === 'stopped' && 'bg-slate-100 text-slate-600',
                                        vehicle.status === 'alert' && 'bg-red-100 text-red-600'
                                    )}
                                >
                                    <Car className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-gray-900">{vehicle.plate}</p>
                                    <p className="text-xs text-gray-500 truncate">{vehicle.driver}</p>
                                </div>
                                <SGFBadge variant={getBadgeVariant(vehicle.status)} size="sm">
                                    {vehicle.speed > 0 ? `${vehicle.speed} km/h` : '0 km/h'}
                                </SGFBadge>
                            </div>
                        </div>
                    ))}
                </div>
            </SGFCard>

            {/* Map */}
            <SGFCard className="flex-1 overflow-hidden p-0 h-full" padding="none">
                <MapContainer
                    center={[-22.9068, -43.1729]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    className="h-full w-full"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {filteredVehicles.map((vehicle) => (
                        <Marker
                            key={vehicle.id}
                            position={[vehicle.lat, vehicle.lng]}
                            icon={statusIcons[vehicle.status as keyof typeof statusIcons]}
                            eventHandlers={{
                                click: () => setSelectedVehicle(vehicle.id),
                            }}
                        >
                            <Popup>
                                <div className="p-2">
                                    <p className="font-bold text-base">{vehicle.plate}</p>
                                    <p className="text-sm text-gray-600">{vehicle.driver}</p>
                                    <p className="text-sm text-gray-600">{vehicle.department}</p>
                                    <div className="mt-2 flex items-center gap-1">
                                        <Navigation className="h-4 w-4 text-[var(--sgf-primary)]" />
                                        <span className="text-sm font-medium">{vehicle.speed} km/h</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </SGFCard>
        </div>
    );
}
