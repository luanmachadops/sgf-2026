import React, { useEffect, useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { useHeader } from '@/contexts/HeaderContext';

const YEAR_OPTIONS = [
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
];

const MONTH_OPTIONS = [
    { value: 'jan', label: 'Jan' },
    { value: 'fev', label: 'Fev' },
    { value: 'mar', label: 'Mar' },
    { value: 'abr', label: 'Abr' },
    { value: 'mai', label: 'Mai' },
    { value: 'jun', label: 'Jun' },
    { value: 'jul', label: 'Jul' },
    { value: 'ago', label: 'Ago' },
    { value: 'set', label: 'Set' },
    { value: 'out', label: 'Out' },
    { value: 'nov', label: 'Nov' },
    { value: 'dez', label: 'Dez' },
    { value: 'all', label: 'Todos' },
];

// Mock data removed (VEHICLES, ALERTS) as they were unused


export default function Dashboard() {
    const navigate = useNavigate();
    const { setTitle, setDescription, setSearchPlaceholder, setSearchHandler } = useHeader();
    const [selectedYear, setSelectedYear] = useState('2026');
    const [selectedMonth, setSelectedMonth] = useState('all');

    useEffect(() => {
        setTitle('Dashboard');
        setDescription('Visão geral dos indicadores e alertas da frota.');
        setSearchPlaceholder('Pesquisar veículo, condutor ou secretaria...');
        setSearchHandler(() => { }); // No global search action defined for dashboard yet
    }, [setTitle, setDescription, setSearchPlaceholder, setSearchHandler]);



    return (
        <div className="space-y-6">
            {/* Header Removed - Managed by HeaderContext */}

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* KPIs */}
                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                    <SGFKPICard
                        title="Frota ativa"
                        value="128"
                        icon={Truck}
                        iconColor="text-emerald-500"
                        chartColor="#10b981"
                        chartData={[
                            { month: 'Set', value: 110 },
                            { month: 'Out', value: 115 },
                            { month: 'Nov', value: 120 },
                            { month: 'Dez', value: 125 },
                            { month: 'Jan', value: 127 },
                            { month: 'Fev', value: 128 },
                        ]}
                    />
                    <SGFKPICard
                        title="Combustível"
                        value="15.4k"
                        icon={Fuel}
                        iconColor="text-blue-500"
                        chartColor="#3b82f6"
                        chartData={[
                            { month: 'Set', value: 12000 },
                            { month: 'Out', value: 14500 },
                            { month: 'Nov', value: 13200 },
                            { month: 'Dez', value: 15800 },
                            { month: 'Jan', value: 14200 },
                            { month: 'Fev', value: 15400 },
                        ]}
                    />
                    <SGFKPICard
                        title="Manutenção"
                        value="12"
                        icon={Wrench}
                        iconColor="text-amber-500"
                        chartColor="#f59e0b"
                        chartData={[
                            { month: 'Set', value: 8 },
                            { month: 'Out', value: 15 },
                            { month: 'Nov', value: 10 },
                            { month: 'Dez', value: 14 },
                            { month: 'Jan', value: 9 },
                            { month: 'Fev', value: 12 },
                        ]}
                    />
                    <SGFKPICard
                        title="Total Rodado"
                        value="45.8k"
                        icon={Activity}
                        iconColor="text-rose-500"
                        chartColor="#f43f5e"
                        chartData={[
                            { month: 'Set', value: 38000 },
                            { month: 'Out', value: 42000 },
                            { month: 'Nov', value: 40500 },
                            { month: 'Dez', value: 48000 },
                            { month: 'Jan', value: 44000 },
                            { month: 'Fev', value: 45800 },
                        ]}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Alerts (Moved to Main Column) -> NOW REPLACED BY SEMIANNUAL CHART */}
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
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={[
                                            { month: 'Set', expenses: 18500, km: 38000 },
                                            { month: 'Out', expenses: 22000, km: 42000 },
                                            { month: 'Nov', expenses: 19800, km: 40500 },
                                            { month: 'Dez', expenses: 25000, km: 48000 },
                                            { month: 'Jan', expenses: 23500, km: 44000 },
                                            { month: 'Fev', expenses: 21000, km: 45800 },
                                        ]}
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
                                            tickFormatter={(value) => `R$${value / 1000}k`}
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
                                                                    R$ {payload[0].value?.toLocaleString('pt-BR')}
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
                                            dataKey="expenses"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorGreen)"
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </SGFCard>
                    </div>

                    {/* Efficiency Chart (Moved to Sidebar & Emptied) */}
                    <div className="space-y-6">
                        <SGFCard className="relative overflow-hidden h-full" padding="none">
                            <div className="absolute inset-0 p-4">
                                <FuelExpenseChart />
                            </div>
                        </SGFCard>
                    </div>
                </div>

                {/* Fleet Table -> NOW Department Consumption Chart */}
                <div className="mt-10">
                    <SGFCard padding="none" className="overflow-hidden h-[400px]">
                        <DepartmentConsumptionChart />
                    </SGFCard>
                </div>
            </div>
        </div>
    );
}
