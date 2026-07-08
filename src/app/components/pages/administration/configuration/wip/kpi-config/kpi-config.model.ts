export type KpiConfigRefreshFrequency = 'Real-time' | 'Every 5 mins' | 'Every 15 mins' | 'Hourly' | 'Daily';
export type KpiConfigWidgetType = 'Line Chart' | 'Bar Chart' | 'Pie Chart' | 'Gauge' | 'Number Card' | 'Table';

export interface KpiConfig {
  kpiId: string;
  kpiName: string;
  formulaDefinition: string;
  thresholdGreen: number | null;
  thresholdAmber: number | null;
  thresholdRed: number | null;
  refreshFrequency: KpiConfigRefreshFrequency | '';
  widgetType: KpiConfigWidgetType | '';
  selected?: boolean;
}

export type KpiConfigForm = Omit<KpiConfig, 'selected'>;
