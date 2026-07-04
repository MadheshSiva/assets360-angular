import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface AssetIntegrationEntry {
  erpId: string;
  wmsReference: string;
  apiSyncStatus: string;
  lastSyncTimestamp: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-integration',
  imports: [CommonModule, FormsModule],
  templateUrl: './integration.html',
  styleUrls: ['./integration.css']
})
export class AssetIntegration {
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
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
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
}
