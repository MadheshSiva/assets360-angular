import { Injectable } from '@angular/core';
import { InspectionDefectItem } from './defect.model';

@Injectable({ providedIn: 'root' })
export class InspectionDefectService {
  readonly defectCategoryMaster: string[] = ['Mechanical', 'Electrical', 'Structural', 'Safety', 'Cosmetic', 'Software'];
  readonly severityMaster: string[] = ['Informational', 'Low', 'Medium', 'High', 'Critical'];
  readonly riskRatingMaster: string[] = ['Low', 'Medium', 'High'];

  private readonly records: InspectionDefectItem[] = [
    {
      defectCode: 'DEF-1001',
      defectName: 'Corroded mounting bracket',
      defectCategory: 'Mechanical',
      description: 'Bracket shows surface corrosion affecting structural support',
      severity: 'Medium',
      riskRating: 'Medium',
      recommendedCorrectiveAction: 'Replace bracket and repaint',
      defaultResolutionPeriod: '14 days',
      status: true
    },
    {
      defectCode: 'DEF-1002',
      defectName: 'Exposed wiring',
      defectCategory: 'Electrical',
      description: 'Insulation damage exposing live wire',
      severity: 'Critical',
      riskRating: 'High',
      recommendedCorrectiveAction: 'Re-insulate and secure wiring immediately',
      defaultResolutionPeriod: '1 day',
      status: true
    },
    {
      defectCode: 'DEF-1003',
      defectName: 'Faded safety signage',
      defectCategory: 'Cosmetic',
      description: 'Warning label text no longer legible',
      severity: 'Low',
      riskRating: 'Low',
      recommendedCorrectiveAction: 'Replace signage',
      defaultResolutionPeriod: '30 days',
      status: true
    }
  ];

  private nextSequence = 1004;

  getRecords(): InspectionDefectItem[] {
    return this.records;
  }

  addRecord(record: InspectionDefectItem): InspectionDefectItem {
    const defectCode = record.defectCode?.trim() || `DEF-${this.nextSequence++}`;
    const created: InspectionDefectItem = { ...record, defectCode };
    this.records.push(created);
    return created;
  }

  updateRecord(defectCode: string, changes: InspectionDefectItem): void {
    const index = this.records.findIndex((r) => r.defectCode === defectCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(defectCodes: string[]): void {
    for (const code of defectCodes) {
      const index = this.records.findIndex((r) => r.defectCode === code);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionDefectItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
