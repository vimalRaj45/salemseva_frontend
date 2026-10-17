import React from 'react';
import LegalLayout from './LegalLayout';
import {
  FileText,
  Percent,
  AlertTriangle,
  ShieldCheck,
  Scale,
  Users,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

const termsSections = [
  { id: 'sec-nature', title: '1. Platform Nature & Intermediary Status' },
  { id: 'sec-commission', title: '2. Platform Cut, Commission & Settlement' },
  { id: 'sec-suspension', title: '3. Suspension & Administrative Blocking' },
  { id: 'sec-safety', title: '4. Partner Verification & Doorstep Safety' },
  { id: 'sec-arbitration', title: '5. Governing Law & Dispute Redressal' }
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="Master Service Agreement, Partner Conduct & Intermediary Marketplace Policies"
      effectiveDate="October 15, 2026"
      jurisdiction="Salem District, Tamil Nadu"
      categoryBadge="Master Agreement"
      sections={termsSections}
    >
      {/* Clause 1 */}
      <section id="sec-nature" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <FileText size={18} color="#0284C7" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
            1. Platform Nature and Intermediary Status
          </h2>
        </div>

        <p style={{ fontSize: '14.5px', lineHeight: 1.75, color: '#334155', margin: '0 0 14px 0' }}>
          SalemSeva ("Platform", "we", "us", or "our") functions exclusively as a technology-driven marketplace and an electronic intermediary as defined under Section 79 of the Information Technology Act, 2000, read alongside the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. SalemSeva provides digital infrastructure enabling consumers ("Users" or "Customers") residing within the municipal, corporation, and rural district limits of Salem, Tamil Nadu, to discover, schedule, coordinate, and disburse payments to certified, independent service professionals ("Technicians", "Specialists", or "Partners").
        </p>

        <p style={{ fontSize: '14.5px', lineHeight: 1.75, color: '#334155', margin: '0 0 14px 0' }}>
          SalemSeva does not directly employ service technicians, nor does it maintain master-servant, employer-employee, or principal-agent relationships with onboarded partners. All service agreements for physical diagnostic inspections, electrical maintenance, plumbing installations, air conditioning repairs, deep home sanitation, and carpentry works are entered into bilaterally and directly between the Customer and the assigned independent technician.
        </p>

        <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#64748B', margin: 0 }}>
          SalemSeva's responsibilities are limited to operating the digital booking catalog, real-time GPS telemetry routing, automated billing calculations, and acting as an escrow payment collection facilitator.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '32px 0 0 0' }} />
      </section>

      {/* Clause 2 */}
      <section id="sec-commission" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Percent size={18} color="#0284C7" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
            2. Platform Cut, Commission & Settlement Structure
          </h2>
        </div>

        <p style={{ fontSize: '14.5px', lineHeight: 1.75, color: '#334155', margin: '0 0 16px 0' }}>
          To operate and maintain real-time dispatch telematics, cloud infrastructure, secure banking webhooks, customer support desks, and partner insurance coverage within the Salem territory, SalemSeva enforces an itemized fee model:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '18px' }}>
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>SalemSeva Platform Cut</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#0284C7' }}>2.0%</span>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B', lineHeight: 1.6 }}>
              A standard deduction of exactly 2.0% applied to the gross billable service total for platform operational facilitation and dispatch coordination.
            </p>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>Technician Direct Payout</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#16A34A' }}>98.0%</span>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B', lineHeight: 1.6 }}>
              Independent technician partners receive 98.0% of billable labor and diagnostic amounts, disbursed directly to their verified UPI/bank account via automated Razorpay Route settlement.
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px' }}>
          <strong style={{ fontSize: '13px', color: '#1E293B', display: 'block', marginBottom: '4px' }}>
            Transparent Digital Invoicing
          </strong>
          <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
            Every completed service booking produces a tamper-proof digital invoice within the customer and technician app view, distinctly itemizing the base diagnostic fee, labor additions, replacement spare parts, applicable GST, and the 2.0% platform facilitation cut.
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '32px 0 0 0' }} />
      </section>

      {/* Clause 3 */}
      <section id="sec-suspension" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <AlertTriangle size={18} color="#D97706" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
            3. Account Suspension & Administrative Blocking Rights
          </h2>
        </div>

        <p style={{ fontSize: '14.5px', lineHeight: 1.75, color: '#334155', margin: '0 0 16px 0' }}>
          SalemSeva Central Operations Desk administrators reserve the absolute authority to suspend, deactivate, or permanently blacklist any Customer or Technician profile across all platforms upon verified grounds:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div style={{ backgroundColor: '#FFFDF5', border: '1px solid #FDE68A', borderRadius: '8px', padding: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400E', display: 'block', marginBottom: '6px' }}>
              Customer Violation Grounds
            </span>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#78350F', lineHeight: 1.7 }}>
              <li>Verbal, threatening, or physical harassment directed towards service partners.</li>
              <li>Repeated unjustified cancellations after the technician has arrived at the location.</li>
              <li>Attempting off-platform under-the-table cash transactions to evade warranty tracking.</li>
              <li>Fraudulent chargebacks, forged UPI screenshots, or payment evasion.</li>
            </ul>
          </div>

          <div style={{ backgroundColor: '#FEF8F8', border: '1px solid #FECACA', borderRadius: '8px', padding: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#991B1B', display: 'block', marginBottom: '6px' }}>
              Technician Partner Violation Grounds
            </span>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#7F1D1D', lineHeight: 1.7 }}>
              <li>Directly soliciting customers to cancel in-app bookings for off-platform cash payments.</li>
              <li>Submitting forged government Aadhaar cards, fake trade credentials, or proxy workers.</li>
              <li>Unexplained recurring no-shows after accepting dispatches.</li>
              <li>Customer safety infringements or sustaining satisfaction ratings below 4.0 out of 5.</li>
            </ul>
          </div>
        </div>

        <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
          Blocked individuals are barred from initiating dispatches, going online for duty, or registering duplicate accounts using identical mobile numbers or hardware fingerprints.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '32px 0 0 0' }} />
      </section>

      {/* Clause 4 */}
      <section id="sec-safety" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <ShieldCheck size={18} color="#16A34A" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
            4. Partner Verification & Doorstep Safety Standards
          </h2>
        </div>

        <p style={{ fontSize: '14.5px', lineHeight: 1.75, color: '#334155', margin: '0 0 14px 0' }}>
          To ensure uncompromised safety in households and commercial premises across Salem, every technician partner undergoes mandatory identity and credential verification prior to account activation:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0284C7', backgroundColor: '#E0F2FE', padding: '2px 8px', borderRadius: '4px', flexShrink: 0 }}>Step 1</span>
            <div>
              <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>DigiLocker Government Aadhaar Verification</strong>
              <span style={{ fontSize: '12.5px', color: '#475569' }}>Real-time cryptographic authentication of legal name, photo identity, and permanent address.</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0284C7', backgroundColor: '#E0F2FE', padding: '2px 8px', borderRadius: '4px', flexShrink: 0 }}>Step 2</span>
            <div>
              <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>Trade Skill Assessment & Tool Compliance</strong>
              <span style={{ fontSize: '12.5px', color: '#475569' }}>Hands-on verification of professional competence in certified disciplines (AC, Electrical, Plumbing, Cleaning).</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0284C7', backgroundColor: '#E0F2FE', padding: '2px 8px', borderRadius: '4px', flexShrink: 0 }}>Step 3</span>
            <div>
              <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>Operating Protocol & Hours</strong>
              <span style={{ fontSize: '12.5px', color: '#475569' }}>Doorstep visits are scheduled strictly between 8:00 AM and 8:00 PM. Customers must provide safe access to the work area.</span>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '32px 0 0 0' }} />
      </section>

      {/* Clause 5 */}
      <section id="sec-arbitration" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Scale size={18} color="#0F172A" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
            5. Governing Law and Dispute Arbitration
          </h2>
        </div>

        <p style={{ fontSize: '14.5px', lineHeight: 1.75, color: '#334155', margin: '0 0 14px 0' }}>
          This Master Service Agreement is construed and governed under the substantive laws of the Republic of India. In the event of any dispute, disagreement, controversy, or claim arising out of or connecting with SalemSeva operations, the parties shall first attempt amicable settlement through SalemSeva's Central Operations Grievance Cell.
        </p>

        <p style={{ fontSize: '14.5px', lineHeight: 1.75, color: '#334155', margin: '0 0 16px 0' }}>
          Failing amicable settlement within thirty (30) days of formal notice, the dispute shall be resolved through arbitration under the Arbitration and Conciliation Act, 1996, by a sole arbitrator mutually appointed by SalemSeva. The place and seat of arbitration shall be Salem City, Tamil Nadu, and the proceedings shall be conducted in English or Tamil.
        </p>

        <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>Exclusive Judicial Forum</strong>
            <span style={{ fontSize: '12.5px', color: '#64748B' }}>Courts having competent jurisdiction located within Salem District, Tamil Nadu.</span>
          </div>
          <div>
            <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>Grievance Desk Helpline</strong>
            <span style={{ fontSize: '12.5px', color: '#0284C7', fontWeight: 600 }}>legal@salemseva.in • 1800-425-7253</span>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}
