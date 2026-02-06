import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '@/lib/api';
import type { Vehicle, VehicleFilters } from '@/types';

export function useVehicles(filters?: VehicleFilters) {
    return useQuery({
        queryKey: ['vehicles', filters],
        queryFn: () => vehiclesApi.getAll(filters),
    });
}

export function useVehicle(id: string) {
    return useQuery({
        queryKey: ['vehicle', id],
        queryFn: () => vehiclesApi.getById(id),
        enabled: !!id,
    });
}

export function useVehicleHistory(id: string) {
    return useQuery({
        queryKey: ['vehicle', id, 'history'],
        queryFn: () => vehiclesApi.getHistory(id),
        enabled: !!id,
    });
}

export function useCreateVehicle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<Vehicle>) => vehiclesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        },
    });
}

export function useUpdateVehicle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Vehicle> }) =>
            vehiclesApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
        },
    });
}

export function useDeleteVehicle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => vehiclesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        },
    });
}
