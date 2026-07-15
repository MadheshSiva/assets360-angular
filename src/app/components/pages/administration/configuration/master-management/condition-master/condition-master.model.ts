export type ConditionName = 'Good' | 'Warning' | 'Critical';

export interface MasterManagementConditionMasterItem {
  conditionId: string;
  conditionName: ConditionName | '';
  thresholdValue: number | null;
  colorCode: string;
}
