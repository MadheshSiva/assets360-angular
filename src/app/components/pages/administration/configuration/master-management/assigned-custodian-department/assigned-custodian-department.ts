import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
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
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
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

  readonly importColumns: ImportColumn[] = [
    { key: 'recordType', label: 'Department or Custodian' },
    { key: 'name', label: 'Name' },
    { key: 'id', label: 'ID' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
    { key: 'role', label: 'Role' },
    { key: 'departmentCode', label: 'Department Code' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: MasterManagementCustodianDepartmentRow[] = [];
  filteredRecords: MasterManagementCustodianDepartmentRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementCustodianDepartmentRow | null = null;

  form: MasterManagementCustodianDepartmentItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementCustodianDepartmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.refresh();
    this.handleDeepLink();
  }

  private handleDeepLink(): void {
    const params = this.route.snapshot.queryParamMap;
    const action = params.get('linkAction');
    if (!action) return;

    this.returnUrl = params.get('linkReturn');

    if (action === 'create') {
      this.onCreate();
    } else if (action === 'edit') {
      const value = params.get('linkValue') ?? '';
      const match = this.records.find((r) => r.name === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
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
    this.editRow(this.selectedRecords[0]);
  }

  editRow(record: MasterManagementCustodianDepartmentRow): void {
    this.isEditMode = true;
    this.editingRecord = record;
    const { selected, ...rest } = record;
    this.form = { ...rest };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    }
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

  deleteRow(record: MasterManagementCustodianDepartmentRow): void {
    this.service.deleteRecords([record.id]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.service.addRecord({
        recordType: (row['recordType'] ?? '') as MasterManagementCustodianDepartmentItem['recordType'],
        id: row['id'] ?? '',
        name: row['name'] ?? '',
        description: row['description'] ?? '',
        status: (row['status'] ?? '') as MasterManagementCustodianDepartmentItem['status'],
        role: row['role'] ?? '',
        departmentCode: row['departmentCode'] ?? ''
      });
    });
    this.refresh();
    this.showImportModal = false;
  }

  onDownload(): void {
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
