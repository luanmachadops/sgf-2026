import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session on mount
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    setToken(session.access_token);
                    const userData: User = {
                        id: session.user.id,
                        email: session.user.email || '',
                        name: session.user.user_metadata?.name || 'Usuário',
                        role: session.user.user_metadata?.role || 'USER',
                        createdAt: new Date().toISOString(),
                    };
                    setUser(userData);
                    localStorage.setItem('token', session.access_token);
                    localStorage.setItem('user', JSON.stringify(userData));
                }
            } catch (error) {
                console.error('Error checking auth session:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session) {
                    setToken(session.access_token);
                    const userData: User = {
                        id: session.user.id,
                        email: session.user.email || '',
                        name: session.user.user_metadata?.name || 'Usuário',
                        role: session.user.user_metadata?.role || 'USER',
                        createdAt: new Date().toISOString(),
                    };
                    setUser(userData);
                    localStorage.setItem('token', session.access_token);
                    localStorage.setItem('user', JSON.stringify(userData));
                } else {
                    setUser(null);
                    setToken(null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
        );

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw new Error(error.message);
            }

            if (data.session) {
                setToken(data.session.access_token);
                const userData: User = {
                    id: data.user.id,
                    email: data.user.email || '',
                    name: data.user.user_metadata?.name || 'Usuário',
                    role: data.user.user_metadata?.role || 'USER',
                    createdAt: new Date().toISOString(),
                };
                setUser(userData);
                localStorage.setItem('token', data.session.access_token);
                localStorage.setItem('user', JSON.stringify(userData));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
