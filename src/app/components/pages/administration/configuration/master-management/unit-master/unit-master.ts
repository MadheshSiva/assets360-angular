import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { MasterManagementUnitMasterItem } from './unit-master.model';
import { MasterManagementUnitMasterService } from './unit-master.service';

interface MasterManagementUnitMasterRow extends MasterManagementUnitMasterItem {
  selected?: boolean;
}

interface MasterManagementUnitMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-unit-master',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './unit-master.html',
  styleUrls: ['./unit-master.css']
})
export class MasterManagementUnitMaster {
  searchTerm = '';

  columns: MasterManagementUnitMasterColumn[] = [
    { key: 'unitId', label: 'Unit ID', visible: true },
    { key: 'unitName', label: 'Unit Name', visible: true },
    { key: 'symbol', label: 'Symbol', visible: true },
    { key: 'isActive', label: 'Is Active', visible: true }
  ];

  showColumnPicker = false;

  readonly importColumns: ImportColumn[] = this.columns.map(({ key, label }) => ({ key, label }));

  showImportModal = false;

  records: MasterManagementUnitMasterRow[] = [];
  filteredRecords: MasterManagementUnitMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementUnitMasterRow | null = null;

  form: MasterManagementUnitMasterItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementUnitMasterService,
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
      const match = this.records.find((r) => r.unitName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  private emptyForm(): MasterManagementUnitMasterItem {
    return {
      unitId: '',
      unitName: '',
      symbol: '',
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

  toggleColumn(col: MasterManagementUnitMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementUnitMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementUnitMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementUnitMasterRow[];
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

  editRow(record: MasterManagementUnitMasterRow): void {
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
      this.service.updateRecord(this.editingRecord.unitId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.unitId));
    this.refresh();
  }

  deleteRow(record: MasterManagementUnitMasterRow): void {
    this.service.deleteRecords([record.unitId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.service.addRecord({
        unitId: row['unitId'] ?? '',
        unitName: row['unitName'] ?? '',
        symbol: row['symbol'] ?? '',
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
