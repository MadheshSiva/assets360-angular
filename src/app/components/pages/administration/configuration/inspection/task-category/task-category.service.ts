import { Injectable } from '@angular/core';
import { InspectionTaskCategoryItem } from './task-category.model';

@Injectable({ providedIn: 'root' })
export class InspectionTaskCategoryService {
  readonly categoryNameMaster: string[] = [
    'Visual Inspection',
    'Safety',
    'Functional Test',
    'Measurement',
    'Documentation',
    'Compliance',
    'Cleaning',
    'Calibration',
    'Mechanical',
    'Electrical'
  ];

  private readonly records: InspectionTaskCategoryItem[] = [
    {
      categoryCode: 'TCAT-1001',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      categoryName: 'Visual Inspection',
      description: 'Visual check of asset condition and surroundings',
      displayOrder: 1,
      status: true
    },
    {
      categoryCode: 'TCAT-1002',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      categoryName: 'Safety',
      description: 'Checks tied to safety compliance and PPE',
      displayOrder: 2,
      status: true
    },
    {
      categoryCode: 'TCAT-1003',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      categoryName: 'Functional Test',
      description: 'Confirms the asset operates as expected',
      displayOrder: 3,
      status: true
    },
    {
      categoryCode: 'TCAT-1004',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      categoryName: 'Calibration',
      description: 'Instrument accuracy and calibration checks',
      displayOrder: 4,
      status: false
    }
  ];

  private nextSequence = 1005;

  getRecords(): InspectionTaskCategoryItem[] {
    return this.records;
  }

  addRecord(record: InspectionTaskCategoryItem): InspectionTaskCategoryItem {
    const categoryCode = record.categoryCode?.trim() || `TCAT-${this.nextSequence++}`;
    const created: InspectionTaskCategoryItem = { ...record, categoryCode };
    this.records.push(created);
    return created;
  }

  updateRecord(categoryCode: string, changes: InspectionTaskCategoryItem): void {
    const index = this.records.findIndex((r) => r.categoryCode === categoryCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(categoryCodes: string[]): void {
    for (const id of categoryCodes) {
      const index = this.records.findIndex((r) => r.categoryCode === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionTaskCategoryItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
