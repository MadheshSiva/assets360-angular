import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';

export interface AuditConfigEntry {
  assetId: string;
  assetName: string;
  auditCode: string;
  auditName: string;
  auditStartDate: string;
  auditEndDate: string;
  active: boolean;
  createdDate: string;
  createdBy: string;
}

interface AuditConfigForm {
  assetId: string;
  assetName: string;
  auditCode: string;
  auditName: string;
  auditStartDate: string;
  auditEndDate: string;
  active: string;
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
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
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
    { assetId: 'AST-0001', assetName: 'Forklift Unit 4', auditCode: '210526', auditName: '210526', auditStartDate: '2026-05-21', auditEndDate: '', active: true, createdDate: '2026-05-21', createdBy: 'Admin' },
    { assetId: 'AST-0002', assetName: 'HVAC Compressor B', auditCode: '06042026-01', auditName: '06042026-01', auditStartDate: '2026-04-06', auditEndDate: '', active: true, createdDate: '2026-04-06', createdBy: 'Admin' },
    { assetId: 'AST-0003', assetName: 'Laptop Dell XPS 15', auditCode: '110326', auditName: '110326', auditStartDate: '2026-03-11', auditEndDate: '', active: true, createdDate: '2026-03-11', createdBy: 'Admin' },
    { assetId: 'AST-0004', assetName: 'Industrial Generator 2', auditCode: '030226-02', auditName: '030226-02', auditStartDate: '2026-02-03', auditEndDate: '', active: true, createdDate: '2026-02-03', createdBy: 'Admin' },
    { assetId: 'AST-0005', assetName: 'Conveyor Belt System', auditCode: '030226-01', auditName: '030226-01', auditStartDate: '2026-02-03', auditEndDate: '', active: true, createdDate: '2026-02-03', createdBy: 'Admin' },
    { assetId: 'AST-0006', assetName: 'Office Printer HP LaserJet', auditCode: '060126-01', auditName: '060126-01', auditStartDate: '2026-01-06', auditEndDate: '', active: true, createdDate: '2026-01-06', createdBy: 'Admin' },
    { assetId: 'AST-0007', assetName: 'Security Camera Unit 12', auditCode: 'GFR050126', auditName: 'Galfar 05JAN26', auditStartDate: '2026-01-05', auditEndDate: '', active: true, createdDate: '2026-01-05', createdBy: 'Admin' },
    { assetId: 'AST-0008', assetName: 'Pallet Jack Model X', auditCode: 'GFR040126-01', auditName: 'Galfar 04JAN26', auditStartDate: '2026-01-04', auditEndDate: '', active: true, createdDate: '2026-01-04', createdBy: 'Admin' },
    { assetId: 'AST-0009', assetName: 'Desktop Workstation 07', auditCode: 'KNET231025-01', auditName: 'KNET231025-01', auditStartDate: '2025-10-22', auditEndDate: '', active: true, createdDate: '2025-10-22', createdBy: 'Admin' },
    { assetId: 'AST-0010', assetName: 'Water Pump Unit 3', auditCode: 'HC24072501', auditName: 'HC24072501', auditStartDate: '2025-07-24', auditEndDate: '2025-10-22', active: false, createdDate: '2025-07-24', createdBy: 'Admin' },
    { assetId: 'AST-0011', assetName: 'Air Compressor Unit', auditCode: 'HC160725', auditName: 'HC160725', auditStartDate: '2025-07-16', auditEndDate: '2025-10-22', active: false, createdDate: '2025-07-16', createdBy: 'Admin' },
    { assetId: 'AST-0012', assetName: 'Handheld Scanner 5', auditCode: 'MH150725-01', auditName: 'MH150725-01', auditStartDate: '2025-07-15', auditEndDate: '2025-07-15', active: false, createdDate: '2025-07-15', createdBy: 'Admin' },
    { assetId: 'AST-0013', assetName: 'Backup Power Generator', auditCode: 'MH030725-02', auditName: 'MH030725-02', auditStartDate: '2025-07-03', auditEndDate: '2025-07-15', active: false, createdDate: '2025-07-03', createdBy: 'Admin' },
    { assetId: 'AST-0014', assetName: 'Cooling Tower Fan', auditCode: 'MH030725-01', auditName: 'MH030725-01', auditStartDate: '2025-07-03', auditEndDate: '2025-07-15', active: false, createdDate: '2025-07-03', createdBy: 'Admin' },
    { assetId: 'AST-0015', assetName: 'Server Rack Unit 2', auditCode: 'WB180625', auditName: 'WB180625', auditStartDate: '2025-06-18', auditEndDate: '2025-07-15', active: false, createdDate: '2025-06-18', createdBy: 'Admin' }
  ];

  showFormModal = false;
  isEditMode = false;
  private editingEntry: AuditConfigEntry | null = null;
  form: AuditConfigForm = this.emptyForm();

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private emptyForm(): AuditConfigForm {
    return {
      assetId: '',
      assetName: '',
      auditCode: '',
      auditName: '',
      auditStartDate: '',
      auditEndDate: '',
      active: 'Yes'
    };
  }

  private parseActive(value: string): boolean {
    const normalized = value.trim().toLowerCase();
    return normalized === 'yes' || normalized === 'true';
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
      ...rows.map((row) => {
        const activeRaw = (row['active'] ?? '').trim().toLowerCase();
        return {
          assetId: row['assetId'] ?? '',
          assetName: row['assetName'] ?? '',
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
    this.isEditMode = true;
    this.editingEntry = entry;
    this.form = {
      assetId: entry.assetId,
      assetName: entry.assetName,
      auditCode: entry.auditCode,
      auditName: entry.auditName,
      auditStartDate: entry.auditStartDate,
      auditEndDate: entry.auditEndDate,
      active: entry.active ? 'Yes' : 'No'
    };
    this.showFormModal = true;
  }

  deleteRow(entry: AuditConfigEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingEntry = null;
  }

  submitForm(): void {
    const active = this.parseActive(this.form.active);

    if (this.isEditMode && this.editingEntry) {
      Object.assign(this.editingEntry, {
        assetId: this.form.assetId,
        assetName: this.form.assetName,
        auditCode: this.form.auditCode,
        auditName: this.form.auditName,
        auditStartDate: this.form.auditStartDate,
        auditEndDate: this.form.auditEndDate,
        active
      });
    } else {
      this.entries = [
        ...this.entries,
        {
          assetId: this.form.assetId,
          assetName: this.form.assetName,
          auditCode: this.form.auditCode,
          auditName: this.form.auditName,
          auditStartDate: this.form.auditStartDate,
          auditEndDate: this.form.auditEndDate,
          active,
          createdDate: this.today(),
          createdBy: 'Admin'
        }
      ];
    }
    this.closeFormModal();
  }
}
