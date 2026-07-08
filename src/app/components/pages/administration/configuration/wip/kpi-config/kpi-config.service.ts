import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KpiConfig, KpiConfigRefreshFrequency, KpiConfigWidgetType } from './kpi-config.model';

@Injectable({ providedIn: 'root' })
export class KpiConfigService {
  readonly refreshFrequencyMaster: KpiConfigRefreshFrequency[] = [
    'Real-time',
    'Every 5 mins',
    'Every 15 mins',
    'Hourly',
    'Daily'
  ];

  readonly widgetTypeMaster: KpiConfigWidgetType[] = [
    'Line Chart',
    'Bar Chart',
    'Pie Chart',
    'Gauge',
    'Number Card',
    'Table'
  ];

  private readonly recordsSubject = new BehaviorSubject<KpiConfig[]>([
    {
      kpiId: 'KPI-1001',
      kpiName: 'SLA Compliance Rate',
      formulaDefinition: '(Jobs completed within SLA / Total jobs) * 100',
      thresholdGreen: 95,
      thresholdAmber: 85,
      thresholdRed: 70,
      refreshFrequency: 'Hourly',
      widgetType: 'Gauge'
    },
    {
      kpiId: 'KPI-1002',
      kpiName: 'Open Work Orders',
      formulaDefinition: 'COUNT(WorkOrders WHERE status != "Closed")',
      thresholdGreen: 10,
      thresholdAmber: 25,
      thresholdRed: 50,
      refreshFrequency: 'Real-time',
      widgetType: 'Number Card'
    }
  ]);

  private nextSequence = 1003;

  getRecords(): KpiConfig[] {
    return this.recordsSubject.value;
  }

  addRecord(record: KpiConfig): KpiConfig {
    const kpiId = record.kpiId || `KPI-${this.nextSequence++}`;
    const created: KpiConfig = { ...record, kpiId };
    this.recordsSubject.next([...this.recordsSubject.value, created]);
    return created;
  }

  updateRecord(kpiId: string, changes: KpiConfig): void {
    this.recordsSubject.next(
      this.recordsSubject.value.map((r) => (r.kpiId === kpiId ? { ...r, ...changes } : r))
    );
  }

  deleteRecords(kpiIds: string[]): void {
    this.recordsSubject.next(this.recordsSubject.value.filter((r) => !kpiIds.includes(r.kpiId)));
  }

  search(term: string): KpiConfig[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.recordsSubject.value;
    return this.recordsSubject.value.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
