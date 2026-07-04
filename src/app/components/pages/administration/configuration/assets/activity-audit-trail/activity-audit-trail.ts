import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ActivityAuditTrailEntry {
  whoCreatedUpdatedAsset: string;
  changesMade: string;
  timestampLogs: string;
  accessLogs: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-activity-audit-trail',
  imports: [CommonModule],
  templateUrl: './activity-audit-trail.html',
  styleUrls: ['./activity-audit-trail.css']
})
export class AssetActivityAuditTrail {
  // All columns in this module are system-generated — there is no manual "Add" entry.
  entries: ActivityAuditTrailEntry[] = [
    {
      whoCreatedUpdatedAsset: 'N. Silva',
      changesMade: 'Location changed: Warehouse A → Warehouse B',
      timestampLogs: '2026-07-04 09:10',
      accessLogs: 'Viewed by A. Perera at 2026-07-04 09:15'
    },
    {
      whoCreatedUpdatedAsset: 'System',
      changesMade: 'Status changed: Active → Under Maintenance',
      timestampLogs: '2026-07-03 16:42',
      accessLogs: 'Viewed by J. Fernando at 2026-07-03 17:00'
    }
  ];

  onDownload(): void {
    // TODO: export current activity / audit trail list
  }

  onRefresh(): void {
    // TODO: reload activity / audit trail data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }
}
