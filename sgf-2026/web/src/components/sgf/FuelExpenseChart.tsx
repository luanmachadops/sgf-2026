import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';


import { SGFSelect } from './SGFSelect';

const DATA = [
    { name: 'Diesel', value: 4500, color: '#10B981' },   // Emerald-500
    { name: 'Gasolina', value: 3200, color: '#F59E0B' }, // Amber-500
    { name: 'Etanol', value: 1800, color: '#F97316' },   // Orange-500
];

const TOTAL = DATA.reduce((acc, item) => acc + item.value, 0);

const MONTH_OPTIONS = [
    { value: 'jan', label: 'Janeiro' },
    { value: 'fev', label: 'Fevereiro' },
    { value: 'mar', label: 'Março' },
];

export default function FuelExpenseChart() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = useState('jan');

    // Prepare data for each ring (concentric)
    // We want the rings to represent percentage of Total.
    // Order: Outer -> Inner
    const rings = DATA.map((item, index) => {
        return {
            ...item,
            innerRadius: 84 - (index * 12),
            outerRadius: 90 - (index * 12),
            data: [
                { value: item.value, fill: item.color },
                { value: TOTAL - item.value, fill: 'transparent' } // Remaining part of 360 degrees relative to total
            ]
        };
    });

    const activeItem = activeIndex !== null ? DATA[activeIndex] : null;

    return (
        <div className="w-full h-full flex flex-col relative px-2 pt-2">
            {/* Header: Title and Filter */}
            <div className="flex justify-between items-center mb-2 z-20 relative gap-4">
                <div>
                    <h3 className="text-slate-900 font-bold text-lg">Gasto por Combustível</h3>
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
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none pb-6"> {/* pb-6 to offset legend space */}
                    <div className="flex flex-col items-center justify-center text-center">
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                            {activeItem ? activeItem.name : 'Total'}
                        </span>
                        <span className={cn(
                            "text-2xl font-black tracking-tighter transition-colors duration-300",
                        )} style={{ color: activeItem ? activeItem.color : '#0f172a' }}> {/* slate-900 */}
                            R$ {activeItem
                                ? activeItem.value.toLocaleString('pt-BR')
                                : TOTAL.toLocaleString('pt-BR')
                            }
                        </span>
                        {activeItem && (
                            <span className="text-slate-400 text-[10px] font-bold mt-1">
                                {Math.round((activeItem.value / TOTAL) * 100)}%
                            </span>
                        )}
                    </div>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        {/* Background Tracks (Darker rings) */}
                        {rings.map((ring) => (
                            <Pie
                                key={`bg-${ring.name}`}
                                data={[{ value: 1 }]}
                                CX="50%"
                                CY="50%"
                                innerRadius={`${ring.innerRadius}%`}
                                outerRadius={`${ring.outerRadius}%`}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                                fill="#f3f4f5ff"
                                opacity={1}
                                isAnimationActive={false}
                            />
                        ))}

                        {/* Value Rings */}
                        {rings.map((ring, index) => (
                            <Pie
                                key={ring.name}
                                data={ring.data}
                                CX="50%"
                                CY="50%"
                                innerRadius={`${ring.innerRadius}%`}
                                outerRadius={`${ring.outerRadius}%`}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={10}
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                                className="cursor-pointer focus:outline-none"
                            >
                                {ring.data.map((entry, i) => (
                                    <Cell
                                        key={i}
                                        fill={entry.fill}
                                        className="transition-all duration-300 hover:opacity-80 focus:outline-none"
                                        opacity={activeIndex !== null && activeIndex !== index ? 0.3 : 1}
                                        stroke="none"
                                    />
                                ))}
                            </Pie>
                        ))}
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex w-full items-center justify-center gap-4 mt-2 shrink-0 h-6">
                {DATA.map((item, index) => (
                    <div
                        key={item.name}
                        className={cn(
                            "flex items-center gap-2 cursor-pointer transition-opacity duration-300",
                            activeIndex !== null && activeIndex !== index ? "opacity-30" : "opacity-100"
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] uppercase font-bold text-slate-600">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
