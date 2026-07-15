import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementUpdateSourceMasterItem } from './update-source-master.model';
import { MasterManagementUpdateSourceMasterService } from './update-source-master.service';

interface MasterManagementUpdateSourceMasterRow extends MasterManagementUpdateSourceMasterItem {
  selected?: boolean;
}

interface MasterManagementUpdateSourceMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-update-source-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './update-source-master.html',
  styleUrls: ['./update-source-master.css']
})
export class MasterManagementUpdateSourceMaster {
  searchTerm = '';

  columns: MasterManagementUpdateSourceMasterColumn[] = [
    { key: 'sourceId', label: 'Source ID', visible: true },
    { key: 'sourceName', label: 'Source Name', visible: true },
    { key: 'description', label: 'Description', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementUpdateSourceMasterRow[] = [];
  filteredRecords: MasterManagementUpdateSourceMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementUpdateSourceMasterRow | null = null;

  form: MasterManagementUpdateSourceMasterItem = this.emptyForm();

  constructor(private service: MasterManagementUpdateSourceMasterService) {
    this.refresh();
  }

  get sourceNameMaster() {
    return this.service.sourceNameMaster;
  }

  private emptyForm(): MasterManagementUpdateSourceMasterItem {
    return {
      sourceId: '',
      sourceName: '',
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

  toggleColumn(col: MasterManagementUpdateSourceMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementUpdateSourceMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementUpdateSourceMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementUpdateSourceMasterRow[];
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
      this.service.updateRecord(this.editingRecord.sourceId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.sourceId));
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
