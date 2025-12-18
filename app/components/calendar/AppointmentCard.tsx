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

  const statusColors = {
    confirmed: 'bg-green-500/10 border-green-400 text-green-400',
    pending: 'bg-orange-500/10 border-orange-400 text-orange-400',
    cancelled: 'bg-red-500/10 border-red-400 text-red-400',
  };

  const isMobile = responsive.device.isMobile;
  const minHeight = Math.max(position.height, 30);

  return (
    <div
      className={`
        absolute left-1 right-1 rounded border-l-4 overflow-hidden
        cursor-pointer transition-all hover:shadow-lg hover:z-10
        ${statusColors[appointment.status]}
      `}
      style={{
        top: `${position.top}px`,
        height: `${minHeight}px`,
        padding: isMobile ? '4px' : '8px',
      }}
      onClick={onClick}
    >
      <div
        className="font-semibold truncate text-white"
        style={{ fontSize: `${responsive.fontSize.small}px` }}
      >
        {appointment.clientName}
      </div>

      {!isMobile && position.height > 40 && (
        <div
          className="text-zinc-400 truncate"
          style={{ fontSize: `${responsive.fontSize.caption}px` }}
        >
          {appointment.staffName}
        </div>
      )}

      <div
        className="text-zinc-300 truncate"
        style={{ fontSize: `${responsive.fontSize.caption}px` }}
      >
        {appointment.service}
      </div>

      {position.height > 60 && (
        <div
          className="text-zinc-400 mt-1"
          style={{ fontSize: `${responsive.fontSize.caption}px` }}
        >
          {appointment.time} • {appointment.duration}min
        </div>
      )}
    </div>
  );
}
