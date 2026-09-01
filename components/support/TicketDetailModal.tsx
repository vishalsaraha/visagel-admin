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
  IconButton,
  Chip,
  Divider,
  Avatar,
  Paper,
  Tabs,
  Tab,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  X,
  Send,
  Lock,
  MessageSquare,
  Clock,
  User,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Smartphone,
  Tag,
} from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';
import { SupportTicket, TicketStatus } from '@/types';

interface TicketDetailModalProps {
  ticket: SupportTicket | null;
  open: boolean;
  onClose: () => void;
  isClientMode?: boolean;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  open,
  onClose,
  isClientMode = false,
}) => {
  const { updateTicketStatus, addTicketMessage } = useAdminData();
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!ticket) return null;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSending(true);
    try {
      await addTicketMessage(ticket.id, {
        senderName: isClientMode ? 'Branzept Operations' : 'Vikram Mehta',
        senderRole: isClientMode ? 'CLIENT_ADMIN' : 'VISAGEL_ADMIN',
        senderOrgName: isClientMode ? ticket.orgName : 'Visagel Support Desk',
        message: replyText,
        isInternalNote: isClientMode ? false : isInternalNote,
      });
      setReplyText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    await updateTicketStatus(ticket.id, newStatus);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL_URGENT':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FCA5A5' };
      case 'HIGH':
        return { bg: '#FFF7ED', text: '#EA580C', border: '#FDBA74' };
      case 'MEDIUM':
        return { bg: '#FEFCE8', text: '#CA8A04', border: '#FDE047' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { bg: '#EFF6FF', text: '#2563EB' };
      case 'IN_PROGRESS':
        return { bg: '#FFF7ED', text: '#EA580C' };
      case 'AWAITING_CLIENT_RESPONSE':
        return { bg: '#FEFCE8', text: '#CA8A04' };
      case 'RESOLVED':
        return { bg: '#F0FDF4', text: '#16A34A' };
      case 'CLOSED':
        return { bg: '#F8FAFC', text: '#64748B' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const pColor = getPriorityColor(ticket.priority);
  const sColor = getStatusColor(ticket.status);

  // Filter messages: Client mode should NOT see internal notes
  const visibleMessages = ticket.messages.filter((m) => (isClientMode ? !m.isInternalNote : true));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ p: 2.5, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, pr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#FF6900', bgcolor: '#FFF7ED', px: 1, py: 0.2, borderRadius: 1, border: '1px solid #FED7AA' }}>
              {ticket.ticketNumber}
            </Typography>
            <Chip
              label={ticket.priority.replace('_', ' ')}
              size="small"
              sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20, bgcolor: pColor.bg, color: pColor.text, border: `1px solid ${pColor.border}` }}
            />
            <Chip
              label={ticket.status.replace(/_/g, ' ')}
              size="small"
              sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20, bgcolor: sColor.bg, color: sColor.text }}
            />
            {ticket.isAutoFlagged && (
              <Chip
                icon={<AlertTriangle size={12} />}
                label="AUTO-FLAGGED TELEMETRY"
                size="small"
                sx={{ fontWeight: 800, fontSize: '0.62rem', height: 20, bgcolor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
              />
            )}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
            {ticket.title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, bgcolor: '#F8FAFC' }}>
        {/* Metadata Banner */}
        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Building2 size={12} /> Client Org
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {ticket.orgName}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Tag size={12} /> Category
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {ticket.category}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Clock size={12} /> Target SLA
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#16A34A' }}>
                {ticket.slaHours}h Response Window ({ticket.slaStatus})
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Smartphone size={12} /> Device Node
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {ticket.relatedDeviceId || 'N/A (Cloud/Roster)'}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* State Transition Action Bar (for Visagel Admin) */}
        {!isClientMode && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Update Ticket Lifecycle State:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {ticket.status !== 'IN_PROGRESS' && (
                <Button size="small" variant="outlined" onClick={() => handleStatusChange('IN_PROGRESS')} sx={{ fontSize: '0.75rem', textTransform: 'none' }}>
                  Mark In Progress
                </Button>
              )}
              {ticket.status !== 'AWAITING_CLIENT_RESPONSE' && (
                <Button size="small" variant="outlined" color="warning" onClick={() => handleStatusChange('AWAITING_CLIENT_RESPONSE')} sx={{ fontSize: '0.75rem', textTransform: 'none' }}>
                  Awaiting Client
                </Button>
              )}
              {ticket.status !== 'RESOLVED' && (
                <Button size="small" variant="contained" color="success" onClick={() => handleStatusChange('RESOLVED')} sx={{ fontSize: '0.75rem', textTransform: 'none' }}>
                  Resolve Ticket
                </Button>
              )}
              {ticket.status === 'RESOLVED' && (
                <Button size="small" variant="outlined" color="inherit" onClick={() => handleStatusChange('CLOSED')} sx={{ fontSize: '0.75rem', textTransform: 'none' }}>
                  Close Ticket
                </Button>
              )}
            </Box>
          </Box>
        )}

        {/* Threaded Discussion Messages */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MessageSquare size={16} /> Threaded Communication History ({visibleMessages.length})
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 380, overflowY: 'auto', pr: 0.5 }}>
            {visibleMessages.map((msg) => (
              <Paper
                key={msg.id}
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: msg.isInternalNote ? '#FFFBEB' : msg.senderRole === 'VISAGEL_ADMIN' ? '#FFFFFF' : '#F0FDF4',
                  borderColor: msg.isInternalNote ? '#FDE68A' : msg.senderRole === 'VISAGEL_ADMIN' ? '#E2E8F0' : '#BBF7D0',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        fontSize: '0.7rem',
                        bgcolor: msg.isInternalNote ? '#D97706' : msg.senderRole === 'VISAGEL_ADMIN' ? '#2563EB' : '#16A34A',
                      }}
                    >
                      {msg.senderName.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {msg.senderName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      ({msg.senderOrgName})
                    </Typography>
                    {msg.isInternalNote && (
                      <Chip
                        icon={<Lock size={10} />}
                        label="INTERNAL STAFF NOTE (Visagel Only)"
                        size="small"
                        sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: '#FEF3C7', color: '#B45309' }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {new Date(msg.timestamp).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: msg.isInternalNote ? '#92400E' : 'text.primary', pl: 4 }}>
                  {msg.message}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Reply Box */}
        {ticket.status !== 'CLOSED' && (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 2 }}>
            <form onSubmit={handleSendReply}>
              {!isClientMode && (
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <Button
                    size="small"
                    variant={!isInternalNote ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => setIsInternalNote(false)}
                    sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    Public Reply to Client
                  </Button>
                  <Button
                    size="small"
                    variant={isInternalNote ? 'contained' : 'outlined'}
                    color="warning"
                    startIcon={<Lock size={12} />}
                    onClick={() => setIsInternalNote(true)}
                    sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    Internal Staff Note
                  </Button>
                </Box>
              )}

              <TextField
                multiline
                rows={3}
                fullWidth
                size="small"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  isInternalNote
                    ? 'Write an internal note for Visagel engineers only (hidden from client)...'
                    : isClientMode
                    ? 'Send a follow-up reply to Visagel support engineers...'
                    : 'Write a public response to the client organization...'
                }
                sx={{
                  bgcolor: isInternalNote ? '#FFFBEB' : '#FFFFFF',
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {isInternalNote ? '🔒 Only Visagel team will see this comment.' : '📨 Email & in-portal notifications will be dispatched.'}
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  color={isInternalNote ? 'warning' : 'primary'}
                  disabled={isSending || !replyText.trim()}
                  startIcon={<Send size={14} />}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem' }}
                >
                  {isSending ? 'Sending...' : isInternalNote ? 'Save Internal Note' : 'Send Reply'}
                </Button>
              </Box>
            </form>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3, bgcolor: '#FAFAFA' }}>
        <Button onClick={onClose} variant="contained">
          Close Ticket View
        </Button>
      </DialogActions>
    </Dialog>
  );
};
