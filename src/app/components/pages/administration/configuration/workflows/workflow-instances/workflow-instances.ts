import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowInstanceService } from '../services/workflow-instance.service';
import { WORKFLOW_MODULE_OPTIONS } from '../services/workflow.service';
import { WorkflowInstance } from '../models/workflow.model';

interface TrackerChip {
  label: string;
  icon: string;
  state: 'done' | 'pending' | 'rejected' | 'final';
}

// 5. Workflow Instance UI — execution view for a single running/completed workflow.
@Component({
  standalone: true,
  selector: 'app-workflow-instances',
  imports: [CommonModule, FormsModule],
  templateUrl: './workflow-instances.html',
  styleUrls: ['./workflow-instances.css']
})
export class WorkflowInstances {
  searchTerm = '';
  moduleFilter = '';
  statusFilter = '';
  moduleOptions = WORKFLOW_MODULE_OPTIONS;
  statusOptions = ['In Progress', 'Pending Final', 'Approved', 'Rejected'];

  expandedId: string | null = null;

  constructor(private instanceService: WorkflowInstanceService) {}

  get instances(): WorkflowInstance[] {
    const t = this.searchTerm.trim().toLowerCase();
    return this.instanceService.getAll().filter((i) => {
      const matchesTerm =
        !t ||
        i.workflowName.toLowerCase().includes(t) ||
        i.relatedEntityLabel.toLowerCase().includes(t) ||
        i.requestedBy.toLowerCase().includes(t);
      const matchesModule = !this.moduleFilter || i.module === this.moduleFilter;
      const matchesStatus = !this.statusFilter || i.status === this.statusFilter;
      return matchesTerm && matchesModule && matchesStatus;
    });
  }

  currentStepName(instance: WorkflowInstance): string {
    const active = instance.steps.find((s) => s.stepId === instance.currentStepId);
    if (active) return active.stepName;
    return instance.steps[instance.steps.length - 1]?.stepName || '-';
  }

  toggleExpand(instance: WorkflowInstance): void {
    this.expandedId = this.expandedId === instance.id ? null : instance.id;
  }

  tracker(instance: WorkflowInstance): TrackerChip[] {
    const chips: TrackerChip[] = instance.steps
      .filter((s) => s.type !== 'condition' && s.type !== 'parallel')
      .map((s) => ({
        label: s.stepName,
        icon: s.status === 'Completed' || s.status === 'Approved' ? '✔' : s.status === 'Pending' ? '⏳' : s.status === 'Rejected' ? '✕' : '…',
        state: (s.status === 'Completed' || s.status === 'Approved'
          ? 'done'
          : s.status === 'Rejected'
          ? 'rejected'
          : 'pending') as TrackerChip['state']
      }));

    if (instance.status === 'Pending Final') {
      chips.push({ label: 'Pending Final', icon: '⏳', state: 'final' });
    }
    return chips;
  }

  onRefresh(): void {
    this.searchTerm = '';
    this.moduleFilter = '';
    this.statusFilter = '';
  }
}
