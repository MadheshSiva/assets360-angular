export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface MasterManagementSeverityMasterItem {
  severityId: string;
  severityName: SeverityLevel | '';
  colorCode: string;
}
