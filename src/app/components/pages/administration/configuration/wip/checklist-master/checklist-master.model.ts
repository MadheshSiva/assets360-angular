export interface ChecklistMaster {
  checklistId: string;
  checklistName: string;
  checklistType: string;
  applicableWorkType: string[];
  versionNumber: number | null;
  isMandatory: boolean;
}
