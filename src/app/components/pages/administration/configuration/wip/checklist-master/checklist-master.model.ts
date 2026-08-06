export interface ChecklistMaster {
  checklistId: string;
  assetId: string;
  assetName: string;
  checklistName: string;
  checklistType: string;
  applicableWorkType: string[];
  versionNumber: number | null;
  isMandatory: boolean;
}
