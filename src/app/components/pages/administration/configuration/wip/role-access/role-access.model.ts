export type RoleAccessPermission = 'Create' | 'Edit' | 'Delete' | 'View' | 'Approve';
export type RoleAccessDataLevel = 'Site' | 'Dept' | 'Global';

export interface RoleAccess {
  roleId: string;
  roleName: string;
  permissions: RoleAccessPermission[];
  moduleAccess: string[];
  dataAccessLevel: RoleAccessDataLevel | '';
  selected?: boolean;
}

export type RoleAccessForm = Omit<RoleAccess, 'selected'>;
