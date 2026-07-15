import { Injectable } from '@angular/core';
import { MasterManagementConditionMasterItem, ConditionName } from './condition-master.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementConditionMasterService {
  readonly conditionNameMaster: ConditionName[] = ['Good', 'Warning', 'Critical'];

  private readonly records: MasterManagementConditionMasterItem[] = [
    {
      conditionId: 'CND-1001',
      conditionName: 'Good',
      thresholdValue: 80,
      colorCode: '#1e7e34'
    },
    {
      conditionId: 'CND-1002',
      conditionName: 'Warning',
      thresholdValue: 60,
      colorCode: '#b8860b'
    },
    {
      conditionId: 'CND-1003',
      conditionName: 'Critical',
      thresholdValue: 30,
      colorCode: '#c0221f'
    }
  ];

  private nextSequence = 1004;

  getRecords(): MasterManagementConditionMasterItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementConditionMasterItem): MasterManagementConditionMasterItem {
    const conditionId = record.conditionId?.trim() || `CND-${this.nextSequence++}`;
    const created: MasterManagementConditionMasterItem = { ...record, conditionId };
    this.records.push(created);
    return created;
  }

  updateRecord(conditionId: string, changes: MasterManagementConditionMasterItem): void {
    const index = this.records.findIndex((r) => r.conditionId === conditionId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(conditionIds: string[]): void {
    for (const id of conditionIds) {
      const index = this.records.findIndex((r) => r.conditionId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementConditionMasterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
