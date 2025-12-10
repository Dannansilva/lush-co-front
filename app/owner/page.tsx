"use client";

import React from "react";
import { useScreenSize, getResponsiveValues, getResponsiveFontSize } from "@/app/hooks/useScreenSize";

export default function OwnerDashboard() {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  const statCardSize = getResponsiveFontSize(width, 24, 32);
  const cardPadding = Math.max(12, Math.min(width * 0.015, 20));
  const spacing = Math.max(12, Math.min(width * 0.02, 16));

  const isMobile = width < 768;

  // Sample data
  const appointments = [
    {
      id: 1,
      name: "Jennifer Adams",
      service: "Balayage + Cut",
      time: "9:00 AM",
      phone: "(555) 123-4567",
      status: "confirmed",
    },
    {
      id: 2,
      name: "Rachel Green",
      service: "Bridal Styling",
      time: "10:30 AM",
      phone: "(555) 234-5678",
      status: "pending",
    },
    {
      id: 3,
      name: "Monica Bell",
      service: "Full Color",
      time: "1:00 PM",
      phone: "(555) 345-6789",
      status: "confirmed",
    },
  ];

  // Quick actions data
  const quickActions = [
    {
      id: 1,
      title: "New Appointment",
      description: "Schedule appointment",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      id: 2,
      title: "Add Client",
      description: "Register new client",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-500",
    },
    {
      id: 3,
      title: "Services",
      description: "Manage services",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
        </svg>
      ),
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-500",
    },
  ];

  return (
    <>
      {/* Header */}
      <div
        className="border-b border-zinc-800 flex items-center justify-between flex-shrink-0"
        style={{ padding: `${spacing}px ${cardPadding}px` }}
      >
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-bold" style={{ fontSize: `${responsive.fontSize.heading}px` }}>Dashboard</h1>
            <p className="text-yellow-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>Good morning, Emma. Here&apos;s today&apos;s overview.</p>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">
              ED
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
          </div>
          {!isMobile && (
            <div>
              <div className="font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>Emma Davis</div>
              <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Front Desk</div>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Stats Cards */}
        <div
          style={{
            padding: `${spacing}px ${cardPadding}px`,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : width < 1280 ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: `${spacing}px`,
          }}
        >
          <div className="bg-zinc-900 rounded-xl border border-zinc-800" style={{ padding: `${cardPadding}px` }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-bold" style={{ fontSize: `${statCardSize}px` }}>18</div>
                <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Today&apos;s Appointments</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800" style={{ padding: `${cardPadding}px` }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-bold" style={{ fontSize: `${statCardSize}px` }}>15 min</div>
                <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Next Appointment</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800" style={{ padding: `${cardPadding}px` }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <div className="font-bold" style={{ fontSize: `${statCardSize}px` }}>3</div>
                <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Walk-ins Today</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-zinc-800" style={{ padding: `${cardPadding}px` }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-bold" style={{ fontSize: `${statCardSize}px` }}>12</div>
                <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div
          style={{
            padding: `0 ${cardPadding}px ${spacing}px`,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr",
            gap: `${spacing}px`,
          }}
        >
          {/* Upcoming Appointments */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800" style={{ padding: `${cardPadding}px` }}>
            <h2
              className="font-bold"
              style={{
                fontSize: `${responsive.fontSize.subheading}px`,
                marginBottom: `${spacing}px`,
              }}
            >
              Upcoming Appointments
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: `${spacing}px` }}>
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between bg-zinc-800/50 rounded-lg border border-zinc-700/50"
                  style={{ padding: `${cardPadding}px` }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-zinc-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                        {apt.name}
                      </div>
                      <div className="text-yellow-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                        {apt.service}
                      </div>
                      <div className="text-zinc-500 flex items-center gap-3" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                        <span>🕐 {apt.time}</span>
                        <span>📞 {apt.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        apt.status === "confirmed" ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"
                      }`}
                      style={{ fontSize: `${responsive.fontSize.small}px` }}
                    >
                      {apt.status}
                    </span>
                    {apt.status === "pending" && (
                      <div className="flex gap-2">
                        <button className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center">
                          ✓
                        </button>
                        <button className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center">
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800" style={{ padding: `${cardPadding}px` }}>
            <h2
              className="font-bold"
              style={{
                fontSize: `${responsive.fontSize.subheading}px`,
                marginBottom: `${spacing / 2}px`,
              }}
            >
              Quick Actions
            </h2>
            <p
              className="text-zinc-400"
              style={{
                fontSize: `${responsive.fontSize.small}px`,
                marginBottom: `${spacing}px`,
              }}
            >
              Common tasks
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                gap: `${spacing}px`,
              }}
            >
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className="bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg transition-colors text-left"
                  style={{ padding: `${cardPadding}px` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${action.bgColor} ${action.iconColor} rounded-lg p-2 flex-shrink-0`}>
                      {action.icon}
                    </div>
                    <div>
                      <div className="font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                        {action.title}
                      </div>
                      <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                        {action.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
