import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterManagementCostCenterItem } from './cost-center.model';
import { MasterManagementCostCenterService } from './cost-center.service';

interface MasterManagementCostCenterRow extends MasterManagementCostCenterItem {
  selected?: boolean;
}

interface MasterManagementCostCenterColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-master-management-cost-center',
  imports: [CommonModule, FormsModule],
  templateUrl: './cost-center.html',
  styleUrls: ['./cost-center.css']
})
export class MasterManagementCostCenter {
  searchTerm = '';

  columns: MasterManagementCostCenterColumn[] = [
    { key: 'costCenterId', label: 'Cost Center ID', visible: true },
    { key: 'costCenterName', label: 'Cost Center Name', visible: true },
    { key: 'costCenterCode', label: 'Cost Center Code', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'departmentId', label: 'Department', visible: true },
    { key: 'parentCostCenterId', label: 'Parent Cost Center', visible: true },
    { key: 'manager', label: 'Manager', visible: true },
    { key: 'budgetAmount', label: 'Budget Amount', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  showColumnPicker = false;

  records: MasterManagementCostCenterRow[] = [];
  filteredRecords: MasterManagementCostCenterRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: MasterManagementCostCenterRow | null = null;

  form: MasterManagementCostCenterItem = this.emptyForm();

  constructor(private service: MasterManagementCostCenterService) {
    this.refresh();
  }

  get departmentMaster() {
    return this.service.departmentMaster;
  }

  get managerMaster() {
    return this.service.managerMaster;
  }

  get statusMaster() {
    return this.service.statusMaster;
  }

  get otherCostCenters(): MasterManagementCostCenterItem[] {
    const currentId = this.editingRecord?.costCenterId;
    return this.records.filter((r) => r.costCenterId !== currentId);
  }

  private emptyForm(): MasterManagementCostCenterItem {
    return {
      costCenterId: '',
      costCenterName: '',
      costCenterCode: '',
      description: '',
      departmentId: '',
      parentCostCenterId: '',
      manager: '',
      budgetAmount: null,
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

  toggleColumn(col: MasterManagementCostCenterColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): MasterManagementCostCenterRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: MasterManagementCostCenterRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as MasterManagementCostCenterRow[];
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
      this.service.updateRecord(this.editingRecord.costCenterId, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.costCenterId));
    this.refresh();
  }

  onUpload(): void {
  }

  onDownload(): void {
  }

  departmentName(departmentId: string): string {
    return this.service.departmentMaster.find((d) => d.id === departmentId)?.name || '-';
  }

  costCenterName(costCenterId: string): string {
    return this.records.find((r) => r.costCenterId === costCenterId)?.costCenterName || '-';
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
