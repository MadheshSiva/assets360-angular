import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResourceMaster } from './resource-master.model';
import { ResourceMasterService } from './resource-master.service';

interface ResourceMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-wip-resource-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './resource-master.html',
  styleUrls: ['./resource-master.css']
})
export class WipResourceMaster {
  searchTerm = '';

  columns: ResourceMasterColumn[] = [
    { key: 'resourceId', label: 'Resource ID', visible: true },
    { key: 'resourceName', label: 'Resource Name', visible: true },
    { key: 'resourceType', label: 'Resource Type', visible: true },
    { key: 'skillSet', label: 'Skill Set', visible: true },
    { key: 'departmentId', label: 'Department ID', visible: true },
    { key: 'contactNumber', label: 'Contact Number', visible: true },
    { key: 'email', label: 'Email', visible: true },
    { key: 'availabilityStatus', label: 'Availability Status', visible: true },
    { key: 'shiftId', label: 'Shift ID', visible: true },
    { key: 'costPerHour', label: 'Cost Per Hour', visible: true },
    { key: 'certificationDetails', label: 'Certification Details', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  showColumnPicker = false;

  records: ResourceMaster[] = [];
  filteredRecords: ResourceMaster[] = [];

  private selectedIds = new Set<string>();

  showFormModal = false;
  isEditMode = false;
  private editingRecord: ResourceMaster | null = null;

  form: ResourceMaster = this.emptyForm();

  constructor(private service: ResourceMasterService) {
    this.refresh();
  }

  get resourceTypeMaster() {
    return this.service.resourceTypeMaster;
  }

  get skillMaster() {
    return this.service.skillMaster;
  }

  get departmentMaster() {
    return this.service.departmentMaster;
  }

  get availabilityStatusMaster() {
    return this.service.availabilityStatusMaster;
  }

  get shiftMaster() {
    return this.service.shiftMaster;
  }

  private emptyForm(): ResourceMaster {
    return {
      resourceId: '',
      resourceName: '',
      resourceType: '',
      skillSet: [],
      departmentId: '',
      contactNumber: '',
      email: '',
      availabilityStatus: '',
      shiftId: '',
      costPerHour: null,
      certificationDetails: '',
      status: true
    };
  }

  private refresh(): void {
    this.records = this.service.getResources();
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

  toggleColumn(col: ResourceMasterColumn): void {
    col.visible = !col.visible;
  }

  isRecordSelected(record: ResourceMaster): boolean {
    return this.selectedIds.has(record.resourceId);
  }

  get selectedRecords(): ResourceMaster[] {
    return this.filteredRecords.filter((r) => this.selectedIds.has(r.resourceId));
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => this.selectedIds.has(r.resourceId));
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.filteredRecords.forEach((r) => this.selectedIds.delete(r.resourceId));
    } else {
      this.filteredRecords.forEach((r) => this.selectedIds.add(r.resourceId));
    }
  }

  toggleSelectRecord(record: ResourceMaster): void {
    if (this.selectedIds.has(record.resourceId)) {
      this.selectedIds.delete(record.resourceId);
    } else {
      this.selectedIds.add(record.resourceId);
    }
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm);
  }

  onRefresh(): void {
    this.searchTerm = '';
    this.selectedIds.clear();
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
    this.form = { ...record, skillSet: [...record.skillSet] };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingRecord = null;
  }

  isSkillSelected(skill: string): boolean {
    return this.form.skillSet.includes(skill);
  }

  toggleSkill(skill: string): void {
    this.form.skillSet = this.form.skillSet.includes(skill)
      ? this.form.skillSet.filter((s) => s !== skill)
      : [...this.form.skillSet, skill];
  }

  submitForm(): void {
    if (this.isEditMode && this.editingRecord) {
      this.service.updateRecord(this.editingRecord.resourceId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.selectedIds.clear();
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.resourceId));
    this.selectedIds.clear();
    this.refresh();
  }

  onUpload(): void {
  }

  onDownload(): void {
  }

  shiftName(shiftId: string): string {
    return this.shiftMaster.find((s) => s.id === shiftId)?.name ?? shiftId;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
