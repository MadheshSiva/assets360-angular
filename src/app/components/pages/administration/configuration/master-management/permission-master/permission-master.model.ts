export type PermissionAction = 'Create' | 'Edit' | 'Delete' | 'View' | 'Approve';

export interface MasterManagementPermissionMasterItem {
  permissionId: string;
  permissionName: PermissionAction | '';
  module: string;
}
