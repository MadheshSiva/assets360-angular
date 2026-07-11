import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementAssetTypeItem } from './asset-type.model';
import { MasterManagementAssetTypeService } from './asset-type.service';

interface MasterManagementAssetTypeRow extends MasterManagementAssetTypeItem {
  selected?: boolean;
}

interface MasterManagementAssetTypeColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-asset-type',
  imports: [CommonModule, FormsModule],
  templateUrl: './asset-type.html',
  styleUrls: ['./asset-type.css']
})
export class MasterManagementAssetType {
  searchTerm = '';

  columns: MasterManagementAssetTypeColumn[] = [
    { key: 'assetTypeId', label: 'Asset Type ID', visible: true },
    { key: 'assetTypeName', label: 'Asset Type Name', visible: true },
    { key: 'assetTypeCode', label: 'Asset Type Code', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementAssetTypeRow[] = [];
  filteredRecords: MasterManagementAssetTypeRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementAssetTypeRow | null = null;

  form: MasterManagementAssetTypeItem = this.emptyForm();

  constructor(private service: MasterManagementAssetTypeService) {
    this.refresh();
  }

  get statusMaster() {
    return this.service.statusMaster;
  }

  private emptyForm(): MasterManagementAssetTypeItem {
    return {
      assetTypeId: '',
      assetTypeName: '',
      assetTypeCode: '',
      description: '',
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

  toggleColumn(col: MasterManagementAssetTypeColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementAssetTypeRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementAssetTypeRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementAssetTypeRow[];
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
      this.service.updateRecord(this.editingRecord.assetTypeId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.assetTypeId));
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
