"use client";

import React, { useState, useEffect } from "react";
import { useScreenSize, getResponsiveValues } from "@/app/hooks/useScreenSize";
import { apiGet, apiPost, apiPut, apiDelete } from "@/app/utils/api";

// Backend API response interface
interface StaffMemberApi {
  _id: string;
  name: string;
  phoneNumber: string;
  createdAt: string;
  __v?: number;
}

// Frontend display interface (for future features)
interface StaffMember {
  _id: string;
  name: string;
  phoneNumber: string;
  createdAt: string;
  email?: string;
  role?: string;
  rating?: number;
  clients?: number;
  status?: string;
  specialties?: string[];
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div
        className="relative bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-md mx-4"
        style={{ padding: `${cardPadding * 2}px` }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: `${spacing * 1.5}px` }}>
          <div>
            <h2 className="font-bold" style={{ fontSize: `${responsiveFontSize.heading}px` }}>{title}</h2>
            <p className="text-zinc-400" style={{ fontSize: `${responsiveFontSize.small}px` }}>
              Fill in the details for the {title.toLowerCase().includes('edit') ? 'team member' : 'new team member'}.
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
  );
}

export default function StaffPage() {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  const cardPadding = Math.max(12, Math.min(width * 0.015, 20));
  const spacing = Math.max(12, Math.min(width * 0.02, 16));

  const isMobile = width < 768;

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch staff members from API on component mount
  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      setError(null);

      const response = await apiGet<StaffMemberApi[]>('/staff');

      if (response.success && response.data) {
        setStaff(response.data);
      } else {
        const errorMessage = 'message' in response && response.message
          ? response.message
          : 'Failed to load staff members';
        setError(errorMessage);
      }

      setLoading(false);
    };

    fetchStaff();
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: ""
  });

  const handleAddStaff = () => {
    setFormData({ name: "", phoneNumber: "" });
    setIsAddModalOpen(true);
  };

  const handleEditStaff = (member: StaffMember) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      phoneNumber: member.phoneNumber
    });
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    setActionLoading(true);

    const response = await apiPost<StaffMemberApi>('/staff', formData);

    if (response.success && response.data) {
      // Add the new staff member to the local state
      setStaff([...staff, response.data]);
      setIsAddModalOpen(false);
      setFormData({ name: "", phoneNumber: "" });
    } else {
      const errorMessage = 'message' in response && response.message
        ? response.message
        : 'Failed to create staff member';
      alert(errorMessage);
    }

    setActionLoading(false);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    setActionLoading(true);

    const response = await apiPut(`/staff/${editingStaff._id}`, formData);

    if (response.success) {
      // Update the staff member in the local state
      setStaff(staff.map(member =>
        member._id === editingStaff._id
          ? { ...member, ...formData }
          : member
      ));
      setIsEditModalOpen(false);
      setEditingStaff(null);
      setFormData({ name: "", phoneNumber: "" });
    } else {
      const errorMessage = 'message' in response && response.message
        ? response.message
        : 'Failed to update staff member';
      alert(errorMessage);
    }

    setActionLoading(false);
  };

  const handleDeleteClick = (member: StaffMember) => {
    setDeletingStaff(member);
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingStaff) return;

    setActionLoading(true);

    const response = await apiDelete(`/staff/${deletingStaff._id}`);

    if (response.success) {
      // Remove the staff member from the local state
      setStaff(staff.filter(member => member._id !== deletingStaff._id));
      setIsDeleteModalOpen(false);
      setDeletingStaff(null);
    } else {
      const errorMessage = 'message' in response && response.message
        ? response.message
        : 'Failed to delete staff member';
      alert(errorMessage);
    }

    setActionLoading(false);
  };

  return (
    <>
      {/* Header */}
      <div
        className="border-b border-zinc-800 flex items-center justify-between flex-shrink-0"
        style={{ padding: `${spacing}px ${cardPadding}px` }}
      >
        <div>
          <h1 className="font-bold" style={{ fontSize: `${responsive.fontSize.heading}px` }}>Staff Management</h1>
          <p className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>Manage your salon team and track performance</p>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">
              VS
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
          </div>
          {!isMobile && (
            <div>
              <div className="font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>Victoria Sterling</div>
              <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Owner</div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div style={{ padding: `${spacing}px ${cardPadding}px` }}>
          {/* Search and Add Button */}
          <div className="flex items-center justify-between" style={{ marginBottom: `${spacing}px` }}>
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search staff members..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
                style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
              />
              <svg className="w-5 h-5 text-zinc-500 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button
              onClick={handleAddStaff}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors flex items-center gap-2"
              style={{ padding: `${spacing}px ${cardPadding * 1.5}px`, fontSize: `${responsive.fontSize.body}px` }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Staff Member
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center" style={{ padding: `${spacing * 3}px` }}>
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" style={{ marginBottom: `${spacing}px` }}></div>
                <p className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>Loading staff members...</p>
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
                  <p className="text-red-400 font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>Error loading staff</p>
                  <p className="text-red-300" style={{ fontSize: `${responsive.fontSize.small}px` }}>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && staff.length === 0 && (
            <div className="text-center" style={{ padding: `${spacing * 3}px` }}>
              <svg className="w-16 h-16 text-zinc-600 mx-auto" style={{ marginBottom: `${spacing}px` }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-zinc-400 font-semibold" style={{ fontSize: `${responsive.fontSize.body}px`, marginBottom: `${spacing / 2}px` }}>No staff members yet</p>
              <p className="text-zinc-500" style={{ fontSize: `${responsive.fontSize.small}px` }}>Add your first team member to get started</p>
            </div>
          )}

          {/* Staff Grid */}
          {!loading && !error && staff.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : width < 1280 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap: `${spacing}px`
              }}
            >
              {staff.map((member) => (
                <div
                  key={member._id}
                  className="bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
                  style={{ padding: `${cardPadding * 1.5}px` }}
                >
                  <div className="flex items-start justify-between" style={{ marginBottom: `${spacing}px` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center text-white font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold" style={{ fontSize: `${responsive.fontSize.body}px` }}>{member.name}</div>
                        {member.role && (
                          <div className="text-yellow-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>{member.role}</div>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        className="text-zinc-400 hover:text-white"
                        onClick={() => setOpenMenuId(openMenuId === member._id ? null : member._id)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>

                      {openMenuId === member._id && (
                        <div
                          className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10"
                          style={{ padding: `${spacing / 2}px` }}
                        >
                          <button
                            onClick={() => handleEditStaff(member)}
                            className="w-full text-left px-3 py-2 hover:bg-zinc-700 rounded flex items-center gap-2 text-white"
                            style={{ fontSize: `${responsive.fontSize.body}px` }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Staff
                          </button>
                          <button
                            onClick={() => handleDeleteClick(member)}
                            className="w-full text-left px-3 py-2 hover:bg-zinc-700 rounded flex items-center gap-2 text-red-400 hover:text-red-300"
                            style={{ fontSize: `${responsive.fontSize.body}px` }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Staff
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2" style={{ marginBottom: `${spacing}px` }}>
                    {member.email && (
                      <div className="flex items-center gap-2 text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {member.email}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {member.phoneNumber}
                    </div>
                  </div>

                  {(member.rating || member.clients || member.status) && (
                    <div className="flex items-center justify-between" style={{ marginBottom: `${spacing}px` }}>
                      {member.rating && (
                        <div className="flex items-center gap-1">
                          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>{member.rating}</span>
                        </div>
                      )}

                      {member.clients !== undefined && (
                        <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                          {member.clients} clients
                        </div>
                      )}

                      {member.status && (
                        <span
                          className={`px-3 py-1 rounded-full ${
                            member.status === "active" ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"
                          }`}
                          style={{ fontSize: `${responsive.fontSize.small}px` }}
                        >
                          {member.status}
                        </span>
                      )}
                    </div>
                  )}

                  {member.specialties && member.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded"
                          style={{ fontSize: `${responsive.fontSize.small}px` }}
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Staff Member"
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
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1234567890"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              required
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
            {actionLoading ? 'Adding...' : 'Add Staff Member'}
          </button>
        </form>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Staff Member"
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
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1234567890"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              required
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
      {isDeleteModalOpen && deletingStaff && (
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
                  Delete Staff Member
                </h2>
                <p className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                  Are you sure you want to delete <span className="font-semibold text-white">{deletingStaff.name}</span>? This action cannot be undone.
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
    </>
  );
}
