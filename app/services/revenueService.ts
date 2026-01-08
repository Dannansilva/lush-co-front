/**
 * Revenue Service
 * Handles all revenue-related API calls (Updated for new consolidated endpoints)
 */

import { apiGet } from '@/app/utils/api';
import {
  MonthlyRevenueData,
  RevenueTrendItem
} from '@/app/types/revenue';

/**
 * Filter options for monthly revenue
 * - 'current': Current month (default)
 * - 'last': Last month
 * - Custom: Specify month (1-12) and year
 */
export type RevenueFilter = 'current' | 'last';

export interface MonthlyRevenueParams {
  filter?: RevenueFilter;
  month?: number; // 1-12
  year?: number;
}

/**
 * Fetch comprehensive monthly revenue data
 * Returns EVERYTHING in one call:
 * - Summary metrics
 * - Revenue by staff
 * - Revenue by category
 * - Daily breakdown
 * - All appointments
 *
 * @param params - Filter options
 * @returns Complete monthly revenue data wrapped in API response
 */
export async function getMonthlyRevenue(params: MonthlyRevenueParams = {}) {
  const queryParams = new URLSearchParams();

  if (params.filter) {
    queryParams.append('filter', params.filter);
  }

  if (params.month !== undefined) {
    queryParams.append('month', params.month.toString());
  }

  if (params.year !== undefined) {
    queryParams.append('year', params.year.toString());
  }

  const endpoint = `/revenue/monthly${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  // Backend returns: { success, data: MonthlyRevenueData, message? }
  return apiGet<MonthlyRevenueData>(endpoint);
}

/**
 * Fetch revenue trends - all 12 months of the year
 * Use for annual reports and year-over-year comparisons
 *
 * @param year - Year to get trends for (optional, defaults to current year)
 * @returns All 12 months with revenue and appointment counts
 */
export async function getRevenueTrends(year?: number) {
  const queryParams = year ? `?year=${year}` : '';
  // Backend returns: { success, year, data: RevenueTrendItem[], message? }
  // So we need to type it as the trend items array for the apiGet generic
  return apiGet<{ year: number; data: RevenueTrendItem[] }>(`/revenue/trends${queryParams}`);
}
