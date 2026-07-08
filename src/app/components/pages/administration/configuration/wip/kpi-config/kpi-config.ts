import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KpiConfig, KpiConfigForm } from './kpi-config.model';
import { KpiConfigService } from './kpi-config.service';

interface KpiConfigColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-wip-kpi-config',
  imports: [CommonModule, FormsModule],
  templateUrl: './kpi-config.html',
  styleUrls: ['./kpi-config.css']
})
export class WipKpiConfig {
  searchTerm = '';

  columns: KpiConfigColumn[] = [
    { key: 'kpiId', label: 'KPI ID', visible: true },
    { key: 'kpiName', label: 'KPI Name', visible: true },
    { key: 'formulaDefinition', label: 'Formula Definition', visible: true },
    { key: 'thresholdGreen', label: 'Threshold Green', visible: true },
    { key: 'thresholdAmber', label: 'Threshold Amber', visible: true },
    { key: 'thresholdRed', label: 'Threshold Red', visible: true },
    { key: 'refreshFrequency', label: 'Refresh Frequency', visible: true },
    { key: 'widgetType', label: 'Widget Type', visible: true }
  ];

  showColumnPicker = false;

  records: KpiConfig[] = [];
  filteredRecords: KpiConfig[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: KpiConfig | null = null;

  form: KpiConfigForm = this.emptyForm();

  constructor(private service: KpiConfigService) {
    this.refresh();
  }

  get refreshFrequencyMaster() {
    return this.service.refreshFrequencyMaster;
  }

  get widgetTypeMaster() {
    return this.service.widgetTypeMaster;
  }

  private emptyForm(): KpiConfigForm {
    return {
      kpiId: '',
      kpiName: '',
      formulaDefinition: '',
      thresholdGreen: null,
      thresholdAmber: null,
      thresholdRed: null,
      refreshFrequency: '',
      widgetType: ''
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

  toggleColumn(col: KpiConfigColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): KpiConfig[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: KpiConfig): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm);
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
      this.service.updateRecord(this.editingRecord.kpiId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.kpiId));
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
