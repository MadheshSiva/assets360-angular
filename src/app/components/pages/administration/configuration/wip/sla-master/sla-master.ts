import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlaMaster } from './sla-master.model';
import { SlaMasterService } from './sla-master.service';

type SlaRow = SlaMaster & { selected?: boolean };

interface SlaMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-wip-sla-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './sla-master.html',
  styleUrls: ['./sla-master.css']
})
export class WipSlaMaster {
  searchTerm = '';

  columns: SlaMasterColumn[] = [
    { key: 'slaId', label: 'SLA ID', visible: true },
    { key: 'slaName', label: 'SLA Name', visible: true },
    { key: 'workType', label: 'Work Type', visible: true },
    { key: 'priority', label: 'Priority', visible: true },
    { key: 'responseTimeMins', label: 'Response Time (mins)', visible: true },
    { key: 'resolutionTimeMins', label: 'Resolution Time (mins)', visible: true },
    { key: 'escalationLevel1', label: 'Escalation Level 1', visible: true },
    { key: 'escalationLevel2', label: 'Escalation Level 2', visible: true },
    { key: 'escalationLevel3', label: 'Escalation Level 3', visible: true }
  ];

  showColumnPicker = false;

  records: SlaRow[] = [];
  filteredRecords: SlaRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: SlaRow | null = null;

  form: SlaMaster = this.emptyForm();

  constructor(private service: SlaMasterService) {
    this.refresh();
  }

  get workTypeMaster() {
    return this.service.workTypeMaster;
  }

  get priorityMaster() {
    return this.service.priorityMaster;
  }

  get userMaster() {
    return this.service.userMaster;
  }

  private emptyForm(): SlaMaster {
    return {
      slaId: '',
      slaName: '',
      workType: '',
      priority: '',
      responseTimeMins: null,
      resolutionTimeMins: null,
      escalationLevel1: '',
      escalationLevel2: '',
      escalationLevel3: ''
    };
  }

  private refresh(): void {
    this.records = this.service.getSlas() as SlaRow[];
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

  toggleColumn(col: SlaMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): SlaRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: SlaRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as SlaRow[];
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
      this.service.updateRecord(this.editingRecord.slaId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.slaId));
    this.refresh();
  }

  onUpload(): void {
  }

  onDownload(): void {
  }

  userName(userId: string): string {
    if (!userId) return '-';
    return this.userMaster.find((u) => u.id === userId)?.name ?? userId;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
