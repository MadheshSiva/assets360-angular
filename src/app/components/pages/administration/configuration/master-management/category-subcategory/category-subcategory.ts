import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementCategorySubcategoryItem } from './category-subcategory.model';
import { MasterManagementCategorySubcategoryService } from './category-subcategory.service';

interface MasterManagementCategorySubcategoryRow extends MasterManagementCategorySubcategoryItem {
  selected?: boolean;
}

interface MasterManagementCategorySubcategoryColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-category-subcategory',
  imports: [CommonModule, FormsModule],
  templateUrl: './category-subcategory.html',
  styleUrls: ['./category-subcategory.css']
})
export class MasterManagementCategorySubcategory {
  searchTerm = '';

  columns: MasterManagementCategorySubcategoryColumn[] = [
    { key: 'categoryId', label: 'Category ID', visible: true },
    { key: 'categoryName', label: 'Category Name', visible: true },
    { key: 'categoryCode', label: 'Category Code', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'level', label: 'Level', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'relatedAssetId', label: 'Related Asset', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementCategorySubcategoryRow[] = [];
  filteredRecords: MasterManagementCategorySubcategoryRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementCategorySubcategoryRow | null = null;

  form: MasterManagementCategorySubcategoryItem = this.emptyForm();

  constructor(private service: MasterManagementCategorySubcategoryService) {
    this.refresh();
  }

  get levelMaster() {
    return this.service.levelMaster;
  }

  get statusMaster() {
    return this.service.statusMaster;
  }

  get assetMaster() {
    return this.service.assetMaster;
  }

  private emptyForm(): MasterManagementCategorySubcategoryItem {
    return {
      categoryId: '',
      categoryName: '',
      categoryCode: '',
      description: '',
      level: '',
      status: '',
      relatedAssetId: ''
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

  toggleColumn(col: MasterManagementCategorySubcategoryColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementCategorySubcategoryRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementCategorySubcategoryRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementCategorySubcategoryRow[];
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

  onLevelChange(): void {
    if (this.form.level !== 'Sub Category') {
      this.form.relatedAssetId = '';
    }
  }

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.categoryId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.categoryId));
    this.refresh();
  }

  onUpload(): void {
  }

  onDownload(): void {
  }

  assetName(assetId: string): string {
    if (!assetId) return '-';
    return this.assetMaster.find((a) => a.assetId === assetId)?.assetName ?? assetId;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
