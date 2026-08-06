export type ResponseTypeName = 'Yes/No' | 'Numeric' | 'Text' | 'Image Upload';
export type ResponseValidationType = 'None' | 'Range' | 'Regex' | 'Required';

export interface MasterManagementResponseTypeMasterItem {
  typeId: string;
  assetId: string;
  assetName: string;
  typeName: ResponseTypeName | '';
  validationType: ResponseValidationType | '';
  isActive: boolean;
}
