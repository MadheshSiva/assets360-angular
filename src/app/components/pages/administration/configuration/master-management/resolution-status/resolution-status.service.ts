import { Injectable } from '@angular/core';
import { MasterManagementResolutionStatusItem } from './resolution-status.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementResolutionStatusService {
  readonly statusNameSuggestions: string[] = ['Open', 'Investigating', 'Resolved', 'Not Reproducible', 'Rejected', 'Closed'];

  private readonly records: MasterManagementResolutionStatusItem[] = [
    {
      resolutionStatusId: 'RES-1001',
      statusName: 'Open',
      statusCode: 'OPEN',
      sequenceOrder: 1,
      isClosedStatus: false,
      isDefault: true,
      description: 'Issue has been logged and is awaiting action'
    },
    {
      resolutionStatusId: 'RES-1002',
      statusName: 'Investigating',
      statusCode: 'INVESTIGATING',
      sequenceOrder: 2,
      isClosedStatus: false,
      isDefault: false,
      description: 'Issue is being actively investigated'
    },
    {
      resolutionStatusId: 'RES-1003',
      statusName: 'Resolved',
      statusCode: 'RESOLVED',
      sequenceOrder: 3,
      isClosedStatus: true,
      isDefault: false,
      description: 'Issue has been fixed and verified'
    },
    {
      resolutionStatusId: 'RES-1004',
      statusName: 'Rejected',
      statusCode: 'REJECTED',
      sequenceOrder: 4,
      isClosedStatus: true,
      isDefault: false,
      description: 'Issue was reviewed and rejected as invalid or out of scope'
    },
    {
      resolutionStatusId: 'RES-1005',
      statusName: 'Closed',
      statusCode: 'CLOSED',
      sequenceOrder: 5,
      isClosedStatus: true,
      isDefault: false,
      description: 'Issue is fully closed with no further action required'
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
