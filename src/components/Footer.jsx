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
  ExternalLink,
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

  // Hide footer on full-screen flows, live tracking map, technician duty console, and admin workspace
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
        bgcolor: '#0B132B',
        color: '#E2E8F0',
        mt: 'auto',
        borderTop: '1px solid #1C2541',
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* ── 1. Top Value Proposition Grid ── */}
      <Box
        sx={{
          borderBottom: '1px solid #1C2541',
          py: 3.5,
          bgcolor: '#0E1738'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: '12px',
                    bgcolor: 'rgba(2, 132, 199, 0.15)',
                    color: '#38BDF8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <ShieldCheck size={24} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#F8FAFC' }}>
                    100% Verified Trades
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#94A3B8', mt: 0.3, lineHeight: 1.4 }}>
                    Police background checked, Aadhaar verified with proven trade skills.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: '12px',
                    bgcolor: 'rgba(34, 197, 94, 0.15)',
                    color: '#4ADE80',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <CheckCircle2 size={24} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#F8FAFC' }}>
                    Transparent Quotes
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#94A3B8', mt: 0.3, lineHeight: 1.4 }}>
                    Zero hidden fees. Digital quote approval before any work begins.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: '12px',
                    bgcolor: 'rgba(245, 158, 11, 0.15)',
                    color: '#FBBF24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Sparkles size={24} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#F8FAFC' }}>
                    98% Partner Payout
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#94A3B8', mt: 0.3, lineHeight: 1.4 }}>
                    Fair work ecosystem. Low 2% platform fee empowers local Salem pros.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: '12px',
                    bgcolor: 'rgba(168, 85, 247, 0.15)',
                    color: '#C084FC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Clock size={24} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#F8FAFC' }}>
                    Salem Priority Dispatch
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#94A3B8', mt: 0.3, lineHeight: 1.4 }}>
                    Geo-matched technicians ready for 30-min urgent or planned slots.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── 2. Main Navigation Columns ── */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Brand & Overview Column */}
          <Grid item xs={12} md={4}>
            <Box sx={{ pr: { md: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  component="img"
                  src="/logo.svg"
                  alt="Shazu One"
                  onError={(e) => {
                    // Fallback to downloaded_logo or text badge
                    e.currentTarget.style.display = 'none';
                  }}
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: '#FFFFFF',
                    p: 0.5,
                    border: '1px solid #1C2541'
                  }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 800,
                      fontSize: '20px',
                      color: '#FFFFFF',
                      letterSpacing: '-0.3px',
                      lineHeight: 1.1
                    }}
                  >
                    Shazu <Box component="span" sx={{ color: '#38BDF8' }}>One</Box>
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', mt: 0.2 }}>
                    Salem Home Services
                  </Typography>
                </Box>
              </Box>

              <Typography sx={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.7, mb: 2.5 }}>
                Tamil Nadu's premier home service infrastructure. Connecting Salem homeowners with certified, background-verified professionals with instant transparent quotes, live tracking, and digital escrow payments.
              </Typography>

              {/* Salem Coverage Summary */}
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <MapPin size={13} color="#38BDF8" /> Serving All Key Salem Localities
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {serviceAreas.map((area) => (
                    <Box
                      key={area}
                      sx={{
                        fontSize: '11px',
                        px: 1,
                        py: 0.3,
                        borderRadius: '6px',
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#94A3B8'
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
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '0.6px', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Wrench size={15} color="#38BDF8" /> Core Services
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {services.map((item) => (
                <Box component="li" key={item.name}>
                  <ButtonBase
                    onClick={() => handleNav(item.path)}
                    sx={{
                      fontSize: '13px',
                      color: '#94A3B8',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      width: '100%',
                      py: 0.3,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        color: '#38BDF8',
                        transform: 'translateX(3px)'
                      }
                    }}
                  >
                    <ChevronRight size={13} style={{ marginRight: 6, flexShrink: 0, opacity: 0.6 }} />
                    {item.name}
                  </ButtonBase>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Platform & Partner Hub */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '0.6px', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Sparkles size={15} color="#38BDF8" /> Platform & Trust
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {quickLinks.map((item) => (
                <Box component="li" key={item.name}>
                  <ButtonBase
                    onClick={() => handleNav(item.path)}
                    sx={{
                      fontSize: '13px',
                      color: '#94A3B8',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      width: '100%',
                      py: 0.3,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        color: '#38BDF8',
                        transform: 'translateX(3px)'
                      }
                    }}
                  >
                    <ChevronRight size={13} style={{ marginRight: 6, flexShrink: 0, opacity: 0.6 }} />
                    {item.name}
                  </ButtonBase>
                </Box>
              ))}
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '0.6px', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lock size={14} color="#38BDF8" /> Compliance
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {legalLinks.map((item) => (
                  <Box component="li" key={item.name}>
                    <ButtonBase
                      onClick={() => handleNav(item.path)}
                      sx={{
                        fontSize: '12.5px',
                        color: '#94A3B8',
                        textAlign: 'left',
                        justifyContent: 'flex-start',
                        width: '100%',
                        py: 0.2,
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          color: '#38BDF8'
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
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '0.6px', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Headphones size={15} color="#38BDF8" /> Salem Support Desk
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid #1C2541'
                }}
              >
                <Typography sx={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  Customer Helpline (Mon - Sun)
                </Typography>
                <Box
                  component="a"
                  href="tel:04272445566"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: '#38BDF8',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '15px',
                    mt: 0.5,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  <Phone size={15} /> 0427-2445566
                </Box>
                <Typography sx={{ fontSize: '11px', color: '#64748B', mt: 0.3 }}>
                  Dispatch Window: 7:00 AM – 10:00 PM
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                <Mail size={16} color="#38BDF8" style={{ marginTop: 2, flexShrink: 0 }} />
                <Box>
                  <Typography sx={{ fontSize: '11.5px', color: '#94A3B8' }}>Official Support Email</Typography>
                  <Link
                    href="mailto:support@shazuone.com"
                    sx={{
                      color: '#E2E8F0',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': { color: '#38BDF8' }
                    }}
                  >
                    support@shazuone.com
                  </Link>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                <MapPin size={16} color="#38BDF8" style={{ marginTop: 2, flexShrink: 0 }} />
                <Box>
                  <Typography sx={{ fontSize: '11.5px', color: '#94A3B8' }}>Registered Salem Operations</Typography>
                  <Typography sx={{ fontSize: '12.5px', color: '#CBD5E1', lineHeight: 1.4 }}>
                    Fairlands Main Road, Opposite Reliance Mart, Salem — 636016, Tamil Nadu, India.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ── 3. Bottom Legal, Payment Badges & Developer Attribution ── */}
      <Box
        sx={{
          borderTop: '1px solid #1C2541',
          pt: 3,
          pb: { xs: '84px', md: 3 }, // extra clearance on mobile so floating bottom nav doesn't cover footer
          bgcolor: '#070C1E'
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2.5
            }}
          >
            {/* Copyright & Security */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>
                © 2026 <Box component="span" sx={{ color: '#F8FAFC', fontWeight: 700 }}>Shazu One</Box>. All rights reserved.
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#64748B', mt: 0.4 }}>
                ISO 9001:2015 Service Quality Standard • 256-Bit SSL Encrypted Escrow Transactions
              </Typography>
            </Box>

            {/* Payment & Security Method Badges */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Box
                sx={{
                  px: 1.2,
                  py: 0.4,
                  borderRadius: '6px',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#94A3B8'
                }}
              >
                UPI / GPay / PhonePe
              </Box>
              <Box
                sx={{
                  px: 1.2,
                  py: 0.4,
                  borderRadius: '6px',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#94A3B8'
                }}
              >
                Razorpay Verified
              </Box>
              <Box
                sx={{
                  px: 1.2,
                  py: 0.4,
                  borderRadius: '6px',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#94A3B8'
                }}
              >
                RuPay & Visa
              </Box>
              <Box
                sx={{
                  px: 1.2,
                  py: 0.4,
                  borderRadius: '6px',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#94A3B8'
                }}
              >
                Cash on Completion
              </Box>
            </Box>

            {/* Developer Credit */}
            <Box
              component="a"
              href="https://shazusofttechnologies.org/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.2,
                textDecoration: 'none',
                bgcolor: 'rgba(255, 255, 255, 0.04)',
                py: 0.8,
                px: 2,
                borderRadius: '30px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(56, 189, 248, 0.08)',
                  borderColor: '#38BDF8',
                  transform: 'translateY(-1px)'
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
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  objectFit: 'contain'
                }}
              />
              <Typography sx={{ color: '#E2E8F0', fontSize: '11.5px', fontWeight: 600 }}>
                Crafted by{' '}
                <Box component="span" sx={{ color: '#38BDF8', fontWeight: 800 }}>
                  Shazu Soft Technologies
                </Box>
              </Typography>
              <ArrowUpRight size={13} color="#38BDF8" />
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
