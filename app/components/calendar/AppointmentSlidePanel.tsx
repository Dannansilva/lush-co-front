'use client';

import React, { useState, useEffect } from 'react';
import { useScreenSize, getResponsiveValues } from '@/app/hooks/useScreenSize';
import { Appointment, formatDateToString } from '@/app/utils/calendarUtils';
import { apiGet } from '@/app/utils/api';
import Input from '../Input';

interface Client {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address?: string;
  notes?: string;
}

interface Staff {
  _id: string;
  name: string;
  phoneNumber: string;
}

interface Service {
  _id: string;
  name: string;
  duration: number;
  price: number;
}

interface AppointmentSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  selectedDate?: Date;
  selectedTime?: string;
  selectedStaffId?: string;
  selectedStaffName?: string;
  onSave: (appointment: Appointment) => void;
}

export default function AppointmentSlidePanel({
  isOpen,
  onClose,
  appointment,
  selectedDate,
  selectedTime,
  selectedStaffId,
  selectedStaffName,
  onSave,
}: AppointmentSlidePanelProps) {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  const [clients, setClients] = useState<Client[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedStaffIdState, setSelectedStaffIdState] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  // Fetch clients, staff, and services from API
  useEffect(() => {
    const fetchData = async () => {
      setLoadingClients(true);

      const [clientsRes, staffRes, servicesRes] = await Promise.all([
        apiGet<Client[]>('/customers'),
        apiGet<Staff[]>('/staff'),
        apiGet<Service[]>('/services')
      ]);

      if (clientsRes.success && clientsRes.data) {
        setClients(clientsRes.data);
      }
      if (staffRes.success && staffRes.data) {
        setStaff(staffRes.data);
      }
      if (servicesRes.success && servicesRes.data) {
        setServices(servicesRes.data);
      }

      setLoadingClients(false);
    };
    fetchData();
  }, []);

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
        staffName: selectedStaffName || '',
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
      setSelectedClientId('');
      setSelectedStaffIdState(selectedStaffId || '');
      setSelectedServiceId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedStaffId]);

  // Handle client selection
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const selectedClient = clients.find(c => c._id === clientId);
    if (selectedClient) {
      setFormData({
        ...formData,
        clientName: selectedClient.name,
        phone: selectedClient.phoneNumber,
      });
    } else {
      setFormData({
        ...formData,
        clientName: '',
        phone: '',
      });
    }
  };

  // Handle staff selection
  const handleStaffSelect = (staffId: string) => {
    setSelectedStaffIdState(staffId);
    const selectedStaff = staff.find(s => s._id === staffId);
    if (selectedStaff) {
      setFormData({
        ...formData,
        staffName: selectedStaff.name,
      });
    } else {
      setFormData({
        ...formData,
        staffName: '',
      });
    }
  };

  // Handle service selection
  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const selectedService = services.find(s => s._id === serviceId);
    if (selectedService) {
      setFormData({
        ...formData,
        service: selectedService.name,
        duration: selectedService.duration.toString(),
        price: selectedService.price.toString(),
      });
    } else {
      setFormData({
        ...formData,
        service: '',
        duration: '60',
        price: '',
      });
    }
  };

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
          <div className="flex flex-col gap-2">
            <label className="text-zinc-300 text-sm font-medium">
              Client <span className="text-red-400 ml-1">*</span>
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => handleClientSelect(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-[0.875rem] px-[1rem] text-white text-[clamp(0.875rem,1.5vw,1rem)] focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20stroke%3D%22%23a1a1aa%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              style={{
                colorScheme: 'dark'
              }}
            >
              <option value="" className="bg-zinc-900 text-zinc-400">Select client</option>
              {loadingClients ? (
                <option disabled className="bg-zinc-900 text-zinc-500">Loading clients...</option>
              ) : (
                clients.map((client) => (
                  <option key={client._id} value={client._id} className="bg-zinc-900 text-white py-2">
                    {client.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-zinc-300 text-sm font-medium">
              Phone <span className="text-red-400 ml-1">*</span>
            </label>
            <div className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-lg py-[0.875rem] px-[1rem] text-zinc-400 text-[clamp(0.875rem,1.5vw,1rem)]">
              {formData.phone || 'Select a client to see phone number'}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-zinc-300 text-sm font-medium">
              Staff <span className="text-red-400 ml-1">*</span>
            </label>
            <select
              value={selectedStaffIdState}
              onChange={(e) => handleStaffSelect(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-[0.875rem] px-[1rem] text-white text-[clamp(0.875rem,1.5vw,1rem)] focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20stroke%3D%22%23a1a1aa%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              style={{
                colorScheme: 'dark'
              }}
            >
              <option value="" className="bg-zinc-900 text-zinc-400">Select staff</option>
              {staff.map((staffMember) => (
                <option key={staffMember._id} value={staffMember._id} className="bg-zinc-900 text-white py-2">
                  {staffMember.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-zinc-300 text-sm font-medium">
              Service <span className="text-red-400 ml-1">*</span>
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => handleServiceSelect(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-[0.875rem] px-[1rem] text-white text-[clamp(0.875rem,1.5vw,1rem)] focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20stroke%3D%22%23a1a1aa%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              style={{
                colorScheme: 'dark'
              }}
            >
              <option value="" className="bg-zinc-900 text-zinc-400">Select service</option>
              {services.map((service) => (
                <option key={service._id} value={service._id} className="bg-zinc-900 text-white py-2">
                  {service.name} - LKR {service.price} ({service.duration} min)
                </option>
              ))}
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

          <div className="flex flex-col gap-2">
            <label className="text-zinc-300 text-sm font-medium">
              Duration (minutes) <span className="text-red-400 ml-1">*</span>
            </label>
            <div className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-lg py-[0.875rem] px-[1rem] text-zinc-400 text-[clamp(0.875rem,1.5vw,1rem)]">
              {formData.duration || 'Select a service to see duration'}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-zinc-300 text-sm font-medium">
              Price (LKR) <span className="text-red-400 ml-1">*</span>
            </label>
            <div className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-lg py-[0.875rem] px-[1rem] text-zinc-400 text-[clamp(0.875rem,1.5vw,1rem)]">
              {formData.price ? `LKR ${formData.price}` : 'Select a service to see price'}
            </div>
          </div>

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
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-[0.875rem] px-[1rem] text-white text-[clamp(0.875rem,1.5vw,1rem)] focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20stroke%3D%22%23a1a1aa%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              style={{
                colorScheme: 'dark'
              }}
            >
              <option value="confirmed" className="bg-zinc-900 text-green-400 py-2">Confirmed</option>
              <option value="pending" className="bg-zinc-900 text-orange-400 py-2">Pending</option>
              <option value="cancelled" className="bg-zinc-900 text-red-400 py-2">Cancelled</option>
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
