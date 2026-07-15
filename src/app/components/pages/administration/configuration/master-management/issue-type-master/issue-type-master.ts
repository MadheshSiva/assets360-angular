import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementIssueTypeMasterItem } from './issue-type-master.model';
import { MasterManagementIssueTypeMasterService } from './issue-type-master.service';

interface MasterManagementIssueTypeMasterRow extends MasterManagementIssueTypeMasterItem {
  selected?: boolean;
}

interface MasterManagementIssueTypeMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-issue-type-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './issue-type-master.html',
  styleUrls: ['./issue-type-master.css']
})
export class MasterManagementIssueTypeMaster {
  searchTerm = '';

  columns: MasterManagementIssueTypeMasterColumn[] = [
    { key: 'issueTypeId', label: 'Issue Type ID', visible: true },
    { key: 'issueTypeName', label: 'Issue Type Name', visible: true },
    { key: 'category', label: 'Category', visible: true },
    { key: 'isActive', label: 'Is Active', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementIssueTypeMasterRow[] = [];
  filteredRecords: MasterManagementIssueTypeMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementIssueTypeMasterRow | null = null;

  form: MasterManagementIssueTypeMasterItem = this.emptyForm();

  constructor(private service: MasterManagementIssueTypeMasterService) {
    this.refresh();
  }

  get categoryMaster() {
    return this.service.categoryMaster;
  }

  private emptyForm(): MasterManagementIssueTypeMasterItem {
    return {
      issueTypeId: '',
      issueTypeName: '',
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

  toggleColumn(col: MasterManagementIssueTypeMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementIssueTypeMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementIssueTypeMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementIssueTypeMasterRow[];
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
      this.service.updateRecord(this.editingRecord.issueTypeId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.issueTypeId));
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
