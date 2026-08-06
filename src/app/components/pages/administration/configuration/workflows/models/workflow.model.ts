// ===== Workflow Master (Definition Engine) =====

export type WorkflowModule = 'Asset' | 'Transfer' | 'Maintenance' | 'Disposal' | 'Procurement';

export type TriggerEvent = 'On Create' | 'On Update' | 'On Delete' | 'Manual';

export type WorkflowStatus = 'Draft' | 'Active' | 'Inactive';

export type NodeType = 'start' | 'approval' | 'condition' | 'action' | 'parallel' | 'end';

export interface NodePosition {
  x: number;
  y: number;
}

// ----- 2.4 Approval Matrix / Role Mapping -----
export type ApproverType = 'User' | 'Role' | 'Department Head' | 'Dynamic';

export interface ApprovalStepConfig {
  approverType: ApproverType;
  approverValue: string; // specific user / role name, or e.g. "Asset Owner" when Dynamic
  slaHours: number;
  escalationRule: string;
  autoApprove: boolean;
}

// ----- 2.3 Workflow Rules Engine -----
export type ConditionOperator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'IN';

export interface ConditionStepConfig {
  field: string; // e.g. Asset Cost, Department, Category
  operator: ConditionOperator;
  value: string;
}

export type ActionType = 'Send Notification' | 'Update Status' | 'Assign Task' | 'Auto-create Asset';

export interface ActionStepConfig {
  actionType: ActionType;
  parameters: string;
}

// ----- 2.2 Workflow Steps / Stages (a single node on the builder canvas) -----
export interface WorkflowNode {
  id: string;
  type: NodeType;
  name: string;
  position: NodePosition;
  approval?: ApprovalStepConfig;
  condition?: ConditionStepConfig;
  action?: ActionStepConfig;
  // Outgoing connections to other node ids. Condition/Parallel nodes may fan out
  // to more than one — branchLabelFor() derives the label shown on each line.
  nextIds: string[];
}

// ----- 2.1 Workflow Master -----
export interface WorkflowDefinition {
  id: string;
  name: string;
  module: WorkflowModule;
  triggerEvent: TriggerEvent;
  description: string;
  version: number;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  createdBy: string;
  createdOn: string;
  lastModified: string;
}

// ===== 2.5 Workflow Instance (Runtime Engine) =====

export type InstanceStatus = 'In Progress' | 'Pending Final' | 'Approved' | 'Rejected';

export type StepLogStatus =
  | 'Completed'
  | 'Approved'
  | 'Rejected'
  | 'Pending'
  | 'Escalated'
  | 'Skipped'
  | 'Requested Changes';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

// One row of the instance's execution log — also doubles as a "task" once its
// status is Pending and its type is an approval step (see WorkflowInstanceService.getTasks()).
export interface WorkflowInstanceStepLog {
  stepId: string;
  stepName: string;
  type: NodeType;
  approverType?: ApproverType;
  approverName?: string;
  status: StepLogStatus;
  actionTaken?: string;
  timestamp?: string;
  comments?: string;
  dueDate?: string;
  priority?: TaskPriority;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  workflowName: string;
  module: WorkflowModule;
  relatedEntityLabel: string; // e.g. "Asset AST-1003" or "Transfer Request TR-204"
  requestedBy: string;
  status: InstanceStatus;
  currentStepId: string | null;
  startedOn: string;
  completedOn?: string;
  steps: WorkflowInstanceStepLog[];
}

// ===== 2.6 Task / Action Management (My Tasks / Approvals) =====
export interface WorkflowTask {
  taskId: string; // `${instanceId}::${stepId}`
  instanceId: string;
  stepId: string;
  workflowName: string;
  module: WorkflowModule;
  relatedEntityLabel: string;
  requestedBy: string;
  dueDate: string;
  priority: TaskPriority;
  status: StepLogStatus;
  comments?: string;
}

// ===== 2.7 Notifications & Escalations =====
export type NotificationLevel = 'info' | 'warning' | 'success' | 'error';

export interface WorkflowNotification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  level: NotificationLevel;
  link: string;
}
