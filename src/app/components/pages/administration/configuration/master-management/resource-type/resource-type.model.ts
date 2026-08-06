export type ResourceTypeCategory = 'Technician' | 'Contractor' | 'Engineer';

export interface MasterManagementResourceTypeItem {
  resourceTypeId: string;
  assetId: string;
  assetName: string;
  resourceTypeName: string;
  category: ResourceTypeCategory | '';
  isActive: boolean;
}
