import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementPhysicalVerificationResultItem } from './physical-verification-result.model';
import { MasterManagementPhysicalVerificationResultService } from './physical-verification-result.service';

interface MasterManagementPhysicalVerificationResultRow extends MasterManagementPhysicalVerificationResultItem {
  selected?: boolean;
}

interface MasterManagementPhysicalVerificationResultColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-physical-verification-result',
  imports: [CommonModule, FormsModule],
  templateUrl: './physical-verification-result.html',
  styleUrls: ['./physical-verification-result.css']
})
export class MasterManagementPhysicalVerificationResult {
  searchTerm = '';

  columns: MasterManagementPhysicalVerificationResultColumn[] = [
    { key: 'resultId', label: 'Result ID', visible: true },
    { key: 'resultName', label: 'Result Name', visible: true },
    { key: 'resultCode', label: 'Result Code', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'resultCategory', label: 'Result Category', visible: true },
    { key: 'requiresAction', label: 'Requires Action', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementPhysicalVerificationResultRow[] = [];
  filteredRecords: MasterManagementPhysicalVerificationResultRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementPhysicalVerificationResultRow | null = null;

  form: MasterManagementPhysicalVerificationResultItem = this.emptyForm();

  constructor(private service: MasterManagementPhysicalVerificationResultService) {
    this.refresh();
  }

  get resultCategoryMaster() {
    return this.service.resultCategoryMaster;
  }

  get requiresActionMaster() {
    return this.service.requiresActionMaster;
  }

  get statusMaster() {
    return this.service.statusMaster;
  }

  private emptyForm(): MasterManagementPhysicalVerificationResultItem {
    return {
      resultId: '',
      resultName: '',
      resultCode: '',
      description: '',
      resultCategory: '',
      requiresAction: '',
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

  toggleColumn(col: MasterManagementPhysicalVerificationResultColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementPhysicalVerificationResultRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementPhysicalVerificationResultRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementPhysicalVerificationResultRow[];
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
    this.form = { ...rest };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
  }

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.resultId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.resultId));
    this.refresh();
  }

  onUpload(): void {
  }

  onDownload(): void {
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
