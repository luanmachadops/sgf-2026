import axios, { type InternalAxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add token to headers
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

// Auth endpoints
export const authApi = {
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/user/login', { email, password });
        return response.data;
    },

    me: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },
};

// Dashboard endpoints
export const dashboardApi = {
    getKPIs: async () => {
        const response = await api.get('/dashboard/kpis');
        return response.data;
    },

    getExpenseChart: async (months: number = 6) => {
        const response = await api.get(`/dashboard/expenses?months=${months}`);
        return response.data;
    },

    getDepartmentDistribution: async () => {
        const response = await api.get('/dashboard/departments');
        return response.data;
    },

    getRecentActivity: async (limit: number = 10) => {
        const response = await api.get(`/dashboard/activity?limit=${limit}`);
        return response.data;
    },

    getAlerts: async () => {
        const response = await api.get('/dashboard/alerts');
        return response.data;
    },
};

// Vehicles endpoints
export const vehiclesApi = {
    getAll: async (params?: any) => {
        const response = await api.get('/vehicles', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/vehicles/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/vehicles', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.put(`/vehicles/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/vehicles/${id}`);
        return response.data;
    },

    getHistory: async (id: string) => {
        const response = await api.get(`/vehicles/${id}/history`);
        return response.data;
    },

    updatePhoto: async (id: string, photoUrl: string) => {
        const response = await api.patch(`/vehicles/${id}/photo`, { photoUrl });
        return response.data;
    },
};

// Drivers endpoints
export const driversApi = {
    getAll: async (params?: any) => {
        const response = await api.get('/drivers', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/drivers/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/drivers', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.put(`/drivers/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/drivers/${id}`);
        return response.data;
    },

    updatePhoto: async (id: string, photoUrl: string) => {
        const response = await api.patch(`/drivers/${id}/photo`, { photoUrl });
        return response.data;
    },
};

// Trips endpoints
export const tripsApi = {
    getAll: async (params?: any) => {
        const response = await api.get('/trips', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/trips/${id}`);
        return response.data;
    },

    getRoute: async (id: string) => {
        const response = await api.get(`/trips/${id}/route`);
        return response.data;
    },
};

// Refuelings endpoints
export const refuelingsApi = {
    getAll: async (params?: any) => {
        const response = await api.get('/refuelings', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/refuelings/${id}`);
        return response.data;
    },

    validate: async (id: string, approved: boolean, notes?: string) => {
        const response = await api.put(`/refuelings/${id}/validate`, { approved, notes });
        return response.data;
    },

    getAnomalies: async () => {
        const response = await api.get('/refuelings/anomalies');
        return response.data;
    },
};

// Maintenances endpoints
export const maintenancesApi = {
    getAll: async (params?: any) => {
        const response = await api.get('/maintenances', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/maintenances/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/maintenances', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.put(`/maintenances/${id}`, data);
        return response.data;
    },

    approve: async (id: string, notes?: string) => {
        const response = await api.put(`/maintenances/${id}/approve`, { notes });
        return response.data;
    },

    reject: async (id: string, reason: string) => {
        const response = await api.put(`/maintenances/${id}/reject`, { reason });
        return response.data;
    },
};

// Map endpoints
export const mapApi = {
    getLiveVehicles: async () => {
        const response = await api.get('/map/live');
        return response.data;
    },
};

export default api;
