export type IssueDelayType = 'Technical' | 'Resource' | 'Material' | 'External';
export type IssueDelaySeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface IssueDelay {
  issueId: string;
  jobId: string;
  taskId: string;
  issueType: IssueDelayType | '';
  description: string;
  reportedBy: string;
  reportedDate: string;
  severity: IssueDelaySeverity | '';
  statusId: string;
  resolutionRemarks: string;
  closedDate: string;
}
