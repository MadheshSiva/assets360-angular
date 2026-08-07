export interface InspectionTaskItem {
  taskCode: string;
  assetId: string;
  assetName: string;
  taskTitle: string;
  taskCategory: string;
  taskDescription: string;
  responseType: string;
  isCritical: boolean;
  isMandatory: boolean;
  status: boolean;
}

export interface InspectionTaskRow extends InspectionTaskItem {
  selected?: boolean;
}
