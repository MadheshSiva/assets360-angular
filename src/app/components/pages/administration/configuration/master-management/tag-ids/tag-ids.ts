import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { MasterManagementTagIdItem } from './tag-ids.model';
import { MasterManagementTagIdService } from './tag-ids.service';

interface MasterManagementTagIdRow extends MasterManagementTagIdItem {
  selected?: boolean;
}

interface MasterManagementTagIdColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-tag-ids',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './tag-ids.html',
  styleUrls: ['./tag-ids.css']
})
export class MasterManagementTagIds {
  searchTerm = '';

  columns: MasterManagementTagIdColumn[] = [
    { key: 'tagId', label: 'Tag ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'tagCode', label: 'Tag Code', visible: true },
    { key: 'tagType', label: 'Tag Type', visible: true },
    { key: 'assignedAssetCode', label: 'Assigned Asset Code', visible: true },
    { key: 'issueDate', label: 'Issue Date', visible: true },
    { key: 'isActive', label: 'Active', visible: true }
  ];

  showColumnPicker = false;

  readonly importColumns: ImportColumn[] = this.columns.map(({ key, label }) => ({ key, label }));

  showImportModal = false;

  records: MasterManagementTagIdRow[] = [];
  filteredRecords: MasterManagementTagIdRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementTagIdRow | null = null;

  form: MasterManagementTagIdItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementTagIdService,
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
      const match = this.records.find((r) => r.tagType === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get tagTypeMaster() {
    return this.service.tagTypeMaster;
  }

  private emptyForm(): MasterManagementTagIdItem {
    return {
      tagId: '',
      assetId: '',
      assetName: '',
      tagCode: '',
      tagType: '',
      assignedAssetCode: '',
      issueDate: '',
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

  toggleColumn(col: MasterManagementTagIdColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementTagIdRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementTagIdRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementTagIdRow[];
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

  editRow(record: MasterManagementTagIdRow): void {
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
      this.service.updateRecord(this.editingRecord.tagId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.tagId));
    this.refresh();
  }

  deleteRow(record: MasterManagementTagIdRow): void {
    this.service.deleteRecords([record.tagId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.service.addRecord({
        tagId: row['tagId'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        tagCode: row['tagCode'] ?? '',
        tagType: row['tagType'] ?? '',
        assignedAssetCode: row['assignedAssetCode'] ?? '',
        issueDate: row['issueDate'] ?? '',
        isActive: /^(true|yes|1)$/i.test((row['isActive'] ?? '').trim())
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
