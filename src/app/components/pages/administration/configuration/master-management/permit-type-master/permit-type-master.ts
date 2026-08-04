import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { MasterManagementPermitTypeMasterItem } from './permit-type-master.model';
import { MasterManagementPermitTypeMasterService } from './permit-type-master.service';

interface MasterManagementPermitTypeMasterRow extends MasterManagementPermitTypeMasterItem {
  selected?: boolean;
}

interface MasterManagementPermitTypeMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-permit-type-master',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './permit-type-master.html',
  styleUrls: ['./permit-type-master.css']
})
export class MasterManagementPermitTypeMaster {
  searchTerm = '';

  columns: MasterManagementPermitTypeMasterColumn[] = [
    { key: 'permitTypeId', label: 'Permit Type ID', visible: true },
    { key: 'permitName', label: 'Permit Name', visible: true },
    { key: 'validityDays', label: 'Validity Days', visible: true },
    { key: 'isApprovalRequired', label: 'Is Approval Required', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'permitTypeId', label: 'Permit Type ID' },
    { key: 'permitName', label: 'Permit Name' },
    { key: 'validityDays', label: 'Validity Days' },
    { key: 'isApprovalRequired', label: 'Is Approval Required' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: MasterManagementPermitTypeMasterRow[] = [];
  filteredRecords: MasterManagementPermitTypeMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementPermitTypeMasterRow | null = null;

  form: MasterManagementPermitTypeMasterItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementPermitTypeMasterService,
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
      const match = this.records.find((r) => r.permitName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  private emptyForm(): MasterManagementPermitTypeMasterItem {
    return {
      permitTypeId: '',
      permitName: '',
      validityDays: null,
      isApprovalRequired: true
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

  toggleColumn(col: MasterManagementPermitTypeMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementPermitTypeMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementPermitTypeMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementPermitTypeMasterRow[];
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

  editRow(record: MasterManagementPermitTypeMasterRow): void {
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
      this.service.updateRecord(this.editingRecord.permitTypeId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.permitTypeId));
    this.refresh();
  }

  deleteRow(record: MasterManagementPermitTypeMasterRow): void {
    this.service.deleteRecords([record.permitTypeId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const validityDaysRaw = (row['validityDays'] ?? '').trim();
      const parsedValidityDays = validityDaysRaw ? Number(validityDaysRaw) : NaN;
      const approvalRaw = (row['isApprovalRequired'] ?? '').trim().toLowerCase();
      this.service.addRecord({
        permitTypeId: row['permitTypeId'] ?? '',
        permitName: row['permitName'] ?? '',
        validityDays: Number.isFinite(parsedValidityDays) ? parsedValidityDays : null,
        isApprovalRequired: approvalRaw === 'yes' || approvalRaw === 'true'
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
