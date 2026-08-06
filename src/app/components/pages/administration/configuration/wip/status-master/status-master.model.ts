export interface StatusMaster {
  statusId: string;
  assetId: string;
  assetName: string;
  statusName: string;
  statusCode: string;
  sequenceOrder: number | null;
  isClosedStatus: boolean;
  colorCode: string;
  allowedTransitions: string[];
  requiresApproval: boolean;
  isDefault: boolean;
}
