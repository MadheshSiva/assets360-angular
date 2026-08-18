import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
import { InspectionSeverityItem } from './severity.model';
import { InspectionSeverityService } from './severity.service';

interface InspectionSeverityRow extends InspectionSeverityItem {
  selected?: boolean;
}

interface InspectionSeverityColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-inspection-severity',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './severity.html',
  styleUrls: ['./severity.css']
})
export class InspectionSeverity {
  searchTerm = '';

  columns: InspectionSeverityColumn[] = [
    { key: 'severityCode', label: 'Severity Code', visible: true },
    { key: 'severityName', label: 'Severity Name', visible: true },
    { key: 'score', label: 'Score', visible: true },
    { key: 'colourIndicator', label: 'Colour Indicator', visible: true },
    { key: 'resolutionSla', label: 'Resolution SLA', visible: true },
    { key: 'escalationLevel', label: 'Escalation Level', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'severityCode', label: 'Severity Code' },
    { key: 'severityName', label: 'Severity Name' },
    { key: 'score', label: 'Score' },
    { key: 'colourIndicator', label: 'Colour Indicator' },
    { key: 'resolutionSla', label: 'Resolution SLA' },
    { key: 'escalationLevel', label: 'Escalation Level' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: InspectionSeverityRow[] = [];
  filteredRecords: InspectionSeverityRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: InspectionSeverityRow | null = null;

  form: InspectionSeverityItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: InspectionSeverityService,
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
      const match = this.records.find((r) => r.severityName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get severityNameMaster() {
    return this.service.severityNameMaster;
  }

  get escalationLevelMaster() {
    return this.service.escalationLevelMaster;
  }

  private emptyForm(): InspectionSeverityItem {
    return {
      severityCode: '',
      severityName: '',
      score: null,
      colourIndicator: '',
      resolutionSla: '',
      escalationLevel: '',
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

  toggleColumn(col: InspectionSeverityColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): InspectionSeverityRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: InspectionSeverityRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as InspectionSeverityRow[];
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

  editRow(record: InspectionSeverityRow): void {
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
      this.service.updateRecord(this.editingRecord.severityCode, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.severityCode));
    this.refresh();
  }

  deleteRow(record: InspectionSeverityRow): void {
    this.service.deleteRecords([record.severityCode]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const statusRaw = (row['status'] ?? '').trim().toLowerCase();
      const scoreRaw = row['score'] ?? '';
      this.service.addRecord({
        severityCode: row['severityCode'] ?? '',
        severityName: row['severityName'] ?? '',
        score: scoreRaw.trim() === '' ? null : Number(scoreRaw),
        colourIndicator: row['colourIndicator'] ?? '',
        resolutionSla: row['resolutionSla'] ?? '',
        escalationLevel: row['escalationLevel'] ?? '',
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
