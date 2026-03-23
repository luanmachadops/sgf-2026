import { useEffect, useState } from 'react';
import {
    SGFKPICard,
    SGFCard,
    FuelExpenseChart,
    DepartmentConsumptionChart,
    SGFSelect
} from '@/components/sgf';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    Truck,
    Activity,
    Fuel,
    Wrench,
} from 'lucide-react';
import { useHeader } from '@/contexts/HeaderContext';
import {
    useDashboardKPIs,
    useExpenseChart
} from '@/hooks/useDashboard';
import { formatCurrency } from '@/lib/utils';

const YEAR_OPTIONS = [
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
];

const MONTH_OPTIONS = [
    { value: 'jan', label: 'Jan' },
    { value: 'fev', label: 'Fev' },
    { value: 'mar', label: 'Mar' },
    { value: 'all', label: 'Todos' },
];

export default function Dashboard() {
    const { setTitle, setDescription, setSearchPlaceholder, setSearchHandler } = useHeader();
    const [selectedYear, setSelectedYear] = useState('2026');
    const [selectedMonth, setSelectedMonth] = useState('all');

    // Real Data Hooks
    const { data: kpis, isLoading: isLoadingKPIs } = useDashboardKPIs();
    const { data: expenseData, isLoading: isLoadingExpenses } = useExpenseChart(6);

    useEffect(() => {
        setTitle('Dashboard');
        setDescription('Visão geral dos indicadores e alertas da frota.');
        setSearchPlaceholder('Pesquisar veículo, condutor ou secretaria...');
        setSearchHandler(() => { });
    }, [setTitle, setDescription, setSearchPlaceholder, setSearchHandler]);

    // Formatters for display
    const formatValue = (val: number | undefined) => {
        if (val === undefined) return '0';
        if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
        return val.toString();
    };

    return (
        <div className="space-y-6">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                    <SGFKPICard
                        title="Frota ativa"
                        value={formatValue(kpis?.fleet?.totalVehicles)}
                        loading={isLoadingKPIs}
                        icon={Truck}
                        iconColor="text-emerald-500"
                        chartColor="#10b981"
                        chartData={[]} // Placeholder for small bar chart in card
                    />
                    <SGFKPICard
                        title="Combustível (L)"
                        value={formatValue(kpis?.fuel?.totalLitersMonth)}
                        loading={isLoadingKPIs}
                        icon={Fuel}
                        iconColor="text-blue-500"
                        chartColor="#3b82f6"
                        chartData={[]}
                    />
                    <SGFKPICard
                        title="Manutenção Prev."
                        value={formatValue(kpis?.fleet?.inMaintenance)}
                        loading={isLoadingKPIs}
                        icon={Wrench}
                        iconColor="text-amber-500"
                        chartColor="#f59e0b"
                        chartData={[]}
                    />
                    <SGFKPICard
                        title="Total Rodado"
                        value={formatValue(kpis?.trips?.totalKmMonth)}
                        loading={isLoadingKPIs}
                        icon={Activity}
                        iconColor="text-rose-500"
                        chartColor="#f43f5e"
                        chartData={[]}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <SGFCard padding="lg">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                                <div>
                                    <h4 className="font-bold text-xl text-slate-800">
                                        Evolução de Gastos
                                    </h4>
                                    <p className="text-sm text-slate-400 font-medium">
                                        Gastos operacionais dos últimos 6 meses
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-32">
                                        <SGFSelect
                                            options={MONTH_OPTIONS}
                                            value={selectedMonth}
                                            onChange={setSelectedMonth}
                                            placeholder="Mês"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <SGFSelect
                                            options={YEAR_OPTIONS}
                                            value={selectedYear}
                                            onChange={setSelectedYear}
                                            placeholder="Ano"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="h-[250px] sm:h-[320px] w-full min-w-0">
                                {isLoadingExpenses ? (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50/50 rounded-2xl animate-pulse">
                                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Carregando dados...</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={expenseData || []}
                                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis
                                                dataKey="month"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                                tickFormatter={(value) => `R$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                                            />
                                            <Tooltip
                                                animationDuration={0}
                                                cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xl">
                                                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">{label}</p>
                                                                <div className="space-y-1">
                                                                    <p className="text-sm font-black text-emerald-600 flex items-center gap-2">
                                                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                                        {formatCurrency(payload[0].value as number)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="total"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorGreen)"
                                                isAnimationActive={false}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </SGFCard>
                    </div>

                    <div className="space-y-6">
                        <SGFCard className="relative overflow-hidden h-full" padding="none">
                            <div className="absolute inset-0 p-4">
                                <FuelExpenseChart />
                            </div>
                        </SGFCard>
                    </div>
                </div>

                <div className="mt-10">
                    <SGFCard padding="none" className="overflow-hidden min-h-[400px]">
                        <DepartmentConsumptionChart />
                    </SGFCard>
                </div>
            </div>
        </div>
    );
}
