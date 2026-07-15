import { Injectable } from '@angular/core';
import {
  ApiSyncFinalFlag,
  ApiSyncStatusType,
  MasterManagementApiSyncStatusMasterItem
} from './api-sync-status-master.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementApiSyncStatusMasterService {
  readonly statusTypeMaster: ApiSyncStatusType[] = ['Success', 'Warning', 'Error', 'Pending'];
  readonly finalStatusMaster: ApiSyncFinalFlag[] = ['Yes', 'No'];

  private readonly records: MasterManagementApiSyncStatusMasterItem[] = [
    {
      syncStatusId: 'SYN-1001',
      statusName: 'Synced',
      statusCode: 'SYNCED',
      description: 'Record successfully synced with the external system',
      statusType: 'Success',
      isFinalStatus: 'Yes'
    },
    {
      syncStatusId: 'SYN-1002',
      statusName: 'Pending',
      statusCode: 'PENDING',
      description: 'Record is queued and awaiting the next sync cycle',
      statusType: 'Pending',
      isFinalStatus: 'No'
    },
    {
      syncStatusId: 'SYN-1003',
      statusName: 'Failed',
      statusCode: 'FAILED',
      description: 'Sync attempt failed and requires manual review',
      statusType: 'Error',
      isFinalStatus: 'Yes'
    },
    {
      syncStatusId: 'SYN-1004',
      statusName: 'Conflict',
      statusCode: 'CONFLICT',
      description: 'Sync detected conflicting data between systems',
      statusType: 'Warning',
      isFinalStatus: 'No'
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementApiSyncStatusMasterItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementApiSyncStatusMasterItem): MasterManagementApiSyncStatusMasterItem {
    const syncStatusId = record.syncStatusId?.trim() || `SYN-${this.nextSequence++}`;
    const created: MasterManagementApiSyncStatusMasterItem = { ...record, syncStatusId };
    this.records.push(created);
    return created;
  }

  updateRecord(syncStatusId: string, changes: MasterManagementApiSyncStatusMasterItem): void {
    const index = this.records.findIndex((r) => r.syncStatusId === syncStatusId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(syncStatusIds: string[]): void {
    for (const id of syncStatusIds) {
      const index = this.records.findIndex((r) => r.syncStatusId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementApiSyncStatusMasterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
