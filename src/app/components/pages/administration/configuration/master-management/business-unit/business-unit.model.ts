export interface MasterManagementBusinessUnitItem {
  businessUnitCode: string;
  assetId: string;
  assetName: string;
  businessUnitName: string;
  organization: string;
  description: string;
  businessUnitHead: string;
  email: string;
  phone: string;
  status: boolean;
}

export interface MasterManagementBusinessUnitRow extends MasterManagementBusinessUnitItem {
  selected?: boolean;
}
