import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementAlertTypeItem } from './alert-type.model';
import { MasterManagementAlertTypeService } from './alert-type.service';

interface MasterManagementAlertTypeRow extends MasterManagementAlertTypeItem {
  selected?: boolean;
}

interface MasterManagementAlertTypeColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-alert-type',
  imports: [CommonModule, FormsModule],
  templateUrl: './alert-type.html',
  styleUrls: ['./alert-type.css']
})
export class MasterManagementAlertType {
  searchTerm = '';

  columns: MasterManagementAlertTypeColumn[] = [
    { key: 'alertTypeId', label: 'Alert Type ID', visible: true },
    { key: 'alertName', label: 'Alert Name', visible: true },
    { key: 'alertCode', label: 'Alert Code', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'category', label: 'Category', visible: true },
    { key: 'severity', label: 'Severity', visible: true },
    { key: 'triggerCondition', label: 'Trigger Condition', visible: true },
    { key: 'notificationType', label: 'Notification Type', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementAlertTypeRow[] = [];
  filteredRecords: MasterManagementAlertTypeRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementAlertTypeRow | null = null;

  form: MasterManagementAlertTypeItem = this.emptyForm();

  constructor(private service: MasterManagementAlertTypeService) {
    this.refresh();
  }

  get categoryMaster() {
    return this.service.categoryMaster;
  }

  get severityMaster() {
    return this.service.severityMaster;
  }

  get notificationTypeMaster() {
    return this.service.notificationTypeMaster;
  }

  get statusMaster() {
    return this.service.statusMaster;
  }

  private emptyForm(): MasterManagementAlertTypeItem {
    return {
      alertTypeId: '',
      alertName: '',
      alertCode: '',
      description: '',
      category: '',
      severity: '',
      triggerCondition: '',
      notificationType: '',
      status: ''
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

  toggleColumn(col: MasterManagementAlertTypeColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementAlertTypeRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementAlertTypeRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementAlertTypeRow[];
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
      this.service.updateRecord(this.editingRecord.alertTypeId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.alertTypeId));
    this.refresh();
  }

  onUpload(): void {
  }

  onDownload(): void {
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
