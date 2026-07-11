import { Injectable } from '@angular/core';
import { MasterManagementTagIdItem } from './tag-ids.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementTagIdService {
  readonly tagTypeMaster: string[] = ['QR', 'RFID', 'BLE', 'GPS'];

  private readonly records: MasterManagementTagIdItem[] = [
    {
      tagId: 'TAG-1001',
      tagCode: 'RF-00231',
      tagType: 'RFID',
      assignedAssetCode: 'AST-2041',
      issueDate: '2025-03-14',
      isActive: true
    },
    {
      tagId: 'TAG-1002',
      tagCode: 'QR-10045',
      tagType: 'QR',
      assignedAssetCode: 'AST-2078',
      issueDate: '2025-04-02',
      isActive: true
    },
    {
      tagId: 'TAG-1003',
      tagCode: 'BLE-30021',
      tagType: 'BLE',
      assignedAssetCode: 'AST-2114',
      issueDate: '2025-05-19',
      isActive: false
    },
    {
      tagId: 'TAG-1004',
      tagCode: 'GPS-40587',
      tagType: 'GPS',
      assignedAssetCode: 'AST-2159',
      issueDate: '2025-06-27',
      isActive: true
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementTagIdItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementTagIdItem): MasterManagementTagIdItem {
    const tagId = record.tagId?.trim() || `TAG-${this.nextSequence++}`;
    const created: MasterManagementTagIdItem = { ...record, tagId };
    this.records.push(created);
    return created;
  }

  updateRecord(tagId: string, changes: MasterManagementTagIdItem): void {
    const index = this.records.findIndex((r) => r.tagId === tagId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(tagIds: string[]): void {
    for (const id of tagIds) {
      const index = this.records.findIndex((r) => r.tagId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementTagIdItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
