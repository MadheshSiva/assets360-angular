export interface PredictiveMaintenanceRecord {
  sensorType: string;
  thresholdValue: number | null;
  alertCondition: string;
  dataSource: string;
  predictionModelOutput: string;
  riskLevel: string;
  selected?: boolean;
}

export type PredictiveMaintenanceForm = Omit<PredictiveMaintenanceRecord, 'selected'>;
