import type { Tables } from '@/types/database.types';

function resolveApiUrl(): string {
    const configuredUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

    if (configuredUrl) {
        const isLocalApi = /localhost:3000\/api$/.test(configuredUrl);
        const isLocalHost = typeof window !== 'undefined'
            && ['localhost', '127.0.0.1'].includes(window.location.hostname);

        if (!isLocalApi || isLocalHost) {
            return configuredUrl;
        }
    }

    if (typeof window !== 'undefined') {
        return `${window.location.origin}/api`;
    }

    return configuredUrl || '/api';
}

class BackendApiError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'BackendApiError';
        this.status = status;
    }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
    const apiUrl = resolveApiUrl();

    const response = await fetch(`${apiUrl}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        },
    });

    if (!response.ok) {
        let message = 'Erro ao processar a requisição';

        try {
            const data = await response.json();
            const apiMessage = Array.isArray(data.message)
                ? data.message.join(', ')
                : data.message;
            message = apiMessage || data.error || message;
        } catch {
            // Ignore body parsing errors and use fallback message.
        }

        throw new BackendApiError(message, response.status);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

export interface CreateDriverRequest {
    cpf: string;
    name: string;
    registrationNumber: string;
    cnhNumber: string;
    cnhCategory: string;
    cnhExpiryDate: string;
    departmentId?: string;
    phone?: string;
    email?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    password: string;
}

export interface DriverAccessRequest {
    password: string;
}

export type DriverWithDepartment = Tables<'drivers'> & {
    department?: { id: string; name: string } | null;
    departments?: { id: string; name: string } | null;
};

export const driverAccessApi = {
    create: async (payload: CreateDriverRequest): Promise<DriverWithDepartment> =>
        request<DriverWithDepartment>('/drivers', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    provisionAccess: async (driverId: string, payload: DriverAccessRequest): Promise<DriverWithDepartment> =>
        request<DriverWithDepartment>(`/drivers/${driverId}/provision-access`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    resetPassword: async (driverId: string, payload: DriverAccessRequest): Promise<{ success: true }> =>
        request<{ success: true }>(`/drivers/${driverId}/reset-password`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
};

export { BackendApiError };
