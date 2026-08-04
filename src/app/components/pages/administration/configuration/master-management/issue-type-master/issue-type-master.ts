import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { IssueCategory, MasterManagementIssueTypeMasterItem } from './issue-type-master.model';
import { MasterManagementIssueTypeMasterService } from './issue-type-master.service';

interface MasterManagementIssueTypeMasterRow extends MasterManagementIssueTypeMasterItem {
  selected?: boolean;
}

interface MasterManagementIssueTypeMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-issue-type-master',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './issue-type-master.html',
  styleUrls: ['./issue-type-master.css']
})
export class MasterManagementIssueTypeMaster {
  searchTerm = '';

  columns: MasterManagementIssueTypeMasterColumn[] = [
    { key: 'issueTypeId', label: 'Issue Type ID', visible: true },
    { key: 'issueTypeName', label: 'Issue Type Name', visible: true },
    { key: 'category', label: 'Category', visible: true },
    { key: 'isActive', label: 'Is Active', visible: true }
  ];

  showColumnPicker = false;

  readonly importColumns: ImportColumn[] = [
    { key: 'issueTypeId', label: 'Issue Type ID' },
    { key: 'issueTypeName', label: 'Issue Type Name' },
    { key: 'category', label: 'Category' },
    { key: 'isActive', label: 'Is Active' }
  ];

  showImportModal = false;

  records: MasterManagementIssueTypeMasterRow[] = [];
  filteredRecords: MasterManagementIssueTypeMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementIssueTypeMasterRow | null = null;

  form: MasterManagementIssueTypeMasterItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementIssueTypeMasterService,
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
      const match = this.records.find((r) => r.issueTypeName === value);
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

  private emptyForm(): MasterManagementIssueTypeMasterItem {
    return {
      issueTypeId: '',
      issueTypeName: '',
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

  toggleColumn(col: MasterManagementIssueTypeMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementIssueTypeMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementIssueTypeMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementIssueTypeMasterRow[];
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

  editRow(record: MasterManagementIssueTypeMasterRow): void {
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
      this.service.updateRecord(this.editingRecord.issueTypeId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.issueTypeId));
    this.refresh();
  }

  deleteRow(record: MasterManagementIssueTypeMasterRow): void {
    this.service.deleteRecords([record.issueTypeId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    this.records = [
      ...this.records,
      ...rows.map((row) => ({
        issueTypeId: row['issueTypeId'] ?? '',
        issueTypeName: row['issueTypeName'] ?? '',
        category: (row['category'] ?? '') as IssueCategory | '',
        isActive: /^(true|yes|1)$/i.test(row['isActive'] ?? '')
      }))
    ];
    this.onSearch();
    this.showImportModal = false;
  }

  onDownload(): void {
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
