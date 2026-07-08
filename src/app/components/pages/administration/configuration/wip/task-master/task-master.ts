import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskMaster } from './task-master.model';
import { TaskMasterService } from './task-master.service';

interface TaskMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-wip-task-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './task-master.html',
  styleUrls: ['./task-master.css']
})
export class WipTaskMaster {
  searchTerm = '';

  columns: TaskMasterColumn[] = [
    { key: 'taskId', label: 'Task ID', visible: true },
    { key: 'jobId', label: 'Job ID', visible: true },
    { key: 'taskName', label: 'Task Name', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'sequenceOrder', label: 'Sequence Order', visible: true },
    { key: 'assignedTo', label: 'Assigned To', visible: true },
    { key: 'plannedStartTime', label: 'Planned Start Time', visible: true },
    { key: 'plannedEndTime', label: 'Planned End Time', visible: true },
    { key: 'actualStartTime', label: 'Actual Start Time', visible: true },
    { key: 'actualEndTime', label: 'Actual End Time', visible: true },
    { key: 'statusId', label: 'Status', visible: true },
    { key: 'dependencyTaskId', label: 'Dependency Task ID', visible: true },
    { key: 'checklistId', label: 'Checklist ID', visible: true },
    { key: 'completionPercentage', label: 'Completion %', visible: true },
    { key: 'remarks', label: 'Remarks', visible: true }
  ];

  showColumnPicker = false;

  records: TaskMaster[] = [];
  filteredRecords: TaskMaster[] = [];

  // Selection is tracked by taskId rather than a flag on the model, since
  // task-master.model.ts must stay untouched (no `selected` field) because
  // other services (IssueDelayService, MaterialConsumptionService) rely on
  // TaskMasterService.getTasks() returning plain TaskMaster objects.
  private selectedTaskIds = new Set<string>();

  showFormModal = false;
  isEditMode = false;
  private editingRecord: TaskMaster | null = null;

  form: TaskMaster = this.emptyForm();

  constructor(private service: TaskMasterService) {
    this.refresh();
  }

  get jobMaster() {
    return this.service.jobMaster;
  }

  get userMaster() {
    return this.service.userMaster;
  }

  get checklistMaster() {
    return this.service.checklistMaster;
  }

  get statusMaster() {
    return this.service.statusMaster;
  }

  get dependencyOptions(): TaskMaster[] {
    const excludeId = this.editingRecord?.taskId;
    return this.records.filter((t) => t.taskId !== excludeId);
  }

  private emptyForm(): TaskMaster {
    return {
      taskId: '',
      jobId: '',
      taskName: '',
      description: '',
      sequenceOrder: null,
      assignedTo: '',
      plannedStartTime: '',
      plannedEndTime: '',
      actualStartTime: '',
      actualEndTime: '',
      statusId: '',
      dependencyTaskId: '',
      checklistId: '',
      completionPercentage: null,
      remarks: ''
    };
  }

  private refresh(): void {
    this.records = this.service.getTasks();
    this.pruneSelection();
    this.onSearch();
  }

  private pruneSelection(): void {
    const ids = new Set(this.records.map((r) => r.taskId));
    Array.from(this.selectedTaskIds).forEach((id) => {
      if (!ids.has(id)) this.selectedTaskIds.delete(id);
    });
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

  toggleColumn(col: TaskMasterColumn): void {
    col.visible = !col.visible;
  }

  isSelected(record: TaskMaster): boolean {
    return this.selectedTaskIds.has(record.taskId);
  }

  get selectedRecords(): TaskMaster[] {
    return this.filteredRecords.filter((r) => this.selectedTaskIds.has(r.taskId));
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => this.selectedTaskIds.has(r.taskId));
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.filteredRecords.forEach((r) => this.selectedTaskIds.delete(r.taskId));
    } else {
      this.filteredRecords.forEach((r) => this.selectedTaskIds.add(r.taskId));
    }
  }

  toggleSelectRecord(record: TaskMaster): void {
    if (this.selectedTaskIds.has(record.taskId)) {
      this.selectedTaskIds.delete(record.taskId);
    } else {
      this.selectedTaskIds.add(record.taskId);
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

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.taskId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.taskId));
    this.refresh();
  }

  onUpload(): void {
  }

  onDownload(): void {
  }

  jobName(jobId: string): string {
    return this.jobMaster.find((j) => j.jobId === jobId)?.jobName ?? jobId;
  }

  userName(userId: string): string {
    return this.userMaster.find((u) => u.id === userId)?.name ?? userId;
  }

  statusName(statusId: string): string {
    return this.statusMaster.find((s) => s.statusId === statusId)?.statusName ?? statusId;
  }

  checklistName(checklistId: string): string {
    return this.checklistMaster.find((c) => c.id === checklistId)?.name ?? checklistId;
  }

  taskName(taskId: string): string {
    return this.records.find((t) => t.taskId === taskId)?.taskName ?? taskId;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
