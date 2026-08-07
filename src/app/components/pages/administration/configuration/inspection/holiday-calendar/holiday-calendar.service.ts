import { Injectable } from '@angular/core';
import { InspectionHolidayCalendarItem } from './holiday-calendar.model';

@Injectable({ providedIn: 'root' })
export class InspectionHolidayCalendarService {
  readonly slaCalculationMethodMaster: string[] = ['Calendar Days', 'Working Days Only'];

  private readonly records: InspectionHolidayCalendarItem[] = [
    {
      calendarCode: 'CAL-1001',
      calendarName: 'UAE Standard Calendar',
      country: 'UAE',
      workingDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
      weekend: ['Fri', 'Sat'],
      workingHours: '08:00 - 17:00',
      holidays: "01-Jan-2026: New Year's Day\n02-Dec-2026: UAE National Day",
      shiftTimings: 'General Shift: 08:00-17:00',
      slaCalculationMethod: 'Working Days Only',
      status: true
    },
    {
      calendarCode: 'CAL-1002',
      calendarName: 'US Standard Calendar',
      country: 'USA',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      weekend: ['Sat', 'Sun'],
      workingHours: '09:00 - 18:00',
      holidays: "01-Jan-2026: New Year's Day\n04-Jul-2026: Independence Day",
      shiftTimings: 'Day Shift: 09:00-18:00, Night Shift: 18:00-02:00',
      slaCalculationMethod: 'Calendar Days',
      status: true
    }
  ];

  private nextSequence = 1003;

  getRecords(): InspectionHolidayCalendarItem[] {
    return this.records;
  }

  addRecord(record: InspectionHolidayCalendarItem): InspectionHolidayCalendarItem {
    const calendarCode = record.calendarCode?.trim() || `CAL-${this.nextSequence++}`;
    const created: InspectionHolidayCalendarItem = { ...record, calendarCode };
    this.records.push(created);
    return created;
  }

  updateRecord(calendarCode: string, changes: InspectionHolidayCalendarItem): void {
    const index = this.records.findIndex((r) => r.calendarCode === calendarCode);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...changes };
    }
  }

  deleteRecords(calendarCodes: string[]): void {
    for (const code of calendarCodes) {
      const index = this.records.findIndex((r) => r.calendarCode === code);
      if (index !== -1) {
        this.records.splice(index, 1);
      }
    }
  }

  search(term: string): InspectionHolidayCalendarItem[] {
    const value = term.trim().toLowerCase();
    if (!value) return this.records;
    return this.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(value))
    );
  }
}
