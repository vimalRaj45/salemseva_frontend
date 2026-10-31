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
  Drawer,
  List,
  ListSubheader,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
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
import SecurityIcon from '@mui/icons-material/Security';
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
        badgeColor: '#1D6FE5',
        badgeBg: '#EFF6FF'
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
      },
      {
        id: 'tickets',
        label: 'Support Tickets Desk',
        icon: SupportAgentIcon,
        badgeKey: 'openTicketsCount',
        badgeColor: '#EA580C',
        badgeBg: '#FFF7ED'
      }
    ]
  },
  {
    category: 'Growth & Economics',
    items: [
      {
        id: 'rewards',
        label: 'Settings, Fees & Rewards',
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
        badgeColor: '#1D6FE5',
        badgeBg: '#EFF6FF'
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
        badgeColor: '#16A34A',
        badgeBg: '#DCFCE7'
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
        badgeColor: '#16A34A',
        badgeBg: '#DCFCE7'
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
    ops_dispatcher: { label: 'Ops Dispatcher', color: '#1D6FE5', icon: HubIcon },
    support_quality: { label: 'Support & Quality', color: '#D97706', icon: SupportAgentIcon },
    finance_officer: { label: 'Finance Officer', color: '#16A34A', icon: PaymentsIcon }
  };

  const CurrentRoleIcon = roleLabels[currentRole]?.icon || AdminPanelSettingsIcon;

  const renderContent = (isMobile = false) => {
    const isCollapsed = isMobile ? false : collapsed;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#FFFFFF' }}>
        {/* Brand Header */}
        <Box
          sx={{
            p: isCollapsed ? 1.5 : 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            borderBottom: '1px solid',
            borderColor: 'slate.200',
            minHeight: 64
          }}
        >
          {!isCollapsed ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid',
                  borderColor: 'slate.200',
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
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'slate.900', lineHeight: 1.15 }}>
                  Shazu Ops
                </Typography>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, fontSize: '11px' }}>
                  Central Command
                </Typography>
              </Box>
            </Box>
          ) : (
            <Tooltip title="Expand Sidebar" placement="right">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid',
                  borderColor: 'slate.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 0.5,
                  cursor: 'pointer'
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
                color: 'slate.600',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'slate.200',
                '&:hover': { bgcolor: 'slate.50', color: 'slate.900' }
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          ) : (
            !isCollapsed && (
              <Tooltip title="Collapse to rail">
                <IconButton
                  size="small"
                  onClick={onToggleCollapse}
                  aria-label="Collapse sidebar"
                  sx={{
                    color: 'slate.600',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: 'slate.200',
                    '&:hover': { bgcolor: 'slate.50', color: 'slate.900' }
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
            px: isCollapsed ? 0.75 : 1.25,
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {navSections.map((section) => (
            <List
              key={section.category}
              dense
              disablePadding
              subheader={
                !isCollapsed ? (
                  <ListSubheader
                    disableSticky
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      bgcolor: 'transparent',
                      color: 'slate.400',
                      fontWeight: 700,
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      lineHeight: '24px'
                    }}
                  >
                    {section.category}
                  </ListSubheader>
                ) : undefined
              }
              sx={{ mb: 1.5 }}
            >
              {section.items.map((item) => {
                const ItemIcon = item.icon;
                const isSelected = activeTab === item.id;
                const badgeVal = getBadgeValue(item);

                return (
                  <ListItem key={item.id} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                    <Tooltip
                      title={isCollapsed ? `${item.label} ${badgeVal ? `(${badgeVal})` : ''}` : ''}
                      placement="right"
                      arrow
                    >
                      <ListItemButton
                        onClick={() => {
                          onSelectTab(item.id);
                          if (isMobile && onCloseMobile) {
                            onCloseMobile();
                          }
                        }}
                        selected={isSelected}
                        sx={{
                          minHeight: 40,
                          borderRadius: '8px',
                          px: isCollapsed ? 1 : 1.5,
                          py: 0.75,
                          justifyContent: isCollapsed ? 'center' : 'space-between',
                          borderLeft: isSelected ? '3px solid' : '3px solid transparent',
                          borderColor: isSelected ? 'primary.main' : 'transparent',
                          bgcolor: isSelected ? '#EFF6FF' : 'transparent',
                          color: isSelected ? 'primary.main' : 'slate.700',
                          '&:hover': {
                            bgcolor: isSelected ? '#EFF6FF' : 'slate.50',
                            color: isSelected ? 'primary.main' : 'slate.900'
                          },
                          '&.Mui-selected': {
                            bgcolor: '#EFF6FF',
                            color: 'primary.main',
                            '&:hover': {
                              bgcolor: '#EFF6FF'
                            }
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              color: isSelected ? 'primary.main' : 'slate.500',
                              justifyContent: 'center'
                            }}
                          >
                            <ItemIcon sx={{ fontSize: 18 }} />
                          </ListItemIcon>

                          {!isCollapsed && (
                            <ListItemText
                              primary={item.label}
                              primaryTypographyProps={{
                                fontSize: '13px',
                                fontWeight: isSelected ? 700 : 500,
                                noWrap: false,
                                lineHeight: 1.3
                              }}
                            />
                          )}
                        </Box>

                        {!isCollapsed && badgeVal !== null && badgeVal !== undefined && (
                          <Chip
                            label={badgeVal}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '10.5px',
                              fontWeight: 700,
                              bgcolor: isSelected ? 'primary.main' : (item.badgeBg || 'slate.100'),
                              color: isSelected ? '#FFFFFF' : (item.badgeColor || 'slate.600'),
                              borderRadius: '4px',
                              ml: 1
                            }}
                          />
                        )}
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </List>
          ))}
        </Box>

        {/* Pinned Footer: RBAC Role & Profile */}
        <Box
          sx={{
            p: isCollapsed ? 1 : 1.75,
            borderTop: '1px solid',
            borderColor: 'slate.200',
            bgcolor: 'slate.50'
          }}
        >
          {!isCollapsed ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'slate.500', fontWeight: 700, fontSize: '10px' }}>
                  RBAC Role
                </Typography>
                <Chip
                  icon={<CurrentRoleIcon sx={{ fontSize: '12px !important', color: `${roleLabels[currentRole]?.color} !important` }} />}
                  label={roleLabels[currentRole]?.label || 'Super Admin'}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '10px',
                    fontWeight: 700,
                    color: roleLabels[currentRole]?.color || '#7C3AED',
                    bgcolor: '#FFFFFF',
                    border: '1px solid',
                    borderColor: 'slate.200'
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
                    color: 'slate.900',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    height: 36,
                    border: '1px solid',
                    borderColor: 'slate.200'
                  }}
                >
                  <MenuItem value="super_admin" sx={{ fontSize: '12px', fontWeight: 600 }}>
                    Super Admin (Full Root)
                  </MenuItem>
                  <MenuItem value="ops_dispatcher" sx={{ fontSize: '12px', fontWeight: 600 }}>
                    Ops Dispatcher (Dispatch & Fleet)
                  </MenuItem>
                  <MenuItem value="support_quality" sx={{ fontSize: '12px', fontWeight: 600 }}>
                    Support & Quality (Reviews & Logs)
                  </MenuItem>
                  <MenuItem value="finance_officer" sx={{ fontSize: '12px', fontWeight: 600 }}>
                    Finance Officer (Pricing & Escrow)
                  </MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mt: 1.5 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: roleLabels[currentRole]?.color || 'primary.main',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  {currentRole === 'super_admin' ? 'VR' : currentRole === 'ops_dispatcher' ? 'AM' : currentRole === 'support_quality' ? 'PS' : 'KK'}
                </Avatar>
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'slate.900', fontSize: '12px', lineHeight: 1.2 }}>
                    {currentRole === 'super_admin' ? 'Vimal Raj' : currentRole === 'ops_dispatcher' ? 'Anand M.' : currentRole === 'support_quality' ? 'Priya S.' : 'Karthik K.'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'slate.500', fontSize: '11px' }}>
                    Salem Central HQ
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Tooltip title={`Role: ${roleLabels[currentRole]?.label || 'Super Admin'}. Click to expand.`} placement="right">
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
                    width: 32,
                    height: 32,
                    bgcolor: roleLabels[currentRole]?.color || 'primary.main',
                    fontSize: '12px',
                    fontWeight: 700
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
      {/* Desktop Permanent Drawer (lg+) collapsible to 72px icon rail */}
      <Box
        component="aside"
        sx={{
          width: collapsed ? 72 : 260,
          flexShrink: 0,
          bgcolor: '#FFFFFF',
          borderRight: '1px solid',
          borderColor: 'slate.200',
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          height: '100dvh',
          position: 'sticky',
          top: 0,
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 100
        }}
      >
        {renderContent(false)}
      </Box>

      {/* Mobile / Tablet Temporary Drawer (<lg) */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={Boolean(mobileOpen)}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 280,
            maxWidth: '85vw',
            bgcolor: '#FFFFFF',
            borderRight: '1px solid',
            borderColor: 'slate.200',
            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)'
          }
        }}
        sx={{ display: { xs: 'block', lg: 'none' } }}
      >
        {renderContent(true)}
      </Drawer>
    </>
  );
}
