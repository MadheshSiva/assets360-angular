import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreakdownIssueRecord, BreakdownIssueForm } from './breakdown-issue-reporting.model';
import { BreakdownIssueReportingService } from './breakdown-issue-reporting.service';

interface IssueColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-maintenance-breakdown-issue-reporting',
  imports: [CommonModule, FormsModule],
  templateUrl: './breakdown-issue-reporting.html',
  styleUrls: ['./breakdown-issue-reporting.css']
})
export class MaintenanceBreakdownIssueReporting {
  searchTerm = '';

  columns: IssueColumn[] = [
    { key: 'issueId', label: 'Issue ID', visible: true },
    { key: 'reportedBy', label: 'Reported By', visible: true },
    { key: 'issueType', label: 'Issue Type', visible: true },
    { key: 'severity', label: 'Severity', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'attachments', label: 'Images / Attachments', visible: false },
    { key: 'rootCause', label: 'Root Cause', visible: false },
    { key: 'resolutionAction', label: 'Resolution Action', visible: false }
  ];

  showColumnPicker = false;

  issues: BreakdownIssueRecord[] = [];
  filteredIssues: BreakdownIssueRecord[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingIssue: BreakdownIssueRecord | null = null;

  form: BreakdownIssueForm = this.emptyForm();

  constructor(private issueService: BreakdownIssueReportingService) {
    this.refresh();
  }

  get userMaster() {
    return this.issueService.userMaster;
  }

  get issueTypeMaster() {
    return this.issueService.issueTypeMaster;
  }

  get severityMaster() {
    return this.issueService.severityMaster;
  }

  private emptyForm(): BreakdownIssueForm {
    return {
      issueId: '',
      reportedBy: '',
      issueType: '',
      severity: '',
      description: '',
      attachments: [],
      rootCause: '',
      resolutionAction: ''
    };
  }

  private refresh(): void {
    this.issues = this.issueService.getIssues();
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

  toggleColumn(col: IssueColumn): void {
    col.visible = !col.visible;
  }

  get selectedIssues(): BreakdownIssueRecord[] {
    return this.filteredIssues.filter((i) => i.selected);
  }

  get allSelected(): boolean {
    return this.filteredIssues.length > 0 && this.filteredIssues.every((i) => i.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredIssues.forEach((i) => (i.selected = next));
  }

  toggleSelectIssue(issue: BreakdownIssueRecord): void {
    issue.selected = !issue.selected;
  }

  onSearch(): void {
    this.filteredIssues = this.issueService.search(this.searchTerm);
  }

  onRefresh(): void {
    this.searchTerm = '';
    this.refresh();
  }

  onCreate(): void {
    this.isEditMode = false;
    this.editingIssue = null;
    this.form = this.emptyForm();
    this.showFormModal = true;
  }

  onEdit(): void {
    if (this.selectedIssues.length !== 1) return;
    const issue = this.selectedIssues[0];
    this.isEditMode = true;
    this.editingIssue = issue;
    const { selected, ...rest } = issue;
    this.form = { ...rest, attachments: [...rest.attachments] };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingIssue = null;
  }

  onAttachmentsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.attachments = input.files ? Array.from(input.files).map((f) => f.name) : [];
  }

  submitForm(): void {
    if (this.isEditMode && this.editingIssue) {
      this.issueService.updateIssue(this.editingIssue.issueId, { ...this.form });
    } else {
      this.issueService.addIssue({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedIssues.length === 0) return;
    this.issueService.deleteIssues(this.selectedIssues.map((i) => i.issueId));
    this.refresh();
  }

  onUpload(): void {
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
  }

  onDownload(): void {
    // TODO: export current breakdown/issue report list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
