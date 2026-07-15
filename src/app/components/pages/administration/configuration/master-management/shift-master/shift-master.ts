import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementShiftMasterItem } from './shift-master.model';
import { MasterManagementShiftMasterService } from './shift-master.service';

interface MasterManagementShiftMasterRow extends MasterManagementShiftMasterItem {
  selected?: boolean;
}

interface MasterManagementShiftMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-shift-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './shift-master.html',
  styleUrls: ['./shift-master.css']
})
export class MasterManagementShiftMaster {
  searchTerm = '';

  columns: MasterManagementShiftMasterColumn[] = [
    { key: 'shiftId', label: 'Shift ID', visible: true },
    { key: 'shiftName', label: 'Shift Name', visible: true },
    { key: 'startTime', label: 'Start Time', visible: true },
    { key: 'endTime', label: 'End Time', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementShiftMasterRow[] = [];
  filteredRecords: MasterManagementShiftMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementShiftMasterRow | null = null;

  form: MasterManagementShiftMasterItem = this.emptyForm();

  constructor(private service: MasterManagementShiftMasterService) {
    this.refresh();
  }

  private emptyForm(): MasterManagementShiftMasterItem {
    return {
      shiftId: '',
      shiftName: '',
      startTime: '',
      endTime: ''
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

  toggleColumn(col: MasterManagementShiftMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementShiftMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementShiftMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementShiftMasterRow[];
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
      this.service.updateRecord(this.editingRecord.shiftId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.shiftId));
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
