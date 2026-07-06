export interface VendorAmcRecord {
  vendorName: string;
  contractId: string;
  startDate: string;
  endDate: string;
  slaTerms: string;
  responseTime: number | null;
  contactDetails: string;
  selected?: boolean;
}

export type VendorAmcForm = Omit<VendorAmcRecord, 'selected'>;
