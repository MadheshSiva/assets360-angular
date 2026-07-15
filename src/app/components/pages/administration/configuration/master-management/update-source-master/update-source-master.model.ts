export type UpdateSourceType = 'Manual' | 'IoT' | 'API';

export interface MasterManagementUpdateSourceMasterItem {
  sourceId: string;
  sourceName: UpdateSourceType | '';
  description: string;
}
