import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InspectionChecklistTemplateService } from '../services/checklist-template.service';
import { ChecklistTemplate, INSPECTION_TYPE_OPTIONS, TEMPLATE_STATUS_OPTIONS } from '../models/checklist-template.model';

@Component({
  standalone: true,
  selector: 'app-inspection-checklist-template-list',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checklist-template-list.html',
  styleUrls: ['./checklist-template-list.css']
})
export class InspectionChecklistTemplateList {
  searchTerm = '';
  inspectionTypeFilter = '';
  statusFilter = '';

  inspectionTypeOptions = INSPECTION_TYPE_OPTIONS;
  statusOptions = TEMPLATE_STATUS_OPTIONS;

  constructor(
    private service: InspectionChecklistTemplateService,
    private router: Router
  ) {}

  get templates(): ChecklistTemplate[] {
    return this.service.search(this.searchTerm, this.statusFilter).filter(
      (t) => !this.inspectionTypeFilter || t.inspectionType === this.inspectionTypeFilter
    );
  }

  get totalCount(): number {
    return this.service.getAll().length;
  }

  get activeCount(): number {
    return this.service.getAll().filter((t) => t.status === 'Active').length;
  }

  get draftCount(): number {
    return this.service.getAll().filter((t) => t.status === 'Draft').length;
  }

  sectionCount(template: ChecklistTemplate): number {
    return template.sections.length;
  }

  taskCount(template: ChecklistTemplate): number {
    return template.sections.reduce((sum, s) => sum + s.tasks.length, 0);
  }

  createTemplate(): void {
    this.router.navigate(['/administration/configuration/inspection/checklist-template/builder']);
  }

  editTemplate(template: ChecklistTemplate): void {
    this.router.navigate(['/administration/configuration/inspection/checklist-template/builder', template.templateCode]);
  }

  duplicateTemplate(template: ChecklistTemplate): void {
    const copy = this.service.duplicate(template.templateCode);
    if (copy) {
      this.router.navigate(['/administration/configuration/inspection/checklist-template/builder', copy.templateCode]);
    }
  }

  deleteTemplate(template: ChecklistTemplate): void {
    if (!confirm(`Delete template "${template.templateName}"? This cannot be undone.`)) return;
    this.service.deleteRecords([template.templateCode]);
  }

  onRefresh(): void {
    this.searchTerm = '';
    this.inspectionTypeFilter = '';
    this.statusFilter = '';
  }
}
