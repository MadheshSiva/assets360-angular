import { Injectable } from '@angular/core';
import { InspectionFailureReasonItem } from './failure-reason.model';

@Injectable({ providedIn: 'root' })
export class InspectionFailureReasonService {
  readonly failureCategoryMaster: string[] = ['Mechanical', 'Electrical', 'Operator Error', 'Wear and Tear', 'Environmental', 'Software', 'Unknown'];
  readonly severityMaster: string[] = ['Informational', 'Low', 'Medium', 'High', 'Critical'];

  private readonly records: InspectionFailureReasonItem[] = [
    {
      failureReasonCode: 'FR-1001',
      failureReason: 'Worn seal / gasket',
      failureCategory: 'Wear and Tear',
      severity: 'Medium',
      correctiveActionRequired: true,
      escalationRequired: false,
      defaultResponsibleTeam: 'HVAC & Mechanical',
      status: true
    },
    {
      failureReasonCode: 'FR-1002',
      failureReason: 'Electrical short circuit',
      failureCategory: 'Electrical',
      severity: 'High',
      correctiveActionRequired: true,
      escalationRequired: true,
      defaultResponsibleTeam: 'Electrical Maintenance',
      status: true
    },
    {
      failureReasonCode: 'FR-1003',
      failureReason: 'Operator mis-operation',
      failureCategory: 'Operator Error',
      severity: 'Low',
      correctiveActionRequired: false,
      escalationRequired: false,
      defaultResponsibleTeam: 'Safety & Compliance',
      status: true
    }
  ];

  private nextSequence = 1004;

  getRecords(): InspectionFailureReasonItem[] {
    return this.records;
  }

  addRecord(record: InspectionFailureReasonItem): InspectionFailureReasonItem {
    const failureReasonCode = record.failureReasonCode?.trim() || `FR-${this.nextSequence++}`;
    const created: InspectionFailureReasonItem = { ...record, failureReasonCode };
    this.records.push(created);
    return created;
  }

  updateRecord(failureReasonCode: string, changes: InspectionFailureReasonItem): void {
    const index = this.records.findIndex((r) => r.failureReasonCode === failureReasonCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(failureReasonCodes: string[]): void {
    for (const code of failureReasonCodes) {
      const index = this.records.findIndex((r) => r.failureReasonCode === code);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionFailureReasonItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
