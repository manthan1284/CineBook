import React from 'react';
import { FileSpreadsheet, Download, FileText, CheckCircle2 } from 'lucide-react';

const AdminReportsPage = () => {
  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
          Data Export & Financial Reports
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Generate and download complete CSV audit archives for booking operations and accounting.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Bookings Report Card */}
        <div
          style={{
            background: '#13131C',
            border: '1px solid #20202E',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: 'rgba(229, 9, 20, 0.15)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <FileSpreadsheet size={24} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
              Bookings & Ticket Sales Report
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Includes all platform reservations, customer details (name, email, phone), movie titles, theatres, dates, showtimes, seats allocated, and cancellation status.
            </p>
          </div>

          <a
            href="/api/admin/export/bookings"
            download="cinebook_bookings_report.csv"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem' }}
          >
            <Download size={16} /> Download Bookings CSV
          </a>
        </div>

        {/* Revenue Report Card */}
        <div
          style={{
            background: '#13131C',
            border: '1px solid #20202E',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <FileText size={24} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
              Payment & Revenue Audit Report
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Includes payment IDs, transaction references, payment methods (Card, UPI, NetBanking), currency amounts in INR, timestamps, and refunded charge transactions.
            </p>
          </div>

          <a
            href="/api/admin/export/revenue"
            download="cinebook_revenue_report.csv"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', background: '#10B981', borderColor: '#10B981' }}
          >
            <Download size={16} /> Download Revenue CSV
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
