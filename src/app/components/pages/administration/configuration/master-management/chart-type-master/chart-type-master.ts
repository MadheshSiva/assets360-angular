import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementChartTypeMasterItem } from './chart-type-master.model';
import { MasterManagementChartTypeMasterService } from './chart-type-master.service';

interface MasterManagementChartTypeMasterRow extends MasterManagementChartTypeMasterItem {
  selected?: boolean;
}

interface MasterManagementChartTypeMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-chart-type-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './chart-type-master.html',
  styleUrls: ['./chart-type-master.css']
})
export class MasterManagementChartTypeMaster {
  searchTerm = '';

  columns: MasterManagementChartTypeMasterColumn[] = [
    { key: 'widgetId', label: 'Widget ID', visible: true },
    { key: 'widgetName', label: 'Widget Name', visible: true },
    { key: 'configJson', label: 'Config JSON', visible: true },
    { key: 'isActive', label: 'Is Active', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementChartTypeMasterRow[] = [];
  filteredRecords: MasterManagementChartTypeMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementChartTypeMasterRow | null = null;

  form: MasterManagementChartTypeMasterItem = this.emptyForm();

  constructor(private service: MasterManagementChartTypeMasterService) {
    this.refresh();
  }

  get widgetNameMaster() {
    return this.service.widgetNameMaster;
  }

  private emptyForm(): MasterManagementChartTypeMasterItem {
    return {
      widgetId: '',
      widgetName: '',
      configJson: '',
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

  toggleColumn(col: MasterManagementChartTypeMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementChartTypeMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementChartTypeMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementChartTypeMasterRow[];
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
      this.service.updateRecord(this.editingRecord.widgetId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.widgetId));
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
