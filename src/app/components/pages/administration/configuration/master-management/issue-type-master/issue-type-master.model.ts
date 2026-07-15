export type IssueCategory = 'Technical' | 'Resource' | 'Material' | 'External';

export interface MasterManagementIssueTypeMasterItem {
  issueTypeId: string;
  issueTypeName: string;
  category: IssueCategory | '';
  isActive: boolean;
}
