import { useQuery } from '@tanstack/react-query';
import type { DashboardQueryParams } from '../types';
import { dashboardService } from '@/services/dashboard.service';

export const DASHBOARD_QUERY_KEY = ['dashboard'] as const;

export function useDashboard(params?: DashboardQueryParams) {
  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, params] as const,
    queryFn: () => dashboardService.getSummary(params),
    staleTime: 1000 * 60 * 2, // 2 min
  });
}
