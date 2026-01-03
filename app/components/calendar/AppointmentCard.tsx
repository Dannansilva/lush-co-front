'use client';

import React from 'react';
import { useScreenSize, getResponsiveValues } from '@/app/hooks/useScreenSize';
import { Appointment } from '@/app/utils/calendarUtils';

interface AppointmentCardProps {
  appointment: Appointment;
  position: { top: number; height: number };
  onClick: (e: React.MouseEvent) => void;
}

export default function AppointmentCard({
  appointment,
  position,
  onClick,
}: AppointmentCardProps) {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  const statusStyles = {
    confirmed: {
      bg: 'bg-yellow-500',
      border: 'border-yellow-400',
      text: 'text-black',
    },
    pending: {
      bg: 'bg-orange-600',
      border: 'border-orange-500',
      text: 'text-white',
    },
    cancelled: {
      bg: 'bg-red-600',
      border: 'border-red-500',
      text: 'text-white',
    },
  };

  const style = statusStyles[appointment.status];
  const isMobile = responsive.device.isMobile;
  const minHeight = Math.max(position.height, 30);

  return (
    <div
      className={`
        absolute left-1 right-1 rounded-lg border-l-4 overflow-hidden
        cursor-pointer transition-all hover:shadow-lg z-20 flex items-center justify-center
        ${style.bg} ${style.border} ${style.text}
      `}
      style={{
        top: `${position.top}px`,
        height: `${minHeight}px`,
        padding: isMobile ? '6px 8px' : '8px 12px',
      }}
      onClick={onClick}
    >
      <div className="flex flex-col gap-1 w-full">
        <div
          className="font-bold truncate text-center"
          style={{ fontSize: `${responsive.fontSize.body}px` }}
        >
          {appointment.clientName}
        </div>

        {position.height > 40 && (
          <div
            className="truncate opacity-90 text-center"
            style={{ fontSize: `${responsive.fontSize.small}px` }}
          >
            {appointment.service}
          </div>
        )}

        {position.height > 60 && (
          <div
            className="flex items-center justify-center gap-1 opacity-80"
            style={{ fontSize: `${responsive.fontSize.caption}px` }}
          >
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="truncate">{appointment.staffName}</span>
          </div>
        )}

        {position.height > 80 && (
          <div
            className="flex items-center justify-center gap-1 opacity-80"
            style={{ fontSize: `${responsive.fontSize.caption}px` }}
          >
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{appointment.time} • {appointment.duration}min</span>
          </div>
        )}
      </div>
    </div>
  );
}
