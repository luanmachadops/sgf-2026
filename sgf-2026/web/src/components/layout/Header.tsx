import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHeader } from '@/contexts/HeaderContext';
import { cn } from '@/lib/utils';
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

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { user, logout } = useAuth();
    const { title, description, headerAction } = useHeader();

    return (
        <header className="sticky top-0 z-30 flex min-h-[5rem] items-center justify-between px-[var(--sgf-space-6)] md:px-[var(--sgf-space-8)] pt-[var(--sgf-space-6)] pb-[var(--sgf-space-2)] bg-[#E3E9E7]/80 backdrop-blur-md border-b-0 max-w-[1400px] mx-auto w-full">
            <div className="flex items-center gap-[var(--sgf-space-4)]">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onMenuClick}
                    className="rounded-[var(--sgf-radius-base)] p-[var(--sgf-space-2)] -ml-[var(--sgf-space-2)] text-slate-500 hover:bg-black/5 lg:hidden transition-colors shrink-0"
                >
                    <Menu className="h-6 w-6" />
                </button>

                {/* Page Title */}
                <div className="flex flex-col">
                    <h1 className="text-[var(--sgf-text-3xl)] md:text-[var(--sgf-text-4xl)] font-[var(--sgf-font-black)] text-slate-800 tracking-tight leading-none">{title}</h1>
                    {description && (
                        <p className="text-[var(--sgf-text-sm)] text-slate-500 mt-[var(--sgf-space-1)]">{description}</p>
                    )}
                </div>
            </div>

            {/* Right side Actions & Avatar */}
            <div className="flex items-center gap-[var(--sgf-space-4)] shrink-0">
                {headerAction && (
                    <div className="mr-0 md:mr-[var(--sgf-space-4)]">
                        {headerAction}
                    </div>
                )}
                
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button className="flex items-center gap-[var(--sgf-space-3)] p-1 pr-3 rounded-full hover:bg-black/5 transition-colors border border-transparent hover:border-black/5">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden border-2 border-emerald-500/20 shadow-sm shrink-0">
                                {user?.photoUrl ? (
                                    <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <User className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                )}
                            </div>
                            <div className="hidden md:flex flex-col items-start min-w-[100px] text-left">
                                <span className="text-[var(--sgf-text-sm)] font-bold text-slate-700 truncate w-full">{user?.name?.split(' ')[0] || 'Gestor'}</span>
                                <span className="text-[var(--sgf-text-2xs)] text-slate-500 uppercase font-bold tracking-wider truncate w-full">{user?.role || 'Admin'}</span>
                            </div>
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border-slate-200">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-slate-800">Deseja realmente sair?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-600">
                                Você voltará para a tela de login do SGF.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={logout} className="bg-rose-500 text-white hover:bg-rose-600 border-0 gap-2">
                                <LogOut className="h-4 w-4" />
                                Sair
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </header>
    );
}
