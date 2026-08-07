export type TemplateStatus = 'Draft' | 'Active' | 'Inactive';
export type MandatoryOrOptional = 'Mandatory' | 'Optional';
export type RequirementLevel = 'None' | 'Optional' | 'Mandatory';

export const INSPECTION_TYPE_OPTIONS: string[] = [
  'Routine Inspection',
  'Safety Inspection',
  'Quality Inspection',
  'Compliance Inspection',
  'Pre-operation Inspection',
  'Post-maintenance Inspection',
  'Incident Inspection',
  'Condition Inspection',
  'Handover Inspection',
  'Audit Inspection'
];

export const ASSET_CATEGORY_OPTIONS: string[] = [
  'HVAC',
  'Electrical',
  'Fire and Safety',
  'Vehicles',
  'Pumps',
  'Generators',
  'IT Equipment',
  'Production Machinery'
];

export const ASSET_TYPE_OPTIONS: string[] = ['Equipment', 'Component', 'Facility'];

export const REPORT_FORMAT_OPTIONS: string[] = ['PDF', 'Excel', 'Word'];

export const TEMPLATE_STATUS_OPTIONS: TemplateStatus[] = ['Draft', 'Active', 'Inactive'];

export const INSPECTOR_ROLE_OPTIONS: string[] = ['Inspector', 'Senior Inspector', 'Reviewer', 'Approver', 'Auditor'];

export const RESPONSE_TYPE_OPTIONS: string[] = [
  'Pass/Fail',
  'Yes/No',
  'Multiple Choice',
  'Single Choice',
  'Text',
  'Number',
  'Date',
  'Rating',
  'Photo',
  'Signature'
];

export const FAILURE_RULE_OPTIONS: string[] = ['No Action', 'Flag for Review', 'Block Submission', 'Auto-create Defect'];

export const REQUIREMENT_LEVEL_OPTIONS: RequirementLevel[] = ['None', 'Optional', 'Mandatory'];

export const MANDATORY_OPTIONAL_OPTIONS: MandatoryOrOptional[] = ['Mandatory', 'Optional'];

// Mirrors the mock task titles seeded in the Inspection Task master (inspection/inspection-task) —
// kept as a local static list since every service in this app owns its own mock data independently.
export const INSPECTION_TASK_LIBRARY: string[] = [
  'Check for visible corrosion or leaks',
  'Verify fire extinguisher pressure gauge',
  'Record operating temperature',
  'Capture asset nameplate photo',
  'Check emergency stop function',
  'Inspect belt tension and wear',
  'Verify calibration certificate validity'
];

export interface ChecklistTemplateTask {
  taskId: string;
  inspectionTask: string;
  mandatoryOrOptional: MandatoryOrOptional;
  inspectorRole: string;
  numberOfInspectorsRequired: number | null;
  responseType: string;
  passCriteria: string;
  failureRule: string;
  evidenceRequirement: RequirementLevel;
  notesRequirement: RequirementLevel;
  signatureRequirement: RequirementLevel;
  scoring: number | null;
  conditionalLogic: string;
}

export interface ChecklistTemplateSection {
  sectionId: string;
  sectionTitle: string;
  sectionDescription: string;
  sectionInstructions: string;
  repeatableSection: boolean;
  mandatorySection: boolean;
  sectionScore: number | null;
  conditionalVisibility: string;
  tasks: ChecklistTemplateTask[];
}

export interface ChecklistTemplateControls {
  allowTaskSkipping: boolean;
  requireReasonForSkipping: boolean;
  allowSaveAsDraft: boolean;
  allowOfflineInspection: boolean;
  allowTaskReassignment: boolean;
  allowPartialSubmission: boolean;
  allowReopening: boolean;
  lockAfterSubmission: boolean;
  requireGeolocation: boolean;
  requireAssetQrScan: boolean;
  requireInspectorSelfie: boolean;
  preventGalleryUpload: boolean;
  requireLiveCameraCapture: boolean;
}

export interface ChecklistTemplate {
  templateCode: string;
  templateName: string;
  inspectionType: string;
  assetCategory: string;
  assetType: string;
  templateVersion: number;
  effectiveDate: string;
  expiryDate: string;
  description: string;
  instructions: string;
  estimatedCompletionTime: number | null;
  defaultApprovalWorkflow: string;
  defaultReportFormat: string;
  status: TemplateStatus;
  sections: ChecklistTemplateSection[];
  controls: ChecklistTemplateControls;
}

export function emptyControls(): ChecklistTemplateControls {
  return {
    allowTaskSkipping: false,
    requireReasonForSkipping: false,
    allowSaveAsDraft: true,
    allowOfflineInspection: false,
    allowTaskReassignment: false,
    allowPartialSubmission: false,
    allowReopening: false,
    lockAfterSubmission: true,
    requireGeolocation: false,
    requireAssetQrScan: false,
    requireInspectorSelfie: false,
    preventGalleryUpload: false,
    requireLiveCameraCapture: false
  };
}

export function emptyTemplate(): ChecklistTemplate {
  return {
    templateCode: '',
    templateName: '',
    inspectionType: '',
    assetCategory: '',
    assetType: '',
    templateVersion: 1,
    effectiveDate: '',
    expiryDate: '',
    description: '',
    instructions: '',
    estimatedCompletionTime: null,
    defaultApprovalWorkflow: '',
    defaultReportFormat: '',
    status: 'Draft',
    sections: [],
    controls: emptyControls()
  };
}
