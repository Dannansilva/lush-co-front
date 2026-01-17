"use client";

import React, { useState, useEffect } from "react";
import { useScreenSize, getResponsiveValues } from "@/app/hooks/useScreenSize";
import { apiGet, apiPost, apiPut, apiDelete } from "@/app/utils/api";
import UserProfile from "@/app/components/UserProfile";
import { Appointment } from "@/app/utils/calendarUtils";
import { useSearch } from "@/app/context/SearchContext";

// Backend API response interface (matches your Postman API)
interface ClientApi {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address?: string;
  notes?: string;
  totalAppointments: number;
  createdAt: string;
  __v?: number;
}

// Pagination response interface
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginatedResponse {
  success: boolean;
  count: number;
  pagination: PaginationInfo;
  data: ClientApi[];
}

// Frontend display interface with computed stats
interface Client extends ClientApi {
  lastVisit?: string;
  upcomingAppointments?: number;
  totalRevenue?: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  cardPadding: number;
  spacing: number;
  responsiveFontSize: { heading: number; small: number };
}

function Modal({ isOpen, onClose, title, children, cardPadding, spacing, responsiveFontSize }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60" onClick={onClose}></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-md"
          style={{ padding: `${cardPadding * 2}px` }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: `${spacing * 1.5}px` }}>
            <div>
              <h2 className="font-bold" style={{ fontSize: `${responsiveFontSize.heading}px` }}>{title}</h2>
              <p className="text-zinc-400" style={{ fontSize: `${responsiveFontSize.small}px` }}>
                Fill in the details for the {title.toLowerCase().includes('edit') ? 'client' : 'new client'}.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);
  const { searchQuery } = useSearch();

  const cardPadding = Math.max(12, Math.min(width * 0.015, 20));
  const spacing = Math.max(12, Math.min(width * 0.02, 16));

  const isMobile = width < 768;

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const itemsPerPage = 10;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Mock appointments for stats calculation (replace with actual API call)
  const [appointments] = useState<Appointment[]>([
    {
      id: 1,
      clientName: "Jennifer Adams",
      staffName: "Emma Wilson",
      service: "Balayage + Cut",
      date: "2025-12-16",
      time: "9:00 AM",
      duration: 120,
      price: 285,
      status: "confirmed",
      phone: "(555) 123-4567"
    },
  ]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
    notes: ""
  });

  // Calculate client stats from appointments
  const calculateClientStats = (client: ClientApi, appointments: Appointment[]): Client => {
    const clientAppointments = appointments.filter(apt =>
      apt.clientName.toLowerCase() === client.name.toLowerCase() &&
      apt.phone === client.phoneNumber
    );

    const confirmedAppointments = clientAppointments.filter(apt => apt.status === 'confirmed');
    const upcomingAppointments = clientAppointments.filter(apt =>
      apt.status === 'confirmed' && new Date(apt.date) > new Date()
    );

    const totalRevenue = confirmedAppointments.reduce((sum, apt) => sum + apt.price, 0);

    const sortedByDate = [...confirmedAppointments].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastVisit = sortedByDate[0]?.date;

    return {
      ...client,
      totalAppointments: clientAppointments.length,
      lastVisit,
      upcomingAppointments: upcomingAppointments.length,
      totalRevenue
    };
  };

  // Refresh trigger to force refetch
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch clients from API with pagination
  useEffect(() => {
    let isMounted = true;

    const loadClients = async () => {
      setLoading(true);
      setError(null);

      const response = await apiGet<ClientApi[]>(`/customers?page=${currentPage}&limit=${itemsPerPage}`);

      if (!isMounted) return;

      if (response.success && response.data) {
        // The API returns pagination info at root level alongside data
        const paginatedResponse = response as unknown as PaginatedResponse;
        // Calculate stats for each client
        const clientsWithStats = (response.data as ClientApi[]).map(client =>
          calculateClientStats(client, appointments)
        );
        setClients(clientsWithStats);
        if (paginatedResponse.pagination) {
          setPagination(paginatedResponse.pagination);
        }
      } else {
        const errorMessage = 'message' in response && response.message
          ? response.message
          : 'Failed to load clients';
        setError(errorMessage);
      }

      setLoading(false);
    };

    loadClients();

    return () => {
      isMounted = false;
    };
  }, [currentPage, appointments, refreshKey]);

  // Function to trigger a refetch
  const refreshClients = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format relative time (e.g., "5 days ago")
  const formatRelativeTime = (dateString: string | undefined): string => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const handleAddClient = () => {
    setFormData({ name: "", phoneNumber: "", email: "", address: "", notes: "" });
    setIsAddModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phoneNumber: client.phoneNumber,
      email: client.email,
      address: client.address || "",
      notes: client.notes || ""
    });
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    setActionLoading(true);

    const response = await apiPost<ClientApi>('/customers', formData);

    if (response.success && response.data) {
      setIsAddModalOpen(false);
      setFormData({ name: "", phoneNumber: "", email: "", address: "", notes: "" });
      // Refresh the list - go to first page to see the new client
      if (currentPage === 1) {
        refreshClients();
      } else {
        setCurrentPage(1);
      }
    } else {
      const errorMessage = 'message' in response && response.message
        ? response.message
        : 'Failed to create client';
      alert(errorMessage);
    }

    setActionLoading(false);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    setActionLoading(true);

    const response = await apiPut(`/customers/${editingClient._id}`, formData);

    if (response.success) {
      setIsEditModalOpen(false);
      setEditingClient(null);
      setFormData({ name: "", phoneNumber: "", email: "", address: "", notes: "" });
      // Refresh the current page to show updated data
      refreshClients();
    } else {
      const errorMessage = 'message' in response && response.message
        ? response.message
        : 'Failed to update client';
      alert(errorMessage);
    }

    setActionLoading(false);
  };

  const handleDeleteClick = (client: Client) => {
    setDeletingClient(client);
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingClient) return;

    setActionLoading(true);

    const response = await apiDelete(`/customers/${deletingClient._id}`);

    if (response.success) {
      setIsDeleteModalOpen(false);
      setDeletingClient(null);
      // If this was the last item on current page and not the first page, go to previous page
      if (clients.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        // Otherwise, refresh the current page
        refreshClients();
      }
    } else {
      const errorMessage = 'message' in response && response.message
        ? response.message
        : 'Failed to delete client';
      alert(errorMessage);
    }

    setActionLoading(false);
  };

  const handleViewHistory = (client: Client) => {
    setViewingClient(client);
    setIsHistoryModalOpen(true);
    setOpenMenuId(null);
  };

  // Filter clients by search query
  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase();
    const nameMatch = client.name?.toLowerCase().includes(query) ?? false;
    const emailMatch = client.email?.toLowerCase().includes(query) ?? false;
    const phoneMatch = client.phoneNumber?.includes(searchQuery) ?? false;

    return nameMatch || emailMatch || phoneMatch;
  });

  // Calculate overview stats (using pagination total for total clients)
  const stats = {
    total: pagination?.totalCount ?? clients.length,
    active: clients.filter(c => {
      if (!c.lastVisit) return false;
      const daysSinceVisit = (new Date().getTime() - new Date(c.lastVisit).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceVisit <= 30;
    }).length,
    newThisMonth: clients.filter(c => {
      const clientDate = new Date(c.createdAt);
      const now = new Date();
      return clientDate.getMonth() === now.getMonth() && clientDate.getFullYear() === now.getFullYear();
    }).length,
    totalRevenue: clients.reduce((sum, c) => sum + (c.totalRevenue || 0), 0)
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!pagination) return [];
    const { totalPages, currentPage } = pagination;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, and pages around current
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <>
      {/* Header */}
      {width > 1024 && (
        <div
          className="border-b border-zinc-800 flex items-center justify-between flex-shrink-0"
          style={{ padding: `${spacing}px ${cardPadding}px` }}
        >
          <div>
            <h1 className="font-bold" style={{ fontSize: `${responsive.fontSize.heading}px` }}>Client Management</h1>
            <p className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>Manage your clients and track their appointments</p>
          </div>

          {/* User Profile */}
          <UserProfile showSearch={true} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div style={{ padding: `${spacing}px ${cardPadding}px` }}>
          {/* Stats Overview */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: `${spacing}px`,
              marginBottom: `${spacing * 2}px`
            }}
          >
            <div className="bg-zinc-900 rounded-lg border border-zinc-800" style={{ padding: `${cardPadding}px` }}>
              <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Total Clients</div>
              <div className="font-bold text-yellow-400" style={{ fontSize: `${responsive.fontSize.heading}px` }}>{stats.total}</div>
            </div>
            <div className="bg-zinc-900 rounded-lg border border-zinc-800" style={{ padding: `${cardPadding}px` }}>
              <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Active</div>
              <div className="font-bold text-green-400" style={{ fontSize: `${responsive.fontSize.heading}px` }}>{stats.active}</div>
            </div>
            <div className="bg-zinc-900 rounded-lg border border-zinc-800" style={{ padding: `${cardPadding}px` }}>
              <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>New This Month</div>
              <div className="font-bold text-blue-400" style={{ fontSize: `${responsive.fontSize.heading}px` }}>{stats.newThisMonth}</div>
            </div>
            <div className="bg-zinc-900 rounded-lg border border-zinc-800" style={{ padding: `${cardPadding}px` }}>
              <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Total Revenue</div>
              <div className="font-bold text-purple-400" style={{ fontSize: `${responsive.fontSize.heading}px` }}>LKR {stats.totalRevenue.toLocaleString()}</div>
            </div>
          </div>

          {/* Add Button */}
          <div className="flex items-center justify-end" style={{ marginBottom: `${spacing}px` }}>
            <button
              onClick={handleAddClient}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 flex-shrink-0"
              style={{ 
                padding: isMobile ? `${spacing / 2}px` : `${spacing / 2}px ${cardPadding * 1.5}px`, 
                fontSize: `${responsive.fontSize.body}px`,
                aspectRatio: isMobile ? '1' : 'auto'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {!isMobile && "Add Client"}
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center" style={{ padding: `${spacing * 3}px` }}>
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" style={{ marginBottom: `${spacing}px` }}></div>
                <p className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>Loading clients...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg" style={{ padding: `${cardPadding * 1.5}px`, marginBottom: `${spacing}px` }}>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-red-400 font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>Error loading clients</p>
                  <p className="text-red-300" style={{ fontSize: `${responsive.fontSize.small}px` }}>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredClients.length === 0 && searchQuery === "" && (
            <div className="text-center" style={{ padding: `${spacing * 3}px` }}>
              <svg className="w-16 h-16 text-zinc-600 mx-auto" style={{ marginBottom: `${spacing}px` }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-zinc-400 font-semibold" style={{ fontSize: `${responsive.fontSize.body}px`, marginBottom: `${spacing / 2}px` }}>No clients yet</p>
              <p className="text-zinc-500" style={{ fontSize: `${responsive.fontSize.small}px` }}>Add your first client to get started</p>
            </div>
          )}

          {/* No Search Results */}
          {!loading && !error && filteredClients.length === 0 && searchQuery !== "" && (
            <div className="text-center" style={{ padding: `${spacing * 3}px` }}>
              <svg className="w-16 h-16 text-zinc-600 mx-auto" style={{ marginBottom: `${spacing}px` }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-zinc-400 font-semibold" style={{ fontSize: `${responsive.fontSize.body}px`, marginBottom: `${spacing / 2}px` }}>No clients found</p>
              <p className="text-zinc-500" style={{ fontSize: `${responsive.fontSize.small}px` }}>Try a different search term</p>
            </div>
          )}

          {/* Client Grid */}
          {!loading && !error && filteredClients.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : width < 1280 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap: `${spacing}px`
              }}
            >
              {filteredClients.map((client) => (
                <div
                  key={client._id}
                  className="bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
                  style={{ padding: `${cardPadding * 1.5}px` }}
                >
                  <div className="flex items-start justify-between" style={{ marginBottom: `${spacing}px` }}>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center text-yellow-400 font-bold border border-yellow-400/30">
                        {client.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate" style={{ fontSize: `${responsive.fontSize.body}px` }}>{client.name}</div>
                        <div className="text-zinc-400 truncate" style={{ fontSize: `${responsive.fontSize.small}px` }}>{client.email}</div>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        className="text-zinc-400 hover:text-white"
                        onClick={() => setOpenMenuId(openMenuId === client._id ? null : client._id)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>

                      {openMenuId === client._id && (
                        <div
                          className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10"
                          style={{ padding: `${spacing / 2}px` }}
                        >
                          <button
                            onClick={() => handleEditClient(client)}
                            className="w-full text-left px-3 py-2 hover:bg-zinc-700 rounded flex items-center gap-2 text-white"
                            style={{ fontSize: `${responsive.fontSize.body}px` }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Client
                          </button>
                          <button
                            onClick={() => handleViewHistory(client)}
                            className="w-full text-left px-3 py-2 hover:bg-zinc-700 rounded flex items-center gap-2 text-white"
                            style={{ fontSize: `${responsive.fontSize.body}px` }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            View History
                          </button>
                          <button
                            onClick={() => handleDeleteClick(client)}
                            className="w-full text-left px-3 py-2 hover:bg-zinc-700 rounded flex items-center gap-2 text-red-400 hover:text-red-300"
                            style={{ fontSize: `${responsive.fontSize.body}px` }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Client
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1" style={{ marginBottom: `${spacing}px` }}>
                    <div className="flex items-center gap-2 text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {client.phoneNumber}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-800 rounded-lg" style={{ padding: `${spacing}px` }}>
                      <div className="text-zinc-500" style={{ fontSize: `${responsive.fontSize.caption}px` }}>Appointments</div>
                      <div className="font-bold text-white" style={{ fontSize: `${responsive.fontSize.body}px` }}>{client.totalAppointments || 0}</div>
                    </div>
                    <div className="bg-zinc-800 rounded-lg" style={{ padding: `${spacing}px` }}>
                      <div className="text-zinc-500" style={{ fontSize: `${responsive.fontSize.caption}px` }}>Last Visit</div>
                      <div className="font-bold text-white" style={{ fontSize: `${responsive.fontSize.small}px` }}>{formatRelativeTime(client.lastVisit)}</div>
                    </div>
                    <div className="bg-zinc-800 rounded-lg" style={{ padding: `${spacing}px` }}>
                      <div className="text-zinc-500" style={{ fontSize: `${responsive.fontSize.caption}px` }}>Revenue</div>
                      <div className="font-bold text-green-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>LKR {client.totalRevenue || 0}</div>
                    </div>
                    <div className="bg-zinc-800 rounded-lg" style={{ padding: `${spacing}px` }}>
                      <div className="text-zinc-500" style={{ fontSize: `${responsive.fontSize.caption}px` }}>Upcoming</div>
                      <div className="font-bold text-white" style={{ fontSize: `${responsive.fontSize.body}px` }}>{client.upcomingAppointments || 0}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && !error && pagination && (
            <div
              className="flex items-center justify-between"
              style={{ marginTop: `${spacing * 2}px`, paddingTop: `${spacing}px`, borderTop: '1px solid rgb(63 63 70)' }}
            >
              {/* Results info */}
              <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} clients
              </div>

              {/* Page navigation */}
              <div className="flex items-center" style={{ gap: `${spacing / 2}px` }}>
                {/* Previous button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  style={{ padding: `${spacing / 2}px ${spacing}px`, fontSize: `${responsive.fontSize.body}px` }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {!isMobile && <span style={{ marginLeft: `${spacing / 2}px` }}>Previous</span>}
                </button>

                {/* Page numbers */}
                {!isMobile && (
                  <div className="flex items-center" style={{ gap: `${spacing / 4}px` }}>
                    {getPageNumbers().map((page, index) => (
                      typeof page === 'number' ? (
                        <button
                          key={index}
                          onClick={() => handlePageChange(page)}
                          className={`min-w-[40px] h-[40px] flex items-center justify-center rounded-lg transition-colors ${
                            page === pagination.currentPage
                              ? 'bg-yellow-400 text-black font-semibold'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                          }`}
                          style={{ fontSize: `${responsive.fontSize.body}px` }}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={index} className="text-zinc-500 px-2">...</span>
                      )
                    ))}
                  </div>
                )}

                {/* Mobile page indicator */}
                {isMobile && (
                  <div className="text-white font-medium" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                    {pagination.currentPage} / {pagination.totalPages}
                  </div>
                )}

                {/* Next button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  style={{ padding: `${spacing / 2}px ${spacing}px`, fontSize: `${responsive.fontSize.body}px` }}
                >
                  {!isMobile && <span style={{ marginRight: `${spacing / 2}px` }}>Next</span>}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Client"
        cardPadding={cardPadding}
        spacing={spacing}
        responsiveFontSize={responsive.fontSize}
      >
        <form onSubmit={handleSubmitAdd} style={{ display: 'flex', flexDirection: 'column', gap: `${spacing}px` }}>
          <div>
            <label className="block text-white font-medium" style={{ fontSize: `${responsive.fontSize.label}px`, marginBottom: '8px' }}>
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <div>
            <label className="block text-white font-medium" style={{ fontSize: `${responsive.fontSize.label}px`, marginBottom: '8px' }}>
              Email (Optional)
            </label>
            <input
              type="email"
              placeholder="client@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <div>
            <label className="block text-white font-medium" style={{ fontSize: `${responsive.fontSize.label}px`, marginBottom: '8px' }}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <div>
            <label className="block text-white font-medium" style={{ fontSize: `${responsive.fontSize.label}px`, marginBottom: '8px' }}>
              Address (Optional)
            </label>
            <input
              type="text"
              placeholder="123 Main St, City, State"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <div>
            <label className="block text-white font-medium" style={{ fontSize: `${responsive.fontSize.label}px`, marginBottom: '8px' }}>
              Notes (Optional)
            </label>
            <textarea
              placeholder="Additional notes about the client..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ padding: `${spacing}px`, fontSize: `${responsive.fontSize.body}px` }}
          >
            {actionLoading ? 'Adding...' : 'Add Client'}
          </button>
        </form>
      </Modal>

      {/* Edit Client Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Client"
        cardPadding={cardPadding}
        spacing={spacing}
        responsiveFontSize={responsive.fontSize}
      >
        <form onSubmit={handleSubmitEdit} style={{ display: 'flex', flexDirection: 'column', gap: `${spacing}px` }}>
          <div>
            <label className="block text-white font-medium" style={{ fontSize: `${responsive.fontSize.label}px`, marginBottom: '8px' }}>
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <div>
            <label className="block text-white font-medium" style={{ fontSize: `${responsive.fontSize.label}px`, marginBottom: '8px' }}>
              Email (Optional)
            </label>
            <input
              type="email"
              placeholder="client@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <div>
            <label className="block text-white font-medium" style={{ fontSize: `${responsive.fontSize.label}px`, marginBottom: '8px' }}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <div>
            <label className="block text-white font-medium" style={{ fontSize: `${responsive.fontSize.label}px`, marginBottom: '8px' }}>
              Address (Optional)
            </label>
            <input
              type="text"
              placeholder="123 Main St, City, State"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <div>
            <label className="block text-white font-medium" style={{ fontSize: `${responsive.fontSize.label}px`, marginBottom: '8px' }}>
              Notes (Optional)
            </label>
            <textarea
              placeholder="Additional notes about the client..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ padding: `${spacing}px`, fontSize: `${responsive.fontSize.body}px` }}
          >
            {actionLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !actionLoading && setIsDeleteModalOpen(false)}></div>
          <div
            className="relative bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-md mx-4"
            style={{ padding: `${cardPadding * 2}px` }}
          >
            <div className="flex items-start gap-4" style={{ marginBottom: `${spacing * 1.5}px` }}>
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-white" style={{ fontSize: `${responsive.fontSize.heading}px`, marginBottom: `${spacing / 2}px` }}>
                  Delete Client
                </h2>
                <p className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                  Are you sure you want to delete <span className="font-semibold text-white">{deletingClient.name}</span>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={actionLoading}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ padding: `${spacing}px`, fontSize: `${responsive.fontSize.body}px` }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ padding: `${spacing}px`, fontSize: `${responsive.fontSize.body}px` }}
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client History Modal - Placeholder (will be implemented separately) */}
      {isHistoryModalOpen && viewingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsHistoryModalOpen(false)}></div>
          <div
            className="relative bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-2xl mx-4"
            style={{ padding: `${cardPadding * 2}px` }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: `${spacing * 1.5}px` }}>
              <h2 className="font-bold text-white" style={{ fontSize: `${responsive.fontSize.heading}px` }}>
                Client Appointment History
              </h2>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-center text-zinc-400" style={{ padding: `${spacing * 3}px`, fontSize: `${responsive.fontSize.body}px` }}>
              Appointment history for {viewingClient.name} will be displayed here.
            </div>

            <button
              onClick={() => setIsHistoryModalOpen(false)}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
              style={{ padding: `${spacing}px`, fontSize: `${responsive.fontSize.body}px` }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
