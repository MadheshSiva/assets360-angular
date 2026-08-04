import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { RowActions } from '@shared/row-actions/row-actions';
import { ChecklistItem } from './checklist-items.model';
import { ChecklistItemService } from './checklist-items.service';

interface ChecklistItemRow extends ChecklistItem {
  selected?: boolean;
}

interface ChecklistItemColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-wip-checklist-items',
  imports: [CommonModule, FormsModule, ImportFileModal, MasterLinkIcons, RowActions],
  templateUrl: './checklist-items.html',
  styleUrls: ['./checklist-items.css']
})
export class WipChecklistItems {
  searchTerm = '';

  columns: ChecklistItemColumn[] = [
    { key: 'itemId', label: 'Item ID', visible: true },
    { key: 'checklistId', label: 'Checklist ID', visible: true },
    { key: 'itemDescription', label: 'Item Description', visible: true },
    { key: 'responseType', label: 'Response Type', visible: true },
    { key: 'thresholdValue', label: 'Threshold Value', visible: true },
    { key: 'isCritical', label: 'Is Critical', visible: true },
    { key: 'sequenceOrder', label: 'Sequence Order', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'itemId', label: 'Item ID' },
    { key: 'checklistId', label: 'Checklist ID' },
    { key: 'itemDescription', label: 'Item Description' },
    { key: 'responseType', label: 'Response Type' },
    { key: 'thresholdValue', label: 'Threshold Value' },
    { key: 'isCritical', label: 'Is Critical' },
    { key: 'sequenceOrder', label: 'Sequence Order' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: ChecklistItemRow[] = [];
  filteredRecords: ChecklistItemRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: ChecklistItemRow | null = null;

  form: ChecklistItem = this.emptyForm();

  constructor(private service: ChecklistItemService) {
    this.refresh();
  }

  get checklistMaster() {
    return this.service.checklistMaster;
  }

  get responseTypeMaster() {
    return this.service.responseTypeMaster;
  }

  private emptyForm(): ChecklistItem {
    return {
      itemId: '',
      checklistId: '',
      itemDescription: '',
      responseType: '',
      thresholdValue: null,
      isCritical: false,
      sequenceOrder: null
    };
  }

  private refresh(): void {
    this.records = this.service.getItems();
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

  toggleColumn(col: ChecklistItemColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): ChecklistItemRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: ChecklistItemRow): void {
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

  editRow(record: ChecklistItemRow): void {
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

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.itemId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.itemId));
    this.refresh();
  }

  deleteRow(record: ChecklistItemRow): void {
    this.service.deleteRecords([record.itemId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    const mapped: ChecklistItemRow[] = rows.map((row) => ({
      itemId: row['itemId'] ?? '',
      checklistId: row['checklistId'] ?? '',
      itemDescription: row['itemDescription'] ?? '',
      responseType: row['responseType'] ?? '',
      thresholdValue: row['thresholdValue'] ? Number(row['thresholdValue']) : null,
      isCritical: row['isCritical']?.toLowerCase() === 'true' || row['isCritical']?.toLowerCase() === 'yes',
      sequenceOrder: row['sequenceOrder'] ? Number(row['sequenceOrder']) : null
    }));
    this.records = [...this.records, ...mapped];
    this.filteredRecords = [...this.filteredRecords, ...mapped];
    this.showImportModal = false;
  }

  onDownload(): void {
  }

  checklistName(checklistId: string): string {
    return this.checklistMaster.find((c) => c.checklistId === checklistId)?.checklistName ?? checklistId;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
