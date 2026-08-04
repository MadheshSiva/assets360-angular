import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';

export interface DocumentAttachmentEntry {
  purchaseInvoice: string;
  warrantyCertificate: string;
  manuals: string;
  images: string;
  complianceCertificates: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-document-attachment',
  imports: [CommonModule, ImportFileModal, RowActions],
  templateUrl: './document-attachment.html',
  styleUrls: ['./document-attachment.css']
})
export class AssetDocumentAttachment {
  readonly importColumns: ImportColumn[] = [
    { key: 'purchaseInvoice', label: 'Purchase Invoice' },
    { key: 'warrantyCertificate', label: 'Warranty Certificate' },
    { key: 'manuals', label: 'Manuals' },
    { key: 'images', label: 'Images' },
    { key: 'complianceCertificates', label: 'Compliance Certificates' }
  ];

  showImportModal = false;

  entries: DocumentAttachmentEntry[] = [
    {
      purchaseInvoice: 'invoice_88213.pdf',
      warrantyCertificate: 'warranty_cert_88213.pdf',
      manuals: 'hvac_unit_manual.pdf',
      images: '3 images uploaded',
      complianceCertificates: 'fire_safety_compliance.pdf'
    },
    {
      purchaseInvoice: 'invoice_44120.pdf',
      warrantyCertificate: 'warranty_cert_44120.pdf',
      manuals: 'fire_panel_manual.pdf',
      images: '1 image uploaded',
      complianceCertificates: '-'
    }
  ];

  onAdd(): void {
    // TODO: open add document & attachment entry flow
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    this.entries = [
      ...this.entries,
      ...rows.map((row) => ({
        purchaseInvoice: row['purchaseInvoice'] ?? '',
        warrantyCertificate: row['warrantyCertificate'] ?? '',
        manuals: row['manuals'] ?? '',
        images: row['images'] ?? '',
        complianceCertificates: row['complianceCertificates'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current document & attachment list
  }

  onRefresh(): void {
    // TODO: reload document & attachment data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  editRow(entry: DocumentAttachmentEntry): void {
    // TODO: open edit flow for a single row (no existing per-row edit flow to mirror on this page)
  }

  deleteRow(entry: DocumentAttachmentEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
