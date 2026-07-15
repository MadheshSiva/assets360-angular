import { Injectable } from '@angular/core';
import { MasterManagementShiftMasterItem } from './shift-master.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementShiftMasterService {
  private readonly records: MasterManagementShiftMasterItem[] = [
    {
      shiftId: 'SHF-1001',
      shiftName: 'Morning Shift',
      startTime: '06:00',
      endTime: '14:00'
    },
    {
      shiftId: 'SHF-1002',
      shiftName: 'Afternoon Shift',
      startTime: '14:00',
      endTime: '22:00'
    },
    {
      shiftId: 'SHF-1003',
      shiftName: 'Night Shift',
      startTime: '22:00',
      endTime: '06:00'
    }
  ];

  private nextSequence = 1004;

  getRecords(): MasterManagementShiftMasterItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementShiftMasterItem): MasterManagementShiftMasterItem {
    const shiftId = record.shiftId?.trim() || `SHF-${this.nextSequence++}`;
    const created: MasterManagementShiftMasterItem = { ...record, shiftId };
    this.records.push(created);
    return created;
  }

  updateRecord(shiftId: string, changes: MasterManagementShiftMasterItem): void {
    const index = this.records.findIndex((r) => r.shiftId === shiftId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(shiftIds: string[]): void {
    for (const id of shiftIds) {
      const index = this.records.findIndex((r) => r.shiftId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementShiftMasterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
