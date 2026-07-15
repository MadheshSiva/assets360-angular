import { Injectable } from '@angular/core';
import {
  AssetTypeFieldDataType,
  AssetTypeFieldRequired,
  MasterManagementAssetTypeFieldsItem
} from './asset-type-fields.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementAssetTypeFieldsService {
  readonly assetTypeMaster: string[] = ['IT Equipment', 'Vehicle', 'Machinery', 'Furniture', 'Safety Equipment'];
  readonly fieldTypeMaster: AssetTypeFieldDataType[] = ['Text', 'Number', 'Date', 'Dropdown', 'Checkbox'];
  readonly isRequiredMaster: AssetTypeFieldRequired[] = ['Yes', 'No'];

  private readonly records: MasterManagementAssetTypeFieldsItem[] = [
    {
      fieldId: 'ATF-1001',
      assetType: 'IT Equipment',
      fieldName: 'Warranty Expiry',
      fieldType: 'Date',
      isRequired: 'Yes'
    },
    {
      fieldId: 'ATF-1002',
      assetType: 'Vehicle',
      fieldName: 'Engine Number',
      fieldType: 'Text',
      isRequired: 'Yes'
    },
    {
      fieldId: 'ATF-1003',
      assetType: 'Machinery',
      fieldName: 'Requires Calibration',
      fieldType: 'Checkbox',
      isRequired: 'No'
    }
  ];

  private nextSequence = 1004;

  getRecords(): MasterManagementAssetTypeFieldsItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementAssetTypeFieldsItem): MasterManagementAssetTypeFieldsItem {
    const fieldId = record.fieldId?.trim() || `ATF-${this.nextSequence++}`;
    const created: MasterManagementAssetTypeFieldsItem = { ...record, fieldId };
    this.records.push(created);
    return created;
  }

  updateRecord(fieldId: string, changes: MasterManagementAssetTypeFieldsItem): void {
    const index = this.records.findIndex((r) => r.fieldId === fieldId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(fieldIds: string[]): void {
    for (const id of fieldIds) {
      const index = this.records.findIndex((r) => r.fieldId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementAssetTypeFieldsItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
