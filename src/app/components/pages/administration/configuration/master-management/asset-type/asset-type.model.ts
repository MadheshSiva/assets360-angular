export type AssetTypeStatus = 'Active' | 'Inactive';

export interface MasterManagementAssetTypeItem {
  assetTypeId: string;
  assetId: string;
  assetName: string;
  assetTypeName: string;
  assetTypeCode: string;
  description: string;
  status: AssetTypeStatus | '';
}
