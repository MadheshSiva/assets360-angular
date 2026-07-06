import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerformanceMetricRecord, PerformanceMetricForm } from './performance.model';
import { PerformanceService } from './performance.service';

interface PerformanceColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-maintenance-performance',
  imports: [CommonModule, FormsModule],
  templateUrl: './performance.html',
  styleUrls: ['./performance.css']
})
export class MaintenancePerformance {
  searchTerm = '';

  columns: PerformanceColumn[] = [
    { key: 'assetId', label: 'Asset', visible: true },
    { key: 'mtbf', label: 'MTBF (Mean Time Between Failures)', visible: true },
    { key: 'mttr', label: 'MTTR (Mean Time To Repair)', visible: true },
    { key: 'assetUptimePercent', label: 'Asset Uptime %', visible: true },
    { key: 'maintenanceFrequency', label: 'Maintenance Frequency', visible: true }
  ];

  showColumnPicker = false;

  records: PerformanceMetricRecord[] = [];
  filteredRecords: PerformanceMetricRecord[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: PerformanceMetricRecord | null = null;

  form: PerformanceMetricForm = this.emptyForm();

  constructor(private performanceService: PerformanceService) {
    this.refresh();
  }

  get assetMaster() {
    return this.performanceService.assetMaster;
  }

  assetName(assetId: string): string {
    return this.performanceService.assetName(assetId);
  }

  private emptyForm(): PerformanceMetricForm {
    return {
      assetId: '',
      mtbf: null,
      mttr: null,
      assetUptimePercent: null,
      maintenanceFrequency: null
    };
  }

  private refresh(): void {
    this.records = this.performanceService.getRecords();
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

  toggleColumn(col: PerformanceColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): PerformanceMetricRecord[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: PerformanceMetricRecord): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.performanceService.search(this.searchTerm);
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
      this.performanceService.updateRecord(this.editingRecord, { ...this.form });
    } else {
      this.performanceService.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.performanceService.deleteRecords(this.selectedRecords);
    this.refresh();
  }

  onUpload(): void {
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
  }

  onDownload(): void {
    // TODO: export current performance metrics list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
