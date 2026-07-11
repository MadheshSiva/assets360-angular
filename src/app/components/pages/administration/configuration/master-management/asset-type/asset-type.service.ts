import { Injectable } from '@angular/core';
import { AssetTypeStatus, MasterManagementAssetTypeItem } from './asset-type.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementAssetTypeService {
  readonly statusMaster: AssetTypeStatus[] = ['Active', 'Inactive'];

  private readonly records: MasterManagementAssetTypeItem[] = [
    {
      assetTypeId: 'AST-1001',
      assetTypeName: 'HVAC Unit',
      assetTypeCode: 'HVAC-UNIT',
      description: 'Heating, ventilation and air conditioning units installed on premises',
      status: 'Active'
    },
    {
      assetTypeId: 'AST-1002',
      assetTypeName: 'Forklift',
      assetTypeCode: 'FORKLIFT',
      description: 'Powered industrial trucks used to lift and move materials',
      status: 'Active'
    },
    {
      assetTypeId: 'AST-1003',
      assetTypeName: 'Laptop',
      assetTypeCode: 'LAPTOP',
      description: 'Portable computers issued to staff for daily operations',
      status: 'Active'
    },
    {
      assetTypeId: 'AST-1004',
      assetTypeName: 'Delivery Van',
      assetTypeCode: 'DELIVERY-VAN',
      description: 'Light commercial vehicles used for goods delivery',
      status: 'Inactive'
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementAssetTypeItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementAssetTypeItem): MasterManagementAssetTypeItem {
    const assetTypeId = record.assetTypeId?.trim() || `AST-${this.nextSequence++}`;
    const created: MasterManagementAssetTypeItem = { ...record, assetTypeId };
    this.records.push(created);
    return created;
  }

  updateRecord(assetTypeId: string, changes: MasterManagementAssetTypeItem): void {
    const index = this.records.findIndex((r) => r.assetTypeId === assetTypeId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(assetTypeIds: string[]): void {
    for (const id of assetTypeIds) {
      const index = this.records.findIndex((r) => r.assetTypeId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementAssetTypeItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
