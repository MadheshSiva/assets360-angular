export interface MasterManagementPermitTypeMasterItem {
  permitTypeId: string;
  assetId: string;
  assetName: string;
  permitName: string;
  validityDays: number | null;
  isApprovalRequired: boolean;
}
