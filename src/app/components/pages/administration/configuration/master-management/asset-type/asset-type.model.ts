export type AssetTypeStatus = 'Active' | 'Inactive';

export interface MasterManagementAssetTypeItem {
  assetTypeId: string;
  assetTypeName: string;
  assetTypeCode: string;
  description: string;
  status: AssetTypeStatus | '';
}
