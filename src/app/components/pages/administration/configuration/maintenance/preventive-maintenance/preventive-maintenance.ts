import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreventiveMaintenanceRecord, PreventiveMaintenanceForm } from './preventive-maintenance.model';
import { PreventiveMaintenanceService } from './preventive-maintenance.service';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { RowActions } from '@shared/row-actions/row-actions';

interface PmColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-maintenance-preventive',
  imports: [CommonModule, FormsModule, ImportFileModal, MasterLinkIcons, RowActions],
  templateUrl: './preventive-maintenance.html',
  styleUrls: ['./preventive-maintenance.css']
})
export class MaintenancePreventive {
  searchTerm = '';

  columns: PmColumn[] = [
    { key: 'pmScheduleId', label: 'PM Schedule ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'frequency', label: 'Frequency', visible: true },
    { key: 'triggerType', label: 'Trigger Type', visible: true },
    { key: 'lastMaintenanceDate', label: 'Last Maintenance Date', visible: true },
    { key: 'nextDueDate', label: 'Next Due Date', visible: true },
    { key: 'autoCreateWorkOrder', label: 'Auto-create Work Order', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'pmScheduleId', label: 'PM Schedule ID' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'frequency', label: 'Frequency' },
    { key: 'triggerType', label: 'Trigger Type' },
    { key: 'lastMaintenanceDate', label: 'Last Maintenance Date' },
    { key: 'nextDueDate', label: 'Next Due Date' },
    { key: 'autoCreateWorkOrder', label: 'Auto-create Work Order' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: PreventiveMaintenanceRecord[] = [];
  filteredRecords: PreventiveMaintenanceRecord[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: PreventiveMaintenanceRecord | null = null;

  form: PreventiveMaintenanceForm = this.emptyForm();

  constructor(private pmService: PreventiveMaintenanceService) {
    this.refresh();
  }

  get pmScheduleMaster() {
    return this.pmService.pmScheduleMaster;
  }

  get frequencyMaster() {
    return this.pmService.frequencyMaster;
  }

  get triggerTypeMaster() {
    return this.pmService.triggerTypeMaster;
  }

  get yesNoMaster() {
    return this.pmService.yesNoMaster;
  }

  private emptyForm(): PreventiveMaintenanceForm {
    return {
      pmScheduleId: '',
      assetId: '',
      assetName: '',
      frequency: '',
      triggerType: '',
      lastMaintenanceDate: '',
      nextDueDate: '',
      autoCreateWorkOrder: ''
    };
  }

  private refresh(): void {
    this.records = this.pmService.getRecords();
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

  toggleColumn(col: PmColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): PreventiveMaintenanceRecord[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: PreventiveMaintenanceRecord): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.pmService.search(this.searchTerm);
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

  editRow(record: PreventiveMaintenanceRecord): void {
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
      this.pmService.updateRecord(this.editingRecord, { ...this.form });
    } else {
      this.pmService.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.pmService.deleteRecords(this.selectedRecords);
    this.refresh();
  }

  deleteRow(record: PreventiveMaintenanceRecord): void {
    this.pmService.deleteRecords([record]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const autoCreateWorkOrder = row['autoCreateWorkOrder'] ?? '';
      this.pmService.addRecord({
        pmScheduleId: row['pmScheduleId'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        frequency: row['frequency'] ?? '',
        triggerType: row['triggerType'] ?? '',
        lastMaintenanceDate: row['lastMaintenanceDate'] ?? '',
        nextDueDate: row['nextDueDate'] ?? '',
        autoCreateWorkOrder: autoCreateWorkOrder === 'Yes' || autoCreateWorkOrder === 'No' ? autoCreateWorkOrder : ''
      });
    });
    this.refresh();
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current preventive maintenance list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
