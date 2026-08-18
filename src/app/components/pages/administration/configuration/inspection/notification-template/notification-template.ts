import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
import { InspectionNotificationTemplateItem } from './notification-template.model';
import { InspectionNotificationTemplateService } from './notification-template.service';

interface InspectionNotificationTemplateRow extends InspectionNotificationTemplateItem {
  selected?: boolean;
}

interface InspectionNotificationTemplateColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-inspection-notification-template',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './notification-template.html',
  styleUrls: ['./notification-template.css']
})
export class InspectionNotificationTemplate {
  searchTerm = '';

  columns: InspectionNotificationTemplateColumn[] = [
    { key: 'templateCode', label: 'Template Code', visible: true },
    { key: 'templateName', label: 'Template Name', visible: true },
    { key: 'event', label: 'Event', visible: true },
    { key: 'channel', label: 'Channel', visible: true },
    { key: 'subject', label: 'Subject', visible: true },
    { key: 'messageBody', label: 'Message Body', visible: true },
    { key: 'recipients', label: 'Recipients', visible: true },
    { key: 'ccRecipients', label: 'CC Recipients', visible: true },
    { key: 'escalationRecipients', label: 'Escalation Recipients', visible: true },
    { key: 'activeStatus', label: 'Active Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'templateCode', label: 'Template Code' },
    { key: 'templateName', label: 'Template Name' },
    { key: 'event', label: 'Event' },
    { key: 'channel', label: 'Channel' },
    { key: 'subject', label: 'Subject' },
    { key: 'messageBody', label: 'Message Body' },
    { key: 'recipients', label: 'Recipients' },
    { key: 'ccRecipients', label: 'CC Recipients' },
    { key: 'escalationRecipients', label: 'Escalation Recipients' },
    { key: 'activeStatus', label: 'Active Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: InspectionNotificationTemplateRow[] = [];
  filteredRecords: InspectionNotificationTemplateRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: InspectionNotificationTemplateRow | null = null;

  form: InspectionNotificationTemplateItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: InspectionNotificationTemplateService,
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
      const match = this.records.find((r) => r.templateName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get eventMaster() {
    return this.service.eventMaster;
  }

  get channelMaster() {
    return this.service.channelMaster;
  }

  private emptyForm(): InspectionNotificationTemplateItem {
    return {
      templateCode: '',
      templateName: '',
      event: '',
      channel: '',
      subject: '',
      messageBody: '',
      recipients: '',
      ccRecipients: '',
      escalationRecipients: '',
      activeStatus: true
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

  toggleColumn(col: InspectionNotificationTemplateColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): InspectionNotificationTemplateRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: InspectionNotificationTemplateRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as InspectionNotificationTemplateRow[];
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

  editRow(record: InspectionNotificationTemplateRow): void {
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
      this.service.updateRecord(this.editingRecord.templateCode, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.templateCode));
    this.refresh();
  }

  deleteRow(record: InspectionNotificationTemplateRow): void {
    this.service.deleteRecords([record.templateCode]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const activeRaw = (row['activeStatus'] ?? '').trim().toLowerCase();
      this.service.addRecord({
        templateCode: row['templateCode'] ?? '',
        templateName: row['templateName'] ?? '',
        event: row['event'] ?? '',
        channel: row['channel'] ?? '',
        subject: row['subject'] ?? '',
        messageBody: row['messageBody'] ?? '',
        recipients: row['recipients'] ?? '',
        ccRecipients: row['ccRecipients'] ?? '',
        escalationRecipients: row['escalationRecipients'] ?? '',
        activeStatus: activeRaw === 'yes' || activeRaw === 'true'
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
