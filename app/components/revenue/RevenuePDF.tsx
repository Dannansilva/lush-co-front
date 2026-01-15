import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { MonthlyRevenueData } from '@/app/types/revenue';

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statSubtext: {
    fontSize: 9,
    color: '#999',
    marginTop: 3,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableCol: {
    flex: 1,
  },
  tableColHeader: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  tableColText: {
    fontSize: 10,
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
});

interface RevenuePDFProps {
  data: MonthlyRevenueData;
}

export const RevenuePDF: React.FC<RevenuePDFProps> = ({ data }) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Revenue Report</Text>
          <Text style={styles.subtitle}>
            {data.monthName} {data.year} • Generated on {generatedDate}
          </Text>
        </View>

        {/* Revenue Summary Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Revenue</Text>
              <Text style={styles.statValue}>{formatCurrency(data.totalRevenue)}</Text>
              <Text style={styles.statSubtext}>{data.monthName} {data.year}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Appointments</Text>
              <Text style={styles.statValue}>{data.totalAppointments}</Text>
              <Text style={styles.statSubtext}>{data.monthName} {data.year}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Avg Transaction</Text>
              <Text style={styles.statValue}>{formatCurrency(data.avgTransaction)}</Text>
              <Text style={styles.statSubtext}>{data.monthName} {data.year}</Text>
            </View>
          </View>
        </View>

        {/* Revenue by Staff Member */}
        {data.revenueByStaff && data.revenueByStaff.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue by Staff Member</Text>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <View style={[styles.tableCol, { flex: 2 }]}>
                  <Text style={styles.tableColHeader}>Staff Name</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableColHeader}>Appointments</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableColHeader}>Avg Transaction</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableColHeader}>Total Revenue</Text>
                </View>
              </View>

              {/* Table Rows */}
              {data.revenueByStaff.map((staff, index) => {
                const avgTransaction = staff.appointmentCount > 0
                  ? staff.totalRevenue / staff.appointmentCount
                  : 0;

                return (
                  <View key={staff.staffId || index} style={styles.tableRow}>
                    <View style={[styles.tableCol, { flex: 2 }]}>
                      <Text style={styles.tableColText}>{staff.staffName}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableColText}>{staff.appointmentCount}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableColText}>{formatCurrency(avgTransaction)}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text style={styles.tableColText}>{formatCurrency(staff.totalRevenue)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Lush & Co Management • Revenue Report</Text>
          <Text>This is a computer-generated document</Text>
        </View>
      </Page>
    </Document>
  );
};
