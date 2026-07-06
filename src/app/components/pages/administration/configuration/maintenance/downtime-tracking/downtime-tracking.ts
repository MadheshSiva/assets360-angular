import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DowntimeTrackingRecord, DowntimeTrackingForm } from './downtime-tracking.model';
import { DowntimeTrackingService } from './downtime-tracking.service';

interface DowntimeColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-maintenance-downtime-tracking',
  imports: [CommonModule, FormsModule],
  templateUrl: './downtime-tracking.html',
  styleUrls: ['./downtime-tracking.css']
})
export class MaintenanceDowntimeTracking {
  searchTerm = '';

  columns: DowntimeColumn[] = [
    { key: 'downtimeStart', label: 'Downtime Start', visible: true },
    { key: 'downtimeEnd', label: 'Downtime End', visible: true },
    { key: 'totalDowntime', label: 'Total Downtime', visible: true },
    { key: 'reasonForDowntime', label: 'Reason for Downtime', visible: true },
    { key: 'impactLevel', label: 'Impact Level', visible: true }
  ];

  showColumnPicker = false;

  records: DowntimeTrackingRecord[] = [];
  filteredRecords: DowntimeTrackingRecord[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: DowntimeTrackingRecord | null = null;

  form: DowntimeTrackingForm = this.emptyForm();

  constructor(private downtimeService: DowntimeTrackingService) {
    this.refresh();
  }

  get reasonMaster() {
    return this.downtimeService.reasonMaster;
  }

  get impactLevelMaster() {
    return this.downtimeService.impactLevelMaster;
  }

  get computedDuration(): string {
    return this.downtimeService.formatDuration(this.form.downtimeStart, this.form.downtimeEnd);
  }

  private emptyForm(): DowntimeTrackingForm {
    return {
      downtimeStart: '',
      downtimeEnd: '',
      reasonForDowntime: '',
      impactLevel: ''
    };
  }

  private refresh(): void {
    this.records = this.downtimeService.getRecords();
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

  toggleColumn(col: DowntimeColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): DowntimeTrackingRecord[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: DowntimeTrackingRecord): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.downtimeService.search(this.searchTerm);
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
    const { selected, totalDowntime, ...rest } = record;
    this.form = { ...rest };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
  }

  submitForm(): void {
    const record: DowntimeTrackingRecord = { ...this.form, totalDowntime: this.computedDuration };
    if (this.isEditMode && this.editingRecord) {
      this.downtimeService.updateRecord(this.editingRecord, record);
    } else {
      this.downtimeService.addRecord(record);
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.downtimeService.deleteRecords(this.selectedRecords);
    this.refresh();
  }

  onUpload(): void {
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
  }

  onDownload(): void {
    // TODO: export current downtime tracking list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
