import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _supabaseAdmin: SupabaseClient | null = null;
let _supabase: SupabaseClient | null = null;

function getSupabaseUrl(): string {
    const url = process.env.SUPABASE_URL;
    if (!url) {
        throw new Error('SUPABASE_URL is not defined in environment variables');
    }
    return url;
}

function getSupabaseServiceRoleKey(): string {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables');
    }
    return key;
}

function getSupabaseAnonKey(): string | undefined {
    return process.env.SUPABASE_ANON_KEY;
}

// Admin client with service role (bypasses RLS)
export function getSupabaseAdmin(): SupabaseClient {
    if (!_supabaseAdmin) {
        _supabaseAdmin = createClient(
            getSupabaseUrl(),
            getSupabaseServiceRoleKey(),
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );
    }
    return _supabaseAdmin;
}

// Client with anon key (respects RLS)
export function getSupabase(): SupabaseClient {
    if (!_supabase) {
        _supabase = createClient(
            getSupabaseUrl(),
            getSupabaseAnonKey() || getSupabaseServiceRoleKey(),
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: false,
                },
            }
        );
    }
    return _supabase;
}

// Backward compatibility exports
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get: (_, prop) => {
        return (getSupabaseAdmin() as any)[prop];
    }
});

export const supabase = new Proxy({} as SupabaseClient, {
    get: (_, prop) => {
        return (getSupabase() as any)[prop];
    }
});

// Helper to get client with user token
export function getSupabaseClient(accessToken?: string): SupabaseClient {
    if (!accessToken) {
        return getSupabase();
    }

    return createClient(getSupabaseUrl(), getSupabaseAnonKey() || getSupabaseServiceRoleKey(), {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
