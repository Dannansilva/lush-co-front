'use client';

import React, { useState } from 'react';
import { useScreenSize, getResponsiveValues } from '@/app/hooks/useScreenSize';
import { getWeekStart } from '@/app/utils/calendarUtils';

interface DateNavigatorProps {
  currentWeekStart: Date;
  onDateSelect: (date: Date) => void;
}

export default function DateNavigator({
  currentWeekStart,
  onDateSelect,
}: DateNavigatorProps) {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  // Get the current month view
  const [viewDate, setViewDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.
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
    calendarDays.push(<div key={`empty-${i}`} className="h-8" />);
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
          h-8 flex items-center justify-center rounded transition-colors
          ${today ? 'bg-yellow-400 text-black font-bold' : ''}
          ${inWeek && !today ? 'bg-zinc-700 text-white' : ''}
          ${!today && !inWeek ? 'text-zinc-400 hover:bg-zinc-800' : ''}
        `}
        style={{ fontSize: `${responsive.fontSize.small}px` }}
      >
        {day}
      </button>
    );
  }

  const spacing = Math.max(12, Math.min(width * 0.02, 16));

  return (
    <div
      className="bg-zinc-900 border border-zinc-800 rounded-lg"
      style={{ padding: `${spacing}px` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-semibold text-white"
          style={{ fontSize: `${responsive.fontSize.body}px` }}
        >
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={handlePreviousMonth}
            className="p-1 hover:bg-zinc-800 rounded transition-colors"
          >
            <svg
              width="16"
              height="16"
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
            className="p-1 hover:bg-zinc-800 rounded transition-colors"
          >
            <svg
              width="16"
              height="16"
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

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="h-6 flex items-center justify-center text-zinc-500 font-medium"
            style={{ fontSize: `${responsive.fontSize.caption}px` }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-zinc-800">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded" />
            <span
              className="text-zinc-400"
              style={{ fontSize: `${responsive.fontSize.caption}px` }}
            >
              Today
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-zinc-700 rounded" />
            <span
              className="text-zinc-400"
              style={{ fontSize: `${responsive.fontSize.caption}px` }}
            >
              Current Week
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
