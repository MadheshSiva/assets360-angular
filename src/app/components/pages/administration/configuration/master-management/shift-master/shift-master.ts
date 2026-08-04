import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { MasterManagementShiftMasterItem } from './shift-master.model';
import { MasterManagementShiftMasterService } from './shift-master.service';

interface MasterManagementShiftMasterRow extends MasterManagementShiftMasterItem {
  selected?: boolean;
}

interface MasterManagementShiftMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-shift-master',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './shift-master.html',
  styleUrls: ['./shift-master.css']
})
export class MasterManagementShiftMaster {
  searchTerm = '';

  columns: MasterManagementShiftMasterColumn[] = [
    { key: 'shiftId', label: 'Shift ID', visible: true },
    { key: 'shiftName', label: 'Shift Name', visible: true },
    { key: 'startTime', label: 'Start Time', visible: true },
    { key: 'endTime', label: 'End Time', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'shiftId', label: 'Shift ID' },
    { key: 'shiftName', label: 'Shift Name' },
    { key: 'startTime', label: 'Start Time' },
    { key: 'endTime', label: 'End Time' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: MasterManagementShiftMasterRow[] = [];
  filteredRecords: MasterManagementShiftMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementShiftMasterRow | null = null;

  form: MasterManagementShiftMasterItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementShiftMasterService,
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
      const match = this.records.find((r) => r.shiftName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  private emptyForm(): MasterManagementShiftMasterItem {
    return {
      shiftId: '',
      shiftName: '',
      startTime: '',
      endTime: ''
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

  toggleColumn(col: MasterManagementShiftMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementShiftMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementShiftMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementShiftMasterRow[];
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

  editRow(record: MasterManagementShiftMasterRow): void {
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
      this.service.updateRecord(this.editingRecord.shiftId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.shiftId));
    this.refresh();
  }

  deleteRow(record: MasterManagementShiftMasterRow): void {
    this.service.deleteRecords([record.shiftId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.service.addRecord({
        shiftId: row['shiftId'] ?? '',
        shiftName: row['shiftName'] ?? '',
        startTime: row['startTime'] ?? '',
        endTime: row['endTime'] ?? ''
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
