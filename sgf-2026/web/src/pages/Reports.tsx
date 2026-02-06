import React, { useState } from 'react';
import { SGFCard } from '@/components/sgf/SGFCard';
import { SGFButton } from '@/components/sgf/SGFButton';
import { SGFSelect } from '@/components/sgf/SGFSelect';
import { SGFInput } from '@/components/sgf/SGFInput';
import { Modal } from '@/components/ui/Modal';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbPage,
} from '@/components/ui/Breadcrumb';
import {
    FileText,
    Download,
    Car,
    Fuel,
    Wrench,
    Route,
    Users,
    TrendingUp,
    BarChart3,
    PieChart,
    Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHeader } from '@/contexts/HeaderContext';
import { useEffect } from 'react';
import { SGFKPICard } from '@/components/sgf/SGFKPICard';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText as FileIcon, FileSpreadsheet as ExcelIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Report {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    category: 'fleet' | 'financial' | 'operational';
}

const reports: Report[] = [
    {
        id: 'fleet-summary',
        title: 'Resumo da Frota',
        description: 'Visão geral de todos os veículos, status e distribuição por secretaria.',
        icon: <Car className="h-6 w-6" />,
        category: 'fleet',
    },
    {
        id: 'fuel-consumption',
        title: 'Consumo de Combustível',
        description: 'Análise detalhada de consumo, gastos e eficiência por veículo.',
        icon: <Fuel className="h-6 w-6" />,
        category: 'financial',
    },
    {
        id: 'maintenance-history',
        title: 'Histórico de Manutenções',
        description: 'Registro completo de manutenções realizadas e custos.',
        icon: <Wrench className="h-6 w-6" />,
        category: 'operational',
    },
    {
        id: 'trip-analysis',
        title: 'Análise de Viagens',
        description: 'Estatísticas de viagens, quilometragem e utilização.',
        icon: <Route className="h-6 w-6" />,
        category: 'operational',
    },
    {
        id: 'driver-performance',
        title: 'Desempenho de Motoristas',
        description: 'Avaliação de motoristas, viagens realizadas e indicadores.',
        icon: <Users className="h-6 w-6" />,
        category: 'operational',
    },
    {
        id: 'cost-analysis',
        title: 'Análise de Custos',
        description: 'Relatório financeiro detalhado com projeções e comparativos.',
        icon: <TrendingUp className="h-6 w-6" />,
        category: 'financial',
    },
    {
        id: 'department-usage',
        title: 'Uso por Secretaria',
        description: 'Distribuição de recursos e gastos por secretaria.',
        icon: <PieChart className="h-6 w-6" />,
        category: 'fleet',
    },
    {
        id: 'efficiency-report',
        title: 'Relatório de Eficiência',
        description: 'KPIs de eficiência operacional e utilização da frota.',
        icon: <BarChart3 className="h-6 w-6" />,
        category: 'operational',
    },
];

const categoryLabels: Record<string, string> = {
    fleet: 'Frota',
    financial: 'Financeiro',
    operational: 'Operacional',
};

const categoryColors: Record<string, string> = {
    fleet: 'bg-[var(--sgf-primary)]/10 text-[var(--sgf-primary)]',
    financial: 'bg-green-100 text-green-700',
    operational: 'bg-blue-100 text-blue-700',
};

const periodOptions = [
    { value: 'week', label: 'Última semana' },
    { value: 'month', label: 'Último mês' },
    { value: 'quarter', label: 'Último trimestre' },
    { value: 'year', label: 'Último ano' },
    { value: 'custom', label: 'Período personalizado' },
];

const formatOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' },
];

export default function Reports() {
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [period, setPeriod] = useState('month');
    const [format, setFormat] = useState('pdf');
    const { setTitle, setSearchPlaceholder, setSearchHandler } = useHeader();
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setTitle('Relatórios');
        setSearchPlaceholder('Pesquisar relatórios...');
        setSearchHandler((term: string) => setSearchTerm(term));

        return () => {
            setSearchHandler(() => { });
        };
    }, [setTitle, setSearchPlaceholder, setSearchHandler]);

    const filteredReports = reports.filter((r) => {
        const matchesCategory = !categoryFilter || r.category === categoryFilter;
        const matchesSearch = !searchTerm ||
            r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleGenerate = async () => {
        setIsGenerating(true);
        // Simulate report generation
        setTimeout(() => {
            setIsGenerating(false);
            setSelectedReport(null);
        }, 2000);
    };

    return (
        <div className="space-y-8 pb-10">
            {/* KPIs Section */}
            <div className="grid gap-4 md:grid-cols-4">
                <SGFKPICard
                    title="Total Gerado"
                    value="1.284"
                    icon={FileText}
                    iconColor="text-emerald-500"
                    chartColor="#10b981"
                    chartData={[
                        { month: 'Set', value: 800 },
                        { month: 'Out', value: 950 },
                        { month: 'Nov', value: 1100 },
                        { month: 'Dez', value: 1284 },
                    ]}
                />
                <SGFKPICard
                    title="Este Mês"
                    value="42"
                    icon={TrendingUp}
                    iconColor="text-blue-500"
                    chartColor="#3b82f6"
                    chartData={[
                        { month: 'Sem 1', value: 5 },
                        { month: 'Sem 2', value: 12 },
                        { month: 'Sem 3', value: 15 },
                        { month: 'Sem 4', value: 10 },
                    ]}
                />
                <SGFKPICard
                    title="Templates Ativos"
                    value="8"
                    icon={BarChart3}
                    iconColor="text-purple-500"
                    chartColor="#a855f7"
                    chartData={[
                        { month: 'Q1', value: 4 },
                        { month: 'Q2', value: 6 },
                        { month: 'Q3', value: 8 },
                        { month: 'Q4', value: 8 },
                    ]}
                />
                <SGFKPICard
                    title="Economia Estimada"
                    value={formatCurrency(12450)}
                    icon={TrendingUp}
                    iconColor="text-emerald-600"
                    chartColor="#059669"
                    chartData={[
                        { month: 'Out', value: 8000 },
                        { month: 'Nov', value: 10500 },
                        { month: 'Dez', value: 12450 },
                    ]}
                />
            </div>

            {/* Category Filter - Segmented Control Feel */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex p-1 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm">
                    <button
                        className={cn(
                            "px-5 py-1.5 rounded-xl text-sm font-bold transition-all duration-300",
                            categoryFilter === '' ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" : "text-slate-400 hover:text-slate-600"
                        )}
                        onClick={() => setCategoryFilter('')}
                    >
                        Todos
                    </button>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                        <button
                            key={key}
                            className={cn(
                                "px-5 py-1.5 rounded-xl text-sm font-bold transition-all duration-300",
                                categoryFilter === key ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" : "text-slate-400 hover:text-slate-600"
                            )}
                            onClick={() => setCategoryFilter(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {searchTerm && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-right-4 duration-500">
                        <span className="text-[10px] uppercase font-black">Filtrando por:</span>
                        <span className="text-sm font-bold italic">"{searchTerm}"</span>
                        <button onClick={() => setSearchTerm('')} className="p-0.5 hover:bg-emerald-100 rounded-full transition-colors">
                            <Clock className="h-3 w-3 rotate-45" />
                        </button>
                    </div>
                )}
            </div>

            {/* Reports Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                    {filteredReports.map((report) => (
                        <motion.div
                            key={report.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <SGFCard
                                className="group relative overflow-hidden border border-slate-100 hover:border-slate-200"
                                onClick={() => setSelectedReport(report)}
                                padding="lg"
                                hover
                            >
                                {/* Subtle Background Pattern */}
                                <div className={cn(
                                    "absolute -right-6 -top-6 h-32 w-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                                    categoryColors[report.category].split(' ')[0]
                                )} />

                                <div className="space-y-4 relative z-10">
                                    <div className={cn("p-4 rounded-2xl w-fit shadow-lg shadow-current/5", categoryColors[report.category])}>
                                        {report.icon}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-black text-slate-800 tracking-tight lg:text-lg">{report.title}</h3>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">{report.description}</p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                            categoryColors[report.category].replace('bg-', 'bg-opacity-50 border-')
                                        )}>
                                            {categoryLabels[report.category]}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                            Gerar Agora
                                            <TrendingUp className="h-3 w-3" />
                                        </div>
                                    </div>
                                </div>
                            </SGFCard>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Recent Reports Table Refinement */}
            <SGFCard className="bg-slate-900 border-none shadow-2xl shadow-slate-900/20" padding="lg">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/10 rounded-xl text-white backdrop-blur-md border border-white/10">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-xl tracking-tight">Relatórios Recentes</h3>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Acesse os últimos arquivos gerados</p>
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <SGFButton variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 border border-white/5">
                            Ver Histórico Completo
                        </SGFButton>
                    </div>
                </div>

                <div className="space-y-3">
                    {[
                        { title: 'Consumo de Combustível - Janeiro 2026', date: 'Hoje às 14:32', type: 'pdf', user: 'Luan Machado' },
                        { title: 'Resumo da Frota - Dezembro 2025', date: '02/01/2026 às 09:15', type: 'excel', user: 'Admin Sistema' },
                    ].map((history, idx) => (
                        <div key={idx} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 transition-all duration-300 cursor-pointer">
                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                <div className={cn(
                                    "p-3 rounded-2xl flex items-center justify-center",
                                    history.type === 'pdf' ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                                )}>
                                    {history.type === 'pdf' ? <FileIcon className="h-6 w-6" /> : <ExcelIcon className="h-6 w-6" />}
                                </div>
                                <div>
                                    <p className="font-bold text-white tracking-tight">{history.title}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[10px] text-white/30 font-black uppercase tracking-tighter">{history.date}</p>
                                        <span className="h-1 w-1 rounded-full bg-white/10" />
                                        <p className="text-[10px] text-emerald-400/60 font-black uppercase tracking-tighter">Gerado por {history.user}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <SGFButton variant="ghost" size="sm" className="text-white hover:bg-white/20 border border-white/10 font-black text-[10px] uppercase">
                                    Visualizar
                                </SGFButton>
                                <SGFButton variant="primary" size="sm" className="font-black text-[10px] uppercase" icon={Download}>
                                    Baixar
                                </SGFButton>
                            </div>
                        </div>
                    ))}
                </div>
            </SGFCard>

            {/* Generate Report Modal */}
            <Modal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                title={`Gerar Relatório: ${selectedReport?.title}`}
                description={selectedReport?.description}
                size="md"
                footer={
                    <>
                        <SGFButton variant="ghost" onClick={() => setSelectedReport(null)}>
                            Cancelar
                        </SGFButton>
                        <SGFButton
                            variant="primary"
                            onClick={handleGenerate}
                            loading={isGenerating}
                            icon={Download}
                        >
                            Gerar Relatório
                        </SGFButton>
                    </>
                }
            >
                <div className="space-y-4">
                    <SGFSelect
                        label="Período"
                        value={period}
                        onChange={(val) => setPeriod(val)}
                        options={periodOptions}
                    />

                    {period === 'custom' && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <SGFInput label="Data Inicial" type="date" />
                            <SGFInput label="Data Final" type="date" />
                        </div>
                    )}

                    <SGFSelect
                        label="Formato de Exportação"
                        value={format}
                        onChange={(val) => setFormat(val)}
                        options={formatOptions}
                    />
                </div>
            </Modal>
        </div>
    );
}
