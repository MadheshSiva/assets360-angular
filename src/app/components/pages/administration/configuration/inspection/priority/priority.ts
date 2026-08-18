import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
import { InspectionPriorityItem } from './priority.model';
import { InspectionPriorityService } from './priority.service';

interface InspectionPriorityRow extends InspectionPriorityItem {
  selected?: boolean;
}

interface InspectionPriorityColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-inspection-priority',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './priority.html',
  styleUrls: ['./priority.css']
})
export class InspectionPriority {
  searchTerm = '';

  columns: InspectionPriorityColumn[] = [
    { key: 'priorityCode', label: 'Priority Code', visible: true },
    { key: 'priorityName', label: 'Priority Name', visible: true },
    { key: 'responseTime', label: 'Response Time', visible: true },
    { key: 'completionSla', label: 'Completion SLA', visible: true },
    { key: 'colour', label: 'Colour', visible: true },
    { key: 'escalationRule', label: 'Escalation Rule', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'priorityCode', label: 'Priority Code' },
    { key: 'priorityName', label: 'Priority Name' },
    { key: 'responseTime', label: 'Response Time' },
    { key: 'completionSla', label: 'Completion SLA' },
    { key: 'colour', label: 'Colour' },
    { key: 'escalationRule', label: 'Escalation Rule' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: InspectionPriorityRow[] = [];
  filteredRecords: InspectionPriorityRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: InspectionPriorityRow | null = null;

  form: InspectionPriorityItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: InspectionPriorityService,
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
      const match = this.records.find((r) => r.priorityName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get priorityNameMaster() {
    return this.service.priorityNameMaster;
  }

  private emptyForm(): InspectionPriorityItem {
    return {
      priorityCode: '',
      priorityName: '',
      responseTime: '',
      completionSla: '',
      colour: '',
      escalationRule: '',
      status: true
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

  toggleColumn(col: InspectionPriorityColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): InspectionPriorityRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: InspectionPriorityRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as InspectionPriorityRow[];
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

  editRow(record: InspectionPriorityRow): void {
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
      this.service.updateRecord(this.editingRecord.priorityCode, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.priorityCode));
    this.refresh();
  }

  deleteRow(record: InspectionPriorityRow): void {
    this.service.deleteRecords([record.priorityCode]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const statusRaw = (row['status'] ?? '').trim().toLowerCase();
      this.service.addRecord({
        priorityCode: row['priorityCode'] ?? '',
        priorityName: row['priorityName'] ?? '',
        responseTime: row['responseTime'] ?? '',
        completionSla: row['completionSla'] ?? '',
        colour: row['colour'] ?? '',
        escalationRule: row['escalationRule'] ?? '',
        status: statusRaw === 'yes' || statusRaw === 'true' || statusRaw === 'active'
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
