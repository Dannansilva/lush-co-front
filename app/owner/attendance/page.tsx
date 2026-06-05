"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useScreenSize, getResponsiveValues } from "@/app/hooks/useScreenSize";
import { apiGet, apiPost } from "@/app/utils/api";
import UserProfile from "@/app/components/UserProfile";
import { useAuth } from "@/app/context/AuthContext";

interface AttendanceRecord {
  staffMember: {
    _id: string;
    name: string;
    phoneNumber: string;
  };
  status: 'PRESENT' | 'ABSENT' | null;
  markedBy?: string;
  checkInTime?: string;
  checkOutTime?: string;
  updatedAt?: string;
}

interface HistoryRecord {
  date: string;
  status: 'PRESENT' | 'ABSENT' | null;
  checkInTime?: string;
  checkOutTime?: string;
  markedBy?: string;
  updatedAt?: string;
}

export default function AttendancePage() {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);
  const { user } = useAuth();

  const cardPadding = Math.max(12, Math.min(width * 0.015, 20));
  const spacing = Math.max(12, Math.min(width * 0.02, 16));
  const isMobile = width < 768;

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [attendanceDate, setAttendanceDate] = useState<string>(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  });
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [lockCountdown, setLockCountdown] = useState<string | null>(null);
  const [isButtonLocked, setIsButtonLocked] = useState(false);

  // History modal states
  const [selectedHistoryStaff, setSelectedHistoryStaff] = useState<{ _id: string; name: string; phoneNumber: string } | null>(null);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const fetchAttendanceForDate = useCallback(async (dateStr: string) => {
    const response = await apiGet<AttendanceRecord[]>(`/attendance?date=${dateStr}`);
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }, []);

  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      if (active) setAttendanceLoading(true);
    });

    fetchAttendanceForDate(attendanceDate).then((data) => {
      if (active) {
        setAttendance(data);
        setAttendanceLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [attendanceDate, fetchAttendanceForDate]);

  // Double-click lock countdown effect
  useEffect(() => {
    if (!selectedStaffId || !isAttendanceModalOpen) {
      setLockCountdown(null);
      setIsButtonLocked(false);
      return;
    }

    const selectedRecord = attendance.find(r => r.staffMember._id === selectedStaffId);
    if (!selectedRecord) {
      setLockCountdown(null);
      setIsButtonLocked(false);
      return;
    }

    // Determine the last action timestamp
    let lastActionTime: string | null = null;
    if (selectedRecord.status === 'PRESENT') {
      lastActionTime = selectedRecord.checkOutTime || selectedRecord.checkInTime || null;
    } else if (selectedRecord.status === 'ABSENT') {
      lastActionTime = selectedRecord.updatedAt || selectedRecord.checkOutTime || selectedRecord.checkInTime || null;
    }

    if (!lastActionTime) {
      setLockCountdown(null);
      setIsButtonLocked(false);
      return;
    }

    const checkLock = () => {
      const actionTimeMs = new Date(lastActionTime!).getTime();
      const nowMs = Date.now();
      const diffMs = nowMs - actionTimeMs;
      const lockDurationMs = 30 * 60 * 1000; // 30 minutes

      if (diffMs < lockDurationMs) {
        const remainingMs = lockDurationMs - diffMs;
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setLockCountdown(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        setIsButtonLocked(true);
      } else {
        setLockCountdown(null);
        setIsButtonLocked(false);
      }
    };

    checkLock(); // run once immediately
    const interval = setInterval(checkLock, 1000);

    return () => clearInterval(interval);
  }, [selectedStaffId, attendance, isAttendanceModalOpen]);

  const handleTogglePower = async () => {
    if (!selectedStaffId || isButtonLocked) return;
    
    setMarkingId(selectedStaffId);
    
    const response = await apiPost('/attendance', {
      date: attendanceDate,
      records: [
        {
          staffMember: selectedStaffId,
          status: 'PRESENT'
        }
      ]
    });

    if (response.success) {
      const updatedData = await fetchAttendanceForDate(attendanceDate);
      setAttendance(updatedData);
    } else {
      const msg = 'message' in response ? response.message : 'Failed to update attendance';
      alert(msg);
    }
    setMarkingId(null);
  };

  const handleResetToAbsent = async () => {
    if (!selectedStaffId || isButtonLocked) return;
    
    setMarkingId(selectedStaffId);
    
    const response = await apiPost('/attendance', {
      date: attendanceDate,
      records: [
        {
          staffMember: selectedStaffId,
          status: 'ABSENT'
        }
      ]
    });

    if (response.success) {
      const updatedData = await fetchAttendanceForDate(attendanceDate);
      setAttendance(updatedData);
    } else {
      const msg = 'message' in response ? response.message : 'Failed to update attendance';
      alert(msg);
    }
    setMarkingId(null);
  };

  const handleViewHistory = async (staff: { _id: string; name: string; phoneNumber: string }) => {
    setSelectedHistoryStaff(staff);
    setIsHistoryLoading(true);
    setIsHistoryModalOpen(true);
    
    try {
      const response = await apiGet<HistoryRecord[] | { data: HistoryRecord[] }>(`/attendance/history?staffMember=${staff._id}&date=${attendanceDate}`);
      if (response.success && response.data) {
        const recordsArray = Array.isArray(response.data)
          ? response.data
          : response.data.data;
        setHistoryRecords(recordsArray || []);
      } else {
        setHistoryRecords([]);
      }
    } catch (err) {
      console.error('Failed to fetch attendance history', err);
      setHistoryRecords([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const isRestrictedUser = user?.userType === 'RECEPTIONIST' || user?.userType === 'FRONT_DESK';

  // Calculate stats for the selected date
  const presentCount = attendance.filter(r => r.status === 'PRESENT').length;
  const absentCount = attendance.filter(r => r.status === 'ABSENT').length;
  const unmarkedCount = attendance.filter(r => r.status === null).length;
  const totalCount = attendance.length;

  return (
    <>
      {/* Header */}
      {width > 1024 && (
        <div
          className="border-b border-zinc-800 flex items-center justify-between flex-shrink-0"
          style={{ padding: `${spacing}px ${cardPadding}px` }}
        >
          <div>
            <h1 className="font-bold" style={{ fontSize: `${responsive.fontSize.heading}px` }}>Staff Attendance</h1>
            <p className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>Track and manage your team presence</p>
          </div>
          <UserProfile showSearch={false} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div style={{ padding: `${spacing}px ${cardPadding}px` }}>
          
          {/* Stats Bar */}
          <div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            style={{ marginBottom: `${spacing * 1.5}px` }}
          >
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
              <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Date</div>
              <div className="font-bold mt-1 text-white text-sm truncate">
                {new Date(attendanceDate).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            
            <div className="bg-zinc-900 rounded-xl border border-zinc-850 p-4">
              <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Present</div>
              <div className="font-extrabold text-green-400 text-xl mt-0.5">
                {attendanceLoading ? '...' : `${presentCount} / ${totalCount}`}
              </div>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-850 p-4">
              <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Absent</div>
              <div className="font-extrabold text-red-400 text-xl mt-0.5">
                {attendanceLoading ? '...' : absentCount}
              </div>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-850 p-4">
              <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Unmarked</div>
              <div className="font-extrabold text-zinc-400 text-xl mt-0.5">
                {attendanceLoading ? '...' : unmarkedCount}
              </div>
            </div>
          </div>

          {/* Main Attendance Card */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col" style={{ padding: `${cardPadding * 1.5}px` }}>
            
            {/* Header / Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4" style={{ marginBottom: `${spacing}px` }}>
              <div>
                <h2 className="font-bold text-white" style={{ fontSize: `${responsive.fontSize.subheading}px` }}>
                  Attendance Status List
                </h2>
                <p className="text-zinc-400 text-xs mt-0.5">
                  View who is currently checked in or check staff members in/out.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => {
                    setAttendanceDate(e.target.value);
                    setSelectedStaffId(null);
                  }}
                  className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-1.5 font-semibold focus:outline-none focus:border-yellow-400"
                  style={{ fontSize: `${responsive.fontSize.body}px` }}
                />
                
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(true)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg shadow-lg hover:shadow-yellow-400/10 transition-all flex items-center gap-1.5 whitespace-nowrap"
                  style={{ padding: `8px 16px`, fontSize: `${responsive.fontSize.body}px` }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5.636 18.364a9 9 0 1112.728 0M12 3v9" />
                  </svg>
                  Mark Attendance
                </button>
              </div>
            </div>

            {/* List Grid */}
            <div className="w-full">
              {attendanceLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-zinc-400 mt-3" style={{ fontSize: `${responsive.fontSize.body}px` }}>Loading attendance records...</p>
                </div>
              ) : attendance.length === 0 ? (
                <div className="text-center py-12 bg-zinc-950/20 border border-zinc-850 rounded-xl">
                  <svg className="w-16 h-16 text-zinc-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-zinc-400 font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>No staff members registered</p>
                  <p className="text-zinc-500 text-xs mt-1">Add staff members in the Staff page to track attendance.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {attendance.map((record) => {
                    const isPresent = record.status === 'PRESENT';
                    const isClockedOut = isPresent && record.checkOutTime;
                    return (
                      <div 
                        key={record.staffMember._id} 
                        onClick={() => handleViewHistory(record.staffMember)}
                        title="Click to view past 7 days attendance history"
                        className={`cursor-pointer hover:scale-[1.02] flex items-center justify-between p-4 rounded-xl border transition-all ${
                          isPresent 
                            ? isClockedOut
                              ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40 shadow-md shadow-amber-500/5'
                              : 'bg-green-500/5 border-green-500/20 hover:border-green-500/40 shadow-md shadow-green-500/5' 
                            : record.status === 'ABSENT'
                              ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40 shadow-md shadow-red-500/5'
                              : 'bg-zinc-800/30 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-bold text-white truncate" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                            {record.staffMember.name}
                          </div>
                          <div className="text-zinc-400 text-xs truncate mt-0.5">
                            {record.staffMember.phoneNumber}
                          </div>
                          {isPresent && record.checkInTime && (
                            <div className="flex flex-col gap-1.5 mt-2.5">
                              <div className="text-green-400 text-[11px] font-semibold flex items-center gap-1 bg-green-500/10 w-fit px-2 py-0.5 rounded border border-green-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                In: {new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              {record.checkOutTime ? (
                                <>
                                  <div className="text-amber-400 text-[11px] font-semibold flex items-center gap-1 bg-amber-500/10 w-fit px-2 py-0.5 rounded border border-amber-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                    Out: {new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  <div className="text-zinc-300 text-[11px] font-bold flex items-center gap-1 bg-zinc-800 w-fit px-2 py-0.5 rounded border border-zinc-700">
                                    ⏱️ Worked: {(() => {
                                      const diffMs = new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime();
                                      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                                      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                      return `${diffHrs}h ${diffMins}m`;
                                    })()}
                                  </div>
                                </>
                              ) : (
                                <div className="text-emerald-400 text-[10px] font-black tracking-wider animate-pulse flex items-center gap-1 ml-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ON DUTY
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span 
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                              isPresent 
                                ? isClockedOut
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : record.status === 'ABSENT'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                            }`}
                          >
                            {isPresent ? (isClockedOut ? 'CLOCKED OUT' : 'ON DUTY') : (record.status || 'UNMARKED')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Modal */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-sm" 
            onClick={() => setIsAttendanceModalOpen(false)}
          ></div>
          <div
            className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col shadow-2xl animate-fade-in"
            style={{ 
              padding: `${cardPadding * 1.5}px`,
              maxHeight: '90vh' 
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4" style={{ marginBottom: `${spacing}px` }}>
              <div>
                <h3 className="font-bold text-white" style={{ fontSize: `${responsive.fontSize.heading}px` }}>
                  Mark Staff Attendance
                </h3>
                <p className="text-zinc-400 mt-1" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                  Select a staff member below and press the power button to clock them in/out.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAttendanceModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Date display */}
            <div className="flex items-center justify-between bg-zinc-800/30 border border-zinc-800 rounded-lg p-3" style={{ marginBottom: `${spacing}px` }}>
              <span className="text-zinc-400 font-medium" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                Attendance Date:
              </span>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => {
                  setAttendanceDate(e.target.value);
                  setSelectedStaffId(null);
                }}
                className="bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-1 font-semibold focus:outline-none focus:border-yellow-400"
                style={{ fontSize: `${responsive.fontSize.body}px` }}
              />
            </div>

            {/* Staff Selector */}
            <div className="flex-shrink-0 overflow-y-auto no-scrollbar" style={{ marginBottom: `${spacing}px`, minHeight: '120px' }}>
              <p className="text-zinc-400 font-bold mb-3 uppercase tracking-wider" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                Select Staff Member
              </p>
              
              {attendanceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : attendance.length === 0 ? (
                <div className="text-center py-8 text-zinc-500" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                  No staff members available.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {attendance.map((record) => {
                    const isSelected = selectedStaffId === record.staffMember._id;
                    const isPresent = record.status === 'PRESENT';
                    const isClockedOut = isPresent && record.checkOutTime;
                    return (
                      <button
                        key={record.staffMember._id}
                        type="button"
                        onClick={() => setSelectedStaffId(record.staffMember._id)}
                        className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'bg-yellow-400/10 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)] scale-[0.98]'
                            : 'bg-zinc-800/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'
                        }`}
                        style={{ height: '90px' }}
                      >
                        <div className="w-full">
                          <div className="font-semibold text-white truncate w-full" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                            {record.staffMember.name}
                          </div>
                          <div className="text-zinc-500 text-xs truncate w-full">
                            {record.staffMember.phoneNumber}
                          </div>
                        </div>

                        {/* Status badge in card */}
                        <div className="flex items-center justify-between mt-2 w-full">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${isPresent ? isClockedOut ? 'bg-amber-500' : 'bg-green-500 animate-pulse' : record.status === 'ABSENT' ? 'bg-red-500' : 'bg-zinc-600'}`}></span>
                            <span className={`text-xs font-semibold ${isPresent ? isClockedOut ? 'text-amber-400' : 'text-green-400' : record.status === 'ABSENT' ? 'text-red-400' : 'text-zinc-400'}`}>
                              {isPresent ? (isClockedOut ? 'CLOCKED OUT' : 'ON DUTY') : (record.status || 'UNMARKED')}
                            </span>
                          </div>
                          {isPresent && record.checkInTime && (
                            <span className="text-zinc-400 text-xs font-medium">
                              {new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Power Button Section */}
            <div className="border-t border-zinc-800 pt-6 bg-zinc-900/50 flex flex-col items-center justify-center">
              {(() => {
                const selectedRecord = attendance.find(r => r.staffMember._id === selectedStaffId);
                const isCurrentPresent = selectedRecord?.status === 'PRESENT';
                
                return selectedStaffId && selectedRecord ? (
                  <div className="flex flex-col items-center">
                    <p className="text-zinc-400 mb-3" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                      Status for <span className="font-bold text-white">{selectedRecord.staffMember.name}</span>
                    </p>
                    
                    {/* Big Power Button */}
                    <button
                      type="button"
                      onClick={handleTogglePower}
                      disabled={markingId !== null || isButtonLocked}
                      className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-500 cursor-pointer focus:outline-none active:scale-95 ${
                        isButtonLocked
                          ? 'bg-zinc-800 text-zinc-600 border-4 border-zinc-750 cursor-not-allowed opacity-80'
                          : isCurrentPresent 
                            ? selectedRecord.checkOutTime
                              ? 'bg-amber-500 text-zinc-950 shadow-[0_0_35px_rgba(245,158,11,0.6)] border-4 border-amber-400 hover:bg-amber-400'
                              : 'bg-green-500 text-zinc-950 shadow-[0_0_35px_rgba(34,197,94,0.6)] border-4 border-green-400 hover:bg-green-400' 
                            : 'bg-zinc-800 text-zinc-500 border-4 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-300'
                      }`}
                    >
                      {/* Outer circular indicator ring */}
                      {isCurrentPresent && !isButtonLocked && (
                        <span className={`absolute inset-0 rounded-full border ${selectedRecord.checkOutTime ? 'border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'border-green-300 shadow-[0_0_15px_rgba(34,197,94,0.4)]'} animate-ping opacity-25`}></span>
                      )}

                      {markingId ? (
                        <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : isButtonLocked ? (
                        <svg className="w-11 h-11 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      ) : (
                        <svg className="w-14 h-14 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5.636 18.364a9 9 0 1112.728 0M12 3v9" />
                        </svg>
                      )}
                    </button>
                    
                    <div className="text-center mt-4">
                      {isButtonLocked ? (
                        <>
                          <span className="font-extrabold tracking-wider text-red-400 text-lg">
                            LOCKED: {lockCountdown}
                          </span>
                          <p className="text-zinc-500 text-xs mt-1">
                            Double-click protection active
                          </p>
                        </>
                      ) : (
                        <>
                          <span 
                            className={`font-black tracking-wider transition-colors duration-500 ${
                              isCurrentPresent 
                                ? selectedRecord.checkOutTime
                                  ? 'text-amber-400'
                                  : 'text-green-400' 
                                : 'text-zinc-400'
                            }`}
                            style={{ fontSize: `${responsive.fontSize.subheading}px` }}
                          >
                            {isCurrentPresent 
                              ? selectedRecord.checkOutTime
                                ? 'STAFF CLOCKED OUT'
                                : 'STAFF IS PRESENT (CLOCKED IN)' 
                              : 'STAFF IS ABSENT'}
                          </span>
                          <p className="text-zinc-500 text-xs mt-1">
                            {isCurrentPresent 
                              ? selectedRecord.checkOutTime
                                ? 'Press power button to UNDO CLOCK OUT'
                                : 'Press power button to CLOCK OUT' 
                              : 'Press power button to CLOCK IN'}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Secondary Reset Button */}
                    <button
                      type="button"
                      onClick={handleResetToAbsent}
                      disabled={markingId !== null || isButtonLocked}
                      className="mt-6 text-zinc-500 hover:text-red-400 disabled:opacity-50 disabled:hover:text-zinc-500 text-xs font-semibold underline transition-colors"
                    >
                      Reset Attendance (Mark Absent)
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 bg-zinc-900 border border-dashed border-zinc-800 rounded-xl w-full text-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-2 border border-zinc-700">
                      <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-zinc-400 font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                      Please select a staff member
                    </p>
                    <p className="text-zinc-500 text-xs mt-1">
                      Choose a card above to activate the power button
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && selectedHistoryStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-sm" 
            onClick={() => setIsHistoryModalOpen(false)}
          ></div>
          <div
            className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl mx-4 overflow-hidden flex flex-col shadow-2xl animate-fade-in"
            style={{ 
              padding: `${cardPadding * 1.5}px`,
              maxHeight: '90vh' 
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4" style={{ marginBottom: `${spacing}px` }}>
              <div>
                <h3 className="font-bold text-white flex items-center gap-2" style={{ fontSize: `${responsive.fontSize.heading}px` }}>
                  <span>📅 Attendance History</span>
                  <span className="text-yellow-400">|</span>
                  <span className="text-zinc-300 font-semibold">{selectedHistoryStaff.name}</span>
                </h3>
                <p className="text-zinc-400 mt-1" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                  Phone: {selectedHistoryStaff.phoneNumber} | Weekly Grid {(() => {
                    if (historyRecords.length < 7) return "(Monday to Sunday)";
                    const firstDate = new Date(historyRecords[0].date);
                    const lastDate = new Date(historyRecords[6].date);
                    const firstLocalDate = new Date(firstDate.getTime() + firstDate.getTimezoneOffset() * 60 * 1000);
                    const lastLocalDate = new Date(lastDate.getTime() + lastDate.getTimezoneOffset() * 60 * 1000);
                    
                    const opt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
                    const firstStr = firstLocalDate.toLocaleDateString([], opt);
                    const lastStr = lastLocalDate.toLocaleDateString([], { ...opt, year: 'numeric' });
                    return `(${firstStr} - ${lastStr})`;
                  })()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto min-h-0" style={{ marginBottom: `${spacing}px` }}>
              {isHistoryLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-zinc-400 mt-4 font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>Loading history logs...</p>
                </div>
              ) : historyRecords.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 bg-zinc-950/20 border border-zinc-850 rounded-xl">
                  No attendance records found for this staff member for this week.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Grid Table */}
                  <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/20">
                    <div className="grid grid-cols-5 bg-zinc-900 border-b border-zinc-800 p-3 text-zinc-400 font-extrabold text-xs uppercase tracking-wider">
                      <div>Date</div>
                      <div className="text-center">Status</div>
                      <div className="text-center">Clock In</div>
                      <div className="text-center">Clock Out</div>
                      <div className="text-right">Worked Time</div>
                    </div>
                    
                    <div className="divide-y divide-zinc-800">
                      {historyRecords.map((item) => {
                        const dateObj = new Date(item.date);
                        // Add timezone offset correction to display exact UTC date day locally
                        const localDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60 * 1000);
                        const dateFormatted = localDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
                        
                        const isPresent = item.status === 'PRESENT';
                        const isClockedOut = isPresent && item.checkOutTime;
                        
                        // Worked calculation
                        let workedText = '-';
                        if (isPresent && item.checkInTime && item.checkOutTime) {
                          const diffMs = new Date(item.checkOutTime).getTime() - new Date(item.checkInTime).getTime();
                          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                          const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                          workedText = `${diffHrs}h ${diffMins}m`;
                        } else if (isPresent && item.checkInTime && !item.checkOutTime) {
                          workedText = 'On Duty';
                        }

                        return (
                          <div 
                            key={item.date} 
                            className="grid grid-cols-5 p-3 items-center hover:bg-zinc-900/50 transition-colors"
                            style={{ fontSize: `${responsive.fontSize.body}px` }}
                          >
                            <div className="font-bold text-white">{dateFormatted}</div>
                            
                            <div className="text-center">
                              <span 
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  isPresent 
                                    ? isClockedOut
                                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                      : 'bg-green-500/15 text-green-400 border border-green-500/20' 
                                    : item.status === 'ABSENT'
                                      ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50'
                                }`}
                              >
                                {isPresent ? (isClockedOut ? 'CLOCKED OUT' : 'ON DUTY') : (item.status || 'UNMARKED')}
                              </span>
                            </div>

                            <div className="text-center text-zinc-300">
                              {isPresent && item.checkInTime 
                                ? new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                : '-'
                              }
                            </div>

                            <div className="text-center text-zinc-300">
                              {isPresent && item.checkOutTime 
                                ? new Date(item.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                : '-'
                              }
                            </div>

                            <div className={`text-right font-black ${isPresent && !isClockedOut ? 'text-emerald-400 animate-pulse' : 'text-zinc-400'}`}>
                              {workedText}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="grid grid-cols-2 gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div>
                      <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Days Present (Weekly Total)</div>
                      <div className="font-extrabold text-white text-xl mt-1">
                        {historyRecords.filter(r => r.status === 'PRESENT').length} / 7 Days
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Active Hours Worked</div>
                      <div className="font-extrabold text-yellow-400 text-xl mt-1">
                        {(() => {
                          let totalMs = 0;
                          historyRecords.forEach(item => {
                            if (item.status === 'PRESENT' && item.checkInTime && item.checkOutTime) {
                              totalMs += new Date(item.checkOutTime).getTime() - new Date(item.checkInTime).getTime();
                            }
                          });
                          const totalHrs = Math.floor(totalMs / (1000 * 60 * 60));
                          const totalMins = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
                          return `${totalHrs}h ${totalMins}m`;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-800 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
                style={{ padding: `${spacing / 2}px ${cardPadding * 1.5}px`, fontSize: `${responsive.fontSize.body}px` }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
