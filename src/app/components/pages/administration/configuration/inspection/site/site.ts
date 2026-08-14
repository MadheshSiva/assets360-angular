import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { InspectionSiteItem, InspectionSiteRow } from './site.model';
import { InspectionSiteService } from './site.service';

interface InspectionSiteColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-inspection-site',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions, MasterLinkIcons],
  templateUrl: './site.html',
  styleUrls: ['./site.css']
})
export class InspectionSite {
  searchTerm = '';

  columns: InspectionSiteColumn[] = [
    { key: 'siteCode', label: 'Site Code', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'siteName', label: 'Site Name', visible: true },
    { key: 'organization', label: 'Organization', visible: true },
    { key: 'businessUnit', label: 'Business Unit', visible: true },
    { key: 'siteType', label: 'Site Type', visible: true },
    { key: 'address', label: 'Address', visible: true },
    { key: 'country', label: 'Country', visible: true },
    { key: 'state', label: 'State', visible: true },
    { key: 'city', label: 'City', visible: true },
    { key: 'gpsLatitude', label: 'GPS Latitude', visible: true },
    { key: 'gpsLongitude', label: 'GPS Longitude', visible: true },
    { key: 'siteManager', label: 'Site Manager', visible: true },
    { key: 'contactDetails', label: 'Contact Details', visible: true },
    { key: 'operatingHours', label: 'Operating Hours', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'siteCode', label: 'Site Code' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'siteName', label: 'Site Name' },
    { key: 'organization', label: 'Organization' },
    { key: 'businessUnit', label: 'Business Unit' },
    { key: 'siteType', label: 'Site Type' },
    { key: 'address', label: 'Address' },
    { key: 'country', label: 'Country' },
    { key: 'state', label: 'State' },
    { key: 'city', label: 'City' },
    { key: 'gpsLatitude', label: 'GPS Latitude' },
    { key: 'gpsLongitude', label: 'GPS Longitude' },
    { key: 'siteManager', label: 'Site Manager' },
    { key: 'contactDetails', label: 'Contact Details' },
    { key: 'operatingHours', label: 'Operating Hours' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: InspectionSiteRow[] = [];
  filteredRecords: InspectionSiteRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: InspectionSiteRow | null = null;

  form: InspectionSiteItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: InspectionSiteService,
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
      const match = this.records.find((r) => r.siteName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get organizationMaster() {
    return this.service.organizationMaster;
  }

  get businessUnitMaster() {
    return this.service.businessUnitMaster;
  }

  get siteTypeMaster() {
    return this.service.siteTypeMaster;
  }

  private emptyForm(): InspectionSiteItem {
    return {
      siteCode: '',
      assetId: '',
      assetName: '',
      siteName: '',
      organization: '',
      businessUnit: '',
      siteType: '',
      address: '',
      country: '',
      state: '',
      city: '',
      gpsLatitude: '',
      gpsLongitude: '',
      siteManager: '',
      contactDetails: '',
      operatingHours: '',
      status: true
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

  toggleColumn(col: InspectionSiteColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): InspectionSiteRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: InspectionSiteRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as InspectionSiteRow[];
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

  editRow(record: InspectionSiteRow): void {
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
      this.service.updateRecord(this.editingRecord.siteCode, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.siteCode));
    this.refresh();
  }

  deleteRow(record: InspectionSiteRow): void {
    this.service.deleteRecords([record.siteCode]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const activeRaw = (row['status'] ?? '').trim().toLowerCase();
      this.service.addRecord({
        siteCode: row['siteCode'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        siteName: row['siteName'] ?? '',
        organization: row['organization'] ?? '',
        businessUnit: row['businessUnit'] ?? '',
        siteType: row['siteType'] ?? '',
        address: row['address'] ?? '',
        country: row['country'] ?? '',
        state: row['state'] ?? '',
        city: row['city'] ?? '',
        gpsLatitude: row['gpsLatitude'] ?? '',
        gpsLongitude: row['gpsLongitude'] ?? '',
        siteManager: row['siteManager'] ?? '',
        contactDetails: row['contactDetails'] ?? '',
        operatingHours: row['operatingHours'] ?? '',
        status: activeRaw === 'yes' || activeRaw === 'true'
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
