import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { MasterManagementPriorityItem, PriorityName } from './priority.model';
import { MasterManagementPriorityService } from './priority.service';

interface MasterManagementPriorityRow extends MasterManagementPriorityItem {
  selected?: boolean;
}

interface MasterManagementPriorityColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-priority',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './priority.html',
  styleUrls: ['./priority.css']
})
export class MasterManagementPriority {
  searchTerm = '';

  columns: MasterManagementPriorityColumn[] = [
    { key: 'priorityId', label: 'Priority ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'priorityName', label: 'Priority Name', visible: true },
    { key: 'colorCode', label: 'Color Code', visible: true },
    { key: 'slaMapping', label: 'SLA Mapping', visible: true },
    { key: 'isActive', label: 'Is Active', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'priorityId', label: 'Priority ID' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'priorityName', label: 'Priority Name' },
    { key: 'colorCode', label: 'Color Code' },
    { key: 'slaMapping', label: 'SLA Mapping' },
    { key: 'isActive', label: 'Is Active' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: MasterManagementPriorityRow[] = [];
  filteredRecords: MasterManagementPriorityRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementPriorityRow | null = null;

  form: MasterManagementPriorityItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementPriorityService,
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
      const match = this.records.find((r) => r.priorityName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get priorityNameMaster() {
    return this.service.priorityNameMaster;
  }

  get slaMappingMaster() {
    return this.service.slaMappingMaster;
  }

  private emptyForm(): MasterManagementPriorityItem {
    return {
      priorityId: '',
      assetId: '',
      assetName: '',
      priorityName: '',
      colorCode: '',
      slaMapping: '',
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

  toggleColumn(col: MasterManagementPriorityColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementPriorityRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementPriorityRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementPriorityRow[];
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

  editRow(record: MasterManagementPriorityRow): void {
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
      this.service.updateRecord(this.editingRecord.priorityId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.priorityId));
    this.refresh();
  }

  deleteRow(record: MasterManagementPriorityRow): void {
    this.service.deleteRecords([record.priorityId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const activeRaw = (row['isActive'] ?? '').trim().toLowerCase();
      this.service.addRecord({
        priorityId: row['priorityId'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        priorityName: (row['priorityName'] ?? '') as PriorityName | '',
        colorCode: row['colorCode'] ?? '',
        slaMapping: row['slaMapping'] ?? '',
        isActive: activeRaw === 'yes' || activeRaw === 'true'
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
