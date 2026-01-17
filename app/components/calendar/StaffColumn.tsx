'use client';

import React from 'react';
import {
  Appointment,
  isAppointmentOnDate,
  calculateAppointmentPosition,
  formatTimeToString,
  CALENDAR_START_HOUR,
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

  const quarterHeight = cellHeight / 4;
  
  // Group overlapping appointments
  const positionedAppointments = React.useMemo(() => {
    // 1. Convert time to minutes from start of day (9:00 AM)
    const getMinutes = (timeStr: string) => {
      const [time, period] = timeStr.split(' ');
      const [hStr, mStr] = time.split(':');
      let h = parseInt(hStr);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + parseInt(mStr);
    };

    // 2. Sort by start time
    const sorted = [...staffAppointments].sort((a, b) => {
      const startA = getMinutes(a.time);
      const startB = getMinutes(b.time);
      if (startA !== startB) return startA - startB;
      return b.duration - a.duration; // Longest first if same start
    });

    // 3. Group overlapping
    const groups: Appointment[][] = [];
    if (sorted.length > 0) {
      let currentGroup: Appointment[] = [sorted[0]];
      let groupEndTime = getMinutes(sorted[0].time) + sorted[0].duration;

      for (let i = 1; i < sorted.length; i++) {
        const apt = sorted[i];
        const start = getMinutes(apt.time);
        const end = start + apt.duration;

        if (start < groupEndTime) {
          currentGroup.push(apt);
          groupEndTime = Math.max(groupEndTime, end);
        } else {
          groups.push(currentGroup);
          currentGroup = [apt];
          groupEndTime = end;
        }
      }
      groups.push(currentGroup);
    }

    // 4. Assign positions
    const result: { appointment: Appointment; left: string; width: string }[] = [];
    
    groups.forEach(group => {
      const count = group.length;
      group.forEach((apt, index) => {
        // If it's a single appointment, limit width to 85% to leave room for clicking "add new"
        const width = count === 1 ? '85%' : `calc(${100 / count}% - 4px)`;
        
        result.push({
          appointment: apt,
          width,
          left: `calc(${(index / count) * 100}% + 2px)`
        });
      });
    });

    return result;
  }, [staffAppointments]);

  const handleQuarterClick = (e: React.MouseEvent, minutes: number) => {
    e.stopPropagation();
    onClick(staffId, staffName, minutes);
  };

  return (
    <div
      className="bg-zinc-900 relative border-zinc-800"
      style={{ height: `${cellHeight}px`, overflow: 'visible' }}
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
      {/* Only render appointments in the first hour cell to avoid duplicates */}
      {hour === CALENDAR_START_HOUR &&
        positionedAppointments.map(({ appointment, left, width }) => {
          const position = calculateAppointmentPosition(
            appointment.time,
            appointment.duration,
            cellHeight
          );

          // Add layout overrides
          const layoutPosition = {
            ...position,
            left,
            width
          };

          return (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              position={layoutPosition}
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
