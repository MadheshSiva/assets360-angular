export interface InspectionTaskCategoryItem {
  categoryCode: string;
  assetId: string;
  assetName: string;
  categoryName: string;
  description: string;
  displayOrder: number | null;
  status: boolean;
}

export interface InspectionTaskCategoryRow extends InspectionTaskCategoryItem {
  selected?: boolean;
}
