import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
import {
  MasterManagementPhysicalVerificationResultItem,
  PhysicalVerificationRequiresAction,
  PhysicalVerificationResultCategory,
  PhysicalVerificationResultStatus
} from './physical-verification-result.model';
import { MasterManagementPhysicalVerificationResultService } from './physical-verification-result.service';

interface MasterManagementPhysicalVerificationResultRow extends MasterManagementPhysicalVerificationResultItem {
  selected?: boolean;
}

interface MasterManagementPhysicalVerificationResultColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-physical-verification-result',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './physical-verification-result.html',
  styleUrls: ['./physical-verification-result.css']
})
export class MasterManagementPhysicalVerificationResult {
  searchTerm = '';

  columns: MasterManagementPhysicalVerificationResultColumn[] = [
    { key: 'resultId', label: 'Result ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'resultName', label: 'Result Name', visible: true },
    { key: 'resultCode', label: 'Result Code', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'resultCategory', label: 'Result Category', visible: true },
    { key: 'requiresAction', label: 'Requires Action', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'resultId', label: 'Result ID' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'resultName', label: 'Result Name' },
    { key: 'resultCode', label: 'Result Code' },
    { key: 'description', label: 'Description' },
    { key: 'resultCategory', label: 'Result Category' },
    { key: 'requiresAction', label: 'Requires Action' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: MasterManagementPhysicalVerificationResultRow[] = [];
  filteredRecords: MasterManagementPhysicalVerificationResultRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementPhysicalVerificationResultRow | null = null;

  form: MasterManagementPhysicalVerificationResultItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementPhysicalVerificationResultService,
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
      const match = this.records.find((r) => r.resultName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get resultCategoryMaster() {
    return this.service.resultCategoryMaster;
  }

  get requiresActionMaster() {
    return this.service.requiresActionMaster;
  }

  get statusMaster() {
    return this.service.statusMaster;
  }

  private emptyForm(): MasterManagementPhysicalVerificationResultItem {
    return {
      resultId: '',
      assetId: '',
      assetName: '',
      resultName: '',
      resultCode: '',
      description: '',
      resultCategory: '',
      requiresAction: '',
      status: ''
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

  toggleColumn(col: MasterManagementPhysicalVerificationResultColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementPhysicalVerificationResultRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementPhysicalVerificationResultRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementPhysicalVerificationResultRow[];
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

  editRow(record: MasterManagementPhysicalVerificationResultRow): void {
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
      this.service.updateRecord(this.editingRecord.resultId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.resultId));
    this.refresh();
  }

  deleteRow(record: MasterManagementPhysicalVerificationResultRow): void {
    this.service.deleteRecords([record.resultId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.service.addRecord({
        resultId: row['resultId'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        resultName: row['resultName'] ?? '',
        resultCode: row['resultCode'] ?? '',
        description: row['description'] ?? '',
        resultCategory: (row['resultCategory'] ?? '') as PhysicalVerificationResultCategory | '',
        requiresAction: (row['requiresAction'] ?? '') as PhysicalVerificationRequiresAction | '',
        status: (row['status'] ?? '') as PhysicalVerificationResultStatus | ''
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
