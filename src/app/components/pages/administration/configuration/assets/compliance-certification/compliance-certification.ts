import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { RowActions } from 'shared-ui';

export interface ComplianceCertificationEntry {
  assetId: string;
  assetName: string;
  certificationType: string;
  issuedDate: string;
  expiryDate: string;
  inspectionLogs: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-compliance-certification',
  imports: [CommonModule, FormsModule, ImportFileModal, MasterLinkIcons, RowActions],
  templateUrl: './compliance-certification.html',
  styleUrls: ['./compliance-certification.css']
})
export class AssetComplianceCertification {
  readonly importColumns: ImportColumn[] = [
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'certificationType', label: 'Certification Type' },
    { key: 'issuedDate', label: 'Issued Date' },
    { key: 'expiryDate', label: 'Expiry Date' },
    { key: 'inspectionLogs', label: 'Inspection Logs' }
  ];

  showImportModal = false;

  // Master: certification type
  certificationTypeOptions: string[] = [
    'ISO 55000 Asset Management',
    'Pressure Vessel Safety Certificate',
    'Electrical Safety Certificate',
    'Fire Safety Certificate',
    'Environmental Compliance'
  ];

  entries: ComplianceCertificationEntry[] = [
    {
      assetId: 'AST-0001',
      assetName: 'Pressure Vessel Tank 3',
      certificationType: 'ISO 55000 Asset Management',
      issuedDate: '2025-01-10',
      expiryDate: '2028-01-10',
      inspectionLogs: 'Last inspected 2026-01-10 - Compliant'
    },
    {
      assetId: 'AST-0002',
      assetName: 'Boiler Unit 2',
      certificationType: 'Pressure Vessel Safety Certificate',
      issuedDate: '2024-05-22',
      expiryDate: '2026-05-22',
      inspectionLogs: 'Last inspected 2026-05-01 - Renewal Due'
    }
  ];

  // Adds a new row directly to the table — each editable cell is already a
  // live dropdown/date picker, so there's no separate add form.
  onAdd(): void {
    this.entries = [
      ...this.entries,
      {
        assetId: '',
        assetName: '',
        certificationType: this.certificationTypeOptions[0],
        issuedDate: '',
        expiryDate: '',
        inspectionLogs: 'No inspections logged yet'
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
        certificationType: row['certificationType'] ?? '',
        issuedDate: row['issuedDate'] ?? '',
        expiryDate: row['expiryDate'] ?? '',
        inspectionLogs: row['inspectionLogs'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current compliance & certification list
  }

  onRefresh(): void {
    // TODO: reload compliance & certification data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  // Rows in this table are already inline-editable (each cell is a live
  // dropdown/date picker bound directly to the entry), so there is no
  // separate edit mode to enter. This exists for parity with the row
  // actions contract; it intentionally has nothing else to do.
  editRow(entry: ComplianceCertificationEntry): void {
  }

  deleteRow(entry: ComplianceCertificationEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
