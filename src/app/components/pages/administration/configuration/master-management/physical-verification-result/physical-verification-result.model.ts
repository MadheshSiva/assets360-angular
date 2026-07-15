export type PhysicalVerificationResultCategory = 'Positive' | 'Negative' | 'Exception';
export type PhysicalVerificationRequiresAction = 'Yes' | 'No';
export type PhysicalVerificationResultStatus = 'Active' | 'Inactive';

export interface MasterManagementPhysicalVerificationResultItem {
  resultId: string;
  resultName: string;
  resultCode: string;
  description: string;
  resultCategory: PhysicalVerificationResultCategory | '';
  requiresAction: PhysicalVerificationRequiresAction | '';
  status: PhysicalVerificationResultStatus | '';
}
