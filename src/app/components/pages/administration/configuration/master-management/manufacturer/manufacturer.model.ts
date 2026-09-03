export interface MasterManagementManufacturerItem {
  manufacturerCode: string;
  assetId: string;
  assetName: string;
  manufacturerName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  status: boolean;
}

export interface MasterManagementManufacturerRow extends MasterManagementManufacturerItem {
  selected?: boolean;
}
