import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { refuelingsApi } from '@/lib/supabase-api';
import type { RefuelingFilters } from '@/types';

export function useRefuelings(filters?: RefuelingFilters) {
    return useQuery({
        queryKey: ['refuelings', filters],
        queryFn: () => refuelingsApi.getAll(filters ? {
            vehicleId: filters.vehicleId,
            driverId: filters.driverId,
            startDate: filters.startDate,
            endDate: filters.endDate,
            hasAnomaly: filters.hasAnomaly,
            page: filters.page,
            limit: filters.limit,
        } : undefined),
    });
}

export function useRefueling(id: string) {
    return useQuery({
        queryKey: ['refueling', id],
        queryFn: () => refuelingsApi.getById(id),
        enabled: !!id,
    });
}

export function useRefuelingAnomalies() {
    return useQuery({
        queryKey: ['refuelings', 'anomalies'],
        queryFn: () => refuelingsApi.getAnomalies(),
    });
}

export function useValidateRefueling() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, approved, validatedBy, notes }: {
            id: string;
            approved: boolean;
            validatedBy: string;
            notes?: string;
        }) => refuelingsApi.validate(id, approved, validatedBy, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['refuelings'] });
        },
    });
}
