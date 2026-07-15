import { Injectable } from '@angular/core';
import { MasterManagementIssueTypeMasterItem, IssueCategory } from './issue-type-master.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementIssueTypeMasterService {
  readonly categoryMaster: IssueCategory[] = ['Technical', 'Resource', 'Material', 'External'];

  private readonly records: MasterManagementIssueTypeMasterItem[] = [
    {
      issueTypeId: 'ISS-1001',
      issueTypeName: 'Equipment Malfunction',
      category: 'Technical',
      isActive: true
    },
    {
      issueTypeId: 'ISS-1002',
      issueTypeName: 'Manpower Shortage',
      category: 'Resource',
      isActive: true
    },
    {
      issueTypeId: 'ISS-1003',
      issueTypeName: 'Material Unavailability',
      category: 'Material',
      isActive: true
    },
    {
      issueTypeId: 'ISS-1004',
      issueTypeName: 'Weather Delay',
      category: 'External',
      isActive: true
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementIssueTypeMasterItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementIssueTypeMasterItem): MasterManagementIssueTypeMasterItem {
    const issueTypeId = record.issueTypeId?.trim() || `ISS-${this.nextSequence++}`;
    const created: MasterManagementIssueTypeMasterItem = { ...record, issueTypeId };
    this.records.push(created);
    return created;
  }

  updateRecord(issueTypeId: string, changes: MasterManagementIssueTypeMasterItem): void {
    const index = this.records.findIndex((r) => r.issueTypeId === issueTypeId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(issueTypeIds: string[]): void {
    for (const id of issueTypeIds) {
      const index = this.records.findIndex((r) => r.issueTypeId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementIssueTypeMasterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
