import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface Report {
  id: string;
  slNo: number;
  title: string;
  timeRange: string;
  expireOn: string;
  recurrence: string;
  createdOn: string;
  type: string;
  shareWith: string;
  generatedOn: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

// Every report — whether produced via Create Report or one of the seeded demo
// rows — carries its own column headers and data rows, so the Reports list
// and the report View page can both render/download real, template-shaped
// data instead of a stub.
export interface GeneratedReport extends Report {
  headers: string[];
  rows: Record<string, string | number>[];
}

// Column headers per report template, taken from the "Key Information" each
// template was specified with. A handful of narrative (non-comma-list)
// descriptions were reworded into concise column headers by judgement call
// (Asset Maintenance History Report, Maintenance Cost Report, WIP Movement &
// Stage History Report) — flagged so they're easy to revise later.
export const TEMPLATE_HEADERS: Record<string, string[]> = {
  // Asset Tracking
  'Asset Location & Movement Report': ['Asset ID', 'Asset Name', 'Current Location', 'Previous Location', 'Movement Date/Time', 'Duration at Location', 'Movement History'],
  'Asset Location History / Trail Report': ['Location Trail', 'Check-In/Out', 'Source Technology', 'Timestamp', 'User/Device'],
  'Asset Missing / Not-Seen Report': ['Not Detected Within', 'Last Seen Location/Time', 'Custodian', 'Risk/Priority'],
  'Asset Movement & Exception Report': ['Unauthorized Movement', 'Geofence Violation', 'After-Hours Movement', 'Unusual Movement', 'Alerts'],
  'Asset Utilization & Dwell-Time Report': ['Time by Location/Zone', 'Idle Duration', 'Movement Frequency', 'Utilization %', 'Frequently/Rarely Moved Assets'],

  // Asset Management
  'Asset Register Report': ['Asset ID', 'Category', 'Make/Model', 'Serial Number', 'Status', 'Location', 'Custodian', 'Acquisition Details'],
  'Asset Lifecycle Report': ['Procurement', 'Commissioning', 'Transfer', 'Maintenance', 'Status Changes', 'Retirement/Disposal History'],
  'Asset Allocation & Custodian Report': ['Asset-to-User/Department/Site Allocation', 'Issue Date', 'Transfer History', 'Acknowledgement'],
  'Asset Valuation & Depreciation Report': ['Purchase Value', 'Capitalization Date', 'Depreciation Method', 'Accumulated Depreciation', 'NBV'],
  'Warranty / AMC / Contract Expiry Report': ['Warranty Dates', 'AMC Details', 'Supplier', 'Contract Reference', 'Expiry Date', 'Upcoming Expirations'],

  // Maintenance Management
  'Preventive Maintenance Compliance Report': ['Planned vs Completed PM', 'Due/Overdue Jobs', 'Completion %', 'SLA Compliance'],
  'Maintenance Work Order Report': ['WO Number', 'Asset', 'Maintenance Type', 'Technician', 'Priority', 'Status', 'Dates', 'Labour/Materials', 'Completion'],
  'Asset Maintenance History Report': ['Asset', 'Date', 'Failures', 'Repairs', 'Parts', 'Cost'],
  'Breakdown & Reliability Report': ['Breakdown Count', 'Downtime', 'MTBF', 'MTTR', 'Recurring Failures', 'Failure Category/Root Cause'],
  'Maintenance Cost Report': ['Labour Cost', 'Spare Parts Cost', 'Vendor Cost', 'Total Cost', 'Asset/Site/Category/Period'],

  // Inspection Management
  'Detailed Inspection Report / Certificate': ['Asset Information', 'Task/Checkpoint', 'Result (Pass/Fail/N/A)', 'Remarks', 'Photos', 'Videos/References', 'Signatures', 'Inspector', 'Approval Information'],
  'Inspection Compliance Summary Report': ['Total Inspections', 'Completed', 'Passed', 'Failed', 'Overdue', 'Compliance %', 'Site/Category Comparison'],
  'Failed Inspection & Findings Report': ['Failed Assets/Tasks', 'Severity', 'Observation', 'Evidence', 'Inspector', 'Corrective Action', 'Responsible Person'],
  'Corrective Action & Reinspection Report': ['Finding', 'Corrective Action', 'Assignee', 'Target Date', 'Evidence', 'Reinspection', 'Closure'],
  'Inspection & Approval Audit Trail Report': ['Inspector Actions', 'Timestamps', 'Submissions', 'L1/L2/L3 Approvals', 'Rejection', 'Redo Requests', 'Comments', 'Final Approval'],

  // Work in Progress (WIP)
  'WIP Status Summary Report': ['Total WIP', 'Stage', 'Status', 'Quantity/Items', 'Owner', 'Location', 'Planned vs Actual Progress'],
  'WIP Ageing Report': ['Item/Asset', 'Current Stage', 'Entry Date', 'Days in Stage', 'Ageing Bucket', 'Responsible Person'],
  'WIP Movement & Stage History Report': ['From Stage', 'To Stage', 'Location', 'User', 'Date/Time', 'Duration'],
  'WIP Delay / Bottleneck Report': ['Delayed Items', 'Expected Completion', 'Actual Progress', 'Stage Delay', 'Ageing', 'Reason', 'Owner'],
  'WIP Completion & Turnaround-Time Report': ['Start Date', 'Completion Date', 'Total Cycle Time', 'Stage-wise Duration', 'SLA/Target vs Actual']
};

// ===== Mock row generation (for reports created via Create Report) =====
// There's no backend, so a report "generated" from a template needs
// plausible-looking rows built on the fly. Rather than hand-author bespoke
// data for 25 different templates, each column gets a value shaped by
// recognizing common header patterns (dates, percentages, names, statuses…),
// falling back to a readable placeholder for anything bespoke.
const SAMPLE_ASSET_IDS = ['AST-1001', 'AST-1002', 'AST-1003'];
const SAMPLE_ASSET_NAMES = ['HVAC Unit 1', 'Fire Panel A', 'Chiller Pump 2'];
const SAMPLE_PEOPLE = ['David Smith', 'Sarah Wilson', 'Faseeh Akthar', 'Joseph'];
const SAMPLE_LOCATIONS = ['Dubai HQ Tower', 'Sharjah Gate Tower', 'Abudhabi ADDAX Tower'];
const SAMPLE_STATUSES = ['Completed', 'Pending', 'In Progress'];

function pick<T>(list: T[], index: number): T {
  return list[index % list.length];
}

function sampleDate(rowIndex: number): string {
  const base = new Date(2026, 4, 1 + rowIndex * 7);
  return base.toISOString().slice(0, 10);
}

function sampleValueFor(header: string, rowIndex: number): string | number {
  const h = header.toLowerCase();

  if (h.includes('asset id')) return pick(SAMPLE_ASSET_IDS, rowIndex);
  if (h.includes('asset name') || h === 'asset' || h.startsWith('item/asset')) return pick(SAMPLE_ASSET_NAMES, rowIndex);
  if (h.includes('date') || h.includes('timestamp')) return sampleDate(rowIndex);
  if (h.includes('%')) return pick([92, 78, 65, 88], rowIndex);
  if (h.includes('cost') || h.includes('value') || h === 'nbv') return pick([1250, 3400, 875, 2100], rowIndex);
  if (h.includes('count') || h.includes('duration') || h.includes('mtbf') || h.includes('mttr') || h.includes('time') || h.includes('quantity')) {
    return pick([2, 5, 8, 12], rowIndex);
  }
  if (h.includes('pass/fail') || h.includes('result')) return pick(['Pass', 'Fail', 'Pass', 'Pass'], rowIndex);
  if (h.includes('status')) return pick(SAMPLE_STATUSES, rowIndex);
  if (h.includes('technician') || h.includes('inspector') || h.includes('owner') || h.includes('custodian') || h.includes('responsible') || h.includes('assignee') || h.includes('user')) {
    return pick(SAMPLE_PEOPLE, rowIndex);
  }
  if (h.includes('location') || h.includes('site')) return pick(SAMPLE_LOCATIONS, rowIndex);
  if (h.includes('priority') || h.includes('risk') || h.includes('severity')) return pick(['High', 'Medium', 'Low'], rowIndex);
  if (h.includes('supplier') || h.includes('vendor')) return pick(['Carrier Corporation', 'Siemens Energy AG', 'Kirloskar Pumps Ltd.'], rowIndex);

  return `${header} ${rowIndex + 1}`;
}

export function buildSampleRows(headers: string[], count: number): Record<string, string | number>[] {
  return Array.from({ length: count }, (_, rowIndex) => {
    const row: Record<string, string | number> = {};
    headers.forEach((header) => {
      row[header] = sampleValueFor(header, rowIndex);
    });
    return row;
  });
}

// ===== Excel export (shared by the Reports list and the report View page) =====
function reportWorksheet(report: GeneratedReport): XLSX.WorkSheet {
  if (report.headers.length > 0) {
    return XLSX.utils.json_to_sheet(report.rows, { header: report.headers });
  }
  // No template data behind this report — export its summary row instead of
  // producing an empty file.
  return XLSX.utils.json_to_sheet([{
    'Sl No': report.slNo,
    Report: report.title,
    'Time Range': report.timeRange,
    'Expire On': report.expireOn,
    Recurrence: report.recurrence,
    'Created On': report.createdOn,
    Type: report.type,
    'Share With': report.shareWith,
    'Generated On': report.generatedOn,
    Status: report.status
  }]);
}

function fileSafe(name: string): string {
  return (name || 'report').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
}

export function downloadReportAsExcel(report: GeneratedReport): void {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, reportWorksheet(report), 'Report');
  XLSX.writeFile(workbook, `${fileSafe(report.title)}-${report.createdOn || new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function downloadReportsAsWorkbook(reports: GeneratedReport[], fileName: string): void {
  if (reports.length === 0) return;
  const workbook = XLSX.utils.book_new();
  reports.forEach((report, index) => {
    const sheetName = fileSafe(report.title || `Report ${index + 1}`).slice(0, 31) || `Report ${index + 1}`;
    XLSX.utils.book_append_sheet(workbook, reportWorksheet(report), sheetName);
  });
  XLSX.writeFile(workbook, fileName);
}

// ===== Seed data =====
// The four demo rows the Reports list originally shipped with, now given
// real column headers/rows (drawn from example report-view screens) so
// clicking through to "View" shows something structured instead of nothing.
const SEED_REPORTS: GeneratedReport[] = [
  {
    id: 'RPT-SEED-OT', slNo: 1, title: 'OT Report', timeRange: '1 - Month',
    expireOn: '2027-07-01', recurrence: 'Once', createdOn: '2026-05-01',
    type: 'URL', shareWith: 'piq@gmail.com', generatedOn: '2026-05-01',
    status: 'Completed',
    headers: ['In Location/Device', 'Last Out Time', 'Out Location/Device', 'Break In Time', 'Break Out Time', 'Work Schedule', 'Result'],
    rows: [
      { 'In Location/Device': 'Main Gate Reader', 'Last Out Time': '18:45', 'Out Location/Device': 'Main Gate Reader', 'Break In Time': '13:00', 'Break Out Time': '13:30', 'Work Schedule': 'General Shift 08:00-17:00', Result: 'Overtime Approved' },
      { 'In Location/Device': 'Warehouse Turnstile', 'Last Out Time': '17:10', 'Out Location/Device': 'Warehouse Turnstile', 'Break In Time': '12:30', 'Break Out Time': '13:00', 'Work Schedule': 'General Shift 08:00-17:00', Result: 'Present' },
      { 'In Location/Device': '-', 'Last Out Time': '-', 'Out Location/Device': '-', 'Break In Time': '-', 'Break Out Time': '-', 'Work Schedule': 'General Shift 08:00-17:00', Result: 'Leave' }
    ]
  },
  {
    id: 'RPT-SEED-PATIENT', slNo: 2, title: 'Patient Report', timeRange: '1 - Month',
    expireOn: '2027-07-01', recurrence: 'Once', createdOn: '2026-05-01',
    type: 'URL', shareWith: 'piq@gmail.com', generatedOn: '2026-05-01',
    status: 'Completed',
    headers: ['Sr No', 'Patient Name', 'Visit Date', 'Department', 'Attending Staff', 'Status'],
    rows: [
      { 'Sr No': 1, 'Patient Name': 'John Carter', 'Visit Date': '2026-05-01', Department: 'Occupational Health', 'Attending Staff': 'Dr. Amina Rao', Status: 'Completed' },
      { 'Sr No': 2, 'Patient Name': 'Lisa Meyer', 'Visit Date': '2026-05-03', Department: 'Occupational Health', 'Attending Staff': 'Dr. Amina Rao', Status: 'Completed' },
      { 'Sr No': 3, 'Patient Name': 'Ahmed Al Farsi', 'Visit Date': '2026-05-05', Department: 'Occupational Health', 'Attending Staff': 'Dr. Samuel Lee', Status: 'Pending' }
    ]
  },
  {
    id: 'RPT-SEED-CUSTOMER', slNo: 3, title: 'Customer', timeRange: '1 - Month',
    expireOn: '2027-07-01', recurrence: 'Once', createdOn: '2026-05-01',
    type: 'URL', shareWith: 'piq@gmail.com', generatedOn: '2026-05-01',
    status: 'Completed',
    headers: ['Company', 'National ID', 'Start Date', 'End Date', 'SOW ID / Vehicle ID', 'Phone No', 'Card Badge Number', 'First In Time'],
    rows: [
      { Company: 'Meridian Facilities Ltd.', 'National ID': '784-1990-1234567-1', 'Start Date': '2026-01-10', 'End Date': '2026-01-15', 'SOW ID / Vehicle ID': 'SOW-4021', 'Phone No': '+971-4-555-0199', 'Card Badge Number': 'VB-2201', 'First In Time': '08:15' },
      { Company: 'Northbridge Manufacturing Inc.', 'National ID': '784-1985-7654321-2', 'Start Date': '2026-02-02', 'End Date': '2026-02-04', 'SOW ID / Vehicle ID': 'VEH-1187', 'Phone No': '+1-212-555-0142', 'Card Badge Number': 'VB-2202', 'First In Time': '09:05' },
      { Company: 'PurpleIQ Global Holdings', 'National ID': '784-1992-1122334-5', 'Start Date': '2026-03-01', 'End Date': '2026-03-01', 'SOW ID / Vehicle ID': 'SOW-4088', 'Phone No': '+971-4-555-0166', 'Card Badge Number': 'VB-2203', 'First In Time': '07:50' }
    ]
  },
  {
    id: 'RPT-SEED-PEOPLE', slNo: 4, title: 'People', timeRange: '1 - Month',
    expireOn: '2027-07-01', recurrence: 'Once', createdOn: '2026-05-01',
    type: 'URL', shareWith: 'piq@gmail.com', generatedOn: '2026-05-01',
    status: 'Pending',
    headers: ['Sr No', 'Date', 'ID Number', 'First Name', 'Last Name', 'Designation', 'Department', 'Company'],
    rows: [
      { 'Sr No': 1, Date: '2026-05-01', 'ID Number': 'EMP-1001', 'First Name': 'David', 'Last Name': 'Smith', Designation: 'Site Engineer', Department: 'Facilities Operations', Company: 'PurpleIQ Global Holdings' },
      { 'Sr No': 2, Date: '2026-05-02', 'ID Number': 'EMP-1002', 'First Name': 'Sarah', 'Last Name': 'Wilson', Designation: 'QA Inspector', Department: 'Engineering', Company: 'Northbridge Manufacturing Inc.' },
      { 'Sr No': 3, Date: '2026-05-03', 'ID Number': 'EMP-1003', 'First Name': 'Faseeh', 'Last Name': 'Akthar', Designation: 'IT Support', Department: 'IT/Hardware', Company: 'Central Bank of Oman' }
    ]
  }
];

@Injectable({ providedIn: 'root' })
export class GeneratedReportService {
  private reports: GeneratedReport[] = [...SEED_REPORTS];
  private nextSequence = SEED_REPORTS.length + 1;

  addReport(report: Omit<GeneratedReport, 'id' | 'slNo'>): GeneratedReport {
    const created: GeneratedReport = {
      ...report,
      id: `RPT-GEN-${this.nextSequence}`,
      slNo: this.nextSequence
    };
    this.nextSequence++;
    this.reports = [created, ...this.reports];
    return created;
  }

  getAll(): GeneratedReport[] {
    return this.reports;
  }

  getById(id: string): GeneratedReport | undefined {
    return this.reports.find((r) => r.id === id);
  }

  get mostRecent(): GeneratedReport | null {
    return this.reports[0] ?? null;
  }
}
