import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
import { MasterManagementSkillMasterItem } from './skill-master.model';
import { MasterManagementSkillMasterService } from './skill-master.service';

interface MasterManagementSkillMasterRow extends MasterManagementSkillMasterItem {
  selected?: boolean;
}

interface MasterManagementSkillMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-skill-master',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './skill-master.html',
  styleUrls: ['./skill-master.css']
})
export class MasterManagementSkillMaster {
  searchTerm = '';

  columns: MasterManagementSkillMasterColumn[] = [
    { key: 'skillId', label: 'Skill ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'skillName', label: 'Skill Name', visible: true },
    { key: 'skillLevel', label: 'Skill Level', visible: true },
    { key: 'certificationRequired', label: 'Certification Required', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'skillId', label: 'Skill ID' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'skillName', label: 'Skill Name' },
    { key: 'skillLevel', label: 'Skill Level' },
    { key: 'certificationRequired', label: 'Certification Required' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: MasterManagementSkillMasterRow[] = [];
  filteredRecords: MasterManagementSkillMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementSkillMasterRow | null = null;

  form: MasterManagementSkillMasterItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: MasterManagementSkillMasterService,
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
      const match = this.records.find((r) => r.skillName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get skillLevelMaster() {
    return this.service.skillLevelMaster;
  }

  private emptyForm(): MasterManagementSkillMasterItem {
    return {
      skillId: '',
      assetId: '',
      assetName: '',
      skillName: '',
      skillLevel: '',
      certificationRequired: false
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

  toggleColumn(col: MasterManagementSkillMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementSkillMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementSkillMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementSkillMasterRow[];
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

  editRow(record: MasterManagementSkillMasterRow): void {
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
      this.service.updateRecord(this.editingRecord.skillId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.skillId));
    this.refresh();
  }

  deleteRow(record: MasterManagementSkillMasterRow): void {
    this.service.deleteRecords([record.skillId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    const toBool = (v?: string) => ['true', 'yes', '1'].includes((v ?? '').trim().toLowerCase());
    rows.forEach((row) => {
      this.service.addRecord({
        skillId: row['skillId'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        skillName: row['skillName'] ?? '',
        skillLevel: (row['skillLevel'] as MasterManagementSkillMasterItem['skillLevel']) || '',
        certificationRequired: toBool(row['certificationRequired'])
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
