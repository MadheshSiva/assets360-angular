export interface InspectionDepartmentItem {
  departmentCode: string;
  assetId: string;
  assetName: string;
  departmentName: string;
  businessUnit: string;
  departmentHead: string;
  description: string;
  status: boolean;
}

export interface InspectionDepartmentRow extends InspectionDepartmentItem {
  selected?: boolean;
}
