import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './document-attachment.html',
  styleUrls: ['./document-attachment.css']
})
export class AssetDocumentAttachment {
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
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
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
}
