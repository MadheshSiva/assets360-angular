export type PermitType = 'Electrical' | 'Confined Space' | 'Hot Work';
export type PermitStatus = 'Active' | 'Expired' | 'Revoked' | 'Pending Approval';

export interface PermitCompliance {
  permitId: string;
  jobId: string;
  permitType: PermitType | '';
  issuedBy: string;
  approvedBy: string;
  validFrom: string;
  validTo: string;
  status: PermitStatus | '';
  documentAttachment: string;
  selected?: boolean;
}

export type PermitComplianceForm = Omit<PermitCompliance, 'selected'>;
