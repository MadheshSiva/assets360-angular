import { Injectable } from '@angular/core';
import { ChecklistItem } from './checklist-items.model';
import { ChecklistMasterService } from '../checklist-master/checklist-master.service';

@Injectable({ providedIn: 'root' })
export class ChecklistItemService {
  readonly responseTypeMaster: string[] = ['Yes/No', 'Numeric', 'Text', 'Image Upload'];

  constructor(private checklistMasterService: ChecklistMasterService) {}

  get checklistMaster() {
    return this.checklistMasterService.getChecklists();
  }

  private items: ChecklistItem[] = [
    {
      itemId: 'ITM-1001',
      checklistId: 'CHK-001',
      itemDescription: 'Verify circuit breaker is locked out / tagged out',
      responseType: 'Yes/No',
      thresholdValue: null,
      isCritical: true,
      sequenceOrder: 1
    },
    {
      itemId: 'ITM-1002',
      checklistId: 'CHK-001',
      itemDescription: 'Measure residual voltage at terminals',
      responseType: 'Numeric',
      thresholdValue: 0,
      isCritical: true,
      sequenceOrder: 2
    }
  ];

  private nextSequence = 1003;

  getItems(): ChecklistItem[] {
    return this.items;
  }

  addRecord(record: ChecklistItem): ChecklistItem {
    const itemId = record.itemId || `ITM-${this.nextSequence++}`;
    const created: ChecklistItem = { ...record, itemId };
    this.items = [...this.items, created];
    return created;
  }

  updateRecord(itemId: string, changes: ChecklistItem): void {
    this.items = this.items.map((i) => (i.itemId === itemId ? { ...i, ...changes } : i));
  }

  deleteRecords(itemIds: string[]): void {
    this.items = this.items.filter((i) => !itemIds.includes(i.itemId));
  }

  search(term: string): ChecklistItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.items;
    return this.items.filter((i) =>
      Object.values(i).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
