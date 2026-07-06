import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PreventiveMaintenanceRecord } from './preventive-maintenance.model';

/**
 * Standalone data/master layer for the Preventive Maintenance sub-module, kept independent
 * of the other Maintenance sub-modules so it can be pointed at its own backend microservice
 * without touching the rest of the Maintenance feature set.
 */
@Injectable({ providedIn: 'root' })
export class PreventiveMaintenanceService {
  readonly pmScheduleMaster: string[] = ['PM-SCH-001', 'PM-SCH-002', 'PM-SCH-003'];
  readonly frequencyMaster: string[] = ['Daily', 'Weekly', 'Monthly'];
  readonly triggerTypeMaster: string[] = ['Time-based', 'Usage-based'];
  readonly yesNoMaster: string[] = ['Yes', 'No'];

  private readonly recordsSubject = new BehaviorSubject<PreventiveMaintenanceRecord[]>([
    {
      pmScheduleId: 'PM-SCH-001',
      frequency: 'Monthly',
      triggerType: 'Time-based',
      lastMaintenanceDate: '2026-05-01',
      nextDueDate: '2026-06-01',
      autoCreateWorkOrder: 'Yes'
    },
    {
      pmScheduleId: 'PM-SCH-002',
      frequency: 'Weekly',
      triggerType: 'Usage-based',
      lastMaintenanceDate: '2026-06-20',
      nextDueDate: '2026-06-27',
      autoCreateWorkOrder: 'No'
    }
  ]);

  getRecords(): PreventiveMaintenanceRecord[] {
    return this.recordsSubject.value;
  }

  addRecord(record: PreventiveMaintenanceRecord): void {
    this.recordsSubject.next([...this.recordsSubject.value, record]);
  }

  updateRecord(original: PreventiveMaintenanceRecord, changes: PreventiveMaintenanceRecord): void {
    this.recordsSubject.next(
      this.recordsSubject.value.map((r) => (r === original ? { ...r, ...changes } : r))
    );
  }

  deleteRecords(items: PreventiveMaintenanceRecord[]): void {
    this.recordsSubject.next(this.recordsSubject.value.filter((r) => !items.includes(r)));
  }

  search(term: string): PreventiveMaintenanceRecord[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.recordsSubject.value;
    return this.recordsSubject.value.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
