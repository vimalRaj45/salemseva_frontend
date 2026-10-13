import { API_V1_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export default function AdminSettlementsPage() {
  const navigate = useNavigate();
  const [settlements, setSettlements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_V1_URL}/admin/settlements`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settlements && data.settlements.length > 0) {
          setSettlements(data.settlements);
        }
      })
      .catch(err => console.warn('Using live settlements:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const displayList = settlements;

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/admin')} 
          sx={{ color: '#0284C7', mb: 2, fontWeight: 700, textTransform: 'none' }}
        >
          Back to Admin Dashboard
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <AccountBalanceWalletIcon sx={{ color: '#0284C7', fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: -0.5 }}>
            Platform Labor & Escrow Financial Settlement Inspector
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
          Live settlement split ledger ensuring transparent 95% technician labor payouts and 5% platform service commission (0% fee on offline spare parts).
        </Typography>

        <Card elevation={0} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', p: 3, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
          <Table size="medium">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC', '& th': { color: '#475569', borderColor: '#E2E8F0', fontWeight: 800 } }}>
                <TableCell>Booking ID</TableCell>
                <TableCell>Customer & Tech</TableCell>
                <TableCell>Gross Escrow</TableCell>
                <TableCell>Technician Payout (95% Labor + Visit)</TableCell>
                <TableCell>SalemSeva Cut (5% Labor)</TableCell>
                <TableCell>Transfer Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                [1, 2, 3].map((n) => (
                  <TableRow key={n}>
                    <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                    <TableCell><Skeleton variant="text" width={140} height={24} /><Skeleton variant="text" width={90} height={16} /></TableCell>
                    <TableCell><Skeleton variant="text" width={70} height={24} /></TableCell>
                    <TableCell><Skeleton variant="text" width={70} height={24} /></TableCell>
                    <TableCell><Skeleton variant="text" width={70} height={24} /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={90} height={24} /></TableCell>
                  </TableRow>
                ))
              ) : (
                displayList.map((s, idx) => (
                  <TableRow key={s.id || idx} hover sx={{ '& td': { borderColor: '#E2E8F0', py: 1.5 } }}>
                    <TableCell>
                      <Chip label={`#${s.booking_id || s.job}`} size="small" sx={{ bgcolor: '#E0F2FE', color: '#0284C7', fontWeight: 800 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>{s.customer_name || s.customer}</Typography>
                      <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700 }}>→ {s.technician_name || s.tech}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>
                      ₹{s.amount_total || s.gross}
                    </TableCell>
                    <TableCell sx={{ color: '#059669', fontWeight: 800 }}>
                      ₹{s.tech_payout_amount || s.techPayout}
                    </TableCell>
                    <TableCell sx={{ color: '#0284C7', fontWeight: 800 }}>
                      ₹{s.platform_commission || s.platformRev}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<CheckCircleIcon sx={{ color: '#166534 !important', fontSize: 16 }} />}
                        label="RAZORPAY SETTLED"
                        size="small"
                        sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '10.5px' }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </Container>
    </Box>
  );
}
