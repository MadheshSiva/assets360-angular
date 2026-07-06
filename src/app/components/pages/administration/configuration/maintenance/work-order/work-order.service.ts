import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WorkOrder } from './work-order.model';

/**
 * Standalone data/master layer for the Work Order sub-module, kept independent of the
 * other Maintenance sub-modules so it can be pointed at its own backend microservice
 * (e.g. a "work-order" service) without touching the rest of the Maintenance feature set.
 */
@Injectable({ providedIn: 'root' })
export class WorkOrderService {
  readonly assetMaster: { id: string; name: string }[] = [
    { id: 'AST-1001', name: 'HVAC Unit 1' },
    { id: 'AST-1002', name: 'Fire Panel A' },
    { id: 'AST-1003', name: 'Chiller Pump 2' }
  ];

  readonly workTypeMaster: string[] = ['Preventive', 'Corrective', 'Predictive'];
  readonly priorityMaster: string[] = ['Low', 'Medium', 'High', 'Critical'];
  readonly statusMaster: string[] = ['Open', 'In Progress', 'Completed', 'Closed'];
  readonly technicianMaster: string[] = ['John Mathew', 'Ali Hassan', 'Priya Nair', 'Carlos Diaz'];
  readonly departmentMaster: string[] = ['Facilities', 'Electrical', 'Mechanical', 'IT', 'Safety'];
  readonly locationMaster: string[] = [
    'Dubai Mall - Ground Floor',
    'Marina Mall - Tower A',
    'Warehouse B',
    'Main Plant'
  ];

  private readonly workOrdersSubject = new BehaviorSubject<WorkOrder[]>([
    {
      workOrderId: 'WO-2001',
      assetId: 'AST-1001',
      workType: 'Preventive',
      title: 'Quarterly HVAC filter replacement',
      priority: 'Medium',
      status: 'Open',
      createdDate: '2026-06-01',
      scheduledDate: '2026-06-10',
      startTime: '09:00',
      endTime: '11:00',
      downtimeDuration: 120,
      assignedTechnician: 'John Mathew',
      department: 'Facilities',
      location: 'Dubai Mall - Ground Floor'
    },
    {
      workOrderId: 'WO-2002',
      assetId: 'AST-1002',
      workType: 'Corrective',
      title: 'Fire panel fault reset',
      priority: 'Critical',
      status: 'In Progress',
      createdDate: '2026-06-15',
      scheduledDate: '2026-06-15',
      startTime: '14:00',
      endTime: '15:30',
      downtimeDuration: 90,
      assignedTechnician: 'Ali Hassan',
      department: 'Electrical',
      location: 'Marina Mall - Tower A'
    }
  ]);

  private nextSequence = 2003;

  getWorkOrders(): WorkOrder[] {
    return this.workOrdersSubject.value;
  }

  addWorkOrder(workOrder: WorkOrder): WorkOrder {
    const workOrderId = workOrder.workOrderId || `WO-${this.nextSequence++}`;
    const created: WorkOrder = { ...workOrder, workOrderId };
    this.workOrdersSubject.next([...this.workOrdersSubject.value, created]);
    return created;
  }

  updateWorkOrder(workOrderId: string, changes: WorkOrder): void {
    this.workOrdersSubject.next(
      this.workOrdersSubject.value.map((wo) => (wo.workOrderId === workOrderId ? { ...wo, ...changes } : wo))
    );
  }

  deleteWorkOrders(workOrderIds: string[]): void {
    this.workOrdersSubject.next(
      this.workOrdersSubject.value.filter((wo) => !workOrderIds.includes(wo.workOrderId))
    );
  }

  search(term: string): WorkOrder[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.workOrdersSubject.value;
    return this.workOrdersSubject.value.filter((wo) =>
      Object.values(wo).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
