import { Injectable, signal } from '@angular/core';

export type UserRole = 'viewer' | 'supervisor' | 'admin' | 'technician';

export const ROLE_LABELS: Record<UserRole, string> = {
  viewer: 'Viewer',
  supervisor: 'Supervisor',
  admin: 'Admin',
  technician: 'Technician',
};

export const ALL_ROLES: UserRole[] = ['viewer', 'supervisor', 'admin', 'technician'];

/**
 * Lightweight, self-contained role gate for Locating's admin-style tools (draw zones,
 * geofencing rules). The `locating` micro-frontend has no shared runtime session/auth
 * store reachable from `shared-ui` today (see the shell's separate RoleService), so this
 * is a demo-scope stand-in using the same role vocabulary — swap for a real
 * session-derived role once the shell exposes one across federation.
 */
@Injectable({ providedIn: 'root' })
export class CurrentRoleService {
  private readonly _role = signal<UserRole>('admin');
  readonly role = this._role.asReadonly();

  setRole(role: UserRole): void {
    this._role.set(role);
  }

  canDraw(): boolean {
    return this._role() === 'admin' || this._role() === 'technician';
  }

  canManageGeofencing(): boolean {
    return this._role() === 'admin' || this._role() === 'supervisor';
  }
}
