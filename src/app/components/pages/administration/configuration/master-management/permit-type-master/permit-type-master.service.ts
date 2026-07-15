import { Injectable } from '@angular/core';
import { MasterManagementPermitTypeMasterItem } from './permit-type-master.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementPermitTypeMasterService {
  private readonly records: MasterManagementPermitTypeMasterItem[] = [
    {
      permitTypeId: 'PRT-1001',
      permitName: 'Electrical Permit',
      validityDays: 30,
      isApprovalRequired: true
    },
    {
      permitTypeId: 'PRT-1002',
      permitName: 'Confined Space Permit',
      validityDays: 7,
      isApprovalRequired: true
    },
    {
      permitTypeId: 'PRT-1003',
      permitName: 'Hot Work Permit',
      validityDays: 1,
      isApprovalRequired: true
    }
  ];

  private nextSequence = 1004;

  getRecords(): MasterManagementPermitTypeMasterItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementPermitTypeMasterItem): MasterManagementPermitTypeMasterItem {
    const permitTypeId = record.permitTypeId?.trim() || `PRT-${this.nextSequence++}`;
    const created: MasterManagementPermitTypeMasterItem = { ...record, permitTypeId };
    this.records.push(created);
    return created;
  }

  updateRecord(permitTypeId: string, changes: MasterManagementPermitTypeMasterItem): void {
    const index = this.records.findIndex((r) => r.permitTypeId === permitTypeId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(permitTypeIds: string[]): void {
    for (const id of permitTypeIds) {
      const index = this.records.findIndex((r) => r.permitTypeId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementPermitTypeMasterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
