'use client';

import React from 'react';
import { useScreenSize, getResponsiveValues } from '@/app/hooks/useScreenSize';
import {
  formatDate,
  Appointment,
  CALENDAR_START_HOUR,
  TOTAL_HOURS,
} from '@/app/utils/calendarUtils';
import TimeColumn from './TimeColumn';
import StaffColumn from './StaffColumn';

interface StaffMember {
  _id: string;
  name: string;
  phoneNumber: string;
}

interface StaffCalendarGridProps {
  selectedDate: Date;
  staffMembers: StaffMember[];
  appointments: Appointment[];
  onCellClick: (staffId: string, staffName: string, date: Date, hour: number, minutes: number) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export default function StaffCalendarGrid({
  selectedDate,
  staffMembers,
  appointments,
  onCellClick,
  onAppointmentClick,
}: StaffCalendarGridProps) {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  const hours = Array.from(
    { length: TOTAL_HOURS },
    (_, i) => CALENDAR_START_HOUR + i
  );

  // Calculate responsive dimensions
  const timeColumnWidth = responsive.device.isMobile ? 50 : 80;
  const staffCount = staffMembers.length || 1;

  // Larger hour cell height for better visibility
  // Each hour cell should be 80-100px for comfortable viewing
  const hourCellHeight = responsive.device.isMobile ? 80 : 100;

  // Create equal-width columns using 1fr for each staff member
  const staffColumns = Array(staffCount).fill('1fr').join(' ');

  return (
    <div className="flex-1 overflow-auto">
      <div
        className="grid bg-zinc-800 rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `${timeColumnWidth}px ${staffColumns}`,
          gridTemplateRows: `60px repeat(${TOTAL_HOURS}, ${hourCellHeight}px)`,
          gap: '1px',
          width: '100%',
        }}
      >
        {/* Header row */}
        <div className="bg-zinc-900 border-b border-zinc-800 flex items-center justify-center">
          <div
            className="text-zinc-400 font-semibold"
            style={{ fontSize: `${responsive.fontSize.small}px` }}
          >
            {formatDate(selectedDate)}
          </div>
        </div>
        {staffMembers.map((staff) => (
          <div
            key={staff._id}
            className="bg-zinc-900 border-b border-zinc-800 flex flex-col items-center justify-center"
            style={{ padding: `${responsive.spacing.gap}px` }}
          >
            <div
              className="font-semibold text-white text-center"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              {staff.name}
            </div>
            <div
              className="text-zinc-400 text-center"
              style={{ fontSize: `${responsive.fontSize.small}px` }}
            >
              {staff.phoneNumber}
            </div>
          </div>
        ))}

        {/* Time grid */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <TimeColumn hour={hour} />
            {staffMembers.map((staff) => (
              <StaffColumn
                key={`${staff._id}-${hour}`}
                staffId={staff._id}
                staffName={staff.name}
                date={selectedDate}
                hour={hour}
                appointments={appointments}
                cellHeight={hourCellHeight}
                onClick={(staffId, staffName, minutes) =>
                  onCellClick(staffId, staffName, selectedDate, hour, minutes)
                }
                onAppointmentClick={onAppointmentClick}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
