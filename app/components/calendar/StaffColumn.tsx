'use client';

import React from 'react';
import {
  Appointment,
  isAppointmentOnDate,
  calculateAppointmentPosition,
  formatTimeToString,
} from '@/app/utils/calendarUtils';
import AppointmentCard from './AppointmentCard';

interface StaffColumnProps {
  staffId: string;
  staffName: string;
  date: Date;
  hour: number;
  appointments: Appointment[];
  cellHeight: number;
  onClick: (staffId: string, staffName: string, minuteOffset: number) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export default function StaffColumn({
  staffId,
  staffName,
  date,
  hour,
  appointments,
  cellHeight,
  onClick,
  onAppointmentClick,
}: StaffColumnProps) {
  // Filter appointments for this specific staff member and date
  const staffAppointments = appointments.filter(
    (apt) => apt.staffName === staffName && isAppointmentOnDate(apt, date)
  );

  // Calculate quarter heights (15-minute slots)
  const quarterHeight = cellHeight / 4;

  const handleQuarterClick = (e: React.MouseEvent, minutes: number) => {
    e.stopPropagation();
    onClick(staffId, staffName, minutes);
  };

  return (
    <div
      className="bg-zinc-900 relative border-zinc-800"
      style={{ height: `${cellHeight}px` }}
    >
      {/* 15-minute time slots */}
      <div className="absolute inset-0 flex flex-col">
        {[0, 15, 30, 45].map((minutes) => (
          <div
            key={minutes}
            className="flex-1 hover:bg-zinc-800/30 transition-colors cursor-pointer border-t border-zinc-800/50 first:border-t-0 relative group"
            style={{ height: `${quarterHeight}px` }}
            onClick={(e) => handleQuarterClick(e, minutes)}
          >
            {/* Hover tooltip */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-800 text-white px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-zinc-700">
              {formatTimeToString(hour, minutes)}
            </div>
          </div>
        ))}
      </div>

      {/* Only render appointments in the first hour cell to avoid duplicates */}
      {hour === 9 &&
        staffAppointments.map((appointment) => {
          const position = calculateAppointmentPosition(
            appointment.time,
            appointment.duration,
            cellHeight
          );

          return (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              position={position}
              onClick={(e) => {
                e.stopPropagation(); // Prevent cell click
                onAppointmentClick(appointment);
              }}
            />
          );
        })}
    </div>
  );
}
