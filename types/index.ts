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

export type DbIsolationMode = 'SHARED_INDEXED' | 'DEDICATED_SCHEMA' | 'ISOLATED_CLUSTER';

export interface TenantDatabaseConfig {
  isolationMode: DbIsolationMode;
  clusterEndpoint?: string;
  databaseName: string;
  customConnectionString?: string; // Optional custom MongoDB URI (e.g. mongodb+srv://...)
  collectionPrefix?: string;
  vectorIndexName: string;
  backupS3Bucket?: string;
  readOnlyReplicaUri?: string;
  maxPoolSize?: number;
  sslEnabled?: boolean;
  status?: 'CONNECTED' | 'DISCONNECTED' | 'PROVISIONING';
  lastPingLatencyMs?: number;
  totalStorageBytes?: number;
}

export interface OrgApiKey {
  id: string;
  name: string; // e.g. "Primary Attendance Mobile Gateway", "HR ERP Webhook"
  keyPrefix: string; // e.g. "vg_live_89fa..."
  fullKeySecret?: string;
  scope: 'READ_ONLY' | 'READ_WRITE' | 'ADMIN_FULL' | 'KIOSK_STREAM';
  rateLimitPerMin: number;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  totalCalls24h?: number;
}

export interface OrgApiEndpoint {
  id: string;
  route: string; // e.g. "/api/v2/punch/verify"
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  customTargetUrl?: string; // If tenant routes punch webhook directly to their ERP
  rateLimit: number;
  isEnabled: boolean;
  avgLatencyMs: number;
  successRate: string;
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
  databaseConfig?: TenantDatabaseConfig;
  apiKeys?: OrgApiKey[];
  customEndpoints?: OrgApiEndpoint[];
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

export interface KioskDevice {
  id: string;
  deviceId: string; // e.g. 'KSK-BRAN-01'
  name: string; // e.g. 'Main Gate iPad Air 5'
  orgId: string;
  orgName: string;
  location: string;
  deviceType: 'iPad' | 'Android Tablet' | 'Dedicated Terminal';
  ipAddress: string;
  status: 'ONLINE' | 'OFFLINE' | 'SYNCING';
  lastHeartbeat: string;
  faceEngineVersion: string;
  activeFaceModelCount: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  details: string;
  targetOrgId?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface DashboardStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalEnrolledEmployees: number;
  totalPunchesToday: number;
  totalRevenueMonthly: number;
  pendingPaymentsCount: number;
  overduePaymentsCount: number;
  activeKiosksCount?: number;
}

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL_URGENT';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'AWAITING_CLIENT_RESPONSE' | 'RESOLVED' | 'CLOSED';

export type TicketCategory =
  | 'Hardware Kiosk & Terminal'
  | 'Biometrics & AI Vector Sync'
  | 'Subscription & Quota Plan'
  | 'Employee Roster & Shifts'
  | 'Network & API Integration'
  | 'General IT Support';

export interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: 'VISAGEL_ADMIN' | 'CLIENT_ADMIN' | 'SYSTEM_BOT';
  senderOrgName: string;
  message: string;
  timestamp: string;
  isInternalNote: boolean;
  attachments?: string[];
}

export interface SupportTicket {
  id: string; // e.g. TCK-2026-0812
  ticketNumber: string;
  orgId: string;
  orgName: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  slaHours: number;
  slaStatus: 'WITHIN_SLA' | 'AT_RISK' | 'BREACHED';
  createdBy: string;
  createdByRole: string;
  assignedTo: string;
  relatedDeviceId?: string;
  isAutoFlagged?: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  messages: TicketMessage[];
}

