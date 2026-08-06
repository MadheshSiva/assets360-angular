import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { VendorAmcRecord, VendorAmcForm } from './vendor-amc.model';
import { VendorAmcService } from './vendor-amc.service';

interface VendorAmcColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-maintenance-vendor-amc',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './vendor-amc.html',
  styleUrls: ['./vendor-amc.css']
})
export class MaintenanceVendorAmc {
  searchTerm = '';

  columns: VendorAmcColumn[] = [
    { key: 'vendorName', label: 'Vendor Name', visible: true },
    { key: 'contractId', label: 'Contract ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'assetIds', label: 'Assets Covered', visible: true },
    { key: 'startDate', label: 'Start Date', visible: true },
    { key: 'endDate', label: 'End Date', visible: true },
    { key: 'slaTerms', label: 'SLA Terms', visible: true },
    { key: 'responseTime', label: 'Response Time', visible: false },
    { key: 'contactDetails', label: 'Contact Details', visible: false }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'vendorName', label: 'Vendor Name' },
    { key: 'contractId', label: 'Contract ID' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'assetIds', label: 'Assets Covered' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'slaTerms', label: 'SLA Terms' },
    { key: 'responseTime', label: 'Response Time' },
    { key: 'contactDetails', label: 'Contact Details' }
  ];

  showImportModal = false;

  showColumnPicker = false;
  showAssetDropdown = false;

  records: VendorAmcRecord[] = [];
  filteredRecords: VendorAmcRecord[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: VendorAmcRecord | null = null;

  form: VendorAmcForm = this.emptyForm();

  constructor(private vendorAmcService: VendorAmcService) {
    this.refresh();
  }

  get vendorMaster() {
    return this.vendorAmcService.vendorMaster;
  }

  get amcMaster() {
    return this.vendorAmcService.amcMaster;
  }

  get assetMaster() {
    return this.vendorAmcService.assetMaster;
  }

  assetName(assetId: string): string {
    return this.assetMaster.find((a) => a.id === assetId)?.name ?? assetId;
  }

  assetNames(assetIds: string[]): string {
    return assetIds.map((id) => this.assetName(id)).join(', ');
  }

  isAssetSelected(assetId: string): boolean {
    return this.form.assetIds.includes(assetId);
  }

  selectFormAsset(assetId: string): void {
    this.form.assetIds = this.isAssetSelected(assetId)
      ? this.form.assetIds.filter((id) => id !== assetId)
      : [...this.form.assetIds, assetId];
    this.showAssetDropdown = false;
  }

  toggleAssetDropdown(): void {
    this.showAssetDropdown = !this.showAssetDropdown;
  }

  closeAssetDropdown(): void {
    this.showAssetDropdown = false;
  }

  private emptyForm(): VendorAmcForm {
    return {
      vendorName: '',
      contractId: '',
      assetId: '',
      assetName: '',
      assetIds: [],
      startDate: '',
      endDate: '',
      slaTerms: '',
      responseTime: null,
      contactDetails: ''
    };
  }

  private refresh(): void {
    this.records = this.vendorAmcService.getRecords();
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

  toggleColumn(col: VendorAmcColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): VendorAmcRecord[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: VendorAmcRecord): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.vendorAmcService.search(this.searchTerm);
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

  editRow(record: VendorAmcRecord): void {
    this.isEditMode = true;
    this.editingRecord = record;
    const { selected, ...rest } = record;
    this.form = { ...rest, assetIds: [...rest.assetIds] };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
    this.showAssetDropdown = false;
  }

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.vendorAmcService.updateRecord(this.editingRecord, { ...this.form });
    } else {
      this.vendorAmcService.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.vendorAmcService.deleteRecords(this.selectedRecords);
    this.refresh();
  }

  deleteRow(record: VendorAmcRecord): void {
    this.vendorAmcService.deleteRecords([record]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.vendorAmcService.addRecord({
        vendorName: row['vendorName'] ?? '',
        contractId: row['contractId'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        assetIds: (row['assetIds'] ?? '')
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean),
        startDate: row['startDate'] ?? '',
        endDate: row['endDate'] ?? '',
        slaTerms: row['slaTerms'] ?? '',
        responseTime: row['responseTime'] ? Number(row['responseTime']) : null,
        contactDetails: row['contactDetails'] ?? ''
      });
    });
    this.refresh();
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current vendor / AMC list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
    this.closeAssetDropdown();
  }
}
