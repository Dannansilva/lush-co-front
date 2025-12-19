'use client';

import React, { useState } from 'react';
import { useScreenSize, getResponsiveValues } from '@/app/hooks/useScreenSize';
import { formatDateLong, getWeekDates } from '@/app/utils/calendarUtils';
import CalendarModal from './CalendarModal';

interface WeekNavigatorProps {
  currentWeekStart: Date;
  onPrevious: () => void;
  onNext: () => void;
  onDateSelect: (weekStart: Date) => void;
  onViewAllAppointments: () => void;
  showAllAppointments: boolean;
}

export default function WeekNavigator({
  currentWeekStart,
  onPrevious,
  onNext,
  onDateSelect,
  onViewAllAppointments,
  showAllAppointments,
}: WeekNavigatorProps) {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const weekDates = getWeekDates(currentWeekStart);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const isMobile = responsive.device.isMobile;
  const spacing = Math.max(12, Math.min(width * 0.02, 16));

  const handleDateSelect = (weekStart: Date) => {
    onDateSelect(weekStart);
    setIsCalendarOpen(false);
  };

  return (
    <>
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: `${spacing}px` }}
      >
        {/* All Appointments Button */}
        <button
          onClick={onViewAllAppointments}
          className={`${
            showAllAppointments
              ? 'bg-yellow-400 text-black hover:bg-yellow-500'
              : 'bg-zinc-900 hover:bg-zinc-800 text-white'
          } border border-zinc-800 rounded-md px-3 py-1 transition-colors font-medium`}
          style={{ fontSize: `${responsive.fontSize.small}px` }}
        >
          <span className="text-xs whitespace-nowrap">
            {showAllAppointments ? 'Calendar View' : 'All Appointments'}
          </span>
        </button>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onPrevious}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md px-2 py-1 transition-colors flex items-center gap-1"
            style={{ fontSize: `${responsive.fontSize.small}px` }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {!isMobile && <span className="text-xs">Prev</span>}
          </button>

          {/* Clickable Date Range */}
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md px-3 py-1 transition-colors"
            style={{ fontSize: `${responsive.fontSize.small}px` }}
          >
            <span className="font-medium text-white whitespace-nowrap text-xs">
              {isMobile
                ? `${formatDateLong(weekStart).split(',')[0]} - ${formatDateLong(weekEnd).split(',')[0]}`
                : `${formatDateLong(weekStart)} - ${formatDateLong(weekEnd)}`}
            </span>
          </button>

          <button
            onClick={onNext}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md px-2 py-1 transition-colors flex items-center gap-1"
            style={{ fontSize: `${responsive.fontSize.small}px` }}
          >
            {!isMobile && <span className="text-xs">Next</span>}
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        currentWeekStart={currentWeekStart}
        onDateSelect={handleDateSelect}
      />
    </>
  );
}
