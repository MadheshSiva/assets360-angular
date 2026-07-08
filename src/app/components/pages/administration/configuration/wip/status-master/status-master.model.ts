export interface StatusMaster {
  statusId: string;
  statusName: string;
  statusCode: string;
  sequenceOrder: number | null;
  isClosedStatus: boolean;
  colorCode: string;
  allowedTransitions: string[];
  requiresApproval: boolean;
  isDefault: boolean;
}
