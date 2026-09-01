'use client';
import React, { use, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Building2,
  ArrowLeft,
  KeyRound,
  Users,
  CreditCard,
  Shield,
  Edit,
  Trash2,
  ExternalLink,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAdminData } from '@/context/AdminDataContext';
import { OrgCredentialsCard } from '@/components/organizations/OrgCredentialsCard';
import { OrgAdminList } from '@/components/organizations/OrgAdminList';
import { TenantDatabaseIsolationCard } from '@/components/organizations/TenantDatabaseIsolationCard';
import { OrgApiGatewayCard } from '@/components/organizations/OrgApiGatewayCard';
import { PlanBadge, PaymentStatusBadge } from '@/components/organizations/PlanStatusBadge';
import { OrgPlanTier, PaymentStatus, BillingCycle } from '@/types';

export default function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { getOrganizationById, updateOrganization, deleteOrganization } = useAdminData();

  const organization = getOrganizationById(resolvedParams.id);

  // Edit Org modal
  const [editModal, setEditModal] = useState(false);
  const [name, setName] = useState(organization?.name || '');
  const [contactPerson, setContactPerson] = useState(organization?.contactPerson || '');
  const [contactEmail, setContactEmail] = useState(organization?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(organization?.contactPhone || '');
  const [address, setAddress] = useState(organization?.address || '');
  const [plan, setPlan] = useState<OrgPlanTier>(organization?.plan || 'GROWTH');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(organization?.paymentStatus || 'PAID');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(organization?.billingCycle || 'MONTHLY');
  const [notes, setNotes] = useState(organization?.notes || '');

  if (!organization) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Organization Not Found
        </Typography>
        <Button variant="contained" onClick={() => router.push('/organizations')}>
          Return to Organizations
        </Button>
      </Box>
    );
  }

  const handleOpenEdit = () => {
    setName(organization.name);
    setContactPerson(organization.contactPerson);
    setContactEmail(organization.contactEmail);
    setContactPhone(organization.contactPhone);
    setAddress(organization.address || '');
    setPlan(organization.plan);
    setPaymentStatus(organization.paymentStatus);
    setBillingCycle(organization.billingCycle);
    setNotes(organization.notes || '');
    setEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateOrganization(organization.id, {
      name,
      contactPerson,
      contactEmail,
      contactPhone,
      address,
      plan,
      paymentStatus,
      billingCycle,
      notes,
    });
    setEditModal(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Back button & Breadcrumb Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => router.push('/organizations')}
            sx={{ bgcolor: 'action.hover' }}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {organization.name}
              </Typography>
              <Chip
                label={organization.orgId}
                color="primary"
                sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.85rem' }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Tenant Profile & Full App Control Hub
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Edit size={16} />}
            onClick={handleOpenEdit}
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            Edit Company Details
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              const fullBundle = `=== VISAGEL CLIENT CREDENTIALS ===\nOrg ID: ${organization.orgId}\nMobile URL: ${organization.clientAppLoginUrl}\nWeb Portal: ${organization.webPortalUrl}\nPrimary Admin: ${organization.admins[0]?.loginId || 'admin'}\nPass: ${organization.admins[0]?.password || '***'}\n===================================`;
              navigator.clipboard.writeText(fullBundle);
              alert('Copied complete organization credential pack!');
            }}
            sx={{ fontWeight: 600 }}
          >
            Copy App Login Pack
          </Button>
        </Box>
      </Box>

      {/* Primary Credentials & Deep Link Generator Card */}
      <OrgCredentialsCard organization={organization} />

      {/* Overview Stats & Subscription Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 2.5,
        }}
      >
        {/* Subscription Card */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
              Current Plan & Tier
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 1.5 }}>
              <PlanBadge plan={organization.plan} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                ${organization.planPrice} / {organization.billingCycle === 'ANNUAL' ? 'yr' : 'mo'}
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Billing Cycle: <strong>{organization.billingCycle}</strong>
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Next Billing Date: <strong>{organization.nextBillingDate}</strong>
            </Typography>
          </CardContent>
        </Card>

        {/* Payment Status Card */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
              Payment & Terminal Access
            </Typography>
            <Box sx={{ my: 1.5 }}>
              <PaymentStatusBadge status={organization.paymentStatus} />
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Tenant Operational Status: <strong>{organization.status}</strong>
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Last Payment: <strong>{organization.lastPaymentDate || 'N/A'}</strong>
            </Typography>
          </CardContent>
        </Card>

        {/* Capacity Quota Card */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
              Biometric & Device Quota
            </Typography>
            <Box sx={{ my: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {organization.enrolledEmployeeCount} / {organization.employeeQuota} Faces
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {organization.activeDeviceCount} / {organization.deviceQuota} Active Terminals
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Cloud Sync: <strong>Enabled & Synchronized</strong>
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Multi-Tenant Database Storage & Isolation Architecture */}
      <TenantDatabaseIsolationCard organization={organization} />

      {/* Organization Scoped API Gateway & Rate Limit Tracking */}
      <OrgApiGatewayCard organization={organization} />

      {/* Internal Organization Admins / HR Accounts Manager */}
      <OrgAdminList orgId={organization.id} admins={organization.admins} />

      {/* Edit Organization Modal */}
      <Dialog open={editModal} onClose={() => setEditModal(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSaveEdit}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            Edit Organization Details: {organization.name}
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            <TextField
              label="Company Name"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <TextField
                label="Contact Person"
                fullWidth
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
              <TextField
                label="Contact Email"
                required
                type="email"
                fullWidth
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
              <TextField
                label="Phone Number"
                fullWidth
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </Box>
            <TextField
              label="Office Location Address"
              fullWidth
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Subscription Tier</InputLabel>
                <Select value={plan} label="Subscription Tier" onChange={(e) => setPlan(e.target.value as OrgPlanTier)}>
                  <MenuItem value="STARTER">Starter</MenuItem>
                  <MenuItem value="GROWTH">Growth</MenuItem>
                  <MenuItem value="ENTERPRISE">Enterprise</MenuItem>
                  <MenuItem value="UNLIMITED">Unlimited</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Billing Cycle</InputLabel>
                <Select value={billingCycle} label="Billing Cycle" onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}>
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                  <MenuItem value="ANNUAL">Annual</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select value={paymentStatus} label="Payment Status" onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}>
                  <MenuItem value="PAID">PAID</MenuItem>
                  <MenuItem value="PENDING">PENDING</MenuItem>
                  <MenuItem value="OVERDUE">OVERDUE</MenuItem>
                  <MenuItem value="GRACE_PERIOD">GRACE_PERIOD</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Internal Notes / Terminal Instructions"
              multiline
              rows={3}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditModal(false)} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ fontWeight: 600 }}>
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
