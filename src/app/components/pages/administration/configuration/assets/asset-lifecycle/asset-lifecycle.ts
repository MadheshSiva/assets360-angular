import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';

export interface AssetLifecycleEntry {
  procurementDate: string;
  deploymentDate: string;
  status: string;
  disposalDetails: string;
  reasonForRetirement: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-lifecycle',
  imports: [CommonModule, ImportFileModal, RowActions],
  templateUrl: './asset-lifecycle.html',
  styleUrls: ['./asset-lifecycle.css']
})
export class AssetLifecycle {
  readonly importColumns: ImportColumn[] = [
    { key: 'procurementDate', label: 'Procurement Date' },
    { key: 'deploymentDate', label: 'Deployment Date' },
    { key: 'status', label: 'Status' },
    { key: 'disposalDetails', label: 'Disposal Details' },
    { key: 'reasonForRetirement', label: 'Reason for Retirement' }
  ];

  showImportModal = false;

  entries: AssetLifecycleEntry[] = [
    {
      procurementDate: '2025-02-14',
      deploymentDate: '2025-03-01',
      status: 'Active',
      disposalDetails: '-',
      reasonForRetirement: '-'
    },
    {
      procurementDate: '2023-08-05',
      deploymentDate: '2023-08-20',
      status: 'Retired',
      disposalDetails: 'Sold to third-party vendor',
      reasonForRetirement: 'End of service life'
    }
  ];

  onAdd(): void {
    // TODO: open add asset lifecycle entry flow
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    this.entries = [
      ...this.entries,
      ...rows.map((row) => ({
        procurementDate: row['procurementDate'] ?? '',
        deploymentDate: row['deploymentDate'] ?? '',
        status: row['status'] ?? '',
        disposalDetails: row['disposalDetails'] ?? '',
        reasonForRetirement: row['reasonForRetirement'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current asset lifecycle list
  }

  onRefresh(): void {
    // TODO: reload asset lifecycle data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  editRow(entry: AssetLifecycleEntry): void {
    // TODO: open edit asset lifecycle entry flow for this entry
  }

  deleteRow(entry: AssetLifecycleEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
