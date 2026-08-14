import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { InspectionTypeMasterItem, InspectionTypeMasterRow } from './inspection-type.model';
import { InspectionTypeMasterService } from './inspection-type.service';

interface InspectionTypeMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-inspection-type-master',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions, MasterLinkIcons],
  templateUrl: './inspection-type.html',
  styleUrls: ['./inspection-type.css']
})
export class InspectionTypeMaster {
  searchTerm = '';

  columns: InspectionTypeMasterColumn[] = [
    { key: 'inspectionTypeCode', label: 'Inspection Type Code', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'inspectionTypeName', label: 'Inspection Type Name', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'defaultPriority', label: 'Default Priority', visible: true },
    { key: 'defaultApprovalWorkflow', label: 'Default Approval Workflow', visible: true },
    { key: 'defaultReportTemplate', label: 'Default Report Template', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'inspectionTypeCode', label: 'Inspection Type Code' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'inspectionTypeName', label: 'Inspection Type Name' },
    { key: 'description', label: 'Description' },
    { key: 'defaultPriority', label: 'Default Priority' },
    { key: 'defaultApprovalWorkflow', label: 'Default Approval Workflow' },
    { key: 'defaultReportTemplate', label: 'Default Report Template' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: InspectionTypeMasterRow[] = [];
  filteredRecords: InspectionTypeMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: InspectionTypeMasterRow | null = null;

  form: InspectionTypeMasterItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: InspectionTypeMasterService,
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
      const match = this.records.find((r) => r.inspectionTypeName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get inspectionTypeNameMaster() {
    return this.service.inspectionTypeNameMaster;
  }

  get defaultPriorityMaster() {
    return this.service.defaultPriorityMaster;
  }

  private emptyForm(): InspectionTypeMasterItem {
    return {
      inspectionTypeCode: '',
      assetId: '',
      assetName: '',
      inspectionTypeName: '',
      description: '',
      defaultPriority: '',
      defaultApprovalWorkflow: '',
      defaultReportTemplate: '',
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

  toggleColumn(col: InspectionTypeMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): InspectionTypeMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: InspectionTypeMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as InspectionTypeMasterRow[];
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

  editRow(record: InspectionTypeMasterRow): void {
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
      this.service.updateRecord(this.editingRecord.inspectionTypeCode, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.inspectionTypeCode));
    this.refresh();
  }

  deleteRow(record: InspectionTypeMasterRow): void {
    this.service.deleteRecords([record.inspectionTypeCode]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const activeRaw = (row['status'] ?? '').trim().toLowerCase();
      this.service.addRecord({
        inspectionTypeCode: row['inspectionTypeCode'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        inspectionTypeName: row['inspectionTypeName'] ?? '',
        description: row['description'] ?? '',
        defaultPriority: row['defaultPriority'] ?? '',
        defaultApprovalWorkflow: row['defaultApprovalWorkflow'] ?? '',
        defaultReportTemplate: row['defaultReportTemplate'] ?? '',
        status: activeRaw === 'yes' || activeRaw === 'true'
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
