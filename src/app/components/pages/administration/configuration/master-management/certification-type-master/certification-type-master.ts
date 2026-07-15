import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementCertificationTypeMasterItem } from './certification-type-master.model';
import { MasterManagementCertificationTypeMasterService } from './certification-type-master.service';

interface MasterManagementCertificationTypeMasterRow extends MasterManagementCertificationTypeMasterItem {
  selected?: boolean;
}

interface MasterManagementCertificationTypeMasterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-certification-type-master',
  imports: [CommonModule, FormsModule],
  templateUrl: './certification-type-master.html',
  styleUrls: ['./certification-type-master.css']
})
export class MasterManagementCertificationTypeMaster {
  searchTerm = '';

  columns: MasterManagementCertificationTypeMasterColumn[] = [
    { key: 'certificationTypeId', label: 'Certification ID', visible: true },
    { key: 'certificationName', label: 'Certification Name', visible: true },
    { key: 'certificationCode', label: 'Certification Code', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'applicableAssetType', label: 'Applicable Asset Type', visible: true },
    { key: 'issuingAuthority', label: 'Issuing Authority', visible: true },
    { key: 'validityPeriodDays', label: 'Validity Period (Days)', visible: true },
    { key: 'renewalRequired', label: 'Renewal Required', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementCertificationTypeMasterRow[] = [];
  filteredRecords: MasterManagementCertificationTypeMasterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementCertificationTypeMasterRow | null = null;

  form: MasterManagementCertificationTypeMasterItem = this.emptyForm();

  constructor(private service: MasterManagementCertificationTypeMasterService) {
    this.refresh();
  }

  get applicableAssetTypeMaster() {
    return this.service.applicableAssetTypeMaster;
  }

  get renewalRequiredMaster() {
    return this.service.renewalRequiredMaster;
  }

  get statusMaster() {
    return this.service.statusMaster;
  }

  private emptyForm(): MasterManagementCertificationTypeMasterItem {
    return {
      certificationTypeId: '',
      certificationName: '',
      certificationCode: '',
      description: '',
      applicableAssetType: '',
      issuingAuthority: '',
      validityPeriodDays: null,
      renewalRequired: '',
      status: ''
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

  toggleColumn(col: MasterManagementCertificationTypeMasterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementCertificationTypeMasterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementCertificationTypeMasterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementCertificationTypeMasterRow[];
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
      this.service.updateRecord(this.editingRecord.certificationTypeId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.certificationTypeId));
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
