'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  InputAdornment,
} from '@mui/material';
import { Building2, Shield, User, Mail, Phone, MapPin, Key } from 'lucide-react';
import { OrgPlanTier, PaymentStatus, BillingCycle } from '@/types';
import { useAdminData } from '@/context/AdminDataContext';

interface OrgModalProps {
  open: boolean;
  onClose: () => void;
}

export const OrgModal: React.FC<OrgModalProps> = ({ open, onClose }) => {
  const { addOrganization, plans } = useAdminData();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [orgId, setOrgId] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [plan, setPlan] = useState<OrgPlanTier>('GROWTH');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PAID');
  const [currency, setCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [generateWebsiteLink, setGenerateWebsiteLink] = useState(true);
  const [adminLoginId, setAdminLoginId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-fill org ID when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    const cleanSlug = val.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15);
    setSlug(cleanSlug);
    if (!orgId || orgId.startsWith('ORG-')) {
      const code = val.replace(/[^A-Z]/g, '').slice(0, 4) || val.slice(0, 4).toUpperCase();
      setOrgId(`ORG-${code}-${Math.floor(100 + Math.random() * 900)}`);
    }
    if (!adminLoginId) {
      setAdminLoginId(`${cleanSlug || 'org'}_admin`);
    }
    if (!adminPassword) {
      setAdminPassword(`Pass@${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactEmail || !orgId) return;

    const selectedPlan = plans.find((p) => p.tier === plan) || plans[0];
    const price = billingCycle === 'LIFETIME' ? selectedPlan.pricePerMonth * 12 * 5 : billingCycle === 'ANNUAL' ? selectedPlan.pricePerMonth * 12 * 0.8 : selectedPlan.pricePerMonth;

    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    if (billingCycle === 'LIFETIME') {
      nextYear.setFullYear(nextYear.getFullYear() + 100);
    } else {
      nextYear.setFullYear(nextYear.getFullYear() + (billingCycle === 'ANNUAL' ? 1 : 0));
      if (billingCycle === 'MONTHLY') nextYear.setMonth(nextYear.getMonth() + 1);
    }
    const nextBilling = billingCycle === 'LIFETIME' ? '-' : nextYear.toISOString().split('T')[0];

    await addOrganization({
      orgId,
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      contactPerson: contactPerson || 'Administrator',
      contactEmail,
      contactPhone: contactPhone || '+1 000 000 0000',
      address,
      plan,
      paymentStatus,
      billingCycle,
      planPrice: price,
      subscriptionStartDate: today,
      subscriptionEndDate: nextYear.toISOString().split('T')[0],
      lastPaymentDate: paymentStatus === 'PAID' ? today : undefined,
      nextBillingDate: nextBilling,
      deviceQuota: selectedPlan.maxDevices,
      employeeQuota: selectedPlan.maxEmployees,
      status: paymentStatus === 'OVERDUE' ? 'SUSPENDED' : 'ACTIVE',
      notes,
      initialAdmin: {
        name: contactPerson || `${name} Admin`,
        loginId: adminLoginId || 'admin',
        password: adminPassword || 'admin123',
        role: 'SUPER_ADMIN',
        email: contactEmail,
        phone: contactPhone,
        isActive: true,
      },
    });

    onClose();
    // Reset fields
    setName('');
    setSlug('');
    setOrgId('');
    setContactPerson('');
    setContactEmail('');
    setContactPhone('');
    setAddress('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Building2 size={22} color="#FF6900" />
          Provision New Client Organization & App Credentials
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          {/* Section 1: Company Profile */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              1. Organization Identity
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Company / Organization Name"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Acme Global Logistics"
              />
              <TextField
                label="Slug / Domain"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="acme-global"
              />
              <TextField
                label="Unique Org ID"
                required
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                helperText="Used in client app login"
                placeholder="ORG-ACME-102"
              />
            </Box>
          </Box>

          <Divider />

          {/* Section 2: Contact Information */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              2. Point of Contact & Address
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
              <TextField
                label="Primary Contact Person"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Michael Scott"
              />
              <TextField
                label="Contact Email"
                required
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="admin@acme.com"
              />
              <TextField
                label="Phone Number"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
              />
            </Box>
            <TextField
              label="Office Location / Full Address"
              fullWidth
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Suite 400, Industrial Expressway, City, Country"
            />
          </Box>

          <Divider />

          {/* Section 3: Plan & Subscription */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              3. Subscription Plan & Billing Status
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Subscription Tier</InputLabel>
                <Select value={plan} label="Subscription Tier" onChange={(e) => setPlan(e.target.value as OrgPlanTier)}>
                  <MenuItem value="STARTER">Starter ($49/mo)</MenuItem>
                  <MenuItem value="GROWTH">Growth ($129/mo)</MenuItem>
                  <MenuItem value="ENTERPRISE">Enterprise ($299/mo)</MenuItem>
                  <MenuItem value="UNLIMITED">Unlimited ($599/mo)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Billing Cycle</InputLabel>
                <Select value={billingCycle} label="Billing Cycle" onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}>
                  <MenuItem value="MONTHLY">Monthly Billing</MenuItem>
                  <MenuItem value="ANNUAL">Annual Billing (20% Discount)</MenuItem>
                  <MenuItem value="LIFETIME">One-Time Payment (Lifetime Access)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Initial Payment Status</InputLabel>
                <Select value={paymentStatus} label="Initial Payment Status" onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}>
                  <MenuItem value="PAID">PAID (Active Instant Access)</MenuItem>
                  <MenuItem value="PENDING">PENDING (Trial/Awaiting Invoice)</MenuItem>
                  <MenuItem value="OVERDUE">OVERDUE (Suspended)</MenuItem>
                  <MenuItem value="GRACE_PERIOD">GRACE_PERIOD</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select value={currency} label="Currency" onChange={(e) => setCurrency(e.target.value)}>
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="INR">INR (₹)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select value={paymentMethod} label="Payment Method" onChange={(e) => setPaymentMethod(e.target.value)}>
                  <MenuItem value="CREDIT_CARD">Credit Card (Stripe)</MenuItem>
                  <MenuItem value="WIRE_TRANSFER">Wire Transfer / ACH</MenuItem>
                  <MenuItem value="UPI">UPI / Net Banking</MenuItem>
                  <MenuItem value="PAYPAL">PayPal</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="checkbox"
                id="generateWebsiteLink"
                checked={generateWebsiteLink}
                onChange={(e) => setGenerateWebsiteLink(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#FF6900', cursor: 'pointer' }}
              />
              <label htmlFor="generateWebsiteLink" style={{ fontSize: '0.875rem', cursor: 'pointer', color: '#334155', fontWeight: 500 }}>
                Generate client payment link for our website (check & pay online)
              </label>
            </Box>
          </Box>

          <Divider />

          {/* Section 4: Initial Primary Admin */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              4. Initial Company Admin Credentials
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Admin Login ID"
                required
                value={adminLoginId}
                onChange={(e) => setAdminLoginId(e.target.value)}
                placeholder="acme_admin"
              />
              <TextField
                label="Admin Password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Pass@8829"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, px: 3 }}>
          <Button onClick={onClose} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" sx={{ fontWeight: 700, px: 3 }}>
            Provision & Generate Credentials
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
