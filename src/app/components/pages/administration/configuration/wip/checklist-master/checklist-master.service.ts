import { Injectable } from '@angular/core';
import { ChecklistMaster } from './checklist-master.model';

@Injectable({ providedIn: 'root' })
export class ChecklistMasterService {
  readonly checklistTypeMaster: string[] = ['Safety', 'Quality', 'Compliance', 'Maintenance', 'Inspection'];

  readonly workTypeMaster: string[] = ['Preventive', 'Corrective', 'Predictive', 'Inspection'];

  private readonly checklists: ChecklistMaster[] = [
    {
      checklistId: 'CHK-001',
      checklistName: 'Electrical Safety Checklist',
      checklistType: 'Safety',
      applicableWorkType: ['Preventive', 'Corrective'],
      versionNumber: 1,
      isMandatory: true
    },
    {
      checklistId: 'CHK-002',
      checklistName: 'Confined Space Checklist',
      checklistType: 'Safety',
      applicableWorkType: ['Corrective', 'Inspection'],
      versionNumber: 1,
      isMandatory: true
    }
  ];

  private nextSequence = 3;

  getChecklists(): ChecklistMaster[] {
    return this.checklists;
  }

  addRecord(record: ChecklistMaster): ChecklistMaster {
    const checklistId = record.checklistId || `CHK-${String(this.nextSequence++).padStart(3, '0')}`;
    const created: ChecklistMaster = { ...record, checklistId };
    this.checklists.push(created);
    return created;
  }

  updateRecord(checklistId: string, changes: ChecklistMaster): void {
    const index = this.checklists.findIndex((c) => c.checklistId === checklistId);
    if (index !== -1) {
      this.checklists[index] = { ...this.checklists[index], ...changes };
    }
  }

  deleteRecords(checklistIds: string[]): void {
    for (const id of checklistIds) {
      const index = this.checklists.findIndex((c) => c.checklistId === id);
      if (index !== -1) {
        this.checklists.splice(index, 1);
      }
    }
  }

  search(term: string): ChecklistMaster[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.checklists;
    return this.checklists.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
