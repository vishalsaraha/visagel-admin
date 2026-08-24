'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Organization,
  OrgAdmin,
  PlanConfig,
  EmployeeAttendance,
  EnrolledEmployee,
  ShiftEntry,
  PaymentInvoice,
  DashboardStats,
  OrgPlanTier,
  PaymentStatus,
  KioskDevice,
  AuditLogEntry,
} from '@/types';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_PLANS,
  INITIAL_ATTENDANCE,
  INITIAL_EMPLOYEES,
  INITIAL_SHIFTS,
  INITIAL_INVOICES,
  INITIAL_KIOSKS,
  INITIAL_AUDIT_LOGS,
} from './initialData';

interface AdminDataContextType {
  organizations: Organization[];
  plans: PlanConfig[];
  attendance: EmployeeAttendance[];
  employees: EnrolledEmployee[];
  shifts: ShiftEntry[];
  invoices: PaymentInvoice[];
  kiosks: KioskDevice[];
  auditLogs: AuditLogEntry[];
  stats: DashboardStats;
  
  // Organization operations
  addOrganization: (data: Omit<Organization, 'id' | 'createdAt' | 'admins' | 'secretApiKey' | 'clientAppLoginUrl' | 'webPortalUrl' | 'activeDeviceCount' | 'enrolledEmployeeCount'> & { initialAdmin?: Omit<OrgAdmin, 'id' | 'createdAt'> }) => Promise<Organization>;
  updateOrganization: (id: string, updates: Partial<Organization>) => Promise<boolean>;
  deleteOrganization: (id: string) => Promise<boolean>;
  getOrganizationById: (id: string) => Organization | undefined;
  
  // Nested Admin operations
  addOrgAdmin: (orgId: string, admin: Omit<OrgAdmin, 'id' | 'createdAt'>) => Promise<boolean>;
  updateOrgAdmin: (orgId: string, adminId: string, updates: Partial<OrgAdmin>) => Promise<boolean>;
  deleteOrgAdmin: (orgId: string, adminId: string) => Promise<boolean>;

  // Subscriptions & Payments
  updateOrgSubscription: (orgId: string, planTier: OrgPlanTier, billingCycle: 'MONTHLY' | 'ANNUAL', paymentStatus: PaymentStatus) => Promise<boolean>;
  recordPaymentInvoice: (invoice: Omit<PaymentInvoice, 'id' | 'invoiceNumber'>) => Promise<boolean>;
  updateInvoiceStatus: (invoiceId: string, status: PaymentStatus) => Promise<boolean>;

  // Kiosk Terminal operations
  addKioskDevice: (kiosk: Omit<KioskDevice, 'id'>) => Promise<boolean>;
  deleteKioskDevice: (id: string) => Promise<boolean>;

  // Audit Logs
  addAuditLog: (log: Omit<AuditLogEntry, 'id' | 'timestamp'>) => Promise<boolean>;

  // App Data operations
  addEmployeeRecord: (emp: Omit<EnrolledEmployee, 'id'>) => Promise<boolean>;
  deleteEmployeeRecord: (id: string) => Promise<boolean>;
  addAttendanceRecord: (att: Omit<EmployeeAttendance, 'id'>) => Promise<boolean>;
  resetToMockData: () => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [plans, setPlans] = useState<PlanConfig[]>(INITIAL_PLANS);
  const [attendance, setAttendance] = useState<EmployeeAttendance[]>(INITIAL_ATTENDANCE);
  const [employees, setEmployees] = useState<EnrolledEmployee[]>(INITIAL_EMPLOYEES);
  const [shifts, setShifts] = useState<ShiftEntry[]>(INITIAL_SHIFTS);
  const [invoices, setInvoices] = useState<PaymentInvoice[]>(INITIAL_INVOICES);
  const [kiosks, setKiosks] = useState<KioskDevice[]>(INITIAL_KIOSKS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Load from localStorage on browser mount
  useEffect(() => {
    try {
      const savedOrgs = localStorage.getItem('visagel_admin_orgs');
      if (savedOrgs) setOrganizations(JSON.parse(savedOrgs));

      const savedAtt = localStorage.getItem('visagel_admin_attendance');
      if (savedAtt) setAttendance(JSON.parse(savedAtt));

      const savedEmp = localStorage.getItem('visagel_admin_employees');
      if (savedEmp) setEmployees(JSON.parse(savedEmp));

      const savedInvoices = localStorage.getItem('visagel_admin_invoices');
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));

      const savedKiosks = localStorage.getItem('visagel_admin_kiosks');
      if (savedKiosks) setKiosks(JSON.parse(savedKiosks));
    } catch (e) {
      console.warn('Failed to load local admin cache', e);
    }
  }, []);

  const persistOrgs = (orgs: Organization[]) => {
    setOrganizations(orgs);
    try {
      localStorage.setItem('visagel_admin_orgs', JSON.stringify(orgs));
    } catch (e) {
      console.warn(e);
    }
  };

  const persistInvoices = (invs: PaymentInvoice[]) => {
    setInvoices(invs);
    try {
      localStorage.setItem('visagel_admin_invoices', JSON.stringify(invs));
    } catch (e) {
      console.warn(e);
    }
  };

  const persistKiosks = (ksks: KioskDevice[]) => {
    setKiosks(ksks);
    try {
      localStorage.setItem('visagel_admin_kiosks', JSON.stringify(ksks));
    } catch (e) {
      console.warn(e);
    }
  };

  const persistAttendance = (atts: EmployeeAttendance[]) => {
    setAttendance(atts);
    try {
      localStorage.setItem('visagel_admin_attendance', JSON.stringify(atts));
    } catch (e) {
      console.warn(e);
    }
  };

  const persistEmployees = (emps: EnrolledEmployee[]) => {
    setEmployees(emps);
    try {
      localStorage.setItem('visagel_admin_employees', JSON.stringify(emps));
    } catch (e) {
      console.warn(e);
    }
  };

  const addOrganization = async (
    data: Omit<Organization, 'id' | 'createdAt' | 'admins' | 'secretApiKey' | 'clientAppLoginUrl' | 'webPortalUrl' | 'activeDeviceCount' | 'enrolledEmployeeCount'> & { initialAdmin?: Omit<OrgAdmin, 'id' | 'createdAt'> }
  ): Promise<Organization> => {
    const id = `org-${Date.now()}`;
    const randomHex = Math.random().toString(16).substring(2, 10);
    const secretApiKey = `vg_live_${randomHex}${Date.now().toString(16)}`;
    const clientAppLoginUrl = `visagel://login?org=${encodeURIComponent(data.orgId)}&key=${secretApiKey}`;
    const webPortalUrl = `https://app.visagel.ai/portal/${encodeURIComponent(data.orgId)}`;

    const admins: OrgAdmin[] = [];
    if (data.initialAdmin) {
      admins.push({
        ...data.initialAdmin,
        id: `adm-${Date.now()}`,
        createdAt: new Date().toISOString(),
        isActive: true,
      });
    } else {
      admins.push({
        id: `adm-${Date.now()}`,
        name: data.contactPerson,
        loginId: `${data.slug || 'org'}_admin`,
        password: `Pass@${Math.floor(1000 + Math.random() * 9000)}`,
        role: 'SUPER_ADMIN',
        email: data.contactEmail,
        phone: data.contactPhone,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    }

    const newOrg: Organization = {
      ...data,
      id,
      secretApiKey,
      clientAppLoginUrl,
      webPortalUrl,
      activeDeviceCount: 1,
      enrolledEmployeeCount: 0,
      createdAt: new Date().toISOString(),
      admins,
    };

    const updated = [newOrg, ...organizations];
    persistOrgs(updated);

    // Also create initial invoice
    const newInvoice: PaymentInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      orgId: newOrg.orgId,
      orgName: newOrg.name,
      amount: newOrg.planPrice,
      currency: 'USD',
      paymentDate: newOrg.paymentStatus === 'PAID' ? new Date().toISOString().split('T')[0] : '',
      dueDate: newOrg.nextBillingDate,
      status: newOrg.paymentStatus,
      billingCycle: newOrg.billingCycle,
      planTier: newOrg.plan,
      paymentMethod: 'Credit Card',
    };
    persistInvoices([newInvoice, ...invoices]);

    return newOrg;
  };

  const updateOrganization = async (id: string, updates: Partial<Organization>): Promise<boolean> => {
    const updated = organizations.map((org: Organization) => (org.id === id || org.orgId === id ? { ...org, ...updates } : org));
    persistOrgs(updated);
    return true;
  };

  const deleteOrganization = async (id: string): Promise<boolean> => {
    const updated = organizations.filter((org: Organization) => org.id !== id && org.orgId !== id);
    persistOrgs(updated);
    return true;
  };

  const getOrganizationById = (id: string) => {
    return organizations.find((o: Organization) => o.id === id || o.orgId === id || o.slug === id);
  };

  const addOrgAdmin = async (orgId: string, admin: Omit<OrgAdmin, 'id' | 'createdAt'>): Promise<boolean> => {
    const org = organizations.find((o: Organization) => o.id === orgId || o.orgId === orgId);
    if (!org) return false;

    const newAdmin: OrgAdmin = {
      ...admin,
      id: `adm-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updatedOrgs = organizations.map((o: Organization) => {
      if (o.id === org.id) {
        return {
          ...o,
          admins: [...o.admins, newAdmin],
        };
      }
      return o;
    });

    persistOrgs(updatedOrgs);
    return true;
  };

  const updateOrgAdmin = async (orgId: string, adminId: string, updates: Partial<OrgAdmin>): Promise<boolean> => {
    const updatedOrgs = organizations.map((o: Organization) => {
      if (o.id === orgId || o.orgId === orgId) {
        return {
          ...o,
          admins: o.admins.map((adm: OrgAdmin) => (adm.id === adminId ? { ...adm, ...updates } : adm)),
        };
      }
      return o;
    });
    persistOrgs(updatedOrgs);
    return true;
  };

  const deleteOrgAdmin = async (orgId: string, adminId: string): Promise<boolean> => {
    const updatedOrgs = organizations.map((o: Organization) => {
      if (o.id === orgId || o.orgId === orgId) {
        return {
          ...o,
          admins: o.admins.filter((adm: OrgAdmin) => adm.id !== adminId),
        };
      }
      return o;
    });
    persistOrgs(updatedOrgs);
    return true;
  };

  const updateOrgSubscription = async (
    orgId: string,
    planTier: OrgPlanTier,
    billingCycle: 'MONTHLY' | 'ANNUAL',
    paymentStatus: PaymentStatus
  ): Promise<boolean> => {
    const planConfig = plans.find((p: PlanConfig) => p.tier === planTier) || plans[0];
    const price = billingCycle === 'ANNUAL' ? planConfig.pricePerMonth * 12 * 0.8 : planConfig.pricePerMonth;

    const updatedOrgs = organizations.map((o: Organization) => {
      if (o.id === orgId || o.orgId === orgId) {
        return {
          ...o,
          plan: planTier,
          billingCycle,
          paymentStatus,
          planPrice: price,
          deviceQuota: planConfig.maxDevices,
          employeeQuota: planConfig.maxEmployees,
        };
      }
      return o;
    });
    persistOrgs(updatedOrgs);
    return true;
  };

  const recordPaymentInvoice = async (invoice: Omit<PaymentInvoice, 'id' | 'invoiceNumber'>): Promise<boolean> => {
    const newInvoice: PaymentInvoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    };
    persistInvoices([newInvoice, ...invoices]);
    return true;
  };

  const updateInvoiceStatus = async (invoiceId: string, status: PaymentStatus): Promise<boolean> => {
    const updated = invoices.map((inv: PaymentInvoice) => (inv.id === invoiceId ? { ...inv, status } : inv));
    persistInvoices(updated);
    return true;
  };

  const addKioskDevice = async (kiosk: Omit<KioskDevice, 'id'>): Promise<boolean> => {
    const newKiosk: KioskDevice = { ...kiosk, id: `ksk-${Date.now()}` };
    const updated = [newKiosk, ...kiosks];
    persistKiosks(updated);
    return true;
  };

  const deleteKioskDevice = async (id: string): Promise<boolean> => {
    const updated = kiosks.filter((k: KioskDevice) => k.id !== id);
    persistKiosks(updated);
    return true;
  };

  const addAuditLog = async (log: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<boolean> => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog: AuditLogEntry = { ...log, id: `log-${Date.now()}`, timestamp: now };
    setAuditLogs((prev: AuditLogEntry[]) => [newLog, ...prev]);
    return true;
  };

  const addEmployeeRecord = async (emp: Omit<EnrolledEmployee, 'id'>): Promise<boolean> => {
    const newEmp: EnrolledEmployee = { ...emp, id: `emp-${Date.now()}` };
    const updated = [newEmp, ...employees];
    persistEmployees(updated);
    return true;
  };

  const deleteEmployeeRecord = async (id: string): Promise<boolean> => {
    const updated = employees.filter((e: EnrolledEmployee) => e.id !== id);
    persistEmployees(updated);
    return true;
  };

  const addAttendanceRecord = async (att: Omit<EmployeeAttendance, 'id'>): Promise<boolean> => {
    const newAtt: EmployeeAttendance = { ...att, id: `att-${Date.now()}` };
    const updated = [newAtt, ...attendance];
    persistAttendance(updated);
    return true;
  };

  const resetToMockData = () => {
    localStorage.removeItem('visagel_admin_orgs');
    localStorage.removeItem('visagel_admin_attendance');
    localStorage.removeItem('visagel_admin_employees');
    localStorage.removeItem('visagel_admin_invoices');
    localStorage.removeItem('visagel_admin_kiosks');
    setOrganizations(INITIAL_ORGANIZATIONS);
    setAttendance(INITIAL_ATTENDANCE);
    setEmployees(INITIAL_EMPLOYEES);
    setInvoices(INITIAL_INVOICES);
    setKiosks(INITIAL_KIOSKS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
  };

  // Dashboard Aggregates
  const stats: DashboardStats = {
    totalOrganizations: organizations.length,
    activeOrganizations: organizations.filter((o: Organization) => o.status === 'ACTIVE').length,
    totalEnrolledEmployees: organizations.reduce((acc: number, o: Organization) => acc + (o.enrolledEmployeeCount || 0), 0) + employees.length,
    totalPunchesToday: attendance.reduce((acc: number, a: EmployeeAttendance) => acc + a.punches.length, 0),
    totalRevenueMonthly: organizations.reduce((acc: number, o: Organization) => acc + (o.planPrice || 0), 0),
    pendingPaymentsCount: organizations.filter((o: Organization) => o.paymentStatus === 'PENDING').length,
    overduePaymentsCount: organizations.filter((o: Organization) => o.paymentStatus === 'OVERDUE').length,
    activeKiosksCount: kiosks.filter((k: KioskDevice) => k.status === 'ONLINE').length,
  };

  return (
    <AdminDataContext.Provider
      value={{
        organizations,
        plans,
        attendance,
        employees,
        shifts,
        invoices,
        kiosks,
        auditLogs,
        stats,
        addOrganization,
        updateOrganization,
        deleteOrganization,
        getOrganizationById,
        addOrgAdmin,
        updateOrgAdmin,
        deleteOrgAdmin,
        updateOrgSubscription,
        recordPaymentInvoice,
        updateInvoiceStatus,
        addKioskDevice,
        deleteKioskDevice,
        addAuditLog,
        addEmployeeRecord,
        deleteEmployeeRecord,
        addAttendanceRecord,
        resetToMockData,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};
