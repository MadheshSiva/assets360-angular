import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementUnitMasterItem } from './unit-master.model';
import { MasterManagementUnitMasterService } from './unit-master.service';

interface MasterManagementUnitMasterRow extends MasterManagementUnitMasterItem {
  selected?: boolean;
}

interface MasterManagementUnitMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-unit-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './unit-master.html',
  styleUrls: ['./unit-master.css']
})
export class MasterManagementUnitMaster {
  searchTerm = '';

  columns: MasterManagementUnitMasterColumn[] = [
    { key: 'unitId', label: 'Unit ID', visible: true },
    { key: 'unitName', label: 'Unit Name', visible: true },
    { key: 'symbol', label: 'Symbol', visible: true },
    { key: 'isActive', label: 'Is Active', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementUnitMasterRow[] = [];
  filteredRecords: MasterManagementUnitMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementUnitMasterRow | null = null;

  form: MasterManagementUnitMasterItem = this.emptyForm();

  constructor(private service: MasterManagementUnitMasterService) {
    this.refresh();
  }

  private emptyForm(): MasterManagementUnitMasterItem {
    return {
      unitId: '',
      unitName: '',
      symbol: '',
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

  toggleColumn(col: MasterManagementUnitMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementUnitMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementUnitMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementUnitMasterRow[];
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
      this.service.updateRecord(this.editingRecord.unitId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.unitId));
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
