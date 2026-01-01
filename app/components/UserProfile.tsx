"use client";

import React from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useScreenSize, getResponsiveValues } from "@/app/hooks/useScreenSize";
import { getUserInitials, formatUserType } from "@/app/utils/userUtils";

interface UserProfileProps {
  showSearch?: boolean;
}

export default function UserProfile({ showSearch = true }: UserProfileProps) {
  const { user } = useAuth();
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  const cardPadding = Math.max(12, Math.min(width * 0.015, 20));
  const spacing = Math.max(12, Math.min(width * 0.02, 16));
  const isMobile = width < 768;

  return (
    <div className="flex items-center gap-3">
      {showSearch && (
        <input
          type="text"
          placeholder="Search..."
          className="bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
          style={{
            padding: `${spacing / 2}px ${cardPadding}px`,
            fontSize: `${responsive.fontSize.body}px`,
            width: "200px",
          }}
        />
      )}

      <div className="relative">
        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">
          {user ? getUserInitials(user.name) : "U"}
        </div>
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
      </div>

      {!isMobile && (
        <div>
          <div
            className="font-semibold"
            style={{ fontSize: `${responsive.fontSize.body}px` }}
          >
            {user?.name || "User"}
          </div>
          <div
            className="text-zinc-400"
            style={{ fontSize: `${responsive.fontSize.small}px` }}
          >
            {user ? formatUserType(user.userType) : "User"}
          </div>
        </div>
      )}
    </div>
  );
}
