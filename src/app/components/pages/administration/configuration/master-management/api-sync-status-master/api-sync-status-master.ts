import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementApiSyncStatusMasterItem } from './api-sync-status-master.model';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './api-sync-status-master.html',
  styleUrls: ['./api-sync-status-master.css']
})
export class MasterManagementApiSyncStatusMaster {
  searchTerm = '';

  columns: MasterManagementApiSyncStatusMasterColumn[] = [
    { key: 'syncStatusId', label: 'Status ID', visible: true },
    { key: 'statusName', label: 'Status Name', visible: true },
    { key: 'statusCode', label: 'Status Code', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'statusType', label: 'Status Type', visible: true },
    { key: 'isFinalStatus', label: 'Is Final Status', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementApiSyncStatusMasterRow[] = [];
  filteredRecords: MasterManagementApiSyncStatusMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementApiSyncStatusMasterRow | null = null;

  form: MasterManagementApiSyncStatusMasterItem = this.emptyForm();

  constructor(private service: MasterManagementApiSyncStatusMasterService) {
    this.refresh();
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
    const record = this.selectedRecords[0];
    this.isEditMode = true;
    this.editingRecord = record;
    const { selected, ...rest } = record;
    this.form = { ...rest };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
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

  onUpload(): void {
  }

  onDownload(): void {
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
