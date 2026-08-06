import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import {
  MasterManagementResolutionStatusItem,
  ResolutionStatusCategory,
  ResolutionStatusFinalFlag
} from './resolution-status.model';
import { MasterManagementResolutionStatusService } from './resolution-status.service';

interface MasterManagementResolutionStatusRow extends MasterManagementResolutionStatusItem {
  selected?: boolean;
}

interface MasterManagementResolutionStatusColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-resolution-status',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './resolution-status.html',
  styleUrls: ['./resolution-status.css']
})
export class MasterManagementResolutionStatus {
  searchTerm = '';

  columns: MasterManagementResolutionStatusColumn[] = [
    { key: 'resolutionStatusId', label: 'Status ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'statusName', label: 'Status Name', visible: true },
    { key: 'statusCode', label: 'Status Code', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'isFinalStatus', label: 'Is Final Status', visible: true },
    { key: 'statusCategory', label: 'Status Category', visible: true },
    { key: 'sequenceOrder', label: 'Sequence Order', visible: true },
    { key: 'statusColor', label: 'Status Color', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'resolutionStatusId', label: 'Status ID' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'statusName', label: 'Status Name' },
    { key: 'statusCode', label: 'Status Code' },
    { key: 'description', label: 'Description' },
    { key: 'isFinalStatus', label: 'Is Final Status' },
    { key: 'statusCategory', label: 'Status Category' },
    { key: 'sequenceOrder', label: 'Sequence Order' },
    { key: 'statusColor', label: 'Status Color' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: MasterManagementResolutionStatusRow[] = [];
  filteredRecords: MasterManagementResolutionStatusRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementResolutionStatusRow | null = null;

  form: MasterManagementResolutionStatusItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementResolutionStatusService,
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
      const match = this.records.find((r) => r.statusName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get statusNameSuggestions() {
    return this.service.statusNameSuggestions;
  }

  get finalStatusMaster() {
    return this.service.finalStatusMaster;
  }

  get categoryMaster() {
    return this.service.categoryMaster;
  }

  private emptyForm(): MasterManagementResolutionStatusItem {
    return {
      resolutionStatusId: '',
      assetId: '',
      assetName: '',
      statusName: '',
      statusCode: '',
      description: '',
      isFinalStatus: '',
      statusCategory: '',
      sequenceOrder: null,
      statusColor: ''
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

  toggleColumn(col: MasterManagementResolutionStatusColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementResolutionStatusRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementResolutionStatusRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementResolutionStatusRow[];
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

  editRow(record: MasterManagementResolutionStatusRow): void {
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
      this.service.updateRecord(this.editingRecord.resolutionStatusId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.resolutionStatusId));
    this.refresh();
  }

  deleteRow(record: MasterManagementResolutionStatusRow): void {
    this.service.deleteRecords([record.resolutionStatusId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const sequenceOrderRaw = (row['sequenceOrder'] ?? '').trim();
      const parsedSequenceOrder = sequenceOrderRaw ? Number(sequenceOrderRaw) : NaN;
      this.service.addRecord({
        resolutionStatusId: row['resolutionStatusId'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        statusName: row['statusName'] ?? '',
        statusCode: row['statusCode'] ?? '',
        description: row['description'] ?? '',
        isFinalStatus: (row['isFinalStatus'] ?? '') as ResolutionStatusFinalFlag | '',
        statusCategory: (row['statusCategory'] ?? '') as ResolutionStatusCategory | '',
        sequenceOrder: Number.isFinite(parsedSequenceOrder) ? parsedSequenceOrder : null,
        statusColor: row['statusColor'] ?? ''
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
