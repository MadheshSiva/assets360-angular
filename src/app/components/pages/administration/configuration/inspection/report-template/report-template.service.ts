import { Injectable } from '@angular/core';
import { InspectionReportTemplateItem } from './report-template.model';

@Injectable({ providedIn: 'root' })
export class InspectionReportTemplateService {
  readonly orientationMaster: string[] = ['Portrait', 'Landscape'];
  readonly pageSizeMaster: string[] = ['A4', 'Letter', 'Legal'];
  readonly photoSizeMaster: string[] = ['Small', 'Medium', 'Large'];

  private readonly records: InspectionReportTemplateItem[] = [
    {
      reportTemplateCode: 'RTPL-1001',
      reportTitle: 'Standard Inspection Report',
      reportNumberFormat: 'RPT-{{siteCode}}-{{year}}-{{seq}}',
      includeOrganizationLogo: true,
      includeOrganizationDetails: true,
      includeSiteDetails: true,
      includeWorkOrderDetails: true,
      includeAssetDetails: true,
      includeExecutiveSummary: true,
      includeInspectorDetails: true,
      includeAssetSummary: true,
      includeTaskResponses: true,
      includePassOrFailResults: true,
      includeNotes: true,
      includeRemarks: true,
      includePhotos: true,
      includeVideoLinks: false,
      includeDefects: true,
      includeCorrectiveActions: true,
      includeApprovalHistory: true,
      includeSignatures: true,
      includeStamps: true,
      includeAuditDetails: false,
      orientation: 'Portrait',
      pageSize: 'A4',
      includeHeader: true,
      includeFooter: true,
      includePageNumber: true,
      includeWatermark: false,
      confidentialityLabel: '',
      photoSize: 'Medium',
      numberOfPhotosPerPage: 4,
      includeFailedTasksOnly: false,
      includeCompleteInspection: true,
      includePreviousInspectionComparison: false,
      status: true
    },
    {
      reportTemplateCode: 'RTPL-1002',
      reportTitle: 'Compliance Audit Report',
      reportNumberFormat: 'RPT-AUDIT-{{year}}-{{seq}}',
      includeOrganizationLogo: true,
      includeOrganizationDetails: true,
      includeSiteDetails: true,
      includeWorkOrderDetails: false,
      includeAssetDetails: true,
      includeExecutiveSummary: true,
      includeInspectorDetails: false,
      includeAssetSummary: true,
      includeTaskResponses: true,
      includePassOrFailResults: true,
      includeNotes: false,
      includeRemarks: true,
      includePhotos: true,
      includeVideoLinks: false,
      includeDefects: false,
      includeCorrectiveActions: true,
      includeApprovalHistory: true,
      includeSignatures: true,
      includeStamps: true,
      includeAuditDetails: true,
      orientation: 'Portrait',
      pageSize: 'Letter',
      includeHeader: true,
      includeFooter: true,
      includePageNumber: true,
      includeWatermark: true,
      confidentialityLabel: 'Confidential',
      photoSize: 'Large',
      numberOfPhotosPerPage: 2,
      includeFailedTasksOnly: false,
      includeCompleteInspection: false,
      includePreviousInspectionComparison: true,
      status: true
    }
  ];

  private nextSequence = 1003;

  getRecords(): InspectionReportTemplateItem[] {
    return this.records;
  }

  addRecord(record: InspectionReportTemplateItem): InspectionReportTemplateItem {
    const reportTemplateCode = record.reportTemplateCode?.trim() || `RTPL-${this.nextSequence++}`;
    const created: InspectionReportTemplateItem = { ...record, reportTemplateCode };
    this.records.push(created);
    return created;
  }

  updateRecord(reportTemplateCode: string, changes: InspectionReportTemplateItem): void {
    const index = this.records.findIndex((r) => r.reportTemplateCode === reportTemplateCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(reportTemplateCodes: string[]): void {
    for (const id of reportTemplateCodes) {
      const index = this.records.findIndex((r) => r.reportTemplateCode === id);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionReportTemplateItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
