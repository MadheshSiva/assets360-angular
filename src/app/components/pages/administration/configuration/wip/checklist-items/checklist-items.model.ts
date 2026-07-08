export interface ChecklistItem {
  itemId: string;
  checklistId: string;
  itemDescription: string;
  responseType: string;
  thresholdValue: number | null;
  isCritical: boolean;
  sequenceOrder: number | null;
}
