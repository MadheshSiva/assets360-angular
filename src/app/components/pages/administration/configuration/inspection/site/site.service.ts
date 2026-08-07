import { Injectable } from '@angular/core';
import { InspectionSiteItem } from './site.model';

@Injectable({ providedIn: 'root' })
export class InspectionSiteService {
  readonly organizationMaster: string[] = ['PurpleIQ Global Holdings', 'Northbridge Manufacturing Inc.', 'Meridian Facilities Ltd.'];
  readonly businessUnitMaster: string[] = ['Facilities Operations', 'Manufacturing Plants', 'Retail & Warehousing'];
  readonly siteTypeMaster: string[] = ['Factory', 'Warehouse', 'Office', 'Retail Store', 'Data Center'];

  private readonly records: InspectionSiteItem[] = [
    {
      siteCode: 'SITE-1001',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      siteName: 'Dubai HQ Tower',
      organization: 'PurpleIQ Global Holdings',
      businessUnit: 'Facilities Operations',
      siteType: 'Office',
      address: '12 Marina Boulevard',
      country: 'UAE',
      state: 'Dubai',
      city: 'Dubai',
      gpsLatitude: '25.0772',
      gpsLongitude: '55.1382',
      siteManager: 'Sarah Al Farsi',
      contactDetails: '+971-4-555-0101',
      operatingHours: '08:00 - 20:00',
      status: true
    },
    {
      siteCode: 'SITE-1002',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      siteName: 'Northbridge Plant 3',
      organization: 'Northbridge Manufacturing Inc.',
      businessUnit: 'Manufacturing Plants',
      siteType: 'Factory',
      address: '480 Industrial Pkwy',
      country: 'USA',
      state: 'New York',
      city: 'New York',
      gpsLatitude: '40.7357',
      gpsLongitude: '-73.9905',
      siteManager: 'James Carter',
      contactDetails: '+1-212-555-0110',
      operatingHours: '06:00 - 22:00',
      status: true
    },
    {
      siteCode: 'SITE-1003',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      siteName: 'Meridian Warehouse 1',
      organization: 'Meridian Facilities Ltd.',
      businessUnit: 'Retail & Warehousing',
      siteType: 'Warehouse',
      address: '22 Orchard Road',
      country: 'Singapore',
      state: '-',
      city: 'Singapore',
      gpsLatitude: '1.3048',
      gpsLongitude: '103.8318',
      siteManager: 'Wei Ling Tan',
      contactDetails: '+65-6555-0123',
      operatingHours: '24 Hours',
      status: true
    }
  ];

  private nextSequence = 1004;

  getRecords(): InspectionSiteItem[] {
    return this.records;
  }

  addRecord(record: InspectionSiteItem): InspectionSiteItem {
    const siteCode = record.siteCode?.trim() || `SITE-${this.nextSequence++}`;
    const created: InspectionSiteItem = { ...record, siteCode };
    this.records.push(created);
    return created;
  }

  updateRecord(siteCode: string, changes: InspectionSiteItem): void {
    const index = this.records.findIndex((r) => r.siteCode === siteCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(siteCodes: string[]): void {
    for (const id of siteCodes) {
      const index = this.records.findIndex((r) => r.siteCode === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionSiteItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
