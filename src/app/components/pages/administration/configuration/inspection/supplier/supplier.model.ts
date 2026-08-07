export interface InspectionSupplierItem {
  supplierCode: string;
  assetId: string;
  assetName: string;
  supplierName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  contractReference: string;
  status: boolean;
}

export interface InspectionSupplierRow extends InspectionSupplierItem {
  selected?: boolean;
}
