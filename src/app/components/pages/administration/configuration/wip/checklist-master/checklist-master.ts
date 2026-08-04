import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { RowActions } from '@shared/row-actions/row-actions';
import { ChecklistMaster } from './checklist-master.model';
import { ChecklistMasterService } from './checklist-master.service';

interface ChecklistMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-wip-checklist-master',
  imports: [CommonModule, FormsModule, ImportFileModal, MasterLinkIcons, RowActions],
  templateUrl: './checklist-master.html',
  styleUrls: ['./checklist-master.css']
})
export class WipChecklistMaster {
  searchTerm = '';

  columns: ChecklistMasterColumn[] = [
    { key: 'checklistId', label: 'Checklist ID', visible: true },
    { key: 'checklistName', label: 'Checklist Name', visible: true },
    { key: 'checklistType', label: 'Checklist Type', visible: true },
    { key: 'applicableWorkType', label: 'Applicable Work Type', visible: true },
    { key: 'versionNumber', label: 'Version Number', visible: true },
    { key: 'isMandatory', label: 'Is Mandatory', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'checklistId', label: 'Checklist ID' },
    { key: 'checklistName', label: 'Checklist Name' },
    { key: 'checklistType', label: 'Checklist Type' },
    { key: 'applicableWorkType', label: 'Applicable Work Type' },
    { key: 'versionNumber', label: 'Version Number' },
    { key: 'isMandatory', label: 'Is Mandatory' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: ChecklistMaster[] = [];
  filteredRecords: ChecklistMaster[] = [];

  private selectedIds = new Set<string>();

  showFormModal = false;
  isEditMode = false;
  private editingRecord: ChecklistMaster | null = null;

  form: ChecklistMaster = this.emptyForm();

  constructor(private service: ChecklistMasterService) {
    this.refresh();
  }

  get checklistTypeMaster() {
    return this.service.checklistTypeMaster;
  }

  get workTypeMaster() {
    return this.service.workTypeMaster;
  }

  private emptyForm(): ChecklistMaster {
    return {
      checklistId: '',
      checklistName: '',
      checklistType: '',
      applicableWorkType: [],
      versionNumber: null,
      isMandatory: false
    };
  }

  private refresh(): void {
    this.records = this.service.getChecklists();
    const validIds = new Set(this.records.map((r) => r.checklistId));
    this.selectedIds.forEach((id) => {
      if (!validIds.has(id)) {
        this.selectedIds.delete(id);
      }
    });
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

  toggleColumn(col: ChecklistMasterColumn): void {
    col.visible = !col.visible;
  }

  workTypeNames(types: string[]): string {
    return (types ?? []).join(', ');
  }

  isSelected(record: ChecklistMaster): boolean {
    return this.selectedIds.has(record.checklistId);
  }

  get selectedRecords(): ChecklistMaster[] {
    return this.filteredRecords.filter((r) => this.selectedIds.has(r.checklistId));
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => this.selectedIds.has(r.checklistId));
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.filteredRecords.forEach((r) => this.selectedIds.delete(r.checklistId));
    } else {
      this.filteredRecords.forEach((r) => this.selectedIds.add(r.checklistId));
    }
  }

  toggleSelectRecord(record: ChecklistMaster): void {
    if (this.selectedIds.has(record.checklistId)) {
      this.selectedIds.delete(record.checklistId);
    } else {
      this.selectedIds.add(record.checklistId);
    }
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

  editRow(record: ChecklistMaster): void {
    this.isEditMode = true;
    this.editingRecord = record;
    this.form = { ...record, applicableWorkType: [...record.applicableWorkType] };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
  }

  isWorkTypeSelected(type: string): boolean {
    return this.form.applicableWorkType.includes(type);
  }

  toggleWorkType(type: string): void {
    this.form.applicableWorkType = this.form.applicableWorkType.includes(type)
      ? this.form.applicableWorkType.filter((t) => t !== type)
      : [...this.form.applicableWorkType, type];
  }

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.checklistId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.selectedIds.clear();
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.checklistId));
    this.selectedIds.clear();
    this.refresh();
  }

  deleteRow(record: ChecklistMaster): void {
    this.service.deleteRecords([record.checklistId]);
    this.selectedIds.clear();
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    const mapped: ChecklistMaster[] = rows.map((row) => ({
      checklistId: row['checklistId'] ?? '',
      checklistName: row['checklistName'] ?? '',
      checklistType: row['checklistType'] ?? '',
      applicableWorkType: (row['applicableWorkType'] ?? '')
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      versionNumber: row['versionNumber'] ? Number(row['versionNumber']) : null,
      isMandatory: row['isMandatory']?.toLowerCase() === 'true' || row['isMandatory']?.toLowerCase() === 'yes'
    }));
    this.records = [...this.records, ...mapped];
    this.filteredRecords = [...this.filteredRecords, ...mapped];
    this.showImportModal = false;
  }

  onDownload(): void {
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
