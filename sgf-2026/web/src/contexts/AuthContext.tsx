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
const AUTH_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, fallbackMessage: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => {
            window.setTimeout(() => reject(new Error(fallbackMessage)), AUTH_TIMEOUT_MS);
        }),
    ]);
}

function loadCachedAuth() {
    try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        return {
            user: storedUser ? JSON.parse(storedUser) as User : null,
            token: storedToken,
        };
    } catch (error) {
        console.warn('Failed to restore cached auth state:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return { user: null, token: null };
    }
}

function persistAuthState(nextUser: User | null, nextToken: string | null) {
    if (nextUser && nextToken) {
        localStorage.setItem('token', nextToken);
        localStorage.setItem('user', JSON.stringify(nextUser));
        return;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

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
    const cachedAuth = loadCachedAuth();
    const [user, setUser] = useState<User | null>(cachedAuth.user);
    const [token, setToken] = useState<string | null>(cachedAuth.token);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const applySession = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
            if (!isMounted) return;

            if (!session) {
                setUser(null);
                setToken(null);
                persistAuthState(null, null);
                return;
            }

            setToken(session.access_token);

            const userData = await withTimeout(
                fetchUserProfile(session.user),
                'Timed out while loading user profile'
            );

            if (!isMounted) return;

            setUser(userData);
            persistAuthState(userData, session.access_token);
        };

        const initAuth = async () => {
            try {
                const {
                    data: { session },
                } = await withTimeout(
                    supabase.auth.getSession(),
                    'Timed out while restoring auth session'
                );

                await applySession(session);
            } catch (error) {
                console.error('Error checking auth session:', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                try {
                    await applySession(session);
                } catch (error) {
                    console.error(`Auth state change failed during ${event}:`, error);
                    if (isMounted && !cachedAuth.user) {
                        setUser(null);
                        setToken(null);
                        persistAuthState(null, null);
                    }
                } finally {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                }
            }
        );

        return () => {
            isMounted = false;
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
                persistAuthState(userData, data.session.access_token);
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
        persistAuthState(null, null);
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
