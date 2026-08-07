export interface InspectionSiteItem {
  siteCode: string;
  assetId: string;
  assetName: string;
  siteName: string;
  organization: string;
  businessUnit: string;
  siteType: string;
  address: string;
  country: string;
  state: string;
  city: string;
  gpsLatitude: string;
  gpsLongitude: string;
  siteManager: string;
  contactDetails: string;
  operatingHours: string;
  status: boolean;
}

export interface InspectionSiteRow extends InspectionSiteItem {
  selected?: boolean;
}
