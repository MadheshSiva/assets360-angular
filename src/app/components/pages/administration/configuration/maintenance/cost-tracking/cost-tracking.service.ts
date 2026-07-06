import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CostTrackingRecord } from './cost-tracking.model';

/**
 * Standalone data layer for the Cost Tracking sub-module, kept independent of the other
 * Maintenance sub-modules so it can be pointed at its own backend microservice (e.g. a
 * finance/costing service) without touching the rest of the Maintenance feature set.
 */
@Injectable({ providedIn: 'root' })
export class CostTrackingService {
  private readonly recordsSubject = new BehaviorSubject<CostTrackingRecord[]>([
    {
      laborCost: 1200,
      sparePartsCost: 450,
      totalMaintenanceCost: 1650,
      budgetAllocation: 5000,
      costPerAsset: 275
    },
    {
      laborCost: 800,
      sparePartsCost: 300,
      totalMaintenanceCost: 1100,
      budgetAllocation: 3000,
      costPerAsset: 180
    }
  ]);

  getRecords(): CostTrackingRecord[] {
    return this.recordsSubject.value;
  }

  addRecord(record: CostTrackingRecord): void {
    this.recordsSubject.next([...this.recordsSubject.value, record]);
  }

  updateRecord(original: CostTrackingRecord, changes: CostTrackingRecord): void {
    this.recordsSubject.next(
      this.recordsSubject.value.map((r) => (r === original ? { ...r, ...changes } : r))
    );
  }

  deleteRecords(items: CostTrackingRecord[]): void {
    this.recordsSubject.next(this.recordsSubject.value.filter((r) => !items.includes(r)));
  }

  search(term: string): CostTrackingRecord[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.recordsSubject.value;
    return this.recordsSubject.value.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
