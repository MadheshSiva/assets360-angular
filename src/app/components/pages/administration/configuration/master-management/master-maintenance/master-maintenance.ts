import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { MasterManagementMasterItem } from './master-maintenance.model';
import { MasterManagementMasterService } from './master-maintenance.service';

interface MasterManagementMasterRow extends MasterManagementMasterItem {
  selected?: boolean;
}

interface MasterManagementMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-master',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './master-maintenance.html',
  styleUrls: ['./master-maintenance.css']
})
export class MasterManagementMaster {
  searchTerm = '';

  columns: MasterManagementMasterColumn[] = [
    { key: 'maintenanceId', label: 'Maintenance ID', visible: true },
    { key: 'maintenanceCode', label: 'Maintenance Code', visible: true },
    { key: 'maintenanceName', label: 'Maintenance Name', visible: true },
    { key: 'maintenanceCategory', label: 'Category', visible: true },
    { key: 'frequency', label: 'Frequency', visible: true },
    { key: 'standardDurationHours', label: 'Standard Duration (Hrs)', visible: true },
    { key: 'isActive', label: 'Active', visible: true }
  ];

  showColumnPicker = false;

  readonly importColumns: ImportColumn[] = [
    { key: 'maintenanceId', label: 'Maintenance ID' },
    { key: 'maintenanceCode', label: 'Maintenance Code' },
    { key: 'maintenanceName', label: 'Maintenance Name' },
    { key: 'maintenanceCategory', label: 'Category' },
    { key: 'frequency', label: 'Frequency' },
    { key: 'standardDurationHours', label: 'Standard Duration (Hrs)' },
    { key: 'isActive', label: 'Active' }
  ];

  showImportModal = false;

  records: MasterManagementMasterRow[] = [];
  filteredRecords: MasterManagementMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementMasterRow | null = null;

  form: MasterManagementMasterItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementMasterService,
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
      const match = this.records.find((r) => r.maintenanceName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get categoryMaster() {
    return this.service.categoryMaster;
  }

  get frequencyMaster() {
    return this.service.frequencyMaster;
  }

  private emptyForm(): MasterManagementMasterItem {
    return {
      maintenanceId: '',
      maintenanceCode: '',
      maintenanceName: '',
      maintenanceCategory: '',
      frequency: '',
      standardDurationHours: null,
      description: '',
      isActive: true
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

  toggleColumn(col: MasterManagementMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementMasterRow[];
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

  editRow(record: MasterManagementMasterRow): void {
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
      this.service.updateRecord(this.editingRecord.maintenanceId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.maintenanceId));
    this.refresh();
  }

  deleteRow(record: MasterManagementMasterRow): void {
    this.service.deleteRecords([record.maintenanceId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    this.records = [
      ...this.records,
      ...rows.map((row) => ({
        maintenanceId: row['maintenanceId'] ?? '',
        maintenanceCode: row['maintenanceCode'] ?? '',
        maintenanceName: row['maintenanceName'] ?? '',
        maintenanceCategory: row['maintenanceCategory'] ?? '',
        frequency: row['frequency'] ?? '',
        standardDurationHours: row['standardDurationHours'] ? Number(row['standardDurationHours']) : null,
        description: '',
        isActive: /^(true|yes|1)$/i.test(row['isActive'] ?? '')
      }))
    ];
    this.onSearch();
    this.showImportModal = false;
  }

  onDownload(): void {
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
