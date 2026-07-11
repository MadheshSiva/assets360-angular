import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementTagIdItem } from './tag-ids.model';
import { MasterManagementTagIdService } from './tag-ids.service';

interface MasterManagementTagIdRow extends MasterManagementTagIdItem {
  selected?: boolean;
}

interface MasterManagementTagIdColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-tag-ids',
  imports: [CommonModule, FormsModule],
  templateUrl: './tag-ids.html',
  styleUrls: ['./tag-ids.css']
})
export class MasterManagementTagIds {
  searchTerm = '';

  columns: MasterManagementTagIdColumn[] = [
    { key: 'tagId', label: 'Tag ID', visible: true },
    { key: 'tagCode', label: 'Tag Code', visible: true },
    { key: 'tagType', label: 'Tag Type', visible: true },
    { key: 'assignedAssetCode', label: 'Assigned Asset Code', visible: true },
    { key: 'issueDate', label: 'Issue Date', visible: true },
    { key: 'isActive', label: 'Active', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementTagIdRow[] = [];
  filteredRecords: MasterManagementTagIdRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementTagIdRow | null = null;

  form: MasterManagementTagIdItem = this.emptyForm();

  constructor(private service: MasterManagementTagIdService) {
    this.refresh();
  }

  get tagTypeMaster() {
    return this.service.tagTypeMaster;
  }

  private emptyForm(): MasterManagementTagIdItem {
    return {
      tagId: '',
      tagCode: '',
      tagType: '',
      assignedAssetCode: '',
      issueDate: '',
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

  toggleColumn(col: MasterManagementTagIdColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementTagIdRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementTagIdRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementTagIdRow[];
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
      this.service.updateRecord(this.editingRecord.tagId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.tagId));
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
