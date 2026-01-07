/**
 * Revenue Service
 * Handles all revenue-related API calls
 */

import { apiGet } from '@/app/utils/api';
import {
  RevenueMetrics,
  RevenueByStaffItem,
  RevenueByCategoryItem,
  RevenueTrendItem
} from '@/app/types/revenue';

interface RevenueMetricsParams {
  year?: number;
  startDate?: string; // Format: YYYY-MM-DD
  endDate?: string;   // Format: YYYY-MM-DD
}

/**
 * Fetch revenue metrics for a given year or date range
 */
export async function getRevenueMetrics(params: RevenueMetricsParams = {}) {
  const queryParams = new URLSearchParams();

  if (params.year) {
    queryParams.append('year', params.year.toString());
  }

  if (params.startDate) {
    queryParams.append('startDate', params.startDate);
  }

  if (params.endDate) {
    queryParams.append('endDate', params.endDate);
  }

  const endpoint = `/revenue/metrics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiGet<RevenueMetrics>(endpoint);
}

/**
 * Fetch revenue by staff member
 */
export async function getRevenueByStaff(year?: number) {
  const queryParams = year ? `?year=${year}` : '';
  return apiGet<RevenueByStaffItem[]>(`/revenue/by-staff${queryParams}`);
}

/**
 * Fetch revenue by service category
 */
export async function getRevenueByCategory(year?: number) {
  const queryParams = year ? `?year=${year}` : '';
  return apiGet<RevenueByCategoryItem[]>(`/revenue/by-category${queryParams}`);
}

/**
 * Fetch revenue trends (monthly data)
 */
export async function getRevenueTrends(year?: number) {
  const queryParams = year ? `?year=${year}` : '';
  return apiGet<RevenueTrendItem[]>(`/revenue/trends${queryParams}`);
}
