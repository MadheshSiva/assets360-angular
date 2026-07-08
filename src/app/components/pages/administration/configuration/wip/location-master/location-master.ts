import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationMaster } from './location-master.model';
import { LocationMasterService } from './location-master.service';

interface LocationMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

interface LocationMasterRow extends LocationMaster {
  selected?: boolean;
}

type LocationMasterForm = LocationMaster;

@Component({
  standalone: true,
  selector: 'app-wip-location-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './location-master.html',
  styleUrls: ['./location-master.css']
})
export class WipLocationMaster {
  searchTerm = '';

  columns: LocationMasterColumn[] = [
    { key: 'locationId', label: 'Location ID', visible: true },
    { key: 'site', label: 'Site', visible: true },
    { key: 'building', label: 'Building', visible: true },
    { key: 'floor', label: 'Floor', visible: true },
    { key: 'zone', label: 'Zone', visible: true },
    { key: 'geoCoordinates', label: 'Geo Coordinates', visible: true },
    { key: 'parentLocationId', label: 'Parent Location', visible: true }
  ];

  showColumnPicker = false;

  records: LocationMasterRow[] = [];
  filteredRecords: LocationMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: LocationMasterRow | null = null;

  form: LocationMasterForm = this.emptyForm();

  constructor(private service: LocationMasterService) {
    this.refresh();
  }

  private emptyForm(): LocationMasterForm {
    return {
      locationId: '',
      site: '',
      building: '',
      floor: '',
      zone: '',
      geoCoordinates: '',
      parentLocationId: ''
    };
  }

  private refresh(): void {
    this.records = this.service.getLocations();
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

  toggleColumn(col: LocationMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): LocationMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: LocationMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm);
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

  /** Options for the Parent Location dropdown: every other location, excluding the one currently being edited. */
  get parentLocationOptions(): LocationMaster[] {
    const currentId = this.isEditMode ? this.editingRecord?.locationId : null;
    return this.records.filter((l) => l.locationId !== currentId);
  }

  parentLocationName(parentLocationId: string): string {
    if (!parentLocationId) return '-';
    const parent = this.records.find((l) => l.locationId === parentLocationId);
    return parent ? parent.site || parent.locationId : parentLocationId;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
