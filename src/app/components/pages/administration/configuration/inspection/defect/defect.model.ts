export interface InspectionDefectItem {
  defectCode: string;
  defectName: string;
  defectCategory: string;
  description: string;
  severity: string;
  riskRating: string;
  recommendedCorrectiveAction: string;
  defaultResolutionPeriod: string;
  status: boolean;
}
