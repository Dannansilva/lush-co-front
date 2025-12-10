"use client";

import React from "react";
import { useScreenSize, getResponsiveValues } from "@/app/hooks/useScreenSize";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RevenuePage() {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  const cardPadding = Math.max(12, Math.min(width * 0.015, 20));
  const spacing = Math.max(12, Math.min(width * 0.02, 16));

  const isMobile = width < 768;

  const stats = [
    {
      label: "Annual Revenue",
      value: "$746,200",
      change: "+23.5% vs last year",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "yellow"
    },
    {
      label: "Net Profit",
      value: "$462,500",
      change: "+18.2% vs last year",
      icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
      color: "yellow"
    },
    {
      label: "Avg Transaction",
      value: "$127",
      change: "+8.4% vs last year",
      icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
      color: "yellow"
    },
    {
      label: "Total Clients",
      value: "2,847",
      change: "+342 new this year",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      color: "yellow"
    }
  ];

  const revenueByCategory = [
    { category: "Hair Styling", amount: 145000, percentage: 32, color: "#f59e0b" },
    { category: "Hair Coloring", amount: 198000, percentage: 44, color: "#d97706" },
    { category: "Treatments", amount: 87000, percentage: 19, color: "#92400e" },
    { category: "Nails", amount: 92000, percentage: 20, color: "#78350f" },
    { category: "Makeup", amount: 45000, percentage: 10, color: "#451a03" }
  ];

  const revenueByStaff = [
    { name: "Emma Wilson", amount: 165000 },
    { name: "Mia Rodriguez", amount: 152000 },
    { name: "Olivia Kim", amount: 128000 },
    { name: "Sophia Lee", amount: 118000 },
    { name: "Ava Martinez", amount: 95000 }
  ];

  const maxRevenue = Math.max(...revenueByStaff.map(s => s.amount));

  const revenueVsExpensesData = [
    { month: 'Jan', revenue: 58000, expenses: 32000 },
    { month: 'Feb', revenue: 61000, expenses: 34000 },
    { month: 'Mar', revenue: 63000, expenses: 35000 },
    { month: 'Apr', revenue: 59000, expenses: 33000 },
    { month: 'May', revenue: 65000, expenses: 36000 },
    { month: 'Jun', revenue: 68000, expenses: 37000 },
    { month: 'Jul', revenue: 70000, expenses: 38000 },
    { month: 'Aug', revenue: 67000, expenses: 37000 },
    { month: 'Sep', revenue: 71000, expenses: 39000 },
    { month: 'Oct', revenue: 73000, expenses: 40000 },
    { month: 'Nov', revenue: 69000, expenses: 38000 },
    { month: 'Dec', revenue: 75000, expenses: 41000 }
  ];

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
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search..."
            className="bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
            style={{ padding: `${spacing / 2}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px`, width: '200px' }}
          />
          <div className="relative">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">
              VS
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
          </div>
          {!isMobile && (
            <div>
              <div className="font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>Victoria Sterling</div>
              <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Owner</div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div style={{ padding: `${spacing}px ${cardPadding}px` }}>
          {/* Year Selector and Export */}
          <div className="flex items-center justify-between" style={{ marginBottom: `${spacing}px` }}>
            <select
              className="bg-zinc-900 border border-zinc-800 rounded-lg text-white"
              style={{ padding: `${spacing / 2}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
            >
              <option>2025</option>
              <option>2024</option>
              <option>2023</option>
            </select>

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
              marginBottom: `${spacing * 2}px`
            }}
          >
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
                    <div className="text-green-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>
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

          {/* Revenue Chart */}
          <div
            className="bg-zinc-900 rounded-xl border border-zinc-800"
            style={{ padding: `${cardPadding * 1.5}px`, marginBottom: `${spacing * 2}px` }}
          >
            <h3 className="font-bold" style={{ fontSize: `${responsive.fontSize.subheading}px`, marginBottom: `${spacing}px` }}>
              Revenue vs Expenses
            </h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueVsExpensesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="month"
                    stroke="#71717a"
                    style={{ fontSize: `${responsive.fontSize.small}px` }}
                  />
                  <YAxis
                    stroke="#71717a"
                    style={{ fontSize: `${responsive.fontSize.small}px` }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
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
                    stroke="#facc15"
                    strokeWidth={3}
                    dot={{ fill: '#facc15', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
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
                  {revenueByCategory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span style={{ fontSize: `${responsive.fontSize.small}px` }}>{item.category}</span>
                      </div>
                      <span className="font-semibold" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                        ${(item.amount / 1000).toFixed(0)}k
                      </span>
                    </div>
                  ))}
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
                {revenueByStaff.map((staff, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px`, marginBottom: `${spacing / 3}px` }}>
                      <span>{staff.name}</span>
                      <span className="font-semibold">${(staff.amount / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${(staff.amount / maxRevenue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
