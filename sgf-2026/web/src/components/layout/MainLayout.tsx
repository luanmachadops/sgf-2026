import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { HeaderProvider, useHeader } from '@/contexts/HeaderContext';

export default function MainLayout() {
    return (
        <HeaderProvider>
            <LayoutWithHeader />
        </HeaderProvider>
    );
}

function LayoutWithHeader() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [variant, setVariant] = useState<'desktop' | 'compact' | 'mobile'>('desktop');
    const { title, description } = useHeader();

    // Determine Layout Variant on resize
    React.useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 1024) {
                setVariant('mobile');
            } else if (width < 1350) {
                setVariant('compact');
            } else {
                setVariant('desktop');
            }
        };

        handleResize(); // Check on mount
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setIsMobileOpen(!isMobileOpen);

    return (
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'hsl(181, 46%, 18%)' }}>
            <Sidebar
                variant={variant}
                isOpen={isMobileOpen}
                onToggle={toggleSidebar}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header onMenuClick={toggleSidebar} />

                {/* Main Content Area - Single Container */}
                <div className="flex-1 flex flex-col overflow-hidden mt-4 ml-6 rounded-tl-[32px] bg-[#E3E9E7] shadow-2xl relative">
                    <main className="flex-1 overflow-y-auto p-8 scroll-smooth custom-scrollbar">
                        <div className="w-full">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
