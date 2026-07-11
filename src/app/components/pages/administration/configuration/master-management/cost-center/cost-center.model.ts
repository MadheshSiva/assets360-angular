export type CostCenterStatus = 'Active' | 'Inactive';

export interface MasterManagementCostCenterItem {
  costCenterId: string;
  costCenterName: string;
  costCenterCode: string;
  description: string;
  departmentId: string;
  parentCostCenterId: string;
  manager: string;
  budgetAmount: number | null;
  status: CostCenterStatus | '';
}
