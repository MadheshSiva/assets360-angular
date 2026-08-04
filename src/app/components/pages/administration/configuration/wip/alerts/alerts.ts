import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { Alert, AlertForm, AlertNotificationChannel, AlertType } from './alerts.model';
import { AlertService } from './alerts.service';

interface AlertColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-wip-alerts',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './alerts.html',
  styleUrls: ['./alerts.css']
})
export class WipAlerts {
  searchTerm = '';

  columns: AlertColumn[] = [
    { key: 'alertId', label: 'Alert ID', visible: true },
    { key: 'alertType', label: 'Alert Type', visible: true },
    { key: 'triggerCondition', label: 'Trigger Condition', visible: true },
    { key: 'notificationChannel', label: 'Notification Channel', visible: true },
    { key: 'recipientRole', label: 'Recipient Role', visible: true },
    { key: 'escalationLevel', label: 'Escalation Level', visible: true }
  ];

  showColumnPicker = false;

  readonly importColumns: ImportColumn[] = this.columns.map(({ key, label }) => ({ key, label }));

  showImportModal = false;

  records: Alert[] = [];
  filteredRecords: Alert[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: Alert | null = null;

  form: AlertForm = this.emptyForm();

  constructor(private service: AlertService) {
    this.refresh();
  }

  get alertTypeMaster() {
    return this.service.alertTypeMaster;
  }

  get notificationChannelMaster() {
    return this.service.notificationChannelMaster;
  }

  get roleMaster() {
    return this.service.roleMaster;
  }

  private emptyForm(): AlertForm {
    return {
      alertId: '',
      alertType: '',
      triggerCondition: '',
      notificationChannel: [],
      recipientRole: '',
      escalationLevel: null
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

  toggleColumn(col: AlertColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): Alert[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: Alert): void {
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
    this.editRow(this.selectedRecords[0]);
  }

  editRow(record: Alert): void {
    this.isEditMode = true;
    this.editingRecord = record;
    const { selected, ...rest } = record;
    this.form = { ...rest, notificationChannel: [...rest.notificationChannel] };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
  }

  isChannelSelected(channel: string): boolean {
    return this.form.notificationChannel.includes(channel as any);
  }

  toggleChannel(channel: string): void {
    this.form.notificationChannel = this.isChannelSelected(channel)
      ? this.form.notificationChannel.filter((c) => c !== channel)
      : [...this.form.notificationChannel, channel as any];
  }

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.alertId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.alertId));
    this.refresh();
  }

  deleteRow(record: Alert): void {
    this.service.deleteRecords([record.alertId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const notificationChannel = (row['notificationChannel'] ?? '')
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0) as AlertNotificationChannel[];
      const escalationLevelRaw = (row['escalationLevel'] ?? '').trim();
      const escalationLevel = escalationLevelRaw === '' ? null : Number(escalationLevelRaw);
      this.service.addRecord({
        alertId: row['alertId'] ?? '',
        alertType: (row['alertType'] ?? '') as AlertType | '',
        triggerCondition: row['triggerCondition'] ?? '',
        notificationChannel,
        recipientRole: row['recipientRole'] ?? '',
        escalationLevel: escalationLevel !== null && isNaN(escalationLevel) ? null : escalationLevel
      });
    });
    this.refresh();
    this.showImportModal = false;
  }

  onDownload(): void {
  }

  roleName(roleId: string): string {
    return this.roleMaster.find((r) => r.roleId === roleId)?.roleName ?? roleId;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
