export interface InspectionSeverityItem {
  severityCode: string;
  severityName: string;
  score: number | null;
  colourIndicator: string;
  resolutionSla: string;
  escalationLevel: string;
  status: boolean;
}
