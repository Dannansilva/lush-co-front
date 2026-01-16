"use client";

import React, { useState, useEffect } from "react";
import { useScreenSize, getResponsiveValues } from "@/app/hooks/useScreenSize";
import {
  formatTimeToString,
  Appointment,
} from "@/app/utils/calendarUtils";
import StaffCalendarGrid from "@/app/components/calendar/StaffCalendarGrid";
import AppointmentSlidePanel from "@/app/components/calendar/AppointmentSlidePanel";
import AllAppointmentsView from "@/app/components/calendar/AllAppointmentsView";
import UserProfile from "@/app/components/UserProfile";
import { apiGet } from "@/app/utils/api";

interface StaffMember {
  _id: string;
  name: string;
  phoneNumber: string;
}

interface BackendAppointment {
  _id: string;
  customer: {
    _id: string;
    name: string;
    phoneNumber: string;
  };
  staff: {
    _id: string;
    name: string;
  };
  services: Array<{
    _id: string;
    name: string;
    duration: number;
    price: number;
  }>;
  appointmentDate: string;
  status: string;
  notes?: string;
}

export default function AppointmentsPage() {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  const cardPadding = Math.max(12, Math.min(width * 0.015, 20));
  const spacing = Math.max(12, Math.min(width * 0.02, 16));

  const isMobile = width < 768;

  // View state
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Staff state
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  // Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    time: string;
    staffId?: string;
    staffName?: string;
  } | null>(null);

  // Fetch staff members from API
  useEffect(() => {
    const fetchStaff = async () => {
      setLoadingStaff(true);
      const response = await apiGet<StaffMember[]>('/staff');
      if (response.success && response.data) {
        setStaff(response.data);
      }
      setLoadingStaff(false);
    };
    fetchStaff();
  }, []);

  // Fetch appointments from API
  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    const response = await apiGet<BackendAppointment[]>('/appointments');

    if (response.success && response.data) {
      // Transform backend appointments to frontend format
      const transformedAppointments: Appointment[] = response.data.map((apt) => {
        const appointmentDate = new Date(apt.appointmentDate);

        // Extract date in YYYY-MM-DD format
        const dateStr = appointmentDate.toISOString().split('T')[0];

        // Extract time in 12-hour format
        const hours = appointmentDate.getHours();
        const minutes = appointmentDate.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

        // Get service info (first service for now)
        const serviceName = apt.services?.[0]?.name || 'Service';
        const serviceDuration = apt.services?.[0]?.duration || 60;
        const servicePrice = apt.services?.[0]?.price || 0;

        // Map backend status to frontend status type
        const statusLower = apt.status?.toLowerCase() || 'pending';
        const validStatuses = ['confirmed', 'pending', 'cancelled', 'in_progress', 'completed'];
        const status: 'confirmed' | 'pending' | 'cancelled' | 'in_progress' | 'completed' =
          validStatuses.includes(statusLower)
            ? (statusLower as 'confirmed' | 'pending' | 'cancelled' | 'in_progress' | 'completed')
            : 'pending';

        return {
          id: Date.now() + Math.random(), // Temporary numeric ID
          _id: apt._id, // MongoDB ID for editing
          clientName: apt.customer?.name || 'Unknown Client',
          phone: apt.customer?.phoneNumber || '',
          staffName: apt.staff?.name || 'Unknown Staff',
          service: serviceName,
          date: dateStr,
          time: timeStr,
          duration: serviceDuration,
          price: servicePrice,
          status,
          notes: apt.notes,
        };
      });

      setAppointments(transformedAppointments);
    }
    setLoadingAppointments(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAppointments();
  }, []);

  // Handlers
  const handleStaffCellClick = (
    staffId: string,
    staffName: string,
    date: Date,
    hour: number,
    minutes: number
  ) => {
    // Create new appointment for specific staff member
    setSelectedAppointment(null);
    setSelectedSlot({
      date,
      time: formatTimeToString(hour, minutes),
      staffId,
      staffName,
    });
    setIsPanelOpen(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    // Edit existing appointment
    setSelectedAppointment(appointment);
    setSelectedSlot(null);
    setIsPanelOpen(true);
  };

  const handleSaveAppointment = () => {
    // Refetch appointments from backend to get latest data
    fetchAppointments();
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

  const handlePreviousDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const handleDateSelect = (dateString: string) => {
    const newDate = new Date(dateString);
    setSelectedDate(newDate);
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
      {width > 1024 && (
        <div
          className="border-b border-zinc-800 flex items-center justify-between flex-shrink-0"
          style={{ padding: `${spacing}px ${cardPadding}px` }}
        >
          <div>
            <h1 className="font-bold" style={{ fontSize: `${responsive.fontSize.heading}px` }}>Appointments</h1>
            <p className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>View and manage all salon appointments</p>
          </div>

          {/* User Profile */}
          <UserProfile showSearch={false} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col overflow-hidden h-full">
          {/* Stats - Fixed at top (Hidden when viewing all appointments) */}
          {!showAllAppointments && (
            <div style={{ padding: `${spacing}px ${cardPadding}px ${spacing}px ${cardPadding}px` }}>
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
            </div>
          )}

          {/* Scrollable section with date navigator and grid */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ padding: `0 ${cardPadding}px ${spacing}px ${cardPadding}px` }}>
            {/* Date Navigator with View All Bookings Button */}
            <div className="flex items-center justify-between gap-3" style={{ marginBottom: `${spacing}px` }}>
              {/* Date Navigator - Hidden when viewing all appointments */}
              {!showAllAppointments && (
                <div className="flex items-center justify-between bg-zinc-900 rounded-lg border border-zinc-800 flex-1" style={{ padding: `${spacing}px ${cardPadding}px` }}>
                  <button
                    onClick={handlePreviousDay}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="text-center flex items-center gap-3">
                    <div className="font-bold text-white" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="relative">
                      <input
                        type="date"
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={(e) => handleDateSelect(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <button className="text-zinc-400 hover:text-yellow-400 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleNextDay}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* View All Bookings Button - Always visible */}
              <button
                onClick={handleToggleView}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  showAllAppointments
                    ? 'bg-yellow-400 text-black'
                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}
                style={{ fontSize: `${responsive.fontSize.body}px` }}
              >
                {showAllAppointments ? 'Hide All Bookings' : 'View All Bookings'}
              </button>
            </div>

            {/* Conditional View */}
            {loadingStaff || loadingAppointments ? (
              <div className="flex items-center justify-center" style={{ padding: `${spacing * 3}px` }}>
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" style={{ marginBottom: `${spacing}px` }}></div>
                  <p className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>Loading...</p>
                </div>
              </div>
            ) : showAllAppointments ? (
              <AllAppointmentsView
                appointments={appointments}
                onAppointmentClick={handleAppointmentClick}
              />
            ) : staff.length === 0 ? (
              <div className="text-center bg-zinc-900 rounded-lg border border-zinc-800" style={{ padding: `${spacing * 3}px` }}>
                <svg className="w-16 h-16 text-zinc-600 mx-auto" style={{ marginBottom: `${spacing}px` }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-zinc-400 font-semibold" style={{ fontSize: `${responsive.fontSize.body}px`, marginBottom: `${spacing / 2}px` }}>No staff members</p>
                <p className="text-zinc-500" style={{ fontSize: `${responsive.fontSize.small}px` }}>Add staff members to view their schedules</p>
              </div>
            ) : (
              <StaffCalendarGrid
                selectedDate={selectedDate}
                staffMembers={staff}
                appointments={appointments}
                onCellClick={handleStaffCellClick}
                onAppointmentClick={handleAppointmentClick}
              />
            )}
          </div>
        </div>
      </div>

      {/* Slide-in Panel */}
      <AppointmentSlidePanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        appointment={selectedAppointment}
        selectedDate={selectedSlot?.date}
        selectedTime={selectedSlot?.time}
        selectedStaffId={selectedSlot?.staffId}
        selectedStaffName={selectedSlot?.staffName}
        onSave={handleSaveAppointment}
      />
    </>
  );
}
