import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';

export interface UtilizationPerformanceEntry {
  assetId: string;
  assetName: string;
  usageHours: string;
  idleTime: string;
  movementFrequency: string;
  utilizationPercent: string;
  productivityMetrics: string;
}

interface UtilizationPerformanceForm {
  assetId: string;
  assetName: string;
  usageHours: string;
  idleTime: string;
  movementFrequency: string;
  utilizationPercent: string;
  productivityMetrics: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-utilization-performance',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './utilization-performance.html',
  styleUrls: ['./utilization-performance.css']
})
export class AssetUtilizationPerformance {
  readonly importColumns: ImportColumn[] = [
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'usageHours', label: 'Usage Hours' },
    { key: 'idleTime', label: 'Idle Time' },
    { key: 'movementFrequency', label: 'Movement Frequency' },
    { key: 'utilizationPercent', label: 'Utilization %' },
    { key: 'productivityMetrics', label: 'Productivity Metrics' }
  ];

  showImportModal = false;

  entries: UtilizationPerformanceEntry[] = [
    {
      assetId: 'AST-0001',
      assetName: 'HVAC Compressor B',
      usageHours: '128 hrs this month',
      idleTime: '14 hrs',
      movementFrequency: '36 moves this month',
      utilizationPercent: '82%',
      productivityMetrics: 'Above target'
    },
    {
      assetId: 'AST-0002',
      assetName: 'Conveyor Belt System',
      usageHours: '96 hrs this month',
      idleTime: '22 hrs',
      movementFrequency: '18 moves this month',
      utilizationPercent: '64%',
      productivityMetrics: 'On target'
    }
  ];

  showFormModal = false;
  isEditMode = false;
  private editingEntry: UtilizationPerformanceEntry | null = null;
  form: UtilizationPerformanceForm = this.emptyForm();

  private emptyForm(): UtilizationPerformanceForm {
    return {
      assetId: '',
      assetName: '',
      usageHours: '',
      idleTime: '',
      movementFrequency: '',
      utilizationPercent: '',
      productivityMetrics: ''
    };
  }

  onAdd(): void {
    this.isEditMode = false;
    this.editingEntry = null;
    this.form = this.emptyForm();
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingEntry = null;
  }

  submitForm(): void {
    if (this.isEditMode && this.editingEntry) {
      Object.assign(this.editingEntry, this.form);
    } else {
      this.entries = [...this.entries, { ...this.form }];
    }
    this.closeFormModal();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    this.entries = [
      ...this.entries,
      ...rows.map((row) => ({
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
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
    this.isEditMode = true;
    this.editingEntry = entry;
    this.form = {
      assetId: entry.assetId,
      assetName: entry.assetName,
      usageHours: entry.usageHours,
      idleTime: entry.idleTime,
      movementFrequency: entry.movementFrequency,
      utilizationPercent: entry.utilizationPercent,
      productivityMetrics: entry.productivityMetrics
    };
    this.showFormModal = true;
  }

  deleteRow(entry: UtilizationPerformanceEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
