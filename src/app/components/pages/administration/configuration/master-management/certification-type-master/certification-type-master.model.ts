export type CertificationTypeRenewalRequired = 'Yes' | 'No';
export type CertificationTypeMasterStatus = 'Active' | 'Inactive';

export interface MasterManagementCertificationTypeMasterItem {
  certificationTypeId: string;
  certificationName: string;
  certificationCode: string;
  description: string;
  applicableAssetType: string;
  issuingAuthority: string;
  validityPeriodDays: number | null;
  renewalRequired: CertificationTypeRenewalRequired | '';
  status: CertificationTypeMasterStatus | '';
}
