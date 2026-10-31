import React from 'react';
import { Box, Container, Grid, Typography, ButtonBase, Link } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  ChevronRight,
  Headphones,
  Wrench,
  Sparkles,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { PARTNER_PAYOUT_PERCENT } from '../config';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide footer on full-screen flows, technician duty console, and admin workspace
  const isHidden =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/partner/login' ||
    location.pathname === '/technician/login' ||
    location.pathname === '/welcome' ||
    location.pathname === '/how-it-works' ||
    location.pathname.startsWith('/call/') ||
    location.pathname.startsWith('/chat/') ||
    location.pathname.startsWith('/partner') ||
    location.pathname.startsWith('/admin');

  if (isHidden) {
    return null;
  }

  const handleNav = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const services = [
    { name: 'Air Conditioner Repair & Gas Refill', path: '/book/ac_repair' },
    { name: 'Electrical Wiring & Circuit Breakers', path: '/book/electrician' },
    { name: 'Plumbing & High-Pressure Leakage', path: '/book/plumbing' },
    { name: 'Appliance Diagnosis & Servicing', path: '/book/appliance' },
    { name: 'Deep Sanitization & House Cleaning', path: '/book/cleaning' },
    { name: 'Carpentry & Furniture Restoration', path: '/book/carpentry' },
    { name: 'Wall Painting & Waterproofing', path: '/book/painting' }
  ];

  const quickLinks = [
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Technician Partner Portal', path: '/partner/login' },
    { name: 'Booking History & Invoices', path: '/history' },
    { name: 'Wallet & Cashback Balance', path: '/wallet' },
    { name: 'Live Booking Status', path: '/track' }
  ];

  const legalLinks = [
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Privacy & Data Protection', path: '/privacy' },
    { name: 'Cancellation & Refund Policy', path: '/refund-policy' },
    { name: 'Fair Price & Escrow Guarantee', path: '/terms#escrow' },
    { name: 'Customer Grievance Redressal', path: '/terms#grievance' }
  ];

  const serviceAreas = [
    'Fairlands',
    'Hasthampatti',
    'Suramangalam',
    'Ammapet',
    'Shevapet',
    'Meyyanur',
    'Alagapuram',
    'Gugai',
    'Koranguchavadi',
    'Seelanaickenpatti'
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#FFFFFF',
        color: '#0F172A',
        mt: 'auto',
        borderTop: '1px solid #E2E8F0',
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* ── 1. Top Feature Cards Row (4 Cards, 48px vertical spacing, 16px gap, 20px padding) ── */}
      <Box
        sx={{
          borderBottom: '1px solid #E2E8F0',
          py: '48px',
          bgcolor: '#F8FAFC'
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2}>
            {/* Card 1: 100% Verified Pros */}
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  p: '20px',
                  borderRadius: '12px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  height: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    bgcolor: '#EFF6FF',
                    color: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mb: '12px'
                  }}
                >
                  <ShieldCheck size={20} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#0F172A', mb: '6px', textAlign: 'left' }}>
                  100% Verified Pros
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, textAlign: 'left' }}>
                  Police background checked & Aadhaar verified technicians.
                </Typography>
              </Box>
            </Grid>

            {/* Card 2: Upfront Fair Pricing */}
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  p: '20px',
                  borderRadius: '12px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  height: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    bgcolor: '#F0FDF4',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mb: '12px'
                  }}
                >
                  <CheckCircle2 size={20} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#0F172A', mb: '6px', textAlign: 'left' }}>
                  Upfront Fair Pricing
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, textAlign: 'left' }}>
                  Standard visitation rates with digital itemized approval.
                </Typography>
              </Box>
            </Grid>

            {/* Card 3: Partner Payout */}
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  p: '20px',
                  borderRadius: '12px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  height: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    bgcolor: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mb: '12px'
                  }}
                >
                  <Sparkles size={20} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#0F172A', mb: '6px', textAlign: 'left' }}>
                  {PARTNER_PAYOUT_PERCENT}% Partner Payout
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, textAlign: 'left' }}>
                  Direct escrow settlement empowering local Salem tradesmen.
                </Typography>
              </Box>
            </Grid>

            {/* Card 4: Salem Fast Dispatch */}
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  p: '20px',
                  borderRadius: '12px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  height: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    bgcolor: '#F3E8FF',
                    color: '#9333EA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mb: '12px'
                  }}
                >
                  <Clock size={20} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#0F172A', mb: '6px', textAlign: 'left' }}>
                  Salem Fast Dispatch
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, textAlign: 'left' }}>
                  Live GPS matching for 30-min urgent or planned home slots.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── 2. Main Navigation Columns (12-Column Grid: 4 / 3 / 2.5 / 2.5) ── */}
      <Container maxWidth={false} sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, sm: 3 }, py: '48px' }}>
        <Grid container spacing={4} alignItems="flex-start">
          
          {/* Column 1: Brand & Overview (4 cols) */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ pr: { lg: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: '16px' }}>
                <Box
                  component="img"
                  src="/logo-mark.svg"
                  onError={(e) => { e.currentTarget.src = '/logo-mark.png'; }}
                  alt="Shazu One"
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '8px',
                    objectFit: 'contain'
                  }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 800,
                      fontSize: '22px',
                      color: '#0066CC',
                      letterSpacing: '-0.3px',
                      lineHeight: 1.1
                    }}
                  >
                    Shazu <Box component="span" sx={{ color: '#16A34A' }}>One</Box>
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#64748B', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', mt: 0.2 }}>
                    All Your Home Services. One Platform.
                  </Typography>
                </Box>
              </Box>

              <Typography sx={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, mb: '24px' }}>
                Salem's trusted home service ecosystem. Connecting homeowners across Salem district with verified electrical, plumbing, carpentry, cleaning, and appliance repair professionals.
              </Typography>

              {/* Salem Coverage Summary */}
              <Box>
                <Typography sx={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', mb: '16px', color: '#0D3B66', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MapPin size={15} color="#0284C7" /> Active Service Localities
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {serviceAreas.map((area) => (
                    <Box
                      key={area}
                      sx={{
                        fontSize: '12px',
                        height: '28px',
                        px: '12px',
                        borderRadius: '999px',
                        bgcolor: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        color: '#475569',
                        fontWeight: 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {area}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Column 2: Core Services (3 cols) */}
          <Grid item xs={12} sm={6} md={3} lg={3}>
            <Typography sx={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', mb: '20px', color: '#0D3B66', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Wrench size={15} color="#0284C7" /> Core Services
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {services.map((item) => (
                <Box component="li" key={item.name}>
                  <ButtonBase
                    onClick={() => handleNav(item.path)}
                    sx={{
                      fontSize: '15px',
                      color: '#475569',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      width: '100%',
                      py: 0,
                      fontWeight: 500,
                      transition: 'color 0.15s ease',
                      '&:hover': {
                        color: '#0284C7'
                      }
                    }}
                  >
                    {item.name}
                  </ButtonBase>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Column 3: Quick Links & Compliance (2.5 cols) */}
          <Grid item xs={12} sm={6} md={2.5} lg={2.5}>
            <Typography sx={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', mb: '20px', color: '#0D3B66', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Sparkles size={15} color="#0284C7" /> Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {quickLinks.map((item) => (
                <Box component="li" key={item.name}>
                  <ButtonBase
                    onClick={() => handleNav(item.path)}
                    sx={{
                      fontSize: '15px',
                      color: '#475569',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      width: '100%',
                      py: 0,
                      fontWeight: 500,
                      transition: 'color 0.15s ease',
                      '&:hover': {
                        color: '#0284C7'
                      }
                    }}
                  >
                    {item.name}
                  </ButtonBase>
                </Box>
              ))}
            </Box>

            {/* Compliance Section */}
            <Typography sx={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', mb: '20px', mt: '32px', color: '#0D3B66', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Lock size={14} color="#0284C7" /> Compliance
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {legalLinks.map((item) => (
                <Box component="li" key={item.name}>
                  <ButtonBase
                    onClick={() => handleNav(item.path)}
                    sx={{
                      fontSize: '15px',
                      color: '#475569',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      width: '100%',
                      py: 0,
                      fontWeight: 500,
                      transition: 'color 0.15s ease',
                      '&:hover': {
                        color: '#0284C7'
                      }
                    }}
                  >
                    {item.name}
                  </ButtonBase>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Column 4: Salem Helpdesk & Operations (2.5 cols) */}
          <Grid item xs={12} md={2.5} lg={2.5}>
            <Typography sx={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', mb: '20px', color: '#0D3B66', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Headphones size={15} color="#0284C7" /> Salem Helpdesk
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Customer Helpline Card */}
              <Box
                sx={{
                  p: '16px',
                  borderRadius: '12px',
                  bgcolor: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <Typography sx={{ fontSize: '11px', color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Customer Helpline (Mon - Sun)
                </Typography>
                <Box
                  component="a"
                  href="tel:04272445566"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: '#0D3B66',
                    textDecoration: 'none',
                    fontWeight: 800,
                    fontSize: '18px',
                    '&:hover': { color: '#0284C7' }
                  }}
                >
                  <Phone size={18} color="#0284C7" /> 0427-2445566
                </Box>
                <Typography sx={{ fontSize: '11.5px', color: '#0C4A6E' }}>
                  Dispatch Hours: 7:00 AM – 10:00 PM
                </Typography>
              </Box>

              {/* Support Email Row */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Mail size={16} color="#0284C7" style={{ marginTop: '3px', flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: '12px', color: '#64748B' }}>Support Email</Typography>
                  <Link
                    href="mailto:support@shazuone.com"
                    sx={{
                      color: '#0D3B66',
                      fontSize: '14px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      wordBreak: 'break-all',
                      '&:hover': { color: '#0284C7', textDecoration: 'underline' }
                    }}
                  >
                    support@shazuone.com
                  </Link>
                </Box>
              </Box>

              {/* Salem Operations Hub Row */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <MapPin size={16} color="#0284C7" style={{ marginTop: '3px', flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: '12px', color: '#64748B' }}>Salem Operations Hub</Typography>
                  <Typography sx={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, mt: '2px' }}>
                    Fairlands Main Road, Opp. Reliance Mart, Salem — 636016, Tamil Nadu.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ── 3. Bottom Bar (3-Part Flex Row, 24px vertical padding, Top Border) ── */}
      <Box
        sx={{
          borderTop: '1px solid #E2E8F0',
          py: '24px',
          bgcolor: '#F8FAFC'
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              textAlign: { xs: 'center', md: 'left' }
            }}
          >
            {/* Part 1: Copyright & ISO Standards */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography sx={{ fontSize: '13px', color: '#475569' }}>
                © 2026 <Box component="span" sx={{ color: '#0D3B66', fontWeight: 700 }}>Shazu One</Box>. All rights reserved.
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#64748B', mt: '4px' }}>
                ISO 9001:2015 Service Quality Benchmark • 256-Bit SSL Encrypted Escrow Transactions
              </Typography>
            </Box>

            {/* Part 2: Payment Chips (Equal 32px height, wrapped or single row) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['UPI / GPay / PhonePe', 'Razorpay Verified', 'RuPay & Visa', 'Cash on Completion'].map((badge) => (
                <Box
                  key={badge}
                  sx={{
                    height: '32px',
                    px: '14px',
                    borderRadius: '999px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {badge}
                </Box>
              ))}
            </Box>

            {/* Part 3: Developer Credit */}
            <Box
              component="a"
              href="https://shazusofttechnologies.org/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                bgcolor: '#FFFFFF',
                height: '36px',
                px: '16px',
                borderRadius: '999px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#0D3B66',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 3px 8px rgba(13, 59, 102, 0.08)'
                }
              }}
            >
              <Box
                component="img"
                src="/shazusoft_logo.png"
                alt="Shazu Soft Technologies"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  objectFit: 'contain'
                }}
              />
              <Typography sx={{ color: '#0D3B66', fontSize: '12px', fontWeight: 600 }}>
                Crafted by{' '}
                <Box component="span" sx={{ color: '#0D3B66', fontWeight: 800 }}>
                  Shazu Soft Technologies
                </Box>
              </Typography>
              <ArrowUpRight size={13} color="#2E7D32" />
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
