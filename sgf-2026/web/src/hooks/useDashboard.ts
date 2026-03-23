import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/supabase-api';

export function useDashboardKPIs() {
    return useQuery({
        queryKey: ['dashboard', 'kpis'],
        queryFn: () => dashboardApi.getKPIs(),
        refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
        staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
    });
}

export function useExpenseChart(months: number = 6) {
    return useQuery({
        queryKey: ['dashboard', 'expenses', months],
        queryFn: () => dashboardApi.getExpenseChart(months),
        staleTime: 5 * 60 * 1000,
    });
}

export function useDepartmentDistribution() {
    return useQuery({
        queryKey: ['dashboard', 'departments'],
        queryFn: () => dashboardApi.getDepartmentDistribution(),
        staleTime: 5 * 60 * 1000,
    });
}
