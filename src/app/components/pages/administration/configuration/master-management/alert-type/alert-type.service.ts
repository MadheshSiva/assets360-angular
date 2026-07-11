import { Injectable } from '@angular/core';
import {
  AlertCategory,
  AlertNotificationType,
  AlertSeverity,
  AlertStatus,
  MasterManagementAlertTypeItem
} from './alert-type.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementAlertTypeService {
  readonly categoryMaster: AlertCategory[] = ['Geofence', 'Battery', 'Device Health', 'Security', 'Maintenance'];
  readonly severityMaster: AlertSeverity[] = ['Low', 'Medium', 'High', 'Critical'];
  readonly notificationTypeMaster: AlertNotificationType[] = ['Email', 'SMS', 'Push Notification', 'In-App'];
  readonly statusMaster: AlertStatus[] = ['Active', 'Inactive'];

  private readonly records: MasterManagementAlertTypeItem[] = [
    {
      alertTypeId: 'ALT-1001',
      alertName: 'Geofence Breach',
      alertCode: 'GEO-BRCH',
      description: 'Raised when an asset exits its assigned geofence boundary',
      category: 'Geofence',
      severity: 'High',
      triggerCondition: 'Asset location falls outside the assigned geofence boundary',
      notificationType: 'Push Notification',
      status: 'Active'
    },
    {
      alertTypeId: 'ALT-1002',
      alertName: 'Low Battery',
      alertCode: 'LOW-BATT',
      description: 'Raised when a tracked device battery level drops too low',
      category: 'Battery',
      severity: 'Medium',
      triggerCondition: 'Device battery level falls below 20%',
      notificationType: 'Email',
      status: 'Active'
    },
    {
      alertTypeId: 'ALT-1003',
      alertName: 'Equipment Breakdown',
      alertCode: 'EQP-BRK',
      description: 'Raised when an asset fails unexpectedly and requires immediate attention',
      category: 'Device Health',
      severity: 'Critical',
      triggerCondition: 'Asset reports a fault code or unexpected shutdown',
      notificationType: 'SMS',
      status: 'Active'
    },
    {
      alertTypeId: 'ALT-1004',
      alertName: 'Inspection Due',
      alertCode: 'INS-DUE',
      description: 'Raised when a routine inspection is coming up for an asset',
      category: 'Maintenance',
      severity: 'Low',
      triggerCondition: 'Scheduled inspection date is within 3 days',
      notificationType: 'In-App',
      status: 'Inactive'
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementAlertTypeItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementAlertTypeItem): MasterManagementAlertTypeItem {
    const alertTypeId = record.alertTypeId?.trim() || `ALT-${this.nextSequence++}`;
    const created: MasterManagementAlertTypeItem = { ...record, alertTypeId };
    this.records.push(created);
    return created;
  }

  updateRecord(alertTypeId: string, changes: MasterManagementAlertTypeItem): void {
    const index = this.records.findIndex((r) => r.alertTypeId === alertTypeId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(alertTypeIds: string[]): void {
    for (const id of alertTypeIds) {
      const index = this.records.findIndex((r) => r.alertTypeId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementAlertTypeItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
