import React, { useState } from 'react';
import {
    Menu,
    Bell,
    User,
    LogOut,
    Search,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHeader } from '@/contexts/HeaderContext';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { user, logout } = useAuth();

    const { searchPlaceholder, handleSearch, title, description, headerAction } = useHeader();

    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-8" style={{ backgroundColor: 'hsl(181, 46%, 18%)' }}>
            <div className="flex items-center gap-8 flex-1">
                {/* Left side: Menu (Mobile Only) */}
                <button
                    onClick={onMenuClick}
                    className="rounded-xl p-2.5 text-white/50 hover:bg-white/10 hover:text-white lg:hidden transition-all shrink-0"
                >
                    <Menu className="h-6 w-6" />
                </button>

                {/* Page Title - Mobile & Desktop */}
                {/* Page Title and Description - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
                    <h1 className="text-2xl font-black text-white tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-xs text-white/70 mt-1 font-medium">{description}</p>
                    )}
                </div>



                {/* Search Bar - Moved to Left */}
                <div className="w-full max-w-md hidden md:flex items-center">
                    <div className="relative group flex-1"> {/* Added flex-1 here for centering */}
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="block w-full pl-11 pr-4 py-2.5 bg-white/5 border-transparent rounded-2xl text-sm font-medium text-white placeholder:text-white/20 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all border border-white/5"
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-4 shrink-0">
                {headerAction && (
                    <div className="mr-2">
                        {headerAction}
                    </div>
                )}
                <div className="h-10 w-px bg-white/5 hidden md:block" />

                <button className="p-2.5 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-all relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0F2B2F]"></span>
                </button>
            </div>
        </header>
    );
}
