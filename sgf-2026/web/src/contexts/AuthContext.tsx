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

/**
 * Fetches the user profile from the `users` table.
 * Falls back to auth metadata if no profile row exists.
 */
async function fetchUserProfile(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Promise<User> {
    const { data: profile, error } = await supabase
        .from('users')
        .select('*, departments(id, name)')
        .eq('user_id', authUser.id)
        .single();

    if (profile && !error) {
        const dept = (profile as unknown as { departments?: { id: string; name: string } }).departments;
        return {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role as User['role'],
            departmentId: profile.department_id || undefined,
            departmentName: dept?.name,
            createdAt: profile.created_at || new Date().toISOString(),
        };
    }

    // Fallback: use auth metadata (new user without profile row)
    return {
        id: authUser.id,
        email: authUser.email || '',
        name: (authUser.user_metadata?.name as string) || 'Usuário',
        role: (authUser.user_metadata?.role as User['role']) || 'VIEWER',
        createdAt: new Date().toISOString(),
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    setToken(session.access_token);
                    const userData = await fetchUserProfile(session.user);
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
                    const userData = await fetchUserProfile(session.user);
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
                const userData = await fetchUserProfile(data.user);
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
