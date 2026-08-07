export interface InspectionBusinessUnitItem {
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

export interface InspectionBusinessUnitRow extends InspectionBusinessUnitItem {
  selected?: boolean;
}
