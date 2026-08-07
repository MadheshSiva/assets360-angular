export interface InspectionHolidayCalendarItem {
  calendarCode: string;
  calendarName: string;
  country: string;
  workingDays: string[];
  weekend: string[];
  workingHours: string;
  holidays: string;
  shiftTimings: string;
  slaCalculationMethod: string;
  status: boolean;
}

export interface InspectionHolidayCalendarRow extends InspectionHolidayCalendarItem {
  selected?: boolean;
}
