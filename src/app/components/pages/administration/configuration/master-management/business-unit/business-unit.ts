import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { MasterManagementBusinessUnitItem, MasterManagementBusinessUnitRow } from './business-unit.model';
import { MasterManagementBusinessUnitService } from './business-unit.service';

interface MasterManagementBusinessUnitColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-business-unit',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions, MasterLinkIcons],
  templateUrl: './business-unit.html',
  styleUrls: ['./business-unit.css']
})
export class MasterManagementBusinessUnit {
  searchTerm = '';

  columns: MasterManagementBusinessUnitColumn[] = [
    { key: 'businessUnitCode', label: 'Business Unit Code', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'businessUnitName', label: 'Business Unit Name', visible: true },
    { key: 'organization', label: 'Organization', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'businessUnitHead', label: 'Business Unit Head', visible: true },
    { key: 'email', label: 'Email', visible: true },
    { key: 'phone', label: 'Phone', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'businessUnitCode', label: 'Business Unit Code' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'businessUnitName', label: 'Business Unit Name' },
    { key: 'organization', label: 'Organization' },
    { key: 'description', label: 'Description' },
    { key: 'businessUnitHead', label: 'Business Unit Head' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: MasterManagementBusinessUnitRow[] = [];
  filteredRecords: MasterManagementBusinessUnitRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementBusinessUnitRow | null = null;

  form: MasterManagementBusinessUnitItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementBusinessUnitService,
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
      const match = this.records.find((r) => r.businessUnitName === value);
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

  private emptyForm(): MasterManagementBusinessUnitItem {
    return {
      businessUnitCode: '',
      assetId: '',
      assetName: '',
      businessUnitName: '',
      organization: '',
      description: '',
      businessUnitHead: '',
      email: '',
      phone: '',
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

  toggleColumn(col: MasterManagementBusinessUnitColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementBusinessUnitRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementBusinessUnitRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementBusinessUnitRow[];
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

  editRow(record: MasterManagementBusinessUnitRow): void {
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
      this.service.updateRecord(this.editingRecord.businessUnitCode, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.businessUnitCode));
    this.refresh();
  }

  deleteRow(record: MasterManagementBusinessUnitRow): void {
    this.service.deleteRecords([record.businessUnitCode]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const activeRaw = (row['status'] ?? '').trim().toLowerCase();
      this.service.addRecord({
        businessUnitCode: row['businessUnitCode'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        businessUnitName: row['businessUnitName'] ?? '',
        organization: row['organization'] ?? '',
        description: row['description'] ?? '',
        businessUnitHead: row['businessUnitHead'] ?? '',
        email: row['email'] ?? '',
        phone: row['phone'] ?? '',
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
