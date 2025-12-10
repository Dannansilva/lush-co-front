"use client";

import React from "react";
import Link from "next/link";
import { useScreenSize, getResponsiveValues } from "@/app/hooks/useScreenSize";

export default function ReceptionistDashboard() {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  const cardPadding = Math.max(12, Math.min(width * 0.015, 20));
  const spacing = Math.max(12, Math.min(width * 0.02, 16));

  const isMobile = width < 768;

  return (
    <>
      {/* Header */}
      <div
        className="border-b border-zinc-800 flex items-center justify-between flex-shrink-0"
        style={{ padding: `${spacing}px ${cardPadding}px` }}
      >
        <div>
          <h1 className="font-bold" style={{ fontSize: `${responsive.fontSize.heading}px` }}>Welcome back!</h1>
          <p className="text-yellow-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>Here&apos;s your salon overview</p>
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
              <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Receptionist</div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div style={{ padding: `${spacing}px ${cardPadding}px` }}>
          {/* Quick Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : width < 1280 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: `${spacing}px`,
              marginBottom: `${spacing * 2}px`
            }}
          >
            <div className="bg-zinc-900 rounded-xl border border-zinc-800" style={{ padding: `${cardPadding * 1.5}px` }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold" style={{ fontSize: `${responsive.fontSize.heading}px` }}>$62.5k</div>
                  <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Monthly Revenue</div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800" style={{ padding: `${cardPadding * 1.5}px` }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold" style={{ fontSize: `${responsive.fontSize.heading}px` }}>487</div>
                  <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Appointments</div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800" style={{ padding: `${cardPadding * 1.5}px` }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold" style={{ fontSize: `${responsive.fontSize.heading}px` }}>5</div>
                  <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Active Staff</div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800" style={{ padding: `${cardPadding * 1.5}px` }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold" style={{ fontSize: `${responsive.fontSize.heading}px` }}>98%</div>
                  <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="font-bold" style={{ fontSize: `${responsive.fontSize.subheading}px`, marginBottom: `${spacing}px` }}>
              Quick Access
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : width < 1280 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: `${spacing}px`
              }}
            >
              <Link
                href="/owner/staff"
                className="bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all"
                style={{ padding: `${cardPadding * 1.5}px` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>Manage Staff</div>
                    <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>View team performance</div>
                  </div>
                </div>
              </Link>

              <Link
                href="/owner/services"
                className="bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all"
                style={{ padding: `${cardPadding * 1.5}px` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>Services</div>
                    <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Update menu & pricing</div>
                  </div>
                </div>
              </Link>

              <Link
                href="/owner/appointments"
                className="bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all"
                style={{ padding: `${cardPadding * 1.5}px` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>Appointments</div>
                    <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>View all bookings</div>
                  </div>
                </div>
              </Link>

              <Link
                href="/owner/revenue"
                className="bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all"
                style={{ padding: `${cardPadding * 1.5}px` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>Revenue</div>
                    <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Financial analytics</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
