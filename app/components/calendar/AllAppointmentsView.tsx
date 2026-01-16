'use client';

import React, { useState, useMemo } from 'react';
import { useScreenSize, getResponsiveValues } from '@/app/hooks/useScreenSize';
import { Appointment } from '@/app/utils/calendarUtils';
import ShareBillModal from '../appointment/ShareBillModal';

interface AllAppointmentsViewProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

export default function AllAppointmentsView({
  appointments,
  onAppointmentClick,
}: AllAppointmentsViewProps) {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  const cardPadding = Math.max(12, Math.min(width * 0.015, 20));
  const spacing = Math.max(12, Math.min(width * 0.02, 16));

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [shareBillModalOpen, setShareBillModalOpen] = useState(false);
  const [selectedBillAppointment, setSelectedBillAppointment] = useState<Appointment | null>(null);

  const isMobile = responsive.device.isMobile;
  const isTablet = responsive.device.isTablet;

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    // Filter by date range
    if (filterDateFrom) {
      filtered = filtered.filter(apt => apt.date >= filterDateFrom);
    }
    if (filterDateTo) {
      filtered = filtered.filter(apt => apt.date <= filterDateTo);
    }

    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });
    } else if (sortBy === 'status') {
      filtered.sort((a, b) => a.status.localeCompare(b.status));
    }

    return filtered;
  }, [appointments, filterStatus, filterDateFrom, filterDateTo, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div
        className="bg-zinc-900 rounded-lg border border-zinc-800 flex-shrink-0"
        style={{
          padding: `${cardPadding}px`,
          marginBottom: `${spacing}px`,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: `${spacing}px`,
          }}
        >
          {/* Status Filter */}
          <div>
            <label
              className="block text-zinc-400 mb-1"
              style={{ fontSize: `${responsive.fontSize.small}px` }}
            >
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label
              className="block text-zinc-400 mb-1"
              style={{ fontSize: `${responsive.fontSize.small}px` }}
            >
              From Date
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          {/* Date To */}
          <div>
            <label
              className="block text-zinc-400 mb-1"
              style={{ fontSize: `${responsive.fontSize.small}px` }}
            >
              To Date
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          {/* Sort By */}
          <div>
            <label
              className="block text-zinc-400 mb-1"
              style={{ fontSize: `${responsive.fontSize.small}px` }}
            >
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'status')}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              <option value="date">Date & Time</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(filterStatus !== 'all' || filterDateFrom || filterDateTo) && (
          <button
            onClick={() => {
              setFilterStatus('all');
              setFilterDateFrom('');
              setFilterDateTo('');
            }}
            className="mt-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md px-3 py-1 transition-colors text-yellow-400"
            style={{ fontSize: `${responsive.fontSize.small}px` }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div
        className="text-zinc-400 mb-2"
        style={{
          fontSize: `${responsive.fontSize.body}px`,
          padding: `0 ${cardPadding / 2}px`,
        }}
      >
        Showing {filteredAppointments.length} of {appointments.length} appointments
      </div>

      {/* Appointments List */}
      <div className="flex-1 overflow-y-auto">
        {filteredAppointments.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center bg-zinc-900 rounded-lg border border-zinc-800"
            style={{
              padding: `${cardPadding * 3}px`,
              minHeight: '200px',
            }}
          >
            <div
              className="text-zinc-500 text-center"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              No appointments found
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : 'repeat(2, 1fr)',
              gap: `${spacing}px`,
            }}
          >
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg"
                style={{ padding: `${cardPadding}px` }}
              >
                {/* Header with Status */}
                <div
                  className="flex items-center justify-between mb-2"
                  style={{ gap: `${spacing / 2}px` }}
                >
                  <div className="flex-1">
                    <div
                      className="font-semibold text-white"
                      style={{ fontSize: `${responsive.fontSize.body}px` }}
                    >
                      {appointment.clientName}
                    </div>
                  </div>
                  <span
                    className={`${getStatusColor(appointment.status)} px-2 py-1 rounded-full border text-xs font-medium uppercase`}
                  >
                    {appointment.status}
                  </span>
                </div>

                {/* Details */}
                <div
                  className="space-y-1"
                  style={{
                    fontSize: `${responsive.fontSize.small}px`,
                    marginTop: `${spacing / 2}px`,
                  }}
                >
                  <div className="flex items-center text-zinc-400">
                    <svg
                      className="mr-2"
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2H4C2.9 2 2 2.9 2 4V12C2 13.1 2.9 14 4 14H12C13.1 14 14 13.1 14 12V4C14 2.9 13.1 2 12 2Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M11 1V3M5 1V3M2 6H14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {formatDateDisplay(appointment.date)}
                  </div>

                  <div className="flex items-center text-zinc-400">
                    <svg
                      className="mr-2"
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="8"
                        cy="8"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M8 4V8L10.5 9.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    {appointment.time} ({appointment.duration} min)
                  </div>

                  <div className="flex items-center text-zinc-400">
                    <svg
                      className="mr-2"
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M3 14C3 11.7909 5.23858 10 8 10C10.7614 10 13 11.7909 13 14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    Staff: {appointment.staffName}
                  </div>

                  <div className="flex items-center text-zinc-400">
                    <svg
                      className="mr-2"
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 3V8L11 10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    {appointment.service}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
                    <span className="text-zinc-400">Price:</span>
                    <span className="font-semibold text-yellow-400">
                      ${appointment.price}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  className="flex gap-2 mt-3 pt-3 border-t border-zinc-800"
                  style={{ marginTop: `${spacing}px` }}
                >
                  {/* View Details Button */}
                  <button
                    onClick={() => onAppointmentClick(appointment)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{ padding: `${spacing / 2}px ${cardPadding}px`, fontSize: `${responsive.fontSize.small}px` }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </button>

                  {/* Share Bill Button - Only for completed appointments */}
                  {appointment.status === 'completed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBillAppointment(appointment);
                        setShareBillModalOpen(true);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      style={{ padding: `${spacing / 2}px ${cardPadding}px`, fontSize: `${responsive.fontSize.small}px` }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Share Bill
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Bill Modal */}
      {selectedBillAppointment && (
        <ShareBillModal
          isOpen={shareBillModalOpen}
          onClose={() => {
            setShareBillModalOpen(false);
            setSelectedBillAppointment(null);
          }}
          appointment={selectedBillAppointment}
        />
      )}
    </div>
  );
}
