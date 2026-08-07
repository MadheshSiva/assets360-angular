import { Injectable } from '@angular/core';
import { InspectionDepartmentItem } from './department.model';

@Injectable({ providedIn: 'root' })
export class InspectionDepartmentService {
  readonly businessUnitMaster: string[] = [
    'Facilities Operations',
    'Manufacturing Plants',
    'Retail & Warehousing'
  ];

  private readonly records: InspectionDepartmentItem[] = [
    {
      departmentCode: 'DEPT-1001',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      departmentName: 'HVAC & Mechanical',
      businessUnit: 'Facilities Operations',
      departmentHead: 'David Smith',
      description: 'Handles HVAC, plumbing and mechanical asset upkeep',
      status: true
    },
    {
      departmentCode: 'DEPT-1002',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      departmentName: 'Electrical Maintenance',
      businessUnit: 'Manufacturing Plants',
      departmentHead: 'Anita Rao',
      description: 'Electrical systems and panel maintenance for plant floor',
      status: true
    },
    {
      departmentCode: 'DEPT-1003',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      departmentName: 'Safety & Compliance',
      businessUnit: 'Retail & Warehousing',
      departmentHead: 'Chen Wei',
      description: 'Fire safety, permits and compliance inspections',
      status: true
    }
  ];

  private nextSequence = 1004;

  getRecords(): InspectionDepartmentItem[] {
    return this.records;
  }

  addRecord(record: InspectionDepartmentItem): InspectionDepartmentItem {
    const departmentCode = record.departmentCode?.trim() || `DEPT-${this.nextSequence++}`;
    const created: InspectionDepartmentItem = { ...record, departmentCode };
    this.records.push(created);
    return created;
  }

  updateRecord(departmentCode: string, changes: InspectionDepartmentItem): void {
    const index = this.records.findIndex((r) => r.departmentCode === departmentCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(departmentCodes: string[]): void {
    for (const code of departmentCodes) {
      const index = this.records.findIndex((r) => r.departmentCode === code);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionDepartmentItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
