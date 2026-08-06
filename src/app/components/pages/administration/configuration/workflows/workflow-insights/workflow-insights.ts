import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowService } from '../services/workflow.service';
import { WorkflowInstanceService } from '../services/workflow-instance.service';
import { WorkflowDefinition } from '../models/workflow.model';

interface WorkflowBreakdownRow {
  name: string;
  module: string;
  status: string;
  pendingApprovals: number;
  totalInstances: number;
  avgApprovalDays: number | null;
}

const TODAY = '2026-08-04';

// 8. Admin Insights Dashboard — active workflows, pending approvals, SLA breaches, average approval time.
@Component({
  standalone: true,
  selector: 'app-workflow-insights',
  imports: [CommonModule],
  templateUrl: './workflow-insights.html',
  styleUrls: ['./workflow-insights.css']
})
export class WorkflowInsights {
  constructor(
    private workflowService: WorkflowService,
    private instanceService: WorkflowInstanceService
  ) {}

  get activeWorkflowCount(): number {
    return this.workflowService.getAll().filter((w) => w.status === 'Active').length;
  }

  get pendingApprovalsCount(): number {
    return this.instanceService.getAllTasks().filter((t) => t.status === 'Pending').length;
  }

  get slaBreachCount(): number {
    return this.instanceService.getAllTasks().filter((t) => t.status === 'Pending' && t.dueDate !== '-' && t.dueDate < TODAY).length;
  }

  get averageApprovalDays(): string {
    const days = this.instanceService
      .getAll()
      .filter((i) => (i.status === 'Approved' || i.status === 'Rejected') && i.completedOn)
      .map((i) => this.daysBetween(i.startedOn, i.completedOn as string));
    if (days.length === 0) return '-';
    const avg = days.reduce((sum, d) => sum + d, 0) / days.length;
    return avg.toFixed(1);
  }

  get breakdown(): WorkflowBreakdownRow[] {
    return this.workflowService.getAll().map((def: WorkflowDefinition) => {
      const instances = this.instanceService.getAll().filter((i) => i.workflowId === def.id);
      const pendingApprovals = this.instanceService
        .getAllTasks()
        .filter((t) => t.workflowName === def.name && t.status === 'Pending').length;
      const completed = instances.filter((i) => (i.status === 'Approved' || i.status === 'Rejected') && i.completedOn);
      const avgApprovalDays = completed.length
        ? completed.reduce((sum, i) => sum + this.daysBetween(i.startedOn, i.completedOn as string), 0) / completed.length
        : null;
      return {
        name: def.name,
        module: def.module,
        status: def.status,
        pendingApprovals,
        totalInstances: instances.length,
        avgApprovalDays
      };
    });
  }

  formatAvg(days: number | null): string {
    return days === null ? '-' : `${days.toFixed(1)} days`;
  }

  private daysBetween(start: string, end: string): number {
    const startDate = new Date(start.slice(0, 10));
    const endDate = new Date(end.slice(0, 10));
    return Math.max(0, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }
}
