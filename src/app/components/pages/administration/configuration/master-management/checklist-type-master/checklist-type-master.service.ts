import { Injectable } from '@angular/core';
import { ApplicableModule, MasterManagementChecklistTypeMasterItem } from './checklist-type-master.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementChecklistTypeMasterService {
  readonly applicableModuleMaster: ApplicableModule[] = ['Asset', 'Maintenance', 'WIP', 'Inspection', 'Safety'];

  private readonly records: MasterManagementChecklistTypeMasterItem[] = [
    {
      typeId: 'CKT-1001',
      typeName: 'Daily Asset Inspection',
      applicableModule: 'Asset',
      isActive: true
    },
    {
      typeId: 'CKT-1002',
      typeName: 'Preventive Maintenance Checklist',
      applicableModule: 'Maintenance',
      isActive: true
    },
    {
      typeId: 'CKT-1003',
      typeName: 'Safety Walkdown',
      applicableModule: 'Safety',
      isActive: true
    },
    {
      typeId: 'CKT-1004',
      typeName: 'WIP Progress Review',
      applicableModule: 'WIP',
      isActive: false
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementChecklistTypeMasterItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementChecklistTypeMasterItem): MasterManagementChecklistTypeMasterItem {
    const typeId = record.typeId?.trim() || `CKT-${this.nextSequence++}`;
    const created: MasterManagementChecklistTypeMasterItem = { ...record, typeId };
    this.records.push(created);
    return created;
  }

  updateRecord(typeId: string, changes: MasterManagementChecklistTypeMasterItem): void {
    const index = this.records.findIndex((r) => r.typeId === typeId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(typeIds: string[]): void {
    for (const id of typeIds) {
      const index = this.records.findIndex((r) => r.typeId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementChecklistTypeMasterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
