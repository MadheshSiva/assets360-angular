import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
import { AssetAuditService, AppAssetAudit, AssetAuditFormValue } from '../../../../../services/asset-audit.service';

interface AuditConfigForm {
  assetId: string;
  assetName: string;
  auditCode: string;
  auditName: string;
  /** yyyy-MM-dd, bound to a native date input */
  auditStartDate: string;
  /** yyyy-MM-dd, bound to a native date input; blank means "no end date" */
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
    { key: 'active', label: 'Active' }
  ];

  showImportModal = false;

  entries: AppAssetAudit[] = [];
  loading = false;
  errorMessage = '';

  showFormModal = false;
  isEditMode = false;
  private editingEntry: AppAssetAudit | null = null;
  form: AuditConfigForm = this.emptyForm();

  deleteTarget: AppAssetAudit | null = null;

  constructor(private service: AssetAuditService) {
    this.loadEntries();
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
    // TODO: submit imported rows to the backend instead of only pushing to the local list
    rows.forEach((row) => {
      const activeRaw = (row['active'] ?? '').trim().toLowerCase();
      const fields: AssetAuditFormValue = {
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        auditCode: row['auditCode'] ?? '',
        auditName: row['auditName'] ?? '',
        auditStartDate: row['auditStartDate'] ?? '',
        auditEndDate: row['auditEndDate'] || null,
        active: activeRaw === 'yes' || activeRaw === 'true'
      };
      this.service.create(fields).subscribe({ next: () => this.loadEntries() });
    });
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current audit configuration list
  }

  onRefresh(): void {
    this.loadEntries();
  }

  onDelete(): void {
    // TODO: bulk-delete selected entries (no row-selection UI yet)
  }

  editRow(entry: AppAssetAudit): void {
    this.isEditMode = true;
    this.editingEntry = entry;
    this.form = {
      assetId: entry.assetId,
      assetName: entry.assetName,
      auditCode: entry.auditCode,
      auditName: entry.auditName,
      auditStartDate: entry.auditStartDate ? entry.auditStartDate.slice(0, 10) : '',
      auditEndDate: entry.auditEndDate ? entry.auditEndDate.slice(0, 10) : '',
      active: entry.active ? 'Yes' : 'No'
    };
    this.showFormModal = true;
  }

  deleteRow(entry: AppAssetAudit): void {
    this.deleteTarget = entry;
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.deleteTarget = null;
    this.service.delete(id).subscribe({
      next: () => this.loadEntries(),
      error: () => this.errorMessage = 'Failed to delete audit. Please try again.'
    });
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingEntry = null;
  }

  submitForm(): void {
    const fields: AssetAuditFormValue = {
      assetId: this.form.assetId,
      assetName: this.form.assetName,
      auditCode: this.form.auditCode,
      auditName: this.form.auditName,
      auditStartDate: this.form.auditStartDate,
      auditEndDate: this.form.auditEndDate || null,
      active: this.parseActive(this.form.active)
    };

    const request$ = this.isEditMode && this.editingEntry
      ? this.service.update(this.editingEntry.id, fields)
      : this.service.create(fields);

    request$.subscribe({
      next: () => {
        this.closeFormModal();
        this.loadEntries();
      },
      error: () => this.errorMessage = 'Failed to save audit. Please try again.'
    });
  }

  private loadEntries(): void {
    this.loading = true;
    this.errorMessage = '';
    this.service.getAll().subscribe({
      next: (entries) => {
        this.entries = entries;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load audit configuration data.';
        this.loading = false;
      }
    });
  }
}
