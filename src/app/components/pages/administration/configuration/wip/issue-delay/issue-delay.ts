import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IssueDelay } from './issue-delay.model';
import { IssueDelayService } from './issue-delay.service';

interface IssueDelayColumn {
  key: string;
  label: string;
  visible: boolean;
}

interface IssueDelayRow extends IssueDelay {
  selected?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-wip-issue-delay',
  imports: [CommonModule, FormsModule],
  templateUrl: './issue-delay.html',
  styleUrls: ['./issue-delay.css']
})
export class WipIssueDelay {
  searchTerm = '';

  columns: IssueDelayColumn[] = [
    { key: 'issueId', label: 'Issue ID', visible: true },
    { key: 'jobId', label: 'Job ID', visible: true },
    { key: 'taskId', label: 'Task ID', visible: true },
    { key: 'issueType', label: 'Issue Type', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'reportedBy', label: 'Reported By', visible: true },
    { key: 'reportedDate', label: 'Reported Date', visible: true },
    { key: 'severity', label: 'Severity', visible: true },
    { key: 'statusId', label: 'Status', visible: true },
    { key: 'resolutionRemarks', label: 'Resolution Remarks', visible: true },
    { key: 'closedDate', label: 'Closed Date', visible: true }
  ];

  showColumnPicker = false;

  records: IssueDelayRow[] = [];
  filteredRecords: IssueDelayRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: IssueDelayRow | null = null;

  form: IssueDelay = this.emptyForm();

  constructor(private service: IssueDelayService) {
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

  get issueTypeMaster() {
    return this.service.issueTypeMaster;
  }

  get severityMaster() {
    return this.service.severityMaster;
  }

  private emptyForm(): IssueDelay {
    return {
      issueId: '',
      jobId: '',
      taskId: '',
      issueType: '',
      description: '',
      reportedBy: '',
      reportedDate: '',
      severity: '',
      statusId: '',
      resolutionRemarks: '',
      closedDate: ''
    };
  }

  private refresh(): void {
    this.records = this.service.getIssues() as IssueDelayRow[];
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

  toggleColumn(col: IssueDelayColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): IssueDelayRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: IssueDelayRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as IssueDelayRow[];
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
    const { selected, ...rest } = record;
    this.form = { ...rest };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
  }

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.issueId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.issueId));
    this.refresh();
  }

  onUpload(): void {
  }

  onDownload(): void {
  }

  tasksForJob(jobId: string) {
    return this.service.tasksForJob(jobId);
  }

  onJobChange(): void {
    if (!this.tasksForJob(this.form.jobId).some((t) => t.taskId === this.form.taskId)) {
      this.form.taskId = '';
    }
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

  taskName(row: IssueDelay): string {
    if (!row.taskId) return '-';
    const task = this.tasksForJob(row.jobId).find((t) => t.taskId === row.taskId);
    return task?.taskName || row.taskId;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
