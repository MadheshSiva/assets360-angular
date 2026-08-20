import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { RowActions } from 'shared-ui';

export interface AssetIntegrationEntry {
  assetId: string;
  assetName: string;
  erpId: string;
  wmsReference: string;
  apiSyncStatus: string;
  lastSyncTimestamp: string;
}

export interface AssetIntegrationForm {
  assetId: string;
  assetName: string;
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
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
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
      assetId: 'AST-0001',
      assetName: 'HVAC Compressor Unit 2',
      erpId: 'SAP-AST-88213',
      wmsReference: 'WMS-REF-2201',
      apiSyncStatus: 'Synced',
      lastSyncTimestamp: '2026-07-04 06:00'
    },
    {
      assetId: 'AST-0002',
      assetName: 'Forklift Unit 7',
      erpId: 'ORCL-AST-44120',
      wmsReference: 'WMS-REF-1987',
      apiSyncStatus: 'Failed',
      lastSyncTimestamp: '2026-07-03 18:30'
    }
  ];

  showFormModal = false;
  isEditMode = false;
  private editingEntry: AssetIntegrationEntry | null = null;
  form: AssetIntegrationForm = this.emptyForm();

  private emptyForm(): AssetIntegrationForm {
    return {
      assetId: '',
      assetName: '',
      erpId: '',
      wmsReference: '',
      apiSyncStatus: '',
      lastSyncTimestamp: ''
    };
  }

  onAdd(): void {
    this.isEditMode = false;
    this.editingEntry = null;
    this.form = this.emptyForm();
    this.showFormModal = true;
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

  editRow(entry: AssetIntegrationEntry): void {
    this.isEditMode = true;
    this.editingEntry = entry;
    this.form = {
      assetId: entry.assetId,
      assetName: entry.assetName,
      erpId: entry.erpId,
      wmsReference: entry.wmsReference,
      apiSyncStatus: entry.apiSyncStatus,
      lastSyncTimestamp: entry.lastSyncTimestamp
    };
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

  deleteRow(entry: AssetIntegrationEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
