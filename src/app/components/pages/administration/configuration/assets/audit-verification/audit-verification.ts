import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { RowActions } from 'shared-ui';
import {
  AssetAuditVerificationService,
  AppAssetAuditVerification,
  AssetAuditVerificationFormValue
} from '../../../../../services/asset-audit-verification.service';

export interface AuditVerificationForm {
  assetId: string;
  assetName: string;
  /** yyyy-MM-dd, bound to a native date input */
  auditDate: string;
  auditorDetails: string;
  physicalVerificationResult: string;
  discrepanciesFound: string;
  auditHistoryLogs: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-audit-verification',
  imports: [CommonModule, FormsModule, ImportFileModal, MasterLinkIcons, RowActions],
  templateUrl: './audit-verification.html',
  styleUrls: ['./audit-verification.css']
})
export class AssetAuditVerification {
  readonly importColumns: ImportColumn[] = [
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'auditDate', label: 'Audit Date' },
    { key: 'auditorDetails', label: 'Auditor Details' },
    { key: 'physicalVerificationResult', label: 'Physical Verification Result' },
    { key: 'discrepanciesFound', label: 'Discrepancies Found' },
    { key: 'auditHistoryLogs', label: 'Audit History Logs' }
  ];

  showImportModal = false;

  // Master: auditor details
  auditorOptions: string[] = ['J. Fernando', 'A. Perera', 'N. Silva', 'External Auditor - KPMG'];

  // Master: physical verification result
  verificationResultOptions: string[] = ['Verified', 'Not Verified', 'Pending', 'Verified with Exceptions'];

  entries: AppAssetAuditVerification[] = [];
  loading = false;
  errorMessage = '';

  showFormModal = false;
  isEditMode = false;
  private editingEntry: AppAssetAuditVerification | null = null;
  form: AuditVerificationForm = this.emptyForm();

  deleteTarget: AppAssetAuditVerification | null = null;

  constructor(private service: AssetAuditVerificationService) {
    this.loadEntries();
  }

  private emptyForm(): AuditVerificationForm {
    return {
      assetId: '',
      assetName: '',
      auditDate: '',
      auditorDetails: '',
      physicalVerificationResult: '',
      discrepanciesFound: '',
      auditHistoryLogs: ''
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
    // TODO: submit imported rows to the backend instead of only pushing to the local list
    rows.forEach((row) => {
      const fields: AssetAuditVerificationFormValue = {
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        auditDate: row['auditDate'] ?? '',
        auditorDetails: row['auditorDetails'] ?? '',
        physicalVerificationResult: row['physicalVerificationResult'] ?? '',
        discrepanciesFound: row['discrepanciesFound'] ?? '',
        auditHistoryLogs: row['auditHistoryLogs'] ?? ''
      };
      this.service.create(fields).subscribe({ next: () => this.loadEntries() });
    });
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current audit & verification list
  }

  onRefresh(): void {
    this.loadEntries();
  }

  onDelete(): void {
    // TODO: bulk-delete selected entries (no row-selection UI yet)
  }

  editRow(entry: AppAssetAuditVerification): void {
    this.isEditMode = true;
    this.editingEntry = entry;
    this.form = {
      assetId: entry.assetId,
      assetName: entry.assetName,
      auditDate: entry.auditDate ? entry.auditDate.slice(0, 10) : '',
      auditorDetails: entry.auditorDetails,
      physicalVerificationResult: entry.physicalVerificationResult,
      discrepanciesFound: entry.discrepanciesFound,
      auditHistoryLogs: entry.auditHistoryLogs
    };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingEntry = null;
  }

  submitForm(): void {
    const fields: AssetAuditVerificationFormValue = { ...this.form };

    const request$ = this.isEditMode && this.editingEntry
      ? this.service.update(this.editingEntry.id, fields)
      : this.service.create(fields);

    request$.subscribe({
      next: () => {
        this.closeFormModal();
        this.loadEntries();
      },
      error: () => this.errorMessage = 'Failed to save audit & verification. Please try again.'
    });
  }

  deleteRow(entry: AppAssetAuditVerification): void {
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
      error: () => this.errorMessage = 'Failed to delete entry. Please try again.'
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
        this.errorMessage = 'Failed to load audit & verification data.';
        this.loading = false;
      }
    });
  }
}
