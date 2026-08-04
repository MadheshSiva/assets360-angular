import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { RowActions } from '@shared/row-actions/row-actions';
import { PermitCompliance, PermitComplianceForm } from './permit-compliance.model';
import { PermitComplianceService } from './permit-compliance.service';

interface PermitComplianceColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-wip-permit-compliance',
  imports: [CommonModule, FormsModule, ImportFileModal, MasterLinkIcons, RowActions],
  templateUrl: './permit-compliance.html',
  styleUrls: ['./permit-compliance.css']
})
export class WipPermitCompliance {
  searchTerm = '';

  columns: PermitComplianceColumn[] = [
    { key: 'permitId', label: 'Permit ID', visible: true },
    { key: 'jobId', label: 'Job ID', visible: true },
    { key: 'permitType', label: 'Permit Type', visible: true },
    { key: 'issuedBy', label: 'Issued By', visible: true },
    { key: 'approvedBy', label: 'Approved By', visible: true },
    { key: 'validFrom', label: 'Valid From', visible: true },
    { key: 'validTo', label: 'Valid To', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'documentAttachment', label: 'Document Attachment', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'permitId', label: 'Permit ID' },
    { key: 'jobId', label: 'Job ID' },
    { key: 'permitType', label: 'Permit Type' },
    { key: 'issuedBy', label: 'Issued By' },
    { key: 'approvedBy', label: 'Approved By' },
    { key: 'validFrom', label: 'Valid From' },
    { key: 'validTo', label: 'Valid To' },
    { key: 'status', label: 'Status' },
    { key: 'documentAttachment', label: 'Document Attachment' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: PermitCompliance[] = [];
  filteredRecords: PermitCompliance[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: PermitCompliance | null = null;

  form: PermitComplianceForm = this.emptyForm();

  constructor(private service: PermitComplianceService) {
    this.refresh();
  }

  get jobMaster() {
    return this.service.jobMaster;
  }

  get userMaster() {
    return this.service.userMaster;
  }

  get permitTypeMaster() {
    return this.service.permitTypeMaster;
  }

  get statusMaster() {
    return this.service.statusMaster;
  }

  private emptyForm(): PermitComplianceForm {
    return {
      permitId: '',
      jobId: '',
      permitType: '',
      issuedBy: '',
      approvedBy: '',
      validFrom: '',
      validTo: '',
      status: '',
      documentAttachment: ''
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

  toggleColumn(col: PermitComplianceColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): PermitCompliance[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: PermitCompliance): void {
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

  editRow(record: PermitCompliance): void {
    this.isEditMode = true;
    this.editingRecord = record;
    const { selected, ...rest } = record;
    this.form = { ...rest };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.documentAttachment = input.files?.[0]?.name ?? '';
  }

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.permitId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.permitId));
    this.refresh();
  }

  deleteRow(record: PermitCompliance): void {
    this.service.deleteRecords([record.permitId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.service.addRecord({
        permitId: row['permitId'] ?? '',
        jobId: row['jobId'] ?? '',
        permitType: (row['permitType'] ?? '') as PermitCompliance['permitType'],
        issuedBy: row['issuedBy'] ?? '',
        approvedBy: row['approvedBy'] ?? '',
        validFrom: row['validFrom'] ?? '',
        validTo: row['validTo'] ?? '',
        status: (row['status'] ?? '') as PermitCompliance['status'],
        documentAttachment: row['documentAttachment'] ?? ''
      });
    });
    this.refresh();
    this.showImportModal = false;
  }

  onDownload(): void {
  }

  jobName(jobId: string): string {
    return this.jobMaster.find((j) => j.jobId === jobId)?.jobName ?? jobId;
  }

  userName(userId: string): string {
    return this.userMaster.find((u) => u.id === userId)?.name ?? userId;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
