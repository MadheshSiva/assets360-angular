import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CostTrackingRecord, CostTrackingForm } from './cost-tracking.model';
import { CostTrackingService } from './cost-tracking.service';

interface CostColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-maintenance-cost-tracking',
  imports: [CommonModule, FormsModule],
  templateUrl: './cost-tracking.html',
  styleUrls: ['./cost-tracking.css']
})
export class MaintenanceCostTracking {
  searchTerm = '';

  columns: CostColumn[] = [
    { key: 'laborCost', label: 'Labor Cost', visible: true },
    { key: 'sparePartsCost', label: 'Spare Parts Cost', visible: true },
    { key: 'totalMaintenanceCost', label: 'Total Maintenance Cost', visible: true },
    { key: 'budgetAllocation', label: 'Budget Allocation', visible: true },
    { key: 'costPerAsset', label: 'Cost per Asset', visible: true }
  ];

  showColumnPicker = false;

  records: CostTrackingRecord[] = [];
  filteredRecords: CostTrackingRecord[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: CostTrackingRecord | null = null;

  form: CostTrackingForm = this.emptyForm();

  constructor(private costService: CostTrackingService) {
    this.refresh();
  }

  get computedTotal(): number {
    return (this.form.laborCost ?? 0) + (this.form.sparePartsCost ?? 0);
  }

  private emptyForm(): CostTrackingForm {
    return {
      laborCost: null,
      sparePartsCost: null,
      budgetAllocation: null,
      costPerAsset: null
    };
  }

  private refresh(): void {
    this.records = this.costService.getRecords();
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

  toggleColumn(col: CostColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): CostTrackingRecord[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: CostTrackingRecord): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.costService.search(this.searchTerm);
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
    const { selected, totalMaintenanceCost, ...rest } = record;
    this.form = { ...rest };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
  }

  submitForm(): void {
    const record: CostTrackingRecord = { ...this.form, totalMaintenanceCost: this.computedTotal };
    if (this.isEditMode && this.editingRecord) {
      this.costService.updateRecord(this.editingRecord, record);
    } else {
      this.costService.addRecord(record);
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.costService.deleteRecords(this.selectedRecords);
    this.refresh();
  }

  onUpload(): void {
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
  }

  onDownload(): void {
    // TODO: export current cost tracking list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
