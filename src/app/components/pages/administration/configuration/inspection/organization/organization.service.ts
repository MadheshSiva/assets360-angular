import { Injectable } from '@angular/core';
import { InspectionOrganizationItem } from './organization.model';

@Injectable({ providedIn: 'root' })
export class InspectionOrganizationService {
  readonly timeZoneMaster: string[] = [
    'GMT+00:00 (UTC)',
    'GMT+04:00 (Dubai)',
    'GMT+05:30 (India)',
    'GMT-05:00 (New York)',
    'GMT+08:00 (Singapore)'
  ];

  readonly currencyMaster: string[] = ['USD', 'EUR', 'GBP', 'AED', 'INR', 'SGD'];

  readonly dateFormatMaster: string[] = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];

  private readonly records: InspectionOrganizationItem[] = [
    {
      organizationCode: 'ORG-1001',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      organizationName: 'PurpleIQ Global Holdings',
      legalName: 'PurpleIQ Global Holdings Pvt Ltd',
      logo: 'purpleiq-logo.png',
      address: '12 Marina Boulevard',
      country: 'UAE',
      state: 'Dubai',
      city: 'Dubai',
      postalCode: '00000',
      contactPerson: 'Sarah Al Farsi',
      email: 'sarah.alfarsi@purpleiq.com',
      phoneNumber: '+971-4-555-0101',
      timeZone: 'GMT+04:00 (Dubai)',
      dateFormat: 'DD/MM/YYYY',
      currency: 'AED',
      status: true
    },
    {
      organizationCode: 'ORG-1002',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      organizationName: 'Northbridge Manufacturing Inc.',
      legalName: 'Northbridge Manufacturing Incorporated',
      logo: 'northbridge-logo.png',
      address: '480 Industrial Pkwy',
      country: 'USA',
      state: 'New York',
      city: 'New York',
      postalCode: '10001',
      contactPerson: 'James Carter',
      email: 'james.carter@northbridge.com',
      phoneNumber: '+1-212-555-0110',
      timeZone: 'GMT-05:00 (New York)',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      status: true
    },
    {
      organizationCode: 'ORG-1003',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      organizationName: 'Meridian Facilities Ltd.',
      legalName: 'Meridian Facilities Limited',
      logo: 'meridian-logo.png',
      address: '22 Orchard Road',
      country: 'Singapore',
      state: '-',
      city: 'Singapore',
      postalCode: '238839',
      contactPerson: 'Wei Ling Tan',
      email: 'weiling.tan@meridianfac.sg',
      phoneNumber: '+65-6555-0123',
      timeZone: 'GMT+08:00 (Singapore)',
      dateFormat: 'YYYY-MM-DD',
      currency: 'SGD',
      status: false
    }
  ];

  private nextSequence = 1004;

  getRecords(): InspectionOrganizationItem[] {
    return this.records;
  }

  addRecord(record: InspectionOrganizationItem): InspectionOrganizationItem {
    const organizationCode = record.organizationCode?.trim() || `ORG-${this.nextSequence++}`;
    const created: InspectionOrganizationItem = { ...record, organizationCode };
    this.records.push(created);
    return created;
  }

  updateRecord(organizationCode: string, changes: InspectionOrganizationItem): void {
    const index = this.records.findIndex((r) => r.organizationCode === organizationCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(organizationCodes: string[]): void {
    for (const code of organizationCodes) {
      const index = this.records.findIndex((r) => r.organizationCode === code);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionOrganizationItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
