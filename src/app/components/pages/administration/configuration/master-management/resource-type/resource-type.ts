import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementResourceTypeItem } from './resource-type.model';
import { MasterManagementResourceTypeService } from './resource-type.service';

interface MasterManagementResourceTypeRow extends MasterManagementResourceTypeItem {
  selected?: boolean;
}

interface MasterManagementResourceTypeColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-resource-type',
  imports: [CommonModule, FormsModule],
  templateUrl: './resource-type.html',
  styleUrls: ['./resource-type.css']
})
export class MasterManagementResourceType {
  searchTerm = '';

  columns: MasterManagementResourceTypeColumn[] = [
    { key: 'resourceTypeId', label: 'Type ID', visible: true },
    { key: 'resourceTypeName', label: 'Type Name', visible: true },
    { key: 'category', label: 'Category', visible: true },
    { key: 'isActive', label: 'Is Active', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementResourceTypeRow[] = [];
  filteredRecords: MasterManagementResourceTypeRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementResourceTypeRow | null = null;

  form: MasterManagementResourceTypeItem = this.emptyForm();

  constructor(private service: MasterManagementResourceTypeService) {
    this.refresh();
  }

  get categoryMaster() {
    return this.service.categoryMaster;
  }

  private emptyForm(): MasterManagementResourceTypeItem {
    return {
      resourceTypeId: '',
      resourceTypeName: '',
      category: '',
      isActive: true
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

  toggleColumn(col: MasterManagementResourceTypeColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementResourceTypeRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementResourceTypeRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementResourceTypeRow[];
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
      this.service.updateRecord(this.editingRecord.resourceTypeId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.resourceTypeId));
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
