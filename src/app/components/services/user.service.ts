import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModulePermission {
  module: string;
  view: boolean;
  edit: boolean;
}

export interface AppRole {
  roleId: number;
  roleName: string;
  description: string;
  accessPermission: ModulePermission[];
  clientId: string;
}

export const DEFAULT_MODULES: string[] = [
  'Dashboard',
  'Events',
  'Reports',
  'Administration',
  'Visitor Management',
  'Meal Tracking',
  'Patrol Tracking',
  'OT Management',
  'Evacuation'
];

function buildDefaultPermissions(): ModulePermission[] {
  return DEFAULT_MODULES.map(module => ({ module, view: false, edit: false }));
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private rolesSubject = new BehaviorSubject<AppRole[]>([
    {
      roleId: 1,
      roleName: 'Admin',
      description: 'Full system access',
      accessPermission: DEFAULT_MODULES.map(module => ({ module, view: true, edit: true })),
      clientId: 'CLT-1001'
    },
    {
      roleId: 2,
      roleName: 'Operator',
      description: 'Manages daily operations',
      accessPermission: DEFAULT_MODULES.map(module => ({ module, view: true, edit: false })),
      clientId: 'CLT-1002'
    },
    {
      roleId: 3,
      roleName: 'Viewer',
      description: 'Read-only access',
      accessPermission: DEFAULT_MODULES.map(module => ({ module, view: true, edit: false })),
      clientId: 'CLT-1003'
    },
    {
      roleId: 4,
      roleName: 'Auditor',
      description: 'Reviews logs and reports',
      accessPermission: DEFAULT_MODULES.map(module => ({ module, view: true, edit: false })),
      clientId: 'CLT-1004'
    }
  ]);
  private nextIdSubject = new BehaviorSubject<number>(5);

  getRoles(): AppRole[] {
    return this.rolesSubject.value;
  }

  getEmptyPermissions(): ModulePermission[] {
    return buildDefaultPermissions();
  }

  addRole(role: Omit<AppRole, 'roleId'>): AppRole {
    const currentId = this.nextIdSubject.value;
    const newRole: AppRole = { ...role, roleId: currentId } as AppRole;
    this.rolesSubject.next([newRole, ...this.rolesSubject.value]);
    this.nextIdSubject.next(currentId + 1);
    return newRole;
  }

  updateRole(roleId: number, changes: Partial<AppRole>): void {
    this.rolesSubject.next(
      this.rolesSubject.value.map(r => r.roleId === roleId ? { ...r, ...changes } as AppRole : r)
    );
  }

  deleteRole(roleId: number): void {
    this.rolesSubject.next(this.rolesSubject.value.filter(r => r.roleId !== roleId));
  }

  search(term: string): AppRole[] {
    const t = term.trim().toLowerCase();
    if (!t) return this.rolesSubject.value;
    return this.rolesSubject.value.filter(r =>
      r.roleName.toLowerCase().includes(t) ||
      r.description.toLowerCase().includes(t) ||
      r.clientId.toLowerCase().includes(t) ||
      r.accessPermission.some(p => p.module.toLowerCase().includes(t))
    );
  }

  /** Helper for display in the list table, e.g. "Dashboard (V), Events (V/E)" */
  summarizePermissions(perms: ModulePermission[]): string {
    return perms
      .filter(p => p.view || p.edit)
      .map(p => `${p.module} (${[p.view ? 'V' : '', p.edit ? 'E' : ''].filter(Boolean).join('/')})`)
      .join(', ') || '—';
  }
}