import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { RowActions } from '@shared/row-actions/row-actions';
import { ProgressLog, ProgressLogForm } from './progress-log.model';
import { ProgressLogService } from './progress-log.service';

interface ProgressLogColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-wip-progress-log',
  imports: [CommonModule, FormsModule, ImportFileModal, MasterLinkIcons, RowActions],
  templateUrl: './progress-log.html',
  styleUrls: ['./progress-log.css']
})
export class WipProgressLog {
  searchTerm = '';

  columns: ProgressLogColumn[] = [
    { key: 'logId', label: 'Log ID', visible: true },
    { key: 'jobId', label: 'Job ID', visible: true },
    { key: 'taskId', label: 'Task ID', visible: true },
    { key: 'timestamp', label: 'Timestamp', visible: true },
    { key: 'progressPercentage', label: 'Progress %', visible: true },
    { key: 'statusId', label: 'Status', visible: true },
    { key: 'updatedBy', label: 'Updated By', visible: true },
    { key: 'updateSource', label: 'Update Source', visible: true },
    { key: 'remarks', label: 'Remarks', visible: true },
    { key: 'sensorData', label: 'Sensor Data', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'logId', label: 'Log ID' },
    { key: 'jobId', label: 'Job ID' },
    { key: 'taskId', label: 'Task ID' },
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'progressPercentage', label: 'Progress %' },
    { key: 'statusId', label: 'Status' },
    { key: 'updatedBy', label: 'Updated By' },
    { key: 'updateSource', label: 'Update Source' },
    { key: 'remarks', label: 'Remarks' },
    { key: 'sensorData', label: 'Sensor Data' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: ProgressLog[] = [];
  filteredRecords: ProgressLog[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: ProgressLog | null = null;

  form: ProgressLogForm = this.emptyForm();

  constructor(private service: ProgressLogService) {
    this.refresh();
  }

  get jobMaster() {
    return this.service.jobMaster;
  }

  get userMaster() {
    return this.service.userMaster;
  }

  get statusMaster() {
    return this.service.statusMaster;
  }

  get updateSourceMaster() {
    return this.service.updateSourceMaster;
  }

  private emptyForm(): ProgressLogForm {
    return {
      logId: '',
      jobId: '',
      taskId: '',
      timestamp: '',
      progressPercentage: null,
      statusId: '',
      updatedBy: '',
      updateSource: '',
      remarks: '',
      sensorData: ''
    };
  }

  private refresh(): void {
    this.records = this.service.getRecords();
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

  toggleColumn(col: ProgressLogColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): ProgressLog[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: ProgressLog): void {
    record.selected = !record.selected;
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
    this.editRow(this.selectedRecords[0]);
  }

  editRow(record: ProgressLog): void {
    this.isEditMode = true;
    this.editingRecord = record;
    const { selected, ...rest } = record;
    this.form = { ...rest };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
  }

  tasksForJob(jobId: string) {
    return this.service.tasksForJob(jobId);
  }

  onJobChange(): void {
    if (!this.tasksForJob(this.form.jobId).some((t) => t.taskId === this.form.taskId)) {
      this.form.taskId = '';
    }
  }

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.logId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.logId));
    this.refresh();
  }

  deleteRow(record: ProgressLog): void {
    this.service.deleteRecords([record.logId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.service.addRecord({
        logId: row['logId'] ?? '',
        jobId: row['jobId'] ?? '',
        taskId: row['taskId'] ?? '',
        timestamp: row['timestamp'] ?? '',
        progressPercentage: row['progressPercentage'] ? Number(row['progressPercentage']) : null,
        statusId: row['statusId'] ?? '',
        updatedBy: row['updatedBy'] ?? '',
        updateSource: (row['updateSource'] ?? '') as ProgressLog['updateSource'],
        remarks: row['remarks'] ?? '',
        sensorData: row['sensorData'] ?? ''
      });
    });
    this.refresh();
    this.showImportModal = false;
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

  taskName(taskId: string): string {
    if (!taskId) return '-';
    return this.service.taskName(taskId);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
