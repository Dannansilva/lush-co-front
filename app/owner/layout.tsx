"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useScreenSize, getResponsiveValues } from "@/app/hooks/useScreenSize";
import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { width, height } = useScreenSize();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Get responsive values based on screen size
  const responsive = getResponsiveValues(width, height);

  // Calculate component-specific values
  const cardPadding = Math.round(Math.max(12, Math.min(width * 0.015, 20)));
  const spacing = Math.round(Math.max(12, Math.min(width * 0.02, 16)));
  const isDesktop = width > 1024;

  const isMenuOpen = isDesktop ? !isSidebarCollapsed : isMobileMenuOpen;
  const sidebarWidth = isSidebarCollapsed ? 70 : 240;

  const menuItems = [
    { name: "Dashboard", path: "/owner", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { name: "Staff", path: "/owner/staff", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { name: "Services", path: "/owner/services", icon: "M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" },
    { name: "Appointments", path: "/owner/appointments", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { name: "Clients", path: "/owner/clients", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { name: "Revenue", path: "/owner/revenue", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <div className="h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Mobile overlay */}
      {isMenuOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-300 ease-in-out z-50 ${
            !isDesktop ? 'fixed top-0 left-0 h-full' : 'relative'
          }`}
          style={{
            width: isDesktop ? `${sidebarWidth}px` : '240px',
            padding: `${spacing * 1.5}px ${cardPadding}px`,
            transform: isMenuOpen || isDesktop ? 'translateX(0)' : 'translateX(-100%)'
          }}
        >
          {/* Logo */}
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: `${spacing * 3}px` }}
          >
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} flex-1`}>
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-yellow-400 flex items-center justify-center flex-shrink-0">
                <Image
                  src="/img/logo.jpg"
                  alt="Lush & Co"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <div className="font-bold" style={{ fontSize: `${responsive.fontSize.body}px` }}>Lush & Co</div>
                  <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Management</div>
                </div>
              )}
            </div>

            {isDesktop && (
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="text-zinc-400 hover:text-white transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
                </svg>
              </button>
            )}

            {!isDesktop && (
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Menu */}
          <div className="flex flex-col flex-1" style={{ gap: `${spacing}px` }}>
            {!isSidebarCollapsed && (
              <div className="text-zinc-500 uppercase tracking-wider" style={{ fontSize: `${responsive.fontSize.small}px`, marginBottom: `${spacing}px` }}>MENU</div>
            )}

            {menuItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== "/owner" && pathname.startsWith(item.path));

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => !isDesktop && setIsMobileMenuOpen(false)}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} rounded-lg transition-colors ${
                    isActive ? "bg-yellow-400/10 text-yellow-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                  style={{ padding: `${spacing}px ${isSidebarCollapsed ? spacing : cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
                  title={item.name}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {!isSidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors mt-auto`}
            style={{ padding: `${spacing}px ${isSidebarCollapsed ? spacing : cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
            title="Sign Out"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Hamburger Button */}
          {!isDesktop && (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="fixed top-4 left-4 z-30 bg-yellow-400 text-black p-3 rounded-lg shadow-lg hover:bg-yellow-500 transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {children}
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
