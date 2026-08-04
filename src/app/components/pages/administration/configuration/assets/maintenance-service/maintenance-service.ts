import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';

export interface MaintenanceServiceEntry {
  maintenanceSchedule: string;
  workOrders: string;
  serviceHistory: string;
  repairLogs: string;
  downtimeDuration: string;
  sparePartsUsed: string;
  vendorServiceProvider: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-maintenance-service',
  imports: [CommonModule, ImportFileModal, RowActions],
  templateUrl: './maintenance-service.html',
  styleUrls: ['./maintenance-service.css']
})
export class AssetMaintenanceService {
  readonly importColumns: ImportColumn[] = [
    { key: 'maintenanceSchedule', label: 'Maintenance Schedule' },
    { key: 'workOrders', label: 'Work Orders' },
    { key: 'serviceHistory', label: 'Service History' },
    { key: 'repairLogs', label: 'Repair Logs' },
    { key: 'downtimeDuration', label: 'Downtime Duration' },
    { key: 'sparePartsUsed', label: 'Spare Parts Used' },
    { key: 'vendorServiceProvider', label: 'Vendor / Service Provider Details' }
  ];

  showImportModal = false;

  entries: MaintenanceServiceEntry[] = [
    {
      maintenanceSchedule: '2026-08-15',
      workOrders: 'WO-2041',
      serviceHistory: '4 services completed',
      repairLogs: '1 repair logged',
      downtimeDuration: '2 hrs',
      sparePartsUsed: 'Filter, Belt',
      vendorServiceProvider: 'Al Futtaim Technical Services'
    },
    {
      maintenanceSchedule: '2026-09-01',
      workOrders: 'WO-2078',
      serviceHistory: '2 services completed',
      repairLogs: 'No repairs logged',
      downtimeDuration: '0 hrs',
      sparePartsUsed: '-',
      vendorServiceProvider: 'Emirates Facility Solutions'
    }
  ];

  onAdd(): void {
    // TODO: open add maintenance & service entry flow
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    this.entries = [
      ...this.entries,
      ...rows.map((row) => ({
        maintenanceSchedule: row['maintenanceSchedule'] ?? '',
        workOrders: row['workOrders'] ?? '',
        serviceHistory: row['serviceHistory'] ?? '',
        repairLogs: row['repairLogs'] ?? '',
        downtimeDuration: row['downtimeDuration'] ?? '',
        sparePartsUsed: row['sparePartsUsed'] ?? '',
        vendorServiceProvider: row['vendorServiceProvider'] ?? ''
      }))
    ];
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current maintenance & service list
  }

  onRefresh(): void {
    // TODO: reload maintenance & service data from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }

  editRow(entry: MaintenanceServiceEntry): void {
    // TODO: open edit flow for a single row (no existing per-row edit flow to mirror on this page)
  }

  deleteRow(entry: MaintenanceServiceEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
