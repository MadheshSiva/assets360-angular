export interface InspectionOrganizationItem {
  organizationCode: string;
  assetId: string;
  assetName: string;
  organizationName: string;
  legalName: string;
  logo: string;
  address: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  timeZone: string;
  dateFormat: string;
  currency: string;
  status: boolean;
}

export interface InspectionOrganizationRow extends InspectionOrganizationItem {
  selected?: boolean;
}
