export type AuditorDepartment = 'Finance' | 'Operations' | 'IT' | 'Facilities' | 'Compliance';
export type AuditorCertificationType = 'Internal Auditor' | 'ISO 9001 Lead Auditor' | 'ISO 27001 Lead Auditor' | 'Certified Fraud Examiner' | 'CPA';
export type AuditorStatus = 'Active' | 'Inactive';

export interface MasterManagementAuditorDetailsItem {
  auditorId: string;
  auditorName: string;
  employeeCode: string;
  department: AuditorDepartment | '';
  email: string;
  phone: string;
  certificationType: AuditorCertificationType | '';
  status: AuditorStatus | '';
}
