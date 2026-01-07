/**
 * Revenue Metrics Types
 * Types for revenue-related API responses
 */

export interface RevenueMetrics {
  totalRevenue: number;
  totalAppointments: number;
  avgTransaction: number;
  totalCustomers: number;
}

export interface RevenueMetricsResponse {
  success: boolean;
  data: RevenueMetrics;
}

export interface RevenueByCategoryItem {
  category: string;
  totalRevenue: number;
  serviceCount: number;
}

export interface RevenueByStaffItem {
  staffName: string;
  totalRevenue: number;
  appointmentCount: number;
}

export interface RevenueTrendItem {
  month: string;
  revenue: number;
  expenses: number;
  appointmentCount: number;
}
