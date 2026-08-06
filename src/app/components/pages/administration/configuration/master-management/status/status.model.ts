export interface MasterManagementStatusItem {
  statusId: string;
  assetId: string;
  assetName: string;
  statusName: string;
  colorCode: string;
  allowedTransitions: string[];
  isActive: boolean;
}
