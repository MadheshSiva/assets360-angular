import { Injectable } from '@angular/core';
import {
  MasterManagementUpdateSourceMasterItem,
  UpdateSourceType
} from './update-source-master.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementUpdateSourceMasterService {
  readonly sourceNameMaster: UpdateSourceType[] = ['Manual', 'IoT', 'API'];

  private readonly records: MasterManagementUpdateSourceMasterItem[] = [
    {
      sourceId: 'SRC-1001',
      sourceName: 'Manual',
      description: 'Manually entered or updated by an operator'
    },
    {
      sourceId: 'SRC-1002',
      sourceName: 'IoT',
      description: 'Streamed automatically from IoT sensors and devices'
    },
    {
      sourceId: 'SRC-1003',
      sourceName: 'API',
      description: 'Synced via an external API integration'
    }
  ];

  private nextSequence = 1004;

  getRecords(): MasterManagementUpdateSourceMasterItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementUpdateSourceMasterItem): MasterManagementUpdateSourceMasterItem {
    const sourceId = record.sourceId?.trim() || `SRC-${this.nextSequence++}`;
    const created: MasterManagementUpdateSourceMasterItem = { ...record, sourceId };
    this.records.push(created);
    return created;
  }

  updateRecord(sourceId: string, changes: MasterManagementUpdateSourceMasterItem): void {
    const index = this.records.findIndex((r) => r.sourceId === sourceId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(sourceIds: string[]): void {
    for (const id of sourceIds) {
      const index = this.records.findIndex((r) => r.sourceId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementUpdateSourceMasterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
