import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialConsumption } from './material-consumption.model';
import { MaterialConsumptionService } from './material-consumption.service';

interface MaterialConsumptionColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-wip-material-consumption',
  imports: [CommonModule, FormsModule],
  templateUrl: './material-consumption.html',
  styleUrls: ['./material-consumption.css']
})
export class WipMaterialConsumption {
  searchTerm = '';

  columns: MaterialConsumptionColumn[] = [
    { key: 'materialId', label: 'Material ID', visible: true },
    { key: 'jobId', label: 'Job ID', visible: true },
    { key: 'taskId', label: 'Task ID', visible: true },
    { key: 'itemName', label: 'Item Name', visible: true },
    { key: 'itemCode', label: 'Item Code', visible: true },
    { key: 'quantityPlanned', label: 'Quantity Planned', visible: true },
    { key: 'quantityUsed', label: 'Quantity Used', visible: true },
    { key: 'unit', label: 'Unit', visible: true },
    { key: 'cost', label: 'Cost', visible: true },
    { key: 'vendorId', label: 'Vendor ID', visible: true }
  ];

  showColumnPicker = false;

  records: MaterialConsumption[] = [];
  filteredRecords: MaterialConsumption[] = [];

  private selectedIds = new Set<string>();

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MaterialConsumption | null = null;

  form: MaterialConsumption = this.emptyForm();

  constructor(private service: MaterialConsumptionService) {
    this.refresh();
  }

  get jobMaster() {
    return this.service.jobMaster;
  }

  get unitMaster() {
    return this.service.unitMaster;
  }

  get vendorMaster() {
    return this.service.vendorMaster;
  }

  tasksForJob(jobId: string) {
    return this.service.tasksForJob(jobId);
  }

  private emptyForm(): MaterialConsumption {
    return {
      materialId: '',
      jobId: '',
      taskId: '',
      itemName: '',
      itemCode: '',
      quantityPlanned: null,
      quantityUsed: null,
      unit: '',
      cost: null,
      vendorId: ''
    };
  }

  private refresh(): void {
    this.records = this.service.getRecords();
    this.selectedIds.clear();
    this.onSearch();
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

  toggleColumn(col: MaterialConsumptionColumn): void {
    col.visible = !col.visible;
  }

  isSelected(record: MaterialConsumption): boolean {
    return this.selectedIds.has(record.materialId);
  }

  get selectedRecords(): MaterialConsumption[] {
    return this.filteredRecords.filter((r) => this.selectedIds.has(r.materialId));
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => this.selectedIds.has(r.materialId));
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.filteredRecords.forEach((r) => this.selectedIds.delete(r.materialId));
    } else {
      this.filteredRecords.forEach((r) => this.selectedIds.add(r.materialId));
    }
  }

  toggleSelectRecord(record: MaterialConsumption): void {
    if (this.selectedIds.has(record.materialId)) {
      this.selectedIds.delete(record.materialId);
    } else {
      this.selectedIds.add(record.materialId);
    }
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm);
  }

  onRefresh(): void {
    this.searchTerm = '';
    this.refresh();
  }

  onCreate(): void {
    this.isEditMode = false;
    this.editingRecord = null;
    this.form = this.emptyForm();
    this.showFormModal = true;
  }

  onEdit(): void {
    if (this.selectedRecords.length !== 1) return;
    const record = this.selectedRecords[0];
    this.isEditMode = true;
    this.editingRecord = record;
    this.form = { ...record };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
  }

  onJobChange(): void {
    if (!this.tasksForJob(this.form.jobId).some((t) => t.taskId === this.form.taskId)) {
      this.form.taskId = '';
    }
  }

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.materialId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.materialId));
    this.refresh();
  }

  onUpload(): void {
  }

  onDownload(): void {
  }

  jobName(jobId: string): string {
    return this.jobMaster.find((j) => j.jobId === jobId)?.jobName ?? jobId;
  }

  taskName(taskId: string): string {
    if (!taskId) return '-';
    return this.service.taskName(taskId);
  }

  vendorName(vendorId: string): string {
    return this.vendorMaster.find((v) => v.id === vendorId)?.name ?? vendorId;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
