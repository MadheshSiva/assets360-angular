import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { ConditionName, MasterManagementConditionMasterItem } from './condition-master.model';
import { MasterManagementConditionMasterService } from './condition-master.service';

interface MasterManagementConditionMasterRow extends MasterManagementConditionMasterItem {
  selected?: boolean;
}

interface MasterManagementConditionMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-condition-master',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './condition-master.html',
  styleUrls: ['./condition-master.css']
})
export class MasterManagementConditionMaster {
  searchTerm = '';

  columns: MasterManagementConditionMasterColumn[] = [
    { key: 'conditionId', label: 'Condition ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'conditionName', label: 'Condition Name', visible: true },
    { key: 'thresholdValue', label: 'Threshold Value', visible: true },
    { key: 'colorCode', label: 'Color Code', visible: true }
  ];

  showColumnPicker = false;

  readonly importColumns: ImportColumn[] = [
    { key: 'conditionId', label: 'Condition ID' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'conditionName', label: 'Condition Name' },
    { key: 'thresholdValue', label: 'Threshold Value' },
    { key: 'colorCode', label: 'Color Code' }
  ];

  showImportModal = false;

  records: MasterManagementConditionMasterRow[] = [];
  filteredRecords: MasterManagementConditionMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementConditionMasterRow | null = null;

  form: MasterManagementConditionMasterItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementConditionMasterService,
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
      const match = this.records.find((r) => r.conditionName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get conditionNameMaster() {
    return this.service.conditionNameMaster;
  }

  private emptyForm(): MasterManagementConditionMasterItem {
    return {
      conditionId: '',
      assetId: '',
      assetName: '',
      conditionName: '',
      thresholdValue: null,
      colorCode: ''
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

  toggleColumn(col: MasterManagementConditionMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementConditionMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementConditionMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementConditionMasterRow[];
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

  editRow(record: MasterManagementConditionMasterRow): void {
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
      this.service.updateRecord(this.editingRecord.conditionId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.conditionId));
    this.refresh();
  }

  deleteRow(record: MasterManagementConditionMasterRow): void {
    this.service.deleteRecords([record.conditionId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    this.records = [
      ...this.records,
      ...rows.map((row) => ({
        conditionId: row['conditionId'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        conditionName: (row['conditionName'] ?? '') as ConditionName | '',
        thresholdValue: row['thresholdValue'] ? Number(row['thresholdValue']) : null,
        colorCode: row['colorCode'] ?? ''
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
