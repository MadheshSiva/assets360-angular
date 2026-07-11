export interface MasterManagementStatusChangeItem {
  statusChangeId: string;
  statusName: string;
  statusCode: string;
  sequenceOrder: number | null;
  isClosedStatus: boolean;
  requiresApproval: boolean;
  isDefault: boolean;
  allowedTransitions: string[];
  description: string;
}
