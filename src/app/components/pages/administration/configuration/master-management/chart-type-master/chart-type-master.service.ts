import { Injectable } from '@angular/core';
import { ChartWidgetName, MasterManagementChartTypeMasterItem } from './chart-type-master.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementChartTypeMasterService {
  readonly widgetNameMaster: ChartWidgetName[] = ['Chart', 'Gauge', 'Table'];

  private readonly records: MasterManagementChartTypeMasterItem[] = [
    {
      widgetId: 'WGT-1001',
      widgetName: 'Chart',
      configJson: '{"type":"line","stacked":false}',
      isActive: true
    },
    {
      widgetId: 'WGT-1002',
      widgetName: 'Gauge',
      configJson: '{"min":0,"max":100,"thresholds":[50,80]}',
      isActive: true
    },
    {
      widgetId: 'WGT-1003',
      widgetName: 'Table',
      configJson: '{"pageSize":25,"sortable":true}',
      isActive: true
    }
  ];

  private nextSequence = 1004;

  getRecords(): MasterManagementChartTypeMasterItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementChartTypeMasterItem): MasterManagementChartTypeMasterItem {
    const widgetId = record.widgetId?.trim() || `WGT-${this.nextSequence++}`;
    const created: MasterManagementChartTypeMasterItem = { ...record, widgetId };
    this.records.push(created);
    return created;
  }

  updateRecord(widgetId: string, changes: MasterManagementChartTypeMasterItem): void {
    const index = this.records.findIndex((r) => r.widgetId === widgetId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(widgetIds: string[]): void {
    for (const id of widgetIds) {
      const index = this.records.findIndex((r) => r.widgetId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementChartTypeMasterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
