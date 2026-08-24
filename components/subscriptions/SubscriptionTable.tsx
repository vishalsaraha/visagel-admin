'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  FileText,
} from 'lucide-react';
import { Organization, PaymentInvoice, OrgPlanTier, PaymentStatus } from '@/types';
import { useAdminData } from '@/context/AdminDataContext';
import { PlanBadge, PaymentStatusBadge } from '@/components/organizations/PlanStatusBadge';

export const SubscriptionTable: React.FC = () => {
  const { organizations, invoices, updateOrgSubscription, updateInvoiceStatus, plans } = useAdminData();

  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [openPlanModal, setOpenPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState<OrgPlanTier>('GROWTH');
  const [newCycle, setNewCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [newStatus, setNewStatus] = useState<PaymentStatus>('PAID');

  const handleOpenUpgrade = (org: Organization) => {
    setSelectedOrg(org);
    setNewPlan(org.plan);
    setNewCycle(org.billingCycle);
    setNewStatus(org.paymentStatus);
    setOpenPlanModal(true);
  };

  const handleSavePlan = async () => {
    if (!selectedOrg) return;
    await updateOrgSubscription(selectedOrg.id, newPlan, newCycle, newStatus);
    setOpenPlanModal(false);
  };

  const handleToggleInvoicePaid = async (inv: PaymentInvoice) => {
    const nextStatus = inv.status === 'PAID' ? 'PENDING' : 'PAID';
    await updateInvoiceStatus(inv.id, nextStatus);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Organizations Subscription & Device Quota Overview */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CreditCard size={20} color="#FF6900" />
                Active Organization Subscriptions & App Access Controls
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Manage live billing status, face quota limits, and app sync permissions per tenant.
              </Typography>
            </Box>
          </Box>

          <TableContainer sx={{ borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Organization</TableCell>
                  <TableCell>Assigned Plan</TableCell>
                  <TableCell>Billing Cycle</TableCell>
                  <TableCell>Monthly / Annual Rate</TableCell>
                  <TableCell>Employee / Face Limit</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Next Billing Date</TableCell>
                  <TableCell align="right">Manage Plan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {org.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontFamily: 'monospace' }}>
                        {org.orgId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <PlanBadge plan={org.plan} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {org.billingCycle}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        ${org.planPrice} / {org.billingCycle === 'ANNUAL' ? 'yr' : 'mo'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {org.enrolledEmployeeCount} / {org.employeeQuota} Faces
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {org.activeDeviceCount} / {org.deviceQuota} Devices
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={org.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {org.nextBillingDate}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenUpgrade(org)}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                      >
                        Adjust Plan
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Invoice & Payment History Log */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Receipt size={20} color="#6366F1" />
                Payment Ledger & Invoice Audit Log
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Track payment receipts, wire transfers, and pending collections across all organizations.
              </Typography>
            </Box>
          </Box>

          <TableContainer sx={{ borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Plan Tier</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {inv.invoiceNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {inv.orgName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        ${inv.amount} {inv.currency}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <PlanBadge plan={inv.planTier} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {inv.paymentMethod} {inv.transactionRef ? `(${inv.transactionRef})` : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {inv.dueDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant={inv.status === 'PAID' ? 'text' : 'contained'}
                        color={inv.status === 'PAID' ? 'inherit' : 'success'}
                        onClick={() => handleToggleInvoicePaid(inv)}
                        sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                      >
                        {inv.status === 'PAID' ? 'Mark Unpaid' : 'Mark as Paid'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Modal for adjusting plan & payment */}
      <Dialog open={openPlanModal} onClose={() => setOpenPlanModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Adjust Subscription: {selectedOrg?.name}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Subscription Tier</InputLabel>
            <Select value={newPlan} label="Subscription Tier" onChange={(e) => setNewPlan(e.target.value as OrgPlanTier)}>
              <MenuItem value="STARTER">Starter ($49/mo - 50 Faces, 2 Devices)</MenuItem>
              <MenuItem value="GROWTH">Growth ($129/mo - 250 Faces, 6 Devices)</MenuItem>
              <MenuItem value="ENTERPRISE">Enterprise ($299/mo - 1000 Faces, 25 Devices)</MenuItem>
              <MenuItem value="UNLIMITED">Unlimited ($599/mo - 10k Faces, 100 Devices)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Billing Cycle</InputLabel>
            <Select value={newCycle} label="Billing Cycle" onChange={(e) => setNewCycle(e.target.value as 'MONTHLY' | 'ANNUAL')}>
              <MenuItem value="MONTHLY">Monthly Billing</MenuItem>
              <MenuItem value="ANNUAL">Annual Billing (20% Savings)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Payment Status</InputLabel>
            <Select value={newStatus} label="Payment Status" onChange={(e) => setNewStatus(e.target.value as PaymentStatus)}>
              <MenuItem value="PAID">PAID (Active Access)</MenuItem>
              <MenuItem value="PENDING">PENDING (Grace Period)</MenuItem>
              <MenuItem value="OVERDUE">OVERDUE (Suspended Access)</MenuItem>
              <MenuItem value="GRACE_PERIOD">GRACE_PERIOD</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenPlanModal(false)} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSavePlan} sx={{ fontWeight: 600 }}>
            Apply Subscription Updates
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
