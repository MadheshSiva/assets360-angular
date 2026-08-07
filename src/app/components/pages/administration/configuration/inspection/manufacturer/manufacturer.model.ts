export interface InspectionManufacturerItem {
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

export interface InspectionManufacturerRow extends InspectionManufacturerItem {
  selected?: boolean;
}
