import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementResolutionStatusItem } from './resolution-status.model';
import { MasterManagementResolutionStatusService } from './resolution-status.service';

interface MasterManagementResolutionStatusRow extends MasterManagementResolutionStatusItem {
  selected?: boolean;
}

interface MasterManagementResolutionStatusColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-resolution-status',
  imports: [CommonModule, FormsModule],
  templateUrl: './resolution-status.html',
  styleUrls: ['./resolution-status.css']
})
export class MasterManagementResolutionStatus {
  searchTerm = '';

  columns: MasterManagementResolutionStatusColumn[] = [
    { key: 'resolutionStatusId', label: 'Resolution Status ID', visible: true },
    { key: 'statusName', label: 'Status Name', visible: true },
    { key: 'statusCode', label: 'Status Code', visible: true },
    { key: 'sequenceOrder', label: 'Sequence Order', visible: true },
    { key: 'isClosedStatus', label: 'Is Closed Status', visible: true },
    { key: 'isDefault', label: 'Is Default', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementResolutionStatusRow[] = [];
  filteredRecords: MasterManagementResolutionStatusRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementResolutionStatusRow | null = null;

  form: MasterManagementResolutionStatusItem = this.emptyForm();

  constructor(private service: MasterManagementResolutionStatusService) {
    this.refresh();
  }

  get statusNameSuggestions() {
    return this.service.statusNameSuggestions;
  }

  private emptyForm(): MasterManagementResolutionStatusItem {
    return {
      resolutionStatusId: '',
      statusName: '',
      statusCode: '',
      sequenceOrder: null,
      isClosedStatus: false,
      isDefault: false,
      description: ''
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

  toggleColumn(col: MasterManagementResolutionStatusColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementResolutionStatusRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementResolutionStatusRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementResolutionStatusRow[];
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
      this.service.updateRecord(this.editingRecord.resolutionStatusId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.resolutionStatusId));
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
