export interface ComplianceInspectionRecord {
  inspectionId: string;
  inspectionType: string;
  checklist: string;
  inspectorName: string;
  result: 'Pass' | 'Fail' | '';
  remarks: string;
  nextInspectionDate: string;
  selected?: boolean;
}

export type ComplianceInspectionForm = Omit<ComplianceInspectionRecord, 'selected'>;
