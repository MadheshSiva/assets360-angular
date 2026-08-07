import { Injectable } from '@angular/core';
import { InspectionTypeMasterItem } from './inspection-type.model';

@Injectable({ providedIn: 'root' })
export class InspectionTypeMasterService {
  readonly inspectionTypeNameMaster: string[] = [
    'Routine Inspection',
    'Safety Inspection',
    'Quality Inspection',
    'Compliance Inspection',
    'Pre-operation Inspection',
    'Post-maintenance Inspection',
    'Incident Inspection',
    'Condition Inspection',
    'Handover Inspection',
    'Audit Inspection'
  ];

  readonly defaultPriorityMaster: string[] = ['Low', 'Normal', 'High', 'Urgent', 'Emergency'];

  private readonly records: InspectionTypeMasterItem[] = [
    {
      inspectionTypeCode: 'ITY-1001',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      inspectionTypeName: 'Routine Inspection',
      description: 'Scheduled recurring inspection on a fixed cadence',
      defaultPriority: 'Normal',
      defaultApprovalWorkflow: 'Single-Level Approval',
      defaultReportTemplate: 'Standard Inspection Report',
      status: true
    },
    {
      inspectionTypeCode: 'ITY-1002',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      inspectionTypeName: 'Safety Inspection',
      description: 'Focused on safety hazards, PPE and fire systems',
      defaultPriority: 'High',
      defaultApprovalWorkflow: 'Two-Level Approval',
      defaultReportTemplate: 'Safety Inspection Report',
      status: true
    },
    {
      inspectionTypeCode: 'ITY-1003',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      inspectionTypeName: 'Compliance Inspection',
      description: 'Regulatory / statutory compliance check',
      defaultPriority: 'Urgent',
      defaultApprovalWorkflow: 'Three-Level Approval',
      defaultReportTemplate: 'Compliance Report',
      status: true
    },
    {
      inspectionTypeCode: 'ITY-1004',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      inspectionTypeName: 'Pre-operation Inspection',
      description: 'Performed before equipment is put into service',
      defaultPriority: 'High',
      defaultApprovalWorkflow: 'Single-Level Approval',
      defaultReportTemplate: 'Pre-op Checklist Report',
      status: true
    }
  ];

  private nextSequence = 1005;

  getRecords(): InspectionTypeMasterItem[] {
    return this.records;
  }

  addRecord(record: InspectionTypeMasterItem): InspectionTypeMasterItem {
    const inspectionTypeCode = record.inspectionTypeCode?.trim() || `ITY-${this.nextSequence++}`;
    const created: InspectionTypeMasterItem = { ...record, inspectionTypeCode };
    this.records.push(created);
    return created;
  }

  updateRecord(inspectionTypeCode: string, changes: InspectionTypeMasterItem): void {
    const index = this.records.findIndex((r) => r.inspectionTypeCode === inspectionTypeCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(inspectionTypeCodes: string[]): void {
    for (const id of inspectionTypeCodes) {
      const index = this.records.findIndex((r) => r.inspectionTypeCode === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionTypeMasterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
