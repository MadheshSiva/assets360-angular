import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule],
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
    const record = this.selectedRecords[0];
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

  onUpload(): void {
  }

  onDownload(): void {
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
