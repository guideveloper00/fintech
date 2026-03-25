import { api } from '../lib/api';
import type { DashboardData, DashboardQueryParams } from '../shared/types';

export const dashboardService = {
  async getSummary(params?: DashboardQueryParams): Promise<DashboardData> {
    const res = await api.get<{ data: DashboardData }>('/dashboard', { params });
    return res.data.data;
  },
};
