import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { RowActions } from '@shared/row-actions/row-actions';

export interface AssetIntegrationEntry {
  erpId: string;
  wmsReference: string;
  apiSyncStatus: string;
  lastSyncTimestamp: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-integration',
  imports: [CommonModule, FormsModule, ImportFileModal, MasterLinkIcons, RowActions],
  templateUrl: './integration.html',
  styleUrls: ['./integration.css']
})
export class AssetIntegration {
  readonly importColumns: ImportColumn[] = [
    { key: 'erpId', label: 'ERP ID (SAP/Oracle)' },
    { key: 'wmsReference', label: 'WMS Reference' },
    { key: 'apiSyncStatus', label: 'API Sync Status' },
    { key: 'lastSyncTimestamp', label: 'Last Sync Timestamp' }
  ];

  showImportModal = false;

  // Master: API sync status values
  syncStatusOptions: string[] = ['Synced', 'Pending', 'Failed', 'Not Configured'];

  entries: AssetIntegrationEntry[] = [
    {
      erpId: 'SAP-AST-88213',
      wmsReference: 'WMS-REF-2201',
      apiSyncStatus: 'Synced',
      lastSyncTimestamp: '2026-07-04 06:00'
    },
    {
      erpId: 'ORCL-AST-44120',
      wmsReference: 'WMS-REF-1987',
      apiSyncStatus: 'Failed',
      lastSyncTimestamp: '2026-07-03 18:30'
    }
  ];

  // Adds a new row directly to the table — each editable cell is already a
  // live textbox/dropdown, so there's no separate add form.
  onAdd(): void {
    this.entries = [
      ...this.entries,
      {
        erpId: '',
        wmsReference: '',
        apiSyncStatus: this.syncStatusOptions[0],
        lastSyncTimestamp: 'Pending first sync'
      }
    ];
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    this.entries = [
      ...this.entries,
      ...rows.map((row) => ({
        erpId: row['erpId'] ?? '',
        wmsReference: row['wmsReference'] ?? '',
        apiSyncStatus: row['apiSyncStatus'] ?? '',
        lastSyncTimestamp: row['lastSyncTimestamp'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current integration list
  }

  onRefresh(): void {
    // TODO: reload integration data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  // No separate edit mode exists on this page — every cell is already a live,
  // directly-editable input/select. Kept as a no-op to satisfy the shared
  // row-actions contract without inventing a modal/edit flow that isn't here.
  editRow(entry: AssetIntegrationEntry): void {
    // TODO: no per-row edit affordance exists yet; rows are inline-editable.
  }

  deleteRow(entry: AssetIntegrationEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
