import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementPermitTypeMasterItem } from './permit-type-master.model';
import { MasterManagementPermitTypeMasterService } from './permit-type-master.service';

interface MasterManagementPermitTypeMasterRow extends MasterManagementPermitTypeMasterItem {
  selected?: boolean;
}

interface MasterManagementPermitTypeMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-permit-type-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './permit-type-master.html',
  styleUrls: ['./permit-type-master.css']
})
export class MasterManagementPermitTypeMaster {
  searchTerm = '';

  columns: MasterManagementPermitTypeMasterColumn[] = [
    { key: 'permitTypeId', label: 'Permit Type ID', visible: true },
    { key: 'permitName', label: 'Permit Name', visible: true },
    { key: 'validityDays', label: 'Validity Days', visible: true },
    { key: 'isApprovalRequired', label: 'Is Approval Required', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementPermitTypeMasterRow[] = [];
  filteredRecords: MasterManagementPermitTypeMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementPermitTypeMasterRow | null = null;

  form: MasterManagementPermitTypeMasterItem = this.emptyForm();

  constructor(private service: MasterManagementPermitTypeMasterService) {
    this.refresh();
  }

  private emptyForm(): MasterManagementPermitTypeMasterItem {
    return {
      permitTypeId: '',
      permitName: '',
      validityDays: null,
      isApprovalRequired: true
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

  toggleColumn(col: MasterManagementPermitTypeMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementPermitTypeMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementPermitTypeMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementPermitTypeMasterRow[];
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
      this.service.updateRecord(this.editingRecord.permitTypeId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.permitTypeId));
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
