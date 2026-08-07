import { Injectable } from '@angular/core';
import { ChecklistTemplate, emptyControls } from '../models/checklist-template.model';

@Injectable({ providedIn: 'root' })
export class InspectionChecklistTemplateService {
  private readonly templates: ChecklistTemplate[] = [
    {
      templateCode: 'TPL-1001',
      templateName: 'HVAC Rooftop Unit — Monthly Safety Checklist',
      inspectionType: 'Safety Inspection',
      assetCategory: 'HVAC',
      assetType: 'Equipment',
      templateVersion: 2,
      effectiveDate: '2026-01-01',
      expiryDate: '2026-12-31',
      description: 'Monthly safety and function checklist for rooftop HVAC units.',
      instructions: 'Complete all sections before leaving site. Attach photos for any failed task.',
      estimatedCompletionTime: 30,
      defaultApprovalWorkflow: 'Two-Level Approval',
      defaultReportFormat: 'PDF',
      status: 'Active',
      sections: [
        {
          sectionId: 'SEC-1',
          sectionTitle: 'Visual Inspection',
          sectionDescription: 'General visual condition of the unit and surroundings.',
          sectionInstructions: 'Walk around the unit before opening any panel.',
          repeatableSection: false,
          mandatorySection: true,
          sectionScore: 20,
          conditionalVisibility: '',
          tasks: [
            {
              taskId: 'TSK-1',
              inspectionTask: 'Check for visible corrosion or leaks',
              mandatoryOrOptional: 'Mandatory',
              inspectorRole: 'Inspector',
              numberOfInspectorsRequired: 1,
              responseType: 'Pass/Fail',
              passCriteria: 'No visible corrosion, rust or fluid leaks',
              failureRule: 'Flag for Review',
              evidenceRequirement: 'Mandatory',
              notesRequirement: 'Optional',
              signatureRequirement: 'None',
              scoring: 10,
              conditionalLogic: ''
            }
          ]
        },
        {
          sectionId: 'SEC-2',
          sectionTitle: 'Functional Test',
          sectionDescription: 'Confirms the unit operates within normal parameters.',
          sectionInstructions: 'Power on the unit and record readings after 5 minutes.',
          repeatableSection: false,
          mandatorySection: true,
          sectionScore: 30,
          conditionalVisibility: '',
          tasks: [
            {
              taskId: 'TSK-2',
              inspectionTask: 'Record operating temperature',
              mandatoryOrOptional: 'Mandatory',
              inspectorRole: 'Inspector',
              numberOfInspectorsRequired: 1,
              responseType: 'Number',
              passCriteria: 'Between 18°C and 24°C',
              failureRule: 'Block Submission',
              evidenceRequirement: 'None',
              notesRequirement: 'Mandatory',
              signatureRequirement: 'None',
              scoring: 15,
              conditionalLogic: 'Show only if Visual Inspection passed'
            },
            {
              taskId: 'TSK-3',
              inspectionTask: 'Check emergency stop function',
              mandatoryOrOptional: 'Mandatory',
              inspectorRole: 'Senior Inspector',
              numberOfInspectorsRequired: 1,
              responseType: 'Pass/Fail',
              passCriteria: 'Unit stops within 2 seconds of activation',
              failureRule: 'Auto-create Defect',
              evidenceRequirement: 'Optional',
              notesRequirement: 'Optional',
              signatureRequirement: 'Mandatory',
              scoring: 15,
              conditionalLogic: ''
            }
          ]
        }
      ],
      controls: {
        allowTaskSkipping: false,
        requireReasonForSkipping: true,
        allowSaveAsDraft: true,
        allowOfflineInspection: true,
        allowTaskReassignment: true,
        allowPartialSubmission: false,
        allowReopening: true,
        lockAfterSubmission: true,
        requireGeolocation: true,
        requireAssetQrScan: true,
        requireInspectorSelfie: false,
        preventGalleryUpload: false,
        requireLiveCameraCapture: true
      }
    },
    {
      templateCode: 'TPL-1002',
      templateName: 'Fire Extinguisher — Quarterly Compliance Checklist',
      inspectionType: 'Compliance Inspection',
      assetCategory: 'Fire and Safety',
      assetType: 'Equipment',
      templateVersion: 1,
      effectiveDate: '2026-02-01',
      expiryDate: '',
      description: 'Quarterly regulatory compliance check for portable fire extinguishers.',
      instructions: 'Reference the tag on the cylinder for last service date.',
      estimatedCompletionTime: 10,
      defaultApprovalWorkflow: 'Single-Level Approval',
      defaultReportFormat: 'PDF',
      status: 'Draft',
      sections: [
        {
          sectionId: 'SEC-1',
          sectionTitle: 'Condition Check',
          sectionDescription: 'Physical condition and accessibility of the extinguisher.',
          sectionInstructions: '',
          repeatableSection: true,
          mandatorySection: true,
          sectionScore: 10,
          conditionalVisibility: '',
          tasks: [
            {
              taskId: 'TSK-1',
              inspectionTask: 'Verify fire extinguisher pressure gauge',
              mandatoryOrOptional: 'Mandatory',
              inspectorRole: 'Inspector',
              numberOfInspectorsRequired: 1,
              responseType: 'Pass/Fail',
              passCriteria: 'Gauge needle in the green zone',
              failureRule: 'Block Submission',
              evidenceRequirement: 'Mandatory',
              notesRequirement: 'Optional',
              signatureRequirement: 'None',
              scoring: 10,
              conditionalLogic: ''
            }
          ]
        }
      ],
      controls: emptyControls()
    }
  ];

  private nextTemplateSequence = 1003;

  getAll(): ChecklistTemplate[] {
    return this.templates;
  }

  getById(templateCode: string): ChecklistTemplate | undefined {
    return this.templates.find((t) => t.templateCode === templateCode);
  }

  search(term: string, status?: string): ChecklistTemplate[] {
    const value = term.trim().toLowerCase();
    return this.templates.filter((t) => {
      const matchesStatus = !status || t.status === status;
      if (!matchesStatus) return false;
      if (!value) return true;
      return [t.templateCode, t.templateName, t.inspectionType, t.assetCategory, t.assetType]
        .some((field) => field.toLowerCase().includes(value));
    });
  }

  create(template: ChecklistTemplate): ChecklistTemplate {
    const templateCode = template.templateCode?.trim() || `TPL-${this.nextTemplateSequence++}`;
    const created: ChecklistTemplate = { ...template, templateCode };
    this.templates.push(created);
    return created;
  }

  update(templateCode: string, changes: ChecklistTemplate): void {
    const index = this.templates.findIndex((t) => t.templateCode === templateCode);
    if (index !== -1) {
      this.templates[index] = { ...changes };
    }
  }

  duplicate(templateCode: string): ChecklistTemplate | null {
    const source = this.getById(templateCode);
    if (!source) return null;
    const copy: ChecklistTemplate = {
      ...source,
      templateCode: `TPL-${this.nextTemplateSequence++}`,
      templateName: `${source.templateName} (Copy)`,
      templateVersion: 1,
      status: 'Draft',
      sections: source.sections.map((s) => ({ ...s, tasks: s.tasks.map((t) => ({ ...t })) }))
    };
    this.templates.push(copy);
    return copy;
  }

  deleteRecords(templateCodes: string[]): void {
    for (const code of templateCodes) {
      const index = this.templates.findIndex((t) => t.templateCode === code);
      if (index !== -1) {
        this.templates.splice(index, 1);
      }
    }
  }

  private nextSectionSequence = 1;
  private nextTaskSequence = 1;

  newSectionId(): string {
    return `SEC-${this.nextSectionSequence++}`;
  }

  newTaskId(): string {
    return `TSK-${this.nextTaskSequence++}`;
  }
}
