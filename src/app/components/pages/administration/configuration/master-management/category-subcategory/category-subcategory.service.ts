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
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      categoryName: 'Electrical',
      categoryCode: 'ELEC',
      description: 'Top-level electrical equipment category',
      level: 'Category',
      status: 'Active',
      relatedAssetId: ''
    },
    {
      categoryId: 'CAT-1002',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      categoryName: 'Wiring & Cabling',
      categoryCode: 'ELEC-WIR',
      description: 'Electrical wiring, cabling and associated connection accessories',
      level: 'Sub Category',
      status: 'Active',
      relatedAssetId: 'AST-2041'
    },
    {
      categoryId: 'CAT-1003',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      categoryName: 'Mechanical',
      categoryCode: 'MECH',
      description: 'Top-level mechanical equipment category',
      level: 'Category',
      status: 'Active',
      relatedAssetId: ''
    },
    {
      categoryId: 'CAT-1004',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      categoryName: 'Pumps & Motors',
      categoryCode: 'MECH-PMP',
      description: 'Rotating equipment including pumps, motors and drives',
      level: 'Sub Category',
      status: 'Inactive',
      relatedAssetId: 'AST-2078'
    },
    {
      categoryId: 'CAT-1005',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      categoryName: 'Safety',
      categoryCode: 'SAFE',
      description: 'Top-level safety and fire protection equipment category',
      level: 'Category',
      status: 'Active',
      relatedAssetId: ''
    },
    {
      categoryId: 'CAT-1006',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      categoryName: 'IT',
      categoryCode: 'IT',
      description: 'Top-level information technology equipment category',
      level: 'Category',
      status: 'Active',
      relatedAssetId: ''
    },
    {
      categoryId: 'CAT-1007',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      categoryName: 'HVAC',
      categoryCode: 'MECH-HVAC',
      description: 'Heating, ventilation and air conditioning equipment',
      level: 'Sub Category',
      status: 'Active',
      relatedAssetId: 'AST-2114'
    },
    {
      categoryId: 'CAT-1008',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      categoryName: 'Plumbing',
      categoryCode: 'MECH-PLB',
      description: 'Plumbing fixtures, piping and water distribution equipment',
      level: 'Sub Category',
      status: 'Active',
      relatedAssetId: ''
    },
    {
      categoryId: 'CAT-1009',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      categoryName: 'Fire Detection',
      categoryCode: 'SAFE-FIRE',
      description: 'Fire alarm panels, detectors and associated safety equipment',
      level: 'Sub Category',
      status: 'Active',
      relatedAssetId: ''
    },
    {
      categoryId: 'CAT-1010',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      categoryName: 'Power Distribution',
      categoryCode: 'ELEC-PWR',
      description: 'Distribution panels, transformers and power routing equipment',
      level: 'Sub Category',
      status: 'Active',
      relatedAssetId: 'AST-2041'
    },
    {
      categoryId: 'CAT-1011',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      categoryName: 'Network',
      categoryCode: 'IT-NET',
      description: 'Networking equipment including switches, routers and access points',
      level: 'Sub Category',
      status: 'Active',
      relatedAssetId: ''
    }
  ];

  private nextSequence = 1012;

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
