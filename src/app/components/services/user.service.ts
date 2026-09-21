import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { HierarchyNode } from "../../models/hierarchy-node.model"
import { environment } from '../../../environments/environment';
import { AuthService } from '../service/auth/auth.service';

export interface ModulePermission {
  module: string;
  view: boolean;
  edit: boolean;
}

/** UI-friendly role model derived from the API's RoleDto. */
export interface AppRole {
  /** Mongo id used for GET/PUT/DELETE by id. */
  id: string;
  /** Human-readable role code assigned by the backend, e.g. "R639243719001560584". */
  roleId: string;
  roleName: string;
  description: string;
  accessPermission: ModulePermission[];
  clientId: string;
  tenantId: string;
}

/** Permission entry shape expected/returned by the user-account roles API. */
export interface AssignedPermission {
  featureName: string;
  viewOption: boolean;
  editOption: boolean;
}

/** Request body for POST/PUT {userAccountApiUrl}user-account/api/roles[/{id}] */
export interface RoleRequest {
  roleName: string;
  description: string;
  assignedPermissions: AssignedPermission[];
  createdBy: string;
  clientId: string;
  tenantId: string;
}

/** Raw shape returned by the user-account roles API. */
export interface RoleDto {
  id: string;
  roleId: string;
  roleName: string;
  description: string;
  assignedPermissions: AssignedPermission[];
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
  clientId: string;
  tenantId: string;
  status: string;
  isDeleted: boolean;
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

function toAppRole(dto: RoleDto): AppRole {
  return {
    id: dto.id,
    roleId: dto.roleId,
    roleName: dto.roleName,
    description: dto.description,
    accessPermission: dto.assignedPermissions.map(p => ({ module: p.featureName, view: p.viewOption, edit: p.editOption })),
    clientId: dto.clientId,
    tenantId: dto.tenantId
  };
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private rolesApiUrl = `${environment.userAccountApiUrl}user-account/api/roles`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getRoles(): Observable<AppRole[]> {
    return this.http.get<RoleDto[]>(this.rolesApiUrl).pipe(map(list => list.map(toAppRole)));
  }

  getRole(id: string): Observable<AppRole> {
    return this.http.get<RoleDto>(`${this.rolesApiUrl}/${id}`).pipe(map(toAppRole));
  }

  getEmptyPermissions(): ModulePermission[] {
    return buildDefaultPermissions();
  }

  /** Fills in any modules missing from a role's saved permissions so the form always shows the full list. */
  mergePermissions(existing: ModulePermission[]): ModulePermission[] {
    return DEFAULT_MODULES.map(module => existing.find(p => p.module === module) ?? { module, view: false, edit: false });
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

  /** POST /user-account/api/roles */
  createRole(roleName: string, description: string, permissions: ModulePermission[]): Observable<AppRole> {
    return this.http.post<RoleDto>(this.rolesApiUrl, this.buildRequest(roleName, description, permissions))
      .pipe(map(toAppRole));
  }

  /** PUT /user-account/api/roles/{id} */
  updateRole(id: string, roleName: string, description: string, permissions: ModulePermission[]): Observable<AppRole> {
    return this.http.put<RoleDto>(`${this.rolesApiUrl}/${id}`, this.buildRequest(roleName, description, permissions))
      .pipe(map(toAppRole));
  }

  /** DELETE /user-account/api/roles/{id} */
  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.rolesApiUrl}/${id}`);
  }

  /** Client-side filter over an already-fetched role list. */
  filterRoles(roles: AppRole[], term: string): AppRole[] {
    const t = term.trim().toLowerCase();
    if (!t) return roles;
    return roles.filter(r =>
      r.roleName.toLowerCase().includes(t) ||
      r.description.toLowerCase().includes(t) ||
      r.clientId.toLowerCase().includes(t) ||
      r.accessPermission.some(p => p.module.toLowerCase().includes(t))
    );
  }

  private buildRequest(roleName: string, description: string, permissions: ModulePermission[]): RoleRequest {
    return {
      roleName,
      description,
      assignedPermissions: permissions.map(p => ({
        featureName: p.module,
        viewOption: p.view,
        editOption: p.edit
      })),
      createdBy: this.auth.getUserEmail() || 'unknown',
      clientId: environment.clientId,
      tenantId: environment.tenantId
    };
  }

  /** Helper for display in the list table, e.g. "Dashboard (V), Events (V/E)" */
  summarizePermissions(perms: ModulePermission[]): string {
    return perms
      .filter(p => p.view || p.edit)
      .map(p => `${p.module} (${[p.view ? 'V' : '', p.edit ? 'E' : ''].filter(Boolean).join('/')})`)
      .join(', ') || '—';
  }
}