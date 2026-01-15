"use client";

import React, { useState } from "react";
import { useScreenSize, getResponsiveValues } from "@/app/hooks/useScreenSize";
import { Appointment } from "@/app/utils/calendarUtils";
import { pdf } from '@react-pdf/renderer';
import { AppointmentBillPDF } from "./AppointmentBillPDF";

interface ShareBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
}

export default function ShareBillModal({ isOpen, onClose, appointment }: ShareBillModalProps) {
  const { width } = useScreenSize();
  const responsive = getResponsiveValues(width, 800);

  const cardPadding = Math.max(12, Math.min(width * 0.015, 20));
  const spacing = Math.max(12, Math.min(width * 0.02, 16));

  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Generate PDF and get URL
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<AppointmentBillPDF appointment={appointment} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      return url;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate bill. Please try again.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Download PDF
  const handleDownload = async () => {
    const url = pdfUrl || await generatePDF();
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = `Bill_${appointment.clientName}_${appointment.date}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share via WhatsApp
  const handleWhatsAppShare = async () => {
    // Create message text
    const message = `
🧾 *Appointment Bill - Lush & Co*

📋 Bill Details:
• Customer: ${appointment.clientName}
• Date: ${new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
• Time: ${appointment.time}
• Service: ${appointment.service}
• Duration: ${appointment.duration} minutes
• Staff: ${appointment.staffName}

💰 Total Amount: ${formatCurrency(appointment.price)}

✅ Status: ${appointment.status.toUpperCase()}

Thank you for choosing Lush & Co! 💇‍♀️✨
    `.trim();

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = appointment.phone.replace(/\D/g, '');

    // Add country code if not present (assuming Sri Lanka +94)
    let whatsappNumber = cleanPhone;
    if (!cleanPhone.startsWith('94') && cleanPhone.length === 10) {
      whatsappNumber = '94' + cleanPhone.substring(1); // Remove leading 0 and add country code
    }

    // Create WhatsApp URL with message
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  // Share via SMS
  const handleSMSShare = () => {
    const message = `Lush & Co Bill: ${appointment.service} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}. Total: ${formatCurrency(appointment.price)}. Status: ${appointment.status}. Thank you!`;

    // Create SMS URL
    const smsUrl = `sms:${appointment.phone}?body=${encodeURIComponent(message)}`;

    // Open SMS app
    window.location.href = smsUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        style={{ padding: `${cardPadding * 1.5}px` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: `${spacing}px` }}>
          <h2 className="font-bold" style={{ fontSize: `${responsive.fontSize.heading}px` }}>
            Share Bill
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Appointment Summary */}
        <div
          className="bg-zinc-800/50 rounded-lg"
          style={{ padding: `${cardPadding}px`, marginBottom: `${spacing * 1.5}px` }}
        >
          <div className="flex items-start justify-between" style={{ marginBottom: `${spacing / 2}px` }}>
            <div>
              <div className="font-semibold" style={{ fontSize: `${responsive.fontSize.subheading}px` }}>
                {appointment.clientName}
              </div>
              <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                {appointment.phone}
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                appointment.status === 'completed'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              {appointment.status}
            </div>
          </div>
          <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>
            <div>{appointment.service}</div>
            <div>{new Date(appointment.date).toLocaleDateString()} • {appointment.time}</div>
            <div className="font-bold text-yellow-400" style={{ fontSize: `${responsive.fontSize.subheading}px`, marginTop: `${spacing / 2}px` }}>
              {formatCurrency(appointment.price)}
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div style={{ marginBottom: `${spacing}px` }}>
          <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px`, marginBottom: `${spacing}px` }}>
            Choose how to share the bill:
          </div>

          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsAppShare}
            disabled={isGenerating}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px`, marginBottom: `${spacing}px` }}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Share via WhatsApp
          </button>

          {/* SMS Button */}
          <button
            onClick={handleSMSShare}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px`, marginBottom: `${spacing}px` }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Share via SMS
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF Bill
              </>
            )}
          </button>
        </div>

        {/* Info Note */}
        <div
          className="bg-blue-900/20 border border-blue-800 rounded-lg text-blue-400"
          style={{ padding: `${spacing / 2}px ${cardPadding}px`, fontSize: `${responsive.fontSize.small}px` }}
        >
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              WhatsApp and SMS will open in a new window/app with the bill details pre-filled.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
