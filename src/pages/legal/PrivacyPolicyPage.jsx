import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Database,
  MapPin,
  Clock,
  ArrowLeft,
  Server,
  FileCheck2,
  HardDrive
} from 'lucide-react';

export default function PrivacyPolicyPage() {
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
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
              Data Governance
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
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
                border: '1px solid #A7F3D0'
              }}
            >
              <Lock size={24} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
                Privacy Policy
              </h1>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                Data Protection, Masking & Telemetry Standards (DPDP Act, 2023)
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
              <span>Compliance: Digital Personal Data Protection Act, 2023</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <EyeOff size={14} color="#2563EB" />
              <span>Masked VoIP & Number Shielding Active</span>
            </div>
          </div>
        </div>

        {/* Section 1: Overview & Scope */}
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
            <Database size={18} color="#059669" />
            1. Information We Collect
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
            SalemSeva collects minimal personal information necessary to deliver doorstep technician services within Salem district:
          </p>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px 0', fontSize: '14px', lineHeight: 1.8, color: '#334155' }}>
            <li>
              <strong>Customer Identity:</strong> Mobile phone number, full name, doorstep service address, and optional landmark references.
            </li>
            <li>
              <strong>Live Geo-Location:</strong> Exact GPS coordinates collected during booking creation to dispatch the closest available certified technician within Salem municipal limits.
            </li>
            <li>
              <strong>Diagnostic Media:</strong> User-uploaded photographs of faulty appliances, meters, or repair zones, as well as voice problem descriptions.
            </li>
            <li>
              <strong>Partner e-KYC Records:</strong> Government Aadhaar identification, trade licenses, photograph, bank IFSC, and account details for direct settlements.
            </li>
          </ul>
        </div>

        {/* Section 2: Virtual Masking & Communication Security */}
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
            <EyeOff size={18} color="#2563EB" />
            2. Virtual Masking & Phone Number Shielding
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
            To safeguard the privacy of residents and service partners, direct cellular telephone numbers are never exposed in the interface:
          </p>
          <div style={{ backgroundColor: '#F0FDF4', padding: '16px', borderRadius: '12px', border: '1px solid #BBF7D0', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#166534', display: 'block', marginBottom: '4px' }}>
              Virtual Proxy Calling (VoIP Relay)
            </span>
            <span style={{ fontSize: '12.5px', color: '#14532D', lineHeight: 1.6 }}>
              Calls between customer and technician are routed through an encrypted in-app voice relay. Neither party's personal SIM number is displayed on the opposing device screen.
            </span>
          </div>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#64748B', margin: 0 }}>
            Chat messages sent via the SalemSeva dispatch drawer are retained solely for the duration of the active booking and archived securely for dispute resolution purposes.
          </p>
        </div>

        {/* Section 3: Data Storage, S3 & Encryption */}
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
            <HardDrive size={18} color="#0066CC" />
            3. Data Storage & Cryptographic Security
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
            All user data is stored within ISO/IEC 27001-certified data centers located in India (AWS Asia-Pacific Mumbai Region):
          </p>
          <ul style={{ paddingLeft: '20px', margin: '0 0 14px 0', fontSize: '14px', lineHeight: 1.8, color: '#334155' }}>
            <li>
              <strong>Data in Transit:</strong> Encrypted using TLS 1.3 cryptographic protocols.
            </li>
            <li>
              <strong>Data at Rest:</strong> AES-256 standard encryption applied to database storage and cloud object stores containing KYC documents and diagnostic images.
            </li>
            <li>
              <strong>Zero Data Selling:</strong> SalemSeva does not sell, rent, or trade customer or technician personal records to any third-party marketing companies.
            </li>
          </ul>
        </div>

        {/* Section 4: Customer Rights & Data Deletion */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '28px'
          }}
        >
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck2 size={18} color="#0F172A" />
            4. Your Rights & Account Purge
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', margin: '0 0 12px 0' }}>
            Under the Digital Personal Data Protection Act, 2023, users maintain full ownership over their data. You can request a summary of stored personal records, revoke location telemetry permissions, or request complete account erasure by contacting our Data Protection Officer at privacy@salemseva.in.
          </p>
        </div>
      </div>
    </div>
  );
}
