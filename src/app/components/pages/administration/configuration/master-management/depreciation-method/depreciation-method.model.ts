export type DepreciationCalculationType = 'Percentage' | 'Fixed' | 'Usage-based';
export type DepreciationMethodStatus = 'Active' | 'Inactive';

export interface MasterManagementDepreciationMethodItem {
  methodId: string;
  methodName: string;
  methodCode: string;
  description: string;
  calculationType: DepreciationCalculationType | '';
  ratePercent: number | null;
  usefulLifeYears: number | null;
  status: DepreciationMethodStatus | '';
}
