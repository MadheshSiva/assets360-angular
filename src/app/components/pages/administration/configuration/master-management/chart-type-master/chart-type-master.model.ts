export type ChartWidgetName = 'Chart' | 'Gauge' | 'Table';

export interface MasterManagementChartTypeMasterItem {
  widgetId: string;
  assetId: string;
  assetName: string;
  widgetName: ChartWidgetName | '';
  configJson: string;
  isActive: boolean;
}
