import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TechnicianRecord, TechnicianForm } from './technician.model';
import { TechnicianService } from './technician.service';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { RowActions } from '@shared/row-actions/row-actions';

interface TechnicianColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-maintenance-technician',
  imports: [CommonModule, FormsModule, ImportFileModal, MasterLinkIcons, RowActions],
  templateUrl: './technician.html',
  styleUrls: ['./technician.css']
})
export class MaintenanceTechnician {
  searchTerm = '';

  columns: TechnicianColumn[] = [
    { key: 'technicianId', label: 'Technician ID', visible: true },
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'name', label: 'Name', visible: true },
    { key: 'skillSet', label: 'Skill Set', visible: true },
    { key: 'certification', label: 'Certification', visible: true },
    { key: 'availability', label: 'Availability', visible: true },
    { key: 'assignedTasks', label: 'Assigned Tasks', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'technicianId', label: 'Technician ID' },
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'name', label: 'Name' },
    { key: 'skillSet', label: 'Skill Set' },
    { key: 'certification', label: 'Certification' },
    { key: 'availability', label: 'Availability' },
    { key: 'assignedTasks', label: 'Assigned Tasks' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  technicians: TechnicianRecord[] = [];
  filteredTechnicians: TechnicianRecord[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingTechnician: TechnicianRecord | null = null;

  form: TechnicianForm = this.emptyForm();

  constructor(private technicianService: TechnicianService) {
    this.refresh();
  }

  get technicianMaster() {
    return this.technicianService.technicianMaster;
  }

  get skillMaster() {
    return this.technicianService.skillMaster;
  }

  get certificationMaster() {
    return this.technicianService.certificationMaster;
  }

  get availabilityMaster() {
    return this.technicianService.availabilityMaster;
  }

  private emptyForm(): TechnicianForm {
    return {
      technicianId: '',
      assetId: '',
      assetName: '',
      name: '',
      skillSet: '',
      certification: '',
      availability: ''
    };
  }

  private refresh(): void {
    this.technicians = this.technicianService.getTechnicians();
    this.onSearch();
  }

  onTechnicianIdChange(): void {
    this.form.name = this.technicianService.technicianName(this.form.technicianId);
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

  toggleColumn(col: TechnicianColumn): void {
    col.visible = !col.visible;
  }

  get selectedTechnicians(): TechnicianRecord[] {
    return this.filteredTechnicians.filter((t) => t.selected);
  }

  get allSelected(): boolean {
    return this.filteredTechnicians.length > 0 && this.filteredTechnicians.every((t) => t.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredTechnicians.forEach((t) => (t.selected = next));
  }

  toggleSelectTechnician(technician: TechnicianRecord): void {
    technician.selected = !technician.selected;
  }

  onSearch(): void {
    this.filteredTechnicians = this.technicianService.search(this.searchTerm);
  }

  onRefresh(): void {
    this.searchTerm = '';
    this.refresh();
  }

  onCreate(): void {
    this.isEditMode = false;
    this.editingTechnician = null;
    this.form = this.emptyForm();
    this.showFormModal = true;
  }

  onEdit(): void {
    if (this.selectedTechnicians.length !== 1) return;
    this.editRow(this.selectedTechnicians[0]);
  }

  editRow(technician: TechnicianRecord): void {
    this.isEditMode = true;
    this.editingTechnician = technician;
    const { selected, assignedTasks, ...rest } = technician;
    this.form = { ...rest };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingTechnician = null;
  }

  submitForm(): void {
    if (this.isEditMode && this.editingTechnician) {
      this.technicianService.updateTechnician(this.editingTechnician, { ...this.editingTechnician, ...this.form });
    } else {
      this.technicianService.addTechnician({ ...this.form, assignedTasks: 0 });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedTechnicians.length === 0) return;
    this.technicianService.deleteTechnicians(this.selectedTechnicians);
    this.refresh();
  }

  deleteRow(technician: TechnicianRecord): void {
    this.technicianService.deleteTechnicians([technician]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.technicianService.addTechnician({
        technicianId: row['technicianId'] ?? '',
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        name: row['name'] ?? '',
        skillSet: row['skillSet'] ?? '',
        certification: row['certification'] ?? '',
        availability: row['availability'] ?? '',
        assignedTasks: this.toNumber(row['assignedTasks']) ?? 0
      });
    });
    this.refresh();
    this.showImportModal = false;
  }

  private toNumber(value: string | undefined): number | null {
    if (value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }

  onDownload(): void {
    // TODO: export current technician list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
