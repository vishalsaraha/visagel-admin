export type OrgPlanTier = 'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'UNLIMITED';

export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'GRACE_PERIOD' | 'CANCELLED';

export type BillingCycle = 'MONTHLY' | 'ANNUAL' | 'LIFETIME';

export type AdminRole = 'SUPER_ADMIN' | 'HR_MANAGER' | 'HR_STAFF';

export interface OrgAdmin {
  id: string;
  name: string;
  loginId: string; // e.g. 'acme_admin' or 'hr_john'
  password: string;
  role: AdminRole;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface PlanConfig {
  tier: OrgPlanTier;
  name: string;
  pricePerMonth: number;
  maxEmployees: number;
  maxDevices: number;
  cloudSync: boolean;
  dailyReports: boolean;
  prioritySupport: boolean;
  customFieldsAllowed: boolean;
}

export interface Organization {
  id: string; // internal UUID or doc id
  orgId: string; // human credential ID like 'ORG-VIS-9821'
  name: string;
  slug: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  logoUrl?: string;
  secretApiKey: string;
  clientAppLoginUrl: string; // e.g. visagel://login?org=ORG-VIS-9821
  webPortalUrl: string;
  plan: OrgPlanTier;
  paymentStatus: PaymentStatus;
  billingCycle: BillingCycle;
  planPrice: number;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  lastPaymentDate?: string;
  nextBillingDate: string;
  deviceQuota: number;
  activeDeviceCount: number;
  employeeQuota: number;
  enrolledEmployeeCount: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'EXPIRED';
  notes?: string;
  createdAt: string;
  admins: OrgAdmin[];
}

export interface PunchRecord {
  id: string;
  type: 'IN' | 'OUT';
  time: string;
  timestamp: number;
}

export interface EmployeeAttendance {
  id: string;
  orgId: string;
  orgName: string;
  employeeId: string;
  name: string;
  department?: string;
  date: string;
  punches: PunchRecord[];
  totalWorkingHours?: string;
  status: 'PRESENT' | 'LATE' | 'HALF_DAY';
}

export interface EnrolledEmployee {
  id: string;
  orgId: string;
  orgName: string;
  employeeId: string;
  name: string;
  department: string;
  phone: string;
  joiningDate: string;
  photoUri: string | null;
  customData?: Record<string, string>;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ShiftEntry {
  id: string;
  orgId: string;
  name: string;
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
  lateCutoffHour: number;
  lateCutoffMin: number;
  isActive: boolean;
}

export interface PaymentInvoice {
  id: string;
  invoiceNumber: string;
  orgId: string;
  orgName: string;
  amount: number;
  currency: string;
  paymentDate: string;
  dueDate: string;
  status: PaymentStatus;
  billingCycle: BillingCycle;
  planTier: OrgPlanTier;
  paymentMethod: 'Credit Card' | 'Wire Transfer' | 'UPI' | 'PayPal' | 'Invoice';
  transactionRef?: string;
}

export interface DashboardStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalEnrolledEmployees: number;
  totalPunchesToday: number;
  totalRevenueMonthly: number;
  pendingPaymentsCount: number;
  overduePaymentsCount: number;
}
