export interface MasterManagementDepartmentItem {
  departmentCode: string;
  assetId: string;
  assetName: string;
  departmentName: string;
  businessUnit: string;
  departmentHead: string;
  description: string;
  status: boolean;
}

export interface MasterManagementDepartmentRow extends MasterManagementDepartmentItem {
  selected?: boolean;
}
