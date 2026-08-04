import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { RowActions } from '@shared/row-actions/row-actions';

export interface AlertIncidentEntry {
  alertType: string;
  incidentReports: string;
  damageReports: string;
  theftLossRecords: string;
  resolutionStatus: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-alert-incident',
  imports: [CommonModule, FormsModule, ImportFileModal, MasterLinkIcons, RowActions],
  templateUrl: './alert-incident.html',
  styleUrls: ['./alert-incident.css']
})
export class AssetAlertIncident {
  readonly importColumns: ImportColumn[] = [
    { key: 'alertType', label: 'Alert Type' },
    { key: 'incidentReports', label: 'Incident Reports' },
    { key: 'damageReports', label: 'Damage Reports' },
    { key: 'theftLossRecords', label: 'Theft / Loss Records' },
    { key: 'resolutionStatus', label: 'Resolution Status' }
  ];

  showImportModal = false;

  // Master: alert type (geofence breach, low battery, etc.)
  alertTypeOptions: string[] = [
    'Geofence Breach',
    'Low Battery',
    'Unauthorized Movement',
    'Temperature Threshold',
    'Tamper Alert'
  ];

  // Master: resolution status
  resolutionStatusOptions: string[] = ['Open', 'In Progress', 'Resolved', 'Closed'];

  entries: AlertIncidentEntry[] = [
    {
      alertType: 'Geofence Breach',
      incidentReports: 'Forklift FL-08 exited designated zone',
      damageReports: '-',
      theftLossRecords: '-',
      resolutionStatus: 'Open'
    },
    {
      alertType: 'Low Battery',
      incidentReports: 'Tracker battery below 10%',
      damageReports: '-',
      theftLossRecords: '-',
      resolutionStatus: 'Resolved'
    }
  ];

  // Adds a new row directly to the table — each cell is already a live
  // dropdown/textbox, so there's no separate add form to fill in first.
  onAdd(): void {
    this.entries = [
      ...this.entries,
      {
        alertType: this.alertTypeOptions[0],
        incidentReports: '',
        damageReports: '',
        theftLossRecords: '',
        resolutionStatus: this.resolutionStatusOptions[0]
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
        alertType: row['alertType'] ?? '',
        incidentReports: row['incidentReports'] ?? '',
        damageReports: row['damageReports'] ?? '',
        theftLossRecords: row['theftLossRecords'] ?? '',
        resolutionStatus: row['resolutionStatus'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current alert & incident list
  }

  onRefresh(): void {
    // TODO: reload alert & incident data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  editRow(entry: AlertIncidentEntry): void {
    // TODO: open edit form for this alert / incident entry (fields are already inline-editable)
  }

  deleteRow(entry: AlertIncidentEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
