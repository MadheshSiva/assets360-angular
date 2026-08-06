import { Injectable } from '@angular/core';
import { MasterManagementUnitMasterItem } from './unit-master.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementUnitMasterService {
  private readonly records: MasterManagementUnitMasterItem[] = [
    {
      unitId: 'UNT-1001',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      unitName: 'Kilogram',
      symbol: 'kg',
      isActive: true
    },
    {
      unitId: 'UNT-1002',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      unitName: 'Meter',
      symbol: 'm',
      isActive: true
    },
    {
      unitId: 'UNT-1003',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      unitName: 'Liter',
      symbol: 'L',
      isActive: true
    },
    {
      unitId: 'UNT-1004',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      unitName: 'Piece',
      symbol: 'pcs',
      isActive: true
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementUnitMasterItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementUnitMasterItem): MasterManagementUnitMasterItem {
    const unitId = record.unitId?.trim() || `UNT-${this.nextSequence++}`;
    const created: MasterManagementUnitMasterItem = { ...record, unitId };
    this.records.push(created);
    return created;
  }

  updateRecord(unitId: string, changes: MasterManagementUnitMasterItem): void {
    const index = this.records.findIndex((r) => r.unitId === unitId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(unitIds: string[]): void {
    for (const id of unitIds) {
      const index = this.records.findIndex((r) => r.unitId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementUnitMasterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
