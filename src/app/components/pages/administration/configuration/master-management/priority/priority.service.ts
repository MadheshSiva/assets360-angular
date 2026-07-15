import { Injectable } from '@angular/core';
import { MasterManagementPriorityItem, PriorityName } from './priority.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementPriorityService {
  readonly priorityNameMaster: PriorityName[] = ['Low', 'Medium', 'High', 'Critical'];
  readonly slaMappingMaster: string[] = ['SLA-1 (72 Hours)', 'SLA-2 (24 Hours)', 'SLA-3 (4 Hours)', 'SLA-4 (1 Hour)'];

  private readonly records: MasterManagementPriorityItem[] = [
    {
      priorityId: 'PRI-1001',
      priorityName: 'Low',
      colorCode: '#1e7e34',
      slaMapping: 'SLA-1 (72 Hours)',
      isActive: true
    },
    {
      priorityId: 'PRI-1002',
      priorityName: 'Medium',
      colorCode: '#b8860b',
      slaMapping: 'SLA-2 (24 Hours)',
      isActive: true
    },
    {
      priorityId: 'PRI-1003',
      priorityName: 'High',
      colorCode: '#c0491f',
      slaMapping: 'SLA-3 (4 Hours)',
      isActive: true
    },
    {
      priorityId: 'PRI-1004',
      priorityName: 'Critical',
      colorCode: '#c0221f',
      slaMapping: 'SLA-4 (1 Hour)',
      isActive: true
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementPriorityItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementPriorityItem): MasterManagementPriorityItem {
    const priorityId = record.priorityId?.trim() || `PRI-${this.nextSequence++}`;
    const created: MasterManagementPriorityItem = { ...record, priorityId };
    this.records.push(created);
    return created;
  }

  updateRecord(priorityId: string, changes: MasterManagementPriorityItem): void {
    const index = this.records.findIndex((r) => r.priorityId === priorityId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(priorityIds: string[]): void {
    for (const id of priorityIds) {
      const index = this.records.findIndex((r) => r.priorityId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementPriorityItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
