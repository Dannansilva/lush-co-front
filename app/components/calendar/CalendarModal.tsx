'use client';

import React, { useState } from 'react';
import { useScreenSize, getResponsiveValues } from '@/app/hooks/useScreenSize';
import { getWeekStart } from '@/app/utils/calendarUtils';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeekStart: Date;
  onDateSelect: (weekStart: Date) => void;
}

export default function CalendarModal({
  isOpen,
  onClose,
  currentWeekStart,
  onDateSelect,
}: CalendarModalProps) {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  const [viewDate, setViewDate] = useState(new Date());

  if (!isOpen) return null;

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Adjust first day to make Monday = 0
  const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handlePreviousMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(year, month, day);
    const weekStart = getWeekStart(selectedDate);
    onDateSelect(weekStart);
    onClose();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isInCurrentWeek = (day: number) => {
    const date = new Date(year, month, day);
    const weekStart = getWeekStart(date);
    return weekStart.getTime() === currentWeekStart.getTime();
  };

  // Generate calendar days
  const calendarDays = [];

  // Empty cells before first day
  for (let i = 0; i < firstDayAdjusted; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-12" />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const today = isToday(day);
    const inWeek = isInCurrentWeek(day);

    calendarDays.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={`
          h-12 flex items-center justify-center rounded-lg transition-colors font-medium
          ${today ? 'bg-yellow-400 text-black font-bold' : ''}
          ${inWeek && !today ? 'bg-zinc-700 text-white' : ''}
          ${!today && !inWeek ? 'text-zinc-300 hover:bg-zinc-700' : ''}
        `}
        style={{ fontSize: `${responsive.fontSize.body}px` }}
      >
        {day}
      </button>
    );
  }

  const spacing = Math.max(16, Math.min(width * 0.02, 24));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl"
          style={{
            padding: `${spacing * 1.5}px`,
            width: responsive.device.isMobile ? '90%' : 'min(500px, 90vw)',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2
              className="font-bold text-white"
              style={{ fontSize: `${responsive.fontSize.heading}px` }}
            >
              {monthNames[month]} {year}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-white"
              >
                <svg
                  width="20"
                  height="20"
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
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-white"
              >
                <svg
                  width="20"
                  height="20"
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
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {dayNames.map((day) => (
              <div
                key={day}
                className="h-8 flex items-center justify-center text-zinc-500 font-semibold"
                style={{ fontSize: `${responsive.fontSize.small}px` }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-400 rounded" />
                <span
                  className="text-zinc-300"
                  style={{ fontSize: `${responsive.fontSize.small}px` }}
                >
                  Today
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-zinc-700 rounded" />
                <span
                  className="text-zinc-300"
                  style={{ fontSize: `${responsive.fontSize.small}px` }}
                >
                  Current Week
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
