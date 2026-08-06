import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  ApprovalStepConfig,
  StepLogStatus,
  TaskPriority,
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowInstanceStepLog,
  WorkflowNode,
  WorkflowTask
} from '../models/workflow.model';
import { WorkflowService } from './workflow.service';
import { WorkflowNotificationService } from './workflow-notification.service';

export type TaskAction = 'Approve' | 'Reject' | 'Request Changes';

// 2.5 Workflow Instance (Runtime Engine) + 2.6 Task / Action Management.
// Walks the WorkflowDefinition graph (see WorkflowService) to advance a running
// instance whenever a pending approval task is actioned — condition nodes route
// deterministically down their first branch (there's no live asset field to
// evaluate against in this demo), action nodes execute immediately, parallel
// nodes fan out into concurrent branches, and end nodes close the instance out.
@Injectable({ providedIn: 'root' })
export class WorkflowInstanceService {
  private nextInstanceId = 7;

  private instancesSubject = new BehaviorSubject<WorkflowInstance[]>(this.seed());

  constructor(
    private workflowService: WorkflowService,
    private notificationService: WorkflowNotificationService
  ) {}

  watch() {
    return this.instancesSubject.asObservable();
  }

  getAll(): WorkflowInstance[] {
    return this.instancesSubject.value;
  }

  getById(id: string): WorkflowInstance | undefined {
    return this.instancesSubject.value.find((i) => i.id === id);
  }

  // ----- 2.6 Task / Action Management -----
  getAllTasks(): WorkflowTask[] {
    const tasks: WorkflowTask[] = [];
    for (const instance of this.instancesSubject.value) {
      for (const step of instance.steps) {
        if (step.type !== 'approval') continue;
        tasks.push({
          taskId: `${instance.id}::${step.stepId}`,
          instanceId: instance.id,
          stepId: step.stepId,
          workflowName: instance.workflowName,
          module: instance.module,
          relatedEntityLabel: instance.relatedEntityLabel,
          requestedBy: instance.requestedBy,
          dueDate: step.dueDate || '-',
          priority: step.priority || 'Medium',
          status: step.status,
          comments: step.comments
        });
      }
    }
    return tasks;
  }

  actOnTask(instanceId: string, stepId: string, action: TaskAction, comments: string, actorName = 'Current User'): void {
    const instance = this.getById(instanceId);
    const definition = this.workflowService.getById(instance?.workflowId || '');
    if (!instance || !definition) return;

    const step = instance.steps.find((s) => s.stepId === stepId && s.status === 'Pending');
    if (!step) return;

    const now = this.nowStamp();
    step.actionTaken = action;
    step.timestamp = now;
    step.comments = comments;
    step.approverName = step.approverName || actorName;

    if (action === 'Approve') {
      step.status = 'Approved';
      this.notificationService.push(
        `${step.stepName} approved for ${instance.relatedEntityLabel}`,
        'success',
        '/administration/configuration/workflows/instances'
      );
      this.advanceFrom(instance, definition, stepId);
    } else if (action === 'Reject') {
      step.status = 'Rejected';
      instance.status = 'Rejected';
      instance.completedOn = now;
      instance.currentStepId = null;
      this.notificationService.push(
        `${step.stepName} rejected for ${instance.relatedEntityLabel}`,
        'error',
        '/administration/configuration/workflows/instances'
      );
    } else {
      step.status = 'Requested Changes';
      this.notificationService.push(
        `Changes requested on ${step.stepName} for ${instance.relatedEntityLabel}`,
        'warning',
        '/administration/configuration/workflows/tasks'
      );
    }

    this.instancesSubject.next([...this.instancesSubject.value]);
  }

  // ----- Runtime graph walk -----
  private advanceFrom(instance: WorkflowInstance, definition: WorkflowDefinition, fromNodeId: string): void {
    if (instance.status === 'Approved' || instance.status === 'Rejected') return;

    const fromNode = definition.nodes.find((n) => n.id === fromNodeId);
    if (!fromNode || fromNode.nextIds.length === 0) return;

    if (fromNode.type === 'parallel') {
      fromNode.nextIds.forEach((targetId) => this.enterNode(instance, definition, targetId));
      return;
    }

    // start / approval / action / condition all advance along a single chosen branch —
    // condition nodes take their first (Yes) branch in this simulated run.
    this.enterNode(instance, definition, fromNode.nextIds[0]);
  }

  private enterNode(instance: WorkflowInstance, definition: WorkflowDefinition, nodeId: string): void {
    const node = definition.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const now = this.nowStamp();

    if (node.type === 'end') {
      // Idempotent — a parallel fan-in can reach End more than once.
      if (!instance.steps.some((s) => s.stepId === node.id)) {
        instance.steps.push({ stepId: node.id, stepName: node.name, type: 'end', status: 'Completed', actionTaken: 'Workflow completed', timestamp: now });
      }
      instance.status = 'Approved';
      instance.completedOn = now;
      instance.currentStepId = null;
      return;
    }

    if (node.type === 'action') {
      instance.steps.push({
        stepId: node.id,
        stepName: node.name,
        type: 'action',
        status: 'Completed',
        actionTaken: node.action?.parameters || 'Action executed',
        timestamp: now
      });
      this.advanceFrom(instance, definition, node.id);
      return;
    }

    if (node.type === 'condition') {
      instance.steps.push({
        stepId: node.id,
        stepName: node.name,
        type: 'condition',
        status: 'Completed',
        actionTaken: node.condition
          ? `${node.condition.field} ${node.condition.operator} ${node.condition.value} → branch evaluated`
          : 'Condition evaluated',
        timestamp: now
      });
      this.advanceFrom(instance, definition, node.id);
      return;
    }

    if (node.type === 'approval') {
      const approval = node.approval as ApprovalStepConfig;
      const priority = this.priorityForSla(approval?.slaHours);
      instance.steps.push({
        stepId: node.id,
        stepName: node.name,
        type: 'approval',
        approverType: approval?.approverType,
        approverName: approval?.approverValue,
        status: 'Pending',
        timestamp: now,
        dueDate: this.dueDateForSla(approval?.slaHours),
        priority
      });
      instance.currentStepId = node.id;
      instance.status = this.isFinalApproval(definition, node.id) ? 'Pending Final' : 'In Progress';
      this.notificationService.push(
        `${instance.relatedEntityLabel} pending your approval — ${node.name}`,
        'warning',
        '/administration/configuration/workflows/tasks'
      );
    }
  }

  // True if no further approval node can be reached downstream of nodeId (only actions/parallel/end remain).
  private isFinalApproval(definition: WorkflowDefinition, nodeId: string, visited = new Set<string>()): boolean {
    if (visited.has(nodeId)) return true;
    visited.add(nodeId);
    const node = definition.nodes.find((n) => n.id === nodeId);
    if (!node) return true;
    for (const nextId of node.nextIds) {
      const next = definition.nodes.find((n) => n.id === nextId);
      if (!next) continue;
      if (next.type === 'approval') return false;
      if (!this.isFinalApproval(definition, nextId, visited)) return false;
    }
    return true;
  }

  private priorityForSla(slaHours?: number): TaskPriority {
    if (!slaHours) return 'Medium';
    if (slaHours <= 12) return 'Critical';
    if (slaHours <= 24) return 'High';
    if (slaHours <= 48) return 'Medium';
    return 'Low';
  }

  private dueDateForSla(slaHours?: number): string {
    const days = Math.max(1, Math.ceil((slaHours || 24) / 24));
    const base = new Date('2026-08-04T00:00:00');
    base.setDate(base.getDate() + days);
    return base.toISOString().slice(0, 10);
  }

  private nowStamp(): string {
    return new Date().toISOString().slice(0, 16).replace('T', ' ');
  }

  // ===== Seed data =====
  private seed(): WorkflowInstance[] {
    return [
      // Asset Creation Approval (wf-1) — pending final approval at Finance.
      {
        id: 'inst-1',
        workflowId: 'wf-1',
        workflowName: 'Asset Creation Approval',
        module: 'Asset',
        relatedEntityLabel: 'Asset Request AST-2041 (Broadcast Camera Rig)',
        requestedBy: 'Fatima Al-Kuwari',
        status: 'Pending Final',
        currentStepId: 'n4',
        startedOn: '2026-07-29 09:00',
        steps: this.log([
          ['n1', 'Request Raised', 'start', 'Completed', 'Request submitted', '2026-07-29 09:00'],
          ['n2', 'Cost > AED 10,000?', 'condition', 'Completed', 'Asset Cost AED 18,500 > 10,000 → Yes branch', '2026-07-29 09:00'],
          ['n3', 'Manager Approval', 'approval', 'Approved', 'Approve', '2026-07-29 14:20', 'Omar Youssef', 'Budget available, approved.'],
          ['n4', 'Finance Approval', 'approval', 'Pending', undefined, undefined, 'Layla Haddad', undefined, '2026-08-06', 'High']
        ])
      },
      // Asset Transfer Approval (wf-2) — in progress at Ops Manager.
      {
        id: 'inst-2',
        workflowId: 'wf-2',
        workflowName: 'Asset Transfer Approval',
        module: 'Transfer',
        relatedEntityLabel: 'Transfer Request TR-204 (Laptop - AST-1187)',
        requestedBy: 'Khalid Rahman',
        status: 'In Progress',
        currentStepId: 'n3',
        startedOn: '2026-08-01 10:15',
        steps: this.log([
          ['n1', 'Transfer Requested', 'start', 'Completed', 'Request submitted', '2026-08-01 10:15'],
          ['n2', 'Department = Operations?', 'condition', 'Completed', 'Department = Operations → Yes branch', '2026-08-01 10:15'],
          ['n3', 'Route to Ops Manager', 'approval', 'Pending', undefined, undefined, 'Operations Manager', undefined, '2026-08-06', 'Medium']
        ])
      },
      // Asset Transfer Approval (wf-2) — fully approved history.
      {
        id: 'inst-3',
        workflowId: 'wf-2',
        workflowName: 'Asset Transfer Approval',
        module: 'Transfer',
        relatedEntityLabel: 'Transfer Request TR-198 (Projector - AST-1052)',
        requestedBy: 'Sara Ibrahim',
        status: 'Approved',
        currentStepId: null,
        startedOn: '2026-07-22 08:30',
        completedOn: '2026-07-25 12:00',
        steps: this.log([
          ['n1', 'Transfer Requested', 'start', 'Completed', 'Request submitted', '2026-07-22 08:30'],
          ['n2', 'Department = Operations?', 'condition', 'Completed', 'Department = IT → No branch', '2026-07-22 08:30'],
          ['n4', 'Department Head Approval', 'approval', 'Approved', 'Approve', '2026-07-23 09:40', 'Youssef Mansour', 'Approved, ownership confirmed.'],
          ['n5', 'Final Approval', 'approval', 'Approved', 'Approve', '2026-07-25 11:10', 'Asset Manager', 'Confirmed.'],
          ['n6', 'Update Status', 'action', 'Completed', 'Set asset status to Transferred; update custodian and location', '2026-07-25 11:11'],
          ['n7', 'End', 'end', 'Completed', 'Workflow completed', '2026-07-25 12:00']
        ])
      },
      // Disposal Approval (wf-4) — pending final approval at Finance.
      {
        id: 'inst-4',
        workflowId: 'wf-4',
        workflowName: 'Disposal Approval',
        module: 'Disposal',
        relatedEntityLabel: 'Disposal Request DR-125 (Old Server Rack - AST-0932)',
        requestedBy: 'Mona Fathi',
        status: 'Pending Final',
        currentStepId: 'n3',
        startedOn: '2026-07-30 13:00',
        steps: this.log([
          ['n1', 'Disposal Request Raised', 'start', 'Completed', 'Request submitted', '2026-07-30 13:00'],
          ['n2', 'Department Head Approval', 'approval', 'Approved', 'Approve', '2026-07-31 10:00', "Dynamic — Mona Fathi's Department Head", 'Confirmed asset end-of-life.'],
          ['n3', 'Finance Sign-off', 'approval', 'Pending', undefined, undefined, 'Layla Haddad', undefined, '2026-08-05', 'High']
        ])
      },
      // Disposal Approval (wf-4) — fully approved, shows the parallel branch converging.
      {
        id: 'inst-5',
        workflowId: 'wf-4',
        workflowName: 'Disposal Approval',
        module: 'Disposal',
        relatedEntityLabel: 'Disposal Request DR-118 (Broken Scanner - AST-0871)',
        requestedBy: 'Tariq Aziz',
        status: 'Approved',
        currentStepId: null,
        startedOn: '2026-07-28 09:00',
        completedOn: '2026-08-02 16:40',
        steps: this.log([
          ['n1', 'Disposal Request Raised', 'start', 'Completed', 'Request submitted', '2026-07-28 09:00'],
          ['n2', 'Department Head Approval', 'approval', 'Approved', 'Approve', '2026-07-29 09:30', "Dynamic — Tariq Aziz's Department Head", 'Approved.'],
          ['n3', 'Finance Sign-off', 'approval', 'Approved', 'Approve', '2026-08-02 16:35', 'Layla Haddad', 'Written off.'],
          ['n4', 'Notify Stakeholders', 'parallel', 'Completed', 'Parallel split into 2 branches', '2026-08-02 16:36'],
          ['n5', 'Notify IT Asset Store', 'action', 'Completed', 'Notify IT Asset Store of disposal', '2026-08-02 16:37'],
          ['n6', 'Notify Internal Auditor', 'action', 'Completed', 'Notify Internal Auditor for compliance record', '2026-08-02 16:37'],
          ['n7', 'End', 'end', 'Completed', 'Workflow completed', '2026-08-02 16:40']
        ])
      },
      // Asset Creation Approval (wf-1) — rejected history.
      {
        id: 'inst-6',
        workflowId: 'wf-1',
        workflowName: 'Asset Creation Approval',
        module: 'Asset',
        relatedEntityLabel: 'Asset Request AST-2088 (Executive Furniture Set)',
        requestedBy: 'Noura Al-Emadi',
        status: 'Rejected',
        currentStepId: null,
        startedOn: '2026-07-17 10:00',
        completedOn: '2026-07-18 09:15',
        steps: this.log([
          ['n1', 'Request Raised', 'start', 'Completed', 'Request submitted', '2026-07-17 10:00'],
          ['n2', 'Cost > AED 10,000?', 'condition', 'Completed', 'Asset Cost AED 22,000 > 10,000 → Yes branch', '2026-07-17 10:00'],
          ['n3', 'Manager Approval', 'approval', 'Rejected', 'Reject', '2026-07-18 09:15', 'Omar Youssef', 'Not aligned with current budget cycle.']
        ])
      }
    ];
  }

  // Compact tuple form kept the seed block above readable; expand to the full log shape here.
  private log(
    rows: [string, string, WorkflowNode['type'], StepLogStatus, string?, string?, string?, string?, string?, TaskPriority?][]
  ): WorkflowInstanceStepLog[] {
    return rows.map(([stepId, stepName, type, status, actionTaken, timestamp, approverName, comments, dueDate, priority]) => ({
      stepId,
      stepName,
      type,
      status,
      actionTaken,
      timestamp,
      approverName,
      comments,
      dueDate,
      priority
    }));
  }
}
