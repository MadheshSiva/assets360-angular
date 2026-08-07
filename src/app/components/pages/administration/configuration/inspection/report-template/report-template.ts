import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from '@shared/import-file-modal/import-file-modal';
import { RowActions } from '@shared/row-actions/row-actions';
import { InspectionReportTemplateItem } from './report-template.model';
import { InspectionReportTemplateService } from './report-template.service';

interface InspectionReportTemplateRow extends InspectionReportTemplateItem {
  selected?: boolean;
}

interface InspectionReportTemplateColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-inspection-report-template',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './report-template.html',
  styleUrls: ['./report-template.css']
})
export class InspectionReportTemplate {
  searchTerm = '';

  columns: InspectionReportTemplateColumn[] = [
    { key: 'reportTemplateCode', label: 'Report Template Code', visible: true },
    { key: 'reportTitle', label: 'Report Title', visible: true },
    { key: 'reportNumberFormat', label: 'Report Number Format', visible: true },
    { key: 'includeOrganizationLogo', label: 'Include Organization Logo', visible: true },
    { key: 'includeOrganizationDetails', label: 'Include Organization Details', visible: true },
    { key: 'includeSiteDetails', label: 'Include Site Details', visible: true },
    { key: 'includeWorkOrderDetails', label: 'Include Work Order Details', visible: true },
    { key: 'includeAssetDetails', label: 'Include Asset Details', visible: true },
    { key: 'includeExecutiveSummary', label: 'Executive Summary', visible: true },
    { key: 'includeInspectorDetails', label: 'Inspector Details', visible: true },
    { key: 'includeAssetSummary', label: 'Asset Summary', visible: true },
    { key: 'includeTaskResponses', label: 'Task Responses', visible: true },
    { key: 'includePassOrFailResults', label: 'Pass or Fail Results', visible: true },
    { key: 'includeNotes', label: 'Notes', visible: true },
    { key: 'includeRemarks', label: 'Remarks', visible: true },
    { key: 'includePhotos', label: 'Photos', visible: true },
    { key: 'includeVideoLinks', label: 'Video Links', visible: true },
    { key: 'includeDefects', label: 'Defects', visible: true },
    { key: 'includeCorrectiveActions', label: 'Corrective Actions', visible: true },
    { key: 'includeApprovalHistory', label: 'Approval History', visible: true },
    { key: 'includeSignatures', label: 'Signatures', visible: true },
    { key: 'includeStamps', label: 'Stamps', visible: true },
    { key: 'includeAuditDetails', label: 'Audit Details', visible: true },
    { key: 'orientation', label: 'Portrait or Landscape', visible: true },
    { key: 'pageSize', label: 'Page Size', visible: true },
    { key: 'includeHeader', label: 'Header', visible: true },
    { key: 'includeFooter', label: 'Footer', visible: true },
    { key: 'includePageNumber', label: 'Page Number', visible: true },
    { key: 'includeWatermark', label: 'Watermark', visible: true },
    { key: 'confidentialityLabel', label: 'Confidentiality Label', visible: true },
    { key: 'photoSize', label: 'Photo Size', visible: true },
    { key: 'numberOfPhotosPerPage', label: 'Number of Photos per Page', visible: true },
    { key: 'includeFailedTasksOnly', label: 'Include Failed Tasks Only', visible: true },
    { key: 'includeCompleteInspection', label: 'Include Complete Inspection', visible: true },
    { key: 'includePreviousInspectionComparison', label: 'Include Previous Inspection Comparison', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'reportTemplateCode', label: 'Report Template Code' },
    { key: 'reportTitle', label: 'Report Title' },
    { key: 'reportNumberFormat', label: 'Report Number Format' },
    { key: 'includeOrganizationLogo', label: 'Include Organization Logo' },
    { key: 'includeOrganizationDetails', label: 'Include Organization Details' },
    { key: 'includeSiteDetails', label: 'Include Site Details' },
    { key: 'includeWorkOrderDetails', label: 'Include Work Order Details' },
    { key: 'includeAssetDetails', label: 'Include Asset Details' },
    { key: 'includeExecutiveSummary', label: 'Executive Summary' },
    { key: 'includeInspectorDetails', label: 'Inspector Details' },
    { key: 'includeAssetSummary', label: 'Asset Summary' },
    { key: 'includeTaskResponses', label: 'Task Responses' },
    { key: 'includePassOrFailResults', label: 'Pass or Fail Results' },
    { key: 'includeNotes', label: 'Notes' },
    { key: 'includeRemarks', label: 'Remarks' },
    { key: 'includePhotos', label: 'Photos' },
    { key: 'includeVideoLinks', label: 'Video Links' },
    { key: 'includeDefects', label: 'Defects' },
    { key: 'includeCorrectiveActions', label: 'Corrective Actions' },
    { key: 'includeApprovalHistory', label: 'Approval History' },
    { key: 'includeSignatures', label: 'Signatures' },
    { key: 'includeStamps', label: 'Stamps' },
    { key: 'includeAuditDetails', label: 'Audit Details' },
    { key: 'orientation', label: 'Portrait or Landscape' },
    { key: 'pageSize', label: 'Page Size' },
    { key: 'includeHeader', label: 'Header' },
    { key: 'includeFooter', label: 'Footer' },
    { key: 'includePageNumber', label: 'Page Number' },
    { key: 'includeWatermark', label: 'Watermark' },
    { key: 'confidentialityLabel', label: 'Confidentiality Label' },
    { key: 'photoSize', label: 'Photo Size' },
    { key: 'numberOfPhotosPerPage', label: 'Number of Photos per Page' },
    { key: 'includeFailedTasksOnly', label: 'Include Failed Tasks Only' },
    { key: 'includeCompleteInspection', label: 'Include Complete Inspection' },
    { key: 'includePreviousInspectionComparison', label: 'Include Previous Inspection Comparison' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: InspectionReportTemplateRow[] = [];
  filteredRecords: InspectionReportTemplateRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: InspectionReportTemplateRow | null = null;

  form: InspectionReportTemplateItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: InspectionReportTemplateService,
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
      const match = this.records.find((r) => r.reportTitle === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get orientationMaster() {
    return this.service.orientationMaster;
  }

  get pageSizeMaster() {
    return this.service.pageSizeMaster;
  }

  get photoSizeMaster() {
    return this.service.photoSizeMaster;
  }

  private emptyForm(): InspectionReportTemplateItem {
    return {
      reportTemplateCode: '',
      reportTitle: '',
      reportNumberFormat: '',
      includeOrganizationLogo: false,
      includeOrganizationDetails: false,
      includeSiteDetails: false,
      includeWorkOrderDetails: false,
      includeAssetDetails: false,
      includeExecutiveSummary: false,
      includeInspectorDetails: false,
      includeAssetSummary: false,
      includeTaskResponses: false,
      includePassOrFailResults: false,
      includeNotes: false,
      includeRemarks: false,
      includePhotos: false,
      includeVideoLinks: false,
      includeDefects: false,
      includeCorrectiveActions: false,
      includeApprovalHistory: false,
      includeSignatures: false,
      includeStamps: false,
      includeAuditDetails: false,
      orientation: '',
      pageSize: '',
      includeHeader: false,
      includeFooter: false,
      includePageNumber: false,
      includeWatermark: false,
      confidentialityLabel: '',
      photoSize: '',
      numberOfPhotosPerPage: 0,
      includeFailedTasksOnly: false,
      includeCompleteInspection: false,
      includePreviousInspectionComparison: false,
      status: true
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

  toggleColumn(col: InspectionReportTemplateColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): InspectionReportTemplateRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: InspectionReportTemplateRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as InspectionReportTemplateRow[];
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

  editRow(record: InspectionReportTemplateRow): void {
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
      this.service.updateRecord(this.editingRecord.reportTemplateCode, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.reportTemplateCode));
    this.refresh();
  }

  deleteRow(record: InspectionReportTemplateRow): void {
    this.service.deleteRecords([record.reportTemplateCode]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  private toBool(raw: string | undefined): boolean {
    const value = (raw ?? '').trim().toLowerCase();
    return value === 'yes' || value === 'true';
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      this.service.addRecord({
        reportTemplateCode: row['reportTemplateCode'] ?? '',
        reportTitle: row['reportTitle'] ?? '',
        reportNumberFormat: row['reportNumberFormat'] ?? '',
        includeOrganizationLogo: this.toBool(row['includeOrganizationLogo']),
        includeOrganizationDetails: this.toBool(row['includeOrganizationDetails']),
        includeSiteDetails: this.toBool(row['includeSiteDetails']),
        includeWorkOrderDetails: this.toBool(row['includeWorkOrderDetails']),
        includeAssetDetails: this.toBool(row['includeAssetDetails']),
        includeExecutiveSummary: this.toBool(row['includeExecutiveSummary']),
        includeInspectorDetails: this.toBool(row['includeInspectorDetails']),
        includeAssetSummary: this.toBool(row['includeAssetSummary']),
        includeTaskResponses: this.toBool(row['includeTaskResponses']),
        includePassOrFailResults: this.toBool(row['includePassOrFailResults']),
        includeNotes: this.toBool(row['includeNotes']),
        includeRemarks: this.toBool(row['includeRemarks']),
        includePhotos: this.toBool(row['includePhotos']),
        includeVideoLinks: this.toBool(row['includeVideoLinks']),
        includeDefects: this.toBool(row['includeDefects']),
        includeCorrectiveActions: this.toBool(row['includeCorrectiveActions']),
        includeApprovalHistory: this.toBool(row['includeApprovalHistory']),
        includeSignatures: this.toBool(row['includeSignatures']),
        includeStamps: this.toBool(row['includeStamps']),
        includeAuditDetails: this.toBool(row['includeAuditDetails']),
        orientation: row['orientation'] ?? '',
        pageSize: row['pageSize'] ?? '',
        includeHeader: this.toBool(row['includeHeader']),
        includeFooter: this.toBool(row['includeFooter']),
        includePageNumber: this.toBool(row['includePageNumber']),
        includeWatermark: this.toBool(row['includeWatermark']),
        confidentialityLabel: row['confidentialityLabel'] ?? '',
        photoSize: row['photoSize'] ?? '',
        numberOfPhotosPerPage: Number(row['numberOfPhotosPerPage'] ?? 0) || 0,
        includeFailedTasksOnly: this.toBool(row['includeFailedTasksOnly']),
        includeCompleteInspection: this.toBool(row['includeCompleteInspection']),
        includePreviousInspectionComparison: this.toBool(row['includePreviousInspectionComparison']),
        status: this.toBool(row['status'])
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
