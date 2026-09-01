'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Chip,
  Alert,
} from '@mui/material';
import { X, Ticket, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';
import { TicketCategory, TicketPriority, Organization, KioskDevice } from '@/types';

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
  defaultOrgId?: string;
  isClientMode?: boolean;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  open,
  onClose,
  defaultOrgId,
  isClientMode = false,
}) => {
  const { organizations, kiosks, addSupportTicket } = useAdminData();

  const [orgId, setOrgId] = useState(defaultOrgId || organizations[0]?.orgId || 'ORG-BRAN-001');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Hardware Kiosk & Terminal');
  const [priority, setPriority] = useState<TicketPriority>('HIGH');
  const [slaHours, setSlaHours] = useState(2);
  const [relatedDeviceId, setRelatedDeviceId] = useState('');
  const [assignedTo, setAssignedTo] = useState('Vikram Mehta (Visagel L2 Support)');
  const [creatorName, setCreatorName] = useState(isClientMode ? 'Branzept Operations' : 'Visagel Support Desk');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync orgId if defaultOrgId changes
  React.useEffect(() => {
    if (defaultOrgId) {
      setOrgId(defaultOrgId);
    }
  }, [defaultOrgId]);

  const selectedOrg = organizations.find((o: Organization) => o.orgId === orgId) || organizations[0];
  const orgKiosks = kiosks.filter((k: KioskDevice) => k.orgId === orgId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addSupportTicket({
        orgId: selectedOrg.orgId,
        orgName: selectedOrg.name,
        title,
        description,
        category,
        priority,
        status: 'OPEN',
        slaHours: Number(slaHours),
        createdBy: creatorName,
        createdByRole: isClientMode ? 'CLIENT_ADMIN' : 'VISAGEL_ADMIN',
        assignedTo,
        relatedDeviceId: relatedDeviceId || undefined,
        isAutoFlagged: false,
        initialMessage: description,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setRelatedDeviceId('');
      onClose();
    } catch (err) {
      console.error('Failed to create ticket', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: '#FFF7ED',
                color: '#FF6900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #FED7AA',
              }}
            >
              <Ticket size={20} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {isClientMode ? 'Raise Support Request' : 'Create Operational Support Ticket'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {isClientMode
                  ? 'Submit hardware, vector synchronization, or biometric roster issues to Visagel engineering.'
                  : 'Manually dispatch an operational incident on behalf of a tenant organization.'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {priority === 'CRITICAL_URGENT' && (
            <Alert severity="warning" icon={<AlertTriangle size={18} />} sx={{ fontWeight: 600 }}>
              Critical severity triggers automated PagerDuty/Slack operational alerts and mandates a 1-hour response SLA.
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Target Organization */}
            <Grid size={{ xs: 12, sm: isClientMode ? 12 : 6 }}>
              <FormControl fullWidth size="small" disabled={isClientMode}>
                <InputLabel>Client Organization</InputLabel>
                <Select
                  value={orgId}
                  label="Client Organization"
                  onChange={(e) => {
                    setOrgId(e.target.value);
                    setRelatedDeviceId('');
                  }}
                >
                  {organizations.map((org: Organization) => (
                    <MenuItem key={org.orgId} value={org.orgId}>
                      {org.name} ({org.orgId})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Created By Name */}
            {!isClientMode && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Logged By (Admin / Agent Name)"
                  fullWidth
                  size="small"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="e.g. Vikram Mehta (Support Desk)"
                  required
                />
              </Grid>
            )}

            {/* Ticket Subject / Title */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Ticket Title / Summary"
                fullWidth
                size="small"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Floor 3 Attendance Kiosk Offline Socket Ping Loss"
                required
              />
            </Grid>

            {/* Category */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                >
                  <MenuItem value="Hardware Kiosk & Terminal">Hardware Kiosk & Terminal</MenuItem>
                  <MenuItem value="Biometrics & AI Vector Sync">Biometrics & AI Vector Sync</MenuItem>
                  <MenuItem value="Subscription & Quota Plan">Subscription & Quota Plan</MenuItem>
                  <MenuItem value="Employee Roster & Shifts">Employee Roster & Shifts</MenuItem>
                  <MenuItem value="Network & API Integration">Network & API Integration</MenuItem>
                  <MenuItem value="General IT Support">General IT Support</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Priority */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority Level</InputLabel>
                <Select
                  value={priority}
                  label="Priority Level"
                  onChange={(e) => {
                    const p = e.target.value as TicketPriority;
                    setPriority(p);
                    if (p === 'CRITICAL_URGENT') setSlaHours(1);
                    else if (p === 'HIGH') setSlaHours(4);
                    else if (p === 'MEDIUM') setSlaHours(8);
                    else setSlaHours(24);
                  }}
                >
                  <MenuItem value="LOW">Low (24h SLA)</MenuItem>
                  <MenuItem value="MEDIUM">Medium (8h SLA)</MenuItem>
                  <MenuItem value="HIGH">High (4h SLA)</MenuItem>
                  <MenuItem value="CRITICAL_URGENT">Critical Urgent (1h SLA)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Target SLA Hours */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Target Response SLA (Hours)"
                type="number"
                fullWidth
                size="small"
                value={slaHours}
                onChange={(e) => setSlaHours(Number(e.target.value))}
                slotProps={{
                  htmlInput: { min: 1, max: 72 },
                }}
                disabled={isClientMode}
              />
            </Grid>

            {/* Associated Kiosk Terminal (Optional) */}
            <Grid size={{ xs: 12, sm: isClientMode ? 12 : 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Associated Kiosk Terminal (Optional)</InputLabel>
                <Select
                  value={relatedDeviceId}
                  label="Associated Kiosk Terminal (Optional)"
                  onChange={(e) => setRelatedDeviceId(e.target.value)}
                >
                  <MenuItem value="">None / General Issue</MenuItem>
                  {orgKiosks.map((k: KioskDevice) => (
                    <MenuItem key={k.deviceId} value={k.deviceId}>
                      {k.name} ({k.deviceId} - {k.location})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Assignee */}
            {!isClientMode && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Assigned Engineer</InputLabel>
                  <Select
                    value={assignedTo}
                    label="Assigned Engineer"
                    onChange={(e) => setAssignedTo(e.target.value)}
                  >
                    <MenuItem value="Vikram Mehta (Visagel L2 Support)">Vikram Mehta (Visagel L2 Support)</MenuItem>
                    <MenuItem value="Ananya Sharma (Visagel Support)">Ananya Sharma (Visagel Support)</MenuItem>
                    <MenuItem value="Super Admin Team (Escalation)">Super Admin Team (Escalation)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Detailed Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Detailed Description / Steps to Reproduce"
                multiline
                rows={4}
                fullWidth
                size="small"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about the issue, employee IDs affected, error messages observed on kiosk terminal screen..."
                required
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, px: 3, bgcolor: '#FAFAFA' }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || !title || !description}>
            {isSubmitting ? 'Creating Ticket...' : isClientMode ? 'Submit Request' : 'Dispatch Ticket'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
