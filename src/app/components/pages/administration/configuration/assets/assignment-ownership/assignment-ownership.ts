import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './assignment-ownership.html',
  styleUrls: ['./assignment-ownership.css']
})
export class AssetAssignmentOwnership {
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
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
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
}
