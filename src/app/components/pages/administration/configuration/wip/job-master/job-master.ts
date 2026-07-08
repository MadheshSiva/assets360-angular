import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobMaster } from './job-master.model';
import { JobMasterService } from './job-master.service';

interface JobMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-wip-job-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './job-master.html',
  styleUrls: ['./job-master.css']
})
export class WipJobMaster {
  searchTerm = '';

  columns: JobMasterColumn[] = [
    { key: 'jobId', label: 'Job ID', visible: true },
    { key: 'jobName', label: 'Job Name', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetCategory', label: 'Asset Category', visible: true },
    { key: 'locationId', label: 'Location ID', visible: true },
    { key: 'departmentId', label: 'Department ID', visible: true },
    { key: 'workType', label: 'Work Type', visible: true },
    { key: 'priority', label: 'Priority', visible: true },
    { key: 'plannedStartDate', label: 'Planned Start Date', visible: true },
    { key: 'plannedEndDate', label: 'Planned End Date', visible: true },
    { key: 'actualStartDate', label: 'Actual Start Date', visible: false },
    { key: 'actualEndDate', label: 'Actual End Date', visible: false },
    { key: 'status', label: 'Status', visible: true },
    { key: 'assignedTo', label: 'Assigned To', visible: true },
    { key: 'supervisorId', label: 'Supervisor ID', visible: true },
    { key: 'slaId', label: 'SLA ID', visible: false },
    { key: 'progressPercentage', label: 'Progress %', visible: true },
    { key: 'downtimeRequired', label: 'Downtime Required', visible: false },
    { key: 'permitRequired', label: 'Permit Required', visible: false },
    { key: 'safetyChecklistId', label: 'Safety Checklist ID', visible: false },
    { key: 'remarks', label: 'Remarks', visible: false }
  ];

  showColumnPicker = false;

  records: JobMaster[] = [];
  filteredRecords: JobMaster[] = [];

  private selectedJobIds = new Set<string>();

  showFormModal = false;
  isEditMode = false;
  private editingRecord: JobMaster | null = null;

  form: JobMaster = this.emptyForm();

  constructor(private service: JobMasterService) {
    this.refresh();
  }

  get assetMaster() {
    return this.service.assetMaster;
  }

  get assetCategoryMaster() {
    return this.service.assetCategoryMaster;
  }

  get locationMaster() {
    return this.service.locationMaster;
  }

  get departmentMaster() {
    return this.service.departmentMaster;
  }

  get workTypeMaster() {
    return this.service.workTypeMaster;
  }

  get priorityMaster() {
    return this.service.priorityMaster;
  }

  get statusMaster() {
    return this.service.statusMaster;
  }

  get userMaster() {
    return this.service.userMaster;
  }

  get slaMaster() {
    return this.service.slaMaster;
  }

  get checklistMaster() {
    return this.service.checklistMaster;
  }

  private emptyForm(): JobMaster {
    return {
      jobId: '',
      jobName: '',
      description: '',
      assetId: '',
      assetCategory: '',
      locationId: '',
      departmentId: '',
      workType: '',
      priority: '',
      plannedStartDate: '',
      plannedEndDate: '',
      actualStartDate: '',
      actualEndDate: '',
      status: '',
      assignedTo: [],
      supervisorId: '',
      slaId: '',
      progressPercentage: null,
      downtimeRequired: false,
      permitRequired: false,
      safetyChecklistId: '',
      remarks: ''
    };
  }

  private refresh(): void {
    this.records = this.service.getJobs();
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

  toggleColumn(col: JobMasterColumn): void {
    col.visible = !col.visible;
  }

  isSelected(record: JobMaster): boolean {
    return this.selectedJobIds.has(record.jobId);
  }

  get selectedRecords(): JobMaster[] {
    return this.filteredRecords.filter((r) => this.selectedJobIds.has(r.jobId));
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => this.selectedJobIds.has(r.jobId));
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.filteredRecords.forEach((r) => this.selectedJobIds.delete(r.jobId));
    } else {
      this.filteredRecords.forEach((r) => this.selectedJobIds.add(r.jobId));
    }
  }

  toggleSelectRecord(record: JobMaster): void {
    if (this.selectedJobIds.has(record.jobId)) {
      this.selectedJobIds.delete(record.jobId);
    } else {
      this.selectedJobIds.add(record.jobId);
    }
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm);
  }

  onRefresh(): void {
    this.searchTerm = '';
    this.selectedJobIds.clear();
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
    this.form = { ...record, assignedTo: [...record.assignedTo] };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
  }

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.jobId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.selectedJobIds.clear();
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.jobId));
    this.selectedJobIds.clear();
    this.refresh();
  }

  onUpload(): void {
  }

  onDownload(): void {
  }

  userName(userId: string): string {
    return this.userMaster.find((u) => u.id === userId)?.name ?? userId;
  }

  assignedNames(userIds: string[]): string {
    return (userIds ?? []).map((id) => this.userName(id)).join(', ');
  }

  assetName(assetId: string): string {
    return this.assetMaster.find((a) => a.id === assetId)?.name ?? assetId;
  }

  slaName(slaId: string): string {
    return this.slaMaster.find((s) => s.id === slaId)?.name ?? slaId;
  }

  checklistName(checklistId: string): string {
    return this.checklistMaster.find((c) => c.id === checklistId)?.name ?? checklistId;
  }

  isUserAssigned(userId: string): boolean {
    return this.form.assignedTo.includes(userId);
  }

  toggleAssignedUser(userId: string): void {
    this.form.assignedTo = this.form.assignedTo.includes(userId)
      ? this.form.assignedTo.filter((id) => id !== userId)
      : [...this.form.assignedTo, userId];
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
