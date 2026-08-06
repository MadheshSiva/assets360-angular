export interface CostTrackingRecord {
  assetId: string;
  assetName: string;
  laborCost: number | null;
  sparePartsCost: number | null;
  totalMaintenanceCost: number | null;
  budgetAllocation: number | null;
  costPerAsset: number | null;
  selected?: boolean;
}

export type CostTrackingForm = Omit<CostTrackingRecord, 'selected' | 'totalMaintenanceCost'>;
