export type ResponseTypeName = 'Yes/No' | 'Numeric' | 'Text' | 'Image Upload';
export type ResponseValidationType = 'None' | 'Range' | 'Regex' | 'Required';

export interface MasterManagementResponseTypeMasterItem {
  typeId: string;
  typeName: ResponseTypeName | '';
  validationType: ResponseValidationType | '';
  isActive: boolean;
}
