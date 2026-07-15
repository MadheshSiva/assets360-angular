export type AssetTypeFieldDataType = 'Text' | 'Number' | 'Date' | 'Dropdown' | 'Checkbox';
export type AssetTypeFieldRequired = 'Yes' | 'No';

export interface MasterManagementAssetTypeFieldsItem {
  fieldId: string;
  assetType: string;
  fieldName: string;
  fieldType: AssetTypeFieldDataType | '';
  isRequired: AssetTypeFieldRequired | '';
}
