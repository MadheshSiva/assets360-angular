export type ResourceTypeCategory = 'Technician' | 'Contractor' | 'Engineer';

export interface MasterManagementResourceTypeItem {
  resourceTypeId: string;
  resourceTypeName: string;
  category: ResourceTypeCategory | '';
  isActive: boolean;
}
