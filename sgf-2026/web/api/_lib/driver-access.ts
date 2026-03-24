import { getSupabaseAdmin } from './supabase-admin.js';

type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface CreateDriverPayload {
    cpf: string;
    name: string;
    registrationNumber: string;
    cnhNumber: string;
    cnhCategory: string;
    cnhExpiryDate: string;
    departmentId?: string;
    phone?: string;
    email?: string;
    status?: DriverStatus;
    password: string;
}

export interface DriverAccessPayload {
    password: string;
}

function normalizeCpf(cpf: string) {
    return cpf.replace(/\D/g, '');
}

function buildDriverAuthEmail(cpf: string) {
    return `driver-${cpf}@internal.sgf2026.local`;
}

function assertPassword(password: unknown) {
    if (typeof password !== 'string' || password.length < 6 || password.length > 20) {
        throw new Error('Senha deve ter entre 6 e 20 caracteres');
    }
}

function assertCreatePayload(payload: Partial<CreateDriverPayload>) {
    const requiredFields = [
        'cpf',
        'name',
        'registrationNumber',
        'cnhNumber',
        'cnhCategory',
        'cnhExpiryDate',
        'password',
    ] as const;

    for (const field of requiredFields) {
        if (!payload[field]) {
            throw new Error(`Campo obrigatório ausente: ${field}`);
        }
    }

    const normalizedCpf = normalizeCpf(payload.cpf!);
    if (normalizedCpf.length !== 11) {
        throw new Error('CPF inválido');
    }

    assertPassword(payload.password);
}

export async function createDriver(payload: CreateDriverPayload) {
    assertCreatePayload(payload);

    const supabaseAdmin = getSupabaseAdmin();
    const normalizedCpf = normalizeCpf(payload.cpf);

    const { data: existingDriver, error: existingError } = await supabaseAdmin
        .from('drivers')
        .select('id')
        .eq('cpf', normalizedCpf)
        .maybeSingle();

    if (existingError) {
        throw new Error(`Falha ao validar CPF: ${existingError.message}`);
    }

    if (existingDriver) {
        throw new Error('Já existe um motorista com este CPF');
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: buildDriverAuthEmail(normalizedCpf),
        password: payload.password,
        email_confirm: true,
        user_metadata: {
            cpf: normalizedCpf,
            name: payload.name,
            type: 'driver',
        },
    });

    if (authError || !authData.user) {
        throw new Error(authError?.message || 'Não foi possível criar o acesso do motorista');
    }

    const { data: driver, error: driverError } = await supabaseAdmin
        .from('drivers')
        .insert({
            cpf: normalizedCpf,
            name: payload.name,
            registration_number: payload.registrationNumber,
            cnh_number: payload.cnhNumber,
            cnh_category: payload.cnhCategory,
            cnh_expiry_date: payload.cnhExpiryDate,
            department_id: payload.departmentId || null,
            phone: payload.phone?.trim() || null,
            email: payload.email?.trim().toLowerCase() || null,
            status: payload.status || 'ACTIVE',
            user_id: authData.user.id,
            password_hash: null,
        })
        .select('*, departments(id, name)')
        .single();

    if (driverError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw new Error(driverError.message);
    }

    return driver;
}

export async function provisionDriverAccess(driverId: string, payload: DriverAccessPayload) {
    assertPassword(payload.password);

    const supabaseAdmin = getSupabaseAdmin();
    const { data: driver, error: driverError } = await supabaseAdmin
        .from('drivers')
        .select('id, cpf, name, user_id')
        .eq('id', driverId)
        .single();

    if (driverError || !driver) {
        throw new Error('Motorista não encontrado');
    }

    if (driver.user_id) {
        throw new Error('Motorista já possui acesso configurado');
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: buildDriverAuthEmail(driver.cpf),
        password: payload.password,
        email_confirm: true,
        user_metadata: {
            cpf: driver.cpf,
            name: driver.name,
            type: 'driver',
        },
    });

    if (authError || !authData.user) {
        throw new Error(authError?.message || 'Não foi possível provisionar o acesso');
    }

    const { data: updatedDriver, error: updateError } = await supabaseAdmin
        .from('drivers')
        .update({ user_id: authData.user.id })
        .eq('id', driverId)
        .select('*, departments(id, name)')
        .single();

    if (updateError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw new Error(updateError.message);
    }

    return updatedDriver;
}

export async function resetDriverPassword(driverId: string, payload: DriverAccessPayload) {
    assertPassword(payload.password);

    const supabaseAdmin = getSupabaseAdmin();
    const { data: driver, error: driverError } = await supabaseAdmin
        .from('drivers')
        .select('user_id')
        .eq('id', driverId)
        .single();

    if (driverError || !driver) {
        throw new Error('Motorista não encontrado');
    }

    if (!driver.user_id) {
        throw new Error('Motorista ainda não possui acesso configurado');
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(driver.user_id, {
        password: payload.password,
    });

    if (error) {
        throw new Error(error.message);
    }

    return { success: true };
}
