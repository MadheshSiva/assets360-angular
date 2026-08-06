import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { MasterManagementResponseTypeMasterItem } from './response-type-master.model';
import { MasterManagementResponseTypeMasterService } from './response-type-master.service';

interface MasterManagementResponseTypeMasterRow extends MasterManagementResponseTypeMasterItem {
  selected?: boolean;
}

interface MasterManagementResponseTypeMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-response-type-master',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './response-type-master.html',
  styleUrls: ['./response-type-master.css']
})
export class MasterManagementResponseTypeMaster {
  searchTerm = '';

  columns: MasterManagementResponseTypeMasterColumn[] = [
    { key: 'typeId', label: 'Type ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'typeName', label: 'Type Name', visible: true },
    { key: 'validationType', label: 'Validation Type', visible: true },
    { key: 'isActive', label: 'Is Active', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'typeId', label: 'Type ID' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'typeName', label: 'Type Name' },
    { key: 'validationType', label: 'Validation Type' },
    { key: 'isActive', label: 'Is Active' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: MasterManagementResponseTypeMasterRow[] = [];
  filteredRecords: MasterManagementResponseTypeMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementResponseTypeMasterRow | null = null;

  form: MasterManagementResponseTypeMasterItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementResponseTypeMasterService,
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
      const match = this.records.find((r) => r.typeName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get typeNameMaster() {
    return this.service.typeNameMaster;
  }

  get validationTypeMaster() {
    return this.service.validationTypeMaster;
  }

  private emptyForm(): MasterManagementResponseTypeMasterItem {
    return {
      typeId: '',
      assetId: '',
      assetName: '',
      typeName: '',
      validationType: '',
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

  toggleColumn(col: MasterManagementResponseTypeMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementResponseTypeMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementResponseTypeMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementResponseTypeMasterRow[];
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

  editRow(record: MasterManagementResponseTypeMasterRow): void {
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
      this.service.updateRecord(this.editingRecord.typeId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.typeId));
    this.refresh();
  }

  deleteRow(record: MasterManagementResponseTypeMasterRow): void {
    this.service.deleteRecords([record.typeId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    const toBool = (v?: string) => ['true', 'yes', '1'].includes((v ?? '').trim().toLowerCase());
    rows.forEach((row) => {
      this.service.addRecord({
        typeId: row['typeId'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        typeName: (row['typeName'] as MasterManagementResponseTypeMasterItem['typeName']) || '',
        validationType: (row['validationType'] as MasterManagementResponseTypeMasterItem['validationType']) || '',
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
