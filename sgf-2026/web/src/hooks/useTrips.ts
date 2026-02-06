import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '@/lib/api';
import type { TripFilters } from '@/types';

export function useTrips(filters?: TripFilters) {
    return useQuery({
        queryKey: ['trips', filters],
        queryFn: () => tripsApi.getAll(filters),
    });
}

export function useTrip(id: string) {
    return useQuery({
        queryKey: ['trip', id],
        queryFn: () => tripsApi.getById(id),
        enabled: !!id,
    });
}

export function useTripRoute(id: string) {
    return useQuery({
        queryKey: ['trip', id, 'route'],
        queryFn: () => tripsApi.getRoute(id),
        enabled: !!id,
    });
}
