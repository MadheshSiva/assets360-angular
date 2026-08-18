import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
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
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
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

  readonly importColumns: ImportColumn[] = [
    { key: 'locationId', label: 'Location ID' },
    { key: 'currentLocation', label: 'Current Location' },
    { key: 'isActive', label: 'Active' }
  ];

  showImportModal = false;

  records: MasterManagementCurrentLocationRow[] = [];
  filteredRecords: MasterManagementCurrentLocationRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementCurrentLocationRow | null = null;

  form: MasterManagementCurrentLocationItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementCurrentLocationService,
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
      const match = this.records.find((r) => this.locationPath(r) === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
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
    this.editRow(this.selectedRecords[0]);
  }

  editRow(record: MasterManagementCurrentLocationRow): void {
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

  deleteRow(record: MasterManagementCurrentLocationRow): void {
    this.service.deleteRecords([record.locationId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    this.records = [
      ...this.records,
      ...rows.map((row) => {
        const path = (row['currentLocation'] ?? '').split('→').map((part) => part.trim());
        const [site = '', building = '', zone = '', room = ''] = path;
        return {
          locationId: row['locationId'] ?? '',
          site,
          building,
          zone,
          room,
          isActive: /^(true|yes|1)$/i.test(row['isActive'] ?? '')
        };
      })
    ];
    this.onSearch();
    this.showImportModal = false;
  }

  onDownload(): void {
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
