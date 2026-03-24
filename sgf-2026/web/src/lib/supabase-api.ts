/**
 * Supabase Direct API Layer
 * Replaces the old Axios-based api.ts with direct Supabase queries.
 * All queries go through PostgREST and respect RLS policies.
 */

import { supabase } from './supabase';
import type { Enums, Tables, TablesInsert, TablesUpdate } from '@/types/database.types';

export type DriverRecord = Tables<'drivers'> & {
    departments?: { id: string; name: string } | null;
};

// ========================================
// ERROR HANDLING
// ========================================

class SupabaseApiError extends Error {
    readonly code?: string;
    readonly details?: string;
    constructor(
        message: string,
        code?: string,
        details?: string
    ) {
        super(message);
        this.name = 'SupabaseApiError';
        this.code = code;
        this.details = details;
    }
}

function handleError(error: { message: string; code?: string; details?: string }): never {
    throw new SupabaseApiError(error.message, error.code, error.details);
}

// ========================================
// VEHICLES
// ========================================

export const vehiclesApi = {
    getAll: async (filters?: {
        departmentId?: string;
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<Tables<'vehicles'>[]> => {
        let query = supabase
            .from('vehicles')
            .select('*, departments(id, name)')
            .order('created_at', { ascending: false });

        if (filters?.departmentId) {
            query = query.eq('department_id', filters.departmentId);
        }
        if (filters?.status) {
            query = query.eq('status', filters.status as Enums<'vehicle_status'>);
        }
        if (filters?.search) {
            query = query.or(
                `plate.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`
            );
        }
        if (filters?.page !== undefined && filters?.limit) {
            const from = filters.page * filters.limit;
            const to = from + filters.limit - 1;
            query = query.range(from, to);
        }

        const { data, error } = await query;
        if (error) handleError(error);
        return data as Tables<'vehicles'>[];
    },

    getById: async (id: string): Promise<Tables<'vehicles'>> => {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*, departments(id, name)')
            .eq('id', id)
            .single();
        if (error) handleError(error);
        return data as Tables<'vehicles'>;
    },

    create: async (vehicle: TablesInsert<'vehicles'>): Promise<Tables<'vehicles'>> => {
        const { data, error } = await supabase
            .from('vehicles')
            .insert(vehicle)
            .select()
            .single();
        if (error) handleError(error);
        return data;
    },

    update: async (id: string, updates: TablesUpdate<'vehicles'>): Promise<Tables<'vehicles'>> => {
        const { data, error } = await supabase
            .from('vehicles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) handleError(error);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('vehicles')
            .delete()
            .eq('id', id);
        if (error) handleError(error);
    },

    updatePhoto: async (id: string, photoUrl: string): Promise<Tables<'vehicles'>> => {
        const { data, error } = await supabase
            .from('vehicles')
            .update({ photo_url: photoUrl })
            .eq('id', id)
            .select()
            .single();
        if (error) handleError(error);
        return data;
    },
};

// ========================================
// DRIVERS
// ========================================

export const driversApi = {
    getAll: async (filters?: {
        departmentId?: string;
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<DriverRecord[]> => {
        let query = supabase
            .from('drivers')
            .select('*, departments(id, name)')
            .order('name', { ascending: true });

        if (filters?.departmentId) {
            query = query.eq('department_id', filters.departmentId);
        }
        if (filters?.status) {
            query = query.eq('status', filters.status as Enums<'driver_status'>);
        }
        if (filters?.search) {
            query = query.or(
                `name.ilike.%${filters.search}%,cpf.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
            );
        }
        if (filters?.page !== undefined && filters?.limit) {
            const from = filters.page * filters.limit;
            const to = from + filters.limit - 1;
            query = query.range(from, to);
        }

        const { data, error } = await query;
        if (error) handleError(error);
        return (data ?? []) as DriverRecord[];
    },

    getById: async (id: string): Promise<DriverRecord> => {
        const { data, error } = await supabase
            .from('drivers')
            .select('*, departments(id, name)')
            .eq('id', id)
            .single();
        if (error) handleError(error);
        return data as DriverRecord;
    },

    create: async (driver: TablesInsert<'drivers'>): Promise<Tables<'drivers'>> => {
        const { data, error } = await supabase
            .from('drivers')
            .insert(driver)
            .select()
            .single();
        if (error) handleError(error);
        return data;
    },

    update: async (id: string, updates: TablesUpdate<'drivers'>): Promise<Tables<'drivers'>> => {
        const { data, error } = await supabase
            .from('drivers')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) handleError(error);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('drivers')
            .delete()
            .eq('id', id);
        if (error) handleError(error);
    },
};

// ========================================
// TRIPS
// ========================================

export const tripsApi = {
    getAll: async (filters?: {
        vehicleId?: string;
        driverId?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        hasAnomaly?: boolean;
        page?: number;
        limit?: number;
    }): Promise<Tables<'trips'>[]> => {
        let query = supabase
            .from('trips')
            .select('*, vehicles(id, plate, brand, model), drivers(id, name)')
            .order('start_time', { ascending: false });

        if (filters?.vehicleId) query = query.eq('vehicle_id', filters.vehicleId);
        if (filters?.driverId) query = query.eq('driver_id', filters.driverId);
        if (filters?.status) query = query.eq('status', filters.status as Enums<'trip_status'>);
        if (filters?.startDate) query = query.gte('start_time', filters.startDate);
        if (filters?.endDate) query = query.lte('start_time', filters.endDate);
        if (filters?.hasAnomaly !== undefined) query = query.eq('has_anomaly', filters.hasAnomaly);
        if (filters?.page !== undefined && filters?.limit) {
            const from = filters.page * filters.limit;
            const to = from + filters.limit - 1;
            query = query.range(from, to);
        }

        const { data, error } = await query;
        if (error) handleError(error);
        return data as Tables<'trips'>[];
    },

    getById: async (id: string): Promise<Tables<'trips'>> => {
        const { data, error } = await supabase
            .from('trips')
            .select('*, vehicles(id, plate, brand, model), drivers(id, name)')
            .eq('id', id)
            .single();
        if (error) handleError(error);
        return data as Tables<'trips'>;
    },
};

// ========================================
// REFUELINGS
// ========================================

export const refuelingsApi = {
    getAll: async (filters?: {
        vehicleId?: string;
        driverId?: string;
        startDate?: string;
        endDate?: string;
        hasAnomaly?: boolean;
        page?: number;
        limit?: number;
    }): Promise<Tables<'refuelings'>[]> => {
        let query = supabase
            .from('refuelings')
            .select('*, vehicles(id, plate, brand, model), drivers(id, name)')
            .order('date', { ascending: false });

        if (filters?.vehicleId) query = query.eq('vehicle_id', filters.vehicleId);
        if (filters?.driverId) query = query.eq('driver_id', filters.driverId);
        if (filters?.startDate) query = query.gte('date', filters.startDate);
        if (filters?.endDate) query = query.lte('date', filters.endDate);
        if (filters?.hasAnomaly !== undefined) query = query.eq('has_anomaly', filters.hasAnomaly);
        if (filters?.page !== undefined && filters?.limit) {
            const from = filters.page * filters.limit;
            const to = from + filters.limit - 1;
            query = query.range(from, to);
        }

        const { data, error } = await query;
        if (error) handleError(error);
        return data as Tables<'refuelings'>[];
    },

    getById: async (id: string): Promise<Tables<'refuelings'>> => {
        const { data, error } = await supabase
            .from('refuelings')
            .select('*, vehicles(id, plate, brand, model), drivers(id, name)')
            .eq('id', id)
            .single();
        if (error) handleError(error);
        return data as Tables<'refuelings'>;
    },

    validate: async (id: string, approved: boolean, validatedBy: string, notes?: string) => {
        const { data, error } = await supabase
            .from('refuelings')
            .update({
                validated_at: approved ? new Date().toISOString() : null,
                validated_by: approved ? validatedBy : null,
                has_anomaly: !approved,
                anomaly_type: !approved ? (notes || 'Rejeitado pelo gestor') : null,
            })
            .eq('id', id)
            .select()
            .single();
        if (error) handleError(error);
        return data;
    },

    getAnomalies: async (): Promise<Tables<'refuelings'>[]> => {
        const { data, error } = await supabase
            .from('refuelings')
            .select('*, vehicles(id, plate, brand, model), drivers(id, name)')
            .eq('has_anomaly', true)
            .order('date', { ascending: false });
        if (error) handleError(error);
        return data as Tables<'refuelings'>[];
    },
};

// ========================================
// MAINTENANCES
// ========================================

export const maintenancesApi = {
    getAll: async (filters?: {
        vehicleId?: string;
        status?: string;
        type?: string;
        page?: number;
        limit?: number;
    }): Promise<Tables<'maintenances'>[]> => {
        let query = supabase
            .from('maintenances')
            .select('*, vehicles(id, plate, brand, model), requested_by_driver:drivers!maintenances_requested_by_fkey(id, name)')
            .order('created_at', { ascending: false });

        if (filters?.vehicleId) query = query.eq('vehicle_id', filters.vehicleId);
        if (filters?.status) query = query.eq('status', filters.status as Enums<'maintenance_status'>);
        if (filters?.type) query = query.eq('type', filters.type as Enums<'maintenance_type'>);
        if (filters?.page !== undefined && filters?.limit) {
            const from = filters.page * filters.limit;
            const to = from + filters.limit - 1;
            query = query.range(from, to);
        }

        const { data, error } = await query;
        if (error) handleError(error);
        return data as Tables<'maintenances'>[];
    },

    getById: async (id: string): Promise<Tables<'maintenances'>> => {
        const { data, error } = await supabase
            .from('maintenances')
            .select('*, vehicles(id, plate, brand, model), requested_by_driver:drivers!maintenances_requested_by_fkey(id, name)')
            .eq('id', id)
            .single();
        if (error) handleError(error);
        return data as Tables<'maintenances'>;
    },

    create: async (maintenance: TablesInsert<'maintenances'>): Promise<Tables<'maintenances'>> => {
        const { data, error } = await supabase
            .from('maintenances')
            .insert(maintenance)
            .select()
            .single();
        if (error) handleError(error);
        return data;
    },

    update: async (id: string, updates: TablesUpdate<'maintenances'>): Promise<Tables<'maintenances'>> => {
        const { data, error } = await supabase
            .from('maintenances')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) handleError(error);
        return data;
    },

    approve: async (id: string, approvedBy: string, notes?: string) => {
        const { data, error } = await supabase
            .from('maintenances')
            .update({
                status: 'APPROVED',
                approved_by: approvedBy,
                approved_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();
        if (error) handleError(error);
        return data;
    },

    reject: async (id: string, reason: string) => {
        const { data, error } = await supabase
            .from('maintenances')
            .update({
                status: 'REJECTED',
            })
            .eq('id', id)
            .select()
            .single();
        if (error) handleError(error);
        return data;
    },
};

// ========================================
// CHECKLISTS
// ========================================

export const checklistsApi = {
    getAll: async (filters?: {
        vehicleId?: string;
        driverId?: string;
        type?: string;
        page?: number;
        limit?: number;
    }): Promise<Tables<'checklists'>[]> => {
        let query = supabase
            .from('checklists')
            .select('*, vehicles(id, plate), drivers(id, name)')
            .order('completed_at', { ascending: false });

        if (filters?.vehicleId) query = query.eq('vehicle_id', filters.vehicleId);
        if (filters?.driverId) query = query.eq('driver_id', filters.driverId);
        if (filters?.type) query = query.eq('type', filters.type as Enums<'checklist_type'>);
        if (filters?.page !== undefined && filters?.limit) {
            const from = filters.page * filters.limit;
            const to = from + filters.limit - 1;
            query = query.range(from, to);
        }

        const { data, error } = await query;
        if (error) handleError(error);
        return data as Tables<'checklists'>[];
    },
};

// ========================================
// DEPARTMENTS
// ========================================

export const departmentsApi = {
    getAll: async (): Promise<Tables<'departments'>[]> => {
        const { data, error } = await supabase
            .from('departments')
            .select('*')
            .order('name', { ascending: true });
        if (error) handleError(error);
        return data;
    },

    create: async (dept: TablesInsert<'departments'>): Promise<Tables<'departments'>> => {
        const { data, error } = await supabase
            .from('departments')
            .insert(dept)
            .select()
            .single();
        if (error) handleError(error);
        return data;
    },

    update: async (id: string, updates: TablesUpdate<'departments'>): Promise<Tables<'departments'>> => {
        const { data, error } = await supabase
            .from('departments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) handleError(error);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('departments')
            .delete()
            .eq('id', id);
        if (error) handleError(error);
    },
};

// ========================================
// DASHBOARD (Supabase Aggregations)
// ========================================

export const dashboardApi = {
    getKPIs: async () => {
        // Get current month boundaries
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        // Parallel queries for KPIs
        const [
            vehiclesResult,
            driversResult,
            tripsResult,
            refuelingsResult,
            maintenancesResult,
        ] = await Promise.all([
            // Vehicles count by status
            supabase.from('vehicles').select('id, status'),
            // Active drivers
            supabase.from('drivers').select('id, status, cnh_expiry_date, score'),
            // Trips this month
            supabase.from('trips').select('id, actual_distance_km, start_time, end_time, status')
                .gte('start_time', monthStart).lte('start_time', monthEnd),
            // Refuelings this month
            supabase.from('refuelings').select('id, liters, total_cost, km_per_liter, has_anomaly')
                .gte('date', monthStart).lte('date', monthEnd),
            // Pending maintenances
            supabase.from('maintenances').select('id, status, created_at, updated_at'),
        ]);

        const vehicles = vehiclesResult.data || [];
        const drivers = driversResult.data || [];
        const trips = tripsResult.data || [];
        const refuelings = refuelingsResult.data || [];
        const maintenances = maintenancesResult.data || [];

        // Calculate driver CNH expiring within 30 days
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const cnhExpiringSoon = drivers.filter(d =>
            d.cnh_expiry_date && new Date(d.cnh_expiry_date) <= thirtyDaysFromNow
        ).length;

        // Calculate average score
        const activeDrivers = drivers.filter(d => d.status === 'ACTIVE');
        const avgScore = activeDrivers.length > 0
            ? activeDrivers.reduce((sum, d) => sum + (d.score || 0), 0) / activeDrivers.length
            : 0;

        // Calculate fuel stats
        const totalLiters = refuelings.reduce((sum, r) => sum + r.liters, 0);
        const totalCost = refuelings.reduce((sum, r) => sum + r.total_cost, 0);
        const validKmPerLiter = refuelings.filter(r => r.km_per_liter && r.km_per_liter > 0);
        const avgKmPerLiter = validKmPerLiter.length > 0
            ? validKmPerLiter.reduce((sum, r) => sum + (r.km_per_liter || 0), 0) / validKmPerLiter.length
            : 0;
        const anomalyCount = refuelings.filter(r => r.has_anomaly).length;

        // Calculate trip stats
        const completedTrips = trips.filter(t => t.status === 'COMPLETED');
        const totalKm = completedTrips.reduce((sum, t) => sum + (t.actual_distance_km || 0), 0);
        const daysInMonth = now.getDate();
        const avgTripsPerDay = daysInMonth > 0 ? completedTrips.length / daysInMonth : 0;

        // Calculate avg trip duration in hours
        const tripsWithDuration = completedTrips.filter(t => t.start_time && t.end_time);
        const avgDuration = tripsWithDuration.length > 0
            ? tripsWithDuration.reduce((sum, t) => {
                const diff = new Date(t.end_time!).getTime() - new Date(t.start_time).getTime();
                return sum + diff / (1000 * 60 * 60); // hours
            }, 0) / tripsWithDuration.length
            : 0;

        // Maintenance stats
        const pendingMaint = maintenances.filter(m => m.status === 'PENDING').length;
        const inProgressMaint = maintenances.filter(m => m.status === 'IN_PROGRESS').length;

        return {
            fleet: {
                totalVehicles: vehicles.length,
                activeNow: vehicles.filter(v => v.status === 'IN_USE').length,
                inMaintenance: vehicles.filter(v => v.status === 'MAINTENANCE').length,
                idle7Days: vehicles.filter(v => v.status === 'AVAILABLE').length,
                availabilityRate: vehicles.length > 0
                    ? ((vehicles.filter(v => v.status === 'AVAILABLE' || v.status === 'IN_USE').length) / vehicles.length) * 100
                    : 0,
            },
            fuel: {
                totalLitersMonth: totalLiters,
                totalCostMonth: totalCost,
                avgKmPerLiter: Number(avgKmPerLiter.toFixed(2)),
                anomalyCount,
            },
            trips: {
                totalTripsMonth: trips.length,
                totalKmMonth: Number(totalKm.toFixed(1)),
                avgTripsPerDay: Number(avgTripsPerDay.toFixed(1)),
                avgTripDuration: Number(avgDuration.toFixed(1)),
            },
            maintenance: {
                pendingRequests: pendingMaint,
                inProgress: inProgressMaint,
                avgResolutionDays: 0, // Would need completed maintenance dates
                preventiveCompliance: 0, // Would need scheduled maintenance data
            },
            drivers: {
                totalActive: activeDrivers.length,
                cnhExpiringSoon,
                avgScore: Number(avgScore.toFixed(2)),
            },
        };
    },

    getExpenseChart: async (months: number = 6) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const [refuelingsResult, maintenancesResult] = await Promise.all([
            supabase.from('refuelings').select('total_cost, date')
                .gte('date', startDate.toISOString())
                .lte('date', endDate.toISOString()),
            supabase.from('maintenances').select('actual_cost, created_at')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString()),
        ]);

        const refuelings = refuelingsResult.data || [];
        const maintenances = maintenancesResult.data || [];

        // Group by month
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const chartData: Array<{ month: string; fuel: number; maintenance: number; total: number }> = [];

        for (let i = 0; i < months; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (months - 1 - i));
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`;

            const fuelCost = refuelings
                .filter(r => r.date && r.date.startsWith(monthKey))
                .reduce((sum, r) => sum + r.total_cost, 0);

            const maintCost = maintenances
                .filter(m => m.created_at && m.created_at.startsWith(monthKey))
                .reduce((sum, m) => sum + (m.actual_cost || 0), 0);

            chartData.push({
                month: label,
                fuel: Number(fuelCost.toFixed(2)),
                maintenance: Number(maintCost.toFixed(2)),
                total: Number((fuelCost + maintCost).toFixed(2)),
            });
        }

        return chartData;
    },

    getDepartmentDistribution: async () => {
        const { data: departments, error: deptError } = await supabase
            .from('departments')
            .select('id, name');
        if (deptError) handleError(deptError);

        const { data: vehicles, error: vehError } = await supabase
            .from('vehicles')
            .select('department_id');
        if (vehError) handleError(vehError);

        const colors = ['#00A86B', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

        return (departments || []).map((dept, i) => ({
            name: dept.name,
            value: (vehicles || []).filter(v => v.department_id === dept.id).length,
            color: colors[i % colors.length],
        }));
    },
};

// ========================================
// USER PROFILE
// ========================================

export const userProfileApi = {
    getProfile: async (): Promise<Tables<'users'> | null> => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return null;

        const { data, error } = await supabase
            .from('users')
            .select('*, departments(id, name)')
            .eq('user_id', authUser.id)
            .single();

        if (error) {
            // User might not have a profile row yet
            if (error.code === 'PGRST116') return null;
            handleError(error);
        }
        return data as Tables<'users'>;
    },
};

// ========================================
// EDGE FUNCTIONS
// ========================================

export interface RefuelingValidationInput {
    vehicle_id: string;
    driver_id: string;
    odometer: number;
    liters: number;
    total_cost: number;
    fuel_type: string;
    supplier_name: string;
}

export interface RefuelingValidationResult {
    is_valid: boolean;
    anomalies: string[];
    risk_score: number;
    km_per_liter: number | null;
}

export interface TripAnomaly {
    trip_id: string;
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
}

export interface TripAnomalyResult {
    summary: {
        totalTripsAnalyzed: number;
        totalAnomalies: number;
        tripsWithAnomalies: number;
        bySeverity: { HIGH: number; MEDIUM: number; LOW: number };
        byType: Record<string, number>;
    };
    anomalies: TripAnomaly[];
}

export const edgeFunctionsApi = {
    /**
     * Fetches dashboard KPIs computed server-side with service_role access.
     * Supports department-scoped data for MANAGER role.
     */
    getDashboardKPIs: async () => {
        const { data, error } = await supabase.functions.invoke('dashboard-kpis', {
            method: 'POST',
        });
        if (error) throw new SupabaseApiError(error.message || 'Edge function error');
        return data;
    },

    /**
     * Validates a refueling entry against anti-fraud rules.
     * Returns a risk score (0-100) and list of detected anomalies.
     */
    validateRefueling: async (input: RefuelingValidationInput): Promise<RefuelingValidationResult> => {
        const { data, error } = await supabase.functions.invoke('validate-refueling', {
            body: input,
        });
        if (error) throw new SupabaseApiError(error.message || 'Edge function error');
        return data as RefuelingValidationResult;
    },

    /**
     * Scans trips for anomalies (odometer regression, overlapping trips, etc.)
     * and auto-flags problematic trips in the database.
     */
    detectTripAnomalies: async (filters?: {
        days?: number;
        vehicle_id?: string;
        driver_id?: string;
    }): Promise<TripAnomalyResult> => {
        const { data, error } = await supabase.functions.invoke('detect-trip-anomalies', {
            body: filters || {},
        });
        if (error) throw new SupabaseApiError(error.message || 'Edge function error');
        return data as TripAnomalyResult;
    },
};
