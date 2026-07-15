import { Injectable } from '@angular/core';
import { MasterManagementResourceTypeItem, ResourceTypeCategory } from './resource-type.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementResourceTypeService {
  readonly categoryMaster: ResourceTypeCategory[] = ['Technician', 'Contractor', 'Engineer'];

  private readonly records: MasterManagementResourceTypeItem[] = [
    {
      resourceTypeId: 'RSC-1001',
      resourceTypeName: 'Field Technician',
      category: 'Technician',
      isActive: true
    },
    {
      resourceTypeId: 'RSC-1002',
      resourceTypeName: 'Electrical Contractor',
      category: 'Contractor',
      isActive: true
    },
    {
      resourceTypeId: 'RSC-1003',
      resourceTypeName: 'Maintenance Engineer',
      category: 'Engineer',
      isActive: true
    }
  ];

  private nextSequence = 1004;

  getRecords(): MasterManagementResourceTypeItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementResourceTypeItem): MasterManagementResourceTypeItem {
    const resourceTypeId = record.resourceTypeId?.trim() || `RSC-${this.nextSequence++}`;
    const created: MasterManagementResourceTypeItem = { ...record, resourceTypeId };
    this.records.push(created);
    return created;
  }

  updateRecord(resourceTypeId: string, changes: MasterManagementResourceTypeItem): void {
    const index = this.records.findIndex((r) => r.resourceTypeId === resourceTypeId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(resourceTypeIds: string[]): void {
    for (const id of resourceTypeIds) {
      const index = this.records.findIndex((r) => r.resourceTypeId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementResourceTypeItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
