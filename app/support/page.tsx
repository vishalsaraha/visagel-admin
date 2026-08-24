'use client';
import React, { useState } from 'react';
import { useAdminData } from '@/context/AdminDataContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  HelpCircle,
  ChevronDown,
  Mail,
  Phone,
  MessageSquare,
  LifeBuoy,
  FileText,
  Smartphone,
  Shield,
  CheckCircle,
  ExternalLink,
  Send,
  Building2,
  Video,
} from 'lucide-react';

export default function SupportPage() {
  const { organizations } = useAdminData();
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Face Recognition Kiosk');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTicketSubject('');
    setTicketMessage('');
  };

  const faqs = [
    {
      q: 'How do employees enrol their face for biometric clock-ins?',
      a: 'Employees can register in two ways: 1) Directly standing in front of any Branzept Visagel iPad/Android kiosk in enrol mode, or 2) Via the mobile self-service link sent to their phone where they take a selfie to create their 3D vector model.',
    },
    {
      q: 'What happens when an employee forgets to clock in or out?',
      a: 'Super Admins and HR Managers can navigate to the Employee Directory or App Data Hub and click "Punch" next to the employee record to log a manual verified entry.',
    },
    {
      q: 'How are tenant subscriptions renewed or upgraded?',
      a: 'Under the "Plans & Payments" section, select "Adjust Plan" on any organization to switch between Starter, Growth, Enterprise, or Unlimited, with instant quota allocation for faces and terminals.',
    },
    {
      q: 'What should we do if an iPad terminal shows "Sync Offline"?',
      a: 'The terminal stores up to 10,000 punches locally in encrypted SQLite storage and will automatically push all queued attendance events as soon as internet connectivity is restored.',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Top Banner */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Branzept Help & Support Desk
            </Typography>
            <Chip
              label="24/7 Enterprise Assistance"
              size="small"
              sx={{ bgcolor: '#FFF7ED', color: '#FF6900', fontWeight: 600, border: '1px solid #FED7AA' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Dedicated technical support, hardware kiosk guides, ticket submission, and HR assistance for all employees & clients.
          </Typography>
        </Box>
      </Box>

      {/* 3 Contact Support Channels */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 2,
        }}
      >
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#FFF7ED', color: '#FF6900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={20} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Email Support
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  support@branzept.com
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
              Response within 2 hours for high-priority terminal alerts and subscription requests.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Emergency Helpline
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  +91 98765 43210 (Toll Free)
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
              Direct hotline to Branzept operations engineers for urgent kiosk hardware diagnostics.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LifeBuoy size={20} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Live Diagnostics
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  AI Gateway v2.4 Status
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
              All 4 kiosk terminals at Branzept HQ active with 99.98% facial recognition confidence.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Client / Org Admin Directory */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Client Directory & Contact
            </Typography>
            <Chip label={`${organizations.length} Clients`} size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600 }} />
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
            Connect with Organization Admins directly via Email, Phone, or Video Call.
          </Typography>

          <Grid container spacing={2}>
            {organizations.flatMap((org) => 
              org.admins.map((admin) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={admin.id}>
                  <Box sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#F8FAFC' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {admin.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Building2 size={12} /> {org.name}
                        </Typography>
                      </Box>
                      <Chip label={admin.role === 'SUPER_ADMIN' ? 'Admin' : 'HR'} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Send Email">
                        <IconButton size="small" sx={{ bgcolor: '#FFF7ED', color: '#FF6900', '&:hover': { bgcolor: '#FED7AA' } }} onClick={() => window.location.href = `mailto:${admin.email}`}>
                          <Mail size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Call">
                        <IconButton size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', '&:hover': { bgcolor: '#BFDBFE' } }} onClick={() => window.location.href = `tel:${admin.phone}`}>
                          <Phone size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="WhatsApp / Chat">
                        <IconButton size="small" sx={{ bgcolor: '#F0FDF4', color: '#16A34A', '&:hover': { bgcolor: '#BBF7D0' } }}>
                          <MessageSquare size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Start Video Call">
                        <IconButton size="small" sx={{ bgcolor: '#F3F4F6', color: '#4B5563', '&:hover': { bgcolor: '#E5E7EB' } }}>
                          <Video size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Grid>
              ))
            ).slice(0, 6)}
          </Grid>
        </CardContent>
      </Card>

      {/* Main Grid: Ticket Form & Knowledge Base */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1.8fr' },
          gap: 2.5,
        }}
      >
        {/* Ticket Submission */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              Submit Support Ticket
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              Have an issue with biometric face syncing, employees roster, or hardware?
            </Typography>

            <form onSubmit={handleSubmitTicket}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Subject / Issue Title"
                  required
                  size="small"
                  fullWidth
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. New iPad kiosk terminal connection error"
                />

                <TextField
                  label="Category / Department"
                  size="small"
                  fullWidth
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                />

                <TextField
                  label="Detailed Message / Error Description"
                  required
                  multiline
                  rows={4}
                  size="small"
                  fullWidth
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Please describe the steps or attach error codes..."
                />

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Send size={16} />}
                  sx={{ mt: 1 }}
                >
                  Send Support Request
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              Frequently Asked Questions (FAQ)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              Quick answers to common questions about employee management and kiosk workflows
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {faqs.map((faq, idx) => (
                <Accordion key={idx} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '6px !important', '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {faq.q}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                      {faq.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={submitted}
        autoHideDuration={4000}
        onClose={() => setSubmitted(false)}
      >
        <Alert severity="success" variant="filled">
          Ticket submitted successfully! A Branzept engineer will reach out shortly.
        </Alert>
      </Snackbar>
    </Box>
  );
}
