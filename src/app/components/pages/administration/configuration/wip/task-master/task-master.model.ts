export interface TaskMaster {
  taskId: string;
  jobId: string;
  taskName: string;
  description: string;
  sequenceOrder: number | null;
  assignedTo: string;
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime: string;
  actualEndTime: string;
  statusId: string;
  dependencyTaskId: string;
  checklistId: string;
  completionPercentage: number | null;
  remarks: string;
}
