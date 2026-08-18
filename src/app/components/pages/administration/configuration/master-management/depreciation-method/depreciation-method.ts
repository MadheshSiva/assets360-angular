import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
import { DepreciationCalculationType, DepreciationMethodStatus, MasterManagementDepreciationMethodItem } from './depreciation-method.model';
import { MasterManagementDepreciationMethodService } from './depreciation-method.service';

interface MasterManagementDepreciationMethodRow extends MasterManagementDepreciationMethodItem {
  selected?: boolean;
}

interface MasterManagementDepreciationMethodColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-depreciation-method',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './depreciation-method.html',
  styleUrls: ['./depreciation-method.css']
})
export class MasterManagementDepreciationMethod {
  searchTerm = '';

  columns: MasterManagementDepreciationMethodColumn[] = [
    { key: 'methodId', label: 'Method ID', visible: true },
    { key: 'methodName', label: 'Method Name', visible: true },
    { key: 'methodCode', label: 'Method Code', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'calculationType', label: 'Calculation Type', visible: true },
    { key: 'ratePercent', label: 'Rate (%)', visible: true },
    { key: 'usefulLifeYears', label: 'Useful Life (Years)', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  showColumnPicker = false;

  readonly importColumns: ImportColumn[] = [
    { key: 'methodId', label: 'Method ID' },
    { key: 'methodName', label: 'Method Name' },
    { key: 'methodCode', label: 'Method Code' },
    { key: 'description', label: 'Description' },
    { key: 'calculationType', label: 'Calculation Type' },
    { key: 'ratePercent', label: 'Rate (%)' },
    { key: 'usefulLifeYears', label: 'Useful Life (Years)' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  records: MasterManagementDepreciationMethodRow[] = [];
  filteredRecords: MasterManagementDepreciationMethodRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementDepreciationMethodRow | null = null;

  form: MasterManagementDepreciationMethodItem = this.emptyForm();

  constructor(private service: MasterManagementDepreciationMethodService) {
    this.refresh();
  }

  get calculationTypeMaster() {
    return this.service.calculationTypeMaster;
  }

  get statusMaster() {
    return this.service.statusMaster;
  }

  private emptyForm(): MasterManagementDepreciationMethodItem {
    return {
      methodId: '',
      methodName: '',
      methodCode: '',
      description: '',
      calculationType: '',
      ratePercent: null,
      usefulLifeYears: null,
      status: ''
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

  toggleColumn(col: MasterManagementDepreciationMethodColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementDepreciationMethodRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementDepreciationMethodRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementDepreciationMethodRow[];
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

  editRow(record: MasterManagementDepreciationMethodRow): void {
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
      this.service.updateRecord(this.editingRecord.methodId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.methodId));
    this.refresh();
  }

  deleteRow(record: MasterManagementDepreciationMethodRow): void {
    this.service.deleteRecords([record.methodId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    this.records = [
      ...this.records,
      ...rows.map((row) => ({
        methodId: row['methodId'] ?? '',
        methodName: row['methodName'] ?? '',
        methodCode: row['methodCode'] ?? '',
        description: row['description'] ?? '',
        calculationType: (row['calculationType'] ?? '') as DepreciationCalculationType | '',
        ratePercent: row['ratePercent'] ? Number(row['ratePercent']) : null,
        usefulLifeYears: row['usefulLifeYears'] ? Number(row['usefulLifeYears']) : null,
        status: (row['status'] ?? '') as DepreciationMethodStatus | ''
      }))
    ];
    this.onSearch();
    this.showImportModal = false;
  }

  onDownload(): void {
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
