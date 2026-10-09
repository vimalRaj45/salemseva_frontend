import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Radio,
  Button,
  Chip,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  Skeleton,
  TextField,
  InputAdornment,
  Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MicIcon from '@mui/icons-material/Mic';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';

import { ApiService } from '../../services/api';
import LocationPickerModal from '../../components/LocationPickerModal';
import ProcessingBackdrop from '../../components/ProcessingBackdrop';
import { useAuth } from '../../context/AuthContext';

export default function ServiceDetailPage({ onStartBooking, onOpenVoiceAgent }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { serviceId = 'ac' } = useParams();
  const [selectedIssue, setSelectedIssue] = useState('not_cooling');
  const [customDescription, setCustomDescription] = useState('');
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('SALEM100');
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(true);
  const [couponDiscount, setCouponDiscount] = useState(50);
  const [couponError, setCouponError] = useState('');

  const [serviceInfo, setServiceInfo] = useState(null);
  const [issuesList, setIssuesList] = useState([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(() => {
    const saved = localStorage.getItem('salemseva_user_location');
    return saved ? JSON.parse(saved) : {
      locality: 'Fairlands',
      pincode: '636016',
      address: 'Plot 42, 5th Cross, Fairlands, Salem - 636016',
      lat: 11.6738,
      lng: 78.1460
    };
  });

  useEffect(() => {
    async function loadServiceData() {
      setIsLoadingIssues(true);
      try {
        // Fetch Service Info from DB
        const svcRes = await fetch(`http://localhost:8080/api/v1/services/${serviceId || 'ac'}`);
        const svcData = await svcRes.json();
        if (svcData.success && svcData.service) {
          setServiceInfo(svcData.service);
        }

        // Fetch Issues from DB
        const issues = await ApiService.fetchIssues(serviceId || 'ac', 'en');
        if (issues && issues.length > 0) {
          const list = issues.map(i => ({
            id: i.id || 'issue_default',
            title: i.name || i.issue_name || 'Inspection & Repair',
            estRange: i.estRange || 'Quote on Inspection',
            visitFee: '₹99'
          }));
          setIssuesList(list);
          setSelectedIssue(list[0].id);
        }
      } catch (e) {
        console.warn('Failed to load service data from DB:', e);
      } finally {
        setIsLoadingIssues(false);
      }
    }
    loadServiceData();
  }, [serviceId]);

  const defaultIssues = [
    { id: 'not_cooling', title: 'Diagnostic & Troubleshooting', estRange: '₹299 - ₹799', visitFee: '₹99' },
    { id: 'water_leak', title: 'Repair & Parts Replacement', estRange: '₹199 - ₹499', visitFee: '₹99' },
    { id: 'full_service', title: 'Complete Deep Service & Maintenance', estRange: '₹449 - ₹899', visitFee: '₹99' },
    { id: 'other', title: 'Other problem / Custom inspection required', estRange: 'Quote on Inspection', visitFee: '₹99' }
  ];

  const displayIssues = issuesList.length > 0 ? issuesList : defaultIssues;

  const getServiceIcon = () => {
    switch (serviceId) {
      case 'ac':
        return <AcUnitIcon sx={{ fontSize: 24 }} />;
      case 'electrician':
        return <WorkOutlineIcon sx={{ fontSize: 24 }} />;
      case 'plumber':
        return <WorkOutlineIcon sx={{ fontSize: 24 }} />;
      case 'cleaning':
        return <WorkOutlineIcon sx={{ fontSize: 24 }} />;
      default:
        return <WorkOutlineIcon sx={{ fontSize: 24 }} />;
    }
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = (couponInput || '').trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a valid promo code');
      return;
    }
    if (code === 'SALEM100' || code === 'FIRST100' || code === 'SUPERSEVA') {
      setCouponCode(code);
      setCouponDiscount(50);
      setCouponApplied(true);
      setCouponInput('');
    } else if (code === 'SALEM50' || code === 'SAVE50') {
      setCouponCode(code);
      setCouponDiscount(30);
      setCouponApplied(true);
      setCouponInput('');
    } else {
      setCouponCode(code);
      setCouponDiscount(40);
      setCouponApplied(true);
      setCouponInput('');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    setCouponDiscount(0);
    setCouponError('');
  };

  const handleProceed = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: serviceId || 'ac',
          issueId: selectedIssue,
          customNotes: customDescription,
          customerId: user?.id || 'usr-cust-001',
          customerName: user?.name || 'Vimal Raj',
          customerPhone: user?.phone || '+919842711234',
          lat: userLocation.lat || 11.6643,
          lng: userLocation.lng || 78.1460,
          locality: userLocation.locality || 'Fairlands',
          address: userLocation.address || 'Plot 42, 5th Cross, Fairlands, Salem - 636016',
          couponCode: couponApplied ? couponCode : null,
          discountAmount: couponApplied ? couponDiscount : 0
        })
      });
      const data = await res.json();
      const bId = data.booking?.id || 'SLM-84920';
      localStorage.setItem('salemseva_active_booking', bId);
      window.dispatchEvent(new CustomEvent('salemseva_new_booking_created', { detail: { bookingId: bId, booking: data.booking } }));
      window.dispatchEvent(new Event('storage'));
      if (onStartBooking) onStartBooking(data.booking);
      setIsProcessing(false);
      navigate(`/matching?bookingId=${bId}`);
    } catch (e) {
      console.warn('Fallback to matching view:', e);
      localStorage.setItem('salemseva_active_booking', 'SLM-84920');
      setIsProcessing(false);
      navigate('/matching?bookingId=SLM-84920');
    }
  };

  const currentServiceName = serviceInfo?.name || (
    serviceId === 'ac' ? 'AC Repair & Service' :
    serviceId === 'electrician' ? 'Electrician & Wiring Service' :
    serviceId === 'plumber' ? 'Plumber & Sanitary Service' :
    serviceId === 'cleaning' ? 'Home & Deep Cleaning' : 'Doorstep Home Service'
  );

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 14 }}>
      <Container maxWidth="sm" sx={{ px: 2, pt: 2 }}>
        
        {/* Location selector bar */}
        <Paper
          elevation={0}
          onClick={() => setLocationPickerOpen(true)}
          sx={{
            p: 1.2,
            mb: 1.5,
            borderRadius: '8px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            '&:hover': { borderColor: '#CBD5E1' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <LocationOnIcon sx={{ fontSize: 20, color: '#2563EB', flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
                {userLocation.locality || 'Fairlands, Salem'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748B',
                  fontSize: '11px',
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {userLocation.address || 'Service address in Salem'}
              </Typography>
            </Box>
          </Box>

          <Button
            size="small"
            endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
            sx={{
              color: '#2563EB',
              fontWeight: 600,
              fontSize: '12px',
              textTransform: 'none',
              flexShrink: 0
            }}
          >
            Change
          </Button>
        </Paper>

        {/* Service Hero Header Card (Dynamic from DB) */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            p: 1.5,
            mb: 1.5
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '8px',
                bgcolor: '#EFF6FF',
                color: serviceInfo?.colorHex || '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {getServiceIcon()}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '14.5px', lineHeight: 1.2 }}>
                {currentServiceName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <StarIcon sx={{ color: '#D97706', fontSize: 14 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '11.5px' }}>
                    4.9
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11.5px' }}>
                  • Verified Salem Technicians • 15–25 min ETA
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Coupon Discount Section */}
        {couponApplied ? (
          <Paper
            elevation={0}
            sx={{
              p: 1.2,
              bgcolor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalOfferIcon sx={{ color: '#16A34A', fontSize: 16 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#166534', fontSize: '12px' }}>
                  ₹{couponDiscount} discount applied ({couponCode})
                </Typography>
                <Typography variant="caption" sx={{ color: '#15803D', fontSize: '11px' }}>
                  Promotional credit applied to inspection & repair bill
                </Typography>
              </Box>
            </Box>

            <Button
              size="small"
              startIcon={<CloseIcon sx={{ fontSize: 13 }} />}
              onClick={handleRemoveCoupon}
              sx={{ color: '#475569', fontWeight: 600, fontSize: '11.5px', textTransform: 'none', py: 0.2, '&:hover': { color: '#EF4444' } }}
            >
              Remove
            </Button>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              mb: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
              <LocalOfferIcon sx={{ color: '#2563EB', fontSize: 16 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '12.5px' }}>
                Have a coupon or referral code?
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Enter code (e.g. SALEM100, SALEM50)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon(); }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '12px',
                    borderRadius: '6px',
                    bgcolor: '#F8FAFC'
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleApplyCoupon}
                sx={{
                  bgcolor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '12px',
                  px: 2,
                  textTransform: 'none',
                  flexShrink: 0,
                  '&:hover': { bgcolor: '#1E293B' }
                }}
              >
                Apply
              </Button>
            </Box>
            {couponError && (
              <Typography variant="caption" sx={{ color: '#EF4444', fontSize: '11px', mt: 0.5, display: 'block' }}>
                {couponError}
              </Typography>
            )}
          </Paper>
        )}

        {/* Issue Selector Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
            Select issue or problem
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11.5px' }}>
            Estimated cost in Salem
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {isLoadingIssues ? (
            [1, 2, 3, 4].map((n) => (
              <Card key={n} elevation={0} sx={{ p: 1.2, borderRadius: '8px' }}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={14} />
              </Card>
            ))
          ) : (
            displayIssues.map((item) => {
              const isSelected = selectedIssue === item.id;
              return (
                <Card
                  key={item.id}
                  elevation={0}
                  onClick={() => setSelectedIssue(item.id)}
                  sx={{
                    p: 1.2,
                    bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    border: isSelected ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Radio
                      checked={isSelected}
                      onChange={() => setSelectedIssue(item.id)}
                      size="small"
                      sx={{ p: 0.2, '&.Mui-checked': { color: '#2563EB' } }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: isSelected ? 600 : 500, color: '#0F172A', fontSize: '13px' }}>
                      {item.title}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, display: 'block', fontSize: '11px' }}>
                      {item.estRange}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#16A34A', fontSize: '10.5px' }}>
                      Visit fee: ₹49
                    </Typography>
                  </Box>
                </Card>
              );
            })
          )}
        </Box>

        {/* Optional Problem Details Textarea */}
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            p: 1.5,
            mb: 2.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
            <EditNoteIcon sx={{ color: '#2563EB', fontSize: 18 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '12.5px' }}>
              Describe problem details (optional)
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="e.g. AC unit is on 2nd floor, making buzzing noise since yesterday, error code E4..."
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '12px',
                borderRadius: '6px',
                bgcolor: '#F8FAFC'
              }
            }}
          />
          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10.5px', mt: 0.5, display: 'block' }}>
            Our technician will review these details before arriving with the right tools.
          </Typography>
        </Card>

      </Container>

      {/* Sticky Bottom Action Bar */}
      <Paper
        elevation={0}
        sx={{
          position: 'fixed',
          bottom: 54,
          left: 0,
          right: 0,
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          px: 2,
          py: 1,
          zIndex: 990,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>
            Inspection fee: ₹49
          </Typography>
          <Typography variant="caption" sx={{ color: couponApplied ? '#16A34A' : '#64748B', fontSize: '11px', fontWeight: couponApplied ? 600 : 400 }}>
            {couponApplied ? `₹${couponDiscount} discount applied` : `Service in ${userLocation.locality || 'Fairlands, Salem'}`}
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleProceed}
          endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
          sx={{
            bgcolor: '#2563EB',
            color: '#FFFFFF',
            borderRadius: '6px',
            fontWeight: 600,
            px: 2,
            py: 0.6,
            fontSize: '13px',
            textTransform: 'none',
            '&:hover': { bgcolor: '#1D4ED8' }
          }}
        >
          Book inspection
        </Button>
      </Paper>

      {/* Bottom Navigation */}
      <Paper elevation={0} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', zIndex: 1000 }}>
        <BottomNavigation showLabels value={0} sx={{ height: 54, '& .Mui-selected': { color: '#2563EB', fontWeight: 600 } }}>
          <BottomNavigationAction label="Services" icon={<WorkOutlineIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/')} />
          <BottomNavigationAction label="Voice assist" icon={<MicIcon sx={{ fontSize: 20 }} />} onClick={onOpenVoiceAgent} />
          <BottomNavigationAction label="Bookings" icon={<ReceiptLongIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/history')} />
          <BottomNavigationAction label="Wallet" icon={<AccountCircleIcon sx={{ fontSize: 20 }} />} onClick={() => navigate('/wallet')} />
        </BottomNavigation>
      </Paper>

      {/* Location Picker Modal */}
      <LocationPickerModal
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        currentLocation={userLocation}
        onSelectLocation={(newLoc) => setUserLocation(newLoc)}
      />

      {/* Processing Loader */}
      <ProcessingBackdrop
        open={isProcessing}
        title="Searching available technicians..."
        subtitle="Finding verified partners in Fairlands & Hasthampatti zone"
        badge="Live dispatch"
      />

    </Box>
  );
}
