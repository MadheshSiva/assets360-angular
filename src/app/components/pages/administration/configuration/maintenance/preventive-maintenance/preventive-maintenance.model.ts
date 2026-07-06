export interface PreventiveMaintenanceRecord {
  pmScheduleId: string;
  frequency: string;
  triggerType: string;
  lastMaintenanceDate: string;
  nextDueDate: string;
  autoCreateWorkOrder: 'Yes' | 'No' | '';
  selected?: boolean;
}

export type PreventiveMaintenanceForm = Omit<PreventiveMaintenanceRecord, 'selected'>;
