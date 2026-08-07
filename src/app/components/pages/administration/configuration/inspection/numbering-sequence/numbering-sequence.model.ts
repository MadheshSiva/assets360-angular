export interface InspectionNumberingSequenceItem {
  sequenceCode: string;
  numberType: string;
  prefix: string;
  suffix: string;
  financialYear: string;
  siteCode: string;
  departmentCode: string;
  runningNumber: number;
  resetFrequency: string;
  samplePreview: string;
  status: boolean;
}
