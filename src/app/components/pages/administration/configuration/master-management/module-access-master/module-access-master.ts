import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { MasterManagementModuleAccessMasterItem } from './module-access-master.model';
import { MasterManagementModuleAccessMasterService } from './module-access-master.service';

interface MasterManagementModuleAccessMasterRow extends MasterManagementModuleAccessMasterItem {
  selected?: boolean;
}

interface MasterManagementModuleAccessMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-module-access-master',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './module-access-master.html',
  styleUrls: ['./module-access-master.css']
})
export class MasterManagementModuleAccessMaster {
  searchTerm = '';

  columns: MasterManagementModuleAccessMasterColumn[] = [
    { key: 'moduleId', label: 'Module ID', visible: true },
    { key: 'moduleName', label: 'Module Name', visible: true },
    { key: 'routePath', label: 'Route Path', visible: true },
    { key: 'icon', label: 'Icon', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'moduleId', label: 'Module ID' },
    { key: 'moduleName', label: 'Module Name' },
    { key: 'routePath', label: 'Route Path' },
    { key: 'icon', label: 'Icon' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: MasterManagementModuleAccessMasterRow[] = [];
  filteredRecords: MasterManagementModuleAccessMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementModuleAccessMasterRow | null = null;

  form: MasterManagementModuleAccessMasterItem = this.emptyForm();

  constructor(private service: MasterManagementModuleAccessMasterService) {
    this.refresh();
  }

  private emptyForm(): MasterManagementModuleAccessMasterItem {
    return {
      moduleId: '',
      moduleName: '',
      routePath: '',
      icon: ''
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

  toggleColumn(col: MasterManagementModuleAccessMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementModuleAccessMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementModuleAccessMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementModuleAccessMasterRow[];
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

  editRow(record: MasterManagementModuleAccessMasterRow): void {
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
      this.service.updateRecord(this.editingRecord.moduleId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.moduleId));
    this.refresh();
  }

  deleteRow(record: MasterManagementModuleAccessMasterRow): void {
    this.service.deleteRecords([record.moduleId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.service.addRecord({
        moduleId: row['moduleId'] ?? '',
        moduleName: row['moduleName'] ?? '',
        routePath: row['routePath'] ?? '',
        icon: row['icon'] ?? ''
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
