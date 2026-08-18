import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PredictiveMaintenanceRecord, PredictiveMaintenanceForm } from './predictive-maintenance.model';
import { PredictiveMaintenanceService } from './predictive-maintenance.service';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { RowActions } from 'shared-ui';

interface PredictiveColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-maintenance-predictive',
  imports: [CommonModule, FormsModule, ImportFileModal, MasterLinkIcons, RowActions],
  templateUrl: './predictive-maintenance.html',
  styleUrls: ['./predictive-maintenance.css']
})
export class MaintenancePredictive {
  searchTerm = '';

  columns: PredictiveColumn[] = [
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'sensorType', label: 'Sensor Type', visible: true },
    { key: 'thresholdValue', label: 'Threshold Value', visible: true },
    { key: 'alertCondition', label: 'Alert Condition', visible: true },
    { key: 'dataSource', label: 'Data Source (Device ID)', visible: true },
    { key: 'predictionModelOutput', label: 'Prediction Model Output', visible: true },
    { key: 'riskLevel', label: 'Risk Level', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'sensorType', label: 'Sensor Type' },
    { key: 'thresholdValue', label: 'Threshold Value' },
    { key: 'alertCondition', label: 'Alert Condition' },
    { key: 'dataSource', label: 'Data Source (Device ID)' },
    { key: 'predictionModelOutput', label: 'Prediction Model Output' },
    { key: 'riskLevel', label: 'Risk Level' }
  ];

  showImportModal = false;

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
      assetId: '',
      assetName: '',
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
    this.editRow(this.selectedRecords[0]);
  }

  editRow(record: PredictiveMaintenanceRecord): void {
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

  deleteRow(record: PredictiveMaintenanceRecord): void {
    this.predictiveService.deleteRecords([record]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.predictiveService.addRecord({
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        sensorType: row['sensorType'] ?? '',
        thresholdValue: this.toNumber(row['thresholdValue']),
        alertCondition: row['alertCondition'] ?? '',
        dataSource: row['dataSource'] ?? '',
        predictionModelOutput: row['predictionModelOutput'] ?? '',
        riskLevel: row['riskLevel'] ?? ''
      });
    });
    this.refresh();
    this.showImportModal = false;
  }

  private toNumber(value: string | undefined): number | null {
    if (value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }

  onDownload(): void {
    // TODO: export current predictive maintenance list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
