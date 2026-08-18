import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
import { MasterManagementApiSyncStatusMasterItem, ApiSyncStatusType, ApiSyncFinalFlag } from './api-sync-status-master.model';
import { MasterManagementApiSyncStatusMasterService } from './api-sync-status-master.service';

interface MasterManagementApiSyncStatusMasterRow extends MasterManagementApiSyncStatusMasterItem {
  selected?: boolean;
}

interface MasterManagementApiSyncStatusMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-api-sync-status-master',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './api-sync-status-master.html',
  styleUrls: ['./api-sync-status-master.css']
})
export class MasterManagementApiSyncStatusMaster {
  searchTerm = '';

  columns: MasterManagementApiSyncStatusMasterColumn[] = [
    { key: 'syncStatusId', label: 'Status ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'statusName', label: 'Status Name', visible: true },
    { key: 'statusCode', label: 'Status Code', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'statusType', label: 'Status Type', visible: true },
    { key: 'isFinalStatus', label: 'Is Final Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'syncStatusId', label: 'Status ID' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'statusName', label: 'Status Name' },
    { key: 'statusCode', label: 'Status Code' },
    { key: 'description', label: 'Description' },
    { key: 'statusType', label: 'Status Type' },
    { key: 'isFinalStatus', label: 'Is Final Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: MasterManagementApiSyncStatusMasterRow[] = [];
  filteredRecords: MasterManagementApiSyncStatusMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementApiSyncStatusMasterRow | null = null;

  form: MasterManagementApiSyncStatusMasterItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementApiSyncStatusMasterService,
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

  get statusTypeMaster() {
    return this.service.statusTypeMaster;
  }

  get finalStatusMaster() {
    return this.service.finalStatusMaster;
  }

  private emptyForm(): MasterManagementApiSyncStatusMasterItem {
    return {
      syncStatusId: '',
      assetId: '',
      assetName: '',
      statusName: '',
      statusCode: '',
      description: '',
      statusType: '',
      isFinalStatus: ''
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

  toggleColumn(col: MasterManagementApiSyncStatusMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementApiSyncStatusMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementApiSyncStatusMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementApiSyncStatusMasterRow[];
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

  editRow(record: MasterManagementApiSyncStatusMasterRow): void {
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
      this.service.updateRecord(this.editingRecord.syncStatusId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.syncStatusId));
    this.refresh();
  }

  deleteRow(record: MasterManagementApiSyncStatusMasterRow): void {
    this.service.deleteRecords([record.syncStatusId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.service.addRecord({
        syncStatusId: row['syncStatusId'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        statusName: row['statusName'] ?? '',
        statusCode: row['statusCode'] ?? '',
        description: row['description'] ?? '',
        statusType: (row['statusType'] ?? '') as ApiSyncStatusType | '',
        isFinalStatus: (row['isFinalStatus'] ?? '') as ApiSyncFinalFlag | ''
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
