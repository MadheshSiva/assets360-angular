export interface DowntimeTrackingRecord {
  downtimeStart: string;
  downtimeEnd: string;
  totalDowntime: string;
  reasonForDowntime: string;
  impactLevel: string;
  selected?: boolean;
}

export type DowntimeTrackingForm = Omit<DowntimeTrackingRecord, 'selected' | 'totalDowntime'>;
