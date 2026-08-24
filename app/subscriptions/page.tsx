'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';
import { SubscriptionTable } from '@/components/subscriptions/SubscriptionTable';

export default function SubscriptionsPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Plans, Quotas & Subscription Payments
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Real-time payment status tracking, billing cycle administration, invoice logging, and device quota limits for all organizations.
        </Typography>
      </Box>

      <SubscriptionTable />
    </Box>
  );
}
