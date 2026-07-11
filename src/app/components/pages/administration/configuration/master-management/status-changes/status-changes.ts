import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementStatusChangeItem } from './status-changes.model';
import { MasterManagementStatusChangeService } from './status-changes.service';

interface MasterManagementStatusChangeRow extends MasterManagementStatusChangeItem {
  selected?: boolean;
}

interface MasterManagementStatusChangeColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-status-changes',
  imports: [CommonModule, FormsModule],
  templateUrl: './status-changes.html',
  styleUrls: ['./status-changes.css']
})
export class MasterManagementStatusChanges {
  searchTerm = '';

  columns: MasterManagementStatusChangeColumn[] = [
    { key: 'statusChangeId', label: 'Status Change ID', visible: true },
    { key: 'statusName', label: 'Status Name', visible: true },
    { key: 'statusCode', label: 'Status Code', visible: true },
    { key: 'sequenceOrder', label: 'Sequence Order', visible: true },
    { key: 'isClosedStatus', label: 'Is Closed Status', visible: true },
    { key: 'allowedTransitions', label: 'Allowed Transitions', visible: true },
    { key: 'requiresApproval', label: 'Requires Approval', visible: true },
    { key: 'isDefault', label: 'Is Default', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementStatusChangeRow[] = [];
  filteredRecords: MasterManagementStatusChangeRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementStatusChangeRow | null = null;

  form: MasterManagementStatusChangeItem = this.emptyForm();

  constructor(private service: MasterManagementStatusChangeService) {
    this.refresh();
  }

  get statusMaster() {
    return this.service.statusMaster;
  }

  private emptyForm(): MasterManagementStatusChangeItem {
    return {
      statusChangeId: '',
      statusName: '',
      statusCode: '',
      sequenceOrder: null,
      isClosedStatus: false,
      requiresApproval: false,
      isDefault: false,
      allowedTransitions: [],
      description: ''
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

  toggleColumn(col: MasterManagementStatusChangeColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementStatusChangeRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementStatusChangeRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementStatusChangeRow[];
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
    const record = this.selectedRecords[0];
    this.isEditMode = true;
    this.editingRecord = record;
    const { selected, ...rest } = record;
    this.form = { ...rest, allowedTransitions: [...rest.allowedTransitions] };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
  }

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.statusChangeId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.statusChangeId));
    this.refresh();
  }

  onUpload(): void {
  }

  onDownload(): void {
  }

  statusName(statusChangeId: string): string {
    return this.records.find((s) => s.statusChangeId === statusChangeId)?.statusName || statusChangeId;
  }

  transitionNames(statusChangeIds: string[]): string {
    return (statusChangeIds ?? []).map((id) => this.statusName(id)).join(', ');
  }

  otherStatuses(): MasterManagementStatusChangeItem[] {
    const currentId = this.editingRecord?.statusChangeId;
    return this.records.filter((s) => s.statusChangeId !== currentId);
  }

  isTransitionSelected(targetId: string): boolean {
    return this.form.allowedTransitions.includes(targetId);
  }

  toggleTransition(targetId: string): void {
    this.form.allowedTransitions = this.form.allowedTransitions.includes(targetId)
      ? this.form.allowedTransitions.filter((id) => id !== targetId)
      : [...this.form.allowedTransitions, targetId];
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
