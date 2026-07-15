export type ChartWidgetName = 'Chart' | 'Gauge' | 'Table';

export interface MasterManagementChartTypeMasterItem {
  widgetId: string;
  widgetName: ChartWidgetName | '';
  configJson: string;
  isActive: boolean;
}
