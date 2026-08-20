import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';

export interface AssetMovementEntry {
  assetId: string;
  assetName: string;
  referenceNumber: string;
  status: string;
  movementDate: string;
  lastApprovalWorkflow: string;
  nextApprovalWorkflow: string;
}

export interface AssetMovementForm {
  assetId: string;
  assetName: string;
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
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
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
    { assetId: 'AST-0001', assetName: 'Forklift Unit 4', referenceNumber: 'MOV-26042026-152645', status: 'Approval In Progress', movementDate: '', lastApprovalWorkflow: 'Asset Controller', nextApprovalWorkflow: 'General Manager' },
    { assetId: 'AST-0002', assetName: 'HVAC Compressor B', referenceNumber: 'MOV-04012026-124348', status: 'Completed', movementDate: '2026-01-04', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { assetId: 'AST-0003', assetName: 'Laptop Dell XPS 15', referenceNumber: 'MOV-28102025-001', status: 'Created', movementDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'Asset Controller' },
    { assetId: 'AST-0004', assetName: 'Generator Set 250kVA', referenceNumber: 'MOV-16072025-113328', status: 'Completed', movementDate: '2025-07-16', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { assetId: 'AST-0005', assetName: 'Office Desk Set A', referenceNumber: 'MOV-25062025-163605', status: 'Created', movementDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'Asset Controller' },
    { assetId: 'AST-0006', assetName: 'Excavator CAT 320', referenceNumber: 'MOV-22052025-134205', status: 'Completed', movementDate: '2025-05-22', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { assetId: 'AST-0007', assetName: 'Server Rack Unit 2', referenceNumber: 'MOV-06022025-114540', status: 'Completed', movementDate: '2025-02-06', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { assetId: 'AST-0008', assetName: 'Pickup Truck Toyota Hilux', referenceNumber: 'MOV-08012025-125223', status: 'Created', movementDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'Asset Controller' },
    { assetId: 'AST-0009', assetName: 'Air Compressor Model C', referenceNumber: 'MOV-13112024-143301', status: 'Created', movementDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'Asset Controller' },
    { assetId: 'AST-0010', assetName: 'Welding Machine MIG 200', referenceNumber: 'MOV-13112024-141057', status: 'Completed', movementDate: '2024-11-13', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { assetId: 'AST-0011', assetName: 'Conference Room Projector', referenceNumber: 'MOV-22102024-123301', status: 'Completed', movementDate: '2024-10-22', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { assetId: 'AST-0012', assetName: 'Backhoe Loader JCB 3CX', referenceNumber: 'MOV-23092024-122221', status: 'Completed', movementDate: '2024-09-23', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { assetId: 'AST-0013', assetName: 'Water Pump Model P3', referenceNumber: 'MOV-11092024-144441', status: 'Completed', movementDate: '2024-09-11', lastApprovalWorkflow: 'General Manager', nextApprovalWorkflow: '' },
    { assetId: 'AST-0014', assetName: 'Scissor Lift Genie GS-1930', referenceNumber: 'MOV-09092024-113124', status: 'Created', movementDate: '', lastApprovalWorkflow: '', nextApprovalWorkflow: 'Asset Controller' }
  ];

  showFormModal = false;
  isEditMode = false;
  private editingEntry: AssetMovementEntry | null = null;
  form: AssetMovementForm = this.emptyForm();

  private emptyForm(): AssetMovementForm {
    return {
      assetId: '',
      assetName: '',
      referenceNumber: '',
      status: '',
      movementDate: '',
      lastApprovalWorkflow: '',
      nextApprovalWorkflow: ''
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
    this.isEditMode = true;
    this.editingEntry = entry;
    this.form = {
      assetId: entry.assetId,
      assetName: entry.assetName,
      referenceNumber: entry.referenceNumber,
      status: entry.status,
      movementDate: entry.movementDate,
      lastApprovalWorkflow: entry.lastApprovalWorkflow,
      nextApprovalWorkflow: entry.nextApprovalWorkflow
    };
    this.showFormModal = true;
  }

  deleteRow(entry: AssetMovementEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
