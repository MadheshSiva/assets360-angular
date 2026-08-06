import { Injectable } from '@angular/core';
import { MasterManagementPermissionMasterItem, PermissionAction } from './permission-master.model';

@Injectable({ providedIn: 'root' })
export class MasterManagementPermissionMasterService {
  readonly permissionNameMaster: PermissionAction[] = ['Create', 'Edit', 'Delete', 'View', 'Approve'];
  readonly moduleMaster: string[] = ['Dashboard', 'Assets', 'Maintenance', 'WIP', 'Master Management', 'Reports', 'Administration'];

  private readonly records: MasterManagementPermissionMasterItem[] = [
    {
      permissionId: 'PRM-1001',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      permissionName: 'Create',
      module: 'Assets'
    },
    {
      permissionId: 'PRM-1002',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      permissionName: 'Edit',
      module: 'Maintenance'
    },
    {
      permissionId: 'PRM-1003',
      assetId: 'AST-1003',
      assetName: 'Chiller Pump 2',
      permissionName: 'Delete',
      module: 'WIP'
    },
    {
      permissionId: 'PRM-1004',
      assetId: 'AST-1001',
      assetName: 'HVAC Unit 1',
      permissionName: 'View',
      module: 'Reports'
    },
    {
      permissionId: 'PRM-1005',
      assetId: 'AST-1002',
      assetName: 'Fire Panel A',
      permissionName: 'Approve',
      module: 'Administration'
    }
  ];

  private nextSequence = 1006;

  getRecords(): MasterManagementPermissionMasterItem[] {
    return this.records;
  }

  addRecord(record: MasterManagementPermissionMasterItem): MasterManagementPermissionMasterItem {
    const permissionId = record.permissionId?.trim() || `PRM-${this.nextSequence++}`;
    const created: MasterManagementPermissionMasterItem = { ...record, permissionId };
    this.records.push(created);
    return created;
  }

  updateRecord(permissionId: string, changes: MasterManagementPermissionMasterItem): void {
    const index = this.records.findIndex((r) => r.permissionId === permissionId);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(permissionIds: string[]): void {
    for (const id of permissionIds) {
      const index = this.records.findIndex((r) => r.permissionId === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): MasterManagementPermissionMasterItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
