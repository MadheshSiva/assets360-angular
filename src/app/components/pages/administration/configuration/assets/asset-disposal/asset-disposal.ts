import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';

export interface AssetDisposalEntry {
  assetId: string;
  assetName: string;
  referenceNumber: string;
  requestedBy: string;
  disposalReason: string;
  status: string;
  disposalDate: string;
  lastApprovalWorkflow: string;
  nextApprovalWorkflow: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-disposal',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './asset-disposal.html',
  styleUrls: ['./asset-disposal.css']
})
export class AssetDisposal {
  readonly importColumns: ImportColumn[] = [
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'referenceNumber', label: 'Reference Number' },
    { key: 'requestedBy', label: 'Requested By' },
    { key: 'disposalReason', label: 'Disposal Reason' },
    { key: 'status', label: 'Status' },
    { key: 'disposalDate', label: 'Disposal Date' },
    { key: 'lastApprovalWorkflow', label: 'Last Approval Workflow' },
    { key: 'nextApprovalWorkflow', label: 'Next Approval Workflow' }
  ];

  showImportModal = false;

  disposalReasonOptions: string[] = ['Obsolete', 'Damaged', 'Fully Depreciated', 'Lost'];

  statusOptions: string[] = ['Created', 'Approval In Progress', 'Completed'];

  approvalWorkflowOptions: string[] = ['CBO Level1 Manager', 'General Manager'];

  entries: AssetDisposalEntry[] = [
    { assetId: 'AST-0001', assetName: 'Forklift Unit 4', referenceNumber: 'DISP-21052026-112333', requestedBy: 'sohar users', disposalReason: 'Obsolete', status: 'Created', disposalDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'CBO Level1 Manager' },
    { assetId: 'AST-0002', assetName: 'HVAC Compressor B', referenceNumber: 'DISP-13052026-102044', requestedBy: 'MCT user', disposalReason: 'Damaged', status: 'Created', disposalDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'CBO Level1 Manager' },
    { assetId: 'AST-0003', assetName: 'Laptop Dell XPS 15', referenceNumber: 'DISP-11052026-174856', requestedBy: 'MCT user', disposalReason: 'Damaged', status: 'Created', disposalDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'CBO Level1 Manager' },
    { assetId: 'AST-0004', assetName: 'Industrial Generator 2', referenceNumber: 'DISP-03022026-151006', requestedBy: 'suhail', disposalReason: 'Fully Depreciated', status: 'Completed', disposalDate: '2026-02-03', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { assetId: 'AST-0005', assetName: 'Conveyor Belt System', referenceNumber: 'DISP-05012026-154432', requestedBy: 'suhail', disposalReason: 'Fully Depreciated', status: 'Approval In Progress', disposalDate: '', lastApprovalWorkflow: 'CBO Level1 Manager', nextApprovalWorkflow: 'General Manager' },
    { assetId: 'AST-0006', assetName: 'Office Printer HP LaserJet', referenceNumber: 'DISP-10082025-135610', requestedBy: '', disposalReason: 'Damaged', status: 'Completed', disposalDate: '2025-08-10', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { assetId: 'AST-0007', assetName: 'Security Camera Unit 12', referenceNumber: 'DISP-22052025-081904', requestedBy: 'Admin', disposalReason: 'Lost', status: 'Created', disposalDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'CBO Level1 Manager' },
    { assetId: 'AST-0008', assetName: 'Pallet Jack Model X', referenceNumber: 'DISP-21052025-134819', requestedBy: 'Admin', disposalReason: 'Obsolete', status: 'Created', disposalDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'CBO Level1 Manager' },
    { assetId: 'AST-0009', assetName: 'Desktop Workstation 07', referenceNumber: 'DISP-21052025-134655', requestedBy: '', disposalReason: 'Damaged', status: 'Created', disposalDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'CBO Level1 Manager' },
    { assetId: 'AST-0010', assetName: 'Water Pump Unit 3', referenceNumber: 'DISP-27032025-123324', requestedBy: 'suhail', disposalReason: 'Obsolete', status: 'Completed', disposalDate: '2025-03-27', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { assetId: 'AST-0011', assetName: 'Air Compressor Unit', referenceNumber: 'DISP-06022025-115026', requestedBy: 'suhail', disposalReason: 'Fully Depreciated', status: 'Created', disposalDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'CBO Level1 Manager' },
    { assetId: 'AST-0012', assetName: 'Handheld Scanner 5', referenceNumber: 'DISP-08012025-123826', requestedBy: '', disposalReason: 'Damaged', status: 'Created', disposalDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'CBO Level1 Manager' },
    { assetId: 'AST-0013', assetName: 'Backup Power Generator', referenceNumber: 'DISP-26122024-120512', requestedBy: 'suhail', disposalReason: 'Fully Depreciated', status: 'Completed', disposalDate: '2024-12-26', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { assetId: 'AST-0014', assetName: 'Cooling Tower Fan', referenceNumber: 'DISP-27112024-163934', requestedBy: 'suhail', disposalReason: 'Fully Depreciated', status: 'Created', disposalDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'CBO Level1 Manager' }
  ];

  // Adds a new row directly to the table — each editable cell is already a
  // live dropdown/textbox/date picker, so there's no separate add form.
  onAdd(): void {
    this.entries = [
      ...this.entries,
      {
        assetId: '',
        assetName: '',
        referenceNumber: '',
        requestedBy: '',
        disposalReason: this.disposalReasonOptions[0],
        status: this.statusOptions[0],
        disposalDate: '',
        lastApprovalWorkflow: '',
        nextApprovalWorkflow: ''
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
        referenceNumber: row['referenceNumber'] ?? '',
        requestedBy: row['requestedBy'] ?? '',
        disposalReason: row['disposalReason'] ?? '',
        status: row['status'] ?? '',
        disposalDate: row['disposalDate'] ?? '',
        lastApprovalWorkflow: row['lastApprovalWorkflow'] ?? '',
        nextApprovalWorkflow: row['nextApprovalWorkflow'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current asset disposal list
  }

  onRefresh(): void {
    // TODO: reload asset disposal data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  editRow(entry: AssetDisposalEntry): void {
    // TODO: open edit flow for a single row (rows here are already inline-editable; no separate edit flow to mirror)
  }

  deleteRow(entry: AssetDisposalEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
