/**
 * Revenue Types
 * Types for revenue-related API responses (Updated to match actual API structure)
 */

// ==================== MONTHLY REVENUE TYPES ====================

export interface RevenueByStaffItem {
  staffId: string;
  staffName: string;
  staffPhoneNumber?: string;
  totalRevenue: number;
  appointmentCount: number;
}

export interface MonthlyRevenueData {
  month: number;
  monthName: string;
  year: number;
  totalRevenue: number;
  totalAppointments: number;
  avgTransaction: number;
  revenueByStaff: RevenueByStaffItem[];
}

export interface MonthlyRevenueResponse {
  success: boolean;
  data: MonthlyRevenueData | null;
  message?: string;
}

// ==================== REVENUE TRENDS TYPES ====================

export interface RevenueTrendItem {
  month: string;
  monthNumber: number;
  revenue: number;
  appointmentCount: number;
}

export interface RevenueTrendsData {
  year: number;
  data: RevenueTrendItem[];
}

export interface RevenueTrendsResponse {
  success: boolean;
  year: number;
  data: RevenueTrendItem[];
  message?: string;
}
