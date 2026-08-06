import { Injectable } from '@angular/core';
import { MasterManagementSeverityMasterItem, SeverityLevel } from './severity-master.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementSeverityMasterService {
  readonly severityNameMaster: SeverityLevel[] = ['Low', 'Medium', 'High', 'Critical'];

  private readonly records: MasterManagementSeverityMasterItem[] = [
    {
      severityId: 'SEV-1001',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      severityName: 'Low',
      colorCode: '#1e7e34'
    },
    {
      severityId: 'SEV-1002',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      severityName: 'Medium',
      colorCode: '#b8860b'
    },
    {
      severityId: 'SEV-1003',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      severityName: 'High',
      colorCode: '#c0491f'
    },
    {
      severityId: 'SEV-1004',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      severityName: 'Critical',
      colorCode: '#c0221f'
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementSeverityMasterItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementSeverityMasterItem): MasterManagementSeverityMasterItem {
    const severityId = record.severityId?.trim() || `SEV-${this.nextSequence++}`;
    const created: MasterManagementSeverityMasterItem = { ...record, severityId };
    this.records.push(created);
    return created;
  }

  updateRecord(severityId: string, changes: MasterManagementSeverityMasterItem): void {
    const index = this.records.findIndex((r) => r.severityId === severityId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(severityIds: string[]): void {
    for (const id of severityIds) {
      const index = this.records.findIndex((r) => r.severityId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementSeverityMasterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
