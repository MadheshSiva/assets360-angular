import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementResponseTypeMasterItem } from './response-type-master.model';
import { MasterManagementResponseTypeMasterService } from './response-type-master.service';

interface MasterManagementResponseTypeMasterRow extends MasterManagementResponseTypeMasterItem {
  selected?: boolean;
}

interface MasterManagementResponseTypeMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-response-type-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './response-type-master.html',
  styleUrls: ['./response-type-master.css']
})
export class MasterManagementResponseTypeMaster {
  searchTerm = '';

  columns: MasterManagementResponseTypeMasterColumn[] = [
    { key: 'typeId', label: 'Type ID', visible: true },
    { key: 'typeName', label: 'Type Name', visible: true },
    { key: 'validationType', label: 'Validation Type', visible: true },
    { key: 'isActive', label: 'Is Active', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementResponseTypeMasterRow[] = [];
  filteredRecords: MasterManagementResponseTypeMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementResponseTypeMasterRow | null = null;

  form: MasterManagementResponseTypeMasterItem = this.emptyForm();

  constructor(private service: MasterManagementResponseTypeMasterService) {
    this.refresh();
  }

  get typeNameMaster() {
    return this.service.typeNameMaster;
  }

  get validationTypeMaster() {
    return this.service.validationTypeMaster;
  }

  private emptyForm(): MasterManagementResponseTypeMasterItem {
    return {
      typeId: '',
      typeName: '',
      validationType: '',
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

  toggleColumn(col: MasterManagementResponseTypeMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementResponseTypeMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementResponseTypeMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementResponseTypeMasterRow[];
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
      this.service.updateRecord(this.editingRecord.typeId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.typeId));
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
