export interface MaintenanceTaskRecord {
  taskChecklist: string[];
  instructions: string;
  toolsRequired: string;
  safetyProcedures: string;
  estimatedDuration: number | null;
  completionNotes: string;
  selected?: boolean;
}

export type MaintenanceTaskForm = Omit<MaintenanceTaskRecord, 'selected'>;
