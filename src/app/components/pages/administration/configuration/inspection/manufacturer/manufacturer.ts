import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { InspectionManufacturerItem, InspectionManufacturerRow } from './manufacturer.model';
import { InspectionManufacturerService } from './manufacturer.service';

interface InspectionManufacturerColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-inspection-manufacturer',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './manufacturer.html',
  styleUrls: ['./manufacturer.css']
})
export class InspectionManufacturer {
  searchTerm = '';

  columns: InspectionManufacturerColumn[] = [
    { key: 'manufacturerCode', label: 'Manufacturer Code', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'manufacturerName', label: 'Manufacturer Name', visible: true },
    { key: 'contactPerson', label: 'Contact Person', visible: true },
    { key: 'email', label: 'Email', visible: true },
    { key: 'phone', label: 'Phone', visible: true },
    { key: 'address', label: 'Address', visible: true },
    { key: 'website', label: 'Website', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'manufacturerCode', label: 'Manufacturer Code' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'manufacturerName', label: 'Manufacturer Name' },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'website', label: 'Website' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: InspectionManufacturerRow[] = [];
  filteredRecords: InspectionManufacturerRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: InspectionManufacturerRow | null = null;

  form: InspectionManufacturerItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: InspectionManufacturerService,
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
      const match = this.records.find((r) => r.manufacturerName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  private emptyForm(): InspectionManufacturerItem {
    return {
      manufacturerCode: '',
      assetId: '',
      assetName: '',
      manufacturerName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      website: '',
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

  toggleColumn(col: InspectionManufacturerColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): InspectionManufacturerRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: InspectionManufacturerRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as InspectionManufacturerRow[];
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

  editRow(record: InspectionManufacturerRow): void {
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
      this.service.updateRecord(this.editingRecord.manufacturerCode, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.manufacturerCode));
    this.refresh();
  }

  deleteRow(record: InspectionManufacturerRow): void {
    this.service.deleteRecords([record.manufacturerCode]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const activeRaw = (row['status'] ?? '').trim().toLowerCase();
      this.service.addRecord({
        manufacturerCode: row['manufacturerCode'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        manufacturerName: row['manufacturerName'] ?? '',
        contactPerson: row['contactPerson'] ?? '',
        email: row['email'] ?? '',
        phone: row['phone'] ?? '',
        address: row['address'] ?? '',
        website: row['website'] ?? '',
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
