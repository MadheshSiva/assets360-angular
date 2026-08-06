import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';
import {
  ActionType,
  ApproverType,
  ConditionOperator,
  NodeType,
  WorkflowDefinition,
  WorkflowModule as WfModule,
  WorkflowNode,
  WorkflowStatus
} from '../models/workflow.model';
import { TRIGGER_EVENT_OPTIONS, WORKFLOW_MODULE_OPTIONS, WorkflowService } from '../services/workflow.service';

interface PaletteItem {
  type: NodeType;
  label: string;
  hint: string;
}

interface ConnectionPath {
  sourceId: string;
  targetId: string;
  d: string;
  midX: number;
  midY: number;
  label: string;
}

// Node box geometry — used both for rendering and for the connector-line math.
const NODE_W = 180;
const NODE_H = 64;

// 3. Workflow Builder — the visual drag-and-drop canvas (2.2 Steps/Stages, 2.3 Rules
// Engine, 2.4 Approval Matrix all get authored here per-node via the right panel).
@Component({
  standalone: true,
  selector: 'app-workflow-builder',
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './workflow-builder.html',
  styleUrls: ['./workflow-builder.css']
})
export class WorkflowBuilder implements OnInit {
  workflow: WorkflowDefinition = this.blankWorkflow();
  isNew = true;

  selectedNodeId: string | null = null;
  connectingFromId: string | null = null;
  zoom = 1;

  moduleOptions = WORKFLOW_MODULE_OPTIONS;
  triggerOptions = TRIGGER_EVENT_OPTIONS;
  statusOptions: WorkflowStatus[] = ['Draft', 'Active', 'Inactive'];
  approverTypeOptions: ApproverType[] = ['User', 'Role', 'Department Head', 'Dynamic'];
  conditionOperatorOptions: ConditionOperator[] = ['=', '!=', '>', '<', '>=', '<=', 'IN'];
  actionTypeOptions: ActionType[] = ['Send Notification', 'Update Status', 'Assign Task', 'Auto-create Asset'];

  palette: PaletteItem[] = [
    { type: 'start', label: 'Start Event', hint: 'Entry point of the workflow' },
    { type: 'approval', label: 'Approval Step', hint: 'Route to a user, role or department head' },
    { type: 'condition', label: 'Condition (IF/ELSE)', hint: 'Branch based on a field value' },
    { type: 'action', label: 'Action', hint: 'Update / notify / assign automatically' },
    { type: 'parallel', label: 'Parallel Step', hint: 'Fan out into concurrent branches' },
    { type: 'end', label: 'End', hint: 'Terminates the workflow' }
  ];

  constructor(
    private workflowService: WorkflowService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const existing = this.workflowService.getById(id);
      if (existing) {
        this.isNew = false;
        this.workflow = {
          ...existing,
          nodes: existing.nodes.map((n) => ({ ...n, position: { ...n.position }, nextIds: [...n.nextIds] }))
        };
      }
    }
  }

  // ===== Node selection / connection state =====
  get selectedNode(): WorkflowNode | null {
    return this.workflow.nodes.find((n) => n.id === this.selectedNodeId) || null;
  }

  get hasStartNode(): boolean {
    return this.workflow.nodes.some((n) => n.type === 'start');
  }

  selectNode(node: WorkflowNode, event: MouseEvent): void {
    event.stopPropagation();
    if (this.connectingFromId && this.connectingFromId !== node.id) {
      this.completeConnection(node.id);
      return;
    }
    this.selectedNodeId = node.id;
  }

  onCanvasClick(): void {
    this.selectedNodeId = null;
    this.connectingFromId = null;
  }

  startConnect(node: WorkflowNode, event: MouseEvent): void {
    event.stopPropagation();
    if (this.connectingFromId === node.id) {
      this.connectingFromId = null;
      return;
    }
    if (this.connectingFromId) {
      this.completeConnection(node.id);
      return;
    }
    this.connectingFromId = node.id;
  }

  private completeConnection(targetId: string): void {
    const source = this.workflow.nodes.find((n) => n.id === this.connectingFromId);
    this.connectingFromId = null;
    if (!source || source.id === targetId) return;
    if (!source.nextIds.includes(targetId)) {
      source.nextIds = [...source.nextIds, targetId];
    }
  }

  removeConnection(sourceId: string, targetId: string): void {
    const source = this.workflow.nodes.find((n) => n.id === sourceId);
    if (!source) return;
    source.nextIds = source.nextIds.filter((id) => id !== targetId);
  }

  // ===== Palette → add node =====
  addNode(type: NodeType): void {
    if (type === 'start' && this.hasStartNode) return;

    const anchor = this.selectedNode;
    const position = anchor
      ? { x: anchor.position.x, y: anchor.position.y + 130 }
      : { x: 260, y: this.nextFreeY() };

    const node: WorkflowNode = {
      id: this.workflowService.newNodeId(),
      type,
      name: this.defaultNameFor(type),
      position,
      nextIds: [],
      approval: type === 'approval' ? { approverType: 'Role', approverValue: '', slaHours: 24, escalationRule: '', autoApprove: false } : undefined,
      condition: type === 'condition' ? { field: '', operator: '=', value: '' } : undefined,
      action: type === 'action' ? { actionType: 'Send Notification', parameters: '' } : undefined
    };

    this.workflow.nodes = [...this.workflow.nodes, node];

    if (anchor && anchor.id !== node.id) {
      anchor.nextIds = [...anchor.nextIds, node.id];
    }

    this.selectedNodeId = node.id;
  }

  deleteNode(node: WorkflowNode, event: MouseEvent): void {
    event.stopPropagation();
    if (node.type === 'start' && this.workflow.nodes.filter((n) => n.type === 'start').length <= 1) {
      alert('A workflow must have exactly one Start node.');
      return;
    }
    this.workflow.nodes = this.workflow.nodes
      .filter((n) => n.id !== node.id)
      .map((n) => ({ ...n, nextIds: n.nextIds.filter((id) => id !== node.id) }));
    if (this.selectedNodeId === node.id) this.selectedNodeId = null;
    if (this.connectingFromId === node.id) this.connectingFromId = null;
  }

  private nextFreeY(): number {
    if (this.workflow.nodes.length === 0) return 40;
    return Math.max(...this.workflow.nodes.map((n) => n.position.y)) + 130;
  }

  private defaultNameFor(type: NodeType): string {
    switch (type) {
      case 'start': return 'Request Raised';
      case 'approval': return 'Approval Step';
      case 'condition': return 'Condition';
      case 'action': return 'Action';
      case 'parallel': return 'Parallel Step';
      case 'end': return 'End';
    }
  }

  // ===== Dragging (positions nodes freely on the canvas) =====
  onNodeDrag(node: WorkflowNode, event: CdkDragMove): void {
    node.position = event.source.getFreeDragPosition();
  }

  // ===== Auto-align (simple layered layout, BFS from Start) =====
  autoAlign(): void {
    const start = this.workflow.nodes.find((n) => n.type === 'start');
    if (!start) return;

    const depthOf = new Map<string, number>();
    const queue: string[] = [start.id];
    depthOf.set(start.id, 0);
    while (queue.length) {
      const id = queue.shift() as string;
      const node = this.workflow.nodes.find((n) => n.id === id);
      if (!node) continue;
      for (const nextId of node.nextIds) {
        const candidate = (depthOf.get(id) || 0) + 1;
        if (depthOf.get(nextId) === undefined || candidate > (depthOf.get(nextId) as number)) {
          depthOf.set(nextId, candidate);
          queue.push(nextId);
        }
      }
    }

    const byDepth = new Map<number, WorkflowNode[]>();
    this.workflow.nodes.forEach((n) => {
      const d = depthOf.get(n.id) ?? 0;
      byDepth.set(d, [...(byDepth.get(d) || []), n]);
    });

    byDepth.forEach((nodes, depth) => {
      const totalWidth = nodes.length * 220;
      const startX = 460 - totalWidth / 2;
      nodes.forEach((n, i) => {
        n.position = { x: Math.max(40, startX + i * 220), y: 40 + depth * 140 };
      });
    });
  }

  // ===== Zoom =====
  zoomIn(): void { this.zoom = Math.min(1.5, Math.round((this.zoom + 0.1) * 10) / 10); }
  zoomOut(): void { this.zoom = Math.max(0.5, Math.round((this.zoom - 0.1) * 10) / 10); }
  zoomReset(): void { this.zoom = 1; }

  // ===== Canvas geometry =====
  get canvasWidth(): number {
    if (this.workflow.nodes.length === 0) return 900;
    return Math.max(900, ...this.workflow.nodes.map((n) => n.position.x + NODE_W + 120));
  }

  get canvasHeight(): number {
    if (this.workflow.nodes.length === 0) return 760;
    return Math.max(760, ...this.workflow.nodes.map((n) => n.position.y + NODE_H + 120));
  }

  connectionPaths(): ConnectionPath[] {
    const paths: ConnectionPath[] = [];
    for (const node of this.workflow.nodes) {
      node.nextIds.forEach((targetId, index) => {
        const target = this.workflow.nodes.find((n) => n.id === targetId);
        if (!target) return;
        const sx = node.position.x + NODE_W / 2;
        const sy = node.position.y + NODE_H;
        const tx = target.position.x + NODE_W / 2;
        const ty = target.position.y;
        const d = `M ${sx},${sy} C ${sx},${sy + 45} ${tx},${ty - 45} ${tx},${ty}`;
        paths.push({
          sourceId: node.id,
          targetId,
          d,
          midX: (sx + tx) / 2,
          midY: (sy + ty) / 2,
          label: this.branchLabel(node, index)
        });
      });
    }
    return paths;
  }

  private branchLabel(node: WorkflowNode, index: number): string {
    if (node.type === 'condition') return index === 0 ? 'Yes' : index === 1 ? 'No' : `Branch ${index + 1}`;
    if (node.type === 'parallel') return `Branch ${index + 1}`;
    return '';
  }

  // ===== Templates (reuse the pre-built workflows as starting points) =====
  applyTemplate(id: string): void {
    const template = this.workflowService.getById(id);
    if (!template) return;
    this.workflow = {
      ...this.workflow,
      module: template.module,
      triggerEvent: template.triggerEvent,
      description: template.description,
      nodes: template.nodes.map((n) => ({ ...n, position: { ...n.position }, nextIds: [...n.nextIds] }))
    };
    this.selectedNodeId = null;
  }

  // ===== Save / cancel =====
  get isValid(): boolean {
    return this.workflow.name.trim().length > 0 && this.hasStartNode;
  }

  save(): void {
    if (!this.isValid) return;
    if (this.isNew) {
      this.workflowService.create({
        name: this.workflow.name.trim(),
        module: this.workflow.module,
        triggerEvent: this.workflow.triggerEvent,
        description: this.workflow.description,
        status: this.workflow.status,
        nodes: this.workflow.nodes
      });
    } else {
      this.workflowService.update(this.workflow.id, {
        name: this.workflow.name.trim(),
        module: this.workflow.module,
        triggerEvent: this.workflow.triggerEvent,
        description: this.workflow.description,
        status: this.workflow.status,
        nodes: this.workflow.nodes,
        version: this.workflow.version + 1
      });
    }
    this.router.navigate(['/administration/configuration/workflows/list']);
  }

  cancel(): void {
    this.router.navigate(['/administration/configuration/workflows/list']);
  }

  private blankWorkflow(): WorkflowDefinition {
    return {
      id: '',
      name: '',
      module: 'Asset' as WfModule,
      triggerEvent: 'On Create',
      description: '',
      version: 1,
      status: 'Draft',
      nodes: [
        { id: 'start-1', type: 'start', name: 'Request Raised', position: { x: 260, y: 40 }, nextIds: [] }
      ],
      createdBy: '',
      createdOn: '',
      lastModified: ''
    };
  }

  get templateOptions(): WorkflowDefinition[] {
    return this.workflowService.getAll();
  }
}
