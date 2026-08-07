import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { InspectionNumberingSequenceItem } from './numbering-sequence.model';
import { InspectionNumberingSequenceService } from './numbering-sequence.service';

interface InspectionNumberingSequenceRow extends InspectionNumberingSequenceItem {
  selected?: boolean;
}

interface InspectionNumberingSequenceColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-inspection-numbering-sequence',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './numbering-sequence.html',
  styleUrls: ['./numbering-sequence.css']
})
export class InspectionNumberingSequence {
  searchTerm = '';

  columns: InspectionNumberingSequenceColumn[] = [
    { key: 'sequenceCode', label: 'Sequence Code', visible: true },
    { key: 'numberType', label: 'Number Type', visible: true },
    { key: 'prefix', label: 'Prefix', visible: true },
    { key: 'suffix', label: 'Suffix', visible: true },
    { key: 'financialYear', label: 'Financial Year', visible: true },
    { key: 'siteCode', label: 'Site Code', visible: true },
    { key: 'departmentCode', label: 'Department Code', visible: true },
    { key: 'runningNumber', label: 'Running Number', visible: true },
    { key: 'resetFrequency', label: 'Reset Frequency', visible: true },
    { key: 'samplePreview', label: 'Sample Number Preview', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'sequenceCode', label: 'Sequence Code' },
    { key: 'numberType', label: 'Number Type' },
    { key: 'prefix', label: 'Prefix' },
    { key: 'suffix', label: 'Suffix' },
    { key: 'financialYear', label: 'Financial Year' },
    { key: 'siteCode', label: 'Site Code' },
    { key: 'departmentCode', label: 'Department Code' },
    { key: 'runningNumber', label: 'Running Number' },
    { key: 'resetFrequency', label: 'Reset Frequency' },
    { key: 'samplePreview', label: 'Sample Number Preview' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: InspectionNumberingSequenceRow[] = [];
  filteredRecords: InspectionNumberingSequenceRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: InspectionNumberingSequenceRow | null = null;

  form: InspectionNumberingSequenceItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: InspectionNumberingSequenceService,
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
      const match = this.records.find((r) => r.numberType === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get numberTypeMaster() {
    return this.service.numberTypeMaster;
  }

  get resetFrequencyMaster() {
    return this.service.resetFrequencyMaster;
  }

  private emptyForm(): InspectionNumberingSequenceItem {
    return {
      sequenceCode: '',
      numberType: '',
      prefix: '',
      suffix: '',
      financialYear: '',
      siteCode: '',
      departmentCode: '',
      runningNumber: 0,
      resetFrequency: '',
      samplePreview: '',
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

  toggleColumn(col: InspectionNumberingSequenceColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): InspectionNumberingSequenceRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: InspectionNumberingSequenceRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as InspectionNumberingSequenceRow[];
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

  editRow(record: InspectionNumberingSequenceRow): void {
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
      this.service.updateRecord(this.editingRecord.sequenceCode, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.sequenceCode));
    this.refresh();
  }

  deleteRow(record: InspectionNumberingSequenceRow): void {
    this.service.deleteRecords([record.sequenceCode]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const statusRaw = (row['status'] ?? '').trim().toLowerCase();
      this.service.addRecord({
        sequenceCode: row['sequenceCode'] ?? '',
        numberType: row['numberType'] ?? '',
        prefix: row['prefix'] ?? '',
        suffix: row['suffix'] ?? '',
        financialYear: row['financialYear'] ?? '',
        siteCode: row['siteCode'] ?? '',
        departmentCode: row['departmentCode'] ?? '',
        runningNumber: Number(row['runningNumber'] ?? 0) || 0,
        resetFrequency: row['resetFrequency'] ?? '',
        samplePreview: row['samplePreview'] ?? '',
        status: statusRaw === 'yes' || statusRaw === 'true'
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
