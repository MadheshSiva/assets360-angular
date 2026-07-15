import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementPriorityItem } from './priority.model';
import { MasterManagementPriorityService } from './priority.service';

interface MasterManagementPriorityRow extends MasterManagementPriorityItem {
  selected?: boolean;
}

interface MasterManagementPriorityColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-priority',
  imports: [CommonModule, FormsModule],
  templateUrl: './priority.html',
  styleUrls: ['./priority.css']
})
export class MasterManagementPriority {
  searchTerm = '';

  columns: MasterManagementPriorityColumn[] = [
    { key: 'priorityId', label: 'Priority ID', visible: true },
    { key: 'priorityName', label: 'Priority Name', visible: true },
    { key: 'colorCode', label: 'Color Code', visible: true },
    { key: 'slaMapping', label: 'SLA Mapping', visible: true },
    { key: 'isActive', label: 'Is Active', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementPriorityRow[] = [];
  filteredRecords: MasterManagementPriorityRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementPriorityRow | null = null;

  form: MasterManagementPriorityItem = this.emptyForm();

  constructor(private service: MasterManagementPriorityService) {
    this.refresh();
  }

  get priorityNameMaster() {
    return this.service.priorityNameMaster;
  }

  get slaMappingMaster() {
    return this.service.slaMappingMaster;
  }

  private emptyForm(): MasterManagementPriorityItem {
    return {
      priorityId: '',
      priorityName: '',
      colorCode: '',
      slaMapping: '',
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

  toggleColumn(col: MasterManagementPriorityColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementPriorityRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementPriorityRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementPriorityRow[];
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
      this.service.updateRecord(this.editingRecord.priorityId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.priorityId));
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
