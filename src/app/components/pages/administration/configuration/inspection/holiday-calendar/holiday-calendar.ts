import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
import { InspectionHolidayCalendarItem, InspectionHolidayCalendarRow } from './holiday-calendar.model';
import { InspectionHolidayCalendarService } from './holiday-calendar.service';

interface InspectionHolidayCalendarColumn {
  key: string;
  label: string;
  visible: boolean;
}

@Component({
  standalone: true,
  selector: 'app-inspection-holiday-calendar',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './holiday-calendar.html',
  styleUrls: ['./holiday-calendar.css']
})
export class InspectionHolidayCalendar {
  searchTerm = '';

  columns: InspectionHolidayCalendarColumn[] = [
    { key: 'calendarCode', label: 'Calendar Code', visible: true },
    { key: 'calendarName', label: 'Calendar Name', visible: true },
    { key: 'country', label: 'Country', visible: true },
    { key: 'workingDays', label: 'Working Days', visible: true },
    { key: 'weekend', label: 'Weekend', visible: true },
    { key: 'workingHours', label: 'Working Hours', visible: true },
    { key: 'holidays', label: 'Holidays', visible: true },
    { key: 'shiftTimings', label: 'Shift Timings', visible: true },
    { key: 'slaCalculationMethod', label: 'SLA Calculation Method', visible: true },
    { key: 'status', label: 'Status', visible: true }
  ];

  readonly importColumns: ImportColumn[] = [
    { key: 'calendarCode', label: 'Calendar Code' },
    { key: 'calendarName', label: 'Calendar Name' },
    { key: 'country', label: 'Country' },
    { key: 'workingDays', label: 'Working Days' },
    { key: 'weekend', label: 'Weekend' },
    { key: 'workingHours', label: 'Working Hours' },
    { key: 'holidays', label: 'Holidays' },
    { key: 'shiftTimings', label: 'Shift Timings' },
    { key: 'slaCalculationMethod', label: 'SLA Calculation Method' },
    { key: 'status', label: 'Status' }
  ];

  showImportModal = false;

  showColumnPicker = false;

  records: InspectionHolidayCalendarRow[] = [];
  filteredRecords: InspectionHolidayCalendarRow[] = [];

  showFormModal = false;
  isEditMode = false;
  private editingRecord: InspectionHolidayCalendarRow | null = null;

  form: InspectionHolidayCalendarItem = this.emptyForm();

  private returnUrl: string | null = null;

  constructor(
    private service: InspectionHolidayCalendarService,
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
      const match = this.records.find((r) => r.calendarName === value);
      if (match) {
        this.isEditMode = true;
        this.editingRecord = match;
        const { selected, ...rest } = match;
        this.form = { ...rest };
        this.showFormModal = true;
      }
    }
  }

  get slaCalculationMethodMaster() {
    return this.service.slaCalculationMethodMaster;
  }

  toggleDay(list: string[], day: string): void {
    const index = list.indexOf(day);
    if (index === -1) {
      list.push(day);
    } else {
      list.splice(index, 1);
    }
  }

  private emptyForm(): InspectionHolidayCalendarItem {
    return {
      calendarCode: '',
      calendarName: '',
      country: '',
      workingDays: [],
      weekend: [],
      workingHours: '',
      holidays: '',
      shiftTimings: '',
      slaCalculationMethod: '',
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

  toggleColumn(col: InspectionHolidayCalendarColumn): void {
    col.visible = !col.visible;
  }

  get selectedRecords(): InspectionHolidayCalendarRow[] {
    return this.filteredRecords.filter((r) => r.selected);
  }

  get allSelected(): boolean {
    return this.filteredRecords.length > 0 && this.filteredRecords.every((r) => r.selected);
  }

  toggleSelectAll(): void {
    const next = !this.allSelected;
    this.filteredRecords.forEach((r) => (r.selected = next));
  }

  toggleSelectRecord(record: InspectionHolidayCalendarRow): void {
    record.selected = !record.selected;
  }

  onSearch(): void {
    this.filteredRecords = this.service.search(this.searchTerm) as InspectionHolidayCalendarRow[];
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

  editRow(record: InspectionHolidayCalendarRow): void {
    this.isEditMode = true;
    this.editingRecord = record;
    const { selected, ...rest } = record;
    this.form = { ...rest, workingDays: [...rest.workingDays], weekend: [...rest.weekend] };
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
      this.service.updateRecord(this.editingRecord.calendarCode, { ...this.form });
    } else {
      this.service.addRecord({ ...this.form });
    }
    this.refresh();
    this.closeFormModal();
  }

  onDelete(): void {
    if (this.selectedRecords.length === 0) return;
    this.service.deleteRecords(this.selectedRecords.map((r) => r.calendarCode));
    this.refresh();
  }

  deleteRow(record: InspectionHolidayCalendarRow): void {
    this.service.deleteRecords([record.calendarCode]);
    this.refresh();
  }

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    rows.forEach((row) => {
      const activeRaw = (row['status'] ?? '').trim().toLowerCase();
      this.service.addRecord({
        calendarCode: row['calendarCode'] ?? '',
        calendarName: row['calendarName'] ?? '',
        country: row['country'] ?? '',
        workingDays: (row['workingDays'] ?? '').split(',').map((s) => s.trim()).filter(Boolean),
        weekend: (row['weekend'] ?? '').split(',').map((s) => s.trim()).filter(Boolean),
        workingHours: row['workingHours'] ?? '',
        holidays: row['holidays'] ?? '',
        shiftTimings: row['shiftTimings'] ?? '',
        slaCalculationMethod: row['slaCalculationMethod'] ?? '',
        status: activeRaw === 'yes' || activeRaw === 'true'
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
