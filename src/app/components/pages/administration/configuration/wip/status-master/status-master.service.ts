import { Injectable } from '@angular/core';
import { StatusMaster } from './status-master.model';

@Injectable({ providedIn: 'root' })
export class StatusMasterService {
  readonly statusNameSuggestions: string[] = [
    'Planned',
    'Approved',
    'In Progress',
    'On Hold',
    'Completed',
    'Cancelled'
  ];

  private readonly statuses: StatusMaster[] = [
    {
      statusId: 'STS-1001',
      statusName: 'Planned',
      statusCode: 'PLANNED',
      sequenceOrder: 1,
      isClosedStatus: false,
      colorCode: '#6b7280',
      allowedTransitions: ['STS-1002'],
      requiresApproval: false,
      isDefault: true
    },
    {
      statusId: 'STS-1002',
      statusName: 'Approved',
      statusCode: 'APPROVED',
      sequenceOrder: 2,
      isClosedStatus: false,
      colorCode: '#2563eb',
      allowedTransitions: ['STS-1003'],
      requiresApproval: true,
      isDefault: false
    },
    {
      statusId: 'STS-1003',
      statusName: 'In Progress',
      statusCode: 'IN_PROGRESS',
      sequenceOrder: 3,
      isClosedStatus: false,
      colorCode: '#f59e0b',
      allowedTransitions: ['STS-1004', 'STS-1005'],
      requiresApproval: false,
      isDefault: false
    },
    {
      statusId: 'STS-1004',
      statusName: 'On Hold',
      statusCode: 'ON_HOLD',
      sequenceOrder: 4,
      isClosedStatus: false,
      colorCode: '#f97316',
      allowedTransitions: ['STS-1003', 'STS-1006'],
      requiresApproval: false,
      isDefault: false
    },
    {
      statusId: 'STS-1005',
      statusName: 'Completed',
      statusCode: 'COMPLETED',
      sequenceOrder: 5,
      isClosedStatus: true,
      colorCode: '#16a34a',
      allowedTransitions: [],
      requiresApproval: false,
      isDefault: false
    },
    {
      statusId: 'STS-1006',
      statusName: 'Cancelled',
      statusCode: 'CANCELLED',
      sequenceOrder: 6,
      isClosedStatus: true,
      colorCode: '#dc2626',
      allowedTransitions: [],
      requiresApproval: false,
      isDefault: false
    }
  ];

  private nextSequence = 1007;

  getStatuses(): StatusMaster[] {
    return this.statuses;
  }

  addRecord(record: StatusMaster): StatusMaster {
    const statusId = record.statusId?.trim() || `STS-${this.nextSequence++}`;
    const created: StatusMaster = { ...record, statusId };
    this.statuses.push(created);
    return created;
  }

  updateRecord(statusId: string, changes: StatusMaster): void {
    const index = this.statuses.findIndex((s) => s.statusId === statusId);
    if (index !== -1) {
      this.statuses[index] = { ...this.statuses[index], ...changes };
    }
  }

  deleteRecords(statusIds: string[]): void {
    for (const id of statusIds) {
      const index = this.statuses.findIndex((s) => s.statusId === id);
      if (index !== -1) {
        this.statuses.splice(index, 1);
      }
    }
  }

  search(term: string): StatusMaster[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.statuses;
    return this.statuses.filter((s) =>
      Object.values(s).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
