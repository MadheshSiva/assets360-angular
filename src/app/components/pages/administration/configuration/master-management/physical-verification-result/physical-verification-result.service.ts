import { Injectable } from '@angular/core';
import {
  MasterManagementPhysicalVerificationResultItem,
  PhysicalVerificationRequiresAction,
  PhysicalVerificationResultCategory,
  PhysicalVerificationResultStatus
} from './physical-verification-result.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementPhysicalVerificationResultService {
  readonly resultCategoryMaster: PhysicalVerificationResultCategory[] = ['Positive', 'Negative', 'Exception'];
  readonly requiresActionMaster: PhysicalVerificationRequiresAction[] = ['Yes', 'No'];
  readonly statusMaster: PhysicalVerificationResultStatus[] = ['Active', 'Inactive'];

  private readonly records: MasterManagementPhysicalVerificationResultItem[] = [
    {
      resultId: 'PVR-1001',
      resultName: 'Matched',
      resultCode: 'MATCHED',
      description: 'Asset located and details match the register',
      resultCategory: 'Positive',
      requiresAction: 'No',
      status: 'Active'
    },
    {
      resultId: 'PVR-1002',
      resultName: 'Not Matched',
      resultCode: 'NOT_MATCHED',
      description: 'Asset located but details differ from the register',
      resultCategory: 'Negative',
      requiresAction: 'Yes',
      status: 'Active'
    },
    {
      resultId: 'PVR-1003',
      resultName: 'Missing',
      resultCode: 'MISSING',
      description: 'Asset could not be located at its recorded location',
      resultCategory: 'Exception',
      requiresAction: 'Yes',
      status: 'Active'
    },
    {
      resultId: 'PVR-1004',
      resultName: 'Damaged',
      resultCode: 'DAMAGED',
      description: 'Asset located but found to be damaged',
      resultCategory: 'Exception',
      requiresAction: 'Yes',
      status: 'Active'
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementPhysicalVerificationResultItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementPhysicalVerificationResultItem): MasterManagementPhysicalVerificationResultItem {
    const resultId = record.resultId?.trim() || `PVR-${this.nextSequence++}`;
    const created: MasterManagementPhysicalVerificationResultItem = { ...record, resultId };
    this.records.push(created);
    return created;
  }

  updateRecord(resultId: string, changes: MasterManagementPhysicalVerificationResultItem): void {
    const index = this.records.findIndex((r) => r.resultId === resultId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(resultIds: string[]): void {
    for (const id of resultIds) {
      const index = this.records.findIndex((r) => r.resultId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementPhysicalVerificationResultItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
