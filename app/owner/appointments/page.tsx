"use client";

import React, { useState } from "react";
import { useScreenSize, getResponsiveValues } from "@/app/hooks/useScreenSize";
import {
  getWeekStart,
  navigateWeek,
  formatTimeToString,
  Appointment,
} from "@/app/utils/calendarUtils";
import CalendarGrid from "@/app/components/calendar/CalendarGrid";
import WeekNavigator from "@/app/components/calendar/WeekNavigator";
import AppointmentSlidePanel from "@/app/components/calendar/AppointmentSlidePanel";
import AllAppointmentsView from "@/app/components/calendar/AllAppointmentsView";

export default function AppointmentsPage() {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  const cardPadding = Math.max(12, Math.min(width * 0.015, 20));
  const spacing = Math.max(12, Math.min(width * 0.02, 16));

  const isMobile = width < 768;

  // Week navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getWeekStart(new Date())
  );

  // View state
  const [showAllAppointments, setShowAllAppointments] = useState(false);

  // Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);

  // Mock appointments data
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      clientName: "Jennifer Adams",
      staffName: "Emma Wilson",
      service: "Balayage + Cut",
      date: "2025-12-16",
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
      date: "2025-12-17",
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
      date: "2025-12-18",
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
      date: "2025-12-19",
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
      date: "2025-12-20",
      time: "3:00 PM",
      duration: 60,
      price: 45,
      status: "cancelled",
      phone: "(555) 567-8901"
    }
  ]);

  // Handlers
  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => navigateWeek(prev, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => navigateWeek(prev, 1));
  };

  const handleCellClick = (date: Date, hour: number, minutes: number) => {
    // Create new appointment
    setSelectedAppointment(null);
    setSelectedSlot({
      date,
      time: formatTimeToString(hour, minutes),
    });
    setIsPanelOpen(true);
  };

  const handleDateNavigatorSelect = (weekStart: Date) => {
    setCurrentWeekStart(weekStart);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    // Edit existing appointment
    setSelectedAppointment(appointment);
    setSelectedSlot(null);
    setIsPanelOpen(true);
  };

  const handleSaveAppointment = (appointment: Appointment) => {
    if (selectedAppointment) {
      // Update existing appointment
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === appointment.id ? appointment : apt))
      );
    } else {
      // Add new appointment
      setAppointments((prev) => [...prev, appointment]);
    }
    setIsPanelOpen(false);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedAppointment(null);
    setSelectedSlot(null);
  };

  const handleToggleView = () => {
    setShowAllAppointments((prev) => !prev);
  };

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

          {/* Week Navigator */}
          <WeekNavigator
            currentWeekStart={currentWeekStart}
            onPrevious={handlePreviousWeek}
            onNext={handleNextWeek}
            onDateSelect={handleDateNavigatorSelect}
            onViewAllAppointments={handleToggleView}
            showAllAppointments={showAllAppointments}
          />

          {/* Conditional View */}
          {showAllAppointments ? (
            <AllAppointmentsView
              appointments={appointments}
              onAppointmentClick={handleAppointmentClick}
            />
          ) : (
            <CalendarGrid
              weekStart={currentWeekStart}
              appointments={appointments}
              onCellClick={handleCellClick}
              onAppointmentClick={handleAppointmentClick}
            />
          )}
        </div>
      </div>

      {/* Slide-in Panel */}
      <AppointmentSlidePanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        appointment={selectedAppointment}
        selectedDate={selectedSlot?.date}
        selectedTime={selectedSlot?.time}
        onSave={handleSaveAppointment}
      />
    </>
  );
}
