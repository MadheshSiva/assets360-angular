import { Injectable } from '@angular/core';
import { MasterManagementWorkTypeItem } from './work-type.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementWorkTypeService {
  private readonly records: MasterManagementWorkTypeItem[] = [
    {
      workTypeId: 'WKT-1001',
      workTypeName: 'Preventive Maintenance',
      description: 'Scheduled maintenance performed to prevent asset failure',
      isActive: true
    },
    {
      workTypeId: 'WKT-1002',
      workTypeName: 'Corrective Repair',
      description: 'Repair work carried out after a fault is identified',
      isActive: true
    },
    {
      workTypeId: 'WKT-1003',
      workTypeName: 'Breakdown Response',
      description: 'Emergency response work following an unexpected breakdown',
      isActive: true
    }
  ];

  private nextSequence = 1004;

  getRecords(): MasterManagementWorkTypeItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementWorkTypeItem): MasterManagementWorkTypeItem {
    const workTypeId = record.workTypeId?.trim() || `WKT-${this.nextSequence++}`;
    const created: MasterManagementWorkTypeItem = { ...record, workTypeId };
    this.records.push(created);
    return created;
  }

  updateRecord(workTypeId: string, changes: MasterManagementWorkTypeItem): void {
    const index = this.records.findIndex((r) => r.workTypeId === workTypeId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(workTypeIds: string[]): void {
    for (const id of workTypeIds) {
      const index = this.records.findIndex((r) => r.workTypeId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementWorkTypeItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
