'use client';

import React, { useState, useEffect } from 'react';
import { useScreenSize, getResponsiveValues } from '@/app/hooks/useScreenSize';
import { Appointment, formatDateToString } from '@/app/utils/calendarUtils';
import Input from '../Input';

interface AppointmentSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  selectedDate?: Date;
  selectedTime?: string;
  onSave: (appointment: Appointment) => void;
}

export default function AppointmentSlidePanel({
  isOpen,
  onClose,
  appointment,
  selectedDate,
  selectedTime,
  onSave,
}: AppointmentSlidePanelProps) {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  // Initialize form data based on props (not in effect)
  const getInitialFormData = () => {
    if (appointment) {
      return {
        clientName: appointment.clientName,
        phone: appointment.phone,
        staffName: appointment.staffName,
        service: appointment.service,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration.toString(),
        price: appointment.price.toString(),
        status: appointment.status,
      };
    } else if (selectedDate && selectedTime) {
      return {
        clientName: '',
        phone: '',
        staffName: '',
        service: '',
        date: formatDateToString(selectedDate),
        time: selectedTime,
        duration: '60',
        price: '',
        status: 'confirmed' as 'confirmed' | 'pending' | 'cancelled',
      };
    }
    return {
      clientName: '',
      phone: '',
      staffName: '',
      service: '',
      date: '',
      time: '',
      duration: '60',
      price: '',
      status: 'confirmed' as 'confirmed' | 'pending' | 'cancelled',
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());

  // Update form data when props change
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAppointment: Appointment = {
      id: appointment?.id || Date.now(), // Use existing ID or generate new one
      clientName: formData.clientName,
      phone: formData.phone,
      staffName: formData.staffName,
      service: formData.service,
      date: formData.date,
      time: formData.time,
      duration: parseInt(formData.duration),
      price: parseFloat(formData.price),
      status: formData.status,
    };

    onSave(newAppointment);
  };

  // Calculate responsive width
  const panelWidth = responsive.device.isMobile
    ? '100%'
    : responsive.device.isTablet
    ? '80%'
    : Math.min(500, width * 0.4);

  const spacing = Math.max(12, Math.min(width * 0.02, 16));

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full bg-zinc-900 border-l border-zinc-800
          z-50 transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{
          width: panelWidth,
          padding: `${responsive.padding.vertical}px ${responsive.padding.horizontal}px`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: `${spacing * 2}px` }}
        >
          <h2
            className="font-bold text-white"
            style={{ fontSize: `${responsive.fontSize.heading}px` }}
          >
            {appointment ? 'Edit Appointment' : 'New Appointment'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg
              width="24"
              height="24"
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: `${spacing}px` }}>
          <Input
            label="Client Name"
            type="text"
            placeholder="Enter client name"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            required
          />

          <Input
            label="Phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <div className="flex flex-col gap-2">
            <label className="text-zinc-300 text-sm font-medium">
              Staff <span className="text-red-400 ml-1">*</span>
            </label>
            <select
              value={formData.staffName}
              onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
              required
              className="w-full bg-zinc-900/30 border border-zinc-700/50 rounded-lg py-[0.875rem] px-[1rem] text-white text-[clamp(0.875rem,1.5vw,1rem)] focus:outline-none focus:border-yellow-500 transition-colors"
            >
              <option value="">Select staff</option>
              <option value="Emma Wilson">Emma Wilson</option>
              <option value="Mia Rodriguez">Mia Rodriguez</option>
              <option value="Olivia Kim">Olivia Kim</option>
              <option value="Sophia Lee">Sophia Lee</option>
              <option value="Isabella Chen">Isabella Chen</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-zinc-300 text-sm font-medium">
              Service <span className="text-red-400 ml-1">*</span>
            </label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              required
              className="w-full bg-zinc-900/30 border border-zinc-700/50 rounded-lg py-[0.875rem] px-[1rem] text-white text-[clamp(0.875rem,1.5vw,1rem)] focus:outline-none focus:border-yellow-500 transition-colors"
            >
              <option value="">Select service</option>
              <option value="Balayage + Cut">Balayage + Cut</option>
              <option value="Bridal Styling">Bridal Styling</option>
              <option value="Full Color">Full Color</option>
              <option value="Precision Cut">Precision Cut</option>
              <option value="Gel Manicure">Gel Manicure</option>
              <option value="Blowout">Blowout</option>
              <option value="Hair Treatment">Hair Treatment</option>
            </select>
          </div>

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <div className="flex flex-col gap-2">
            <label className="text-zinc-300 text-sm font-medium">
              Time <span className="text-red-400 ml-1">*</span>
            </label>
            <div className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-lg py-[0.875rem] px-[1rem] text-zinc-400 text-[clamp(0.875rem,1.5vw,1rem)]">
              {formData.time}
            </div>
          </div>

          <Input
            label="Duration (minutes)"
            type="number"
            placeholder="60"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            required
          />

          <Input
            label="Price"
            type="number"
            placeholder="85"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />

          <div className="flex flex-col gap-2">
            <label className="text-zinc-300 text-sm font-medium">
              Status <span className="text-red-400 ml-1">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'confirmed' | 'pending' | 'cancelled',
                })
              }
              required
              className="w-full bg-zinc-900/30 border border-zinc-700/50 rounded-lg py-[0.875rem] px-[1rem] text-white text-[clamp(0.875rem,1.5vw,1rem)] focus:outline-none focus:border-yellow-500 transition-colors"
            >
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3" style={{ marginTop: `${spacing}px` }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-3 transition-colors"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg py-3 transition-colors"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              {appointment ? 'Save Changes' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
