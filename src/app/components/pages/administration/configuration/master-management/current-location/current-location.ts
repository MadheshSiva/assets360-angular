import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementCurrentLocationItem } from './current-location.model';
import { MasterManagementCurrentLocationService } from './current-location.service';

interface MasterManagementCurrentLocationRow extends MasterManagementCurrentLocationItem {
  selected?: boolean;
}

interface MasterManagementCurrentLocationColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-current-location',
  imports: [CommonModule, FormsModule],
  templateUrl: './current-location.html',
  styleUrls: ['./current-location.css']
})
export class MasterManagementCurrentLocation {
  searchTerm = '';

  columns: MasterManagementCurrentLocationColumn[] = [
    { key: 'locationId', label: 'Location ID', visible: true },
    { key: 'currentLocation', label: 'Current Location', visible: true },
    { key: 'isActive', label: 'Active', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementCurrentLocationRow[] = [];
  filteredRecords: MasterManagementCurrentLocationRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementCurrentLocationRow | null = null;

  form: MasterManagementCurrentLocationItem = this.emptyForm();

  constructor(private service: MasterManagementCurrentLocationService) {
    this.refresh();
  }

  get siteMaster(): string[] {
    return this.service.siteMaster;
  }

  get buildingOptions(): string[] {
    return this.service.getBuildings(this.form.site);
  }

  get zoneOptions(): string[] {
    return this.service.getZones(this.form.site, this.form.building);
  }

  get roomOptions(): string[] {
    return this.service.getRooms(this.form.site, this.form.building, this.form.zone);
  }

  onSiteChange(): void {
    this.form.building = '';
    this.form.zone = '';
    this.form.room = '';
  }

  onBuildingChange(): void {
    this.form.zone = '';
    this.form.room = '';
  }

  onZoneChange(): void {
    this.form.room = '';
  }

  locationPath(record: MasterManagementCurrentLocationItem): string {
    return [record.site, record.building, record.zone, record.room].filter(Boolean).join(' → ');
  }

  private emptyForm(): MasterManagementCurrentLocationItem {
    return {
      locationId: '',
      site: '',
      building: '',
      zone: '',
      room: '',
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

  toggleColumn(col: MasterManagementCurrentLocationColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementCurrentLocationRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementCurrentLocationRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementCurrentLocationRow[];
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
      this.service.updateRecord(this.editingRecord.locationId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.locationId));
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
