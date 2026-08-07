import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { InspectionTaskItem, InspectionTaskRow } from './inspection-task.model';
import { InspectionTaskService } from './inspection-task.service';

interface InspectionTaskColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-inspection-task',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './inspection-task.html',
  styleUrls: ['./inspection-task.css']
})
export class InspectionTask {
  searchTerm = '';

  columns: InspectionTaskColumn[] = [
    { key: 'taskCode', label: 'Task Code', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'taskTitle', label: 'Task Title', visible: true },
    { key: 'taskCategory', label: 'Task Category', visible: true },
    { key: 'taskDescription', label: 'Task Description', visible: true },
    { key: 'responseType', label: 'Response Type', visible: true },
    { key: 'isCritical', label: 'Critical Task', visible: true },
    { key: 'isMandatory', label: 'Mandatory', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'taskCode', label: 'Task Code' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'taskTitle', label: 'Task Title' },
    { key: 'taskCategory', label: 'Task Category' },
    { key: 'taskDescription', label: 'Task Description' },
    { key: 'responseType', label: 'Response Type' },
    { key: 'isCritical', label: 'Critical Task' },
    { key: 'isMandatory', label: 'Mandatory' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: InspectionTaskRow[] = [];
  filteredRecords: InspectionTaskRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: InspectionTaskRow | null = null;

  form: InspectionTaskItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: InspectionTaskService,
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
      const match = this.records.find((r) => r.taskTitle === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get taskCategoryMaster() {
    return this.service.taskCategoryMaster;
  }

  get responseTypeMaster() {
    return this.service.responseTypeMaster;
  }

  private emptyForm(): InspectionTaskItem {
    return {
      taskCode: '',
      assetId: '',
      assetName: '',
      taskTitle: '',
      taskCategory: '',
      taskDescription: '',
      responseType: '',
      isCritical: false,
      isMandatory: false,
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

  toggleColumn(col: InspectionTaskColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): InspectionTaskRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: InspectionTaskRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as InspectionTaskRow[];
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

  editRow(record: InspectionTaskRow): void {
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
      this.service.updateRecord(this.editingRecord.taskCode, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.taskCode));
    this.refresh();
  }

  deleteRow(record: InspectionTaskRow): void {
    this.service.deleteRecords([record.taskCode]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const criticalRaw = (row['isCritical'] ?? '').trim().toLowerCase();
      const mandatoryRaw = (row['isMandatory'] ?? '').trim().toLowerCase();
      const activeRaw = (row['status'] ?? '').trim().toLowerCase();
      this.service.addRecord({
        taskCode: row['taskCode'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        taskTitle: row['taskTitle'] ?? '',
        taskCategory: row['taskCategory'] ?? '',
        taskDescription: row['taskDescription'] ?? '',
        responseType: row['responseType'] ?? '',
        isCritical: criticalRaw === 'yes' || criticalRaw === 'true',
        isMandatory: mandatoryRaw === 'yes' || mandatoryRaw === 'true',
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
