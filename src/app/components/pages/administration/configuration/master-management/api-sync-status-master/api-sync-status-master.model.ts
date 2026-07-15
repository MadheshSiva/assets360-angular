export type ApiSyncStatusType = 'Success' | 'Warning' | 'Error' | 'Pending';
export type ApiSyncFinalFlag = 'Yes' | 'No';

export interface MasterManagementApiSyncStatusMasterItem {
  syncStatusId: string;
  statusName: string;
  statusCode: string;
  description: string;
  statusType: ApiSyncStatusType | '';
  isFinalStatus: ApiSyncFinalFlag | '';
}
