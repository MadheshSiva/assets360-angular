export type JobMasterWorkType = 'Preventive' | 'Corrective' | 'Predictive' | 'Inspection';
export type JobMasterPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type JobMasterStatus = 'Open' | 'In Progress' | 'On Hold' | 'Completed' | 'Closed';

export interface JobMaster {
  jobId: string;
  jobName: string;
  description: string;
  assetId: string;
  assetCategory: string;
  locationId: string;
  departmentId: string;
  workType: JobMasterWorkType | '';
  priority: JobMasterPriority | '';
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string;
  actualEndDate: string;
  status: JobMasterStatus | '';
  assignedTo: string[];
  supervisorId: string;
  slaId: string;
  progressPercentage: number | null;
  downtimeRequired: boolean;
  permitRequired: boolean;
  safetyChecklistId: string;
  remarks: string;
}
