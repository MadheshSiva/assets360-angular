import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';

export interface DocumentAttachmentEntry {
  assetId: string;
  assetName: string;
  purchaseInvoice: string;
  warrantyCertificate: string;
  manuals: string;
  images: string;
  complianceCertificates: string;
}

type DocumentAttachmentEntryForm = DocumentAttachmentEntry;

@Component({
  standalone: true,
  selector: 'app-asset-document-attachment',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './document-attachment.html',
  styleUrls: ['./document-attachment.css']
})
export class AssetDocumentAttachment {
  readonly importColumns: ImportColumn[] = [
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'purchaseInvoice', label: 'Purchase Invoice' },
    { key: 'warrantyCertificate', label: 'Warranty Certificate' },
    { key: 'manuals', label: 'Manuals' },
    { key: 'images', label: 'Images' },
    { key: 'complianceCertificates', label: 'Compliance Certificates' }
  ];

  showImportModal = false;

  showFormModal = false;
  isEditMode = false;
  private editingEntry: DocumentAttachmentEntry | null = null;
  form: DocumentAttachmentEntryForm = this.emptyForm();

  entries: DocumentAttachmentEntry[] = [
    {
      assetId: 'AST-0001',
      assetName: 'HVAC Compressor B',
      purchaseInvoice: 'invoice_88213.pdf',
      warrantyCertificate: 'warranty_cert_88213.pdf',
      manuals: 'hvac_unit_manual.pdf',
      images: '3 images uploaded',
      complianceCertificates: 'fire_safety_compliance.pdf'
    },
    {
      assetId: 'AST-0002',
      assetName: 'Fire Alarm Panel Unit 2',
      purchaseInvoice: 'invoice_44120.pdf',
      warrantyCertificate: 'warranty_cert_44120.pdf',
      manuals: 'fire_panel_manual.pdf',
      images: '1 image uploaded',
      complianceCertificates: '-'
    }
  ];

  private emptyForm(): DocumentAttachmentEntryForm {
    return {
      assetId: '',
      assetName: '',
      purchaseInvoice: '',
      warrantyCertificate: '',
      manuals: '',
      images: '',
      complianceCertificates: ''
    };
  }

  onAdd(): void {
    this.isEditMode = false;
    this.editingEntry = null;
    this.form = this.emptyForm();
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

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    this.entries = [
      ...this.entries,
      ...rows.map((row) => ({
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
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
    this.isEditMode = true;
    this.editingEntry = entry;
    this.form = {
      assetId: entry.assetId,
      assetName: entry.assetName,
      purchaseInvoice: entry.purchaseInvoice,
      warrantyCertificate: entry.warrantyCertificate,
      manuals: entry.manuals,
      images: entry.images,
      complianceCertificates: entry.complianceCertificates
    };
    this.showFormModal = true;
  }

  deleteRow(entry: DocumentAttachmentEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
