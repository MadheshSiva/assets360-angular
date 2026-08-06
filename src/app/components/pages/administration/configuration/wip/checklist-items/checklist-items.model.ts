export interface ChecklistItem {
  itemId: string;
  assetId: string;
  assetName: string;
  checklistId: string;
  itemDescription: string;
  responseType: string;
  thresholdValue: number | null;
  isCritical: boolean;
  sequenceOrder: number | null;
}
