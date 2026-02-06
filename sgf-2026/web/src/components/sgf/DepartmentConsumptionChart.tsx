import React, { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { SGFSelect } from './SGFSelect';

const DATA = [
    { name: 'Saúde', fuel: 12500, maintenance: 3200 },
    { name: 'Educação', fuel: 8900, maintenance: 1500 },
    { name: 'Obras', fuel: 15600, maintenance: 5400 },
    { name: 'Gabinete', fuel: 4200, maintenance: 800 },
    { name: 'Social', fuel: 3800, maintenance: 1200 },
    { name: 'Adm', fuel: 2500, maintenance: 600 },
];

const MONTH_OPTIONS = [
    { value: 'jan', label: 'Janeiro' },
    { value: 'fev', label: 'Fevereiro' },
    { value: 'mar', label: 'Março' },
];

export default function DepartmentConsumptionChart() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = useState('jan');

    return (
        <div className="w-full h-full flex flex-col relative px-2 pt-2">
            {/* Header: Title and Filter */}
            <div className="flex justify-between items-center mb-6 z-20 relative gap-4">
                <div>
                    <h3 className="text-slate-900 font-bold text-lg">Consumo por Secretaria</h3>
                    <p className="text-xs text-slate-400 font-medium">
                        Combustível e Manutenção
                    </p>
                </div>
                <div className="w-36">
                    <SGFSelect
                        options={MONTH_OPTIONS}
                        value={selectedMonth}
                        onChange={(val) => setSelectedMonth(val)}
                        placeholder="Mês"
                        className="bg-transparent"
                    />
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={DATA}
                        margin={{
                            top: 20,
                            right: 10,
                            left: 0,
                            bottom: 5,
                        }}
                        barSize={32}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                            tickFormatter={(value) => `R$${value / 1000}k`}
                        />
                        <Tooltip
                            cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const fuelValue = payload.find(p => p.dataKey === 'fuel')?.value || 0;
                                    const maintenanceValue = payload.find(p => p.dataKey === 'maintenance')?.value || 0;
                                    const total = Number(fuelValue) + Number(maintenanceValue);

                                    return (
                                        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xl min-w-[200px]">
                                            <p className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-50">
                                                {label}
                                            </p>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                        <span className="text-xs font-medium text-slate-500">Combustível</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-emerald-600">
                                                        R$ {Number(fuelValue).toLocaleString('pt-BR')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                                        <span className="text-xs font-medium text-slate-500">Manutenção</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-amber-600">
                                                        R$ {Number(maintenanceValue).toLocaleString('pt-BR')}
                                                    </span>
                                                </div>
                                                <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-400">Total</span>
                                                    <span className="text-sm font-black text-slate-800">
                                                        R$ {total.toLocaleString('pt-BR')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="fuel"
                            stackId="a"
                            fill="#10B981"
                            radius={[0, 0, 4, 4]}
                        />
                        <Bar
                            dataKey="maintenance"
                            stackId="a"
                            fill="#F59E0B"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
