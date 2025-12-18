'use client';

import React from 'react';
import {
  Appointment,
  isAppointmentOnDate,
  calculateAppointmentPosition,
} from '@/app/utils/calendarUtils';
import AppointmentCard from './AppointmentCard';

interface DayColumnProps {
  date: Date;
  hour: number;
  appointments: Appointment[];
  cellHeight: number;
  onClick: (minuteOffset: number) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export default function DayColumn({
  date,
  hour,
  appointments,
  cellHeight,
  onClick,
  onAppointmentClick,
}: DayColumnProps) {
  // Filter appointments for this specific day
  const dayAppointments = appointments.filter((apt) =>
    isAppointmentOnDate(apt, date)
  );

  // Calculate quarter heights (15-minute slots)
  const quarterHeight = cellHeight / 4;

  const handleQuarterClick = (e: React.MouseEvent, minutes: number) => {
    e.stopPropagation();
    onClick(minutes);
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
            className="flex-1 hover:bg-zinc-800/30 transition-colors cursor-pointer border-t border-zinc-800/50 first:border-t-0"
            style={{ height: `${quarterHeight}px` }}
            onClick={(e) => handleQuarterClick(e, minutes)}
          />
        ))}
      </div>

      {/* Only render appointments in the first hour cell to avoid duplicates */}
      {hour === 9 &&
        dayAppointments.map((appointment) => {
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
