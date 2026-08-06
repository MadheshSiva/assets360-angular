export type UpdateSourceType = 'Manual' | 'IoT' | 'API';

export interface MasterManagementUpdateSourceMasterItem {
  sourceId: string;
  assetId: string;
  assetName: string;
  sourceName: UpdateSourceType | '';
  description: string;
}
