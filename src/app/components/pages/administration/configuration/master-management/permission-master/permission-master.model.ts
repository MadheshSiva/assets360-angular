export type PermissionAction = 'Create' | 'Edit' | 'Delete' | 'View' | 'Approve';

export interface MasterManagementPermissionMasterItem {
  permissionId: string;
  assetId: string;
  assetName: string;
  permissionName: PermissionAction | '';
  module: string;
}
