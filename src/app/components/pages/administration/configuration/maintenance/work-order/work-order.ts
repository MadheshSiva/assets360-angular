import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { RowActions } from 'shared-ui';
import { WorkOrder, WorkOrderForm, WorkOrderType, WorkOrderPriority, WorkOrderStatus } from './work-order.model';
import { WorkOrderService } from './work-order.service';

interface WorkOrderColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-maintenance-work-order',
  imports: [CommonModule, FormsModule, ImportFileModal, MasterLinkIcons, RowActions],
  templateUrl: './work-order.html',
  styleUrls: ['./work-order.css']
})
export class MaintenanceWorkOrder {
  searchTerm = '';

  columns: WorkOrderColumn[] = [
    { key: 'workOrderId', label: 'Work Order ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
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

  readonly importColumns: ImportColumn[] = [
    { key: 'workOrderId', label: 'Work Order ID' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'workType', label: 'Work Type' },
    { key: 'title', label: 'Title / Description' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'createdDate', label: 'Created Date' },
    { key: 'scheduledDate', label: 'Scheduled Date' },
    { key: 'startTime', label: 'Start Time' },
    { key: 'endTime', label: 'End Time' },
    { key: 'downtimeDuration', label: 'Downtime Duration' },
    { key: 'assignedTechnician', label: 'Assigned Technician' },
    { key: 'department', label: 'Department' },
    { key: 'location', label: 'Location' }
  ];

  showImportModal = false;

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
      assetId: [],
      workType: [],
      title: '',
      priority: '',
      status: '',
      createdDate: new Date().toISOString().slice(0, 10),
      scheduledDate: '',
      startTime: '',
      endTime: '',
      downtimeDuration: null,
      assignedTechnician: [],
      department: '',
      location: ''
    };
  }

  addFormAssetId(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    select.value = '';
    if (value && !this.form.assetId.includes(value)) {
      this.form.assetId = [...this.form.assetId, value];
    }
  }

  removeFormAssetId(assetId: string): void {
    this.form.assetId = this.form.assetId.filter((id) => id !== assetId);
  }

  addFormWorkType(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value as WorkOrderType | '';
    select.value = '';
    if (value && !this.form.workType.includes(value)) {
      this.form.workType = [...this.form.workType, value];
    }
  }

  removeFormWorkType(workType: WorkOrderType): void {
    this.form.workType = this.form.workType.filter((t) => t !== workType);
  }

  addFormTechnician(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    select.value = '';
    if (value && !this.form.assignedTechnician.includes(value)) {
      this.form.assignedTechnician = [...this.form.assignedTechnician, value];
    }
  }

  removeFormTechnician(technician: string): void {
    this.form.assignedTechnician = this.form.assignedTechnician.filter((t) => t !== technician);
  }

  private refresh(): void {
    this.workOrders = this.workOrderService.getWorkOrders();
    this.onSearch();
  }

  assetName(assetId: string): string {
    return this.assetMaster.find((a) => a.id === assetId)?.name ?? assetId;
  }

  assetNames(assetIds: string[]): string {
    return assetIds.map((id) => this.assetName(id)).join(', ');
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
    this.editRow(this.selectedWorkOrders[0]);
  }

  editRow(workOrder: WorkOrder): void {
    this.isEditMode = true;
    this.editingWorkOrder = workOrder;
    const { selected, ...rest } = workOrder;
    this.form = {
      ...rest,
      assetId: [...rest.assetId],
      workType: [...rest.workType],
      assignedTechnician: [...rest.assignedTechnician]
    };
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

  deleteRow(workOrder: WorkOrder): void {
    this.workOrderService.deleteWorkOrders([workOrder.workOrderId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.workOrderService.addWorkOrder({
        workOrderId: row['workOrderId'] ?? '',
        assetId: (row['assetId'] ?? '').split(',').map((s) => s.trim()).filter(Boolean),
        workType: (row['workType'] ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean) as WorkOrderType[],
        title: row['title'] ?? '',
        priority: (row['priority'] ?? '') as WorkOrderPriority | '',
        status: (row['status'] ?? '') as WorkOrderStatus | '',
        createdDate: row['createdDate'] ?? '',
        scheduledDate: row['scheduledDate'] ?? '',
        startTime: row['startTime'] ?? '',
        endTime: row['endTime'] ?? '',
        downtimeDuration: row['downtimeDuration'] ? Number(row['downtimeDuration']) : null,
        assignedTechnician: (row['assignedTechnician'] ?? '').split(',').map((s) => s.trim()).filter(Boolean),
        department: row['department'] ?? '',
        location: row['location'] ?? ''
      });
    });
    this.refresh();
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current work order list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
