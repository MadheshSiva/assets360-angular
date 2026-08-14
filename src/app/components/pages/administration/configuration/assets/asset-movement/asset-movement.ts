import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';

export interface AssetMovementEntry {
  referenceNumber: string;
  status: string;
  movementDate: string;
  lastApprovalWorkflow: string;
  nextApprovalWorkflow: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-movement',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './asset-movement.html',
  styleUrls: ['./asset-movement.css']
})
export class AssetMovement {
  readonly importColumns: ImportColumn[] = [
    { key: 'referenceNumber', label: 'Reference Number' },
    { key: 'status', label: 'Status' },
    { key: 'movementDate', label: 'Movement Date' },
    { key: 'lastApprovalWorkflow', label: 'Last Approval Workflow' },
    { key: 'nextApprovalWorkflow', label: 'Next Approval Workflow' }
  ];

  showImportModal = false;

  statusOptions: string[] = ['Created', 'Approval In Progress', 'Completed'];

  approvalWorkflowOptions: string[] = ['Asset Controller', 'General Manager'];

  entries: AssetMovementEntry[] = [
    { referenceNumber: 'MOV-26042026-152645', status: 'Approval In Progress', movementDate: '', lastApprovalWorkflow: 'Asset Controller', nextApprovalWorkflow: 'General Manager' },
    { referenceNumber: 'MOV-04012026-124348', status: 'Completed', movementDate: '2026-01-04', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { referenceNumber: 'MOV-28102025-001', status: 'Created', movementDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'Asset Controller' },
    { referenceNumber: 'MOV-16072025-113328', status: 'Completed', movementDate: '2025-07-16', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { referenceNumber: 'MOV-25062025-163605', status: 'Created', movementDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'Asset Controller' },
    { referenceNumber: 'MOV-22052025-134205', status: 'Completed', movementDate: '2025-05-22', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { referenceNumber: 'MOV-06022025-114540', status: 'Completed', movementDate: '2025-02-06', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { referenceNumber: 'MOV-08012025-125223', status: 'Created', movementDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'Asset Controller' },
    { referenceNumber: 'MOV-13112024-143301', status: 'Created', movementDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'Asset Controller' },
    { referenceNumber: 'MOV-13112024-141057', status: 'Completed', movementDate: '2024-11-13', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { referenceNumber: 'MOV-22102024-123301', status: 'Completed', movementDate: '2024-10-22', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { referenceNumber: 'MOV-23092024-122221', status: 'Completed', movementDate: '2024-09-23', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { referenceNumber: 'MOV-11092024-144441', status: 'Completed', movementDate: '2024-09-11', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { referenceNumber: 'MOV-09092024-113124', status: 'Created', movementDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'Asset Controller' }
  ];

  // Adds a new row directly to the table — each editable cell is already a
  // live dropdown/textbox/date picker, so there's no separate add form.
  onAdd(): void {
    this.entries = [
      ...this.entries,
      {
        referenceNumber: '',
        status: this.statusOptions[0],
        movementDate: '',
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
        referenceNumber: row['referenceNumber'] ?? '',
        status: row['status'] ?? '',
        movementDate: row['movementDate'] ?? '',
        lastApprovalWorkflow: row['lastApprovalWorkflow'] ?? '',
        nextApprovalWorkflow: row['nextApprovalWorkflow'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current asset movement list
  }

  onRefresh(): void {
    // TODO: reload asset movement data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  editRow(entry: AssetMovementEntry): void {
    // TODO: open edit flow for a single row (rows here are already inline-editable; no separate edit flow to mirror)
  }

  deleteRow(entry: AssetMovementEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
