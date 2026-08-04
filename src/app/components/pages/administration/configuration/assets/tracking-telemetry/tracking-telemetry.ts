import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';

export interface TrackingTelemetryEntry {
  deviceId: string;
  tagIds: string;
  movementLogs: string;
  lastSeenTimestamp: string;
  speedRoute: string;
  sensorData: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-tracking-telemetry',
  imports: [CommonModule, ImportFileModal, RowActions],
  templateUrl: './tracking-telemetry.html',
  styleUrls: ['./tracking-telemetry.css']
})
export class AssetTrackingTelemetry {
  readonly importColumns: ImportColumn[] = [
    { key: 'deviceId', label: 'Device ID / IMEI / MAC' },
    { key: 'tagIds', label: 'Tag IDs (QR / RFID / BLE / GPS)' },
    { key: 'movementLogs', label: 'Movement Logs (Timestamp + Location)' },
    { key: 'lastSeenTimestamp', label: 'Last Seen Timestamp' },
    { key: 'speedRoute', label: 'Speed / Route (Vehicles)' },
    { key: 'sensorData', label: 'Sensor Data (Temp / Vibration / Battery)' }
  ];

  showImportModal = false;

  entries: TrackingTelemetryEntry[] = [
    {
      deviceId: 'IMEI-356938035643809',
      tagIds: 'BLE',
      movementLogs: '12 logs today',
      lastSeenTimestamp: '2026-07-04 09:42',
      speedRoute: '42 km/h - Route 3',
      sensorData: 'Temp 24°C, Vibration Low, Battery 78%'
    },
    {
      deviceId: 'MAC-3C:5A:B4:12:9E:01',
      tagIds: 'RFID',
      movementLogs: '5 logs today',
      lastSeenTimestamp: '2026-07-04 08:15',
      speedRoute: '-',
      sensorData: 'Temp 21°C, Vibration None, Battery 92%'
    }
  ];

  onAdd(): void {
    // TODO: open add tracking & telemetry entry flow
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    this.entries = [
      ...this.entries,
      ...rows.map((row) => ({
        deviceId: row['deviceId'] ?? '',
        tagIds: row['tagIds'] ?? '',
        movementLogs: row['movementLogs'] ?? '',
        lastSeenTimestamp: row['lastSeenTimestamp'] ?? '',
        speedRoute: row['speedRoute'] ?? '',
        sensorData: row['sensorData'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current tracking & telemetry list
  }

  onRefresh(): void {
    // TODO: reload tracking & telemetry data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  editRow(record: TrackingTelemetryEntry): void {
    // TODO: open edit tracking & telemetry entry flow for the given record
  }

  deleteRow(record: TrackingTelemetryEntry): void {
    this.entries = this.entries.filter((entry) => entry !== record);
  }
}
