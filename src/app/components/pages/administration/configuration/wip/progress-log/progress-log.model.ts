export type ProgressLogUpdateSource = 'Manual' | 'IoT' | 'API';

export interface ProgressLog {
  logId: string;
  jobId: string;
  taskId: string;
  timestamp: string;
  progressPercentage: number | null;
  statusId: string;
  updatedBy: string;
  updateSource: ProgressLogUpdateSource | '';
  remarks: string;
  sensorData: string;
  selected?: boolean;
}

export type ProgressLogForm = Omit<ProgressLog, 'selected'>;
