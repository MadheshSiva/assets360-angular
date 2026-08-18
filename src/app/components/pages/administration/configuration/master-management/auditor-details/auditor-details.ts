import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
import { MasterManagementAuditorDetailsItem } from './auditor-details.model';
import { MasterManagementAuditorDetailsService } from './auditor-details.service';

interface MasterManagementAuditorDetailsRow extends MasterManagementAuditorDetailsItem {
  selected?: boolean;
}

interface MasterManagementAuditorDetailsColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-auditor-details',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './auditor-details.html',
  styleUrls: ['./auditor-details.css']
})
export class MasterManagementAuditorDetails {
  searchTerm = '';

  columns: MasterManagementAuditorDetailsColumn[] = [
    { key: 'auditorId', label: 'Auditor ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'auditorName', label: 'Auditor Name', visible: true },
    { key: 'employeeCode', label: 'Employee Code', visible: true },
    { key: 'department', label: 'Department', visible: true },
    { key: 'email', label: 'Email', visible: true },
    { key: 'phone', label: 'Phone', visible: true },
    { key: 'certificationType', label: 'Certification Type', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'auditorId', label: 'Auditor ID' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'auditorName', label: 'Auditor Name' },
    { key: 'employeeCode', label: 'Employee Code' },
    { key: 'department', label: 'Department' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'certificationType', label: 'Certification Type' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: MasterManagementAuditorDetailsRow[] = [];
  filteredRecords: MasterManagementAuditorDetailsRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementAuditorDetailsRow | null = null;

  form: MasterManagementAuditorDetailsItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementAuditorDetailsService,
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
      const match = this.records.find((r) => r.auditorName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get departmentMaster() {
    return this.service.departmentMaster;
  }

  get certificationTypeMaster() {
    return this.service.certificationTypeMaster;
  }

  get statusMaster() {
    return this.service.statusMaster;
  }

  private emptyForm(): MasterManagementAuditorDetailsItem {
    return {
      auditorId: '',
      assetId: '',
      assetName: '',
      auditorName: '',
      employeeCode: '',
      department: '',
      email: '',
      phone: '',
      certificationType: '',
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

  toggleColumn(col: MasterManagementAuditorDetailsColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementAuditorDetailsRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementAuditorDetailsRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementAuditorDetailsRow[];
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

  editRow(record: MasterManagementAuditorDetailsRow): void {
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
      this.service.updateRecord(this.editingRecord.auditorId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.auditorId));
    this.refresh();
  }

  deleteRow(record: MasterManagementAuditorDetailsRow): void {
    this.service.deleteRecords([record.auditorId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.service.addRecord({
        auditorId: row['auditorId'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        auditorName: row['auditorName'] ?? '',
        employeeCode: row['employeeCode'] ?? '',
        department: (row['department'] ?? '') as MasterManagementAuditorDetailsItem['department'],
        email: row['email'] ?? '',
        phone: row['phone'] ?? '',
        certificationType: (row['certificationType'] ?? '') as MasterManagementAuditorDetailsItem['certificationType'],
        status: (row['status'] ?? '') as MasterManagementAuditorDetailsItem['status']
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
