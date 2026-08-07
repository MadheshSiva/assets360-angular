export interface InspectionTypeMasterItem {
  inspectionTypeCode: string;
  assetId: string;
  assetName: string;
  inspectionTypeName: string;
  description: string;
  defaultPriority: string;
  defaultApprovalWorkflow: string;
  defaultReportTemplate: string;
  status: boolean;
}

export interface InspectionTypeMasterRow extends InspectionTypeMasterItem {
  selected?: boolean;
}
