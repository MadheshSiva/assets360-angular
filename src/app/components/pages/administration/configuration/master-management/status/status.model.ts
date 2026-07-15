export interface MasterManagementStatusItem {
  statusId: string;
  statusName: string;
  colorCode: string;
  allowedTransitions: string[];
  isActive: boolean;
}
