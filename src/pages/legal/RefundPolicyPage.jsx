import React from 'react';
import LegalLayout from './LegalLayout';
import {
  RotateCcw,
  Percent,
  Calendar,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';

const refundSections = [
  { id: 'sec-deductions', title: '1. Deductions on Refund' },
  { id: 'sec-stages', title: '2. Cancellation Stages' },
  { id: 'sec-warranty', title: '3. 30-Day Re-Service Warranty' },
  { id: 'sec-timelines', title: '4. Settlement Timelines' }
];

export default function RefundPolicyPage() {
  return (
    <LegalLayout
      title="Cancellation & Refund Policy"
      subtitle="Service Guarantee, Platform & Gateway Fee Retentions, and Payout Settlement Schedules"
      effectiveDate="October 15, 2026"
      jurisdiction="Salem District, Tamil Nadu"
      categoryBadge="Refund Guidelines"
      sections={refundSections}
    >
      {/* Clause 1 */}
      <section id="sec-deductions" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Percent size={18} color="#0284C7" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
            1. Platform & Gateway Deductions on Refund
          </h2>
        </div>

        <p style={{ fontSize: '14.5px', lineHeight: 1.75, color: '#334155', margin: '0 0 16px 0' }}>
          When a customer initiates an authorized cancellation of a pre-paid booking or requests a monetary reversal, SalemSeva applies statutory and operational fee retentions to cover sunk facilitation and banking interchange costs:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '18px' }}>
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>SalemSeva Platform Facilitation</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#0284C7' }}>2.0%</span>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B', lineHeight: 1.6 }}>
              Covers technician dispatch matching, dispatch ledger processing, and GPS server telemetry allocated to the booking.
            </p>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>Razorpay Payment Gateway Fee</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#0284C7' }}>2.0%</span>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B', lineHeight: 1.6 }}>
              Standard payment gateway interchange and banking settlement transaction fees incurred at the moment of initial transaction capture.
            </p>
          </div>
        </div>

        {/* Calculation Box */}
        <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px', padding: '18px 20px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0369A1', display: 'block', marginBottom: '8px' }}>
            Practical Refund Calculation Example
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#0C4A6E' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Initial Diagnostic / Booking Visit Fee:</span>
              <strong>₹99.00</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>SalemSeva 2% Platform Facilitation Retention:</span>
              <span style={{ color: '#DC2626' }}>-₹1.98</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Razorpay 2% Gateway Interchange Retention:</span>
              <span style={{ color: '#DC2626' }}>-₹1.98</span>
            </div>
            <div style={{ borderTop: '1px dashed #7DD3FC', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, color: '#0369A1' }}>
              <span>Net Refund Credited to Customer Source Account:</span>
              <span>₹95.04</span>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '32px 0 0 0' }} />
      </section>

      {/* Clause 2 */}
      <section id="sec-stages" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Calendar size={18} color="#0284C7" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
            2. Cancellation Stages & Eligibility
          </h2>
        </div>

        <p style={{ fontSize: '14.5px', lineHeight: 1.75, color: '#334155', margin: '0 0 16px 0' }}>
          Refund eligibility varies dynamically based on the dispatch status of the technician at the exact timestamp cancellation is confirmed:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                Stage 1
              </span>
              <strong style={{ fontSize: '13.5px', color: '#0F172A' }}>Prior to Technician Departure (Ride Not Started)</strong>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
              Full refund eligible, minus the standard 2.0% platform fee and 2.0% Razorpay banking charges.
            </p>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#D97706', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                Stage 2
              </span>
              <strong style={{ fontSize: '13.5px', color: '#0F172A' }}>Technician In Transit or Arrived at Premises</strong>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
              If cancelled after the partner has departed or arrived at the doorstep, the ₹99 diagnostic inspection fee is forfeited and credited directly to the partner to offset travel time and fuel expenses.
            </p>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                Stage 3
              </span>
              <strong style={{ fontSize: '13.5px', color: '#0F172A' }}>Service Completed & OTP Confirmed</strong>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
              Completed jobs with customer sign-off OTP are not eligible for direct cash reversals. Any post-service dissatisfaction is addressed via our 30-Day Re-Service Warranty.
            </p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '32px 0 0 0' }} />
      </section>

      {/* Clause 3 */}
      <section id="sec-warranty" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <ShieldCheck size={18} color="#16A34A" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
            3. 30-Day SalemSeva Re-Service Warranty
          </h2>
        </div>

        <p style={{ fontSize: '14.5px', lineHeight: 1.75, color: '#334155', margin: '0 0 16px 0' }}>
          Every completed home service booked through SalemSeva includes our comprehensive 30-day workmanship guarantee:
        </p>

        <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px 18px', marginBottom: '16px' }}>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px', lineHeight: 1.8, color: '#334155' }}>
            <li>
              If the exact repaired defect recurs within thirty (30) calendar days of service completion, SalemSeva will dispatch a certified senior technician to re-inspect and rectify the fault with <strong>zero additional labor charges</strong>.
            </li>
            <li>
              Spare parts or electrical components replaced during the job carry warranty certificates issued directly by original equipment manufacturers (OEMs).
            </li>
            <li>
              Damage resulting from external electrical power surges, physical water contamination, or unauthorized subsequent tampering by third parties is excluded from warranty coverage.
            </li>
          </ul>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '32px 0 0 0' }} />
      </section>

      {/* Clause 4 */}
      <section id="sec-timelines" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <CreditCard size={18} color="#0F172A" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
            4. Refund Settlement Timelines
          </h2>
        </div>

        <p style={{ fontSize: '14.5px', lineHeight: 1.75, color: '#334155', margin: '0 0 16px 0' }}>
          Approved refunds are processed through automated Razorpay reverse settlement pipelines to the original payment source:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '18px' }}>
          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0284C7', display: 'block', marginBottom: '4px' }}>UPI & Net Banking</span>
            <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>2 - 4 Business Days</strong>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Settles directly to linked VPA or bank savings account.</span>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0284C7', display: 'block', marginBottom: '4px' }}>Credit / Debit Cards</span>
            <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>3 - 7 Business Days</strong>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Credited back to issuing bank statement.</span>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#16A34A', display: 'block', marginBottom: '4px' }}>SalemSeva Wallet</span>
            <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>Instant Credit</strong>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Zero deduction, immediately available for future bookings.</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>Grievance Desk Escalations</strong>
            <span style={{ fontSize: '12.5px', color: '#64748B' }}>Quote your Booking ID (e.g., #SLM-2026-X) for immediate tracking.</span>
          </div>
          <div>
            <span style={{ fontSize: '12.5px', color: '#0284C7', fontWeight: 600 }}>support@salemseva.in • 1800-425-7253</span>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}
