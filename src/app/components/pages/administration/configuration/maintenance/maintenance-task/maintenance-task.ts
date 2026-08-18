import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceTaskRecord, MaintenanceTaskForm } from './maintenance-task.model';
import { MaintenanceTaskService } from './maintenance-task.service';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';

interface TaskColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-maintenance-task',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './maintenance-task.html',
  styleUrls: ['./maintenance-task.css']
})
export class MaintenanceTask {
  searchTerm = '';

  columns: TaskColumn[] = [
    { key: 'assetId', label: 'Asset ID', visible: true },
    { key: 'assetName', label: 'Asset Name', visible: true },
    { key: 'taskChecklist', label: 'Task Checklist', visible: true },
    { key: 'instructions', label: 'Instructions', visible: true },
    { key: 'toolsRequired', label: 'Tools Required', visible: true },
    { key: 'safetyProcedures', label: 'Safety Procedures', visible: true },
    { key: 'estimatedDuration', label: 'Estimated Duration', visible: true },
    { key: 'completionNotes', label: 'Completion Notes', visible: false }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'assetId', label: 'Asset ID' },
    { key: 'assetName', label: 'Asset Name' },
    { key: 'taskChecklist', label: 'Task Checklist' },
    { key: 'instructions', label: 'Instructions' },
    { key: 'toolsRequired', label: 'Tools Required' },
    { key: 'safetyProcedures', label: 'Safety Procedures' },
    { key: 'estimatedDuration', label: 'Estimated Duration' },
    { key: 'completionNotes', label: 'Completion Notes' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  tasks: MaintenanceTaskRecord[] = [];
  filteredTasks: MaintenanceTaskRecord[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingTask: MaintenanceTaskRecord | null = null;

  form: MaintenanceTaskForm = this.emptyForm();

  constructor(private taskService: MaintenanceTaskService) {
    this.refresh();
  }

  get checklistMaster() {
    return this.taskService.checklistMaster;
  }

  get toolsMaster() {
    return this.taskService.toolsMaster;
  }

  private emptyForm(): MaintenanceTaskForm {
    return {
      assetId: '',
      assetName: '',
      taskChecklist: [],
      instructions: '',
      toolsRequired: [],
      safetyProcedures: '',
      estimatedDuration: null,
      completionNotes: ''
    };
  }

  private refresh(): void {
    this.tasks = this.taskService.getTasks();
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

  toggleColumn(col: TaskColumn): void {
    col.visible = !col.visible;
  }

  get selectedTasks(): MaintenanceTaskRecord[] {
    return this.filteredTasks.filter((t) => t.selected);
  }

  get allSelected(): boolean {
    return this.filteredTasks.length > 0 && this.filteredTasks.every((t) => t.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredTasks.forEach((t) => (t.selected = next));
  }

  toggleSelectTask(task: MaintenanceTaskRecord): void {
    task.selected = !task.selected;
  }

  onSearch(): void {
    this.filteredTasks = this.taskService.search(this.searchTerm);
  }

  onRefresh(): void {
    this.searchTerm = '';
    this.refresh();
  }

  onCreate(): void {
    this.isEditMode = false;
    this.editingTask = null;
    this.form = this.emptyForm();
    this.showFormModal = true;
  }

  onEdit(): void {
    if (this.selectedTasks.length !== 1) return;
    this.editRow(this.selectedTasks[0]);
  }

  editRow(task: MaintenanceTaskRecord): void {
    this.isEditMode = true;
    this.editingTask = task;
    const { selected, ...rest } = task;
    this.form = { ...rest, taskChecklist: [...rest.taskChecklist], toolsRequired: [...rest.toolsRequired] };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingTask = null;
  }

  submitForm(): void {
    if (this.isEditMode && this.editingTask) {
      this.taskService.updateTask(this.editingTask, { ...this.form });
    } else {
      this.taskService.addTask({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedTasks.length === 0) return;
    this.taskService.deleteTasks(this.selectedTasks);
    this.refresh();
  }

  deleteRow(task: MaintenanceTaskRecord): void {
    this.taskService.deleteTasks([task]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.taskService.addTask({
        assetId: row['assetId'] ?? '',
        assetName: row['assetName'] ?? '',
        taskChecklist: (row['taskChecklist'] ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        instructions: row['instructions'] ?? '',
        toolsRequired: (row['toolsRequired'] ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        safetyProcedures: row['safetyProcedures'] ?? '',
        estimatedDuration: this.toNumber(row['estimatedDuration']),
        completionNotes: row['completionNotes'] ?? ''
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
    // TODO: export current maintenance task list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
