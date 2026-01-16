import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Appointment } from '@/app/utils/calendarUtils';

// Define styles for PDF bill
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: 3,
    borderBottomColor: '#000',
    paddingBottom: 15,
  },
  companyName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companySubtitle: {
    fontSize: 11,
    color: '#666',
  },
  billTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    color: '#666',
    width: '30%',
  },
  value: {
    fontSize: 11,
    color: '#000',
    width: '70%',
    fontWeight: 'bold',
  },
  servicesTable: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 10,
    fontWeight: 'bold',
    borderBottom: 2,
    borderBottomColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottom: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableCol1: {
    width: '60%',
  },
  tableCol2: {
    width: '20%',
    textAlign: 'right',
  },
  tableCol3: {
    width: '20%',
    textAlign: 'right',
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: 2,
    borderTopColor: '#000',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 20,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    width: '20%',
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#000',
    color: '#fff',
    padding: 10,
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 20,
    color: '#fff',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    width: '20%',
    textAlign: 'right',
    color: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#999',
    borderTop: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  thankYou: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  statusBadge: {
    backgroundColor: '#4ade80',
    color: '#000',
    padding: 5,
    borderRadius: 3,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    textTransform: 'uppercase',
  },
});

interface AppointmentBillPDFProps {
  appointment: Appointment;
}

export const AppointmentBillPDF: React.FC<AppointmentBillPDFProps> = ({ appointment }) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Generate bill number
  const billNumber = `BILL-${appointment.id || appointment._id || 'DRAFT'}`;
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Parse services (could be comma-separated string)
  const services = appointment.service.split(',').map(s => s.trim());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>Lush & Co</Text>
          <Text style={styles.companySubtitle}>Beauty & Wellness Salon</Text>
          <Text style={styles.billTitle}>APPOINTMENT BILL</Text>
          <Text style={{ fontSize: 10, color: '#666' }}>Bill #: {billNumber}</Text>
          <Text style={{ fontSize: 10, color: '#666' }}>Generated: {generatedDate}</Text>
        </View>

        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <Text>{appointment.status}</Text>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{appointment.clientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{appointment.phone}</Text>
          </View>
        </View>

        {/* Appointment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{formatDate(appointment.date)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>{appointment.time}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Staff Member:</Text>
            <Text style={styles.value}>{appointment.staffName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.value}>{appointment.duration} minutes</Text>
          </View>
          {appointment.notes && (
            <View style={styles.row}>
              <Text style={styles.label}>Notes:</Text>
              <Text style={styles.value}>{appointment.notes}</Text>
            </View>
          )}
        </View>

        {/* Services Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.servicesTable}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableCol1}>Service</Text>
              <Text style={styles.tableCol2}>Duration</Text>
              <Text style={styles.tableCol3}>Amount</Text>
            </View>

            {/* Service Rows */}
            {services.map((service, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCol1}>{service}</Text>
                <Text style={styles.tableCol2}>{appointment.duration} min</Text>
                <Text style={styles.tableCol3}>{formatCurrency(appointment.price)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Total Section */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(appointment.price)}</Text>
          </View>

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(appointment.price)}</Text>
          </View>
        </View>

        {/* Thank You Message */}
        <View style={styles.thankYou}>
          <Text>Thank you for choosing Lush & Co!</Text>
          <Text>We look forward to serving you again.</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Lush & Co Management System</Text>
          <Text>For inquiries, please contact us through your staff member</Text>
        </View>
      </Page>
    </Document>
  );
};
