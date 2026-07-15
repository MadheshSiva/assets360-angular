import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementAuditorDetailsItem } from './auditor-details.model';
import { MasterManagementAuditorDetailsService } from './auditor-details.service';

interface MasterManagementAuditorDetailsRow extends MasterManagementAuditorDetailsItem {
  selected?: boolean;
}

interface MasterManagementAuditorDetailsColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-auditor-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './auditor-details.html',
  styleUrls: ['./auditor-details.css']
})
export class MasterManagementAuditorDetails {
  searchTerm = '';

  columns: MasterManagementAuditorDetailsColumn[] = [
    { key: 'auditorId', label: 'Auditor ID', visible: true },
    { key: 'auditorName', label: 'Auditor Name', visible: true },
    { key: 'employeeCode', label: 'Employee Code', visible: true },
    { key: 'department', label: 'Department', visible: true },
    { key: 'email', label: 'Email', visible: true },
    { key: 'phone', label: 'Phone', visible: true },
    { key: 'certificationType', label: 'Certification Type', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementAuditorDetailsRow[] = [];
  filteredRecords: MasterManagementAuditorDetailsRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementAuditorDetailsRow | null = null;

  form: MasterManagementAuditorDetailsItem = this.emptyForm();

  constructor(private service: MasterManagementAuditorDetailsService) {
    this.refresh();
  }

  get departmentMaster() {
    return this.service.departmentMaster;
  }

  get certificationTypeMaster() {
    return this.service.certificationTypeMaster;
  }

  get statusMaster() {
    return this.service.statusMaster;
  }

  private emptyForm(): MasterManagementAuditorDetailsItem {
    return {
      auditorId: '',
      auditorName: '',
      employeeCode: '',
      department: '',
      email: '',
      phone: '',
      certificationType: '',
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

  toggleColumn(col: MasterManagementAuditorDetailsColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementAuditorDetailsRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementAuditorDetailsRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementAuditorDetailsRow[];
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
      this.service.updateRecord(this.editingRecord.auditorId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.auditorId));
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
