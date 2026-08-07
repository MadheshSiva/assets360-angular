import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { InspectionFailureReasonItem } from './failure-reason.model';
import { InspectionFailureReasonService } from './failure-reason.service';

interface InspectionFailureReasonRow extends InspectionFailureReasonItem {
  selected?: boolean;
}

interface InspectionFailureReasonColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-inspection-failure-reason',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './failure-reason.html',
  styleUrls: ['./failure-reason.css']
})
export class InspectionFailureReason {
  searchTerm = '';

  columns: InspectionFailureReasonColumn[] = [
    { key: 'failureReasonCode', label: 'Failure Reason Code', visible: true },
    { key: 'failureReason', label: 'Failure Reason', visible: true },
    { key: 'failureCategory', label: 'Failure Category', visible: true },
    { key: 'severity', label: 'Severity', visible: true },
    { key: 'correctiveActionRequired', label: 'Corrective Action Required', visible: true },
    { key: 'escalationRequired', label: 'Escalation Required', visible: true },
    { key: 'defaultResponsibleTeam', label: 'Default Responsible Team', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'failureReasonCode', label: 'Failure Reason Code' },
    { key: 'failureReason', label: 'Failure Reason' },
    { key: 'failureCategory', label: 'Failure Category' },
    { key: 'severity', label: 'Severity' },
    { key: 'correctiveActionRequired', label: 'Corrective Action Required' },
    { key: 'escalationRequired', label: 'Escalation Required' },
    { key: 'defaultResponsibleTeam', label: 'Default Responsible Team' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: InspectionFailureReasonRow[] = [];
  filteredRecords: InspectionFailureReasonRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: InspectionFailureReasonRow | null = null;

  form: InspectionFailureReasonItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: InspectionFailureReasonService,
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
      const match = this.records.find((r) => r.failureReason === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get failureCategoryMaster() {
    return this.service.failureCategoryMaster;
  }

  get severityMaster() {
    return this.service.severityMaster;
  }

  private emptyForm(): InspectionFailureReasonItem {
    return {
      failureReasonCode: '',
      failureReason: '',
      failureCategory: '',
      severity: '',
      correctiveActionRequired: false,
      escalationRequired: false,
      defaultResponsibleTeam: '',
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

  toggleColumn(col: InspectionFailureReasonColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): InspectionFailureReasonRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: InspectionFailureReasonRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as InspectionFailureReasonRow[];
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

  editRow(record: InspectionFailureReasonRow): void {
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
      this.service.updateRecord(this.editingRecord.failureReasonCode, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.failureReasonCode));
    this.refresh();
  }

  deleteRow(record: InspectionFailureReasonRow): void {
    this.service.deleteRecords([record.failureReasonCode]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const correctiveRaw = (row['correctiveActionRequired'] ?? '').trim().toLowerCase();
      const escalationRaw = (row['escalationRequired'] ?? '').trim().toLowerCase();
      const statusRaw = (row['status'] ?? '').trim().toLowerCase();
      this.service.addRecord({
        failureReasonCode: row['failureReasonCode'] ?? '',
        failureReason: row['failureReason'] ?? '',
        failureCategory: row['failureCategory'] ?? '',
        severity: row['severity'] ?? '',
        correctiveActionRequired: correctiveRaw === 'yes' || correctiveRaw === 'true',
        escalationRequired: escalationRaw === 'yes' || escalationRaw === 'true',
        defaultResponsibleTeam: row['defaultResponsibleTeam'] ?? '',
        status: statusRaw === 'yes' || statusRaw === 'true' || statusRaw === 'active'
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
