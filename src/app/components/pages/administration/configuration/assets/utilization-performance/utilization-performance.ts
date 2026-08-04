import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';

export interface UtilizationPerformanceEntry {
  usageHours: string;
  idleTime: string;
  movementFrequency: string;
  utilizationPercent: string;
  productivityMetrics: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-utilization-performance',
  imports: [CommonModule, ImportFileModal, RowActions],
  templateUrl: './utilization-performance.html',
  styleUrls: ['./utilization-performance.css']
})
export class AssetUtilizationPerformance {
  readonly importColumns: ImportColumn[] = [
    { key: 'usageHours', label: 'Usage Hours' },
    { key: 'idleTime', label: 'Idle Time' },
    { key: 'movementFrequency', label: 'Movement Frequency' },
    { key: 'utilizationPercent', label: 'Utilization %' },
    { key: 'productivityMetrics', label: 'Productivity Metrics' }
  ];

  showImportModal = false;

  entries: UtilizationPerformanceEntry[] = [
    {
      usageHours: '128 hrs this month',
      idleTime: '14 hrs',
      movementFrequency: '36 moves this month',
      utilizationPercent: '82%',
      productivityMetrics: 'Above target'
    },
    {
      usageHours: '96 hrs this month',
      idleTime: '22 hrs',
      movementFrequency: '18 moves this month',
      utilizationPercent: '64%',
      productivityMetrics: 'On target'
    }
  ];

  onAdd(): void {
    // TODO: open add utilization & performance entry flow
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    this.entries = [
      ...this.entries,
      ...rows.map((row) => ({
        usageHours: row['usageHours'] ?? '',
        idleTime: row['idleTime'] ?? '',
        movementFrequency: row['movementFrequency'] ?? '',
        utilizationPercent: row['utilizationPercent'] ?? '',
        productivityMetrics: row['productivityMetrics'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current utilization & performance list
  }

  onRefresh(): void {
    // TODO: reload utilization & performance data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  editRow(entry: UtilizationPerformanceEntry): void {
    // TODO: open edit utilization & performance entry flow
  }

  deleteRow(entry: UtilizationPerformanceEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
