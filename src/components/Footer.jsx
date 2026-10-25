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
      {/* ── 1. Top Reassurance / Trust Strip (Soft Tinted Surface) ── */}
      <Box
        sx={{
          borderBottom: '1px solid #E2E8F0',
          py: 3,
          bgcolor: '#F8FAFC'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  height: '100%'
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '10px',
                    bgcolor: '#EFF6FF',
                    color: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <ShieldCheck size={20} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '13.5px', color: '#0D3B66' }}>
                    100% Verified Pros
                  </Typography>
                  <Typography sx={{ fontSize: '11.5px', color: '#64748B', mt: 0.2, lineHeight: 1.4 }}>
                    Police background checked & Aadhaar verified technicians.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  height: '100%'
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '10px',
                    bgcolor: '#F0FDF4',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <CheckCircle2 size={20} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '13.5px', color: '#0D3B66' }}>
                    Upfront Fair Pricing
                  </Typography>
                  <Typography sx={{ fontSize: '11.5px', color: '#64748B', mt: 0.2, lineHeight: 1.4 }}>
                    Standard visitation rates with digital itemized approval.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  height: '100%'
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '10px',
                    bgcolor: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Sparkles size={20} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '13.5px', color: '#0D3B66' }}>
                    98% Partner Payout
                  </Typography>
                  <Typography sx={{ fontSize: '11.5px', color: '#64748B', mt: 0.2, lineHeight: 1.4 }}>
                    Direct escrow settlement empowering local Salem tradesmen.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  height: '100%'
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '10px',
                    bgcolor: '#F3E8FF',
                    color: '#9333EA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Clock size={20} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '13.5px', color: '#0D3B66' }}>
                    Salem Fast Dispatch
                  </Typography>
                  <Typography sx={{ fontSize: '11.5px', color: '#64748B', mt: 0.2, lineHeight: 1.4 }}>
                    Live GPS matching for 30-min urgent or planned home slots.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── 2. Main Navigation Columns (Crisp White Background) ── */}
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Grid container spacing={4}>
          {/* Brand & Overview Column */}
          <Grid item xs={12} md={4}>
            <Box sx={{ pr: { md: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
                <Box
                  component="img"
                  src="/logo.svg"
                  alt="Shazu One"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    objectFit: 'contain'
                  }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 800,
                      fontSize: '20px',
                      color: '#0D3B66',
                      letterSpacing: '-0.3px',
                      lineHeight: 1.1
                    }}
                  >
                    Shazu <Box component="span" sx={{ color: '#2E7D32' }}>One</Box>
                  </Typography>
                  <Typography sx={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                    All Your Home Services. One Platform.
                  </Typography>
                </Box>
              </Box>

              <Typography sx={{ fontSize: '13px', color: '#475569', lineHeight: 1.65, mb: 2.5 }}>
                Salem's trusted home service ecosystem. Connecting homeowners across Salem district with verified electrical, plumbing, carpentry, cleaning, and appliance repair professionals.
              </Typography>

              {/* Salem Coverage Summary */}
              <Box>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#0D3B66', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <MapPin size={13} color="#0284C7" /> Active Service Localities
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                  {serviceAreas.map((area) => (
                    <Box
                      key={area}
                      sx={{
                        fontSize: '11px',
                        px: 1,
                        py: 0.25,
                        borderRadius: '6px',
                        bgcolor: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        color: '#475569',
                        fontWeight: 500
                      }}
                    >
                      {area}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Quick Services Column */}
          <Grid item xs={12} sm={6} md={2.8}>
            <Typography sx={{ fontSize: '12.5px', fontWeight: 800, color: '#0D3B66', textTransform: 'uppercase', letterSpacing: '0.6px', mb: 2, display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Wrench size={14} color="#0284C7" /> Core Services
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {services.map((item) => (
                <Box component="li" key={item.name}>
                  <ButtonBase
                    onClick={() => handleNav(item.path)}
                    sx={{
                      fontSize: '13px',
                      color: '#475569',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      width: '100%',
                      py: 0.2,
                      fontWeight: 500,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        color: '#0284C7',
                        transform: 'translateX(3px)'
                      }
                    }}
                  >
                    <ChevronRight size={13} style={{ marginRight: 6, flexShrink: 0, color: '#94A3B8' }} />
                    {item.name}
                  </ButtonBase>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Platform & Trust Hub */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Typography sx={{ fontSize: '12.5px', fontWeight: 800, color: '#0D3B66', textTransform: 'uppercase', letterSpacing: '0.6px', mb: 2, display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Sparkles size={14} color="#0284C7" /> Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {quickLinks.map((item) => (
                <Box component="li" key={item.name}>
                  <ButtonBase
                    onClick={() => handleNav(item.path)}
                    sx={{
                      fontSize: '13px',
                      color: '#475569',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      width: '100%',
                      py: 0.2,
                      fontWeight: 500,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        color: '#0284C7',
                        transform: 'translateX(3px)'
                      }
                    }}
                  >
                    <ChevronRight size={13} style={{ marginRight: 6, flexShrink: 0, color: '#94A3B8' }} />
                    {item.name}
                  </ButtonBase>
                </Box>
              ))}
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography sx={{ fontSize: '12.5px', fontWeight: 800, color: '#0D3B66', textTransform: 'uppercase', letterSpacing: '0.6px', mb: 1.2, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Lock size={13} color="#0284C7" /> Compliance
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {legalLinks.map((item) => (
                  <Box component="li" key={item.name}>
                    <ButtonBase
                      onClick={() => handleNav(item.path)}
                      sx={{
                        fontSize: '12.5px',
                        color: '#64748B',
                        textAlign: 'left',
                        justifyContent: 'flex-start',
                        width: '100%',
                        py: 0.2,
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          color: '#0D3B66'
                        }
                      }}
                    >
                      {item.name}
                    </ButtonBase>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Salem Helpdesk & Operations */}
          <Grid item xs={12} md={2.8}>
            <Typography sx={{ fontSize: '12.5px', fontWeight: 800, color: '#0D3B66', textTransform: 'uppercase', letterSpacing: '0.6px', mb: 2, display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Headphones size={14} color="#0284C7" /> Salem Helpdesk
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: '#F0F9FF',
                  border: '1px solid #BAE6FD'
                }}
              >
                <Typography sx={{ fontSize: '11px', color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                  Customer Helpline (Mon - Sun)
                </Typography>
                <Box
                  component="a"
                  href="tel:04272445566"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    color: '#0D3B66',
                    textDecoration: 'none',
                    fontWeight: 800,
                    fontSize: '16px',
                    mt: 0.4,
                    '&:hover': { color: '#0284C7' }
                  }}
                >
                  <Phone size={16} color="#0284C7" /> 0427-2445566
                </Box>
                <Typography sx={{ fontSize: '11px', color: '#0C4A6E', mt: 0.3 }}>
                  Dispatch Hours: 7:00 AM – 10:00 PM
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                <Mail size={15} color="#0284C7" style={{ marginTop: 2, flexShrink: 0 }} />
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#64748B' }}>Support Email</Typography>
                  <Link
                    href="mailto:support@shazuone.com"
                    sx={{
                      color: '#0D3B66',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': { color: '#0284C7', textDecoration: 'underline' }
                    }}
                  >
                    support@shazuone.com
                  </Link>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                <MapPin size={15} color="#0284C7" style={{ marginTop: 2, flexShrink: 0 }} />
                <Box>
                  <Typography sx={{ fontSize: '11px', color: '#64748B' }}>Salem Operations Hub</Typography>
                  <Typography sx={{ fontSize: '12px', color: '#334155', lineHeight: 1.4 }}>
                    Fairlands Main Road, Opp. Reliance Mart, Salem — 636016, Tamil Nadu.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ── 3. Bottom Legal, Payment Badges & Developer Attribution (Pleasant Neutral Tray) ── */}
      <Box
        sx={{
          borderTop: '1px solid #E2E8F0',
          pt: 2.5,
          pb: { xs: '84px', md: 2.5 },
          bgcolor: '#F8FAFC'
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2
            }}
          >
            {/* Copyright & Quality Standards */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography sx={{ fontSize: '12px', color: '#475569' }}>
                © 2026 <Box component="span" sx={{ color: '#0D3B66', fontWeight: 700 }}>Shazu One</Box>. All rights reserved.
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#64748B', mt: 0.3 }}>
                ISO 9001:2015 Service Quality Benchmark • 256-Bit SSL Encrypted Escrow Transactions
              </Typography>
            </Box>

            {/* Payment & Security Method Badges (Clean White Chips) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Box
                sx={{
                  px: 1.2,
                  py: 0.35,
                  borderRadius: '6px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#475569'
                }}
              >
                UPI / GPay / PhonePe
              </Box>
              <Box
                sx={{
                  px: 1.2,
                  py: 0.35,
                  borderRadius: '6px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#475569'
                }}
              >
                Razorpay Verified
              </Box>
              <Box
                sx={{
                  px: 1.2,
                  py: 0.35,
                  borderRadius: '6px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#475569'
                }}
              >
                RuPay & Visa
              </Box>
              <Box
                sx={{
                  px: 1.2,
                  py: 0.35,
                  borderRadius: '6px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#475569'
                }}
              >
                Cash on Completion
              </Box>
            </Box>

            {/* Developer Credit (Shazu Soft Technologies Pill) */}
            <Box
              component="a"
              href="https://shazusofttechnologies.org/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                textDecoration: 'none',
                bgcolor: '#FFFFFF',
                py: 0.6,
                px: 1.8,
                borderRadius: '30px',
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
              <Typography sx={{ color: '#0D3B66', fontSize: '11px', fontWeight: 600 }}>
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
