export type CustodianDepartmentType = 'Department' | 'Custodian';
export type CustodianDepartmentStatus = 'Active' | 'Inactive';

export interface MasterManagementCustodianDepartmentItem {
  recordType: CustodianDepartmentType | '';
  id: string;
  name: string;
  description: string;
  status: CustodianDepartmentStatus | '';
  role: string;
  departmentCode: string;
}
