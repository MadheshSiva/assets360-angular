export type ResolutionStatusFinalFlag = 'Yes' | 'No';
export type ResolutionStatusCategory = 'Open' | 'In Progress' | 'Closed';

export interface MasterManagementResolutionStatusItem {
  resolutionStatusId: string;
  statusName: string;
  statusCode: string;
  description: string;
  isFinalStatus: ResolutionStatusFinalFlag | '';
  statusCategory: ResolutionStatusCategory | '';
  sequenceOrder: number | null;
  statusColor: string;
}
