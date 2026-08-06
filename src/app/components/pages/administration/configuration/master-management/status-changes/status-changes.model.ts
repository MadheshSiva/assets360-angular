export interface MasterManagementStatusChangeItem {
  statusChangeId: string;
  assetId: string;
  assetName: string;
  statusName: string;
  statusCode: string;
  sequenceOrder: number | null;
  isClosedStatus: boolean;
  requiresApproval: boolean;
  isDefault: boolean;
  allowedTransitions: string[];
  description: string;
}
