export interface PerformanceMetricRecord {
  assetId: string;
  mtbf: number | null;
  mttr: number | null;
  assetUptimePercent: number | null;
  maintenanceFrequency: number | null;
  selected?: boolean;
}

export type PerformanceMetricForm = Omit<PerformanceMetricRecord, 'selected'>;
