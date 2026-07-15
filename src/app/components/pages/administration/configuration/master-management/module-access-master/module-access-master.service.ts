import { Injectable } from '@angular/core';
import { MasterManagementModuleAccessMasterItem } from './module-access-master.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementModuleAccessMasterService {
  private readonly records: MasterManagementModuleAccessMasterItem[] = [
    {
      moduleId: 'MOD-1001',
      moduleName: 'Dashboard',
      routePath: '/dashboard',
      icon: 'dashboardpurple.png'
    },
    {
      moduleId: 'MOD-1002',
      moduleName: 'Assets',
      routePath: '/administration/configuration/assets',
      icon: 'assets-purple.png'
    },
    {
      moduleId: 'MOD-1003',
      moduleName: 'Maintenance',
      routePath: '/administration/configuration/maintenance',
      icon: 'maintenance-purple.png'
    },
    {
      moduleId: 'MOD-1004',
      moduleName: 'Reports',
      routePath: '/report',
      icon: 'reports-purple.png'
    }
  ];

  private nextSequence = 1005;

  getRecords(): MasterManagementModuleAccessMasterItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementModuleAccessMasterItem): MasterManagementModuleAccessMasterItem {
    const moduleId = record.moduleId?.trim() || `MOD-${this.nextSequence++}`;
    const created: MasterManagementModuleAccessMasterItem = { ...record, moduleId };
    this.records.push(created);
    return created;
  }

  updateRecord(moduleId: string, changes: MasterManagementModuleAccessMasterItem): void {
    const index = this.records.findIndex((r) => r.moduleId === moduleId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(moduleIds: string[]): void {
    for (const id of moduleIds) {
      const index = this.records.findIndex((r) => r.moduleId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementModuleAccessMasterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
