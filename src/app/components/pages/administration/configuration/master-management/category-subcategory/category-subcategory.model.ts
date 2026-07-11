export type CategoryLevel = 'Category' | 'Sub Category';
export type CategoryStatus = 'Active' | 'Inactive';

export interface MasterManagementCategorySubcategoryItem {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  description: string;
  level: CategoryLevel | '';
  status: CategoryStatus | '';
  relatedAssetId: string;
}
