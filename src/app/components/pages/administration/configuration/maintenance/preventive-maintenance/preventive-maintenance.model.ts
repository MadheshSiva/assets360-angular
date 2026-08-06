export interface PreventiveMaintenanceRecord {
  pmScheduleId: string;
  assetId: string;
  assetName: string;
  frequency: string;
  triggerType: string;
  lastMaintenanceDate: string;
  nextDueDate: string;
  autoCreateWorkOrder: 'Yes' | 'No' | '';
  selected?: boolean;
}

export type PreventiveMaintenanceForm = Omit<PreventiveMaintenanceRecord, 'selected'>;
