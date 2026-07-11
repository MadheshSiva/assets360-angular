import { Injectable } from '@angular/core';
import { CategoryLevel, CategoryStatus, MasterManagementCategorySubcategoryItem } from './category-subcategory.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementCategorySubcategoryService {
  readonly levelMaster: CategoryLevel[] = ['Category', 'Sub Category'];
  readonly statusMaster: CategoryStatus[] = ['Active', 'Inactive'];

  readonly assetMaster: { assetId: string; assetName: string }[] = [
    { assetId: 'AST-2041', assetName: 'Main Distribution Panel - Building A' },
    { assetId: 'AST-2078', assetName: 'Centrifugal Pump P-101' },
    { assetId: 'AST-2114', assetName: 'HVAC Chiller Unit 1' },
    { assetId: 'AST-2159', assetName: 'Backup Generator Set' }
  ];

  private readonly records: MasterManagementCategorySubcategoryItem[] = [
    {
      categoryId: 'CAT-1001',
      categoryName: 'Electrical',
      categoryCode: 'ELEC',
      description: 'Top-level electrical equipment category',
      level: 'Category',
      status: 'Active',
      relatedAssetId: ''
    },
    {
      categoryId: 'CAT-1002',
      categoryName: 'Wiring & Cabling',
      categoryCode: 'ELEC-WIR',
      description: 'Electrical wiring, cabling and associated connection accessories',
      level: 'Sub Category',
      status: 'Active',
      relatedAssetId: 'AST-2041'
    },
    {
      categoryId: 'CAT-1003',
      categoryName: 'Mechanical',
      categoryCode: 'MECH',
      description: 'Top-level mechanical equipment category',
      level: 'Category',
      status: 'Active',
      relatedAssetId: ''
    },
    {
      categoryId: 'CAT-1004',
      categoryName: 'Pumps & Motors',
      categoryCode: 'MECH-PMP',
      description: 'Rotating equipment including pumps, motors and drives',
      level: 'Sub Category',
      status: 'Inactive',
      relatedAssetId: 'AST-2078'
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementCategorySubcategoryItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementCategorySubcategoryItem): MasterManagementCategorySubcategoryItem {
    const categoryId = record.categoryId?.trim() || `CAT-${this.nextSequence++}`;
    const created: MasterManagementCategorySubcategoryItem = { ...record, categoryId };
    this.records.push(created);
    return created;
  }

  updateRecord(categoryId: string, changes: MasterManagementCategorySubcategoryItem): void {
    const index = this.records.findIndex((r) => r.categoryId === categoryId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(categoryIds: string[]): void {
    for (const id of categoryIds) {
      const index = this.records.findIndex((r) => r.categoryId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementCategorySubcategoryItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
