import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './tracking-telemetry.html',
  styleUrls: ['./tracking-telemetry.css']
})
export class AssetTrackingTelemetry {
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
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
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
}
