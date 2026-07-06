export type WorkOrderType = 'Preventive' | 'Corrective' | 'Predictive';
export type WorkOrderPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type WorkOrderStatus = 'Open' | 'In Progress' | 'Completed' | 'Closed';

export interface WorkOrder {
  workOrderId: string;
  assetId: string;
  workType: WorkOrderType | '';
  title: string;
  priority: WorkOrderPriority | '';
  status: WorkOrderStatus | '';
  createdDate: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  downtimeDuration: number | null;
  assignedTechnician: string;
  department: string;
  location: string;
  selected?: boolean;
}

export type WorkOrderForm = Omit<WorkOrder, 'selected'>;
