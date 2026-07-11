export interface MasterManagementResolutionStatusItem {
  resolutionStatusId: string;
  statusName: string;
  statusCode: string;
  sequenceOrder: number | null;
  isClosedStatus: boolean;
  isDefault: boolean;
  description: string;
}
