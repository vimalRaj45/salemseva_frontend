import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip,
  Paper,
  Grid,
  Avatar,
  CircularProgress
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import HubIcon from '@mui/icons-material/Hub';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PaymentsIcon from '@mui/icons-material/Payments';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import { ILLUSTRATIONS } from '../../constants/visualAssets';
import { ConfirmDialog, IconActionButton } from '../../components/ui';
import { API_V1_URL } from '../../config';

const roleMeta = {
  super_admin: {
    label: 'Super Admin',
    desc: 'Full root access to entire system: pricing, team, dispatch, payouts & KYC approval.',
    color: '#7C3AED',
    bg: '#F3E8FF',
    icon: SecurityIcon
  },
  ops_dispatcher: {
    label: 'Ops Dispatcher',
    desc: 'Live booking queue, smart technician assignment, real-time tracking console.',
    color: '#0284C7',
    bg: '#E0F2FE',
    icon: HubIcon
  },
  support_quality: {
    label: 'Support & Quality',
    desc: 'Customer CRM 360, feedback desk, reviews dispute arbitration & customer escalation.',
    color: '#D97706',
    bg: '#FEF3C7',
    icon: SupportAgentIcon
  },
  finance_officer: {
    label: 'Finance Officer',
    desc: 'Escrow settlements, Razorpay payouts, platform commission splits, coupons & reward budget.',
    color: '#059669',
    bg: '#ECFDF5',
    icon: PaymentsIcon
  }
};

export default function AdminTeamModule({ currentRole = 'super_admin', onToast = () => {} }) {
  const navigate = useNavigate();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'ops_dispatcher',
    hub_locality: 'Salem Central HQ',
    status: 'active'
  });
  const [saving, setSaving] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const canManageTeam = currentRole === 'super_admin';

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_V1_URL}/admin/team`);
      const data = await res.json();
      if (data.success && Array.isArray(data.team)) {
        setTeam(data.team);
      }
    } catch (err) {
      console.warn('Failed to fetch team:', err);
      onToast('Failed to load team members from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleOpenAdd = () => {
    navigate('/admin/team/new');
  };

  const handleOpenEdit = (m) => {
    navigate(`/admin/team/${m.id}/edit`, { state: { member: m } });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      onToast('Name and email are required', 'warning');
      return;
    }

    try {
      setSaving(true);
      const url = editingMember
        ? `${API_V1_URL}/admin/team/${editingMember.id}`
        : `${API_V1_URL}/admin/team`;
      const method = editingMember ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        onToast(editingMember ? 'Team member updated' : 'Team member added', 'success');
        setDialogOpen(false);
        fetchTeam();
      } else {
        onToast(data.error || 'Operation failed', 'error');
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from internal team?`)) return;
    try {
      const res = await fetch(`${API_V1_URL}/admin/team/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onToast('Member removed from team', 'info');
        setTeam(prev => prev.filter(m => m.id !== id));
      } else {
        onToast(data.error || 'Failed to remove member', 'error');
      }
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  return (
    <Box>
      {!canManageTeam && (
        <Alert
          severity="info"
          icon={<LockIcon sx={{ fontSize: 18 }} />}
          sx={{ mb: 2.5, borderRadius: '12px', fontWeight: 700 }}
        >
          View-Only RBAC: You are operating as {currentRole}. Modifying team access permissions requires Super Admin authority.
        </Alert>
      )}

      {/* Role Definitions Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(roleMeta).map(([roleKey, meta]) => {
          const RoleIcon = meta.icon;
          const count = team.filter(m => m.role === roleKey).length;

          return (
            <Grid item xs={12} sm={6} md={3} key={roleKey}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor: meta.bg,
                      color: meta.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <RoleIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Chip
                    label={`${count} Staff`}
                    size="small"
                    sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 900, fontSize: '10px', height: 20 }}
                  />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                  {meta.label}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.3, fontSize: '11px' }}>
                  {meta.desc}
                </Typography>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Team Directory Card */}
      <Card
        elevation={0}
        sx={{
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
        }}
      >
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src={ILLUSTRATIONS.connectingTeams}
              alt="Connecting operations and field teams"
              sx={{ width: 44, height: 36, objectFit: 'contain' }}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
                Salem Operations Staff & RBAC Directory
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Internal governance and access delegation across Salem Control Hubs.
              </Typography>
            </Box>
            <Chip
              label={`${team.length} Members`}
              size="small"
              sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 800, fontSize: '11px', ml: 1 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Team">
              <IconButton onClick={fetchTeam} disabled={loading} sx={{ border: '1px solid #CBD5E1', borderRadius: '8px' }}>
                <RefreshIcon sx={{ fontSize: 18, color: '#0284C7' }} />
              </IconButton>
            </Tooltip>
            {canManageTeam && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                onClick={handleOpenAdd}
                sx={{
                  bgcolor: '#0284C7',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '12px',
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 2,
                  '&:hover': { bgcolor: '#0369A1' }
                }}
              >
                Add Staff Member
              </Button>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ p: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
            <CircularProgress size={24} sx={{ color: '#0284C7' }} />
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700 }}>
              Loading operational team...
            </Typography>
          </Box>
        ) : team.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 700 }}>
              No team members registered yet.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Typography variant="caption" sx={{ display: { xs: 'block', md: 'none' }, color: '#94A3B8', px: 2, pt: 1, fontSize: '10.5px' }}>
              Swipe left/right to view full table details
            </Typography>
            <Table size="small" sx={{ minWidth: 680 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC', '& th': { color: '#475569', fontWeight: 800, fontSize: '12px', py: 1.5 } }}>
                <TableCell>Member Name</TableCell>
                <TableCell>Role & Privileges</TableCell>
                <TableCell>Assigned Hub / Locality</TableCell>
                <TableCell>Contact Details</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {team.map((member) => {
                const meta = roleMeta[member.role] || roleMeta.ops_dispatcher;
                const RoleIcon = meta.icon;

                return (
                  <TableRow
                    key={member.id}
                    sx={{
                      '&:hover': { bgcolor: '#F8FAFC' },
                      '& td': { borderColor: '#E2E8F0', py: 1.4 }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Avatar
                          sx={{
                            width: 34,
                            height: 34,
                            bgcolor: meta.color,
                            fontSize: '13px',
                            fontWeight: 900
                          }}
                        >
                          {member.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>
                            {member.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '11px' }}>
                            ID: {member.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={<RoleIcon sx={{ fontSize: '13px !important', color: `${meta.color} !important` }} />}
                        label={meta.label}
                        size="small"
                        sx={{
                          bgcolor: meta.bg,
                          color: meta.color,
                          fontWeight: 900,
                          fontSize: '11px',
                          height: 22
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', fontSize: '12.5px' }}>
                        {member.hub_locality || 'Salem Central HQ'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', display: 'block' }}>
                        {member.email}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {member.phone || 'Phone not set'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: '12px !important', color: '#166534 !important' }} />}
                        label={member.status?.toUpperCase() || 'ACTIVE'}
                        size="small"
                        sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '9.5px', height: 20 }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      {canManageTeam ? (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <IconActionButton
                            title="Edit Member Role"
                            onClick={() => handleOpenEdit(member)}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconActionButton>
                          <IconActionButton
                            title="Remove Member"
                            color="error"
                            onClick={() => setMemberToDelete(member)}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconActionButton>
                        </Box>
                      ) : (
                        <Chip
                          icon={<LockIcon sx={{ fontSize: '11px !important' }} />}
                          label="Locked"
                          size="small"
                          sx={{ height: 20, fontSize: '9.5px', color: '#94A3B8' }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
      </Card>

      {/* Role Permission Matrix (Step 5 item 7) */}
      <Card
        elevation={0}
        sx={{
          mt: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '12px',
          p: { xs: 2, sm: 3 }
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '16px' }}>
            Role Permission Matrix & Delegation
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            RBAC capabilities matrix across Salem Operations personnel and modules.
          </Typography>
        </Box>

        <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
          <Table size="small" sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'slate.50' }}>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', position: 'sticky', left: 0, bgcolor: 'slate.50', zIndex: 1, minWidth: 200 }}>
                  CAPABILITY / SCOPE
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 110 }}>Super Admin</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 110 }}>Ops Dispatcher</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 110 }}>Support & Quality</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 110 }}>Finance Officer</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { capability: 'Live Dispatch & Queue Triage', super_admin: true, ops_dispatcher: true, support_quality: false, finance_officer: false },
                { capability: 'Manual Technician Assignment', super_admin: true, ops_dispatcher: true, support_quality: false, finance_officer: false },
                { capability: 'Technician KYC Verification', super_admin: true, ops_dispatcher: true, support_quality: false, finance_officer: false },
                { capability: 'Customer CRM & Direct Contact', super_admin: true, ops_dispatcher: true, support_quality: true, finance_officer: false },
                { capability: 'Support Tickets & Escalation', super_admin: true, ops_dispatcher: false, support_quality: true, finance_officer: false },
                { capability: 'Payment Override (Mark Paid)', super_admin: true, ops_dispatcher: false, support_quality: false, finance_officer: true },
                { capability: 'Razorpay Escrow & Settlements', super_admin: true, ops_dispatcher: false, support_quality: false, finance_officer: true },
                { capability: 'Platform Fee & Commission Editing', super_admin: true, ops_dispatcher: false, support_quality: false, finance_officer: true },
                { capability: 'Promotional Coupons Management', super_admin: true, ops_dispatcher: false, support_quality: false, finance_officer: true },
                { capability: 'Team Staff & Role Management', super_admin: true, ops_dispatcher: false, support_quality: false, finance_officer: false }
              ].map((perm, idx) => (
                <TableRow key={idx} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary', position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                    {perm.capability}
                  </TableCell>
                  <TableCell align="center">
                    {perm.super_admin ? <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} /> : <Box sx={{ width: 6, height: 2, bgcolor: 'slate.300', mx: 'auto' }} />}
                  </TableCell>
                  <TableCell align="center">
                    {perm.ops_dispatcher ? <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} /> : <Box sx={{ width: 6, height: 2, bgcolor: 'slate.300', mx: 'auto' }} />}
                  </TableCell>
                  <TableCell align="center">
                    {perm.support_quality ? <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} /> : <Box sx={{ width: 6, height: 2, bgcolor: 'slate.300', mx: 'auto' }} />}
                  </TableCell>
                  <TableCell align="center">
                    {perm.finance_officer ? <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} /> : <Box sx={{ width: 6, height: 2, bgcolor: 'slate.300', mx: 'auto' }} />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Card>

      {/* Confirm Dialog for Staff Removal */}
      <ConfirmDialog
        open={Boolean(memberToDelete)}
        title="Remove Staff Member"
        message={`Are you sure you want to remove ${memberToDelete?.name} from internal team access? Their RBAC credentials will be revoked immediately.`}
        confirmLabel="Remove Member"
        confirmColor="error"
        onConfirm={async () => {
          if (!memberToDelete) return;
          try {
            const res = await fetch(`${API_V1_URL}/admin/team/${memberToDelete.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
              onToast('Member removed from team', 'info');
              setTeam(prev => prev.filter(m => m.id !== memberToDelete.id));
            } else {
              onToast(data.error || 'Failed to remove member', 'error');
            }
          } catch (err) {
            onToast(err.message, 'error');
          } finally {
            setMemberToDelete(null);
          }
        }}
        onCancel={() => setMemberToDelete(null)}
      />
    </Box>
  );
}
