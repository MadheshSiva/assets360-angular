import { Injectable } from '@angular/core';
import {
  MasterManagementResolutionStatusItem,
  ResolutionStatusCategory,
  ResolutionStatusFinalFlag
} from './resolution-status.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementResolutionStatusService {
  readonly statusNameSuggestions: string[] = ['Open', 'Investigating', 'Resolved', 'Not Reproducible', 'Rejected', 'Closed'];
  readonly finalStatusMaster: ResolutionStatusFinalFlag[] = ['Yes', 'No'];
  readonly categoryMaster: ResolutionStatusCategory[] = ['Open', 'In Progress', 'Closed'];

  private readonly records: MasterManagementResolutionStatusItem[] = [
    {
      resolutionStatusId: 'RES-1001',
      statusName: 'Open',
      statusCode: 'OPEN',
      description: 'Issue has been logged and is awaiting action',
      isFinalStatus: 'No',
      statusCategory: 'Open',
      sequenceOrder: 1,
      statusColor: '#1d4ed8'
    },
    {
      resolutionStatusId: 'RES-1002',
      statusName: 'Investigating',
      statusCode: 'INVESTIGATING',
      description: 'Issue is being actively investigated',
      isFinalStatus: 'No',
      statusCategory: 'In Progress',
      sequenceOrder: 2,
      statusColor: '#b8860b'
    },
    {
      resolutionStatusId: 'RES-1003',
      statusName: 'Resolved',
      statusCode: 'RESOLVED',
      description: 'Issue has been fixed and verified',
      isFinalStatus: 'Yes',
      statusCategory: 'Closed',
      sequenceOrder: 3,
      statusColor: '#1e7e34'
    },
    {
      resolutionStatusId: 'RES-1004',
      statusName: 'Rejected',
      statusCode: 'REJECTED',
      description: 'Issue was reviewed and rejected as invalid or out of scope',
      isFinalStatus: 'Yes',
      statusCategory: 'Closed',
      sequenceOrder: 4,
      statusColor: '#c0221f'
    },
    {
      resolutionStatusId: 'RES-1005',
      statusName: 'Closed',
      statusCode: 'CLOSED',
      description: 'Issue is fully closed with no further action required',
      isFinalStatus: 'Yes',
      statusCategory: 'Closed',
      sequenceOrder: 5,
      statusColor: '#64748b'
    }
  ];

  private nextSequence = 1006;

  getRecords(): MasterManagementResolutionStatusItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementResolutionStatusItem): MasterManagementResolutionStatusItem {
    const resolutionStatusId = record.resolutionStatusId?.trim() || `RES-${this.nextSequence++}`;
    const created: MasterManagementResolutionStatusItem = { ...record, resolutionStatusId };
    this.records.push(created);
    return created;
  }

  updateRecord(resolutionStatusId: string, changes: MasterManagementResolutionStatusItem): void {
    const index = this.records.findIndex((r) => r.resolutionStatusId === resolutionStatusId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(resolutionStatusIds: string[]): void {
    for (const id of resolutionStatusIds) {
      const index = this.records.findIndex((r) => r.resolutionStatusId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementResolutionStatusItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
