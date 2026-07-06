export interface BreakdownIssueRecord {
  issueId: string;
  reportedBy: string;
  issueType: string;
  severity: string;
  description: string;
  attachments: string[];
  rootCause: string;
  resolutionAction: string;
  selected?: boolean;
}

export type BreakdownIssueForm = Omit<BreakdownIssueRecord, 'selected'>;
