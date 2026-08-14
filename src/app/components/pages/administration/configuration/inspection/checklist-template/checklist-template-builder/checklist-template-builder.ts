import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { InspectionChecklistTemplateService } from '../services/checklist-template.service';
import {
  ChecklistTemplate,
  ChecklistTemplateControls,
  ChecklistTemplateSection,
  ChecklistTemplateTask,
  emptyTemplate,
  ASSET_CATEGORY_OPTIONS,
  ASSET_TYPE_OPTIONS,
  FAILURE_RULE_OPTIONS,
  INSPECTION_TASK_LIBRARY,
  INSPECTION_TYPE_OPTIONS,
  INSPECTOR_ROLE_OPTIONS,
  MANDATORY_OPTIONAL_OPTIONS,
  REPORT_FORMAT_OPTIONS,
  REQUIREMENT_LEVEL_OPTIONS,
  RESPONSE_TYPE_OPTIONS,
  TEMPLATE_STATUS_OPTIONS
} from '../models/checklist-template.model';

type WizardStep = 1 | 2 | 3 | 4;

interface StepDef {
  step: WizardStep;
  label: string;
}

interface ControlDef {
  key: keyof ChecklistTemplateControls;
  label: string;
}

// 4-step wizard (General / Sections / Tasks / Settings) for authoring a
// ChecklistTemplate. Draft-friendly: no per-step validation gates Next, only
// Publish enforces the minimum-viable-template rules (see canPublish).
@Component({
  standalone: true,
  selector: 'app-inspection-checklist-template-builder',
  imports: [CommonModule, FormsModule, RouterModule, DragDropModule, MasterLinkIcons],
  templateUrl: './checklist-template-builder.html',
  styleUrls: ['./checklist-template-builder.css']
})
export class InspectionChecklistTemplateBuilder implements OnInit {
  template: ChecklistTemplate = emptyTemplate();
  isEditMode = false;

  activeStep: WizardStep = 1;
  steps: StepDef[] = [
    { step: 1, label: 'General' },
    { step: 2, label: 'Sections' },
    { step: 3, label: 'Tasks' },
    { step: 4, label: 'Settings' }
  ];

  showPreview = false;
  savedIndicator = false;
  private savedIndicatorTimeout: ReturnType<typeof setTimeout> | null = null;

  // ===== Option lists (from model) =====
  inspectionTypeOptions = INSPECTION_TYPE_OPTIONS;
  assetCategoryOptions = ASSET_CATEGORY_OPTIONS;
  assetTypeOptions = ASSET_TYPE_OPTIONS;
  reportFormatOptions = REPORT_FORMAT_OPTIONS;
  statusOptions = TEMPLATE_STATUS_OPTIONS;
  inspectorRoleOptions = INSPECTOR_ROLE_OPTIONS;
  responseTypeOptions = RESPONSE_TYPE_OPTIONS;
  failureRuleOptions = FAILURE_RULE_OPTIONS;
  requirementLevelOptions = REQUIREMENT_LEVEL_OPTIONS;
  mandatoryOptionalOptions = MANDATORY_OPTIONAL_OPTIONS;
  taskLibrary = INSPECTION_TASK_LIBRARY;

  controlsList: ControlDef[] = [
    { key: 'allowTaskSkipping', label: 'Allow Task Skipping' },
    { key: 'requireReasonForSkipping', label: 'Require Reason for Skipping' },
    { key: 'allowSaveAsDraft', label: 'Allow Save as Draft' },
    { key: 'allowOfflineInspection', label: 'Allow Offline Inspection' },
    { key: 'allowTaskReassignment', label: 'Allow Task Reassignment' },
    { key: 'allowPartialSubmission', label: 'Allow Partial Submission' },
    { key: 'allowReopening', label: 'Allow Reopening' },
    { key: 'lockAfterSubmission', label: 'Lock After Submission' },
    { key: 'requireGeolocation', label: 'Require Geolocation' },
    { key: 'requireAssetQrScan', label: 'Require Asset QR Scan' },
    { key: 'requireInspectorSelfie', label: 'Require Inspector Selfie' },
    { key: 'preventGalleryUpload', label: 'Prevent Gallery Upload' },
    { key: 'requireLiveCameraCapture', label: 'Require Live Camera Capture' }
  ];

  // ===== Section modal state =====
  showSectionModal = false;
  sectionModalMode: 'create' | 'edit' = 'create';
  sectionForm: ChecklistTemplateSection = this.blankSection();
  private editingSectionId: string | null = null;

  // ===== Task modal state =====
  showTaskModal = false;
  taskModalMode: 'create' | 'edit' = 'create';
  taskForm: ChecklistTemplateTask = this.blankTask();
  private editingTaskId: string | null = null;

  selectedSectionId: string | null = null;

  constructor(
    private service: InspectionChecklistTemplateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const existing = this.service.getById(id);
      if (existing) {
        this.isEditMode = true;
        this.template = this.cloneTemplate(existing);
      }
    }
    if (this.template.sections.length > 0) {
      this.selectedSectionId = this.template.sections[0].sectionId;
    }
  }

  private cloneTemplate(t: ChecklistTemplate): ChecklistTemplate {
    return {
      ...t,
      sections: t.sections.map((s) => ({ ...s, tasks: s.tasks.map((task) => ({ ...task })) })),
      controls: { ...t.controls }
    };
  }

  private blankSection(): ChecklistTemplateSection {
    return {
      sectionId: '',
      sectionTitle: '',
      sectionDescription: '',
      sectionInstructions: '',
      repeatableSection: false,
      mandatorySection: false,
      sectionScore: null,
      conditionalVisibility: '',
      tasks: []
    };
  }

  private blankTask(): ChecklistTemplateTask {
    return {
      taskId: '',
      inspectionTask: '',
      mandatoryOrOptional: 'Mandatory',
      inspectorRole: '',
      numberOfInspectorsRequired: 1,
      responseType: '',
      passCriteria: '',
      failureRule: '',
      evidenceRequirement: 'None',
      notesRequirement: 'None',
      signatureRequirement: 'None',
      scoring: null,
      conditionalLogic: ''
    };
  }

  // ===== Stepper =====
  goToStep(step: WizardStep): void {
    this.activeStep = step;
  }

  next(): void {
    if (this.activeStep < 4) {
      this.activeStep = (this.activeStep + 1) as WizardStep;
    }
  }

  previous(): void {
    if (this.activeStep > 1) {
      this.activeStep = (this.activeStep - 1) as WizardStep;
    }
  }

  stepState(step: WizardStep): 'completed' | 'active' | 'upcoming' {
    if (step < this.activeStep) return 'completed';
    if (step === this.activeStep) return 'active';
    return 'upcoming';
  }

  // ===== Sections (step 2) =====
  onSectionDrop(event: CdkDragDrop<ChecklistTemplateSection[]>): void {
    moveItemInArray(this.template.sections, event.previousIndex, event.currentIndex);
  }

  openAddSection(): void {
    this.sectionModalMode = 'create';
    this.sectionForm = this.blankSection();
    this.editingSectionId = null;
    this.showSectionModal = true;
  }

  openEditSection(section: ChecklistTemplateSection): void {
    this.sectionModalMode = 'edit';
    this.sectionForm = { ...section };
    this.editingSectionId = section.sectionId;
    this.showSectionModal = true;
  }

  closeSectionModal(): void {
    this.showSectionModal = false;
  }

  saveSectionModal(): void {
    if (!this.sectionForm.sectionTitle.trim()) return;

    if (this.sectionModalMode === 'create') {
      const newSection: ChecklistTemplateSection = {
        ...this.sectionForm,
        sectionId: this.service.newSectionId(),
        tasks: []
      };
      this.template.sections = [...this.template.sections, newSection];
      if (!this.selectedSectionId) {
        this.selectedSectionId = newSection.sectionId;
      }
    } else {
      const index = this.template.sections.findIndex((s) => s.sectionId === this.editingSectionId);
      if (index !== -1) {
        this.template.sections[index] = {
          ...this.template.sections[index],
          ...this.sectionForm,
          tasks: this.template.sections[index].tasks
        };
      }
    }
    this.showSectionModal = false;
  }

  deleteSection(section: ChecklistTemplateSection): void {
    if (!confirm(`Delete section "${section.sectionTitle || '(untitled section)'}"? This will remove its ${section.tasks.length} task(s).`)) {
      return;
    }
    this.template.sections = this.template.sections.filter((s) => s.sectionId !== section.sectionId);
    if (this.selectedSectionId === section.sectionId) {
      this.selectedSectionId = this.template.sections[0]?.sectionId ?? null;
    }
  }

  // ===== Tasks (step 3) =====
  get selectedSection(): ChecklistTemplateSection | null {
    return this.template.sections.find((s) => s.sectionId === this.selectedSectionId) ?? null;
  }

  selectSection(section: ChecklistTemplateSection): void {
    this.selectedSectionId = section.sectionId;
  }

  onTaskDrop(event: CdkDragDrop<ChecklistTemplateTask[]>): void {
    const section = this.selectedSection;
    if (!section) return;
    moveItemInArray(section.tasks, event.previousIndex, event.currentIndex);
  }

  openAddTask(): void {
    if (!this.selectedSection) return;
    this.taskModalMode = 'create';
    this.taskForm = this.blankTask();
    this.editingTaskId = null;
    this.showTaskModal = true;
  }

  openEditTask(task: ChecklistTemplateTask): void {
    this.taskModalMode = 'edit';
    this.taskForm = { ...task };
    this.editingTaskId = task.taskId;
    this.showTaskModal = true;
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
  }

  saveTaskModal(): void {
    const section = this.selectedSection;
    if (!section || !this.taskForm.inspectionTask.trim()) return;

    if (this.taskModalMode === 'create') {
      const newTask: ChecklistTemplateTask = { ...this.taskForm, taskId: this.service.newTaskId() };
      section.tasks = [...section.tasks, newTask];
    } else {
      const index = section.tasks.findIndex((t) => t.taskId === this.editingTaskId);
      if (index !== -1) {
        section.tasks[index] = { ...section.tasks[index], ...this.taskForm };
      }
    }
    this.showTaskModal = false;
  }

  deleteTask(section: ChecklistTemplateSection, task: ChecklistTemplateTask): void {
    if (!confirm(`Delete task "${task.inspectionTask}"?`)) return;
    section.tasks = section.tasks.filter((t) => t.taskId !== task.taskId);
  }

  // ===== Preview (step-agnostic overlay) =====
  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  // ===== Publish gating =====
  get publishDisabledReason(): string {
    if (this.activeStep !== 4) return 'Finish reviewing the Settings step before publishing';
    if (!this.template.templateName.trim()) return 'Template Name is required to publish';
    if (!this.template.inspectionType) return 'Inspection Type is required to publish';
    if (this.template.sections.length === 0) return 'Add at least one section to publish';
    if (this.template.sections.some((s) => s.tasks.length === 0)) return 'Every section must have at least one task to publish';
    return '';
  }

  get canPublish(): boolean {
    return this.publishDisabledReason === '';
  }

  // ===== Save / Publish / Cancel =====
  private persist(): void {
    if (this.isEditMode) {
      this.service.update(this.template.templateCode, this.template);
    } else {
      this.template = this.service.create(this.template);
      this.isEditMode = true;
    }
  }

  saveDraft(): void {
    this.template.status = 'Draft';
    this.persist();
    this.showSavedIndicator();
  }

  private showSavedIndicator(): void {
    this.savedIndicator = true;
    if (this.savedIndicatorTimeout) clearTimeout(this.savedIndicatorTimeout);
    this.savedIndicatorTimeout = setTimeout(() => {
      this.savedIndicator = false;
    }, 2000);
  }

  publish(): void {
    if (!this.canPublish) return;
    this.template.status = 'Active';
    this.persist();
    this.router.navigate(['/administration/configuration/inspection/checklist-template/list']);
  }

  cancel(): void {
    this.router.navigate(['/administration/configuration/inspection/checklist-template/list']);
  }
}
