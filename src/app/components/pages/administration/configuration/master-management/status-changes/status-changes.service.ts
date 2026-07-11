import { Injectable } from '@angular/core';
import { MasterManagementStatusChangeItem } from './status-changes.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementStatusChangeService {
  readonly statusMaster: string[] = ['In stock', 'Active', 'Maintenance', 'Retired'];

  private readonly records: MasterManagementStatusChangeItem[] = [
    {
      statusChangeId: 'STC-1001',
      statusName: 'In stock',
      statusCode: 'IN_STOCK',
      sequenceOrder: 1,
      isClosedStatus: false,
      requiresApproval: false,
      isDefault: true,
      allowedTransitions: ['STC-1002'],
      description: 'Asset has been received and is held in inventory, not yet deployed.'
    },
    {
      statusChangeId: 'STC-1002',
      statusName: 'Active',
      statusCode: 'ACTIVE',
      sequenceOrder: 2,
      isClosedStatus: false,
      requiresApproval: false,
      isDefault: false,
      allowedTransitions: ['STC-1003', 'STC-1004'],
      description: 'Asset is deployed and in active use.'
    },
    {
      statusChangeId: 'STC-1003',
      statusName: 'Maintenance',
      statusCode: 'MAINTENANCE',
      sequenceOrder: 3,
      isClosedStatus: false,
      requiresApproval: false,
      isDefault: false,
      allowedTransitions: ['STC-1002', 'STC-1004'],
      description: 'Asset is undergoing maintenance and is temporarily out of service.'
    },
    {
      statusChangeId: 'STC-1004',
      statusName: 'Retired',
      statusCode: 'RETIRED',
      sequenceOrder: 4,
      isClosedStatus: true,
      requiresApproval: true,
      isDefault: false,
      allowedTransitions: [],
      description: 'Asset has been decommissioned and is no longer in service.'
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementStatusChangeItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementStatusChangeItem): MasterManagementStatusChangeItem {
    const statusChangeId = record.statusChangeId?.trim() || `STC-${this.nextSequence++}`;
    const created: MasterManagementStatusChangeItem = { ...record, statusChangeId };
    this.records.push(created);
    return created;
  }

  updateRecord(statusChangeId: string, changes: MasterManagementStatusChangeItem): void {
    const index = this.records.findIndex((s) => s.statusChangeId === statusChangeId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(statusChangeIds: string[]): void {
    for (const id of statusChangeIds) {
      const index = this.records.findIndex((s) => s.statusChangeId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementStatusChangeItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((s) =>
      Object.values(s).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
