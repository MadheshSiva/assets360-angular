import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';

export interface TrackingTelemetryEntry {
  assetId: string;
  assetName: string;
  deviceId: string;
  tagIds: string;
  movementLogs: string;
  lastSeenTimestamp: string;
  speedRoute: string;
  sensorData: string;
}

type TrackingTelemetryEntryForm = TrackingTelemetryEntry;

@Component({
  standalone: true,
  selector: 'app-asset-tracking-telemetry',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './tracking-telemetry.html',
  styleUrls: ['./tracking-telemetry.css']
})
export class AssetTrackingTelemetry {
  readonly importColumns: ImportColumn[] = [
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'deviceId', label: 'Device ID / IMEI / MAC' },
    { key: 'tagIds', label: 'Tag IDs (QR / RFID / BLE / GPS)' },
    { key: 'movementLogs', label: 'Movement Logs (Timestamp + Location)' },
    { key: 'lastSeenTimestamp', label: 'Last Seen Timestamp' },
    { key: 'speedRoute', label: 'Speed / Route (Vehicles)' },
    { key: 'sensorData', label: 'Sensor Data (Temp / Vibration / Battery)' }
  ];

  showImportModal = false;

  showFormModal = false;
  isEditMode = false;
  private editingEntry: TrackingTelemetryEntry | null = null;
  form: TrackingTelemetryEntryForm = this.emptyForm();

  entries: TrackingTelemetryEntry[] = [
    {
      assetId: 'AST-0001',
      assetName: 'Forklift Unit 4',
      deviceId: 'IMEI-356938035643809',
      tagIds: 'BLE',
      movementLogs: '12 logs today',
      lastSeenTimestamp: '2026-07-04 09:42',
      speedRoute: '42 km/h - Route 3',
      sensorData: 'Temp 24°C, Vibration Low, Battery 78%'
    },
    {
      assetId: 'AST-0002',
      assetName: 'Delivery Van 2',
      deviceId: 'MAC-3C:5A:B4:12:9E:01',
      tagIds: 'RFID',
      movementLogs: '5 logs today',
      lastSeenTimestamp: '2026-07-04 08:15',
      speedRoute: '-',
      sensorData: 'Temp 21°C, Vibration None, Battery 92%'
    }
  ];

  private emptyForm(): TrackingTelemetryEntryForm {
    return {
      assetId: '',
      assetName: '',
      deviceId: '',
      tagIds: '',
      movementLogs: '',
      lastSeenTimestamp: '',
      speedRoute: '',
      sensorData: ''
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
    this.isEditMode = true;
    this.editingEntry = record;
    this.form = {
      assetId: record.assetId,
      assetName: record.assetName,
      deviceId: record.deviceId,
      tagIds: record.tagIds,
      movementLogs: record.movementLogs,
      lastSeenTimestamp: record.lastSeenTimestamp,
      speedRoute: record.speedRoute,
      sensorData: record.sensorData
    };
    this.showFormModal = true;
  }

  deleteRow(record: TrackingTelemetryEntry): void {
    this.entries = this.entries.filter((entry) => entry !== record);
  }
}
