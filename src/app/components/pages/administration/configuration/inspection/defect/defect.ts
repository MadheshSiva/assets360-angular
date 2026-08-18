import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { InspectionDefectItem } from './defect.model';
import { InspectionDefectService } from './defect.service';

interface InspectionDefectRow extends InspectionDefectItem {
  selected?: boolean;
}

interface InspectionDefectColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-inspection-defect',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions, MasterLinkIcons],
  templateUrl: './defect.html',
  styleUrls: ['./defect.css']
})
export class InspectionDefect {
  searchTerm = '';

  columns: InspectionDefectColumn[] = [
    { key: 'defectCode', label: 'Defect Code', visible: true },
    { key: 'defectName', label: 'Defect Name', visible: true },
    { key: 'defectCategory', label: 'Defect Category', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'severity', label: 'Severity', visible: true },
    { key: 'riskRating', label: 'Risk Rating', visible: true },
    { key: 'recommendedCorrectiveAction', label: 'Recommended Corrective Action', visible: true },
    { key: 'defaultResolutionPeriod', label: 'Default Resolution Period', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'defectCode', label: 'Defect Code' },
    { key: 'defectName', label: 'Defect Name' },
    { key: 'defectCategory', label: 'Defect Category' },
    { key: 'description', label: 'Description' },
    { key: 'severity', label: 'Severity' },
    { key: 'riskRating', label: 'Risk Rating' },
    { key: 'recommendedCorrectiveAction', label: 'Recommended Corrective Action' },
    { key: 'defaultResolutionPeriod', label: 'Default Resolution Period' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: InspectionDefectRow[] = [];
  filteredRecords: InspectionDefectRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: InspectionDefectRow | null = null;

  form: InspectionDefectItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: InspectionDefectService,
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
      const match = this.records.find((r) => r.defectName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get defectCategoryMaster() {
    return this.service.defectCategoryMaster;
  }

  get severityMaster() {
    return this.service.severityMaster;
  }

  get riskRatingMaster() {
    return this.service.riskRatingMaster;
  }

  private emptyForm(): InspectionDefectItem {
    return {
      defectCode: '',
      defectName: '',
      defectCategory: '',
      description: '',
      severity: '',
      riskRating: '',
      recommendedCorrectiveAction: '',
      defaultResolutionPeriod: '',
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

  toggleColumn(col: InspectionDefectColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): InspectionDefectRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: InspectionDefectRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as InspectionDefectRow[];
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

  editRow(record: InspectionDefectRow): void {
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
      this.service.updateRecord(this.editingRecord.defectCode, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.defectCode));
    this.refresh();
  }

  deleteRow(record: InspectionDefectRow): void {
    this.service.deleteRecords([record.defectCode]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const statusRaw = (row['status'] ?? '').trim().toLowerCase();
      this.service.addRecord({
        defectCode: row['defectCode'] ?? '',
        defectName: row['defectName'] ?? '',
        defectCategory: row['defectCategory'] ?? '',
        description: row['description'] ?? '',
        severity: row['severity'] ?? '',
        riskRating: row['riskRating'] ?? '',
        recommendedCorrectiveAction: row['recommendedCorrectiveAction'] ?? '',
        defaultResolutionPeriod: row['defaultResolutionPeriod'] ?? '',
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
