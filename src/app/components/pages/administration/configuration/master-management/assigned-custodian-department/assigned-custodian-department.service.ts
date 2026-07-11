import { Injectable } from '@angular/core';
import {
  CustodianDepartmentStatus,
  CustodianDepartmentType,
  MasterManagementCustodianDepartmentItem
} from './assigned-custodian-department.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementCustodianDepartmentService {
  readonly recordTypeMaster: CustodianDepartmentType[] = ['Department', 'Custodian'];
  readonly statusMaster: CustodianDepartmentStatus[] = ['Active', 'Inactive'];

  private readonly records: MasterManagementCustodianDepartmentItem[] = [
    {
      recordType: 'Department',
      id: 'DEP-1001',
      name: 'Maintenance',
      description: 'Department responsible for equipment upkeep and repairs',
      status: 'Active',
      role: '',
      departmentCode: 'MAINT'
    },
    {
      recordType: 'Department',
      id: 'DEP-1002',
      name: 'Facilities',
      description: 'Department responsible for building and premises management',
      status: 'Active',
      role: '',
      departmentCode: 'FAC'
    },
    {
      recordType: 'Custodian',
      id: 'CUS-1001',
      name: 'Rajesh Kumar',
      description: 'Custodian accountable for maintenance assets',
      status: 'Active',
      role: 'Maintenance Supervisor',
      departmentCode: 'MAINT'
    },
    {
      recordType: 'Custodian',
      id: 'CUS-1002',
      name: 'Priya Sharma',
      description: 'Custodian accountable for facilities assets',
      status: 'Inactive',
      role: 'Facilities Manager',
      departmentCode: 'FAC'
    }
  ];

  private nextSequence = 1003;

  getRecords(): MasterManagementCustodianDepartmentItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementCustodianDepartmentItem): MasterManagementCustodianDepartmentItem {
    const prefix = record.recordType === 'Department' ? 'DEP' : 'CUS';
    const id = record.id?.trim() || `${prefix}-${this.nextSequence++}`;
    const created: MasterManagementCustodianDepartmentItem = { ...record, id };
    this.records.push(created);
    return created;
  }

  updateRecord(id: string, changes: MasterManagementCustodianDepartmentItem): void {
    const index = this.records.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(ids: string[]): void {
    for (const id of ids) {
      const index = this.records.findIndex((r) => r.id === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementCustodianDepartmentItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
