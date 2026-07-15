export type PriorityName = 'Low' | 'Medium' | 'High' | 'Critical';

export interface MasterManagementPriorityItem {
  priorityId: string;
  priorityName: PriorityName | '';
  colorCode: string;
  slaMapping: string;
  isActive: boolean;
}
