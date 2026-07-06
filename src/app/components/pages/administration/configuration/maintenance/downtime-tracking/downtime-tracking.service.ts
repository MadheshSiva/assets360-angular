import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DowntimeTrackingRecord } from './downtime-tracking.model';

/**
 * Standalone data/master layer for the Downtime Tracking sub-module, kept independent of
 * the other Maintenance sub-modules so it can be pointed at its own backend microservice
 * without touching the rest of the Maintenance feature set.
 */
@Injectable({ providedIn: 'root' })
export class DowntimeTrackingService {
  readonly reasonMaster: string[] = [
    'Equipment Failure',
    'Scheduled Maintenance',
    'Power Outage',
    'Operator Error',
    'Spare Part Unavailability'
  ];
  readonly impactLevelMaster: string[] = ['Low', 'Medium', 'High', 'Critical'];

  private readonly recordsSubject = new BehaviorSubject<DowntimeTrackingRecord[]>([
    {
      downtimeStart: '2026-06-15T14:00',
      downtimeEnd: '2026-06-15T15:30',
      totalDowntime: this.formatDuration('2026-06-15T14:00', '2026-06-15T15:30'),
      reasonForDowntime: 'Equipment Failure',
      impactLevel: 'High'
    },
    {
      downtimeStart: '2026-06-20T09:00',
      downtimeEnd: '2026-06-20T09:45',
      totalDowntime: this.formatDuration('2026-06-20T09:00', '2026-06-20T09:45'),
      reasonForDowntime: 'Scheduled Maintenance',
      impactLevel: 'Low'
    }
  ]);

  formatDuration(start: string, end: string): string {
    if (!start || !end) return '-';
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    if (isNaN(diffMs) || diffMs < 0) return '-';
    const hours = Math.floor(diffMs / 3_600_000);
    const minutes = Math.round((diffMs % 3_600_000) / 60_000);
    return `${hours}h ${minutes}m`;
  }

  getRecords(): DowntimeTrackingRecord[] {
    return this.recordsSubject.value;
  }

  addRecord(record: DowntimeTrackingRecord): void {
    this.recordsSubject.next([...this.recordsSubject.value, record]);
  }

  updateRecord(original: DowntimeTrackingRecord, changes: DowntimeTrackingRecord): void {
    this.recordsSubject.next(
      this.recordsSubject.value.map((r) => (r === original ? { ...r, ...changes } : r))
    );
  }

  deleteRecords(items: DowntimeTrackingRecord[]): void {
    this.recordsSubject.next(this.recordsSubject.value.filter((r) => !items.includes(r)));
  }

  search(term: string): DowntimeTrackingRecord[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.recordsSubject.value;
    return this.recordsSubject.value.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
