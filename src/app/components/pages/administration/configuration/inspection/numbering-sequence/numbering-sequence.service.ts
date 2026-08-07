import { Injectable } from '@angular/core';
import { InspectionNumberingSequenceItem } from './numbering-sequence.model';

@Injectable({ providedIn: 'root' })
export class InspectionNumberingSequenceService {
  readonly numberTypeMaster: string[] = [
    'Work Order Number',
    'Inspection Number',
    'Report Number',
    'Defect Number',
    'Corrective Action Number',
    'Asset Number'
  ];

  readonly resetFrequencyMaster: string[] = ['Never', 'Yearly', 'Monthly', 'Daily'];

  private readonly records: InspectionNumberingSequenceItem[] = [
    {
      sequenceCode: 'NSEQ-1001',
      numberType: 'Work Order Number',
      prefix: 'WO-',
      suffix: '',
      financialYear: '2026-27',
      siteCode: 'DXB',
      departmentCode: '',
      runningNumber: 1042,
      resetFrequency: 'Yearly',
      samplePreview: 'WO-DXB-2026-01042',
      status: true
    },
    {
      sequenceCode: 'NSEQ-1002',
      numberType: 'Inspection Number',
      prefix: 'INS-',
      suffix: '',
      financialYear: '2026-27',
      siteCode: 'DXB',
      departmentCode: '',
      runningNumber: 587,
      resetFrequency: 'Yearly',
      samplePreview: 'INS-DXB-2026-00587',
      status: true
    },
    {
      sequenceCode: 'NSEQ-1003',
      numberType: 'Defect Number',
      prefix: 'DEF-',
      suffix: '',
      financialYear: '2026-27',
      siteCode: '',
      departmentCode: '',
      runningNumber: 213,
      resetFrequency: 'Yearly',
      samplePreview: 'DEF-2026-00213',
      status: true
    },
    {
      sequenceCode: 'NSEQ-1004',
      numberType: 'Asset Number',
      prefix: 'AST-',
      suffix: '',
      financialYear: '',
      siteCode: '',
      departmentCode: '',
      runningNumber: 3005,
      resetFrequency: 'Never',
      samplePreview: 'AST-03005',
      status: true
    }
  ];

  private nextSequence = 1005;

  getRecords(): InspectionNumberingSequenceItem[] {
    return this.records;
  }

  addRecord(record: InspectionNumberingSequenceItem): InspectionNumberingSequenceItem {
    const sequenceCode = record.sequenceCode?.trim() || `NSEQ-${this.nextSequence++}`;
    const created: InspectionNumberingSequenceItem = { ...record, sequenceCode };
    this.records.push(created);
    return created;
  }

  updateRecord(sequenceCode: string, changes: InspectionNumberingSequenceItem): void {
    const index = this.records.findIndex((r) => r.sequenceCode === sequenceCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(sequenceCodes: string[]): void {
    for (const id of sequenceCodes) {
      const index = this.records.findIndex((r) => r.sequenceCode === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionNumberingSequenceItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
