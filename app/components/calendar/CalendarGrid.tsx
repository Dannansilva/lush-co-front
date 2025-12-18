'use client';

import React from 'react';
import { useScreenSize, getResponsiveValues } from '@/app/hooks/useScreenSize';
import {
  getWeekDates,
  getDayName,
  formatDate,
  isToday,
  Appointment,
  CALENDAR_START_HOUR,
  TOTAL_HOURS,
} from '@/app/utils/calendarUtils';
import TimeColumn from './TimeColumn';
import DayColumn from './DayColumn';

interface CalendarGridProps {
  weekStart: Date;
  appointments: Appointment[];
  onCellClick: (date: Date, hour: number, minutes: number) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export default function CalendarGrid({
  weekStart,
  appointments,
  onCellClick,
  onAppointmentClick,
}: CalendarGridProps) {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  const weekDates = getWeekDates(weekStart);
  const hours = Array.from(
    { length: TOTAL_HOURS },
    (_, i) => CALENDAR_START_HOUR + i
  );

  // Calculate responsive dimensions
  const timeColumnWidth = responsive.device.isMobile ? 50 : 80;
  const availableWidth = width - timeColumnWidth - responsive.padding.horizontal * 2;
  const dayColumnWidth = Math.max(60, availableWidth / 7);

  const availableHeight = height - 250; // Subtract header, navigator, padding
  const hourCellHeight = Math.max(60, availableHeight / TOTAL_HOURS);

  return (
    <div className="flex-1 overflow-auto">
      <div
        className="inline-grid bg-zinc-800 rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `${timeColumnWidth}px repeat(7, ${dayColumnWidth}px)`,
          gridTemplateRows: `60px repeat(${TOTAL_HOURS}, ${hourCellHeight}px)`,
          gap: '1px',
          minWidth: '100%',
        }}
      >
        {/* Header row */}
        <div className="bg-zinc-900 border-b border-zinc-800" />
        {weekDates.map((date) => (
          <div
            key={date.toString()}
            className={`bg-zinc-900 border-b border-zinc-800 flex flex-col items-center justify-center ${
              isToday(date) ? 'bg-yellow-400/10' : ''
            }`}
            style={{ padding: `${responsive.spacing.gap}px` }}
          >
            <div
              className={`font-semibold ${isToday(date) ? 'text-yellow-400' : 'text-white'}`}
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              {getDayName(date)}
            </div>
            <div
              className={`${isToday(date) ? 'text-yellow-400' : 'text-zinc-400'}`}
              style={{ fontSize: `${responsive.fontSize.small}px` }}
            >
              {formatDate(date)}
            </div>
          </div>
        ))}

        {/* Time grid */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <TimeColumn hour={hour} />
            {weekDates.map((date) => (
              <DayColumn
                key={`${date.toISOString()}-${hour}`}
                date={date}
                hour={hour}
                appointments={appointments}
                cellHeight={hourCellHeight}
                onClick={(minutes) => onCellClick(date, hour, minutes)}
                onAppointmentClick={onAppointmentClick}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
