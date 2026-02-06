import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driversApi } from '@/lib/api';
import type { Driver, DriverFilters } from '@/types';

export function useDrivers(filters?: DriverFilters) {
    return useQuery({
        queryKey: ['drivers', filters],
        queryFn: () => driversApi.getAll(filters),
    });
}

export function useDriver(id: string) {
    return useQuery({
        queryKey: ['driver', id],
        queryFn: () => driversApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateDriver() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<Driver>) => driversApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
        },
    });
}

export function useUpdateDriver() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Driver> }) =>
            driversApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
            queryClient.invalidateQueries({ queryKey: ['driver', id] });
        },
    });
}

export function useDeleteDriver() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => driversApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
        },
    });
}
