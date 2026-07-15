import { Injectable } from '@angular/core';
import {
  AuditorCertificationType,
  AuditorDepartment,
  AuditorStatus,
  MasterManagementAuditorDetailsItem
} from './auditor-details.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementAuditorDetailsService {
  readonly departmentMaster: AuditorDepartment[] = ['Finance', 'Operations', 'IT', 'Facilities', 'Compliance'];
  readonly certificationTypeMaster: AuditorCertificationType[] = [
    'Internal Auditor',
    'ISO 9001 Lead Auditor',
    'ISO 27001 Lead Auditor',
    'Certified Fraud Examiner',
    'CPA'
  ];
  readonly statusMaster: AuditorStatus[] = ['Active', 'Inactive'];

  private readonly records: MasterManagementAuditorDetailsItem[] = [
    {
      auditorId: 'AUD-1001',
      auditorName: 'Fatima Al Suwaidi',
      employeeCode: 'EMP-2031',
      department: 'Compliance',
      email: 'fatima.alsuwaidi@purpleiq.ai',
      phone: '+971 50 111 2233',
      certificationType: 'ISO 9001 Lead Auditor',
      status: 'Active'
    },
    {
      auditorId: 'AUD-1002',
      auditorName: 'Rahul Menon',
      employeeCode: 'EMP-2044',
      department: 'IT',
      email: 'rahul.menon@purpleiq.ai',
      phone: '+971 50 222 3344',
      certificationType: 'ISO 27001 Lead Auditor',
      status: 'Active'
    },
    {
      auditorId: 'AUD-1003',
      auditorName: 'Sara Al Marzooqi',
      employeeCode: 'EMP-2059',
      department: 'Finance',
      email: 'sara.almarzooqi@purpleiq.ai',
      phone: '+971 50 333 4455',
      certificationType: 'CPA',
      status: 'Inactive'
    }
  ];

  private nextSequence = 1004;

  getRecords(): MasterManagementAuditorDetailsItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementAuditorDetailsItem): MasterManagementAuditorDetailsItem {
    const auditorId = record.auditorId?.trim() || `AUD-${this.nextSequence++}`;
    const created: MasterManagementAuditorDetailsItem = { ...record, auditorId };
    this.records.push(created);
    return created;
  }

  updateRecord(auditorId: string, changes: MasterManagementAuditorDetailsItem): void {
    const index = this.records.findIndex((r) => r.auditorId === auditorId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(auditorIds: string[]): void {
    for (const id of auditorIds) {
      const index = this.records.findIndex((r) => r.auditorId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementAuditorDetailsItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
