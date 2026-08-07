import { Injectable } from '@angular/core';
import { InspectionManufacturerItem } from './manufacturer.model';

@Injectable({ providedIn: 'root' })
export class InspectionManufacturerService {
  private readonly records: InspectionManufacturerItem[] = [
    {
      manufacturerCode: 'MFR-1001',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      manufacturerName: 'Carrier Corporation',
      contactPerson: 'Tom Reyes',
      email: 'tom.reyes@carrier.com',
      phone: '+1-800-555-0142',
      address: '13995 Pasteur Blvd, Palm Beach Gardens, FL',
      website: 'https://www.carrier.com',
      status: true
    },
    {
      manufacturerCode: 'MFR-1002',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      manufacturerName: 'Siemens Energy AG',
      contactPerson: 'Lena Hoffmann',
      email: 'lena.hoffmann@siemens-energy.com',
      phone: '+49-89-555-0187',
      address: 'Otto-Hahn-Ring 6, Munich, Germany',
      website: 'https://www.siemens-energy.com',
      status: true
    },
    {
      manufacturerCode: 'MFR-1003',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      manufacturerName: 'Kirloskar Pumps Ltd.',
      contactPerson: 'Ravi Deshmukh',
      email: 'ravi.deshmukh@kirloskar.com',
      phone: '+91-20-555-0199',
      address: 'Udyog Bhavan, Pune, India',
      website: 'https://www.kirloskarpumps.com',
      status: false
    }
  ];

  private nextSequence = 1004;

  getRecords(): InspectionManufacturerItem[] {
    return this.records;
  }

  addRecord(record: InspectionManufacturerItem): InspectionManufacturerItem {
    const manufacturerCode = record.manufacturerCode?.trim() || `MFR-${this.nextSequence++}`;
    const created: InspectionManufacturerItem = { ...record, manufacturerCode };
    this.records.push(created);
    return created;
  }

  updateRecord(manufacturerCode: string, changes: InspectionManufacturerItem): void {
    const index = this.records.findIndex((r) => r.manufacturerCode === manufacturerCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(manufacturerCodes: string[]): void {
    for (const id of manufacturerCodes) {
      const index = this.records.findIndex((r) => r.manufacturerCode === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionManufacturerItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
