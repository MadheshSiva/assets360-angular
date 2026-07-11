import { Injectable } from '@angular/core';
import { MasterManagementMasterItem } from './master-maintenance.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementMasterService {
  readonly categoryMaster: string[] = ['Preventive', 'Predictive', 'Corrective', 'Breakdown'];
  readonly frequencyMaster: string[] = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];

  private readonly records: MasterManagementMasterItem[] = [
    {
      maintenanceId: 'MST-1001',
      maintenanceCode: 'PM-STD',
      maintenanceName: 'Standard Preventive Maintenance',
      maintenanceCategory: 'Preventive',
      frequency: 'Monthly',
      standardDurationHours: 2,
      description: 'Routine inspection and servicing of assets on a fixed schedule',
      isActive: true
    },
    {
      maintenanceId: 'MST-1002',
      maintenanceCode: 'PDM-STD',
      maintenanceName: 'Condition-based Predictive Check',
      maintenanceCategory: 'Predictive',
      frequency: 'Weekly',
      standardDurationHours: 1,
      description: 'Sensor-driven checks to predict failure before it occurs',
      isActive: true
    },
    {
      maintenanceId: 'MST-1003',
      maintenanceCode: 'CM-STD',
      maintenanceName: 'Corrective Repair',
      maintenanceCategory: 'Corrective',
      frequency: 'Yearly',
      standardDurationHours: 4,
      description: 'Repair work triggered after a fault is identified',
      isActive: true
    },
    {
      maintenanceId: 'MST-1004',
      maintenanceCode: 'BD-STD',
      maintenanceName: 'Breakdown Response',
      maintenanceCategory: 'Breakdown',
      frequency: 'Daily',
      standardDurationHours: 3,
      description: 'Unplanned response to an asset breakdown or failure',
      isActive: false
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementMasterItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementMasterItem): MasterManagementMasterItem {
    const maintenanceId = record.maintenanceId?.trim() || `MST-${this.nextSequence++}`;
    const created: MasterManagementMasterItem = { ...record, maintenanceId };
    this.records.push(created);
    return created;
  }

  updateRecord(maintenanceId: string, changes: MasterManagementMasterItem): void {
    const index = this.records.findIndex((r) => r.maintenanceId === maintenanceId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(maintenanceIds: string[]): void {
    for (const id of maintenanceIds) {
      const index = this.records.findIndex((r) => r.maintenanceId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementMasterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
