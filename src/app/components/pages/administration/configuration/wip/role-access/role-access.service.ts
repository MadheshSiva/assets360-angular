import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RoleAccess, RoleAccessPermission } from './role-access.model';

@Injectable({ providedIn: 'root' })
export class RoleAccessService {
  readonly permissionMaster: RoleAccessPermission[] = ['Create', 'Edit', 'Delete', 'View', 'Approve'];

  readonly moduleMaster: string[] = [
    'Dashboard',
    'Locating',
    'Events',
    'Report',
    'Process & Automation',
    'Administration',
    'Configuration',
    'Assets',
    'Maintenance',
    'WIP',
    'Master Management',
    'License'
  ];

  readonly dataAccessLevelMaster: string[] = ['Site', 'Dept', 'Global'];

  private readonly recordsSubject = new BehaviorSubject<RoleAccess[]>([
    {
      roleId: 'ROL-1001',
      roleName: 'Site Administrator',
      permissions: ['Create', 'Edit', 'Delete', 'View', 'Approve'],
      moduleAccess: ['Dashboard', 'Administration', 'Configuration', 'WIP'],
      dataAccessLevel: 'Site'
    },
    {
      roleId: 'ROL-1002',
      roleName: 'WIP Viewer',
      permissions: ['View'],
      moduleAccess: ['WIP', 'Dashboard'],
      dataAccessLevel: 'Dept'
    }
  ]);

  private nextSequence = 1003;

  getRecords(): RoleAccess[] {
    return this.recordsSubject.value;
  }

  addRecord(record: RoleAccess): RoleAccess {
    const roleId = record.roleId || `ROL-${this.nextSequence++}`;
    const created: RoleAccess = { ...record, roleId };
    this.recordsSubject.next([...this.recordsSubject.value, created]);
    return created;
  }

  updateRecord(roleId: string, changes: RoleAccess): void {
    this.recordsSubject.next(
      this.recordsSubject.value.map((r) => (r.roleId === roleId ? { ...r, ...changes } : r))
    );
  }

  deleteRecords(roleIds: string[]): void {
    this.recordsSubject.next(this.recordsSubject.value.filter((r) => !roleIds.includes(r.roleId)));
  }

  search(term: string): RoleAccess[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.recordsSubject.value;
    return this.recordsSubject.value.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
