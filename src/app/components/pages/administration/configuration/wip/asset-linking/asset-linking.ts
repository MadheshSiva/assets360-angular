import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetLinking } from './asset-linking.model';
import { AssetLinkingService } from './asset-linking.service';

interface AssetLinkingColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-wip-asset-linking',
  imports: [CommonModule, FormsModule],
  templateUrl: './asset-linking.html',
  styleUrls: ['./asset-linking.css']
})
export class WipAssetLinking {
  searchTerm = '';

  columns: AssetLinkingColumn[] = [
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'assetType', label: 'Asset Type', visible: true },
    { key: 'serialNumber', label: 'Serial Number', visible: true },
    { key: 'rfidTag', label: 'RFID Tag', visible: true },
    { key: 'iotDeviceId', label: 'IoT Device ID', visible: true },
    { key: 'currentStatus', label: 'Current Status', visible: true },
    { key: 'utilizationStatus', label: 'Utilization Status', visible: true },
    { key: 'lastMaintenanceDate', label: 'Last Maintenance Date', visible: true },
    { key: 'condition', label: 'Condition', visible: true }
  ];

  showColumnPicker = false;

  records: AssetLinking[] = [];
  filteredRecords: AssetLinking[] = [];

  private selectedIds = new Set<string>();

  showFormModal = false;
  isEditMode = false;
  private editingRecord: AssetLinking | null = null;

  form: AssetLinking = this.emptyForm();

  constructor(private service: AssetLinkingService) {
    this.refresh();
  }

  get assetTypeMaster() {
    return this.service.assetTypeMaster;
  }

  get currentStatusMaster() {
    return this.service.currentStatusMaster;
  }

  get utilizationStatusMaster() {
    return this.service.utilizationStatusMaster;
  }

  get conditionMaster() {
    return this.service.conditionMaster;
  }

  private emptyForm(): AssetLinking {
    return {
      assetId: '',
      assetName: '',
      assetType: '',
      serialNumber: '',
      rfidTag: '',
      iotDeviceId: '',
      currentStatus: '',
      utilizationStatus: '',
      lastMaintenanceDate: '',
      condition: ''
    };
  }

  private refresh(): void {
    this.records = this.service.getAssets();
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

  toggleColumn(col: AssetLinkingColumn): void {
    col.visible = !col.visible;
  }

  isSelected(record: AssetLinking): boolean {
    return this.selectedIds.has(record.assetId);
  }

  get selectedRecords(): AssetLinking[] {
    return this.filteredRecords.filter((r) => this.selectedIds.has(r.assetId));
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => this.selectedIds.has(r.assetId));
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.filteredRecords.forEach((r) => this.selectedIds.delete(r.assetId));
    } else {
      this.filteredRecords.forEach((r) => this.selectedIds.add(r.assetId));
    }
  }

  toggleSelectRecord(record: AssetLinking): void {
    if (this.selectedIds.has(record.assetId)) {
      this.selectedIds.delete(record.assetId);
    } else {
      this.selectedIds.add(record.assetId);
    }
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm);
  }

  onRefresh(): void {
    this.searchTerm = '';
    this.selectedIds.clear();
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
    this.form = { ...record };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
  }

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.assetId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    const ids = this.selectedRecords.map((r) => r.assetId);
    this.service.deleteRecords(ids);
    ids.forEach((id) => this.selectedIds.delete(id));
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
