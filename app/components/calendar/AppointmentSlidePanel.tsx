'use client';

import React, { useState, useEffect } from 'react';
import { useScreenSize, getResponsiveValues } from '@/app/hooks/useScreenSize';
import { Appointment, formatDateToString } from '@/app/utils/calendarUtils';
import { apiGet, apiPost, apiPut } from '@/app/utils/api';
import Input from '../Input';
import SearchableSelect from '../SearchableSelect';

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

interface AppointmentResponse {
  _id: string;
  customerId: string;
  staffId: string;
  serviceIds: string[];
  appointmentDate: string;
  status: string;
  notes?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginatedClientResponse {
  success: boolean;
  count: number;
  pagination: PaginationInfo;
  data: Client[];
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
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');

  // Fetch clients, staff, and services from API
  useEffect(() => {
    const fetchData = async () => {
      setLoadingClients(true);

      setLoadingClients(true);

      try {
        // Fetch staff and services first
        const [staffRes, servicesRes] = await Promise.all([
          apiGet<Staff[]>('/staff'),
          apiGet<Service[]>('/services')
        ]);

        if (staffRes.success && staffRes.data) {
          setStaff(staffRes.data);
        }
        if (servicesRes.success && servicesRes.data) {
          setServices(servicesRes.data);
        }

        // Fetch clients with pagination handling
        let allClients: Client[] = [];
        let currentPage = 1;
        const limit = 100; // Use a reasonable limit
        
        // Initial fetch
        const initialRes = await apiGet<Client[]>(`/customers?page=${currentPage}&limit=${limit}`);
        
        if (initialRes.success && initialRes.data) {
          allClients = [...initialRes.data];
          
          // Check if we need to fetch more pages
          // Cast to unknown first then to custom interface because apiGet returns generic ApiResponse
          const paginatedRes = initialRes as unknown as PaginatedClientResponse;
          
          if (paginatedRes.pagination && paginatedRes.pagination.totalPages > 1) {
            const totalPages = paginatedRes.pagination.totalPages;
            const promises = [];
            
            for (let page = 2; page <= totalPages; page++) {
              promises.push(apiGet<Client[]>(`/customers?page=${page}&limit=${limit}`));
            }
            
            const results = await Promise.all(promises);
            results.forEach(res => {
              if (res.success && res.data) {
                allClients = [...allClients, ...res.data];
              }
            });
          }
        }
        
        // Remove duplicates just in case
        const uniqueClients = Array.from(new Map(allClients.map(c => [c._id, c])).values());
        setClients(uniqueClients);

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoadingClients(false);
      }
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
        status: 'confirmed' as 'confirmed' | 'pending' | 'cancelled' | 'in_progress' | 'completed',
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
      status: 'confirmed' as 'confirmed' | 'pending' | 'cancelled' | 'in_progress' | 'completed',
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());

  // Update form data when props change
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setError(null);
      setSubmitting(false);

      // If editing an existing appointment, find and set the IDs
      if (appointment) {
        // Pre-fill notes
        setNotes(appointment.notes || '');

        // Find client ID by matching name and phone
        const matchingClient = clients.find(
          (c) => c.name === appointment.clientName && c.phoneNumber === appointment.phone
        );
        if (matchingClient) {
          setSelectedClientId(matchingClient._id);
        } else {
          setSelectedClientId('');
        }

        // Find staff ID by matching name
        const matchingStaff = staff.find((s) => s.name === appointment.staffName);
        if (matchingStaff) {
          setSelectedStaffIdState(matchingStaff._id);
        } else {
          setSelectedStaffIdState('');
        }

        // Find service IDs by matching names (appointment.service could be comma-separated)
        const serviceNames = appointment.service.split(',').map(s => s.trim());
        const matchingServices = services.filter((s) =>
          serviceNames.includes(s.name)
        );
        if (matchingServices.length > 0) {
          setSelectedServiceIds(matchingServices.map(s => s._id));
        } else {
          setSelectedServiceIds([]);
        }
      } else {
        // Creating new appointment
        setNotes('');
        setSelectedClientId('');
        setSelectedStaffIdState(selectedStaffId || '');
        setSelectedServiceIds([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedStaffId, appointment, clients, staff, services]);

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

  // Handle service toggle (add/remove from selection)
  const handleServiceToggle = (serviceId: string) => {
    let newSelectedIds: string[];

    if (selectedServiceIds.includes(serviceId)) {
      // Remove service
      newSelectedIds = selectedServiceIds.filter(id => id !== serviceId);
    } else {
      // Add service
      newSelectedIds = [...selectedServiceIds, serviceId];
    }

    setSelectedServiceIds(newSelectedIds);

    // Calculate total duration and price from all selected services
    const selectedServices = services.filter(s => newSelectedIds.includes(s._id));
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const serviceNames = selectedServices.map(s => s.name).join(', ');

    setFormData({
      ...formData,
      service: serviceNames || '',
      duration: totalDuration > 0 ? totalDuration.toString() : '60',
      price: totalPrice > 0 ? totalPrice.toString() : '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate required fields
      if (!selectedClientId) {
        setError('Please select a client');
        setSubmitting(false);
        return;
      }
      if (!selectedStaffIdState) {
        setError('Please select a staff member');
        setSubmitting(false);
        return;
      }
      if (selectedServiceIds.length === 0) {
        setError('Please select at least one service');
        setSubmitting(false);
        return;
      }

      // Convert 12-hour time to 24-hour format
      const convertTo24Hour = (time12h: string): string => {
        const [time, modifier] = time12h.split(' ');
        const [hoursStr, minutes] = time.split(':');
        let hours = hoursStr;

        if (hours === '12') {
          hours = modifier === 'AM' ? '00' : '12';
        } else {
          hours = modifier === 'PM' ? String(parseInt(hours, 10) + 12) : hours;
        }

        return `${hours.padStart(2, '0')}:${minutes}`;
      };

      // Combine date and time into ISO format
      const time24h = convertTo24Hour(formData.time);
      const appointmentDateTime = new Date(`${formData.date}T${time24h}`).toISOString();

      // Prepare data for backend API
      const appointmentData = {
        customerId: selectedClientId,
        staffId: selectedStaffIdState,
        serviceIds: selectedServiceIds,
        appointmentDate: appointmentDateTime,
        status: formData.status.toUpperCase(),
        notes: notes || undefined,
        price: parseFloat(formData.price),
      };

      // Check if we're editing an existing appointment or creating a new one
      const isEditing = appointment && appointment._id;

      let response;
      if (isEditing) {
        console.log('Updating appointment with data:', appointmentData);
        // Update existing appointment via API
        response = await apiPut<AppointmentResponse>(`/appointments/${appointment._id}`, appointmentData);
        console.log('Appointment update response:', response);
      } else {
        console.log('Creating appointment with data:', appointmentData);
        // Create new appointment via API
        response = await apiPost<AppointmentResponse>('/appointments', appointmentData);
        console.log('Appointment creation response:', response);
      }

      if (response.success) {
        // Create local appointment object for UI update
        const updatedAppointment: Appointment = {
          id: appointment?.id || Date.now(),
          _id: appointment?._id || (response.data as AppointmentResponse)?._id,
          clientName: formData.clientName,
          phone: formData.phone,
          staffName: formData.staffName,
          service: formData.service,
          date: formData.date,
          time: formData.time,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price),
          status: formData.status,
          notes: notes,
        };

        onSave(updatedAppointment);
      } else {
        setError(response.message || `Failed to ${isEditing ? 'update' : 'create'} appointment`);
        setSubmitting(false);
      }
    } catch (err) {
      const isEditing = appointment && appointment._id;
      const errorMessage = err instanceof Error ? err.message : `An error occurred while ${isEditing ? 'updating' : 'creating'} the appointment`;
      setError(errorMessage);
      setSubmitting(false);
      console.error(`Appointment ${isEditing ? 'update' : 'creation'} error:`, err);
    }
  };
  
  // Generate WhatsApp Link
  const handleWhatsAppShare = () => {
    if (!formData.phone) return;
    
    // Clean phone number (remove non-digits)
    const cleanPhone = formData.phone.replace(/\D/g, '');
    
    // Add country code if not present (assuming Sri Lanka +94)
    let whatsappNumber = cleanPhone;
    if (!cleanPhone.startsWith('94') && cleanPhone.length === 10) {
      whatsappNumber = '94' + cleanPhone.substring(1); // Remove leading 0 and add country code
    }
    
    // Format Date nicely
    const dateObj = new Date(formData.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const message = `
📅 *Appointment Confirmation - Lush & Co*

Hello ${formData.clientName},

Your appointment is confirmed!

📋 Details:
• Date: ${formattedDate}
• Time: ${formData.time}
• Service: ${formData.service}
• Duration: ${formData.duration} minutes
• Staff: ${formData.staffName}

💰 Price: LKR ${parseFloat(formData.price).toLocaleString()}

📍 Location: Lush & Co Salon

See you soon! ✨
`.trim();

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
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
            <div className="relative">
              <SearchableSelect
                label="Client"
                required={true}
                placeholder="Select client"
                options={clients.map(c => ({
                  value: c._id,
                  label: c.name,
                  subtext: c.phoneNumber
                }))}
                value={selectedClientId}
                onChange={handleClientSelect}
                disabled={loadingClients}
              />
            </div>
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
              Services <span className="text-red-400 ml-1">*</span>
              <span className="text-zinc-500 ml-2 text-xs">(Select multiple)</span>
            </label>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 max-h-48 overflow-y-auto">
              {services.length === 0 ? (
                <p className="text-zinc-500 text-sm">No services available</p>
              ) : (
                <div className="space-y-2">
                  {services.map((service) => (
                    <label
                      key={service._id}
                      className="flex items-start gap-3 p-2 rounded hover:bg-zinc-700/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(service._id)}
                        onChange={() => handleServiceToggle(service._id)}
                        className="mt-1 w-4 h-4 rounded border-zinc-600 bg-zinc-900 text-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                      />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{service.name}</div>
                        <div className="text-zinc-400 text-xs">
                          LKR {service.price} • {service.duration} min
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {selectedServiceIds.length > 0 && (
              <div className="text-xs text-zinc-400 mt-1">
                {selectedServiceIds.length} service{selectedServiceIds.length > 1 ? 's' : ''} selected
              </div>
            )}
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

          <Input
            label="Price (LKR)"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            placeholder="Select a service to see price"
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
                  status: e.target.value as 'confirmed' | 'pending' | 'cancelled' | 'in_progress' | 'completed',
                })
              }
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-[0.875rem] px-[1rem] text-white text-[clamp(0.875rem,1.5vw,1rem)] focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20stroke%3D%22%23a1a1aa%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              style={{
                colorScheme: 'dark'
              }}
            >
              <option value="pending" className="bg-zinc-900 text-orange-400 py-2">Pending</option>
              <option value="confirmed" className="bg-zinc-900 text-green-400 py-2">Confirmed</option>
              <option value="in_progress" className="bg-zinc-900 text-blue-400 py-2">In Progress</option>
              <option value="completed" className="bg-zinc-900 text-purple-400 py-2">Completed</option>
              <option value="cancelled" className="bg-zinc-900 text-red-400 py-2">Cancelled</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-zinc-300 text-sm font-medium">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special notes or requests..."
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-[0.875rem] px-[1rem] text-white text-[clamp(0.875rem,1.5vw,1rem)] focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all resize-none"
              style={{
                colorScheme: 'dark'
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3" style={{ marginTop: `${spacing}px` }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                appointment ? 'Save Changes' : 'Create Appointment'
              )}
            </button>
            </div>
            
            {/* WhatsApp Share Button */}
            {formData.phone && (
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold rounded-lg py-3 transition-colors flex items-center justify-center gap-2"
                style={{ fontSize: `${responsive.fontSize.body}px` }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Share via WhatsApp
              </button>
            )}
        </form>
      </div>
    </>
  );
}
