export interface InspectionFailureReasonItem {
  failureReasonCode: string;
  failureReason: string;
  failureCategory: string;
  severity: string;
  correctiveActionRequired: boolean;
  escalationRequired: boolean;
  defaultResponsibleTeam: string;
  status: boolean;
}
