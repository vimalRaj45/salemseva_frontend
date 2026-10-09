import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Divider,
  Paper
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import HubIcon from '@mui/icons-material/Hub';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleIcon from '@mui/icons-material/People';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

export default function AdminPortal({ onResolveTicket }) {
  const [tickets, setTickets] = useState([
    {
      id: 'DISP-84920',
      bookingId: 'SLM-84920',
      customer: 'Priya Sundaram (Fairlands)',
      tech: 'K. Ramesh',
      rating: '2 / 5 Stars',
      rootCause: 'Late Arrival / High Price',
      status: 'ESCALATED_TO_ANAND',
      action: '100% Free Warranty Revisit Dispatched'
    }
  ]);

  return (
    <Box sx={{ width: '100%', height: '100%', overflowY: 'auto', p: 3, bgcolor: '#0B1120', color: '#FFF' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: 1 }}>
            <DashboardIcon /> SalemSeva Operations & Quality Desk
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            Salem City Live Dispatch & Escrow Settlement Monitor • Anand (Ops Lead)
          </Typography>
        </Box>
        <Chip icon={<HubIcon sx={{ color: '#10B981 !important' }} />} label="SALEM DISPATCH ONLINE" color="success" />
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#1E293B', color: '#FFF' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>ACTIVE BOOKINGS</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#38BDF8', my: 0.5 }}>14</Typography>
              <Typography variant="caption" sx={{ color: '#34D399' }}>Fairlands & Hasthampatti</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#1E293B', color: '#FFF' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>ONLINE TECHS</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#10B981', my: 0.5 }}>38</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>Govt KYC Verified</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#1E293B', color: '#FFF' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>TODAY'S GMV</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#F59E0B', my: 0.5 }}>₹42,850</Typography>
              <Typography variant="caption" sx={{ color: '#F59E0B' }}>Razorpay Escrow</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#1E293B', color: '#FFF' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>REPEAT CUST RATE</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#A855F7', my: 0.5 }}>41.2%</Typography>
              <Typography variant="caption" sx={{ color: '#C4B5FD' }}>Salem Seva Loyalty</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#1E293B', color: '#FFF', border: '1px solid #EA580C' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#F97316' }}>OPEN QUALITY TICKETS</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#EA580C', my: 0.5 }}>{tickets.length}</Typography>
              <Typography variant="caption" sx={{ color: '#FB923C' }}>Auto Free Revisit Active</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quality Escalation & Free Revisit Vault */}
      <Card sx={{ bgcolor: '#1E293B', color: '#FFF', mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#EA580C', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <ReportProblemIcon /> Priority Quality Escalation Desk (Ratings &lt; 3 Stars)
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { color: '#94A3B8', borderColor: '#334155' } }}>
                <TableCell>Ticket ID</TableCell>
                <TableCell>Booking & Customer</TableCell>
                <TableCell>Technician</TableCell>
                <TableCell>Rating & Flagged Cause</TableCell>
                <TableCell>Ops Escalation Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map(t => (
                <TableRow key={t.id} sx={{ '& td': { color: '#FFF', borderColor: '#334155' } }}>
                  <TableCell><Chip label={t.id} size="small" sx={{ bgcolor: '#7C2D12', color: '#FED7AA', fontWeight: 800 }} /></TableCell>
                  <TableCell>{t.customer}<br/><Typography variant="caption" sx={{ color: '#94A3B8' }}>{t.bookingId}</Typography></TableCell>
                  <TableCell>{t.tech}</TableCell>
                  <TableCell><Chip label={t.rating} size="small" color="error" /> {t.rootCause}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#34D399', fontWeight: 700 }}>
                       {t.action}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Razorpay Route 85/15 Split Settlement Inspector */}
      <Card sx={{ bgcolor: '#1E293B', color: '#FFF' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <MonetizationOnIcon /> Razorpay Route 85/15 Financial Settlement Inspector
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { color: '#94A3B8', borderColor: '#334155' } }}>
                <TableCell>Job ID</TableCell>
                <TableCell>Gross Customer Paid</TableCell>
                <TableCell>Technician Share (85% + Visit)</TableCell>
                <TableCell>SalemSeva Commission (15%)</TableCell>
                <TableCell>Escrow Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow sx={{ '& td': { color: '#FFF', borderColor: '#334155' } }}>
                <TableCell>SLM-84920</TableCell>
                <TableCell>₹899.00</TableCell>
                <TableCell sx={{ color: '#34D399', fontWeight: 700 }}>₹779.00 (Direct IMPS)</TableCell>
                <TableCell sx={{ color: '#38BDF8', fontWeight: 700 }}>₹120.00</TableCell>
                <TableCell><Chip label="RELEASED TO TECH" size="small" color="success" /></TableCell>
              </TableRow>
              <TableRow sx={{ '& td': { color: '#FFF', borderColor: '#334155' } }}>
                <TableCell>SLM-84912</TableCell>
                <TableCell>₹549.00</TableCell>
                <TableCell sx={{ color: '#34D399', fontWeight: 700 }}>₹481.50 (Direct IMPS)</TableCell>
                <TableCell sx={{ color: '#38BDF8', fontWeight: 700 }}>₹67.50</TableCell>
                <TableCell><Chip label="RELEASED TO TECH" size="small" color="success" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </Box>
  );
}
