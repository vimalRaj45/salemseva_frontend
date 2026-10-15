import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  Percent,
  Clock,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  Calendar,
  HelpCircle
} from 'lucide-react';

export default function RefundPolicyPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', paddingBottom: '80px' }}>
      {/* Top Header / Breadcrumb */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '16px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#0F172A',
              fontWeight: 700,
              fontSize: '14px'
            }}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEF2F2', padding: '4px 10px', borderRadius: '12px', border: '1px solid #FECACA' }}>
              Refund Guidelines
            </span>
          </div>
        </div>
      </div>

      {/* Main Document Body */}
      <div style={{ maxWidth: '960px', margin: '32px auto', padding: '0 20px' }}>
        {/* Document Hero */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '32px 28px',
            marginBottom: '28px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#FEF2F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DC2626',
                border: '1px solid #FECACA'
              }}
            >
              <RotateCcw size={24} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
                Cancellation & Refund Policy
              </h1>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                Service Guarantee, Fee Retentions & Settlement Timelines
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #F1F5F9',
              fontSize: '12px',
              color: '#475569'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#64748B" />
              <span>Effective Date: October 15, 2026</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Percent size={14} color="#DC2626" />
              <span>2% Platform Fee + 2% Gateway Charge Retained</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#16A34A" />
              <span>30-Day Doorstep Re-Service Warranty</span>
            </div>
          </div>
        </div>

        {/* Section 1: Standard Fee Deductions on Refund */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '28px',
            marginBottom: '20px'
          }}
        >
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Percent size={18} color="#0066CC" />
            1. Platform & Gateway Deductions on Refund
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', margin: '0 0 14px 0' }}>
            When a customer cancels a paid booking or requests a monetary reversal, SalemSeva applies statutory and operational fee retentions to cover sunk facilitation and banking interchange expenses:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>SalemSeva Platform Facilitation</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0066CC' }}>2.0%</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                Covers technician dispatch matching, dispatch ledger processing, and GPS server telemetry allocated to the booking.
              </p>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Razorpay Service Charge</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0066CC' }}>2.0%</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                Standard payment gateway interchange and banking settlement transaction fees incurred at the time of payment processing.
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: '#EFF6FF', padding: '18px', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E40AF', display: 'block', marginBottom: '6px' }}>
              Practical Refund Calculation Example
            </span>
            <div style={{ fontSize: '13px', color: '#1E3A8A', lineHeight: 1.8 }}>
              <div>Original Visit / Booking Fee: <strong>₹99.00</strong></div>
              <div>SalemSeva 2% Platform Fee: <strong>-₹1.98</strong></div>
              <div>Razorpay 2% Gateway Fee: <strong>-₹1.98</strong></div>
              <div style={{ borderTop: '1px dashed #93C5FD', marginTop: '6px', paddingTop: '6px', fontWeight: 800, color: '#1D4ED8' }}>
                Net Refund Credited to Customer: <strong>₹95.04</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Cancellation Stages & Eligibility */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '28px',
            marginBottom: '20px'
          }}
        >
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#D97706" />
            2. Cancellation Stages & Eligibility
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                Stage 1: Before Technician Departure / Ride Start
              </span>
              <span style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                Full refund eligible, minus the standard 2% platform fee and 2% Razorpay service charge.
              </span>
            </div>

            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                Stage 2: Technician In Transit or Arrived at Premises
              </span>
              <span style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                If the customer cancels after the technician has traveled to the doorstep or arrived, the baseline diagnostic fee (₹99) is disbursed to the technician to compensate for travel time and fuel expenses.
              </span>
            </div>

            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                Stage 3: Service Completed & Signed Off
              </span>
              <span style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                Completed services are not eligible for direct cash refund. They are covered under the 30-day SalemSeva Re-Service Guarantee.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: 30-Day Doorstep Re-Service Guarantee */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '28px',
            marginBottom: '20px'
          }}
        >
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#16A34A" />
            3. 30-Day SalemSeva Re-Service Warranty
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
            Every completed home service booked through SalemSeva includes our 30-day workmanship assurance:
          </p>
          <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', lineHeight: 1.8, color: '#334155' }}>
            <li>
              If the exact repaired issue recurs within 30 calendar days of service completion, SalemSeva will dispatch a senior certified technician to re-inspect and rectify the fault at <strong>zero additional labor charges</strong>.
            </li>
            <li>
              Replacement spare parts carry the manufacturer or dealer warranty as stated in the digital quote and invoice.
            </li>
          </ul>
        </div>

        {/* Section 4: Refund Timelines & Bank Processing */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '28px'
          }}
        >
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} color="#0F172A" />
            4. Refund Settlement Timelines
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
            Refunds initiated by SalemSeva are processed automatically through Razorpay:
          </p>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px 0', fontSize: '14px', lineHeight: 1.8, color: '#334155' }}>
            <li>
              <strong>UPI & Net Banking:</strong> 2 to 4 business banking days.
            </li>
            <li>
              <strong>Credit / Debit Cards:</strong> 3 to 7 business banking days depending on the issuing bank.
            </li>
            <li>
              <strong>SalemSeva In-App Wallet:</strong> Immediate credit with zero deductions.
            </li>
          </ul>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#64748B', margin: 0 }}>
            For questions regarding refund status or dispute resolution, contact support@salemseva.in with your Booking ID.
          </p>
        </div>
      </div>
    </div>
  );
}
