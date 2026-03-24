import { createClient } from '@supabase/supabase-js';

function getEnv(name: 'SUPABASE_URL' | 'SUPABASE_SERVICE_ROLE_KEY') {
    const value = process.env[name];

    if (!value) {
        throw new Error(`${name} is not configured`);
    }

    return value;
}

export function getSupabaseAdmin() {
    return createClient(getEnv('SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'), {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
