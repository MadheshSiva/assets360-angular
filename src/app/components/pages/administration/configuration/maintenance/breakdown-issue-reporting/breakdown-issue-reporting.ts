import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { MasterLinkIcons } from '@shared/master-link-icons/master-link-icons';
import { RowActions } from '@shared/row-actions/row-actions';
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
  imports: [CommonModule, FormsModule, ImportFileModal, MasterLinkIcons, RowActions],
  templateUrl: './breakdown-issue-reporting.html',
  styleUrls: ['./breakdown-issue-reporting.css']
})
export class MaintenanceBreakdownIssueReporting {
  searchTerm = '';

  columns: IssueColumn[] = [
    { key: 'issueId', label: 'Issue ID', visible: true },
    { key: 'assetId', label: 'Asset', visible: true },
    { key: 'reportedBy', label: 'Reported By', visible: true },
    { key: 'issueType', label: 'Issue Type', visible: true },
    { key: 'severity', label: 'Severity', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'attachments', label: 'Images / Attachments', visible: false },
    { key: 'rootCause', label: 'Root Cause', visible: false },
    { key: 'resolutionAction', label: 'Resolution Action', visible: false }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'issueId', label: 'Issue ID' },
    { key: 'assetId', label: 'Asset' },
    { key: 'reportedBy', label: 'Reported By' },
    { key: 'issueType', label: 'Issue Type' },
    { key: 'severity', label: 'Severity' },
    { key: 'description', label: 'Description' },
    { key: 'attachments', label: 'Images / Attachments' },
    { key: 'rootCause', label: 'Root Cause' },
    { key: 'resolutionAction', label: 'Resolution Action' }
  ];

  showImportModal = false;

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

  get assetMaster() {
    return this.issueService.assetMaster;
  }

  assetName(assetId: string): string {
    return this.assetMaster.find((a) => a.id === assetId)?.name ?? assetId;
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
      assetId: '',
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
    this.editRow(this.selectedIssues[0]);
  }

  editRow(issue: BreakdownIssueRecord): void {
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

  deleteRow(issue: BreakdownIssueRecord): void {
    this.issueService.deleteIssues([issue.issueId]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.issueService.addIssue({
        issueId: row['issueId'] ?? '',
        assetId: row['assetId'] ?? '',
        reportedBy: row['reportedBy'] ?? '',
        issueType: row['issueType'] ?? '',
        severity: row['severity'] ?? '',
        description: row['description'] ?? '',
        attachments: row['attachments']
          ? row['attachments'].split(',').map((a) => a.trim()).filter(Boolean)
          : [],
        rootCause: row['rootCause'] ?? '',
        resolutionAction: row['resolutionAction'] ?? ''
      });
    });
    this.refresh();
    this.showImportModal = false;
  }

  onDownload(): void {
    // TODO: export current breakdown/issue report list
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeColumnPicker();
  }
}
