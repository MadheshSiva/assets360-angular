import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './maintenance-service.html',
  styleUrls: ['./maintenance-service.css']
})
export class AssetMaintenanceService {
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
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
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
}
