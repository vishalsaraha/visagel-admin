'use client';
import React from 'react';
import { Chip } from '@mui/material';
import { OrgPlanTier, PaymentStatus } from '@/types';

export const PlanBadge: React.FC<{ plan: OrgPlanTier }> = ({ plan }) => {
  const getPlanColor = () => {
    switch (plan) {
      case 'STARTER':
        return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
      case 'GROWTH':
        return { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' };
      case 'ENTERPRISE':
        return { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' };
      case 'UNLIMITED':
        return { bg: '#FFF7ED', color: '#C2410C', border: '#FFEDD5' };
      default:
        return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
    }
  };

  const style = getPlanColor();

  return (
    <Chip
      label={plan}
      size="small"
      sx={{
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontWeight: 600,
        fontSize: '0.7rem',
        height: 22,
        borderRadius: 1,
      }}
    />
  );
};

export const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'PAID':
        return { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', label: 'PAID' };
      case 'PENDING':
        return { bg: '#FEFCE8', color: '#CA8A04', border: '#FEF08A', label: 'PENDING' };
      case 'OVERDUE':
        return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: 'OVERDUE' };
      case 'GRACE_PERIOD':
        return { bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA', label: 'GRACE PERIOD' };
      default:
        return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0', label: status };
    }
  };

  const style = getStatusStyle();

  return (
    <Chip
      label={style.label}
      size="small"
      sx={{
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontWeight: 600,
        fontSize: '0.7rem',
        height: 22,
        borderRadius: 1,
      }}
    />
  );
};
