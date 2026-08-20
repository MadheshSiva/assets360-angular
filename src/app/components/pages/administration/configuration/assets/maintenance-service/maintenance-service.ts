import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';

export interface MaintenanceServiceEntry {
  assetId: string;
  assetName: string;
  maintenanceSchedule: string;
  workOrders: string;
  serviceHistory: string;
  repairLogs: string;
  downtimeDuration: string;
  sparePartsUsed: string;
  vendorServiceProvider: string;
}

type MaintenanceServiceEntryForm = MaintenanceServiceEntry;

@Component({
  standalone: true,
  selector: 'app-asset-maintenance-service',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './maintenance-service.html',
  styleUrls: ['./maintenance-service.css']
})
export class AssetMaintenanceService {
  readonly importColumns: ImportColumn[] = [
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'maintenanceSchedule', label: 'Maintenance Schedule' },
    { key: 'workOrders', label: 'Work Orders' },
    { key: 'serviceHistory', label: 'Service History' },
    { key: 'repairLogs', label: 'Repair Logs' },
    { key: 'downtimeDuration', label: 'Downtime Duration' },
    { key: 'sparePartsUsed', label: 'Spare Parts Used' },
    { key: 'vendorServiceProvider', label: 'Vendor / Service Provider Details' }
  ];

  showImportModal = false;

  showFormModal = false;
  isEditMode = false;
  private editingEntry: MaintenanceServiceEntry | null = null;
  form: MaintenanceServiceEntryForm = this.emptyForm();

  entries: MaintenanceServiceEntry[] = [
    {
      assetId: 'AST-0001',
      assetName: 'HVAC Compressor Unit 2',
      maintenanceSchedule: '2026-08-15',
      workOrders: 'WO-2041',
      serviceHistory: '4 services completed',
      repairLogs: '1 repair logged',
      downtimeDuration: '2 hrs',
      sparePartsUsed: 'Filter, Belt',
      vendorServiceProvider: 'Al Futtaim Technical Services'
    },
    {
      assetId: 'AST-0002',
      assetName: 'Backup Power Generator',
      maintenanceSchedule: '2026-09-01',
      workOrders: 'WO-2078',
      serviceHistory: '2 services completed',
      repairLogs: 'No repairs logged',
      downtimeDuration: '0 hrs',
      sparePartsUsed: '-',
      vendorServiceProvider: 'Emirates Facility Solutions'
    }
  ];

  private emptyForm(): MaintenanceServiceEntryForm {
    return {
      assetId: '',
      assetName: '',
      maintenanceSchedule: '',
      workOrders: '',
      serviceHistory: '',
      repairLogs: '',
      downtimeDuration: '',
      sparePartsUsed: '',
      vendorServiceProvider: ''
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
    this.isEditMode = true;
    this.editingEntry = entry;
    this.form = {
      assetId: entry.assetId,
      assetName: entry.assetName,
      maintenanceSchedule: entry.maintenanceSchedule,
      workOrders: entry.workOrders,
      serviceHistory: entry.serviceHistory,
      repairLogs: entry.repairLogs,
      downtimeDuration: entry.downtimeDuration,
      sparePartsUsed: entry.sparePartsUsed,
      vendorServiceProvider: entry.vendorServiceProvider
    };
    this.showFormModal = true;
  }

  deleteRow(entry: MaintenanceServiceEntry): void {
    this.entries = this.entries.filter((e) => e !== entry);
  }
}
