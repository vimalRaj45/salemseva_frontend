import React from 'react';
import LegalLayout from './LegalLayout';
import {
  Lock,
  Database,
  EyeOff,
  HardDrive,
  FileCheck2,
  ShieldCheck,
  Server,
  Smartphone
} from 'lucide-react';

const privacySections = [
  { id: 'sec-collection', title: '1. Information We Collect' },
  { id: 'sec-masking', title: '2. Virtual Masking & Shielding' },
  { id: 'sec-security', title: '3. Data Storage & Cryptography' },
  { id: 'sec-rights', title: '4. User Rights & Account Purge' }
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Data Protection, Masking & Telemetry Standards under the Digital Personal Data Protection Act, 2023"
      effectiveDate="October 15, 2026"
      jurisdiction="Salem District, Tamil Nadu"
      categoryBadge="Data Governance"
      sections={privacySections}
    >
      {/* Clause 1 */}
      <section id="sec-collection" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Database size={18} color="#0284C7" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
            1. Information We Collect
          </h2>
        </div>

        <p style={{ fontSize: '14.5px', lineHeight: 1.75, color: '#334155', margin: '0 0 16px 0' }}>
          SalemSeva adheres to strict data minimization principles under the Digital Personal Data Protection Act, 2023 (DPDP). We collect solely the information indispensable for scheduling, verifying, and dispatching doorstep technical assistance across Salem district:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px' }}>
            <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
              Customer Contact & Address Coordinates
            </strong>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B', lineHeight: 1.6 }}>
              Full customer name, primary 10-digit mobile number, service delivery address within Salem, nearest landmark, and optional billing email address.
            </p>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px' }}>
            <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
              Real-Time GPS Telemetry
            </strong>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B', lineHeight: 1.6 }}>
              Precision geographical coordinates collected during booking dispatch to compute real-time ETA, route nearest active technicians, and calculate distance traveled. Telemetry stops immediately when a job completes.
            </p>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px' }}>
            <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
              Diagnostic Visuals & Media
            </strong>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B', lineHeight: 1.6 }}>
              User-submitted photographs of electrical meters, appliance model numbers, water leakages, and optional audio recordings describing the malfunction for pre-visit technician tooling.
            </p>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px' }}>
            <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
              Technician Partner e-KYC Records
            </strong>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B', lineHeight: 1.6 }}>
              Aadhaar identification card, bank account IFSC details for direct payouts, police verification certificate, and trade licenses.
            </p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '32px 0 0 0' }} />
      </section>

      {/* Clause 2 */}
      <section id="sec-masking" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <EyeOff size={18} color="#0284C7" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
            2. Virtual Masking & Phone Number Shielding
          </h2>
        </div>

        <p style={{ fontSize: '14.5px', lineHeight: 1.75, color: '#334155', margin: '0 0 16px 0' }}>
          To prevent personal harassment, spam solicitation, or unauthorized off-platform contact, SalemSeva implements zero-exposure communication relays:
        </p>

        <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <strong style={{ fontSize: '13px', color: '#166534', display: 'block', marginBottom: '4px' }}>
            VoIP Proxy & Ephemeral Virtual Numbers
          </strong>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#14532D', lineHeight: 1.6 }}>
            Direct customer cellular numbers are never visible to the technician, and partner personal numbers are never displayed to the customer. All calls are routed through an encrypted in-app voice bridge.
          </p>
        </div>

        <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#475569', margin: 0 }}>
          In-app dispatch messaging logs are stored temporarily for the active duration of the booking. Once the job status reaches Completed or Cancelled, the chat session closes and the transcript is archived in encrypted cold storage for 60 days strictly for audit trail and dispute arbitration.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '32px 0 0 0' }} />
      </section>

      {/* Clause 3 */}
      <section id="sec-security" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <HardDrive size={18} color="#0284C7" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
            3. Data Storage, Residency & Cryptographic Security
          </h2>
        </div>

        <p style={{ fontSize: '14.5px', lineHeight: 1.75, color: '#334155', margin: '0 0 16px 0' }}>
          All database and object store repositories are strictly localized within the sovereign territory of the Republic of India:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '16px' }}>
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
            <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
              Data in Transit: TLS 1.3
            </strong>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B', lineHeight: 1.6 }}>
              Every byte transmitted between the mobile application, browser portal, and backend server is encrypted using modern TLS 1.3 ciphers with strict HTTP Strict Transport Security (HSTS).
            </p>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
            <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
              Data at Rest: AES-256
            </strong>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B', lineHeight: 1.6 }}>
              Neon PostgreSQL databases and AWS S3 document buckets are encrypted using industry-standard AES-256 encryption with automated key rotation.
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px' }}>
          <strong style={{ fontSize: '13px', color: '#1E293B', display: 'block', marginBottom: '4px' }}>
            Zero Third-Party Commercial Data Brokerage
          </strong>
          <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
            SalemSeva does not sell, barter, or monetize user profiles, address history, or spending habits to third-party advertisers, lead brokers, or marketing networks.
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '32px 0 0 0' }} />
      </section>

      {/* Clause 4 */}
      <section id="sec-rights" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <FileCheck2 size={18} color="#0F172A" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
            4. User Rights, Data Portability & Account Purge
          </h2>
        </div>

        <p style={{ fontSize: '14.5px', lineHeight: 1.75, color: '#334155', margin: '0 0 14px 0' }}>
          Under Section 11 of the Digital Personal Data Protection Act, 2023, every registered citizen retains full sovereignty over their personally identifiable data. You are entitled to:
        </p>

        <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '14px', lineHeight: 1.8, color: '#334155' }}>
          <li>Request a machine-readable summary of all personal records and service logs linked to your phone number.</li>
          <li>Rectify erroneous addresses, alternate contact numbers, or vehicle registration data.</li>
          <li>Revoke real-time location telemetry permissions at any time via your device settings.</li>
          <li>Request permanent account deletion and erasure of past booking histories (subject to statutory financial audit retention periods).</li>
        </ul>

        <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>Data Protection Officer (DPO)</strong>
            <span style={{ fontSize: '12.5px', color: '#64748B' }}>Compliance & Privacy Office, Salem Central Operations</span>
          </div>
          <div>
            <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>Formal Inquiries</strong>
            <span style={{ fontSize: '12.5px', color: '#0284C7', fontWeight: 600 }}>privacy@salemseva.in</span>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}
