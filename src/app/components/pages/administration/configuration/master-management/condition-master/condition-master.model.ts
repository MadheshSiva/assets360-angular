export type ConditionName = 'Good' | 'Warning' | 'Critical';

export interface MasterManagementConditionMasterItem {
  conditionId: string;
  assetId: string;
  assetName: string;
  conditionName: ConditionName | '';
  thresholdValue: number | null;
  colorCode: string;
}
