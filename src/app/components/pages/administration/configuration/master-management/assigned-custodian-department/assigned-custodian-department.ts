import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementCustodianDepartmentItem } from './assigned-custodian-department.model';
import { MasterManagementCustodianDepartmentService } from './assigned-custodian-department.service';

interface MasterManagementCustodianDepartmentRow extends MasterManagementCustodianDepartmentItem {
  selected?: boolean;
}

interface MasterManagementCustodianDepartmentColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-assigned-custodian-department',
  imports: [CommonModule, FormsModule],
  templateUrl: './assigned-custodian-department.html',
  styleUrls: ['./assigned-custodian-department.css']
})
export class MasterManagementAssignedCustodianDepartment {
  searchTerm = '';

  columns: MasterManagementCustodianDepartmentColumn[] = [
    { key: 'recordType', label: 'Department or Custodian', visible: true },
    { key: 'name', label: 'Name', visible: true },
    { key: 'id', label: 'ID', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'role', label: 'Role', visible: true },
    { key: 'departmentCode', label: 'Department Code', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementCustodianDepartmentRow[] = [];
  filteredRecords: MasterManagementCustodianDepartmentRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementCustodianDepartmentRow | null = null;

  form: MasterManagementCustodianDepartmentItem = this.emptyForm();

  constructor(private service: MasterManagementCustodianDepartmentService) {
    this.refresh();
  }

  get recordTypeMaster() {
    return this.service.recordTypeMaster;
  }

  get statusMaster() {
    return this.service.statusMaster;
  }

  private emptyForm(): MasterManagementCustodianDepartmentItem {
    return {
      recordType: '',
      id: '',
      name: '',
      description: '',
      status: '',
      role: '',
      departmentCode: ''
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

  toggleColumn(col: MasterManagementCustodianDepartmentColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementCustodianDepartmentRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementCustodianDepartmentRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementCustodianDepartmentRow[];
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
      this.service.updateRecord(this.editingRecord.id, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.id));
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
