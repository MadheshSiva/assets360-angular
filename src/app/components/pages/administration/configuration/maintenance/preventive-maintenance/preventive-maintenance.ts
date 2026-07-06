import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreventiveMaintenanceRecord, PreventiveMaintenanceForm } from './preventive-maintenance.model';
import { PreventiveMaintenanceService } from './preventive-maintenance.service';

interface PmColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-maintenance-preventive',
  imports: [CommonModule, FormsModule],
  templateUrl: './preventive-maintenance.html',
  styleUrls: ['./preventive-maintenance.css']
})
export class MaintenancePreventive {
  searchTerm = '';

  columns: PmColumn[] = [
    { key: 'pmScheduleId', label: 'PM Schedule ID', visible: true },
    { key: 'frequency', label: 'Frequency', visible: true },
    { key: 'triggerType', label: 'Trigger Type', visible: true },
    { key: 'lastMaintenanceDate', label: 'Last Maintenance Date', visible: true },
    { key: 'nextDueDate', label: 'Next Due Date', visible: true },
    { key: 'autoCreateWorkOrder', label: 'Auto-create Work Order', visible: true }
  ];

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

  onUpload(): void {
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
  }

  onDownload(): void {
    // TODO: export current preventive maintenance list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
