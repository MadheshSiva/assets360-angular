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

  // Adds a new row directly to the table — each editable cell is already a
  // live dropdown/textbox/date picker, so there's no separate add form.
  onAdd(): void {
    this.entries = [
      ...this.entries,
      {
        assetId: '',
        assetName: '',
        auditDate: '',
        auditorDetails: this.auditorOptions[0],
        physicalVerificationResult: this.verificationResultOptions[0],
        discrepanciesFound: '',
        auditHistoryLogs: 'Logged automatically on save'
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
    // TODO: open edit flow for a single row (rows here are already inline-editable; no separate edit flow to mirror)
  }

  deleteRow(entry: AuditVerificationEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
