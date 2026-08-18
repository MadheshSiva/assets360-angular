import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { InspectionDepartmentItem, InspectionDepartmentRow } from './department.model';
import { InspectionDepartmentService } from './department.service';

interface InspectionDepartmentColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-inspection-department',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions, MasterLinkIcons],
  templateUrl: './department.html',
  styleUrls: ['./department.css']
})
export class InspectionDepartment {
  searchTerm = '';

  columns: InspectionDepartmentColumn[] = [
    { key: 'departmentCode', label: 'Department Code', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'departmentName', label: 'Department Name', visible: true },
    { key: 'businessUnit', label: 'Business Unit', visible: true },
    { key: 'departmentHead', label: 'Department Head', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'departmentCode', label: 'Department Code' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'departmentName', label: 'Department Name' },
    { key: 'businessUnit', label: 'Business Unit' },
    { key: 'departmentHead', label: 'Department Head' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: InspectionDepartmentRow[] = [];
  filteredRecords: InspectionDepartmentRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: InspectionDepartmentRow | null = null;

  form: InspectionDepartmentItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: InspectionDepartmentService,
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
      const match = this.records.find((r) => r.departmentName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get businessUnitMaster() {
    return this.service.businessUnitMaster;
  }

  private emptyForm(): InspectionDepartmentItem {
    return {
      departmentCode: '',
      assetId: '',
      assetName: '',
      departmentName: '',
      businessUnit: '',
      departmentHead: '',
      description: '',
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

  toggleColumn(col: InspectionDepartmentColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): InspectionDepartmentRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: InspectionDepartmentRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as InspectionDepartmentRow[];
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

  editRow(record: InspectionDepartmentRow): void {
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
      this.service.updateRecord(this.editingRecord.departmentCode, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.departmentCode));
    this.refresh();
  }

  deleteRow(record: InspectionDepartmentRow): void {
    this.service.deleteRecords([record.departmentCode]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const activeRaw = (row['status'] ?? '').trim().toLowerCase();
      this.service.addRecord({
        departmentCode: row['departmentCode'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        departmentName: row['departmentName'] ?? '',
        businessUnit: row['businessUnit'] ?? '',
        departmentHead: row['departmentHead'] ?? '',
        description: row['description'] ?? '',
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
