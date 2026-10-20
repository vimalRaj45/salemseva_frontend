import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  ShieldCheck,
  Scale,
  Clock,
  FileText,
  Mail,
  MapPin
} from 'lucide-react';

export default function LegalLayout({
  title,
  subtitle,
  effectiveDate = 'October 15, 2026',
  jurisdiction = 'Salem District, Tamil Nadu',
  categoryBadge = 'Platform Compliance',
  sections = [],
  children
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');

  const legalTabs = [
    { label: 'Terms & Conditions', path: '/terms' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Refund & Cancellation', path: '/refund-policy' }
  ];

  useEffect(() => {
    if (sections.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A' }}>
      {/* Top Header Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E2E8F0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scale size={18} color="#0284C7" />
              <span style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A', letterSpacing: '-0.3px' }}>
                Shazu One Legal
              </span>
            </div>
          </div>

          {/* Document Switcher Tabs */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#F1F5F9',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0'
            }}
          >
            {legalTabs.map((tab) => {
              const isActive = currentPath === tab.path;
              return (
                <button
                  key={tab.path}
                  type="button"
                  onClick={() => navigate(tab.path)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                    color: isActive ? '#0284C7' : '#64748B',
                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Print / Save Action */}
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              color: '#475569',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Printer size={14} />
            <span>Print Document</span>
          </button>
        </div>
      </header>

      {/* Main 2-Column Documentation Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '32px' }} className="legal-grid-container">
          <style>{`
            .legal-grid-container {
              display: grid;
              grid-template-columns: 1fr;
            }
            @media (min-width: 900px) {
              .legal-grid-container {
                grid-template-columns: 280px minmax(0, 1fr) !important;
                gap: 36px !important;
              }
            }
            @media print {
              header, .legal-sidebar { display: none !important; }
              .legal-grid-container { grid-template-columns: 1fr !important; }
              .legal-document-folio { border: none !important; box-shadow: none !important; padding: 0 !important; }
            }
          `}</style>

          {/* Left Sticky Sidebar (Table of Contents & Legal Overview) */}
          <aside className="legal-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Document Metadata Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '18px 16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#0284C7',
                    backgroundColor: '#F0F9FF',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid #BAE6FD',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px'
                  }}
                >
                  {categoryBadge}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Clock size={15} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ display: 'block', color: '#94A3B8', fontSize: '11px' }}>Effective Date</span>
                    <strong style={{ color: '#1E293B' }}>{effectiveDate}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <MapPin size={15} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ display: 'block', color: '#94A3B8', fontSize: '11px' }}>Jurisdiction</span>
                    <strong style={{ color: '#1E293B' }}>{jurisdiction}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <ShieldCheck size={15} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ display: 'block', color: '#94A3B8', fontSize: '11px' }}>Legal Entity</span>
                    <strong style={{ color: '#1E293B' }}>Shazu One Intermediary Network</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Table of Contents Navigation */}
            {sections.length > 0 && (
              <div
                style={{
                  position: 'sticky',
                  top: '80px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  padding: '18px 16px',
                  maxHeight: 'calc(100vh - 120px)',
                  overflowY: 'auto'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <FileText size={15} color="#0284C7" />
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Document Sections
                  </span>
                </div>

                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {sections.map((sec, idx) => {
                    const isSecActive = activeSection === sec.id;
                    return (
                      <li key={sec.id}>
                        <button
                          type="button"
                          onClick={() => scrollToSection(sec.id)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: isSecActive ? '#F0F9FF' : 'transparent',
                            color: isSecActive ? '#0284C7' : '#475569',
                            fontWeight: isSecActive ? 700 : 500,
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSecActive) e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSecActive) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
                            {sec.title}
                          </span>
                          <span style={{ fontSize: '10.5px', opacity: 0.6, flexShrink: 0 }}>
                            § {idx + 1}.0
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Grievance & Legal Notice Box */}
                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid #F1F5F9',
                    fontSize: '11.5px',
                    color: '#64748B',
                    lineHeight: 1.5
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Legal Redressal Officer
                  </span>
                  <span>Compliance Desk, Salem Central HQ</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#0284C7', fontWeight: 600 }}>
                    <Mail size={13} />
                    <span>legal@Shazu One.in</span>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Right Document Folio: Continuous Legal Manuscript */}
          <main
            className="legal-document-folio"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              padding: '40px 48px',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)'
            }}
          >
            {/* Document Header Preamble */}
            <div style={{ paddingBottom: '28px', borderBottom: '2px solid #0F172A', marginBottom: '32px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#0284C7',
                  display: 'block',
                  marginBottom: '8px'
                }}
              >
                Official Legal Repository • Shazu One Platform
              </span>
              <h1
                style={{
                  margin: '0 0 10px 0',
                  fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
                  fontWeight: 900,
                  color: '#0F172A',
                  letterSpacing: '-0.7px',
                  lineHeight: 1.2
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <p style={{ margin: 0, fontSize: '15px', color: '#475569', lineHeight: 1.6 }}>
                  {subtitle}
                </p>
              )}
            </div>

            {/* Continuous Legal Clauses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
              {children}
            </div>

            {/* Document Sign-off Footer */}
            <div
              style={{
                marginTop: '48px',
                paddingTop: '28px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '12px',
                color: '#64748B'
              }}
            >
              <div>
                <span>Official Publication ID: <strong>SS-LEGAL-2026-V2</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span>Certified by Central Operations Legal Cell</span>
                <span>Salem, Tamil Nadu</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
