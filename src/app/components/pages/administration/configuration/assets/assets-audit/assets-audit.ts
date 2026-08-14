import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';

export interface AuditConfigEntry {
  auditCode: string;
  auditName: string;
  auditStartDate: string;
  auditEndDate: string;
  active: boolean;
  createdDate: string;
  createdBy: string;
}

type AuditTab = 'configuration';

@Component({
  standalone: true,
  selector: 'app-asset-audit-config',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './assets-audit.html',
  styleUrls: ['./assets-audit.css']
})
export class AssetAuditConfig {
  // Single tab today ("Configuration"); structured as a list so more sections
  // (e.g. Audit Execution, Audit Findings) can be added here later without
  // needing new sidebar entries — this page owns its own sub-navigation.
  tabs: { key: AuditTab; label: string }[] = [
    { key: 'configuration', label: 'Configuration' }
  ];
  activeTab: AuditTab = 'configuration';

  readonly importColumns: ImportColumn[] = [
    { key: 'auditCode', label: 'Audit Code' },
    { key: 'auditName', label: 'Audit Name' },
    { key: 'auditStartDate', label: 'Audit Start Date' },
    { key: 'auditEndDate', label: 'Audit End Date' },
    { key: 'active', label: 'Active' },
    { key: 'createdDate', label: 'Created Date' },
    { key: 'createdBy', label: 'Created By' }
  ];

  showImportModal = false;

  entries: AuditConfigEntry[] = [
    { auditCode: '210526', auditName: '210526', auditStartDate: '2026-05-21', auditEndDate: '', active: true, createdDate: '2026-05-21', createdBy: 'Admin' },
    { auditCode: '06042026-01', auditName: '06042026-01', auditStartDate: '2026-04-06', auditEndDate: '', active: true, createdDate: '2026-04-06', createdBy: 'Admin' },
    { auditCode: '110326', auditName: '110326', auditStartDate: '2026-03-11', auditEndDate: '', active: true, createdDate: '2026-03-11', createdBy: 'Admin' },
    { auditCode: '030226-02', auditName: '030226-02', auditStartDate: '2026-02-03', auditEndDate: '', active: true, createdDate: '2026-02-03', createdBy: 'Admin' },
    { auditCode: '030226-01', auditName: '030226-01', auditStartDate: '2026-02-03', auditEndDate: '', active: true, createdDate: '2026-02-03', createdBy: 'Admin' },
    { auditCode: '060126-01', auditName: '060126-01', auditStartDate: '2026-01-06', auditEndDate: '', active: true, createdDate: '2026-01-06', createdBy: 'Admin' },
    { auditCode: 'GFR050126', auditName: 'Galfar 05JAN26', auditStartDate: '2026-01-05', auditEndDate: '', active: true, createdDate: '2026-01-05', createdBy: 'Admin' },
    { auditCode: 'GFR040126-01', auditName: 'Galfar 04JAN26', auditStartDate: '2026-01-04', auditEndDate: '', active: true, createdDate: '2026-01-04', createdBy: 'Admin' },
    { auditCode: 'KNET231025-01', auditName: 'KNET231025-01', auditStartDate: '2025-10-22', auditEndDate: '', active: true, createdDate: '2025-10-22', createdBy: 'Admin' },
    { auditCode: 'HC24072501', auditName: 'HC24072501', auditStartDate: '2025-07-24', auditEndDate: '2025-10-22', active: false, createdDate: '2025-07-24', createdBy: 'Admin' },
    { auditCode: 'HC160725', auditName: 'HC160725', auditStartDate: '2025-07-16', auditEndDate: '2025-10-22', active: false, createdDate: '2025-07-16', createdBy: 'Admin' },
    { auditCode: 'MH150725-01', auditName: 'MH150725-01', auditStartDate: '2025-07-15', auditEndDate: '2025-07-15', active: false, createdDate: '2025-07-15', createdBy: 'Admin' },
    { auditCode: 'MH030725-02', auditName: 'MH030725-02', auditStartDate: '2025-07-03', auditEndDate: '2025-07-15', active: false, createdDate: '2025-07-03', createdBy: 'Admin' },
    { auditCode: 'MH030725-01', auditName: 'MH030725-01', auditStartDate: '2025-07-03', auditEndDate: '2025-07-15', active: false, createdDate: '2025-07-03', createdBy: 'Admin' },
    { auditCode: 'WB180625', auditName: 'WB180625', auditStartDate: '2025-06-18', auditEndDate: '2025-07-15', active: false, createdDate: '2025-06-18', createdBy: 'Admin' }
  ];

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  // Adds a new row directly to the table — each editable cell is already a
  // live textbox/date picker/checkbox, so there's no separate add form.
  onAdd(): void {
    this.entries = [
      ...this.entries,
      {
        auditCode: '',
        auditName: '',
        auditStartDate: '',
        auditEndDate: '',
        active: true,
        createdDate: this.today(),
        createdBy: 'Admin'
      }
    ];
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    this.entries = [
      ...this.entries,
      ...rows.map((row) => {
        const activeRaw = (row['active'] ?? '').trim().toLowerCase();
        return {
          auditCode: row['auditCode'] ?? '',
          auditName: row['auditName'] ?? '',
          auditStartDate: row['auditStartDate'] ?? '',
          auditEndDate: row['auditEndDate'] ?? '',
          active: activeRaw === 'yes' || activeRaw === 'true',
          createdDate: row['createdDate'] || this.today(),
          createdBy: row['createdBy'] || 'Admin'
        };
      })
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current audit configuration list
  }

  onRefresh(): void {
    // TODO: reload audit configuration data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  editRow(entry: AuditConfigEntry): void {
    // Rows here are already inline-editable; no separate edit flow to mirror.
  }

  deleteRow(entry: AuditConfigEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
