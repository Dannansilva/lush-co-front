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
import { pdf } from '@react-pdf/renderer';
import { RevenuePDF } from "@/app/components/revenue/RevenuePDF";

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
  const [filterMode, setFilterMode] = useState<'current' | 'last' | 'custom'>('current');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isFilterOpen && !target.closest('.filter-dropdown-container')) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  // Fetch all revenue data
  useEffect(() => {
    const fetchAllRevenueData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Determine parameters based on filter mode
        const monthlyParams = filterMode === 'custom'
          ? { month: selectedMonth, year: selectedYear }
          : { filter: filterMode };

        // Fetch monthly revenue and trends in parallel
        const [monthlyResult, trendsResult] = await Promise.all([
          getMonthlyRevenue(monthlyParams),
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
  }, [selectedYear, selectedMonth, filterMode]);

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
  const stats = [
    {
      label: "Total Revenue",
      value: monthlyData ? formatCurrency(monthlyData.totalRevenue) : "LKR 0",
      change: monthlyData ? `${monthlyData.monthName} ${monthlyData.year}` : `Year ${selectedYear}`,
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "yellow"
    },
    {
      label: "Total Appointments",
      value: monthlyData ? formatNumber(monthlyData.totalAppointments) : "0",
      change: monthlyData ? `${monthlyData.monthName} ${monthlyData.year}` : `Year ${selectedYear}`,
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      color: "yellow"
    },
    {
      label: "Avg Transaction",
      value: monthlyData ? formatCurrency(monthlyData.avgTransaction) : "LKR 0",
      change: monthlyData ? `${monthlyData.monthName} ${monthlyData.year}` : `Year ${selectedYear}`,
      icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
      color: "yellow"
    }
  ];

  // Calculate max revenue for staff chart
  const staffRevenue = monthlyData?.revenueByStaff || [];
  const maxStaffRevenue = staffRevenue.length > 0
    ? Math.max(...staffRevenue.map(s => s.totalRevenue))
    : 1;

  // Handle PDF Export
  const handleExportPDF = async () => {
    if (!monthlyData) {
      alert('No data available to export');
      return;
    }

    try {
      // Generate PDF
      const blob = await pdf(<RevenuePDF data={monthlyData} />).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Revenue_Report_${monthlyData.monthName}_${monthlyData.year}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <>
      {/* Header */}
      {width > 1024 && (
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
      )}

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

          {/* Filter Controls */}
          <div className="flex items-center justify-between" style={{ marginBottom: `${spacing}px` }}>
            <div className="flex items-center gap-2">
              {/* Current Month Button */}
              <button
                onClick={() => {
                  setFilterMode('current');
                  setIsFilterOpen(false);
                }}
                className={`rounded-lg transition-colors ${
                  filterMode === 'current'
                    ? 'bg-yellow-400 text-black font-semibold'
                    : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white'
                }`}
                style={{ padding: `${spacing / 2}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
              >
                Current Month
              </button>

              {/* Filter Dropdown */}
              <div className="relative filter-dropdown-container">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`rounded-lg transition-colors flex items-center gap-2 ${
                    filterMode !== 'current'
                      ? 'bg-yellow-400 text-black font-semibold'
                      : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white'
                  }`}
                  style={{ padding: `${spacing / 2}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                  <svg className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Filter Dropdown Panel */}
                {isFilterOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50"
                    style={{ minWidth: '280px', padding: `${cardPadding}px` }}
                  >
                    {/* Last Month Option */}
                    <button
                      onClick={() => {
                        setFilterMode('last');
                        setIsFilterOpen(false);
                      }}
                      className="w-full text-left bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors"
                      style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px`, marginBottom: `${spacing}px` }}
                    >
                      <div className="font-semibold">Last Month</div>
                      <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                        View previous month data
                      </div>
                    </button>

                    {/* Custom Date Selection */}
                    <div
                      className="bg-zinc-800/50 rounded-lg"
                      style={{ padding: `${spacing}px ${cardPadding}px` }}
                    >
                      <div className="font-semibold" style={{ fontSize: `${responsive.fontSize.body}px`, marginBottom: `${spacing}px` }}>
                        Custom Date Range
                      </div>

                      {/* Month Selector */}
                      <div style={{ marginBottom: `${spacing}px` }}>
                        <label className="text-zinc-400 block" style={{ fontSize: `${responsive.fontSize.small}px`, marginBottom: `${spacing / 3}px` }}>
                          Month
                        </label>
                        <select
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(Number(e.target.value))}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                          style={{ padding: `${spacing / 2}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
                        >
                          {monthOptions.map((month) => (
                            <option key={month.value} value={month.value}>
                              {month.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Year Selector */}
                      <div style={{ marginBottom: `${spacing}px` }}>
                        <label className="text-zinc-400 block" style={{ fontSize: `${responsive.fontSize.small}px`, marginBottom: `${spacing / 3}px` }}>
                          Year
                        </label>
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(Number(e.target.value))}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                          style={{ padding: `${spacing / 2}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
                        >
                          {yearOptions.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Apply Button */}
                      <button
                        onClick={() => {
                          setFilterMode('custom');
                          setIsFilterOpen(false);
                        }}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors"
                        style={{ padding: `${spacing / 2}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
                      >
                        Apply Filter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportPDF}
              disabled={!monthlyData || isLoading}
              className={`rounded-lg transition-colors flex items-center gap-2 ${
                !monthlyData || isLoading
                  ? 'bg-zinc-900/50 border border-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white hover:border-yellow-400'
              }`}
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

          {/* Revenue by Staff Member */}
          <div
            className="bg-zinc-900 rounded-xl border border-zinc-800"
            style={{ padding: `${cardPadding * 1.5}px` }}
          >
            <h3 className="font-bold" style={{ fontSize: `${responsive.fontSize.subheading}px`, marginBottom: `${spacing}px` }}>
              Revenue by Staff Member
            </h3>

            <div className="space-y-4">
              {staffRevenue.length > 0 ? (
                staffRevenue.map((staff) => {
                  // Calculate average transaction on the frontend
                  const avgTransaction = staff.appointmentCount > 0
                    ? staff.totalRevenue / staff.appointmentCount
                    : 0;

                  return (
                    <div key={staff.staffId}>
                      <div className="flex items-center justify-between" style={{ marginBottom: `${spacing / 2}px` }}>
                        <div>
                          <div className="font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                            {staff.staffName}
                          </div>
                          <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                            {staff.appointmentCount} appointments • Avg: {formatCurrency(avgTransaction)}
                          </div>
                        </div>
                        <span className="font-bold text-yellow-400" style={{ fontSize: `${responsive.fontSize.subheading}px` }}>
                          {formatCurrency(staff.totalRevenue)}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-3">
                        <div
                          className="bg-yellow-400 h-3 rounded-full transition-all"
                          style={{ width: `${(staff.totalRevenue / maxStaffRevenue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-zinc-400 text-center py-8" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                  No staff revenue data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
