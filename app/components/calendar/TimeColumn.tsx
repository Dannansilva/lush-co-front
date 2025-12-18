'use client';

import React from 'react';
import { useScreenSize, getResponsiveValues } from '@/app/hooks/useScreenSize';
import { formatTime, formatTimeShort } from '@/app/utils/calendarUtils';

interface TimeColumnProps {
  hour: number;
}

export default function TimeColumn({ hour }: TimeColumnProps) {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  const isMobile = responsive.device.isMobile;
  const timeLabel = isMobile ? formatTimeShort(hour) : formatTime(hour);

  return (
    <div
      className="bg-zinc-900 flex items-start justify-center border-zinc-800 text-zinc-400 pt-1"
      style={{
        fontSize: `${responsive.fontSize.small}px`,
      }}
    >
      {timeLabel}
    </div>
  );
}
