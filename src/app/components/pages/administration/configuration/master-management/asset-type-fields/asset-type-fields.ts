import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
import { MasterManagementAssetTypeFieldsItem, AssetTypeFieldDataType, AssetTypeFieldRequired } from './asset-type-fields.model';
import { MasterManagementAssetTypeFieldsService } from './asset-type-fields.service';

interface MasterManagementAssetTypeFieldsRow extends MasterManagementAssetTypeFieldsItem {
  selected?: boolean;
}

interface MasterManagementAssetTypeFieldsColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-asset-type-fields',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './asset-type-fields.html',
  styleUrls: ['./asset-type-fields.css']
})
export class MasterManagementAssetTypeFields {
  searchTerm = '';

  columns: MasterManagementAssetTypeFieldsColumn[] = [
    { key: 'fieldId', label: 'Field ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'assetType', label: 'Asset Type', visible: true },
    { key: 'fieldName', label: 'Field Name', visible: true },
    { key: 'fieldType', label: 'Field Type', visible: true },
    { key: 'isRequired', label: 'Is Required', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'fieldId', label: 'Field ID' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'assetType', label: 'Asset Type' },
    { key: 'fieldName', label: 'Field Name' },
    { key: 'fieldType', label: 'Field Type' },
    { key: 'isRequired', label: 'Is Required' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: MasterManagementAssetTypeFieldsRow[] = [];
  filteredRecords: MasterManagementAssetTypeFieldsRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementAssetTypeFieldsRow | null = null;

  form: MasterManagementAssetTypeFieldsItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementAssetTypeFieldsService,
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
      const match = this.records.find((r) => r.fieldName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get assetTypeMaster() {
    return this.service.assetTypeMaster;
  }

  get fieldTypeMaster() {
    return this.service.fieldTypeMaster;
  }

  get isRequiredMaster() {
    return this.service.isRequiredMaster;
  }

  private emptyForm(): MasterManagementAssetTypeFieldsItem {
    return {
      fieldId: '',
      assetId: '',
      assetName: '',
      assetType: '',
      fieldName: '',
      fieldType: '',
      isRequired: ''
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

  toggleColumn(col: MasterManagementAssetTypeFieldsColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementAssetTypeFieldsRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementAssetTypeFieldsRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementAssetTypeFieldsRow[];
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

  editRow(record: MasterManagementAssetTypeFieldsRow): void {
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
      this.service.updateRecord(this.editingRecord.fieldId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.fieldId));
    this.refresh();
  }

  deleteRow(record: MasterManagementAssetTypeFieldsRow): void {
    this.service.deleteRecords([record.fieldId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.service.addRecord({
        fieldId: row['fieldId'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        assetType: row['assetType'] ?? '',
        fieldName: row['fieldName'] ?? '',
        fieldType: (row['fieldType'] ?? '') as AssetTypeFieldDataType | '',
        isRequired: (row['isRequired'] ?? '') as AssetTypeFieldRequired | ''
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
