import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
import { ComplianceInspectionRecord, ComplianceInspectionForm } from './compliance-inspection.model';
import { ComplianceInspectionService } from './compliance-inspection.service';

interface InspectionColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-maintenance-compliance-inspection',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './compliance-inspection.html',
  styleUrls: ['./compliance-inspection.css']
})
export class MaintenanceComplianceInspection {
  searchTerm = '';

  columns: InspectionColumn[] = [
    { key: 'inspectionId', label: 'Inspection ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'inspectionType', label: 'Inspection Type', visible: true },
    { key: 'checklist', label: 'Checklist', visible: true },
    { key: 'inspectorName', label: 'Inspector Name', visible: true },
    { key: 'result', label: 'Result', visible: true },
    { key: 'nextInspectionDate', label: 'Next Inspection Date', visible: true },
    { key: 'remarks', label: 'Remarks', visible: false }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'inspectionId', label: 'Inspection ID' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'inspectionType', label: 'Inspection Type' },
    { key: 'checklist', label: 'Checklist' },
    { key: 'inspectorName', label: 'Inspector Name' },
    { key: 'result', label: 'Result' },
    { key: 'nextInspectionDate', label: 'Next Inspection Date' },
    { key: 'remarks', label: 'Remarks' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: ComplianceInspectionRecord[] = [];
  filteredRecords: ComplianceInspectionRecord[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: ComplianceInspectionRecord | null = null;

  form: ComplianceInspectionForm = this.emptyForm();

  constructor(private inspectionService: ComplianceInspectionService) {
    this.refresh();
  }

  get inspectionTypeMaster() {
    return this.inspectionService.inspectionTypeMaster;
  }

  get checklistMaster() {
    return this.inspectionService.checklistMaster;
  }

  get inspectorMaster() {
    return this.inspectionService.inspectorMaster;
  }

  get resultMaster() {
    return this.inspectionService.resultMaster;
  }

  private emptyForm(): ComplianceInspectionForm {
    return {
      inspectionId: '',
      assetId: '',
      assetName: '',
      inspectionType: '',
      checklist: '',
      inspectorName: '',
      result: '',
      remarks: '',
      nextInspectionDate: ''
    };
  }

  private refresh(): void {
    this.records = this.inspectionService.getRecords();
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

  toggleColumn(col: InspectionColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): ComplianceInspectionRecord[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: ComplianceInspectionRecord): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.inspectionService.search(this.searchTerm);
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

  editRow(record: ComplianceInspectionRecord): void {
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
      this.inspectionService.updateRecord(this.editingRecord.inspectionId, { ...this.form });
    } else {
      this.inspectionService.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.inspectionService.deleteRecords(this.selectedRecords.map((r) => r.inspectionId));
    this.refresh();
  }

  deleteRow(record: ComplianceInspectionRecord): void {
    this.inspectionService.deleteRecords([record.inspectionId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.inspectionService.addRecord({
        inspectionId: row['inspectionId'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        inspectionType: row['inspectionType'] ?? '',
        checklist: row['checklist'] ?? '',
        inspectorName: row['inspectorName'] ?? '',
        result: (row['result'] ?? '') as 'Pass' | 'Fail' | '',
        nextInspectionDate: row['nextInspectionDate'] ?? '',
        remarks: row['remarks'] ?? ''
      });
    });
    this.refresh();
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current compliance & inspection list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
