import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { MasterManagementPermissionMasterItem, PermissionAction } from './permission-master.model';
import { MasterManagementPermissionMasterService } from './permission-master.service';

interface MasterManagementPermissionMasterRow extends MasterManagementPermissionMasterItem {
  selected?: boolean;
}

interface MasterManagementPermissionMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-permission-master',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './permission-master.html',
  styleUrls: ['./permission-master.css']
})
export class MasterManagementPermissionMaster {
  searchTerm = '';

  columns: MasterManagementPermissionMasterColumn[] = [
    { key: 'permissionId', label: 'Permission ID', visible: true },
    { key: 'permissionName', label: 'Permission Name', visible: true },
    { key: 'module', label: 'Module', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'permissionId', label: 'Permission ID' },
    { key: 'permissionName', label: 'Permission Name' },
    { key: 'module', label: 'Module' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: MasterManagementPermissionMasterRow[] = [];
  filteredRecords: MasterManagementPermissionMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementPermissionMasterRow | null = null;

  form: MasterManagementPermissionMasterItem = this.emptyForm();

  constructor(private service: MasterManagementPermissionMasterService) {
    this.refresh();
  }

  get permissionNameMaster() {
    return this.service.permissionNameMaster;
  }

  get moduleMaster() {
    return this.service.moduleMaster;
  }

  private emptyForm(): MasterManagementPermissionMasterItem {
    return {
      permissionId: '',
      permissionName: '',
      module: ''
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

  toggleColumn(col: MasterManagementPermissionMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementPermissionMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementPermissionMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementPermissionMasterRow[];
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

  editRow(record: MasterManagementPermissionMasterRow): void {
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
      this.service.updateRecord(this.editingRecord.permissionId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.permissionId));
    this.refresh();
  }

  deleteRow(record: MasterManagementPermissionMasterRow): void {
    this.service.deleteRecords([record.permissionId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.service.addRecord({
        permissionId: row['permissionId'] ?? '',
        permissionName: (row['permissionName'] ?? '') as PermissionAction | '',
        module: row['module'] ?? ''
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
