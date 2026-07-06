import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './vendor-amc.html',
  styleUrls: ['./vendor-amc.css']
})
export class MaintenanceVendorAmc {
  searchTerm = '';

  columns: VendorAmcColumn[] = [
    { key: 'vendorName', label: 'Vendor Name', visible: true },
    { key: 'contractId', label: 'Contract ID', visible: true },
    { key: 'startDate', label: 'Start Date', visible: true },
    { key: 'endDate', label: 'End Date', visible: true },
    { key: 'slaTerms', label: 'SLA Terms', visible: true },
    { key: 'responseTime', label: 'Response Time', visible: false },
    { key: 'contactDetails', label: 'Contact Details', visible: false }
  ];

  showColumnPicker = false;

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

  private emptyForm(): VendorAmcForm {
    return {
      vendorName: '',
      contractId: '',
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

  onUpload(): void {
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
  }

  onDownload(): void {
    // TODO: export current vendor / AMC list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
