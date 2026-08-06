import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { RowActions } from '@shared/row-actions/row-actions';
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
  imports: [CommonModule, FormsModule, ImportFileModal, MasterLinkIcons, RowActions],
  templateUrl: './downtime-tracking.html',
  styleUrls: ['./downtime-tracking.css']
})
export class MaintenanceDowntimeTracking {
  searchTerm = '';

  columns: DowntimeColumn[] = [
    { key: 'assetId', label: 'Asset', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'downtimeStart', label: 'Downtime Start', visible: true },
    { key: 'downtimeEnd', label: 'Downtime End', visible: true },
    { key: 'totalDowntime', label: 'Total Downtime', visible: true },
    { key: 'reasonForDowntime', label: 'Reason for Downtime', visible: true },
    { key: 'impactLevel', label: 'Impact Level', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'assetId', label: 'Asset' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'downtimeStart', label: 'Downtime Start' },
    { key: 'downtimeEnd', label: 'Downtime End' },
    { key: 'totalDowntime', label: 'Total Downtime' },
    { key: 'reasonForDowntime', label: 'Reason for Downtime' },
    { key: 'impactLevel', label: 'Impact Level' }
  ];

  showImportModal = false;

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

  get assetMaster() {
    return this.downtimeService.assetMaster;
  }

  get reasonMaster() {
    return this.downtimeService.reasonMaster;
  }

  assetName(assetId: string): string {
    return this.assetMaster.find((a) => a.id === assetId)?.name ?? assetId;
  }

  get impactLevelMaster() {
    return this.downtimeService.impactLevelMaster;
  }

  get computedDuration(): string {
    return this.downtimeService.formatDuration(this.form.downtimeStart, this.form.downtimeEnd);
  }

  private emptyForm(): DowntimeTrackingForm {
    return {
      assetId: '',
      assetName: '',
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
    this.editRow(this.selectedRecords[0]);
  }

  editRow(record: DowntimeTrackingRecord): void {
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

  deleteRow(record: DowntimeTrackingRecord): void {
    this.downtimeService.deleteRecords([record]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.downtimeService.addRecord({
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        downtimeStart: row['downtimeStart'] ?? '',
        downtimeEnd: row['downtimeEnd'] ?? '',
        totalDowntime: row['totalDowntime'] ?? '',
        reasonForDowntime: row['reasonForDowntime'] ?? '',
        impactLevel: row['impactLevel'] ?? ''
      });
    });
    this.refresh();
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current downtime tracking list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
