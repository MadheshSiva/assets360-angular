import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VendorAmcRecord } from './vendor-amc.model';

/**
 * Standalone data/master layer for the Vendor / AMC sub-module, kept independent of the
 * other Maintenance sub-modules so it can be pointed at its own backend microservice
 * (e.g. a procurement/contracts service) without touching the rest of the Maintenance
 * feature set.
 */
@Injectable({ providedIn: 'root' })
export class VendorAmcService {
  readonly vendorMaster: string[] = ['ABC Traders', 'Gulf Spares Co.', 'Prime Industrial Supplies'];
  readonly amcMaster: string[] = ['AMC-2026-001', 'AMC-2026-002', 'AMC-2026-003'];

  private readonly recordsSubject = new BehaviorSubject<VendorAmcRecord[]>([
    {
      vendorName: 'ABC Traders',
      contractId: 'AMC-2026-001',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      slaTerms: '24-hour response for critical faults',
      responseTime: 24,
      contactDetails: 'contracts@abctraders.com'
    },
    {
      vendorName: 'Gulf Spares Co.',
      contractId: 'AMC-2026-002',
      startDate: '2026-03-01',
      endDate: '2027-02-28',
      slaTerms: 'Next business day for standard requests',
      responseTime: 48,
      contactDetails: '+971-4-1234567'
    }
  ]);

  getRecords(): VendorAmcRecord[] {
    return this.recordsSubject.value;
  }

  addRecord(record: VendorAmcRecord): void {
    this.recordsSubject.next([...this.recordsSubject.value, record]);
  }

  updateRecord(original: VendorAmcRecord, changes: VendorAmcRecord): void {
    this.recordsSubject.next(
      this.recordsSubject.value.map((r) => (r === original ? { ...r, ...changes } : r))
    );
  }

  deleteRecords(items: VendorAmcRecord[]): void {
    this.recordsSubject.next(this.recordsSubject.value.filter((r) => !items.includes(r)));
  }

  search(term: string): VendorAmcRecord[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.recordsSubject.value;
    return this.recordsSubject.value.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
