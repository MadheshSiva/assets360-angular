import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { MasterManagementResourceTypeItem } from './resource-type.model';
import { MasterManagementResourceTypeService } from './resource-type.service';

interface MasterManagementResourceTypeRow extends MasterManagementResourceTypeItem {
  selected?: boolean;
}

interface MasterManagementResourceTypeColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-resource-type',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './resource-type.html',
  styleUrls: ['./resource-type.css']
})
export class MasterManagementResourceType {
  searchTerm = '';

  columns: MasterManagementResourceTypeColumn[] = [
    { key: 'resourceTypeId', label: 'Type ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'resourceTypeName', label: 'Type Name', visible: true },
    { key: 'category', label: 'Category', visible: true },
    { key: 'isActive', label: 'Is Active', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'resourceTypeId', label: 'Type ID' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'resourceTypeName', label: 'Type Name' },
    { key: 'category', label: 'Category' },
    { key: 'isActive', label: 'Is Active' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: MasterManagementResourceTypeRow[] = [];
  filteredRecords: MasterManagementResourceTypeRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementResourceTypeRow | null = null;

  form: MasterManagementResourceTypeItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementResourceTypeService,
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
      const match = this.records.find((r) => r.resourceTypeName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get categoryMaster() {
    return this.service.categoryMaster;
  }

  private emptyForm(): MasterManagementResourceTypeItem {
    return {
      resourceTypeId: '',
      assetId: '',
      assetName: '',
      resourceTypeName: '',
      category: '',
      isActive: true
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

  toggleColumn(col: MasterManagementResourceTypeColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementResourceTypeRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementResourceTypeRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementResourceTypeRow[];
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

  editRow(record: MasterManagementResourceTypeRow): void {
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
      this.service.updateRecord(this.editingRecord.resourceTypeId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.resourceTypeId));
    this.refresh();
  }

  deleteRow(record: MasterManagementResourceTypeRow): void {
    this.service.deleteRecords([record.resourceTypeId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    const toBool = (v?: string) => ['true', 'yes', '1'].includes((v ?? '').trim().toLowerCase());
    rows.forEach((row) => {
      this.service.addRecord({
        resourceTypeId: row['resourceTypeId'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        resourceTypeName: row['resourceTypeName'] ?? '',
        category: (row['category'] as MasterManagementResourceTypeItem['category']) || '',
        isActive: toBool(row['isActive'])
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
