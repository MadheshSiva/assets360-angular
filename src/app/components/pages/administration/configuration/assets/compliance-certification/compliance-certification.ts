import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ComplianceCertificationEntry {
  certificationType: string;
  issuedDate: string;
  expiryDate: string;
  inspectionLogs: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-compliance-certification',
  imports: [CommonModule, FormsModule],
  templateUrl: './compliance-certification.html',
  styleUrls: ['./compliance-certification.css']
})
export class AssetComplianceCertification {
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
      certificationType: 'ISO 55000 Asset Management',
      issuedDate: '2025-01-10',
      expiryDate: '2028-01-10',
      inspectionLogs: 'Last inspected 2026-01-10 - Compliant'
    },
    {
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
        certificationType: this.certificationTypeOptions[0],
        issuedDate: '',
        expiryDate: '',
        inspectionLogs: 'No inspections logged yet'
      }
    ];
  }

  onUpload(): void {
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
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
}
