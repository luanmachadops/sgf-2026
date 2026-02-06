import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Map,
    Car,
    Users,
    Activity,
    Fuel,
    Wrench,
    FileText,
    Settings,
    ShieldCheck,
    X,
    LogOut,
    User,
    Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// --- Configuration ---
const menuSections = [
    {
        title: 'INTELIGÊNCIA',
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
            { icon: Map, label: 'Centro de Comando', path: '/mapa', badge: '3' },
            { icon: Activity, label: 'Telemetria Real', path: '/telemetria-placeholder' },
        ]
    },
    {
        title: 'GESTÃO DE ATIVOS',
        items: [
            { icon: Car, label: 'Frota Municipal', path: '/veiculos' },
            { icon: Users, label: 'Motoristas', path: '/motoristas' },
            { icon: Fuel, label: 'Abastecimentos', path: '/abastecimentos' },
            { icon: Wrench, label: 'Manutenções', path: '/manutencoes' },
            { icon: FileText, label: 'Relatórios & Auditoria', path: '/relatorios' },
        ]
    }
];

// --- Internal Components ---

interface SidebarContentProps {
    isCollapsed: boolean;
    onToggle: () => void;
    showToggle: boolean; // Whether to show the hamburger button
}

function SidebarContent({ isCollapsed, onToggle, showToggle }: SidebarContentProps) {
    const location = useLocation();
    const { user, logout } = useAuth();

    return (
        <div
            className={cn(
                "flex flex-col h-full rounded-r-[32px] transition-all duration-300",
                isCollapsed ? "w-[80px] items-center" : "w-[280px]",
            )}
            style={{ backgroundColor: '#0F2B2F' }}
        >
            {/* Logo Section */}
            <div className={cn(
                "flex flex-col shrink-0 transition-all relative",
                isCollapsed ? "h-[140px] pt-4 pb-2 items-center justify-start gap-6" : "h-32 justify-center px-8"
            )}>
                {/* Hamburger Toggle - Visually first in collapsed mode */}
                {showToggle && isCollapsed && (
                    <button
                        onClick={onToggle}
                        className="text-white/40 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                )}

                <div className="flex items-center gap-4">
                    <div className={cn(
                        "flex items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20 shrink-0",
                        isCollapsed ? "h-10 w-10" : "h-14 w-14"
                    )}>
                        <ShieldCheck className={cn("text-white", isCollapsed ? "h-6 w-6" : "h-8 w-8")} />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black text-white tracking-tight leading-none">SGF 2026</h1>
                            <span className="text-[10px] font-bold text-emerald-400 mt-1 uppercase tracking-[0.2em]">Gestão Pública</span>
                        </div>
                    )}
                </div>

                {/* Close Button for Expanded Overlay Mode */}
                {showToggle && !isCollapsed && (
                    <button
                        onClick={onToggle}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-2"
                    >
                        <X className="h-6 w-6" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className={cn("flex-1 overflow-y-auto pb-6 custom-scrollbar", isCollapsed ? "px-2" : "px-6")}>
                {menuSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-8 last:mb-0">
                        {!isCollapsed && (
                            <h3 className="mb-4 px-4 text-[11px] font-bold uppercase tracking-widest text-white/30 text-emerald-500/80">
                                {section.title}
                            </h3>
                        )}
                        {isCollapsed && (
                            <div className="mb-2 w-8 h-[1px] bg-white/10 mx-auto" />
                        )}
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = item.path === '/'
                                    ? location.pathname === '/'
                                    : location.pathname.startsWith(item.path);

                                if (item.path === '/telemetria-placeholder') {
                                    return (
                                        <div
                                            key={item.label}
                                            title={isCollapsed ? item.label : undefined}
                                            className={cn(
                                                "group flex items-center rounded-full py-3.5 text-sm font-bold text-white/50 hover:text-white transition-all cursor-not-allowed opacity-60",
                                                isCollapsed ? "justify-center px-0" : "justify-between px-5"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="h-5 w-5" />
                                                {!isCollapsed && <span>{item.label}</span>}
                                            </div>
                                        </div>
                                    )
                                }

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        title={isCollapsed ? item.label : undefined}
                                        className={({ isActive }) =>
                                            cn(
                                                'group flex items-center rounded-full py-3.5 text-sm font-bold transition-all',
                                                isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "justify-between px-5",
                                                isActive
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                                            )
                                        }
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", item.path === '/' && location.pathname === '/' ? "scale-110" : "")} />
                                            {!isCollapsed && <span>{item.label}</span>}
                                        </div>
                                        {!isCollapsed && item.badge && (
                                            <span className={cn(
                                                "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                                                isActive ? "bg-white text-emerald-600" : "bg-white/20 text-white"
                                            )}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Profile Section */}
            <div className={cn("shrink-0", isCollapsed ? "p-2" : "p-6")}>
                <div className={cn("rounded-3xl bg-white/5 border border-white/5 flex items-center gap-4 transition-all", isCollapsed ? "p-1 justify-center flex-col gap-2" : "p-4")}>
                    <div className={cn("shrink-0 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5", isCollapsed ? "h-10 w-10" : "h-12 w-12")}>
                        <div className="w-full h-full rounded-[14px] bg-white/10 flex items-center justify-center overflow-hidden">
                            {user?.photoUrl ? (
                                <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="h-6 w-6 text-emerald-400" />
                            )}
                        </div>
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.name?.split(' ')[0] || 'Usuário'}</p>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider truncate">{user?.role || 'Visitante'}</p>
                        </div>
                    )}

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button
                                title="Sair"
                                className={cn("rounded-xl text-white/30 hover:bg-rose-500/20 hover:text-rose-400 transition-colors", isCollapsed ? "p-2" : "p-2")}
                            >
                                <LogOut className={cn(isCollapsed ? "h-4 w-4" : "h-5 w-5")} />
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#0F2B2F] border-white/10 text-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Deseja realmente sair?</AlertDialogTitle>
                                <AlertDialogDescription className="text-white/60">
                                    Você voltará para a tela de login.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white border-0 transition-colors">Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={logout}
                                    className="bg-rose-500 text-white hover:bg-rose-600 border-0 transition-colors"
                                >
                                    Sair
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}

// --- Main Sidebar Component ---

interface SidebarProps {
    variant: 'desktop' | 'compact' | 'mobile';
    isOpen: boolean; // For overlay mode
    onToggle: () => void;
}

export default function Sidebar({ variant, isOpen, onToggle }: SidebarProps) {
    // Backdrop for Overlay modes (Mobile or Compact-Expanded)
    const showBackdrop = isOpen && (variant === 'mobile' || variant === 'compact');

    return (
        <>
            {/* Backdrop */}
            {showBackdrop && (
                <div
                    className="fixed inset-0 z-40 bg-black/50"
                    onClick={onToggle}
                />
            )}

            {/* Desktop Mode: Relative, Full Width, Always Visible */}
            {variant === 'desktop' && (
                <aside className="relative h-full z-30">
                    <SidebarContent isCollapsed={false} onToggle={() => { }} showToggle={false} />
                </aside>
            )}

            {/* Compact Mode: Relative, Mini Width, Always Visible (Background) */}
            {variant === 'compact' && (
                <aside className="relative h-full z-30 hidden lg:flex">
                    <SidebarContent isCollapsed={true} onToggle={onToggle} showToggle={true} />
                </aside>
            )}

            {/* Overlay Drawer: Fixed, Full Width, Visible on Toggle (Mobile & Compact-Open) */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-50 h-full transform transition-transform duration-300',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                    // Only render this overlay aside if we are in mobile OR compact mode
                    // But to support animation, we usually render it and translate it.
                    // However, we don't want it to conflict with Desktop.
                    variant === 'desktop' ? 'hidden' : 'block'
                )}
            >
                <SidebarContent
                    isCollapsed={false} // Always full width in overlay
                    onToggle={onToggle}
                    showToggle={true} // Show toggle to close
                />
            </aside>
        </>
    );
}
