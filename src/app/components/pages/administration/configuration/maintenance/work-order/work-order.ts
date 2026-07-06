import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkOrder, WorkOrderForm } from './work-order.model';
import { WorkOrderService } from './work-order.service';

interface WorkOrderColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-maintenance-work-order',
  imports: [CommonModule, FormsModule],
  templateUrl: './work-order.html',
  styleUrls: ['./work-order.css']
})
export class MaintenanceWorkOrder {
  searchTerm = '';

  columns: WorkOrderColumn[] = [
    { key: 'workOrderId', label: 'Work Order ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'workType', label: 'Work Type', visible: true },
    { key: 'title', label: 'Title / Description', visible: true },
    { key: 'priority', label: 'Priority', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'createdDate', label: 'Created Date', visible: true },
    { key: 'scheduledDate', label: 'Scheduled Date', visible: true },
    { key: 'startTime', label: 'Start Time', visible: false },
    { key: 'endTime', label: 'End Time', visible: false },
    { key: 'downtimeDuration', label: 'Downtime Duration', visible: false },
    { key: 'assignedTechnician', label: 'Assigned Technician', visible: true },
    { key: 'department', label: 'Department', visible: false },
    { key: 'location', label: 'Location', visible: false }
  ];

  showColumnPicker = false;

  workOrders: WorkOrder[] = [];
  filteredWorkOrders: WorkOrder[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingWorkOrder: WorkOrder | null = null;

  form: WorkOrderForm = this.emptyForm();

  constructor(private workOrderService: WorkOrderService) {
    this.refresh();
  }

  get assetMaster() {
    return this.workOrderService.assetMaster;
  }

  get workTypeMaster() {
    return this.workOrderService.workTypeMaster;
  }

  get priorityMaster() {
    return this.workOrderService.priorityMaster;
  }

  get statusMaster() {
    return this.workOrderService.statusMaster;
  }

  get technicianMaster() {
    return this.workOrderService.technicianMaster;
  }

  get departmentMaster() {
    return this.workOrderService.departmentMaster;
  }

  get locationMaster() {
    return this.workOrderService.locationMaster;
  }

  private emptyForm(): WorkOrderForm {
    return {
      workOrderId: '',
      assetId: '',
      workType: '',
      title: '',
      priority: '',
      status: '',
      createdDate: new Date().toISOString().slice(0, 10),
      scheduledDate: '',
      startTime: '',
      endTime: '',
      downtimeDuration: null,
      assignedTechnician: '',
      department: '',
      location: ''
    };
  }

  private refresh(): void {
    this.workOrders = this.workOrderService.getWorkOrders();
    this.onSearch();
  }

  assetName(assetId: string): string {
    return this.assetMaster.find((a) => a.id === assetId)?.name ?? assetId;
  }

  isColumnVisible(key: string): boolean {
    return this.columns.find((c) => c.key === key)?.visible ?? true;
  }

  toggleColumnPicker(): void {
    this.showColumnPicker = !this.showColumnPicker;
  }

  closeColumnPicker(): void {
    this.showColumnPicker = false;
  }

  toggleColumn(col: WorkOrderColumn): void {
    col.visible = !col.visible;
  }

  get selectedWorkOrders(): WorkOrder[] {
    return this.filteredWorkOrders.filter((wo) => wo.selected);
  }

  get allSelected(): boolean {
    return this.filteredWorkOrders.length > 0 && this.filteredWorkOrders.every((wo) => wo.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredWorkOrders.forEach((wo) => (wo.selected = next));
  }

  toggleSelectWorkOrder(workOrder: WorkOrder): void {
    workOrder.selected = !workOrder.selected;
  }

  onSearch(): void {
    this.filteredWorkOrders = this.workOrderService.search(this.searchTerm);
  }

  onRefresh(): void {
    this.searchTerm = '';
    this.refresh();
  }

  onCreate(): void {
    this.isEditMode = false;
    this.editingWorkOrder = null;
    this.form = this.emptyForm();
    this.showFormModal = true;
  }

  onEdit(): void {
    if (this.selectedWorkOrders.length !== 1) return;
    const workOrder = this.selectedWorkOrders[0];
    this.isEditMode = true;
    this.editingWorkOrder = workOrder;
    const { selected, ...rest } = workOrder;
    this.form = { ...rest };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingWorkOrder = null;
  }

  submitForm(): void {
    if (this.isEditMode && this.editingWorkOrder) {
      this.workOrderService.updateWorkOrder(this.editingWorkOrder.workOrderId, { ...this.form });
    } else {
      this.workOrderService.addWorkOrder({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedWorkOrders.length === 0) return;
    this.workOrderService.deleteWorkOrders(this.selectedWorkOrders.map((wo) => wo.workOrderId));
    this.refresh();
  }

  onUpload(): void {
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
  }

  onDownload(): void {
    // TODO: export current work order list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
