import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { MasterManagementAlertTypeItem, AlertCategory, AlertSeverity, AlertNotificationType, AlertStatus } from './alert-type.model';
import { MasterManagementAlertTypeService } from './alert-type.service';

interface MasterManagementAlertTypeRow extends MasterManagementAlertTypeItem {
  selected?: boolean;
}

interface MasterManagementAlertTypeColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-alert-type',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './alert-type.html',
  styleUrls: ['./alert-type.css']
})
export class MasterManagementAlertType {
  searchTerm = '';

  columns: MasterManagementAlertTypeColumn[] = [
    { key: 'alertTypeId', label: 'Alert Type ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'alertName', label: 'Alert Name', visible: true },
    { key: 'alertCode', label: 'Alert Code', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'category', label: 'Category', visible: true },
    { key: 'severity', label: 'Severity', visible: true },
    { key: 'triggerCondition', label: 'Trigger Condition', visible: true },
    { key: 'notificationType', label: 'Notification Type', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'alertTypeId', label: 'Alert Type ID' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'alertName', label: 'Alert Name' },
    { key: 'alertCode', label: 'Alert Code' },
    { key: 'description', label: 'Description' },
    { key: 'category', label: 'Category' },
    { key: 'severity', label: 'Severity' },
    { key: 'triggerCondition', label: 'Trigger Condition' },
    { key: 'notificationType', label: 'Notification Type' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: MasterManagementAlertTypeRow[] = [];
  filteredRecords: MasterManagementAlertTypeRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementAlertTypeRow | null = null;

  form: MasterManagementAlertTypeItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementAlertTypeService,
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
      const match = this.records.find((r) => r.alertName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get categoryMaster() {
    return this.service.categoryMaster;
  }

  get severityMaster() {
    return this.service.severityMaster;
  }

  get notificationTypeMaster() {
    return this.service.notificationTypeMaster;
  }

  get statusMaster() {
    return this.service.statusMaster;
  }

  private emptyForm(): MasterManagementAlertTypeItem {
    return {
      alertTypeId: '',
      assetId: '',
      assetName: '',
      alertName: '',
      alertCode: '',
      description: '',
      category: '',
      severity: '',
      triggerCondition: '',
      notificationType: '',
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

  toggleColumn(col: MasterManagementAlertTypeColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementAlertTypeRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementAlertTypeRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementAlertTypeRow[];
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

  editRow(record: MasterManagementAlertTypeRow): void {
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
      this.service.updateRecord(this.editingRecord.alertTypeId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.alertTypeId));
    this.refresh();
  }

  deleteRow(record: MasterManagementAlertTypeRow): void {
    this.service.deleteRecords([record.alertTypeId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.service.addRecord({
        alertTypeId: row['alertTypeId'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        alertName: row['alertName'] ?? '',
        alertCode: row['alertCode'] ?? '',
        description: row['description'] ?? '',
        category: (row['category'] ?? '') as AlertCategory | '',
        severity: (row['severity'] ?? '') as AlertSeverity | '',
        triggerCondition: row['triggerCondition'] ?? '',
        notificationType: (row['notificationType'] ?? '') as AlertNotificationType | '',
        status: (row['status'] ?? '') as AlertStatus | ''
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
