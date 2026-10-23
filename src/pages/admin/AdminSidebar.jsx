import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Avatar,
  Drawer
} from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import TimelineIcon from '@mui/icons-material/Timeline';
import EngineeringIcon from '@mui/icons-material/Engineering';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import GroupIcon from '@mui/icons-material/Group';
import NavigationIcon from '@mui/icons-material/Navigation';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ShieldIcon from '@mui/icons-material/Shield';
import SecurityIcon from '@mui/icons-material/Security';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PaymentsIcon from '@mui/icons-material/Payments';
import QrCode2Icon from '@mui/icons-material/QrCode2';

const navSections = [
  {
    category: 'Operations & Dispatch',
    items: [
      {
        id: 'ops',
        label: 'Live Dispatch Queue',
        icon: HubIcon,
        badgeKey: 'activeBookings',
        badgeColor: '#0284C7',
        badgeBg: '#E0F2FE'
      },
      {
        id: 'tracking',
        label: 'Live Tracking Console',
        icon: NavigationIcon,
        badgeKey: 'trackingCount',
        badgeColor: '#16A34A',
        badgeBg: '#DCFCE7'
      }
    ]
  },
  {
    category: 'Services & Pricing',
    items: [
      {
        id: 'services',
        label: 'Services & Inspection Fees',
        icon: PriceCheckIcon,
        badgeText: 'CRUD',
        badgeColor: '#7C3AED',
        badgeBg: '#F3E8FF'
      }
    ]
  },
  {
    category: 'Partner Fleet',
    items: [
      {
        id: 'technicians',
        label: 'Technicians Fleet & KYC',
        icon: EngineeringIcon,
        badgeKey: 'techCount',
        badgeColor: '#475569',
        badgeBg: '#F1F5F9'
      }
    ]
  },
  {
    category: 'Customer & Quality',
    items: [
      {
        id: 'customers',
        label: 'Customers 360 CRM',
        icon: PeopleAltIcon,
        badgeKey: 'customerCount',
        badgeColor: '#475569',
        badgeBg: '#F1F5F9'
      },
      {
        id: 'feedback',
        label: 'Feedback & Grievance Desk',
        icon: RateReviewIcon,
        badgeKey: 'newFeedbackCount',
        badgeColor: '#DC2626',
        badgeBg: '#FEE2E2'
      }
    ]
  },
  {
    category: 'Growth & Economics',
    items: [
      {
        id: 'rewards',
        label: 'Rewards & Coupon Codes',
        icon: ConfirmationNumberIcon,
        badgeKey: 'couponsCount',
        badgeColor: '#B45309',
        badgeBg: '#FEF3C7'
      },
      {
        id: 'settlements',
        label: 'Escrow & Settlements',
        icon: AccountBalanceWalletIcon,
        badgeText: 'Razorpay',
        badgeColor: '#0284C7',
        badgeBg: '#E0F2FE'
      }
    ]
  },
  {
    category: 'Governance & Security',
    items: [
      {
        id: 'whatsapp_gateway',
        label: 'WhatsApp OTP Gateway',
        icon: QrCode2Icon,
        badgeText: 'Baileys',
        badgeColor: '#059669',
        badgeBg: '#ECFDF5'
      },
      {
        id: 'team',
        label: 'Internal Team & RBAC',
        icon: GroupIcon,
        badgeKey: 'teamCount',
        badgeColor: '#4338CA',
        badgeBg: '#EEF2FF'
      },
      {
        id: 'traceability',
        label: 'Audit Traceability Logs',
        icon: TimelineIcon,
        badgeText: 'Logs',
        badgeColor: '#059669',
        badgeBg: '#ECFDF5'
      }
    ]
  }
];

export default function AdminSidebar({
  collapsed,
  onToggleCollapse,
  activeTab,
  onSelectTab,
  badgeData = {},
  currentRole = 'super_admin',
  onRoleChange = () => {},
  mobileOpen = false,
  onCloseMobile = () => {}
}) {
  const getBadgeValue = (item) => {
    if (item.badgeText) return item.badgeText;
    if (item.badgeKey && badgeData[item.badgeKey] !== undefined) {
      return badgeData[item.badgeKey];
    }
    return null;
  };

  const roleLabels = {
    super_admin: { label: 'Super Admin', color: '#7C3AED', icon: SecurityIcon },
    ops_dispatcher: { label: 'Ops Dispatcher', color: '#0284C7', icon: HubIcon },
    support_quality: { label: 'Support & Quality', color: '#D97706', icon: SupportAgentIcon },
    finance_officer: { label: 'Finance Officer', color: '#059669', icon: PaymentsIcon }
  };

  const CurrentRoleIcon = roleLabels[currentRole]?.icon || AdminPanelSettingsIcon;

  const renderContent = (isMobile = false) => {
    const isCollapsed = isMobile ? false : collapsed;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Brand Header */}
        <Box
          sx={{
            p: isCollapsed ? 1.5 : 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            borderBottom: '1px solid #E2E8F0',
            minHeight: 64
          }}
        >
          {!isCollapsed ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(13, 59, 102, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 0.5,
                  overflow: 'hidden'
                }}
              >
                <img
                  src="/logo-mark.svg"
                  onError={(e) => { e.currentTarget.src = '/logo-mark.png'; }}
                  alt="Shazu One"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
                  Shazu One
                </Typography>
                <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 800, fontSize: '10.5px' }}>
                  Ops Command Hub
                </Typography>
              </Box>
            </Box>
          ) : (
            <Tooltip title="Expand Sidebar" placement="right">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(13, 59, 102, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 0.5,
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
                onClick={onToggleCollapse}
              >
                <img
                  src="/logo-mark.svg"
                  onError={(e) => { e.currentTarget.src = '/logo-mark.png'; }}
                  alt="Shazu One"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </Box>
            </Tooltip>
          )}

          {isMobile ? (
            <IconButton
              size="small"
              onClick={onCloseMobile}
              aria-label="Close navigation"
              sx={{
                color: '#64748B',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                minWidth: 40,
                minHeight: 40,
                '&:hover': { bgcolor: '#F8FAFC', color: '#0F172A' }
              }}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          ) : (
            !isCollapsed && (
              <Tooltip title="Collapse Sidebar">
                <IconButton
                  size="small"
                  onClick={onToggleCollapse}
                  aria-label="Collapse sidebar"
                  sx={{
                    color: '#64748B',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    minWidth: 36,
                    minHeight: 36,
                    '&:hover': { bgcolor: '#F8FAFC', color: '#0F172A' }
                  }}
                >
                  <ChevronLeftIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )
          )}
        </Box>

        {/* Nav Items List */}
        <Box
          component="nav"
          aria-label="Admin Navigation"
          sx={{
            flex: 1,
            overflowY: 'auto',
            py: 1.5,
            px: isCollapsed ? 0.8 : 1.2,
            WebkitOverflowScrolling: 'touch',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 2 }
          }}
        >
          {navSections.map((section) => (
            <Box key={section.category} sx={{ mb: 1.8 }}>
              {!isCollapsed && (
                <Typography
                  variant="caption"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    display: 'block',
                    color: '#94A3B8',
                    fontWeight: 800,
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px'
                  }}
                >
                  {section.category}
                </Typography>
              )}

              {section.items.map((item) => {
                const ItemIcon = item.icon;
                const isSelected = activeTab === item.id;
                const badgeVal = getBadgeValue(item);

                return (
                  <Tooltip
                    key={item.id}
                    title={isCollapsed ? `${item.label} ${badgeVal ? `(${badgeVal})` : ''}` : ''}
                    placement="right"
                  >
                    <Box
                      component="button"
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id);
                        if (isMobile && onCloseMobile) {
                          onCloseMobile();
                        }
                      }}
                      sx={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        textAlign: 'left',
                        font: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'space-between',
                        px: isCollapsed ? 1 : 1.4,
                        py: 1.1,
                        minHeight: 44,
                        mb: 0.5,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        bgcolor: isSelected ? '#F0F9FF' : 'transparent',
                        color: isSelected ? '#0284C7' : '#475569',
                        boxShadow: isSelected ? 'inset 0 0 0 1px #BAE6FD' : 'none',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          bgcolor: isSelected ? '#F0F9FF' : '#F8FAFC',
                          color: isSelected ? '#0284C7' : '#0F172A'
                        },
                        '&:focus-visible': {
                          outline: '2px solid #0284C7',
                          outlineOffset: 1
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, overflow: 'hidden' }}>
                        <ItemIcon
                          sx={{
                            fontSize: 20,
                            color: isSelected ? '#0284C7' : '#64748B',
                            flexShrink: 0
                          }}
                        />
                        {!isCollapsed && (
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: isSelected ? 800 : 600,
                              fontSize: '13px',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden'
                            }}
                          >
                            {item.label}
                          </Typography>
                        )}
                      </Box>

                      {!isCollapsed && badgeVal !== null && badgeVal !== undefined && (
                        <Chip
                          label={badgeVal}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '10.5px',
                            fontWeight: 800,
                            bgcolor: isSelected ? '#0284C7' : (item.badgeBg || '#F1F5F9'),
                            color: isSelected ? '#FFFFFF' : (item.badgeColor || '#475569')
                          }}
                        />
                      )}
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          ))}
        </Box>

        {/* Footer Role Switcher & Operator Details */}
        <Box
          sx={{
            p: isCollapsed ? 1 : 1.5,
            borderTop: '1px solid #E2E8F0',
            bgcolor: '#F8FAFC'
          }}
        >
          {!isCollapsed ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, fontSize: '10.5px' }}>
                  CURRENT RBAC ROLE
                </Typography>
                <Chip
                  icon={<CurrentRoleIcon sx={{ fontSize: '12px !important', color: `${roleLabels[currentRole]?.color} !important` }} />}
                  label={roleLabels[currentRole]?.label || 'Super Admin'}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '10px',
                    fontWeight: 800,
                    color: roleLabels[currentRole]?.color || '#7C3AED',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0'
                  }}
                />
              </Box>

              <FormControl fullWidth size="small">
                {/* ds-allow-native-select */}
                <Select
                  value={currentRole}
                  onChange={(e) => onRoleChange(e.target.value)}
                  sx={{
                    bgcolor: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    minHeight: 38
                  }}
                >
                  <MenuItem value="super_admin" sx={{ fontSize: '12.5px', fontWeight: 700 }}>
                    Super Admin (Full Root)
                  </MenuItem>
                  <MenuItem value="ops_dispatcher" sx={{ fontSize: '12.5px', fontWeight: 700 }}>
                    Ops Dispatcher (Dispatch & Fleet)
                  </MenuItem>
                  <MenuItem value="support_quality" sx={{ fontSize: '12.5px', fontWeight: 700 }}>
                    Support & Quality (Reviews & Logs)
                  </MenuItem>
                  <MenuItem value="finance_officer" sx={{ fontSize: '12.5px', fontWeight: 700 }}>
                    Finance Officer (Pricing & Escrow)
                  </MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.2 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: roleLabels[currentRole]?.color || '#0284C7',
                    fontSize: '12px',
                    fontWeight: 800
                  }}
                >
                  {currentRole === 'super_admin' ? 'VR' : currentRole === 'ops_dispatcher' ? 'AM' : currentRole === 'support_quality' ? 'PS' : 'KK'}
                </Avatar>
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', display: 'block', lineHeight: 1.1 }}>
                    {currentRole === 'super_admin' ? 'Vimal Raj' : currentRole === 'ops_dispatcher' ? 'Anand M.' : currentRole === 'support_quality' ? 'Priya S.' : 'Karthik K.'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '10px' }}>
                    Salem Central HQ
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Tooltip title={`Role: ${roleLabels[currentRole]?.label || 'Super Admin'}. Click to expand to change.`} placement="right">
              <Box
                onClick={onToggleCollapse}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  p: 0.5
                }}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: roleLabels[currentRole]?.color || '#0284C7',
                    fontSize: '12px',
                    fontWeight: 800
                  }}
                >
                  {currentRole === 'super_admin' ? 'VR' : 'OP'}
                </Avatar>
              </Box>
            </Tooltip>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <>
      {/* Desktop Sidebar (Permanent, Collapsible) */}
      <Box
        component="aside"
        sx={{
          width: collapsed ? 72 : 260,
          flexShrink: 0,
          bgcolor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 100,
          boxShadow: '1px 0 8px rgba(15, 23, 42, 0.03)'
        }}
      >
        {renderContent(false)}
      </Box>

      {/* Mobile Temporary Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={Boolean(mobileOpen)}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 290,
            maxWidth: '85vw',
            bgcolor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            boxShadow: '4px 0 24px rgba(15, 23, 42, 0.15)'
          }
        }}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        {renderContent(true)}
      </Drawer>
    </>
  );
}
