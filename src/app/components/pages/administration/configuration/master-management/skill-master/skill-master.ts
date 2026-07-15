import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './skill-master.html',
  styleUrls: ['./skill-master.css']
})
export class MasterManagementSkillMaster {
  searchTerm = '';

  columns: MasterManagementSkillMasterColumn[] = [
    { key: 'skillId', label: 'Skill ID', visible: true },
    { key: 'skillName', label: 'Skill Name', visible: true },
    { key: 'skillLevel', label: 'Skill Level', visible: true },
    { key: 'certificationRequired', label: 'Certification Required', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementSkillMasterRow[] = [];
  filteredRecords: MasterManagementSkillMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementSkillMasterRow | null = null;

  form: MasterManagementSkillMasterItem = this.emptyForm();

  constructor(private service: MasterManagementSkillMasterService) {
    this.refresh();
  }

  get skillLevelMaster() {
    return this.service.skillLevelMaster;
  }

  private emptyForm(): MasterManagementSkillMasterItem {
    return {
      skillId: '',
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
    const record = this.selectedRecords[0];
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

  onUpload(): void {
  }

  onDownload(): void {
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
