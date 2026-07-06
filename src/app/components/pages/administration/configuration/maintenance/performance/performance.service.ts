import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PerformanceMetricRecord } from './performance.model';

/**
 * Standalone data/master layer for the Performance Metrics sub-module, kept independent
 * of the other Maintenance sub-modules so it can be pointed at its own backend analytics
 * microservice without touching the rest of the Maintenance feature set.
 */
@Injectable({ providedIn: 'root' })
export class PerformanceService {
  readonly assetMaster: { id: string; name: string }[] = [
    { id: 'AST-1001', name: 'HVAC Unit 1' },
    { id: 'AST-1002', name: 'Fire Panel A' },
    { id: 'AST-1003', name: 'Chiller Pump 2' }
  ];

  private readonly recordsSubject = new BehaviorSubject<PerformanceMetricRecord[]>([
    {
      assetId: 'AST-1001',
      mtbf: 720,
      mttr: 4,
      assetUptimePercent: 98.5,
      maintenanceFrequency: 2
    },
    {
      assetId: 'AST-1002',
      mtbf: 480,
      mttr: 6,
      assetUptimePercent: 96.2,
      maintenanceFrequency: 3
    }
  ]);

  getRecords(): PerformanceMetricRecord[] {
    return this.recordsSubject.value;
  }

  assetName(assetId: string): string {
    return this.assetMaster.find((a) => a.id === assetId)?.name ?? assetId;
  }

  addRecord(record: PerformanceMetricRecord): void {
    this.recordsSubject.next([...this.recordsSubject.value, record]);
  }

  updateRecord(original: PerformanceMetricRecord, changes: PerformanceMetricRecord): void {
    this.recordsSubject.next(
      this.recordsSubject.value.map((r) => (r === original ? { ...r, ...changes } : r))
    );
  }

  deleteRecords(items: PerformanceMetricRecord[]): void {
    this.recordsSubject.next(this.recordsSubject.value.filter((r) => !items.includes(r)));
  }

  search(term: string): PerformanceMetricRecord[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.recordsSubject.value;
    return this.recordsSubject.value.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
