import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { SGFCard } from './SGFCard';
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

export interface SGFKPIChartData {
  month: string;
  value: number;
}

export interface SGFKPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  chartData?: SGFKPIChartData[];
  chartColor?: string;
  loading?: boolean;
  onClick?: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0F2B2F]/50 border border-white/10 p-2 rounded-xl shadow-2xl backdrop-blur-md text-center">
        <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-black text-white">{payload[0].value.toLocaleString('pt-BR')}</p>
      </div>
    );
  }
  return null;
};

export const SGFKPICard: React.FC<SGFKPICardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-emerald-500',
  chartData = [],
  chartColor = '#10b981', // emerald-500
  loading = false,
  onClick,
}) => {
  return (
    <SGFCard
      hover={!!onClick}
      onClick={onClick}
      className={`group h-full ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between h-full gap-4">
        {/* Left Side: Info */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className={`p-2.5 w-fit rounded-xl bg-slate-50 group-hover:scale-110 transition-transform duration-500 ${iconColor}`}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 truncate">{title}</p>
            {loading ? (
              <div className="h-9 bg-slate-100 rounded-lg animate-pulse w-24" />
            ) : (
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
            )}
          </div>
        </div>

        {/* Right Side: Chart */}
        <div className="w-[80px] h-[80px] shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" hide />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  content={<CustomTooltip />}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  fill={chartColor}
                  barSize={6}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColor}
                      fillOpacity={0.4 + (index / (chartData.length - 1)) * 0.6}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </SGFCard>
  );
};

