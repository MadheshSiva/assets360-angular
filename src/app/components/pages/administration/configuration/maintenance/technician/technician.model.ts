export interface TechnicianRecord {
  technicianId: string;
  name: string;
  skillSet: string;
  certification: string;
  availability: string;
  assignedTasks: number;
  selected?: boolean;
}

export type TechnicianForm = Omit<TechnicianRecord, 'selected' | 'assignedTasks'>;
