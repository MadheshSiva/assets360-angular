import { Injectable } from '@angular/core';
import {
  DepreciationCalculationType,
  DepreciationMethodStatus,
  MasterManagementDepreciationMethodItem
} from './depreciation-method.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementDepreciationMethodService {
  readonly calculationTypeMaster: DepreciationCalculationType[] = ['Percentage', 'Fixed', 'Usage-based'];
  readonly statusMaster: DepreciationMethodStatus[] = ['Active', 'Inactive'];

  private readonly records: MasterManagementDepreciationMethodItem[] = [
    {
      methodId: 'DEP-1001',
      methodName: 'Straight Line',
      methodCode: 'SL',
      description: 'Depreciates the asset by an equal amount every year over its useful life',
      calculationType: 'Percentage',
      ratePercent: 10,
      usefulLifeYears: 10,
      status: 'Active'
    },
    {
      methodId: 'DEP-1002',
      methodName: 'Declining Balance',
      methodCode: 'DB',
      description: 'Applies a constant depreciation rate to the reducing book value each year',
      calculationType: 'Percentage',
      ratePercent: 20,
      usefulLifeYears: 5,
      status: 'Active'
    },
    {
      methodId: 'DEP-1003',
      methodName: 'Units of Production',
      methodCode: 'UOP',
      description: 'Depreciates the asset based on actual usage or output produced',
      calculationType: 'Usage-based',
      ratePercent: null,
      usefulLifeYears: 8,
      status: 'Active'
    },
    {
      methodId: 'DEP-1004',
      methodName: 'Sum of Years Digits',
      methodCode: 'SYD',
      description: 'Accelerated depreciation method weighted toward earlier years of useful life',
      calculationType: 'Fixed',
      ratePercent: 25,
      usefulLifeYears: 4,
      status: 'Inactive'
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementDepreciationMethodItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementDepreciationMethodItem): MasterManagementDepreciationMethodItem {
    const methodId = record.methodId?.trim() || `DEP-${this.nextSequence++}`;
    const created: MasterManagementDepreciationMethodItem = { ...record, methodId };
    this.records.push(created);
    return created;
  }

  updateRecord(methodId: string, changes: MasterManagementDepreciationMethodItem): void {
    const index = this.records.findIndex((r) => r.methodId === methodId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(methodIds: string[]): void {
    for (const id of methodIds) {
      const index = this.records.findIndex((r) => r.methodId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementDepreciationMethodItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
