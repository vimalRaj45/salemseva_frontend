import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Scale,
  Clock,
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  Lock,
  Percent,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function TermsPage() {
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
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0066CC', backgroundColor: '#EFF6FF', padding: '4px 10px', borderRadius: '12px', border: '1px solid #DBEAFE' }}>
              Legal Document
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
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0066CC',
                border: '1px solid #DBEAFE'
              }}
            >
              <Scale size={24} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
                Terms & Conditions
              </h1>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                Master Service Agreement & Intermediary Platform Policies
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
              <ShieldCheck size={14} color="#16A34A" />
              <span>Jurisdiction: Salem District, Tamil Nadu</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Percent size={14} color="#0066CC" />
              <span>Platform Facilitation: 2.0%</span>
            </div>
          </div>
        </div>

        {/* Section 1: Introduction & Technology Intermediary Status */}
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
            <FileText size={18} color="#0066CC" />
            1. Platform Nature and Intermediary Status
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
            SalemSeva ("Platform", "we", "us") functions exclusively as a technology-driven marketplace and intermediary under the Information Technology Act, 2000. SalemSeva connects consumers ("Users" or "Customers") residing within the municipal and district limits of Salem, Tamil Nadu, with vetted, independent service professionals ("Technicians", "Specialists", or "Partners").
          </p>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', margin: 0 }}>
            SalemSeva does not directly employ service technicians, nor does it control or direct their physical performance during on-site repairs. All service contracts for physical diagnostic, plumbing, electrical, carpentry, cleaning, or appliance repairs are entered into directly between the Customer and the assigned independent Technician.
          </p>
        </div>

        {/* Section 2: Financial Structure & 2% Platform Fee */}
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
            2. Platform Cut, Commission & Settlement
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
            To sustain real-time dispatch, server infrastructure, map telemetry, secure escrow custody, and customer grievance desks, SalemSeva applies a standard fee structure:
          </p>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px 0', fontSize: '14px', lineHeight: 1.8, color: '#334155' }}>
            <li>
              <strong>SalemSeva Platform Cut:</strong> A non-negotiable fee of exactly <strong>2.0%</strong> is deducted from the gross booking amount.
            </li>
            <li>
              <strong>Technician Payout:</strong> Independent technicians receive <strong>98.0%</strong> of the gross billable amount for all successfully completed services, disbursed directly via Razorpay automated bank settlement transfers.
            </li>
            <li>
              <strong>Transparent Invoicing:</strong> Every booking invoice generated inside the application itemizes the diagnostic inspection fee, labor charges, materials or spare parts, and the platform facilitation cut.
            </li>
          </ul>
        </div>

        {/* Section 3: Admin Authority & Account Blocking */}
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
            <AlertTriangle size={18} color="#D97706" />
            3. Account Suspension & Administrative Blocking Rights
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
            SalemSeva Central Operations Desk administrators reserve the absolute right to suspend, terminate, or indefinitely block any Customer or Partner account immediately upon discovery of:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginTop: '12px' }}>
            <div style={{ backgroundColor: '#FFFBEB', padding: '14px', borderRadius: '12px', border: '1px solid #FDE68A' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400E', display: 'block', marginBottom: '4px' }}>
                Customer Grounds for Blocking
              </span>
              <span style={{ fontSize: '12.5px', color: '#78350F', lineHeight: 1.6 }}>
                Verbal or physical misconduct towards partners, repeated fraudulent cancellations after arrival, chargeback evasion, or unauthorized bypassing of platform payments.
              </span>
            </div>
            <div style={{ backgroundColor: '#FEF2F2', padding: '14px', borderRadius: '12px', border: '1px solid #FECACA' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#991B1B', display: 'block', marginBottom: '4px' }}>
                Technician Grounds for Blocking
              </span>
              <span style={{ fontSize: '12.5px', color: '#7F1D1D', lineHeight: 1.6 }}>
                Soliciting off-platform cash transactions, falsifying KYC or trade licenses, severe customer safety violations, recurring no-shows, or poor ratings below quality thresholds.
              </span>
            </div>
          </div>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#64748B', margin: '14px 0 0 0' }}>
            Blocked individuals are restricted from logging in, dispatching jobs, going on duty, or initiating new service requests across all SalemSeva mobile and web interfaces.
          </p>
        </div>

        {/* Section 4: Doorstep Service Protocol & Safety */}
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
            4. Partner Verification & Doorstep Safety Standards
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
            Every partner onboarded on the SalemSeva network must pass mandatory identity authentication, including DigiLocker government Aadhaar verification, trade skill vetting, and background checks. Customers agree to provide safe, unimpeded access to the premises for the technician during daytime service hours (8:00 AM to 8:00 PM).
          </p>
        </div>

        {/* Section 5: Governing Law & Jurisdiction */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '28px'
          }}
        >
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={18} color="#0F172A" />
            5. Governing Law and Dispute Arbitration
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
            These terms are governed in accordance with the laws of the Republic of India. Any disputes, claims, or controversies arising out of or relating to SalemSeva platform services shall be subject to the exclusive jurisdiction of the competent courts of Salem City, Tamil Nadu.
          </p>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', margin: 0 }}>
            For grievance redressal or legal notices, contact our compliance officer at legal@salemseva.in or via our 24/7 hotline at 1800-425-7253.
          </p>
        </div>
      </div>
    </div>
  );
}
