export type AssetTypeFieldDataType = 'Text' | 'Number' | 'Date' | 'Dropdown' | 'Checkbox';
export type AssetTypeFieldRequired = 'Yes' | 'No';

export interface MasterManagementAssetTypeFieldsItem {
  fieldId: string;
  assetId: string;
  assetName: string;
  assetType: string;
  fieldName: string;
  fieldType: AssetTypeFieldDataType | '';
  isRequired: AssetTypeFieldRequired | '';
}
