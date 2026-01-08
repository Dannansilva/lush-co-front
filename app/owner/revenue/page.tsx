"use client";

import React, { useState, useEffect } from "react";
import { useScreenSize, getResponsiveValues } from "@/app/hooks/useScreenSize";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import UserProfile from "@/app/components/UserProfile";
import {
  getMonthlyRevenue,
  getRevenueTrends
} from "@/app/services/revenueService";
import {
  MonthlyRevenueData,
  RevenueTrendItem
} from "@/app/types/revenue";

export default function RevenuePage() {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  // Round values to avoid hydration mismatch from floating point precision
  const cardPadding = Math.round(Math.max(12, Math.min(width * 0.015, 20)));
  const spacing = Math.round(Math.max(12, Math.min(width * 0.02, 16)));

  const isMobile = width < 768;

  // Get current year and month
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  // State management
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenueData | null>(null);
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrendItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Generate year options (current year and 4 years back)
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Month options
  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Fetch all revenue data
  useEffect(() => {
    const fetchAllRevenueData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch monthly revenue for selected month/year and trends in parallel
        const [monthlyResult, trendsResult] = await Promise.all([
          getMonthlyRevenue({ month: selectedMonth, year: selectedYear }),
          getRevenueTrends(selectedYear)
        ]);

        // Handle monthly revenue data
        if (monthlyResult.success && monthlyResult.data) {
          setMonthlyData(monthlyResult.data);
        } else if (monthlyResult.success && !monthlyResult.data) {
          // 204 No Content - No data for current period
          setError('No revenue data available for the selected period. Try selecting a different month/year or add appointments first.');
        } else {
          // Actual error
          const errorMsg = monthlyResult.message || 'Failed to fetch monthly revenue data';
          setError(`Error: ${errorMsg}`);
        }

        // Handle revenue trends
        if (trendsResult.success) {
          // Handle both possible structures
          // 1. Wrapped: { success, data: { year, data: [...] } }
          // 2. Root level: { success, year, data: [...] }
          const wrappedData = trendsResult.data as { year?: number; data?: RevenueTrendItem[] } | undefined;
          const trendsData = wrappedData?.data || (trendsResult as { data?: RevenueTrendItem[] }).data;

          if (trendsData && Array.isArray(trendsData)) {
            setRevenueTrends(trendsData);
          }
        }
      } catch (err) {
        setError('An error occurred while fetching revenue data');
        console.error('Revenue data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllRevenueData();
  }, [selectedYear, selectedMonth]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format number with commas
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-LK').format(value);
  };

  // Extract data from monthly data
  const summary = monthlyData?.summary;
  const avgTransaction = summary && summary.totalAppointments > 0
    ? summary.totalRevenue / summary.totalAppointments
    : 0;

  const stats = [
    {
      label: "Total Revenue",
      value: summary ? formatCurrency(summary.totalRevenue) : "LKR 0",
      change: monthlyData ? `${monthlyData.period.month} ${monthlyData.period.year}` : `Year ${selectedYear}`,
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "yellow"
    },
    {
      label: "Total Appointments",
      value: summary ? formatNumber(summary.totalAppointments) : "0",
      change: monthlyData ? `${monthlyData.period.month} ${monthlyData.period.year}` : `Year ${selectedYear}`,
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      color: "yellow"
    },
    {
      label: "Avg Transaction",
      value: formatCurrency(avgTransaction),
      change: monthlyData ? `${monthlyData.period.month} ${monthlyData.period.year}` : `Year ${selectedYear}`,
      icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
      color: "yellow"
    },
    {
      label: "Unique Customers",
      value: summary ? formatNumber(summary.uniqueCustomers) : "0",
      change: monthlyData ? `${monthlyData.period.month} ${monthlyData.period.year}` : `Year ${selectedYear}`,
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      color: "yellow"
    }
  ];

  // Color palette for categories
  const categoryColors = ['#f59e0b', '#d97706', '#92400e', '#78350f', '#451a03', '#fbbf24', '#eab308'];

  // Process category revenue with colors
  const categoryRevenue = monthlyData?.revenueByCategory || [];
  const categoryRevenueWithColors = categoryRevenue.map((cat, index) => ({
    ...cat,
    color: categoryColors[index % categoryColors.length]
  }));

  // Calculate max revenue for staff chart
  const staffRevenue = monthlyData?.revenueByStaff || [];
  const maxStaffRevenue = staffRevenue.length > 0
    ? Math.max(...staffRevenue.map(s => s.totalRevenue))
    : 1;

  return (
    <>
      {/* Header */}
      <div
        className="border-b border-zinc-800 flex items-center justify-between flex-shrink-0"
        style={{ padding: `${spacing}px ${cardPadding}px` }}
      >
        <div>
          <h1 className="font-bold" style={{ fontSize: `${responsive.fontSize.heading}px` }}>Revenue Reports</h1>
          <p className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>Financial overview and detailed analytics</p>
        </div>

        {/* User Profile */}
        <UserProfile showSearch={true} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div style={{ padding: `${spacing}px ${cardPadding}px` }}>
          {/* Error/Info Message */}
          {error && (
            <div
              className={`rounded-lg flex items-center gap-3 ${
                error.startsWith('No revenue data')
                  ? 'bg-blue-900/20 border border-blue-800 text-blue-400'
                  : 'bg-red-900/20 border border-red-800 text-red-400'
              }`}
              style={{ padding: `${spacing}px ${cardPadding}px`, marginBottom: `${spacing}px` }}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {error.startsWith('No revenue data') ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span style={{ fontSize: `${responsive.fontSize.body}px` }}>{error}</span>
            </div>
          )}

          {/* Month/Year Selector and Export */}
          <div className="flex items-center justify-between" style={{ marginBottom: `${spacing}px` }}>
            <div className="flex items-center gap-3">
              {/* Month Selector */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-zinc-900 border border-zinc-800 rounded-lg text-white"
                style={{ padding: `${spacing / 2}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>

              {/* Year Selector */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-zinc-900 border border-zinc-800 rounded-lg text-white"
                style={{ padding: `${spacing / 2}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg transition-colors flex items-center gap-2"
              style={{ padding: `${spacing}px ${cardPadding * 1.5}px`, fontSize: `${responsive.fontSize.body}px` }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Report
            </button>
          </div>

          {/* Stats Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : width < 1280 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: `${spacing}px`,
              marginBottom: `${spacing * 2}px`,
              position: 'relative'
            }}
          >
            {/* Loading Overlay */}
            {isLoading && (
              <div
                className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-10"
                style={{ backdropFilter: 'blur(4px)' }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                    Loading revenue data...
                  </span>
                </div>
              </div>
            )}

            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-zinc-900 rounded-xl border border-zinc-800"
                style={{ padding: `${cardPadding * 1.5}px` }}
              >
                <div className="flex items-start justify-between" style={{ marginBottom: `${spacing}px` }}>
                  <div className="flex-1">
                    <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px`, marginBottom: `${spacing / 2}px` }}>
                      {stat.label}
                    </div>
                    <div className="font-bold" style={{ fontSize: `${responsive.fontSize.heading}px` }}>{stat.value}</div>
                    <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                      {stat.change}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Trends Chart */}
          <div
            className="bg-zinc-900 rounded-xl border border-zinc-800"
            style={{ padding: `${cardPadding * 1.5}px`, marginBottom: `${spacing * 2}px` }}
          >
            <h3 className="font-bold" style={{ fontSize: `${responsive.fontSize.subheading}px`, marginBottom: `${spacing}px` }}>
              Monthly Revenue Trends - {selectedYear}
            </h3>
            {revenueTrends && revenueTrends.length > 0 ? (
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="month"
                    stroke="#71717a"
                    style={{ fontSize: `${responsive.fontSize.small}px` }}
                  />
                  <YAxis
                    stroke="#71717a"
                    style={{ fontSize: `${responsive.fontSize.small}px` }}
                    tickFormatter={(value) => `LKR ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => `LKR ${value.toLocaleString()}`}
                  />
                  <Legend
                    wrapperStyle={{
                      color: '#a1a1aa',
                      fontSize: `${responsive.fontSize.small}px`
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#facc15"
                    strokeWidth={3}
                    dot={{ fill: '#facc15', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <div className="flex items-center justify-center text-zinc-400" style={{ height: '300px', fontSize: `${responsive.fontSize.body}px` }}>
                No revenue trend data available
              </div>
            )}
          </div>

          {/* Bottom Charts */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: `${spacing}px`
            }}
          >
            {/* Revenue by Service Category */}
            <div
              className="bg-zinc-900 rounded-xl border border-zinc-800"
              style={{ padding: `${cardPadding * 1.5}px` }}
            >
              <h3 className="font-bold" style={{ fontSize: `${responsive.fontSize.subheading}px`, marginBottom: `${spacing}px` }}>
                Revenue by Service Category
              </h3>

              <div className="flex items-center gap-8">
                {/* Pie Chart Placeholder */}
                <div className="relative" style={{ width: '160px', height: '160px' }}>
                  <div className="absolute inset-0 rounded-full border-8 border-zinc-800"></div>
                  <div className="absolute inset-0 rounded-full border-8 border-yellow-400" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)' }}></div>
                  <div className="absolute inset-0 rounded-full border-8 border-yellow-600" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)' }}></div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2">
                  {categoryRevenueWithColors.length > 0 ? (
                    categoryRevenueWithColors.map((item) => (
                      <div key={item.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span style={{ fontSize: `${responsive.fontSize.small}px` }}>{item.category}</span>
                        </div>
                        <span className="font-semibold" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                          {formatCurrency(item.totalRevenue)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-zinc-400 text-center py-4" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                      No category data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Revenue by Staff Member */}
            <div
              className="bg-zinc-900 rounded-xl border border-zinc-800"
              style={{ padding: `${cardPadding * 1.5}px` }}
            >
              <h3 className="font-bold" style={{ fontSize: `${responsive.fontSize.subheading}px`, marginBottom: `${spacing}px` }}>
                Revenue by Staff Member
              </h3>

              <div className="space-y-3">
                {staffRevenue.length > 0 ? (
                  staffRevenue.map((staff) => (
                    <div key={staff.staffName}>
                      <div className="flex items-center justify-between text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px`, marginBottom: `${spacing / 3}px` }}>
                        <span>{staff.staffName}</span>
                        <span className="font-semibold">{formatCurrency(staff.totalRevenue)}</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all"
                          style={{ width: `${(staff.totalRevenue / maxStaffRevenue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-zinc-400 text-center py-4" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                    No staff revenue data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
