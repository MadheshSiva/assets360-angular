import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementConditionMasterItem } from './condition-master.model';
import { MasterManagementConditionMasterService } from './condition-master.service';

interface MasterManagementConditionMasterRow extends MasterManagementConditionMasterItem {
  selected?: boolean;
}

interface MasterManagementConditionMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-condition-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './condition-master.html',
  styleUrls: ['./condition-master.css']
})
export class MasterManagementConditionMaster {
  searchTerm = '';

  columns: MasterManagementConditionMasterColumn[] = [
    { key: 'conditionId', label: 'Condition ID', visible: true },
    { key: 'conditionName', label: 'Condition Name', visible: true },
    { key: 'thresholdValue', label: 'Threshold Value', visible: true },
    { key: 'colorCode', label: 'Color Code', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementConditionMasterRow[] = [];
  filteredRecords: MasterManagementConditionMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementConditionMasterRow | null = null;

  form: MasterManagementConditionMasterItem = this.emptyForm();

  constructor(private service: MasterManagementConditionMasterService) {
    this.refresh();
  }

  get conditionNameMaster() {
    return this.service.conditionNameMaster;
  }

  private emptyForm(): MasterManagementConditionMasterItem {
    return {
      conditionId: '',
      conditionName: '',
      thresholdValue: null,
      colorCode: ''
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

  toggleColumn(col: MasterManagementConditionMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementConditionMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementConditionMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementConditionMasterRow[];
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
      this.service.updateRecord(this.editingRecord.conditionId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.conditionId));
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
