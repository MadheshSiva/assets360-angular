import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SparePartRecord, SparePartForm } from './spare-parts.model';
import { SparePartsService } from './spare-parts.service';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';

interface SparePartColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-maintenance-spare-parts',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './spare-parts.html',
  styleUrls: ['./spare-parts.css']
})
export class MaintenanceSpareParts {
  searchTerm = '';

  columns: SparePartColumn[] = [
    { key: 'partId', label: 'Part ID', visible: true },
    { key: 'partName', label: 'Part Name', visible: true },
    { key: 'category', label: 'Category', visible: true },
    { key: 'quantityInStock', label: 'Quantity in Stock', visible: true },
    { key: 'minimumStockLevel', label: 'Minimum Stock Level', visible: true },
    { key: 'unitCost', label: 'Unit Cost', visible: true },
    { key: 'supplier', label: 'Supplier', visible: true },
    { key: 'usagePerWorkOrder', label: 'Usage per Work Order', visible: false }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'partId', label: 'Part ID' },
    { key: 'partName', label: 'Part Name' },
    { key: 'category', label: 'Category' },
    { key: 'quantityInStock', label: 'Quantity in Stock' },
    { key: 'minimumStockLevel', label: 'Minimum Stock Level' },
    { key: 'unitCost', label: 'Unit Cost' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'usagePerWorkOrder', label: 'Usage per Work Order' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  parts: SparePartRecord[] = [];
  filteredParts: SparePartRecord[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingPart: SparePartRecord | null = null;

  form: SparePartForm = this.emptyForm();

  constructor(private partsService: SparePartsService) {
    this.refresh();
  }

  get sparePartsMaster() {
    return this.partsService.sparePartsMaster;
  }

  get partsCategoryMaster() {
    return this.partsService.partsCategoryMaster;
  }

  get vendorMaster() {
    return this.partsService.vendorMaster;
  }

  private emptyForm(): SparePartForm {
    return {
      partId: '',
      partName: '',
      category: '',
      quantityInStock: null,
      minimumStockLevel: null,
      unitCost: null,
      supplier: '',
      usagePerWorkOrder: null
    };
  }

  private refresh(): void {
    this.parts = this.partsService.getParts();
    this.onSearch();
  }

  isLowStock(part: SparePartRecord): boolean {
    return part.quantityInStock != null && part.minimumStockLevel != null && part.quantityInStock <= part.minimumStockLevel;
  }

  onPartIdChange(): void {
    this.form.partName = this.partsService.partName(this.form.partId);
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

  toggleColumn(col: SparePartColumn): void {
    col.visible = !col.visible;
  }

  get selectedParts(): SparePartRecord[] {
    return this.filteredParts.filter((p) => p.selected);
  }

  get allSelected(): boolean {
    return this.filteredParts.length > 0 && this.filteredParts.every((p) => p.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredParts.forEach((p) => (p.selected = next));
  }

  toggleSelectPart(part: SparePartRecord): void {
    part.selected = !part.selected;
  }

  onSearch(): void {
    this.filteredParts = this.partsService.search(this.searchTerm);
  }

  onRefresh(): void {
    this.searchTerm = '';
    this.refresh();
  }

  onCreate(): void {
    this.isEditMode = false;
    this.editingPart = null;
    this.form = this.emptyForm();
    this.showFormModal = true;
  }

  onEdit(): void {
    if (this.selectedParts.length !== 1) return;
    this.editRow(this.selectedParts[0]);
  }

  editRow(part: SparePartRecord): void {
    this.isEditMode = true;
    this.editingPart = part;
    const { selected, ...rest } = part;
    this.form = { ...rest };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingPart = null;
  }

  submitForm(): void {
    if (this.isEditMode && this.editingPart) {
      this.partsService.updatePart(this.editingPart, { ...this.form });
    } else {
      this.partsService.addPart({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedParts.length === 0) return;
    this.partsService.deleteParts(this.selectedParts);
    this.refresh();
  }

  deleteRow(part: SparePartRecord): void {
    this.partsService.deleteParts([part]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.partsService.addPart({
        partId: row['partId'] ?? '',
        partName: row['partName'] ?? '',
        category: row['category'] ?? '',
        quantityInStock: this.toNumber(row['quantityInStock']),
        minimumStockLevel: this.toNumber(row['minimumStockLevel']),
        unitCost: this.toNumber(row['unitCost']),
        supplier: row['supplier'] ?? '',
        usagePerWorkOrder: this.toNumber(row['usagePerWorkOrder'])
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
    // TODO: export current spare parts list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
