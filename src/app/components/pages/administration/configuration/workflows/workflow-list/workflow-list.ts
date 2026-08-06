import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { WorkflowService, WORKFLOW_MODULE_OPTIONS } from '../services/workflow.service';
import { WorkflowInstanceService } from '../services/workflow-instance.service';
import { WorkflowDefinition } from '../models/workflow.model';

// 3. Workflow List Screen — landing dashboard for the Workflow module (2.1 Workflow Master).
@Component({
  standalone: true,
  selector: 'app-workflow-list',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './workflow-list.html',
  styleUrls: ['./workflow-list.css']
})
export class WorkflowList {
  searchTerm = '';
  moduleFilter = '';
  statusFilter = '';

  moduleOptions = WORKFLOW_MODULE_OPTIONS;
  statusOptions = ['Draft', 'Active', 'Inactive'];

  constructor(
    private workflowService: WorkflowService,
    private instanceService: WorkflowInstanceService,
    private router: Router
  ) {}

  get workflows(): WorkflowDefinition[] {
    return this.workflowService.search(this.searchTerm, this.moduleFilter, this.statusFilter);
  }

  get activeCount(): number {
    return this.workflowService.getAll().filter((w) => w.status === 'Active').length;
  }

  get draftCount(): number {
    return this.workflowService.getAll().filter((w) => w.status === 'Draft').length;
  }

  get totalCount(): number {
    return this.workflowService.getAll().length;
  }

  get pendingApprovalsCount(): number {
    return this.instanceService.getAllTasks().filter((t) => t.status === 'Pending').length;
  }

  createWorkflow(): void {
    this.router.navigate(['/administration/configuration/workflows/builder']);
  }

  editWorkflow(def: WorkflowDefinition): void {
    this.router.navigate(['/administration/configuration/workflows/builder', def.id]);
  }

  cloneWorkflow(def: WorkflowDefinition): void {
    const cloned = this.workflowService.clone(def.id);
    if (cloned) {
      this.router.navigate(['/administration/configuration/workflows/builder', cloned.id]);
    }
  }

  toggleActive(def: WorkflowDefinition): void {
    this.workflowService.toggleActive(def.id);
  }

  deleteWorkflow(def: WorkflowDefinition): void {
    if (!confirm(`Delete workflow "${def.name}"? This cannot be undone.`)) return;
    this.workflowService.deleteDefinition(def.id);
  }

  onRefresh(): void {
    this.searchTerm = '';
    this.moduleFilter = '';
    this.statusFilter = '';
  }
}
