"use client";

import React, { useState } from "react";
import { useScreenSize, getResponsiveValues } from "@/app/hooks/useScreenSize";

interface StaffMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  rating: number;
  clients: number;
  status: string;
  specialties: string[];
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

  const [staff, setStaff] = useState<StaffMember[]>([
    {
      id: 1,
      name: "Emma Wilson",
      role: "Senior Stylist",
      email: "emma@lushandco.com",
      phone: "(555) 123-4567",
      rating: 4.9,
      clients: 145,
      status: "active",
      specialties: ["Balayage", "Bridal", "Color Correction"]
    },
    {
      id: 2,
      name: "Mia Rodriguez",
      role: "Colorist",
      email: "mia@lushandco.com",
      phone: "(555) 234-5678",
      rating: 4.8,
      clients: 112,
      status: "active",
      specialties: ["Highlights", "Ombre", "Fashion Colors"]
    },
    {
      id: 3,
      name: "Olivia Kim",
      role: "Stylist",
      email: "olivia@lushandco.com",
      phone: "(555) 345-6789",
      rating: 4.7,
      clients: 89,
      status: "active",
      specialties: ["Precision Cuts", "Updos", "Men's Cuts"]
    },
    {
      id: 4,
      name: "Sophia Lee",
      role: "Nail Artist",
      email: "sophia@lushandco.com",
      phone: "(555) 456-7890",
      rating: 4.6,
      clients: 78,
      status: "inactive",
      specialties: ["Gel Manicure", "Nail Art", "Pedicure"]
    },
    {
      id: 5,
      name: "Ava Martinez",
      role: "Junior Stylist",
      email: "ava@lushandco.com",
      phone: "(555) 567-8901",
      rating: 4.5,
      clients: 65,
      status: "active",
      specialties: ["Basic Cuts", "Styling", "Treatments"]
    }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const handleAddStaff = () => {
    setFormData({ name: "", email: "", phone: "" });
    setIsAddModalOpen(true);
  };

  const handleEditStaff = (member: StaffMember) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone
    });
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newStaff: StaffMember = {
      id: staff.length + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: "Stylist",
      rating: 0,
      clients: 0,
      status: "active",
      specialties: []
    };
    setStaff([...staff, newStaff]);
    setIsAddModalOpen(false);
    setFormData({ name: "", email: "", phone: "" });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      setStaff(staff.map(member =>
        member.id === editingStaff.id
          ? { ...member, name: formData.name, email: formData.email, phone: formData.phone }
          : member
      ));
      setIsEditModalOpen(false);
      setEditingStaff(null);
      setFormData({ name: "", email: "", phone: "" });
    }
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

          {/* Staff Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : width < 1280 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: `${spacing}px`
            }}
          >
            {staff.map((member) => (
              <div
                key={member.id}
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
                      <div className="text-yellow-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>{member.role}</div>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      className="text-zinc-400 hover:text-white"
                      onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>

                    {openMenuId === member.id && (
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
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2" style={{ marginBottom: `${spacing}px` }}>
                  <div className="flex items-center gap-2 text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {member.email}
                  </div>

                  <div className="flex items-center gap-2 text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {member.phone}
                  </div>
                </div>

                <div className="flex items-center justify-between" style={{ marginBottom: `${spacing}px` }}>
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>{member.rating}</span>
                  </div>

                  <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                    {member.clients} clients
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full ${
                      member.status === "active" ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"
                    }`}
                    style={{ fontSize: `${responsive.fontSize.small}px` }}
                  >
                    {member.status}
                  </span>
                </div>

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
              </div>
            ))}
          </div>
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
              Email
            </label>
            <input
              type="email"
              placeholder="email@lushandco.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <div>
            <label className="block text-white font-medium" style={{ fontSize: `${responsive.fontSize.label}px`, marginBottom: '8px' }}>
              Phone
            </label>
            <input
              type="tel"
              placeholder="(555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors"
            style={{ padding: `${spacing}px`, fontSize: `${responsive.fontSize.body}px` }}
          >
            Add Staff Member
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
              Email
            </label>
            <input
              type="email"
              placeholder="email@lushandco.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <div>
            <label className="block text-white font-medium" style={{ fontSize: `${responsive.fontSize.label}px`, marginBottom: '8px' }}>
              Phone
            </label>
            <input
              type="tel"
              placeholder="(555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors"
            style={{ padding: `${spacing}px`, fontSize: `${responsive.fontSize.body}px` }}
          >
            Save Changes
          </button>
        </form>
      </Modal>
    </>
  );
}
