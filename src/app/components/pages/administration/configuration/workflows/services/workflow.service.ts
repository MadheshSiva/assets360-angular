import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  TriggerEvent,
  WorkflowDefinition,
  WorkflowModule,
  WorkflowNode,
  WorkflowStatus
} from '../models/workflow.model';

// 2.1 Workflow Master (Definition Engine) — CRUD + clone/activate for workflow templates,
// plus the runtime graph (WorkflowNode[]) each definition carries for the Builder screen.
@Injectable({ providedIn: 'root' })
export class WorkflowService {
  private nextDefId = 5;
  private nextNodeSeq = 1;

  private definitionsSubject = new BehaviorSubject<WorkflowDefinition[]>(this.seed());

  getAll(): WorkflowDefinition[] {
    return this.definitionsSubject.value;
  }

  watch() {
    return this.definitionsSubject.asObservable();
  }

  getById(id: string): WorkflowDefinition | undefined {
    return this.definitionsSubject.value.find((w) => w.id === id);
  }

  search(term: string, module: string, status: string): WorkflowDefinition[] {
    const t = term.trim().toLowerCase();
    return this.definitionsSubject.value.filter((w) => {
      const matchesTerm = !t || w.name.toLowerCase().includes(t) || w.description.toLowerCase().includes(t);
      const matchesModule = !module || w.module === module;
      const matchesStatus = !status || w.status === status;
      return matchesTerm && matchesModule && matchesStatus;
    });
  }

  create(def: Omit<WorkflowDefinition, 'id' | 'version' | 'createdOn' | 'lastModified' | 'createdBy'>): WorkflowDefinition {
    const today = this.todayIso();
    const created: WorkflowDefinition = {
      ...def,
      id: `wf-${this.nextDefId++}`,
      version: 1,
      createdBy: 'Current User',
      createdOn: today,
      lastModified: today
    };
    this.definitionsSubject.next([created, ...this.definitionsSubject.value]);
    return created;
  }

  update(id: string, changes: Partial<WorkflowDefinition>): void {
    this.definitionsSubject.next(
      this.definitionsSubject.value.map((w) =>
        w.id === id ? { ...w, ...changes, lastModified: this.todayIso() } : w
      )
    );
  }

  clone(id: string): WorkflowDefinition | undefined {
    const source = this.getById(id);
    if (!source) return undefined;
    const today = this.todayIso();
    const cloned: WorkflowDefinition = {
      ...source,
      id: `wf-${this.nextDefId++}`,
      name: `${source.name} (Copy)`,
      status: 'Draft',
      version: 1,
      nodes: source.nodes.map((n) => ({ ...n, position: { ...n.position }, nextIds: [...n.nextIds] })),
      createdBy: 'Current User',
      createdOn: today,
      lastModified: today
    };
    this.definitionsSubject.next([cloned, ...this.definitionsSubject.value]);
    return cloned;
  }

  toggleActive(id: string): void {
    const def = this.getById(id);
    if (!def) return;
    const next: WorkflowStatus = def.status === 'Active' ? 'Inactive' : 'Active';
    this.update(id, { status: next });
  }

  deleteDefinition(id: string): void {
    this.definitionsSubject.next(this.definitionsSubject.value.filter((w) => w.id !== id));
  }

  newNodeId(): string {
    return `n${Date.now()}-${this.nextNodeSeq++}`;
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  // ===== Seed data — pre-built templates matching the module/module examples in the RFP =====
  private seed(): WorkflowDefinition[] {
    return [
      this.assetCreationWorkflow(),
      this.assetTransferWorkflow(),
      this.maintenanceWorkflow(),
      this.disposalWorkflow()
    ];
  }

  private assetCreationWorkflow(): WorkflowDefinition {
    const nodes: WorkflowNode[] = [
      { id: 'n1', type: 'start', name: 'Request Raised', position: { x: 260, y: 40 }, nextIds: ['n2'] },
      {
        id: 'n2',
        type: 'condition',
        name: 'Cost > AED 10,000?',
        position: { x: 260, y: 170 },
        condition: { field: 'Asset Cost', operator: '>', value: '10000' },
        nextIds: ['n3', 'n6']
      },
      {
        id: 'n3',
        type: 'approval',
        name: 'Manager Approval',
        position: { x: 90, y: 300 },
        approval: { approverType: 'Role', approverValue: 'Department Manager', slaHours: 24, escalationRule: 'Escalate to Department Head after SLA breach', autoApprove: false },
        nextIds: ['n4']
      },
      {
        id: 'n4',
        type: 'approval',
        name: 'Finance Approval',
        position: { x: 90, y: 430 },
        approval: { approverType: 'Role', approverValue: 'Finance Manager', slaHours: 48, escalationRule: 'Escalate to Finance Director after SLA breach', autoApprove: false },
        nextIds: ['n6']
      },
      {
        id: 'n6',
        type: 'action',
        name: 'Auto-create Asset',
        position: { x: 260, y: 560 },
        action: { actionType: 'Auto-create Asset', parameters: 'Create asset record in register with Active status' },
        nextIds: ['n7']
      },
      { id: 'n7', type: 'end', name: 'End', position: { x: 260, y: 690 }, nextIds: [] }
    ];
    return {
      id: 'wf-1',
      name: 'Asset Creation Approval',
      module: 'Asset',
      triggerEvent: 'On Create',
      description: 'Routes new high-value asset requests through manager and finance approval before the asset is auto-created in the register.',
      version: 3,
      status: 'Active',
      nodes,
      createdBy: 'Priya Nair',
      createdOn: '2026-05-12',
      lastModified: '2026-07-28'
    };
  }

  private assetTransferWorkflow(): WorkflowDefinition {
    const nodes: WorkflowNode[] = [
      { id: 'n1', type: 'start', name: 'Transfer Requested', position: { x: 260, y: 40 }, nextIds: ['n2'] },
      {
        id: 'n2',
        type: 'condition',
        name: 'Department = Operations?',
        position: { x: 260, y: 170 },
        condition: { field: 'Department', operator: '=', value: 'Operations' },
        nextIds: ['n3', 'n4']
      },
      {
        id: 'n3',
        type: 'approval',
        name: 'Route to Ops Manager',
        position: { x: 90, y: 300 },
        approval: { approverType: 'Role', approverValue: 'Operations Manager', slaHours: 24, escalationRule: 'Escalate to Ops Director after 24h', autoApprove: false },
        nextIds: ['n5']
      },
      {
        id: 'n4',
        type: 'approval',
        name: 'Department Head Approval',
        position: { x: 430, y: 300 },
        approval: { approverType: 'Department Head', approverValue: 'Dynamic — based on asset owner', slaHours: 24, escalationRule: 'Escalate to next-level Department Head after 24h', autoApprove: false },
        nextIds: ['n5']
      },
      {
        id: 'n5',
        type: 'approval',
        name: 'Final Approval',
        position: { x: 260, y: 430 },
        approval: { approverType: 'User', approverValue: 'Asset Manager', slaHours: 12, escalationRule: 'Escalate to Admin after 12h', autoApprove: false },
        nextIds: ['n6']
      },
      {
        id: 'n6',
        type: 'action',
        name: 'Update Status',
        position: { x: 260, y: 560 },
        action: { actionType: 'Update Status', parameters: 'Set asset status to Transferred; update custodian and location' },
        nextIds: ['n7']
      },
      { id: 'n7', type: 'end', name: 'End', position: { x: 260, y: 690 }, nextIds: [] }
    ];
    return {
      id: 'wf-2',
      name: 'Asset Transfer Approval',
      module: 'Transfer',
      triggerEvent: 'On Update',
      description: 'Approval chain for moving an asset between custodians, departments or locations.',
      version: 2,
      status: 'Active',
      nodes,
      createdBy: 'Priya Nair',
      createdOn: '2026-05-20',
      lastModified: '2026-07-30'
    };
  }

  private maintenanceWorkflow(): WorkflowDefinition {
    const nodes: WorkflowNode[] = [
      { id: 'n1', type: 'start', name: 'Maintenance Request Raised', position: { x: 260, y: 40 }, nextIds: ['n2'] },
      {
        id: 'n2',
        type: 'approval',
        name: 'Technician Lead Review',
        position: { x: 260, y: 170 },
        approval: { approverType: 'Role', approverValue: 'Maintenance Supervisor', slaHours: 8, escalationRule: 'Escalate to Facilities Manager after 8h', autoApprove: false },
        nextIds: ['n3']
      },
      {
        id: 'n3',
        type: 'condition',
        name: 'Estimated Cost > AED 5,000?',
        position: { x: 260, y: 300 },
        condition: { field: 'Repair Cost', operator: '>', value: '5000' },
        nextIds: ['n4', 'n5']
      },
      {
        id: 'n4',
        type: 'approval',
        name: 'Finance Approval',
        position: { x: 430, y: 430 },
        approval: { approverType: 'Role', approverValue: 'Finance Manager', slaHours: 24, escalationRule: 'Escalate to Finance Director after 24h', autoApprove: false },
        nextIds: ['n5']
      },
      {
        id: 'n5',
        type: 'action',
        name: 'Assign Task',
        position: { x: 260, y: 560 },
        action: { actionType: 'Assign Task', parameters: 'Create work order and assign technician' },
        nextIds: ['n6']
      },
      { id: 'n6', type: 'end', name: 'End', position: { x: 260, y: 690 }, nextIds: [] }
    ];
    return {
      id: 'wf-3',
      name: 'Maintenance Approval',
      module: 'Maintenance',
      triggerEvent: 'Manual',
      description: 'Draft workflow for breakdown/repair requests — technician review, conditional finance sign-off, then work order creation.',
      version: 1,
      status: 'Draft',
      nodes,
      createdBy: 'Ahmed Al-Sayed',
      createdOn: '2026-07-15',
      lastModified: '2026-07-15'
    };
  }

  private disposalWorkflow(): WorkflowDefinition {
    const nodes: WorkflowNode[] = [
      { id: 'n1', type: 'start', name: 'Disposal Request Raised', position: { x: 260, y: 40 }, nextIds: ['n2'] },
      {
        id: 'n2',
        type: 'approval',
        name: 'Department Head Approval',
        position: { x: 260, y: 170 },
        approval: { approverType: 'Department Head', approverValue: 'Dynamic — based on asset owner', slaHours: 24, escalationRule: 'Escalate to next-level Department Head after 24h', autoApprove: false },
        nextIds: ['n3']
      },
      {
        id: 'n3',
        type: 'approval',
        name: 'Finance Sign-off',
        position: { x: 260, y: 300 },
        approval: { approverType: 'Role', approverValue: 'Finance Manager', slaHours: 24, escalationRule: 'Escalate to Finance Director after 24h', autoApprove: false },
        nextIds: ['n4']
      },
      {
        id: 'n4',
        type: 'parallel',
        name: 'Notify Stakeholders',
        position: { x: 260, y: 430 },
        nextIds: ['n5', 'n6']
      },
      {
        id: 'n5',
        type: 'action',
        name: 'Notify IT Asset Store',
        position: { x: 90, y: 560 },
        action: { actionType: 'Send Notification', parameters: 'Notify IT Asset Store of disposal' },
        nextIds: ['n7']
      },
      {
        id: 'n6',
        type: 'action',
        name: 'Notify Internal Auditor',
        position: { x: 430, y: 560 },
        action: { actionType: 'Send Notification', parameters: 'Notify Internal Auditor for compliance record' },
        nextIds: ['n7']
      },
      { id: 'n7', type: 'end', name: 'End', position: { x: 260, y: 690 }, nextIds: [] }
    ];
    return {
      id: 'wf-4',
      name: 'Disposal Approval',
      module: 'Disposal',
      triggerEvent: 'Manual',
      description: 'Department Head and Finance sign-off for asset disposal, with parallel stakeholder notification.',
      version: 1,
      status: 'Active',
      nodes,
      createdBy: 'Ahmed Al-Sayed',
      createdOn: '2026-06-02',
      lastModified: '2026-07-10'
    };
  }
}

export const WORKFLOW_MODULE_OPTIONS: WorkflowModule[] = ['Asset', 'Transfer', 'Maintenance', 'Disposal', 'Procurement'];
export const TRIGGER_EVENT_OPTIONS: TriggerEvent[] = ['On Create', 'On Update', 'On Delete', 'Manual'];
