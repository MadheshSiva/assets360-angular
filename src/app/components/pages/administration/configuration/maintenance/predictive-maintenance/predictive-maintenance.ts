import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PredictiveMaintenanceRecord, PredictiveMaintenanceForm } from './predictive-maintenance.model';
import { PredictiveMaintenanceService } from './predictive-maintenance.service';

interface PredictiveColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-maintenance-predictive',
  imports: [CommonModule, FormsModule],
  templateUrl: './predictive-maintenance.html',
  styleUrls: ['./predictive-maintenance.css']
})
export class MaintenancePredictive {
  searchTerm = '';

  columns: PredictiveColumn[] = [
    { key: 'sensorType', label: 'Sensor Type', visible: true },
    { key: 'thresholdValue', label: 'Threshold Value', visible: true },
    { key: 'alertCondition', label: 'Alert Condition', visible: true },
    { key: 'dataSource', label: 'Data Source (Device ID)', visible: true },
    { key: 'predictionModelOutput', label: 'Prediction Model Output', visible: true },
    { key: 'riskLevel', label: 'Risk Level', visible: true }
  ];

  showColumnPicker = false;

  records: PredictiveMaintenanceRecord[] = [];
  filteredRecords: PredictiveMaintenanceRecord[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: PredictiveMaintenanceRecord | null = null;

  form: PredictiveMaintenanceForm = this.emptyForm();

  constructor(private predictiveService: PredictiveMaintenanceService) {
    this.refresh();
  }

  get sensorTypeMaster() {
    return this.predictiveService.sensorTypeMaster;
  }

  get alertConditionMaster() {
    return this.predictiveService.alertConditionMaster;
  }

  get deviceMaster() {
    return this.predictiveService.deviceMaster;
  }

  get riskLevelMaster() {
    return this.predictiveService.riskLevelMaster;
  }

  private emptyForm(): PredictiveMaintenanceForm {
    return {
      sensorType: '',
      thresholdValue: null,
      alertCondition: '',
      dataSource: '',
      predictionModelOutput: '',
      riskLevel: ''
    };
  }

  private refresh(): void {
    this.records = this.predictiveService.getRecords();
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

  toggleColumn(col: PredictiveColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): PredictiveMaintenanceRecord[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: PredictiveMaintenanceRecord): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.predictiveService.search(this.searchTerm);
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
      this.predictiveService.updateRecord(this.editingRecord, { ...this.form });
    } else {
      this.predictiveService.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.predictiveService.deleteRecords(this.selectedRecords);
    this.refresh();
  }

  onUpload(): void {
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
  }

  onDownload(): void {
    // TODO: export current predictive maintenance list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
