import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementChecklistTypeMasterItem } from './checklist-type-master.model';
import { MasterManagementChecklistTypeMasterService } from './checklist-type-master.service';

interface MasterManagementChecklistTypeMasterRow extends MasterManagementChecklistTypeMasterItem {
  selected?: boolean;
}

interface MasterManagementChecklistTypeMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-checklist-type-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './checklist-type-master.html',
  styleUrls: ['./checklist-type-master.css']
})
export class MasterManagementChecklistTypeMaster {
  searchTerm = '';

  columns: MasterManagementChecklistTypeMasterColumn[] = [
    { key: 'typeId', label: 'Type ID', visible: true },
    { key: 'typeName', label: 'Type Name', visible: true },
    { key: 'applicableModule', label: 'Applicable Module', visible: true },
    { key: 'isActive', label: 'Is Active', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementChecklistTypeMasterRow[] = [];
  filteredRecords: MasterManagementChecklistTypeMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementChecklistTypeMasterRow | null = null;

  form: MasterManagementChecklistTypeMasterItem = this.emptyForm();

  constructor(private service: MasterManagementChecklistTypeMasterService) {
    this.refresh();
  }

  get applicableModuleMaster() {
    return this.service.applicableModuleMaster;
  }

  private emptyForm(): MasterManagementChecklistTypeMasterItem {
    return {
      typeId: '',
      typeName: '',
      applicableModule: '',
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

  toggleColumn(col: MasterManagementChecklistTypeMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementChecklistTypeMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementChecklistTypeMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementChecklistTypeMasterRow[];
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
