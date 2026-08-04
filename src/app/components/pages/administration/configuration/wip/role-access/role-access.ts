import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { RoleAccess, RoleAccessForm } from './role-access.model';
import { RoleAccessService } from './role-access.service';

interface RoleAccessColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-wip-role-access',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './role-access.html',
  styleUrls: ['./role-access.css']
})
export class WipRoleAccess {
  searchTerm = '';

  columns: RoleAccessColumn[] = [
    { key: 'roleId', label: 'Role ID', visible: true },
    { key: 'roleName', label: 'Role Name', visible: true },
    { key: 'permissions', label: 'Permissions', visible: true },
    { key: 'moduleAccess', label: 'Module Access', visible: true },
    { key: 'dataAccessLevel', label: 'Data Access Level', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'roleId', label: 'Role ID' },
    { key: 'roleName', label: 'Role Name' },
    { key: 'permissions', label: 'Permissions' },
    { key: 'moduleAccess', label: 'Module Access' },
    { key: 'dataAccessLevel', label: 'Data Access Level' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: RoleAccess[] = [];
  filteredRecords: RoleAccess[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: RoleAccess | null = null;

  form: RoleAccessForm = this.emptyForm();

  constructor(private service: RoleAccessService) {
    this.refresh();
  }

  get permissionMaster() {
    return this.service.permissionMaster;
  }

  get moduleMaster() {
    return this.service.moduleMaster;
  }

  get dataAccessLevelMaster() {
    return this.service.dataAccessLevelMaster;
  }

  private emptyForm(): RoleAccessForm {
    return {
      roleId: '',
      roleName: '',
      permissions: [],
      moduleAccess: [],
      dataAccessLevel: ''
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

  toggleColumn(col: RoleAccessColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): RoleAccess[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: RoleAccess): void {
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

  editRow(record: RoleAccess): void {
    this.isEditMode = true;
    this.editingRecord = record;
    const { selected, ...rest } = record;
    this.form = { ...rest, permissions: [...rest.permissions], moduleAccess: [...rest.moduleAccess] };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
  }

  isPermissionSelected(permission: string): boolean {
    return this.form.permissions.includes(permission as any);
  }

  togglePermission(permission: string): void {
    this.form.permissions = this.isPermissionSelected(permission)
      ? this.form.permissions.filter((p) => p !== permission)
      : [...this.form.permissions, permission as any];
  }

  isModuleSelected(module: string): boolean {
    return this.form.moduleAccess.includes(module);
  }

  toggleModule(module: string): void {
    this.form.moduleAccess = this.isModuleSelected(module)
      ? this.form.moduleAccess.filter((m) => m !== module)
      : [...this.form.moduleAccess, module];
  }

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.roleId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.roleId));
    this.refresh();
  }

  deleteRow(record: RoleAccess): void {
    this.service.deleteRecords([record.roleId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.service.addRecord({
        roleId: row['roleId'] ?? '',
        roleName: row['roleName'] ?? '',
        permissions: row['permissions']
          ? (row['permissions'].split(',').map((p) => p.trim()).filter(Boolean) as RoleAccess['permissions'])
          : [],
        moduleAccess: row['moduleAccess'] ? row['moduleAccess'].split(',').map((m) => m.trim()).filter(Boolean) : [],
        dataAccessLevel: (row['dataAccessLevel'] ?? '') as RoleAccess['dataAccessLevel']
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
