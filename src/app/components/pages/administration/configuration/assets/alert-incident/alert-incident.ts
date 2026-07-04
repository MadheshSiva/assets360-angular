import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './alert-incident.html',
  styleUrls: ['./alert-incident.css']
})
export class AssetAlertIncident {
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
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
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
}
