export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface MasterManagementSeverityMasterItem {
  severityId: string;
  assetId: string;
  assetName: string;
  severityName: SeverityLevel | '';
  colorCode: string;
}
