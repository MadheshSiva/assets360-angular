import { Injectable } from '@angular/core';
import { InspectionBusinessUnitItem } from './business-unit.model';

@Injectable({ providedIn: 'root' })
export class InspectionBusinessUnitService {
  readonly organizationMaster: string[] = [
    'PurpleIQ Global Holdings',
    'Northbridge Manufacturing Inc.',
    'Meridian Facilities Ltd.'
  ];

  private readonly records: InspectionBusinessUnitItem[] = [
    {
      businessUnitCode: 'BU-1001',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      businessUnitName: 'Facilities Operations',
      organization: 'PurpleIQ Global Holdings',
      description: 'Manages day-to-day facility operations across all sites',
      businessUnitHead: 'Sarah Al Farsi',
      email: 'facilities.ops@purpleiq.com',
      phone: '+971-4-555-0102',
      status: true
    },
    {
      businessUnitCode: 'BU-1002',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      businessUnitName: 'Manufacturing Plants',
      organization: 'Northbridge Manufacturing Inc.',
      description: 'Oversees production plant operations and equipment uptime',
      businessUnitHead: 'James Carter',
      email: 'mfg.plants@northbridge.com',
      phone: '+1-212-555-0111',
      status: true
    },
    {
      businessUnitCode: 'BU-1003',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      businessUnitName: 'Retail & Warehousing',
      organization: 'Meridian Facilities Ltd.',
      description: 'Handles retail store and warehouse asset upkeep',
      businessUnitHead: 'Wei Ling Tan',
      email: 'retail.wh@meridianfac.sg',
      phone: '+65-6555-0124',
      status: false
    }
  ];

  private nextSequence = 1004;

  getRecords(): InspectionBusinessUnitItem[] {
    return this.records;
  }

  addRecord(record: InspectionBusinessUnitItem): InspectionBusinessUnitItem {
    const businessUnitCode = record.businessUnitCode?.trim() || `BU-${this.nextSequence++}`;
    const created: InspectionBusinessUnitItem = { ...record, businessUnitCode };
    this.records.push(created);
    return created;
  }

  updateRecord(businessUnitCode: string, changes: InspectionBusinessUnitItem): void {
    const index = this.records.findIndex((r) => r.businessUnitCode === businessUnitCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(businessUnitCodes: string[]): void {
    for (const code of businessUnitCodes) {
      const index = this.records.findIndex((r) => r.businessUnitCode === code);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionBusinessUnitItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
