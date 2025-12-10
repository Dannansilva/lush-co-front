"use client";

import React, { useState } from "react";
import { useScreenSize, getResponsiveValues } from "@/app/hooks/useScreenSize";

export default function AppointmentsPage() {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  const cardPadding = Math.max(12, Math.min(width * 0.015, 20));
  const spacing = Math.max(12, Math.min(width * 0.02, 16));

  const isMobile = width < 768;

  const [filter, setFilter] = useState("all");

  const appointments = [
    {
      id: 1,
      clientName: "Jennifer Adams",
      staffName: "Emma Wilson",
      service: "Balayage + Cut",
      date: "2025-12-10",
      time: "9:00 AM",
      duration: 120,
      price: 285,
      status: "confirmed",
      phone: "(555) 123-4567"
    },
    {
      id: 2,
      clientName: "Rachel Green",
      staffName: "Mia Rodriguez",
      service: "Bridal Styling",
      date: "2025-12-10",
      time: "10:30 AM",
      duration: 90,
      price: 150,
      status: "pending",
      phone: "(555) 234-5678"
    },
    {
      id: 3,
      clientName: "Monica Bell",
      staffName: "Emma Wilson",
      service: "Full Color",
      date: "2025-12-10",
      time: "1:00 PM",
      duration: 120,
      price: 120,
      status: "confirmed",
      phone: "(555) 345-6789"
    },
    {
      id: 4,
      clientName: "Sarah Johnson",
      staffName: "Olivia Kim",
      service: "Precision Cut",
      date: "2025-12-10",
      time: "2:30 PM",
      duration: 45,
      price: 85,
      status: "confirmed",
      phone: "(555) 456-7890"
    },
    {
      id: 5,
      clientName: "Lisa Brown",
      staffName: "Sophia Lee",
      service: "Gel Manicure",
      date: "2025-12-10",
      time: "3:00 PM",
      duration: 60,
      price: 45,
      status: "cancelled",
      phone: "(555) 567-8901"
    }
  ];

  const filteredAppointments = appointments.filter(apt => {
    if (filter === "all") return true;
    return apt.status === filter;
  });

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    pending: appointments.filter(a => a.status === "pending").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length
  };

  return (
    <>
      {/* Header */}
      <div
        className="border-b border-zinc-800 flex items-center justify-between flex-shrink-0"
        style={{ padding: `${spacing}px ${cardPadding}px` }}
      >
        <div>
          <h1 className="font-bold" style={{ fontSize: `${responsive.fontSize.heading}px` }}>Appointments</h1>
          <p className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>View and manage all salon appointments</p>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
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
          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: `${spacing}px`,
              marginBottom: `${spacing * 2}px`
            }}
          >
            <div className="bg-zinc-900 rounded-lg border border-zinc-800" style={{ padding: `${cardPadding}px` }}>
              <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Total</div>
              <div className="font-bold text-yellow-400" style={{ fontSize: `${responsive.fontSize.heading}px` }}>{stats.total}</div>
            </div>
            <div className="bg-zinc-900 rounded-lg border border-zinc-800" style={{ padding: `${cardPadding}px` }}>
              <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Confirmed</div>
              <div className="font-bold text-green-400" style={{ fontSize: `${responsive.fontSize.heading}px` }}>{stats.confirmed}</div>
            </div>
            <div className="bg-zinc-900 rounded-lg border border-zinc-800" style={{ padding: `${cardPadding}px` }}>
              <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Pending</div>
              <div className="font-bold text-orange-400" style={{ fontSize: `${responsive.fontSize.heading}px` }}>{stats.pending}</div>
            </div>
            <div className="bg-zinc-900 rounded-lg border border-zinc-800" style={{ padding: `${cardPadding}px` }}>
              <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Cancelled</div>
              <div className="font-bold text-red-400" style={{ fontSize: `${responsive.fontSize.heading}px` }}>{stats.cancelled}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3" style={{ marginBottom: `${spacing}px` }}>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "all" ? "bg-yellow-400 text-black" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
              }`}
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              All
            </button>
            <button
              onClick={() => setFilter("confirmed")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "confirmed" ? "bg-yellow-400 text-black" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
              }`}
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "pending" ? "bg-yellow-400 text-black" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
              }`}
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("cancelled")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "cancelled" ? "bg-yellow-400 text-black" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
              }`}
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              Cancelled
            </button>
          </div>

          {/* Appointments Table */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-800/50 border-b border-zinc-800">
                <tr>
                  <th className="text-left text-zinc-400" style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.small}px` }}>Client</th>
                  <th className="text-left text-zinc-400" style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.small}px` }}>Staff</th>
                  <th className="text-left text-zinc-400" style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.small}px` }}>Service</th>
                  <th className="text-left text-zinc-400" style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.small}px` }}>Date & Time</th>
                  <th className="text-left text-zinc-400" style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.small}px` }}>Price</th>
                  <th className="text-left text-zinc-400" style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.small}px` }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                    <td style={{ padding: `${spacing}px ${cardPadding}px` }}>
                      <div className="font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>{apt.clientName}</div>
                      <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>{apt.phone}</div>
                    </td>
                    <td style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}>{apt.staffName}</td>
                    <td style={{ padding: `${spacing}px ${cardPadding}px` }}>
                      <div style={{ fontSize: `${responsive.fontSize.body}px` }}>{apt.service}</div>
                      <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>{apt.duration} min</div>
                    </td>
                    <td style={{ padding: `${spacing}px ${cardPadding}px` }}>
                      <div style={{ fontSize: `${responsive.fontSize.body}px` }}>{apt.date}</div>
                      <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>{apt.time}</div>
                    </td>
                    <td className="text-yellow-400 font-semibold" style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}>
                      ${apt.price}
                    </td>
                    <td style={{ padding: `${spacing}px ${cardPadding}px` }}>
                      <span
                        className={`px-3 py-1 rounded-full ${
                          apt.status === "confirmed" ? "bg-green-500/20 text-green-400" :
                          apt.status === "pending" ? "bg-orange-500/20 text-orange-400" :
                          "bg-red-500/20 text-red-400"
                        }`}
                        style={{ fontSize: `${responsive.fontSize.small}px` }}
                      >
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
