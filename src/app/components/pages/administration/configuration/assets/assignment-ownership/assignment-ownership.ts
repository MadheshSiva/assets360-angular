import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';

export interface AssignmentOwnershipEntry {
  assignedCustodian: string;
  assignmentPeriod: string;
  transferHistory: string;
  custodianDetails: string;
  checkInOutLogs: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-assignment-ownership',
  imports: [CommonModule, ImportFileModal, RowActions],
  templateUrl: './assignment-ownership.html',
  styleUrls: ['./assignment-ownership.css']
})
export class AssetAssignmentOwnership {
  readonly importColumns: ImportColumn[] = [
    { key: 'assignedCustodian', label: 'Assigned Custodian / Department' },
    { key: 'assignmentPeriod', label: 'Assignment Start & End Date' },
    { key: 'transferHistory', label: 'Transfer History' },
    { key: 'custodianDetails', label: 'Custodian Details' },
    { key: 'checkInOutLogs', label: 'Check-in / Check-out Logs' }
  ];

  showImportModal = false;

  entries: AssignmentOwnershipEntry[] = [
    {
      assignedCustodian: 'John Doe / Facilities',
      assignmentPeriod: '2026-01-10 to 2026-06-30',
      transferHistory: '3 transfers',
      custodianDetails: 'John Doe - Facilities Manager',
      checkInOutLogs: 'Checked in: 2026-06-30 09:12'
    },
    {
      assignedCustodian: 'Aisha Khan / OT Management',
      assignmentPeriod: '2026-03-01 to Present',
      transferHistory: '1 transfer',
      custodianDetails: 'Aisha Khan - OT Supervisor',
      checkInOutLogs: 'Checked out: 2026-07-01 17:40'
    }
  ];

  onAdd(): void {
    // TODO: open add assignment flow
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    this.entries = [
      ...this.entries,
      ...rows.map((row) => ({
        assignedCustodian: row['assignedCustodian'] ?? '',
        assignmentPeriod: row['assignmentPeriod'] ?? '',
        transferHistory: row['transferHistory'] ?? '',
        custodianDetails: row['custodianDetails'] ?? '',
        checkInOutLogs: row['checkInOutLogs'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current assignment/ownership list
  }

  onRefresh(): void {
    // TODO: reload assignment/ownership data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  editRow(entry: AssignmentOwnershipEntry): void {
    // TODO: open edit flow for a single row (no existing per-row edit flow to mirror on this page)
  }

  deleteRow(entry: AssignmentOwnershipEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
