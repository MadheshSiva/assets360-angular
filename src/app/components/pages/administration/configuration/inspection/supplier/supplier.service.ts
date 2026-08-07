import { Injectable } from '@angular/core';
import { InspectionSupplierItem } from './supplier.model';

@Injectable({ providedIn: 'root' })
export class InspectionSupplierService {
  private readonly records: InspectionSupplierItem[] = [
    {
      supplierCode: 'SUP-1001',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      supplierName: 'Gulf Technical Supplies LLC',
      contactPerson: 'Faisal Hamdan',
      email: 'faisal.hamdan@gulftech.ae',
      phone: '+971-4-555-0155',
      address: 'Al Quoz Industrial Area, Dubai, UAE',
      contractReference: 'CNT-2024-0087',
      status: true
    },
    {
      supplierCode: 'SUP-1002',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      supplierName: 'Atlas Industrial Parts Co.',
      contactPerson: 'Maria Gonzalez',
      email: 'maria.gonzalez@atlasparts.com',
      phone: '+1-312-555-0166',
      address: '900 Freight St, Chicago, IL',
      contractReference: 'CNT-2023-0154',
      status: true
    },
    {
      supplierCode: 'SUP-1003',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      supplierName: 'Orient Spares Trading',
      contactPerson: 'Priya Nair',
      email: 'priya.nair@orientspares.sg',
      phone: '+65-6555-0177',
      address: '18 Tanjong Pagar Rd, Singapore',
      contractReference: 'CNT-2024-0021',
      status: true
    }
  ];

  private nextSequence = 1004;

  getRecords(): InspectionSupplierItem[] {
    return this.records;
  }

  addRecord(record: InspectionSupplierItem): InspectionSupplierItem {
    const supplierCode = record.supplierCode?.trim() || `SUP-${this.nextSequence++}`;
    const created: InspectionSupplierItem = { ...record, supplierCode };
    this.records.push(created);
    return created;
  }

  updateRecord(supplierCode: string, changes: InspectionSupplierItem): void {
    const index = this.records.findIndex((r) => r.supplierCode === supplierCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(supplierCodes: string[]): void {
    for (const id of supplierCodes) {
      const index = this.records.findIndex((r) => r.supplierCode === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionSupplierItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
