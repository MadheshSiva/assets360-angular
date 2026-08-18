import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
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
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './category-subcategory.html',
  styleUrls: ['./category-subcategory.css']
})
export class MasterManagementCategorySubcategory {
  searchTerm = '';

  columns: MasterManagementCategorySubcategoryColumn[] = [
    { key: 'categoryId', label: 'Category ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'categoryName', label: 'Category Name', visible: true },
    { key: 'categoryCode', label: 'Category Code', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'level', label: 'Level', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'relatedAssetId', label: 'Related Asset', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'categoryId', label: 'Category ID' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'categoryName', label: 'Category Name' },
    { key: 'categoryCode', label: 'Category Code' },
    { key: 'description', label: 'Description' },
    { key: 'level', label: 'Level' },
    { key: 'status', label: 'Status' },
    { key: 'relatedAssetId', label: 'Related Asset' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: MasterManagementCategorySubcategoryRow[] = [];
  filteredRecords: MasterManagementCategorySubcategoryRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementCategorySubcategoryRow | null = null;

  form: MasterManagementCategorySubcategoryItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementCategorySubcategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.refresh();
    this.handleDeepLink();
  }

  private handleDeepLink(): void {
    const params = this.route.snapshot.queryParamMap;
    const action = params.get('linkAction');
    if (!action) return;

    this.returnUrl = params.get('linkReturn');

    if (action === 'create') {
      this.onCreate();
    } else if (action === 'edit') {
      const value = params.get('linkValue') ?? '';
      // Callers like Assets pass a combined "Category / Sub-category" value
      // (e.g. "Mechanical / HVAC"); records here only store one flat
      // categoryName. Try the sub-category name first (most specific),
      // then the category name, then the raw value as a last resort.
      const parts = value.split('/').map((p) => p.trim()).filter(Boolean);
      const candidates = parts.length > 1 ? [parts[parts.length - 1], parts[0], value] : [value];
      const match = this.records.find((r) => candidates.includes(r.categoryName));
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
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
      assetId: '',
      assetName: '',
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
    this.editRow(this.selectedRecords[0]);
  }

  editRow(record: MasterManagementCategorySubcategoryRow): void {
    this.isEditMode = true;
    this.editingRecord = record;
    const { selected, ...rest } = record;
    this.form = { ...rest };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    }
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

  deleteRow(record: MasterManagementCategorySubcategoryRow): void {
    this.service.deleteRecords([record.categoryId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.service.addRecord({
        categoryId: row['categoryId'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        categoryName: row['categoryName'] ?? '',
        categoryCode: row['categoryCode'] ?? '',
        description: row['description'] ?? '',
        level: (row['level'] ?? '') as MasterManagementCategorySubcategoryItem['level'],
        status: (row['status'] ?? '') as MasterManagementCategorySubcategoryItem['status'],
        relatedAssetId: row['relatedAssetId'] ?? ''
      });
    });
    this.refresh();
    this.showImportModal = false;
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
