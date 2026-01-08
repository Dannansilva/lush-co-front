/**
 * Revenue Types
 * Types for revenue-related API responses (Updated for new consolidated endpoints)
 */

// ==================== MONTHLY REVENUE TYPES ====================

export interface RevenuePeriod {
  month: string;
  monthNumber: number;
  year: number;
  startDate: string;
  endDate: string;
}

export interface RevenueSummary {
  totalRevenue: number;
  totalAppointments: number;
  uniqueCustomers: number;
}

export interface RevenueByStaffItem {
  staffId: number;
  staffName: string;
  totalRevenue: number;
  appointmentCount: number;
}

export interface RevenueByCategoryItem {
  category: string;
  totalRevenue: number;
  serviceCount: number;
}

export interface DailyRevenueItem {
  date: string;
  revenue: number;
  appointmentCount: number;
}

export interface AppointmentDetails {
  id: number;
  appointmentDate: string;
  clientName: string;
  staffName: string;
  services: string[];
  totalPrice: number;
  status: string;
}

export interface MonthlyRevenueData {
  period: RevenuePeriod;
  summary: RevenueSummary;
  revenueByStaff: RevenueByStaffItem[];
  revenueByCategory: RevenueByCategoryItem[];
  dailyBreakdown: DailyRevenueItem[];
  appointments: AppointmentDetails[];
}

export interface MonthlyRevenueResponse {
  success: boolean;
  data: MonthlyRevenueData;
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
