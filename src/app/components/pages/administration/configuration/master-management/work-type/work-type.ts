import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { MasterManagementWorkTypeItem } from './work-type.model';
import { MasterManagementWorkTypeService } from './work-type.service';

interface MasterManagementWorkTypeRow extends MasterManagementWorkTypeItem {
  selected?: boolean;
}

interface MasterManagementWorkTypeColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-work-type',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './work-type.html',
  styleUrls: ['./work-type.css']
})
export class MasterManagementWorkType {
  searchTerm = '';

  columns: MasterManagementWorkTypeColumn[] = [
    { key: 'workTypeId', label: 'Work Type ID', visible: true },
    { key: 'workTypeName', label: 'Work Type Name', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'isActive', label: 'Is Active', visible: true }
  ];

  showColumnPicker = false;

  readonly importColumns: ImportColumn[] = this.columns.map(({ key, label }) => ({ key, label }));

  showImportModal = false;

  records: MasterManagementWorkTypeRow[] = [];
  filteredRecords: MasterManagementWorkTypeRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementWorkTypeRow | null = null;

  form: MasterManagementWorkTypeItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementWorkTypeService,
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
      const match = this.records.find((r) => r.workTypeName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  private emptyForm(): MasterManagementWorkTypeItem {
    return {
      workTypeId: '',
      workTypeName: '',
      description: '',
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

  toggleColumn(col: MasterManagementWorkTypeColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementWorkTypeRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementWorkTypeRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementWorkTypeRow[];
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

  editRow(record: MasterManagementWorkTypeRow): void {
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
      this.service.updateRecord(this.editingRecord.workTypeId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.workTypeId));
    this.refresh();
  }

  deleteRow(record: MasterManagementWorkTypeRow): void {
    this.service.deleteRecords([record.workTypeId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.service.addRecord({
        workTypeId: row['workTypeId'] ?? '',
        workTypeName: row['workTypeName'] ?? '',
        description: row['description'] ?? '',
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
