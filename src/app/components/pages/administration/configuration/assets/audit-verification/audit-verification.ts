import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { RowActions } from 'shared-ui';

export interface AuditVerificationEntry {
  assetId: string;
  assetName: string;
  auditDate: string;
  auditorDetails: string;
  physicalVerificationResult: string;
  discrepanciesFound: string;
  auditHistoryLogs: string;
}

export interface AuditVerificationForm {
  assetId: string;
  assetName: string;
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

  entries: AuditVerificationEntry[] = [
    {
      assetId: 'AST-0001',
      assetName: 'Forklift Unit 4',
      auditDate: '2026-06-28',
      auditorDetails: 'J. Fernando',
      physicalVerificationResult: 'Verified',
      discrepanciesFound: '-',
      auditHistoryLogs: 'Logged automatically on 2026-06-28 09:12'
    },
    {
      assetId: 'AST-0002',
      assetName: 'HVAC Compressor B',
      auditDate: '2026-06-20',
      auditorDetails: 'A. Perera',
      physicalVerificationResult: 'Verified with Exceptions',
      discrepanciesFound: 'Serial number mismatch on tag',
      auditHistoryLogs: 'Logged automatically on 2026-06-20 14:05'
    }
  ];

  showFormModal = false;
  isEditMode = false;
  private editingEntry: AuditVerificationEntry | null = null;
  form: AuditVerificationForm = this.emptyForm();

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
    this.entries = [
      ...this.entries,
      ...rows.map((row) => ({
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        auditDate: row['auditDate'] ?? '',
        auditorDetails: row['auditorDetails'] ?? '',
        physicalVerificationResult: row['physicalVerificationResult'] ?? '',
        discrepanciesFound: row['discrepanciesFound'] ?? '',
        auditHistoryLogs: row['auditHistoryLogs'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current audit & verification list
  }

  onRefresh(): void {
    // TODO: reload audit & verification data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  editRow(entry: AuditVerificationEntry): void {
    this.isEditMode = true;
    this.editingEntry = entry;
    this.form = {
      assetId: entry.assetId,
      assetName: entry.assetName,
      auditDate: entry.auditDate,
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
    if (this.isEditMode && this.editingEntry) {
      Object.assign(this.editingEntry, this.form);
    } else {
      this.entries = [...this.entries, { ...this.form }];
    }
    this.closeFormModal();
  }

  deleteRow(entry: AuditVerificationEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
