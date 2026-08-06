import { Injectable } from '@angular/core';
import { MasterManagementResponseTypeMasterItem, ResponseTypeName, ResponseValidationType } from './response-type-master.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementResponseTypeMasterService {
  readonly typeNameMaster: ResponseTypeName[] = ['Yes/No', 'Numeric', 'Text', 'Image Upload'];
  readonly validationTypeMaster: ResponseValidationType[] = ['None', 'Range', 'Regex', 'Required'];

  private readonly records: MasterManagementResponseTypeMasterItem[] = [
    {
      typeId: 'RSP-1001',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      typeName: 'Yes/No',
      validationType: 'Required',
      isActive: true
    },
    {
      typeId: 'RSP-1002',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      typeName: 'Numeric',
      validationType: 'Range',
      isActive: true
    },
    {
      typeId: 'RSP-1003',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      typeName: 'Text',
      validationType: 'Regex',
      isActive: true
    },
    {
      typeId: 'RSP-1004',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      typeName: 'Image Upload',
      validationType: 'Required',
      isActive: true
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementResponseTypeMasterItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementResponseTypeMasterItem): MasterManagementResponseTypeMasterItem {
    const typeId = record.typeId?.trim() || `RSP-${this.nextSequence++}`;
    const created: MasterManagementResponseTypeMasterItem = { ...record, typeId };
    this.records.push(created);
    return created;
  }

  updateRecord(typeId: string, changes: MasterManagementResponseTypeMasterItem): void {
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

  search(term: string): MasterManagementResponseTypeMasterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
