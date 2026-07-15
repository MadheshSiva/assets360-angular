import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementSeverityMasterItem } from './severity-master.model';
import { MasterManagementSeverityMasterService } from './severity-master.service';

interface MasterManagementSeverityMasterRow extends MasterManagementSeverityMasterItem {
  selected?: boolean;
}

interface MasterManagementSeverityMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-severity-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './severity-master.html',
  styleUrls: ['./severity-master.css']
})
export class MasterManagementSeverityMaster {
  searchTerm = '';

  columns: MasterManagementSeverityMasterColumn[] = [
    { key: 'severityId', label: 'Severity ID', visible: true },
    { key: 'severityName', label: 'Severity Name', visible: true },
    { key: 'colorCode', label: 'Color Code', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementSeverityMasterRow[] = [];
  filteredRecords: MasterManagementSeverityMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementSeverityMasterRow | null = null;

  form: MasterManagementSeverityMasterItem = this.emptyForm();

  constructor(private service: MasterManagementSeverityMasterService) {
    this.refresh();
  }

  get severityNameMaster() {
    return this.service.severityNameMaster;
  }

  private emptyForm(): MasterManagementSeverityMasterItem {
    return {
      severityId: '',
      severityName: '',
      colorCode: ''
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

  toggleColumn(col: MasterManagementSeverityMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementSeverityMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementSeverityMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementSeverityMasterRow[];
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
      this.service.updateRecord(this.editingRecord.severityId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.severityId));
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
