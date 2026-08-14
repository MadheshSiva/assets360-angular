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
    },
    {
      categoryCode: 'TCAT-1005',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      categoryName: 'Measurement',
      description: 'Recording readings such as temperature, pressure or vibration',
      displayOrder: 5,
      status: true
    },
    {
      categoryCode: 'TCAT-1006',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      categoryName: 'Documentation',
      description: 'Capturing photos, notes and paperwork during inspection',
      displayOrder: 6,
      status: true
    },
    {
      categoryCode: 'TCAT-1007',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      categoryName: 'Compliance',
      description: 'Checks tied to regulatory or statutory requirements',
      displayOrder: 7,
      status: true
    },
    {
      categoryCode: 'TCAT-1008',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      categoryName: 'Cleaning',
      description: 'Cleaning and housekeeping tasks around the asset',
      displayOrder: 8,
      status: true
    },
    {
      categoryCode: 'TCAT-1009',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      categoryName: 'Mechanical',
      description: 'Mechanical component wear, alignment and lubrication checks',
      displayOrder: 9,
      status: true
    },
    {
      categoryCode: 'TCAT-1010',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      categoryName: 'Electrical',
      description: 'Electrical connection, wiring and panel checks',
      displayOrder: 10,
      status: true
    }
  ];

  private nextSequence = 1011;

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
