import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ComplianceInspectionRecord } from './compliance-inspection.model';

/**
 * Standalone data/master layer for the Compliance & Inspection sub-module, kept
 * independent of the other Maintenance sub-modules so it can be pointed at its own
 * backend microservice without touching the rest of the Maintenance feature set.
 */
@Injectable({ providedIn: 'root' })
export class ComplianceInspectionService {
  readonly inspectionTypeMaster: string[] = [
    'Safety Inspection',
    'Quality Inspection',
    'Regulatory Compliance',
    'Fire Safety Audit',
    'Electrical Safety Audit'
  ];

  readonly checklistMaster: string[] = [
    'Fire Safety Checklist',
    'Electrical Safety Checklist',
    'Equipment Safety Checklist',
    'Environmental Compliance Checklist'
  ];

  readonly inspectorMaster: string[] = ['John Mathew', 'Ali Hassan', 'Priya Nair', 'Site Supervisor'];
  readonly resultMaster: string[] = ['Pass', 'Fail'];

  private readonly recordsSubject = new BehaviorSubject<ComplianceInspectionRecord[]>([
    {
      inspectionId: 'INS-4001',
      inspectionType: 'Fire Safety Audit',
      checklist: 'Fire Safety Checklist',
      inspectorName: 'Ali Hassan',
      result: 'Pass',
      remarks: 'All fire extinguishers within service date.',
      nextInspectionDate: '2026-12-01'
    },
    {
      inspectionId: 'INS-4002',
      inspectionType: 'Electrical Safety Audit',
      checklist: 'Electrical Safety Checklist',
      inspectorName: 'Priya Nair',
      result: 'Fail',
      remarks: 'Exposed wiring found near Panel B, re-inspection required.',
      nextInspectionDate: '2026-07-20'
    }
  ]);

  private nextSequence = 4003;

  getRecords(): ComplianceInspectionRecord[] {
    return this.recordsSubject.value;
  }

  addRecord(record: ComplianceInspectionRecord): ComplianceInspectionRecord {
    const inspectionId = record.inspectionId || `INS-${this.nextSequence++}`;
    const created: ComplianceInspectionRecord = { ...record, inspectionId };
    this.recordsSubject.next([...this.recordsSubject.value, created]);
    return created;
  }

  updateRecord(inspectionId: string, changes: ComplianceInspectionRecord): void {
    this.recordsSubject.next(
      this.recordsSubject.value.map((r) => (r.inspectionId === inspectionId ? { ...r, ...changes } : r))
    );
  }

  deleteRecords(inspectionIds: string[]): void {
    this.recordsSubject.next(this.recordsSubject.value.filter((r) => !inspectionIds.includes(r.inspectionId)));
  }

  search(term: string): ComplianceInspectionRecord[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.recordsSubject.value;
    return this.recordsSubject.value.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
