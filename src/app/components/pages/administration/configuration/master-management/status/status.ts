import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementStatusItem } from './status.model';
import { MasterManagementStatusService } from './status.service';

interface MasterManagementStatusRow extends MasterManagementStatusItem {
  selected?: boolean;
}

interface MasterManagementStatusColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-status',
  imports: [CommonModule, FormsModule],
  templateUrl: './status.html',
  styleUrls: ['./status.css']
})
export class MasterManagementStatus {
  searchTerm = '';

  columns: MasterManagementStatusColumn[] = [
    { key: 'statusId', label: 'Status ID', visible: true },
    { key: 'statusName', label: 'Status Name', visible: true },
    { key: 'colorCode', label: 'Color Code', visible: true },
    { key: 'allowedTransitions', label: 'Allowed Transitions', visible: true },
    { key: 'isActive', label: 'Is Active', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementStatusRow[] = [];
  filteredRecords: MasterManagementStatusRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementStatusRow | null = null;

  form: MasterManagementStatusItem = this.emptyForm();

  constructor(private service: MasterManagementStatusService) {
    this.refresh();
  }

  get statusNameMaster() {
    return this.service.statusNameMaster;
  }

  private emptyForm(): MasterManagementStatusItem {
    return {
      statusId: '',
      statusName: '',
      colorCode: '',
      allowedTransitions: [],
      isActive: true
    };
  }

  isTransitionSelected(name: string): boolean {
    return this.form.allowedTransitions.includes(name);
  }

  toggleTransition(name: string): void {
    const index = this.form.allowedTransitions.indexOf(name);
    if (index === -1) {
      this.form.allowedTransitions.push(name);
    } else {
      this.form.allowedTransitions.splice(index, 1);
    }
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

  toggleColumn(col: MasterManagementStatusColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementStatusRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementStatusRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementStatusRow[];
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
    this.form = { ...rest, allowedTransitions: [...rest.allowedTransitions] };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
  }

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.statusId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.statusId));
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
