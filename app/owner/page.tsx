"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScreenSize, getResponsiveValues, getResponsiveFontSize } from "@/app/hooks/useScreenSize";
import { useAuth } from "@/app/context/AuthContext";
import UserProfile from "@/app/components/UserProfile";
import AppointmentSlidePanel from "@/app/components/calendar/AppointmentSlidePanel";
import { apiGet } from "@/app/utils/api";
import { Appointment } from "@/app/utils/calendarUtils";

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

interface DashboardAppointment {
  id: string;
  name: string;
  service: string;
  time: string;
  phone: string;
  status: string;
  dateTime: Date;
}

export default function OwnerDashboard() {
  const router = useRouter();
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);
  const { user } = useAuth();

  const statCardSize = getResponsiveFontSize(width, 24, 32);
  const cardPadding = Math.max(12, Math.min(width * 0.015, 20));
  const spacing = Math.max(12, Math.min(width * 0.02, 16));

  const isMobile = width < 768;

  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAppointmentPanelOpen, setIsAppointmentPanelOpen] = useState(false);

  // Get first name for greeting
  const getFirstName = () => {
    if (!user?.name) return "User";
    return user.name.split(" ")[0];
  };

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      const response = await apiGet<BackendAppointment[]>('/appointments');

      if (response.success && response.data) {
        const transformedAppointments: DashboardAppointment[] = response.data.map((apt) => {
          const appointmentDate = new Date(apt.appointmentDate);

          // Format time in 12-hour format
          const hours = appointmentDate.getHours();
          const minutes = appointmentDate.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours % 12 || 12;
          const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

          // Get service names
          const serviceNames = apt.services.map(s => s.name).join(', ');

          return {
            id: apt._id,
            name: apt.customer?.name || 'Unknown Client',
            service: serviceNames || 'Service',
            time: timeStr,
            phone: apt.customer?.phoneNumber || '',
            status: apt.status?.toLowerCase() || 'pending',
            dateTime: appointmentDate,
          };
        });

        setAppointments(transformedAppointments);
      }
      setLoading(false);
    };

    fetchAppointments();
  }, []);

  // Calculate dashboard stats
  const getTodayStats = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Filter today's appointments
    const todayAppointments = appointments.filter(
      apt => apt.dateTime >= todayStart && apt.dateTime <= todayEnd
    );

    // Today's appointments count
    const todaysCount = todayAppointments.length;

    // Next appointment time
    const futureAppointments = appointments
      .filter(apt => apt.dateTime > now)
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    let nextAppointmentText = '-';
    if (futureAppointments.length > 0) {
      const nextApt = futureAppointments[0];
      const diffMinutes = Math.floor((nextApt.dateTime.getTime() - now.getTime()) / (1000 * 60));

      if (diffMinutes < 60) {
        nextAppointmentText = `${diffMinutes} min`;
      } else {
        const hours = Math.floor(diffMinutes / 60);
        nextAppointmentText = `${hours}h ${diffMinutes % 60}min`;
      }
    }

    // Walk-ins (we don't have this data yet, so set to 0)
    const walkInsCount = 0;

    // Completed appointments count (assuming completed status exists)
    const completedCount = appointments.filter(
      apt => apt.status === 'completed'
    ).length;

    return {
      todaysCount,
      nextAppointmentText,
      walkInsCount,
      completedCount,
    };
  };

  // Get upcoming appointments (today's future appointments)
  const getUpcomingAppointments = () => {
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    return appointments
      .filter(apt => apt.dateTime >= now && apt.dateTime <= todayEnd)
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
      .slice(0, 5); // Show max 5 upcoming appointments
  };

  const stats = getTodayStats();
  const upcomingAppointments = getUpcomingAppointments();

  // Handle appointment save
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAppointmentSave = (appointment: Appointment) => {
    setIsAppointmentPanelOpen(false);
    // Refresh appointments data
    const fetchAppointments = async () => {
      const response = await apiGet<BackendAppointment[]>('/appointments');
      if (response.success && response.data) {
        const transformedAppointments: DashboardAppointment[] = response.data.map((apt) => {
          const appointmentDate = new Date(apt.appointmentDate);
          const hours = appointmentDate.getHours();
          const minutes = appointmentDate.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours % 12 || 12;
          const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
          const serviceNames = apt.services.map(s => s.name).join(', ');
          return {
            id: apt._id,
            name: apt.customer?.name || 'Unknown Client',
            service: serviceNames || 'Service',
            time: timeStr,
            phone: apt.customer?.phoneNumber || '',
            status: apt.status?.toLowerCase() || 'pending',
            dateTime: appointmentDate,
          };
        });
        setAppointments(transformedAppointments);
      }
    };
    fetchAppointments();
  };

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
      onClick: () => setIsAppointmentPanelOpen(true),
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
      onClick: () => router.push('/owner/clients'),
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
      onClick: () => router.push('/owner/services'),
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
            <p className="text-yellow-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>
              Good morning, {getFirstName()}. Here&apos;s today&apos;s overview.
            </p>
          </div>
        </div>

        {/* User Profile */}
        <UserProfile showSearch={false} />
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Stats Cards */}
        <div
          className="flex-shrink-0"
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
                <div className="font-bold" style={{ fontSize: `${statCardSize}px` }}>
                  {loading ? '...' : stats.todaysCount}
                </div>
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
                <div className="font-bold" style={{ fontSize: `${statCardSize}px` }}>
                  {loading ? '...' : stats.nextAppointmentText}
                </div>
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
                <div className="font-bold" style={{ fontSize: `${statCardSize}px` }}>
                  {loading ? '...' : stats.walkInsCount}
                </div>
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
                <div className="font-bold" style={{ fontSize: `${statCardSize}px` }}>
                  {loading ? '...' : stats.completedCount}
                </div>
                <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div
          className="flex-1"
          style={{
            padding: `0 ${cardPadding}px ${spacing}px`,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr",
            gap: `${spacing}px`,
            minHeight: 0,
          }}
        >
          {/* Upcoming Appointments */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col" style={{ padding: `${cardPadding}px` }}>
            <h2
              className="font-bold"
              style={{
                fontSize: `${responsive.fontSize.subheading}px`,
                marginBottom: `${spacing}px`,
              }}
            >
              Upcoming Appointments
            </h2>

            <div className="flex-1 overflow-y-auto" style={{ display: "flex", flexDirection: "column", gap: `${spacing}px` }}>
              {loading ? (
                <div className="text-center" style={{ padding: `${spacing * 2}px` }}>
                  <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-zinc-400 mt-2" style={{ fontSize: `${responsive.fontSize.small}px` }}>Loading appointments...</p>
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center bg-zinc-800/50 rounded-lg border border-zinc-700/50" style={{ padding: `${spacing * 3}px` }}>
                  <svg className="w-12 h-12 text-zinc-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>No upcoming appointments today</p>
                </div>
              ) : upcomingAppointments.map((apt) => (
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
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col" style={{ padding: `${cardPadding}px` }}>
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
              className="flex-1 flex flex-col"
              style={{
                gap: `${spacing}px`,
              }}
            >
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className="bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg transition-all hover:scale-[1.02] text-left"
                  style={{ padding: `${cardPadding * 1.2}px` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`${action.bgColor} ${action.iconColor} rounded-lg flex-shrink-0`} style={{ padding: `${spacing}px` }}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                        {action.title}
                      </div>
                      <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                        {action.description}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-zinc-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Slide Panel */}
      <AppointmentSlidePanel
        isOpen={isAppointmentPanelOpen}
        onClose={() => setIsAppointmentPanelOpen(false)}
        appointment={null}
        onSave={handleAppointmentSave}
      />
    </>
  );
}
