import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HierarchyNode } from "../../models/hierarchy-node.model"

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
  hierarchyPermission: string[];
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
      hierarchyPermission: [],
      clientId: 'CLT-1001'
    },
    {
      roleId: 2,
      roleName: 'Operator',
      description: 'Manages daily operations',
      accessPermission: DEFAULT_MODULES.map(module => ({ module, view: true, edit: false })),
      hierarchyPermission: [],
      clientId: 'CLT-1002'
    },
    {
      roleId: 3,
      roleName: 'Viewer',
      description: 'Read-only access',
      accessPermission: DEFAULT_MODULES.map(module => ({ module, view: true, edit: false })),
      hierarchyPermission: [],
      clientId: 'CLT-1003'
    },
    {
      roleId: 4,
      roleName: 'Auditor',
      description: 'Reviews logs and reports',
      accessPermission: DEFAULT_MODULES.map(module => ({ module, view: true, edit: false })),
      hierarchyPermission: [],
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

  /**
   * Returns the project hierarchy tree used in the "Hierarchy Permission" panel.
   * In production, replace this with an HttpClient call to your projects API.
   */
  getHierarchyData(): HierarchyNode[] {
    return [
      {
        id: 'test', name: 'Test', checked: false, expanded: false,
        children: [
          { id: 'test-site-1', name: 'Site A', checked: false, expanded: false },
          { id: 'test-site-2', name: 'Site B', checked: false, expanded: false }
        ]
      },
      {
        id: 'maf', name: 'MAF', checked: false, expanded: false,
        children: [
          { id: 'maf-mall-1', name: 'MAF Mall 1', checked: false, expanded: false },
          { id: 'maf-mall-2', name: 'MAF Mall 2', checked: false, expanded: false }
        ]
      },
      {
        id: 'test2', name: 'Test2', checked: false, expanded: false,
        children: [
          { id: 'test2-site-1', name: 'Site A', checked: false, expanded: false }
        ]
      },
      {
        id: 'test3', name: 'Test3', checked: false, expanded: false,
        children: [
          { id: 'test3-site-1', name: 'Site A', checked: false, expanded: false }
        ]
      },
      {
        id: 'customer-analytics-bdf', name: 'Customer Analytics BDF', checked: false, expanded: false,
        children: [
          { id: 'ca-bdf-store-1', name: 'Store 1', checked: false, expanded: false },
          { id: 'ca-bdf-store-2', name: 'Store 2', checked: false, expanded: false }
        ]
      },
      {
        id: 'customer-analytics-mall', name: 'Customer Analytics MALL', checked: false, expanded: false,
        children: [
          { id: 'ca-mall-1', name: 'Mall 1', checked: false, expanded: false },
          { id: 'ca-mall-2', name: 'Mall 2', checked: false, expanded: false }
        ]
      },
      {
        id: 'red-crescent', name: 'Red Crescent', checked: false, expanded: false,
        children: [
          { id: 'rc-branch-1', name: 'Branch 1', checked: false, expanded: false },
          { id: 'rc-branch-2', name: 'Branch 2', checked: false, expanded: false }
        ]
      }
    ];
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