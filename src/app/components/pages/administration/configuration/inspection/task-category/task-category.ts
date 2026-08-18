import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
import { InspectionTaskCategoryItem, InspectionTaskCategoryRow } from './task-category.model';
import { InspectionTaskCategoryService } from './task-category.service';

interface InspectionTaskCategoryColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-inspection-task-category',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './task-category.html',
  styleUrls: ['./task-category.css']
})
export class InspectionTaskCategory {
  searchTerm = '';

  columns: InspectionTaskCategoryColumn[] = [
    { key: 'categoryCode', label: 'Category Code', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'categoryName', label: 'Category Name', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'displayOrder', label: 'Display Order', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'categoryCode', label: 'Category Code' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'categoryName', label: 'Category Name' },
    { key: 'description', label: 'Description' },
    { key: 'displayOrder', label: 'Display Order' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: InspectionTaskCategoryRow[] = [];
  filteredRecords: InspectionTaskCategoryRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: InspectionTaskCategoryRow | null = null;

  form: InspectionTaskCategoryItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: InspectionTaskCategoryService,
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
      const match = this.records.find((r) => r.categoryName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get categoryNameMaster() {
    return this.service.categoryNameMaster;
  }

  private emptyForm(): InspectionTaskCategoryItem {
    return {
      categoryCode: '',
      assetId: '',
      assetName: '',
      categoryName: '',
      description: '',
      displayOrder: null,
      status: true
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

  toggleColumn(col: InspectionTaskCategoryColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): InspectionTaskCategoryRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: InspectionTaskCategoryRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as InspectionTaskCategoryRow[];
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

  editRow(record: InspectionTaskCategoryRow): void {
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

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.categoryCode, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.categoryCode));
    this.refresh();
  }

  deleteRow(record: InspectionTaskCategoryRow): void {
    this.service.deleteRecords([record.categoryCode]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const activeRaw = (row['status'] ?? '').trim().toLowerCase();
      const displayOrderRaw = (row['displayOrder'] ?? '').trim();
      this.service.addRecord({
        categoryCode: row['categoryCode'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        categoryName: row['categoryName'] ?? '',
        description: row['description'] ?? '',
        displayOrder: displayOrderRaw ? Number(displayOrderRaw) : null,
        status: activeRaw === 'yes' || activeRaw === 'true'
      });
    });
    this.refresh();
    this.showImportModal = false;
  }

  onDownload(): void {
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
