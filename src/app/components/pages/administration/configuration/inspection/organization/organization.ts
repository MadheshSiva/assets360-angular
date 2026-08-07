import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { InspectionOrganizationItem, InspectionOrganizationRow } from './organization.model';
import { InspectionOrganizationService } from './organization.service';

interface InspectionOrganizationColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-inspection-organization',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './organization.html',
  styleUrls: ['./organization.css']
})
export class InspectionOrganization {
  searchTerm = '';

  columns: InspectionOrganizationColumn[] = [
    { key: 'organizationCode', label: 'Organization Code', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'organizationName', label: 'Organization Name', visible: true },
    { key: 'legalName', label: 'Legal Name', visible: true },
    { key: 'logo', label: 'Logo', visible: true },
    { key: 'address', label: 'Address', visible: true },
    { key: 'country', label: 'Country', visible: true },
    { key: 'state', label: 'State', visible: true },
    { key: 'city', label: 'City', visible: true },
    { key: 'postalCode', label: 'Postal Code', visible: true },
    { key: 'contactPerson', label: 'Contact Person', visible: true },
    { key: 'email', label: 'Email', visible: true },
    { key: 'phoneNumber', label: 'Phone Number', visible: true },
    { key: 'timeZone', label: 'Time Zone', visible: true },
    { key: 'dateFormat', label: 'Date Format', visible: true },
    { key: 'currency', label: 'Currency', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'organizationCode', label: 'Organization Code' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'organizationName', label: 'Organization Name' },
    { key: 'legalName', label: 'Legal Name' },
    { key: 'logo', label: 'Logo' },
    { key: 'address', label: 'Address' },
    { key: 'country', label: 'Country' },
    { key: 'state', label: 'State' },
    { key: 'city', label: 'City' },
    { key: 'postalCode', label: 'Postal Code' },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone Number' },
    { key: 'timeZone', label: 'Time Zone' },
    { key: 'dateFormat', label: 'Date Format' },
    { key: 'currency', label: 'Currency' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: InspectionOrganizationRow[] = [];
  filteredRecords: InspectionOrganizationRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: InspectionOrganizationRow | null = null;

  form: InspectionOrganizationItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: InspectionOrganizationService,
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
      const match = this.records.find((r) => r.organizationName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get timeZoneMaster() {
    return this.service.timeZoneMaster;
  }

  get currencyMaster() {
    return this.service.currencyMaster;
  }

  get dateFormatMaster() {
    return this.service.dateFormatMaster;
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.logo = input.files && input.files[0] ? input.files[0].name : '';
  }

  private emptyForm(): InspectionOrganizationItem {
    return {
      organizationCode: '',
      assetId: '',
      assetName: '',
      organizationName: '',
      legalName: '',
      logo: '',
      address: '',
      country: '',
      state: '',
      city: '',
      postalCode: '',
      contactPerson: '',
      email: '',
      phoneNumber: '',
      timeZone: '',
      dateFormat: '',
      currency: '',
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

  toggleColumn(col: InspectionOrganizationColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): InspectionOrganizationRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: InspectionOrganizationRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as InspectionOrganizationRow[];
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

  editRow(record: InspectionOrganizationRow): void {
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
      this.service.updateRecord(this.editingRecord.organizationCode, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.organizationCode));
    this.refresh();
  }

  deleteRow(record: InspectionOrganizationRow): void {
    this.service.deleteRecords([record.organizationCode]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const activeRaw = (row['status'] ?? '').trim().toLowerCase();
      this.service.addRecord({
        organizationCode: row['organizationCode'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        organizationName: row['organizationName'] ?? '',
        legalName: row['legalName'] ?? '',
        logo: row['logo'] ?? '',
        address: row['address'] ?? '',
        country: row['country'] ?? '',
        state: row['state'] ?? '',
        city: row['city'] ?? '',
        postalCode: row['postalCode'] ?? '',
        contactPerson: row['contactPerson'] ?? '',
        email: row['email'] ?? '',
        phoneNumber: row['phoneNumber'] ?? '',
        timeZone: row['timeZone'] ?? '',
        dateFormat: row['dateFormat'] ?? '',
        currency: row['currency'] ?? '',
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
